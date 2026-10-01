import { defineField, defineType } from 'sanity'
import { TagIcon } from '@sanity/icons/Tag'
import { slugField } from '../../lib/fields'
import { RESERVED_SLUGS } from '../../lib/paths'

export const category = defineType({
  name: 'category',
  title: 'Article category',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({ name: 'title', title: 'Name', type: 'string', validation: (rule) => rule.required() }),
    {
      ...slugField(
        'title',
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
})
