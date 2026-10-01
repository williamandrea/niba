import { defineField, defineType } from 'sanity'
import { UsersIcon } from '@sanity/icons/Users'
import { imageField, slugField } from '../../lib/fields'

export const TEACHER_ROLES = [
  { title: 'Spiritual teacher', value: 'teacher' },
  { title: 'Residing venerable', value: 'resident' },
]

export const teacher = defineType({
  name: 'teacher',
  title: 'Teacher / Venerable',
  type: 'document',
  icon: UsersIcon,
  fields: [
    defineField({
      name: 'fullName',
      title: 'Full name',
      type: 'string',
      description: 'With full title, e.g. "Most Venerable Nā Uyanē Sri Ariyadhammābhidhāna Mahāthēra".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'shortName',
      title: 'Short name',
      type: 'string',
      description: 'e.g. "Ariyadhamma Bhante". Used on small cards.',
    }),
    slugField('fullName'),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      options: { list: TEACHER_ROLES, layout: 'radio' },
      validation: (rule) => rule.required(),
    }),
    imageField({ name: 'photo', title: 'Photo' }),
    defineField({ name: 'bio', title: 'Short biography', type: 'text', rows: 6 }),
    defineField({
      name: 'residencyStart',
      title: 'Residency starts',
      type: 'date',
      options: { dateFormat: 'D MMMM YYYY' },
      description: 'The venerable appears on the homepage from this day…',
      hidden: ({ document }) => document?.role !== 'resident',
    }),
    defineField({
      name: 'residencyEnd',
      title: 'Residency ends',
      type: 'date',
      options: { dateFormat: 'D MMMM YYYY' },
      description: '…until this day.',
      hidden: ({ document }) => document?.role !== 'resident',
      validation: (rule) =>
        rule.custom((end, context) => {
          const start = (context.document as { residencyStart?: string } | undefined)?.residencyStart
          if (end && start && end < start) return 'The end cannot be before the start.'
          return true
        }),
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Lower numbers are shown first.',
      initialValue: 10,
    }),
  ],
  orderings: [{ title: 'Order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: {
    select: { title: 'fullName', role: 'role', media: 'photo', start: 'residencyStart', end: 'residencyEnd' },
    prepare: ({ title, role, media, start, end }) => ({
      title,
      subtitle:
        role === 'resident' ? `Residing venerable${start ? ` · ${start} → ${end ?? '?'}` : ''}` : 'Spiritual teacher',
      media,
    }),
  },
})
