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

export function slugField(source = 'title', description?: string) {
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
