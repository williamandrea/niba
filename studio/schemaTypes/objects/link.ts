import { defineField, defineType } from 'sanity'
import { localeField } from '../../lib/fields'

/** Accepts site paths like /niba/ and full web, email, or WhatsApp links. */
export function validHref(value: string | undefined) {
  if (!value) return true
  if (/^\/[^\s]*$/.test(value)) return true
  if (/^(https?:\/\/|mailto:|tel:)[^\s]+$/.test(value)) return true
  return 'Use a site path that starts with "/" (like /niba/registration/) or a full link that starts with https://'
}

export const link = defineType({
  name: 'link',
  title: 'Button / link',
  type: 'object',
  fields: [
    localeField({
      name: 'label',
      title: 'Text',
      description: 'What the button says, e.g. "Join NIBA".',
      required: true,
    }),
    defineField({
      name: 'href',
      title: 'Goes to',
      type: 'string',
      description:
        'A page on this site, like /programs/ (start with "/"), or a full link like https://wa.me/6281215004788. Site pages open in the visitor\'s language by themselves.',
      validation: (rule) => rule.required().custom(validHref),
    }),
  ],
  preview: { select: { title: 'label.en', subtitle: 'href' } },
})
