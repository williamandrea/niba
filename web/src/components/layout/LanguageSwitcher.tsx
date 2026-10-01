import { useRouterState } from '@tanstack/react-router'
import { LANGS, LANG_NAMES, LANG_TAGS, localizePath, useLang, useT, type Lang } from '~/lib/i18n'

/**
 * EN | ID toggle. Each link opens the same page in the other language with a
 * full page load, so every text on the page (and its cached data) is fresh.
 */
export function LanguageSwitcher() {
  const current = useLang()
  const t = useT()
  // The router's location is the internal one: /about/ with ?lang=id for /id/about/.
  const { pathname, searchStr, hash } = useRouterState({ select: (s) => s.location })

  const hrefFor = (lang: Lang) => {
    const search = new URLSearchParams(searchStr)
    search.delete('lang')
    const query = search.toString()
    return `${localizePath(pathname, lang)}${query ? `?${query}` : ''}${hash ? `#${hash}` : ''}`
  }

  return (
    <nav aria-label={t.language}>
      <ul className="flex items-center rounded-full border border-gold-400/50 bg-white/60 p-0.5">
        {LANGS.map((lang) => {
          const active = lang === current
          return (
            <li key={lang}>
              <a
                href={hrefFor(lang)}
                hrefLang={LANG_TAGS[lang].html}
                lang={LANG_TAGS[lang].html}
                aria-current={active ? 'true' : undefined}
                className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-2.5 text-sm font-bold uppercase tracking-wide transition-colors ${
                  active ? 'bg-brown-900 text-cream-50' : 'text-brown-900 hover:bg-saffron-100'
                }`}
              >
                <span aria-hidden="true">{lang}</span>
                <span className="sr-only">{LANG_NAMES[lang]}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
