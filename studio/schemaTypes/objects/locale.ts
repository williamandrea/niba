import { defineField, defineType } from 'sanity'

/*
 * Text in two languages. Every translatable field stores { en, id }.
 * English is required where the field is required; Indonesian is optional
 * and the website shows the English text until it is filled in.
 * Keep the language list in sync with web/src/lib/i18n.ts.
 */

export const LANGUAGES = [
  { id: 'en', title: 'English' },
  { id: 'id', title: 'Bahasa Indonesia' },
] as const

export const LOCALE_TYPES = ['localeString', 'localeText', 'localeBlockContent'] as const

export const localeString = defineType({
  name: 'localeString',
  title: 'Text in two languages',
  type: 'object',
  options: { columns: 2 },
  fields: LANGUAGES.map((lang) => defineField({ name: lang.id, title: lang.title, type: 'string' })),
})

export const localeText = defineType({
  name: 'localeText',
  title: 'Longer text in two languages',
  type: 'object',
  options: { columns: 2 },
  fields: LANGUAGES.map((lang) =>
    defineField({
      name: lang.id,
      title: lang.title,
      type: 'text',
      rows: 4,
    }),
  ),
})

export const localeBlockContent = defineType({
  name: 'localeBlockContent',
  title: 'Rich text in two languages',
  type: 'object',
  fields: LANGUAGES.map((lang) =>
    defineField({
      name: lang.id,
      title: lang.title,
      type: 'blockContent',
    }),
  ),
})
