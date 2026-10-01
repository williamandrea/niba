import { defineField, defineType } from 'sanity'
import { imageField } from '../../lib/fields'

export const seo = defineType({
  name: 'seo',
  title: 'Search & sharing',
  type: 'object',
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: 'title',
      title: 'Title for Google',
      type: 'string',
      description: 'Optional. Leave empty to use the page title. Best under 60 characters.',
      validation: (rule) => rule.max(70).warning('Google usually cuts titles after about 60 characters.'),
    }),
    defineField({
      name: 'description',
      title: 'Short description',
      type: 'text',
      rows: 3,
      description: 'One or two sentences shown under the title in Google. Maximum 160 characters.',
      validation: (rule) => rule.max(160).error('Please keep it to 160 characters or fewer.'),
    }),
    imageField({
      name: 'ogImage',
      title: 'Sharing image',
      description: 'Optional. Shown when the page is shared on WhatsApp, Facebook, etc. Best size: 1200 × 630.',
    }),
  ],
})
