import { defineArrayMember, defineField, defineType } from 'sanity'
import { HomeIcon } from '@sanity/icons/Home'
import { imageField } from '../../lib/fields'

export const homepage = defineType({
  name: 'homepage',
  title: 'Homepage sections',
  type: 'document',
  icon: HomeIcon,
  groups: [
    { name: 'hero', title: 'Top banner', default: true },
    { name: 'intro', title: 'Introduction' },
    { name: 'quote', title: 'Teacher quote' },
    { name: 'sections', title: 'Other sections' },
    { name: 'instagram', title: 'Instagram' },
  ],
  fields: [
    defineField({
      name: 'hero',
      title: 'Top banner',
      type: 'object',
      group: 'hero',
      description: 'The first thing visitors see: a photo next to a saffron panel with a Pali verse.',
      fields: [
        imageField({ name: 'image', title: 'Photo', required: true }),
        defineField({
          name: 'paliVerse',
          title: 'Pali verse',
          type: 'text',
          rows: 3,
          description: 'Press Enter for a new line.',
          validation: (rule) => rule.required(),
        }),
        defineField({ name: 'meaning', title: 'English meaning', type: 'text', rows: 3 }),
        defineField({
          name: 'tagline',
          title: 'Small line under the verse',
          type: 'string',
          description: 'e.g. "Theruwan Saranai with Metta"',
        }),
        defineField({ name: 'button', title: 'Button', type: 'link' }),
      ],
    }),
    defineField({
      name: 'intro',
      title: 'Introduction',
      type: 'object',
      group: 'intro',
      fields: [
        defineField({ name: 'heading', title: 'Heading', type: 'string' }),
        defineField({ name: 'text', title: 'Text', type: 'text', rows: 5 }),
        defineField({
          name: 'images',
          title: 'Photo collage',
          type: 'array',
          description: '3 to 5 photos. The first photo is the large one.',
          of: [defineArrayMember({ ...imageField({ name: 'photo', title: 'Photo' }), name: 'photo' })],
          validation: (rule) => rule.max(5),
        }),
        defineField({
          name: 'buttons',
          title: 'Buttons',
          type: 'array',
          of: [defineArrayMember({ type: 'link' })],
          validation: (rule) => rule.max(2),
        }),
      ],
    }),
    defineField({
      name: 'teacherQuote',
      title: 'Teacher quote',
      type: 'object',
      group: 'quote',
      description: 'Leave the quote empty to hide this section.',
      fields: [
        defineField({ name: 'quote', title: 'Quote', type: 'text', rows: 4 }),
        defineField({ name: 'teacher', title: 'Teacher', type: 'reference', to: [{ type: 'teacher' }] }),
      ],
    }),
    defineField({
      name: 'programsIntro',
      title: 'Programs: short introduction',
      type: 'text',
      rows: 3,
      group: 'sections',
    }),
    defineField({
      name: 'venerablesIntro',
      title: 'Residing venerables: short note',
      type: 'text',
      rows: 3,
      group: 'sections',
      description: 'e.g. how devotees can offer dāna during the residency.',
    }),
    defineField({
      name: 'instagram',
      title: 'Instagram photos',
      type: 'object',
      group: 'instagram',
      description:
        'Shows the newest Instagram photos near the bottom of the homepage. Leave the feed link empty to hide this section.',
      fields: [
        defineField({
          name: 'feedUrl',
          title: 'Behold feed link',
          type: 'url',
          description:
            'From behold.so (free): connect the Instagram account, create a "JSON" feed, and paste its link here. It looks like https://feeds.behold.so/abc123.',
          validation: (rule) =>
            rule.custom((url) =>
              !url || /^https:\/\/feeds\.behold\.so\/[\w-]+\/?$/.test(url)
                ? true
                : 'Paste the feed link from Behold, e.g. https://feeds.behold.so/abc123',
            ),
        }),
        defineField({
          name: 'heading',
          title: 'Heading',
          type: 'string',
          description: 'Optional. Default: "Follow us on Instagram".',
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: 'Homepage sections' }) },
})
