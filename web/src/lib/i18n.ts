/*
 * Two languages: English at the existing addresses (/about/), Indonesian
 * under /id/ (/id/about/). Inside the app every route keeps its English
 * path; the router rewrites /id/... to /...?lang=id when it reads a URL and
 * back again when it builds a link (see router.tsx). So `lang` is a search
 * param the visitor never sees.
 */
import { useRouterState, type LocationRewrite } from '@tanstack/react-router'
import { messages } from './messages'

export const LANGS = ['en', 'id'] as const
export type Lang = (typeof LANGS)[number]
export const DEFAULT_LANG: Lang = 'en'

export const LANG_NAMES: Record<Lang, string> = { en: 'English', id: 'Bahasa Indonesia' }
/** For <html lang>, hreflang and og:locale. */
export const LANG_TAGS: Record<Lang, { html: string; og: string }> = {
  en: { html: 'en', og: 'en_US' },
  id: { html: 'id', og: 'id_ID' },
}

export function parseLang(value: unknown): Lang {
  return value === 'id' ? 'id' : 'en'
}

/** Root search params. English has no `lang` param at all. */
export type LangSearch = { lang?: 'id' }

export function validateLangSearch(search: Record<string, unknown>): LangSearch {
  return search.lang === 'id' ? { lang: 'id' } : {}
}

/** Public path for an internal path: "/about/" -> "/id/about/" in Indonesian. */
export function localizePath(path: string, lang: Lang) {
  if (lang === DEFAULT_LANG || !path.startsWith('/')) return path
  return path === '/' ? '/id/' : `/id${path}`
}

/** Splits a public pathname into its language and internal path. */
export function splitLangPath(pathname: string): { lang: Lang; path: string } {
  if (pathname === '/id' || pathname === '/id/') return { lang: 'id', path: '/' }
  if (pathname.startsWith('/id/')) return { lang: 'id', path: pathname.slice(3) }
  return { lang: 'en', path: pathname }
}

export const langRewrite: LocationRewrite = {
  input: ({ url }) => {
    const { lang, path } = splitLangPath(url.pathname)
    url.pathname = path
    // Only the address decides the language: drop a hand-typed ?lang=.
    url.searchParams.delete('lang')
    if (lang !== DEFAULT_LANG) url.searchParams.set('lang', lang)
    return url
  },
  output: ({ url }) => {
    const lang = parseLang(url.searchParams.get('lang'))
    url.searchParams.delete('lang')
    url.pathname = localizePath(url.pathname, lang)
    return url
  },
}

/** The language of the page being shown. */
export function useLang(): Lang {
  return useRouterState({ select: (s) => parseLang((s.location.search as LangSearch).lang) })
}

/** Fixed texts (lib/messages.ts) in the page's language. */
export function useT() {
  return messages(useLang())
}

/** For loaderDeps: reload a route's data when the language changes. */
export function langDeps({ search }: { search: LangSearch }) {
  return { lang: parseLang(search.lang) }
}
