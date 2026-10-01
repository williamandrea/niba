import { defineField, defineType } from 'sanity'
import { UserIcon } from '@sanity/icons/User'

export const E164 = /^\+[1-9]\d{6,14}$/
export const E164_MESSAGE = 'Use international format: + and country code, no spaces or dashes. Example: +6281378880880'

export const contactPerson = defineType({
  name: 'contactPerson',
  title: 'Contact person',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'As shown on the site, e.g. "Mr. Russel".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'whatsapp',
      title: 'WhatsApp number',
      type: 'string',
      description: 'Start with + and the country code, no spaces. Example: +6281378880880. Visitors tap it to chat.',
      validation: (rule) => rule.required().regex(E164, { name: 'phone' }).error(E164_MESSAGE),
    }),
  ],
  preview: { select: { title: 'name', subtitle: 'whatsapp' } },
})
