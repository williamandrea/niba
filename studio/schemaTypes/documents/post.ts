import { defineField, defineType } from 'sanity'
import { DocumentTextIcon } from '@sanity/icons/DocumentText'
import { imageField, localeField, seoField, slugField } from '../../lib/fields'

export const post = defineType({
  name: 'post',
  title: 'Article',
  type: 'document',
  icon: DocumentTextIcon,
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'seo', title: 'Search & sharing' },
  ],
  fields: [
    localeField({ name: 'title', title: 'Title', group: 'content', required: true }),
    { ...slugField(), group: 'content' },
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      group: 'content',
      to: [{ type: 'category' }],
      description: 'The category is part of the address, e.g. /dhammapada/<article>/.',
      validation: (rule) => rule.required(),
    }),
    imageField({ name: 'coverImage', title: 'Cover image', group: 'content' }),
    localeField({
      name: 'excerpt',
      title: 'Short summary',
      type: 'text',
      group: 'content',
      description: 'One or two sentences shown on article cards.',
      max: 300,
    }),
    defineField({
      name: 'publishedAt',
      title: 'Publish date',
      type: 'datetime',
      group: 'content',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    localeField({
      name: 'body',
      title: 'Article text',
      type: 'blockContent',
      group: 'content',
      description:
        'Use "Pali verse" from the + menu for verses. The first verse of the newest Dhammapada article is featured on the homepage.',
    }),
    seoField('seo'),
  ],
  orderings: [{ title: 'Newest first', name: 'publishedDesc', by: [{ field: 'publishedAt', direction: 'desc' }] }],
  preview: {
    select: { title: 'title.en', category: 'category.title.en', date: 'publishedAt', media: 'coverImage' },
    prepare: ({ title, category, date, media }) => ({
      title,
      subtitle: [category, date?.slice(0, 10)].filter(Boolean).join(' · '),
      media,
    }),
  },
})
