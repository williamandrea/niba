import { defineArrayMember, defineField, defineType } from 'sanity'
import { imageField, localeField } from '../../lib/fields'

export const DAYS = [
  { title: 'Monday', value: 'monday' },
  { title: 'Tuesday', value: 'tuesday' },
  { title: 'Wednesday', value: 'wednesday' },
  { title: 'Thursday', value: 'thursday' },
  { title: 'Friday', value: 'friday' },
  { title: 'Saturday', value: 'saturday' },
  { title: 'Sunday', value: 'sunday' },
]

const TIME = /^([01]\d|2[0-3])[:.][0-5]\d$/

export const scheduleItem = defineType({
  name: 'scheduleItem',
  title: 'Weekly time',
  type: 'object',
  fields: [
    defineField({
      name: 'day',
      title: 'Day',
      type: 'string',
      options: { list: DAYS, layout: 'dropdown' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'startTime',
      title: 'Starts (WIB)',
      type: 'string',
      description: '24-hour time, e.g. 09:30',
      validation: (rule) => rule.required().regex(TIME, { name: 'time' }).error('Use 24-hour time like 09:30'),
    }),
    defineField({
      name: 'endTime',
      title: 'Ends (WIB)',
      type: 'string',
      description: '24-hour time, e.g. 11:30',
      validation: (rule) => rule.required().regex(TIME, { name: 'time' }).error('Use 24-hour time like 11:30'),
    }),
  ],
  preview: {
    select: { day: 'day', start: 'startTime', end: 'endTime' },
    prepare: ({ day, start, end }) => ({
      title: DAYS.find((d) => d.value === day)?.title ?? 'Day not set',
      subtitle: `${start ?? '?'} – ${end ?? '?'} WIB`,
    }),
  },
})

export const eventSession = defineType({
  name: 'eventSession',
  title: 'Session',
  type: 'object',
  fields: [
    localeField({ name: 'label', title: 'Name', description: 'e.g. "Session 1"', required: true }),
    defineField({
      name: 'start',
      title: 'First day',
      type: 'date',
      options: { dateFormat: 'D MMMM YYYY' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'end',
      title: 'Last day',
      type: 'date',
      options: { dateFormat: 'D MMMM YYYY' },
      validation: (rule) =>
        rule.custom((end, context) => {
          const start = (context.parent as { start?: string } | undefined)?.start
          if (end && start && end < start) return 'The last day cannot be before the first day.'
          return true
        }),
    }),
  ],
  preview: {
    select: { title: 'label.en', start: 'start', end: 'end' },
    prepare: ({ title, start, end }) => ({ title, subtitle: end && end !== start ? `${start} → ${end}` : start }),
  },
})

export const socialLink = defineType({
  name: 'socialLink',
  title: 'Social media link',
  type: 'object',
  fields: [
    defineField({
      name: 'platform',
      title: 'Platform',
      type: 'string',
      options: {
        list: [
          { title: 'Instagram', value: 'instagram' },
          { title: 'Facebook', value: 'facebook' },
          { title: 'YouTube', value: 'youtube' },
          { title: 'Other', value: 'other' },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'label', title: 'Text', type: 'string', description: 'e.g. "@nauyanaaranya"' }),
    defineField({
      name: 'url',
      title: 'Link',
      type: 'url',
      description: 'Full link, e.g. https://www.instagram.com/nauyanaaranya/',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: { select: { title: 'label', subtitle: 'platform' } },
})

export const pageSection = defineType({
  name: 'pageSection',
  title: 'Section',
  type: 'object',
  fields: [
    localeField({ name: 'heading', title: 'Heading', description: 'Optional.' }),
    localeField({ name: 'content', title: 'Text', type: 'blockContent' }),
    defineField({
      name: 'images',
      title: 'Photos',
      type: 'array',
      description: 'Optional. 1–5 photos shown as a collage next to the text.',
      of: [defineArrayMember({ ...imageField({ name: 'photo', title: 'Photo' }), name: 'photo' })],
      validation: (rule) => rule.max(5),
    }),
    defineField({
      name: 'background',
      title: 'Background',
      type: 'string',
      initialValue: 'light',
      options: {
        list: [
          { title: 'Light cream', value: 'light' },
          { title: 'Warm cream', value: 'warm' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
    }),
  ],
  preview: {
    select: { title: 'heading.en', media: 'images.0' },
    prepare: ({ title, media }) => ({ title: title || 'Section without heading', media }),
  },
})
