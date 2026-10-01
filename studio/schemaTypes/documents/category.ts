import { defineType } from 'sanity'
import { TagIcon } from '@sanity/icons/Tag'
import { localeField, slugField } from '../../lib/fields'
import { RESERVED_SLUGS } from '../../lib/paths'

export const category = defineType({
  name: 'category',
  title: 'Article category',
  type: 'document',
  icon: TagIcon,
  fields: [
    localeField({ name: 'title', title: 'Name', required: true }),
    {
      ...slugField(
        'title.en',
        'Used in article addresses, e.g. "dhammapada" makes /dhammapada/<article>/. Do not change it after publishing, or old links will break.',
      ),
      validation: (rule) =>
        rule
          .required()
          .custom((slug: { current?: string } | undefined) =>
            slug?.current && RESERVED_SLUGS.includes(slug.current)
              ? 'This address is already used by another page.'
              : true,
          ),
    },
  ],
  preview: { select: { title: 'title.en', subtitle: 'slug.current' } },
})
