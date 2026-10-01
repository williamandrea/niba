import { defineArrayMember, defineField, defineType } from 'sanity'
import { CalendarIcon } from '@sanity/icons/Calendar'
import { imageField, localeField, seoField, slugField } from '../../lib/fields'

export const EVENT_TYPES = [
  { title: 'Pabbajja', value: 'pabbajja' },
  { title: 'Meditation Retreat', value: 'meditation-retreat' },
  { title: 'Dhamma Talk', value: 'dhamma-talk' },
  { title: 'Other', value: 'other' },
]

export const AUDIENCES = [
  { title: 'Open to public', value: 'public' },
  { title: 'Limited registrants', value: 'limited' },
  { title: 'Registration required', value: 'registration' },
]

export const event = defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  icon: CalendarIcon,
  description: 'Events move to "Past events" automatically after their last day. No need to mark them as finished.',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'seo', title: 'Search & sharing' },
  ],
  fields: [
    localeField({ name: 'title', title: 'Title', group: 'content', required: true }),
    { ...slugField(), group: 'content' },
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      group: 'content',
      options: { list: EVENT_TYPES, layout: 'radio' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'startDate',
      title: 'First day',
      type: 'date',
      group: 'content',
      options: { dateFormat: 'D MMMM YYYY' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'endDate',
      title: 'Last day',
      type: 'date',
      group: 'content',
      options: { dateFormat: 'D MMMM YYYY' },
      description: 'Leave empty for a one-day event.',
      validation: (rule) =>
        rule.custom((end, context) => {
          const start = (context.document as { startDate?: string } | undefined)?.startDate
          if (end && start && end < start) return 'The last day cannot be before the first day.'
          return true
        }),
    }),
    defineField({
      name: 'sessions',
      title: 'Sessions',
      type: 'array',
      group: 'content',
      description: 'Optional. Use when the event has more than one session (e.g. Session 1 and Session 2).',
      of: [defineArrayMember({ type: 'eventSession' })],
    }),
    defineField({
      name: 'guidedBy',
      title: 'Guided by (teacher)',
      type: 'reference',
      group: 'content',
      to: [{ type: 'teacher' }],
      description: 'Pick a teacher from the list…',
    }),
    defineField({
      name: 'guidedByText',
      title: 'Guided by (name)',
      type: 'string',
      group: 'content',
      description: '…or type a name if the teacher is not in the list.',
    }),
    defineField({
      name: 'audience',
      title: 'Who can join',
      type: 'string',
      group: 'content',
      options: { list: AUDIENCES, layout: 'radio' },
      validation: (rule) => rule.required(),
    }),
    imageField({ name: 'image', title: 'Poster or photo', group: 'content' }),
    localeField({ name: 'description', title: 'Description', type: 'blockContent', group: 'content' }),
    defineField({
      name: 'contacts',
      title: 'Contact people',
      type: 'array',
      group: 'content',
      description: 'Shown as WhatsApp buttons for questions and registration.',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'contactPerson' }] })],
    }),
    seoField('seo'),
  ],
  orderings: [{ title: 'Date, newest first', name: 'startDesc', by: [{ field: 'startDate', direction: 'desc' }] }],
  preview: {
    select: { title: 'title.en', start: 'startDate', end: 'endDate', media: 'image', type: 'type' },
    prepare: ({ title, start, end, media, type }) => ({
      title,
      subtitle: [EVENT_TYPES.find((t) => t.value === type)?.title, end && end !== start ? `${start} → ${end}` : start]
        .filter(Boolean)
        .join(' · '),
      media,
    }),
  },
})
