import { defineArrayMember, defineField, defineType } from 'sanity'
import { HomeIcon } from '@sanity/icons/Home'
import { imageField, localeField } from '../../lib/fields'

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
          description: 'Press Enter for a new line. Pali is the same in both languages.',
          validation: (rule) => rule.required(),
        }),
        localeField({ name: 'meaning', title: 'Meaning', type: 'text' }),
        localeField({
          name: 'tagline',
          title: 'Small line under the verse',
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
        localeField({ name: 'heading', title: 'Heading' }),
        localeField({ name: 'text', title: 'Text', type: 'text' }),
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
        localeField({ name: 'quote', title: 'Quote', type: 'text' }),
        defineField({ name: 'teacher', title: 'Teacher', type: 'reference', to: [{ type: 'teacher' }] }),
      ],
    }),
    localeField({
      name: 'programsIntro',
      title: 'Programs: short introduction',
      type: 'text',
      group: 'sections',
    }),
    localeField({
      name: 'venerablesIntro',
      title: 'Residing venerables: short note',
      type: 'text',
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
        localeField({
          name: 'heading',
          title: 'Heading',
          description: 'Optional. Default: "Follow us on Instagram".',
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: 'Homepage sections' }) },
})
