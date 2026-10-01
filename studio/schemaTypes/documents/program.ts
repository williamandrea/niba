import { defineArrayMember, defineField, defineType } from 'sanity'
import { RocketIcon } from '@sanity/icons/Rocket'
import { imageField, slugField } from '../../lib/fields'
import { AUDIENCES } from './event'

export const program = defineType({
  name: 'program',
  title: 'Program',
  type: 'document',
  icon: RocketIcon,
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (rule) => rule.required() }),
    slugField('name'),
    defineField({
      name: 'icon',
      title: 'Emoji',
      type: 'string',
      description: 'One emoji shown on the program card, e.g. 📖 ☸️ 🤍',
      validation: (rule) => rule.max(4),
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short description',
      type: 'text',
      rows: 3,
      description: 'Two or three warm, simple sentences.',
      validation: (rule) => rule.required().max(300),
    }),
    defineField({
      name: 'schedule',
      title: 'Weekly schedule',
      type: 'array',
      description: 'Add one line per weekly session. Times are in WIB (Medan time).',
      of: [defineArrayMember({ type: 'scheduleItem' })],
    }),
    defineField({
      name: 'scheduleNote',
      title: 'Schedule note',
      type: 'string',
      description: 'Optional, e.g. "Except on public holidays".',
    }),
    defineField({
      name: 'audience',
      title: 'Who can join',
      type: 'string',
      options: { list: AUDIENCES, layout: 'radio' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'images',
      title: 'Photos',
      type: 'array',
      description: 'Optional. Shown on the Programs page.',
      of: [defineArrayMember({ ...imageField({ name: 'photo', title: 'Photo' }), name: 'photo' })],
      validation: (rule) => rule.max(4),
    }),
    defineField({
      name: 'contacts',
      title: 'Contact people',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'contactPerson' }] })],
    }),
    defineField({
      name: 'button',
      title: 'Button',
      type: 'link',
      description: 'Optional, e.g. "Register" → /niba/registration/',
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Lower numbers are shown first (1, 2, 3…).',
      initialValue: 10,
    }),
  ],
  orderings: [{ title: 'Order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: {
    select: { name: 'name', icon: 'icon', media: 'images.0', audience: 'audience' },
    prepare: ({ name, icon, media, audience }) => ({
      title: [icon, name].filter(Boolean).join(' '),
      subtitle: AUDIENCES.find((a) => a.value === audience)?.title,
      media,
    }),
  },
})
