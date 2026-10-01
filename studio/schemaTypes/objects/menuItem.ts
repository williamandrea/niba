import { defineArrayMember, defineField, defineType } from 'sanity'
import { validHref } from './link'
import { localeField } from '../../lib/fields'

export const menuItem = defineType({
  name: 'menuItem',
  title: 'Menu item',
  type: 'object',
  fields: [
    localeField({ name: 'label', title: 'Text', required: true }),
    defineField({
      name: 'href',
      title: 'Goes to',
      type: 'string',
      description:
        'A page on this site, like /programs/. For items with a sub-menu, this is the main page of the group.',
      validation: (rule) => rule.required().custom(validHref),
    }),
    defineField({
      name: 'children',
      title: 'Sub-menu',
      type: 'array',
      description: 'Optional. Links that open under this item.',
      of: [defineArrayMember({ type: 'link' })],
    }),
  ],
  preview: {
    select: { title: 'label.en', subtitle: 'href', children: 'children' },
    prepare: ({ title, subtitle, children }) => ({
      title,
      subtitle: children?.length ? `${children.length} sub-menu links` : subtitle,
    }),
  },
})
