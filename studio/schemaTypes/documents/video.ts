import { defineField, defineType } from 'sanity'
import { PlayIcon } from '@sanity/icons/Play'
import { localeField } from '../../lib/fields'

export const DRIVE_FILE_URL = /^https:\/\/drive\.google\.com\/file\/d\/[\w-]+/

export const video = defineType({
  name: 'video',
  title: 'Video',
  type: 'document',
  icon: PlayIcon,
  fields: [
    localeField({ name: 'title', title: 'Title', required: true }),
    defineField({
      name: 'driveUrl',
      title: 'Google Drive link',
      type: 'url',
      description:
        'In Google Drive, right-click the video → Share → Copy link. Sharing must be "Anyone with the link". Example: https://drive.google.com/file/d/1Jzk…/view',
      validation: (rule) =>
        rule
          .required()
          .custom((url: string | undefined) =>
            !url || DRIVE_FILE_URL.test(url) ? true : 'Please paste a Google Drive link to one video file.',
          ),
    }),
    defineField({
      name: 'article',
      title: 'Related article',
      type: 'reference',
      to: [{ type: 'post' }],
      description: 'Optional. Shows a "Read the story" link under the video.',
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Lower numbers show first, e.g. the verse number.',
    }),
  ],
  orderings: [{ title: 'Order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'title.en', subtitle: 'driveUrl' } },
})
