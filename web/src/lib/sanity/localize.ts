import type { Lang } from '../i18n'
import { clean } from '../text'

/*
 * Translatable Sanity fields are stored as { _type: 'localeString', en, id }
 * (see studio/schemaTypes/objects/locale.ts). `localize` swaps each of them
 * for the text in the visitor's language, or the English text when the
 * Indonesian is missing, so components only ever see plain strings.
 */

const LOCALE_TYPES = new Set(['localeString', 'localeText', 'localeBlockContent'])

/** The type of a query result after `localize`. */
export type Localized<T> = T extends { _type: 'localeString' | 'localeText' }
  ? string
  : T extends { _type: 'localeBlockContent'; en?: infer B }
    ? NonNullable<B>
    : T extends readonly (infer U)[]
      ? Localized<U>[]
      : T extends object
        ? { [K in keyof T]: Localized<T[K]> }
        : T

type LocaleValue = { _type?: string; en?: unknown; id?: unknown }

function isLocaleValue(value: object): value is LocaleValue {
  const v = value as Record<string, unknown>
  if (typeof v._type === 'string') return LOCALE_TYPES.has(v._type)
  // Values written without a _type (e.g. by a script) are recognised by their keys.
  const keys = Object.keys(v)
  return keys.length > 0 && keys.every((k) => k === 'en' || k === 'id')
}

/** Text that is only an admin "TODO:" note counts as empty, so English shows instead. */
function hasContent(value: unknown) {
  if (typeof value === 'string') return clean(value).length > 0
  return Array.isArray(value) && value.length > 0
}

function pick(value: LocaleValue, lang: Lang) {
  if (hasContent(value[lang])) return value[lang]
  if (hasContent(value.en)) return value.en
  const isBlocks = value._type === 'localeBlockContent' || Array.isArray(value.en) || Array.isArray(value.id)
  return isBlocks ? [] : ''
}

export function localize<T>(data: T, lang: Lang): Localized<T> {
  const walk = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(walk)
    if (value && typeof value === 'object') {
      if (isLocaleValue(value)) return pick(value, lang)
      return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, walk(v)]))
    }
    return value
  }
  return walk(data) as Localized<T>
}
