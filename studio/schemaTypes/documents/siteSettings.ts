import { defineArrayMember, defineField, defineType } from 'sanity'
import { CogIcon } from '@sanity/icons/Cog'
import { imageField, localeField } from '../../lib/fields'
import { E164, E164_MESSAGE } from './contactPerson'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Settings',
  type: 'document',
  icon: CogIcon,
  groups: [
    { name: 'general', title: 'General', default: true },
    { name: 'menu', title: 'Menu' },
    { name: 'footer', title: 'Footer' },
    { name: 'seo', title: 'Search & sharing' },
  ],
  fields: [
    defineField({
      name: 'siteName',
      title: 'Site name',
      type: 'string',
      group: 'general',
      description: 'Shown in the header, browser tab, and footer.',
      validation: (rule) => rule.required(),
    }),
    imageField({ name: 'logo', title: 'Logo', group: 'general', description: 'Shown at the top left of every page.' }),
    defineField({
      name: 'menu',
      title: 'Main menu',
      type: 'array',
      group: 'menu',
      description: 'The menu at the top of every page. Drag to reorder. If empty, the site uses its built-in menu.',
      of: [defineArrayMember({ type: 'menuItem' })],
    }),
    defineField({
      name: 'footer',
      title: 'Footer',
      type: 'object',
      group: 'footer',
      fields: [
        localeField({
          name: 'quote',
          title: 'Quote',
          type: 'text',
          description: 'A short quote shown at the top of the footer.',
        }),
        localeField({ name: 'quoteSource', title: 'Quote source', description: 'e.g. "Dhammapada, verse 1"' }),
        defineField({ name: 'address', title: 'Address', type: 'text', rows: 3 }),
        defineField({
          name: 'mapsUrl',
          title: 'Google Maps link',
          type: 'url',
          description: 'In Google Maps, press Share → Copy link, then paste here.',
        }),
        defineField({ name: 'email', title: 'Email', type: 'string', validation: (rule) => rule.email() }),
        defineField({
          name: 'whatsapp',
          title: 'Main WhatsApp number',
          type: 'string',
          description: 'Start with + and the country code, no spaces. Example: +6281215004788',
          validation: (rule) => rule.regex(E164, { name: 'phone' }).error(E164_MESSAGE),
        }),
        defineField({
          name: 'contacts',
          title: 'Contact people',
          type: 'array',
          description: 'People listed under "Our contact". Add or edit people under "Contacts".',
          of: [defineArrayMember({ type: 'reference', to: [{ type: 'contactPerson' }] })],
        }),
        defineField({
          name: 'usefulLinks',
          title: 'Useful links',
          type: 'array',
          of: [defineArrayMember({ type: 'link' })],
        }),
        localeField({
          name: 'nibaBlurb',
          title: 'NIBA registration text',
          type: 'text',
          description: 'A short invitation for parents.',
        }),
        defineField({ name: 'nibaButton', title: 'NIBA registration button', type: 'link' }),
        defineField({
          name: 'socialLinks',
          title: 'Social media',
          type: 'array',
          of: [defineArrayMember({ type: 'socialLink' })],
        }),
      ],
    }),
    defineField({
      name: 'seo',
      title: 'Default search & sharing',
      type: 'seo',
      group: 'seo',
      description: 'Used for any page that has no search & sharing settings of its own.',
    }),
  ],
  preview: { prepare: () => ({ title: 'Settings' }) },
})
