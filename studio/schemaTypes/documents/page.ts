import { defineArrayMember, defineField, defineType } from 'sanity'
import { DocumentIcon } from '@sanity/icons/Document'
import { localeField, seoField, slugField } from '../../lib/fields'
import { CHANTING_PREFIX, RESERVED_SLUGS, PAGE_SLUG_PATHS, pagePath } from '../../lib/paths'

export const page = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  icon: DocumentIcon,
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'seo', title: 'Search & sharing' },
  ],
  fields: [
    localeField({ name: 'title', title: 'Title', group: 'content', required: true }),
    {
      ...slugField(
        'title.en',
        `The page address. These slugs fill special pages: ${Object.entries(PAGE_SLUG_PATHS)
          .map(([slug, path]) => `"${slug}" → ${path}`)
          .join(', ')}. Slugs starting with "${CHANTING_PREFIX}" live under /chanting/.`,
      ),
      group: 'content',
      validation: (rule) =>
        rule.required().custom((slug: { current?: string } | undefined) => {
          const value = slug?.current
          if (value && RESERVED_SLUGS.includes(value) && !(value in PAGE_SLUG_PATHS)) {
            return 'This address is already used by another part of the site.'
          }
          return true
        }),
    },
    localeField({
      name: 'intro',
      title: 'Introduction',
      type: 'text',
      group: 'content',
      description: 'Optional. A short line under the title.',
    }),
    defineField({
      name: 'body',
      title: 'Sections',
      type: 'array',
      group: 'content',
      description: 'The page is built from sections. Each has a heading, text, and optional photos.',
      of: [defineArrayMember({ type: 'pageSection' })],
    }),
    seoField('seo'),
  ],
  preview: {
    select: { title: 'title.en', slug: 'slug.current', media: 'body.0.images.0' },
    prepare: ({ title, slug, media }) => ({
      title,
      subtitle: slug ? pagePath(slug) : '',
      media,
    }),
  },
})
