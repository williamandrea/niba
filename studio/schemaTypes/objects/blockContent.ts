import { defineArrayMember, defineField, defineType } from 'sanity'
import { BulbOutlineIcon } from '@sanity/icons/BulbOutline'
import { ImageIcon } from '@sanity/icons/Image'
import { StarIcon } from '@sanity/icons/Star'
import { altField } from '../../lib/fields'
import { validHref } from './link'

/** Rich text used in articles, events, and pages. */
export const blockContent = defineType({
  name: 'blockContent',
  title: 'Text',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'Heading', value: 'h2' },
        { title: 'Small heading', value: 'h3' },
        { title: 'Quote', value: 'blockquote' },
      ],
      lists: [
        { title: 'Bullet list', value: 'bullet' },
        { title: 'Numbered list', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Bold', value: 'strong' },
          { title: 'Italic', value: 'em' },
        ],
        annotations: [
          defineArrayMember({
            name: 'link',
            title: 'Link',
            type: 'object',
            fields: [
              defineField({
                name: 'href',
                title: 'Goes to',
                type: 'string',
                description: 'A page on this site like /blog/, or a full link like https://…',
                validation: (rule) => rule.required().custom(validHref),
              }),
            ],
          }),
        ],
      },
    }),
    defineArrayMember({
      name: 'image',
      title: 'Image',
      type: 'image',
      icon: ImageIcon,
      options: { hotspot: true },
      fields: [
        altField(),
        defineField({
          name: 'caption',
          title: 'Caption',
          type: 'string',
          description: 'Optional. Shown under the image.',
        }),
      ],
    }),
    defineArrayMember({ type: 'verse', icon: StarIcon }),
    defineArrayMember({ type: 'callout', icon: BulbOutlineIcon }),
  ],
})

export const verse = defineType({
  name: 'verse',
  title: 'Pali verse',
  type: 'object',
  description: 'A verse in Pali with its English meaning. Shown side by side on computers and stacked on phones.',
  fields: [
    defineField({
      name: 'pali',
      title: 'Pali text',
      type: 'text',
      rows: 6,
      description: 'Press Enter for each new line of the verse. Use Pali marks like ā ī ū ṃ ṅ ñ ṭ ḍ ṇ ḷ.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'meaning',
      title: 'English meaning',
      type: 'text',
      rows: 6,
      description: 'Press Enter for each new line.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'reference',
      title: 'Reference',
      type: 'string',
      description: 'Optional, e.g. "Dhammapada 1:2".',
    }),
  ],
  preview: {
    select: { title: 'pali', subtitle: 'reference' },
    prepare: ({ title, subtitle }) => ({
      title: (title ?? '').split('\n')[0],
      subtitle: subtitle ? `Verse · ${subtitle}` : 'Verse',
    }),
  },
})

export const callout = defineType({
  name: 'callout',
  title: 'Highlighted note',
  type: 'object',
  description: 'A soft coloured box to make a note stand out.',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', description: 'Optional.' }),
    defineField({
      name: 'body',
      title: 'Text',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'body' },
    prepare: ({ title, subtitle }) => ({ title: title || 'Highlighted note', subtitle }),
  },
})
