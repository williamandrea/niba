import { defineType } from 'sanity'
import { imageField, localeField } from '../../lib/fields'

export const seo = defineType({
  name: 'seo',
  title: 'Search & sharing',
  type: 'object',
  options: { collapsible: true, collapsed: true },
  fields: [
    localeField({
      name: 'title',
      title: 'Title for Google',
      description: 'Optional. Leave empty to use the page title. Best under 60 characters.',
      max: 70,
    }),
    localeField({
      name: 'description',
      title: 'Short description',
      type: 'text',
      description: 'One or two sentences shown under the title in Google. Maximum 160 characters.',
      max: 160,
    }),
    imageField({
      name: 'ogImage',
      title: 'Sharing image',
      description: 'Optional. Shown when the page is shared on WhatsApp, Facebook, etc. Best size: 1200 × 630.',
    }),
  ],
})
