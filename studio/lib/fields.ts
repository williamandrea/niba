import { defineField, type FieldDefinition } from 'sanity'

type ImageFieldOptions = {
  name: string
  title: string
  description?: string
  required?: boolean
  /** Show a caption box under the alt text (for images inside articles). */
  caption?: boolean
  group?: string
}

/**
 * Every image on the site has hotspot cropping and alt text.
 * Alt text is required whenever an image is uploaded.
 */
export function imageField({ name, title, description, required, caption, group }: ImageFieldOptions): FieldDefinition {
  return defineField({
    name,
    title,
    type: 'image',
    description,
    group,
    options: { hotspot: true },
    validation: required ? (rule) => rule.required().error('Please upload an image.') : undefined,
    fields: [
      altField(),
      ...(caption
        ? [
            defineField({
              name: 'caption',
              title: 'Caption',
              type: 'string',
              description: 'Optional. Shown under the image.',
            }),
          ]
        : []),
    ],
  })
}

export function altField() {
  return defineField({
    name: 'alt',
    title: 'Alt text (image description)',
    type: 'string',
    description:
      'Describe what is in the photo for people who cannot see it, e.g. "Children reading the Dhammapada with a monk". Required.',
    validation: (rule) =>
      rule.custom((alt, context) => {
        const parent = context.parent as { asset?: unknown } | undefined
        if (parent?.asset && !alt?.trim()) return 'Please describe the image.'
        return true
      }),
  })
}

export function seoField(group?: string) {
  return defineField({
    name: 'seo',
    title: 'Search & sharing',
    type: 'seo',
    group,
    description: 'Optional. How this page looks in Google and when shared on WhatsApp or Facebook.',
  })
}

/** Slugs are shared by both languages and made from the English title. */
export function slugField(source = 'title.en', description?: string) {
  return defineField({
    name: 'slug',
    title: 'Web address (slug)',
    type: 'slug',
    description:
      description ??
      'The last part of the page address. Click "Generate" to make it from the title. Avoid changing it after publishing.',
    options: { source, maxLength: 96 },
    validation: (rule) => rule.required(),
  })
}

type LocaleFieldOptions = {
  name: string
  title: string
  /** string: one line, text: a paragraph, blockContent: rich text. */
  type?: 'string' | 'text' | 'blockContent'
  description?: string
  group?: string
  /** English must be filled in. Indonesian is always optional. */
  required?: boolean
  /** Maximum characters, per language. */
  max?: number
}

const LOCALE_TYPE = { string: 'localeString', text: 'localeText', blockContent: 'localeBlockContent' } as const
type LocaleValue = { en?: unknown; id?: unknown } | undefined

const hasText = (value: unknown) =>
  typeof value === 'string' ? value.trim().length > 0 : Array.isArray(value) && value.length > 0

/**
 * A field in English and Indonesian (see schemaTypes/objects/locale.ts).
 * A missing translation is a warning, not an error: the site shows English until it is added.
 */
export function localeField({ name, title, type = 'string', description, group, required, max }: LocaleFieldOptions) {
  return defineField({
    name,
    title,
    type: LOCALE_TYPE[type],
    description,
    group,
    validation: (rule) => [
      ...(required
        ? [
            rule.required().error('Please fill in the English text.'),
            rule.custom((value: LocaleValue) =>
              value && !hasText(value.en) ? 'Please fill in the English text.' : true,
            ),
          ]
        : []),
      ...(max
        ? [
            rule.custom((value: LocaleValue) =>
              [value?.en, value?.id].some((v) => typeof v === 'string' && v.length > max)
                ? `Please keep each language to ${max} characters or fewer.`
                : true,
            ),
          ]
        : []),
      rule
        .custom((value: LocaleValue) =>
          hasText(value?.en) && !hasText(value?.id)
            ? 'Not translated yet. The Indonesian site shows the English text until you add it.'
            : true,
        )
        .warning(),
    ],
  })
}
