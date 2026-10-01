import type { JSX } from 'react'
import { env } from '~/env'
import type { ResolvedSettings } from './settings'
import { hasImage, urlFor, type SanityImageSource } from './sanity/image'
import { clean } from './text'
import { DEFAULT_LANG, LANGS, LANG_TAGS, localizePath, type Lang } from './i18n'
import { messages } from './messages'

type MetaTag = JSX.IntrinsicElements['meta']

type SeoFields = {
  title?: string | null
  description?: string | null
  ogImage?: SanityImageSource | null
} | null

type HeadInput = {
  /** Page title without the site name. Omit for the homepage. */
  title?: string
  description?: string | null
  /** Path with trailing slash, e.g. /about/ (the English address; /id/ is added for Indonesian) */
  path: string
  /** The document's own SEO fields from Sanity, if any. */
  seo?: SeoFields
  /** Fallback sharing image (e.g. the article's cover). */
  image?: SanityImageSource | null
  type?: 'website' | 'article'
  settings?: ResolvedSettings
  jsonLd?: object[]
  noindex?: boolean
}

/** Full URL for a site path, in the given language. */
export const absoluteUrl = (path: string, lang: Lang = DEFAULT_LANG) => `${env.SITE_URL}${localizePath(path, lang)}`

export function ogImageUrl(image: SanityImageSource | null | undefined) {
  return hasImage(image) ? urlFor(image).width(1200).height(630).fit('crop').format('jpg').url() : undefined
}

function trimDescription(text: string, max = 160) {
  const t = text.replace(/\s+/g, ' ').trim()
  return t.length <= max ? t : `${t.slice(0, max - 1).replace(/\s+\S*$/, '')}…`
}

/** Title, description, canonical, Open Graph, Twitter card, and JSON-LD for a route's `head`. */
export function buildHead({
  title,
  description,
  path,
  seo,
  image,
  type = 'website',
  settings,
  jsonLd = [],
  noindex,
}: HeadInput) {
  const lang = settings?.lang ?? DEFAULT_LANG
  const siteName = settings?.siteName ?? 'Na Uyana Aranya Indonesia'
  const defaults = settings?.seo
  const pageTitle = clean(seo?.title) || title
  const fullTitle = pageTitle ? `${pageTitle} | ${siteName}` : clean(defaults?.title) || siteName
  const desc = trimDescription(
    clean(seo?.description) || clean(description) || clean(defaults?.description) || messages(lang).siteDescription,
  )
  const url = absoluteUrl(path, lang)
  const img = ogImageUrl(seo?.ogImage) ?? ogImageUrl(image) ?? ogImageUrl(defaults?.ogImage)

  const meta: MetaTag[] = [
    { title: fullTitle },
    { name: 'description', content: desc },
    { property: 'og:title', content: pageTitle || fullTitle },
    { property: 'og:description', content: desc },
    { property: 'og:url', content: url },
    { property: 'og:type', content: type },
    { property: 'og:site_name', content: siteName },
    { property: 'og:locale', content: LANG_TAGS[lang].og },
    ...LANGS.filter((l) => l !== lang).map((l) => ({ property: 'og:locale:alternate', content: LANG_TAGS[l].og })),
    { name: 'twitter:card', content: img ? 'summary_large_image' : 'summary' },
    { name: 'twitter:title', content: pageTitle || fullTitle },
    { name: 'twitter:description', content: desc },
    ...(img
      ? [
          { property: 'og:image', content: img },
          { property: 'og:image:width', content: '1200' },
          { property: 'og:image:height', content: '630' },
          { name: 'twitter:image', content: img },
        ]
      : []),
    ...(noindex ? [{ name: 'robots', content: 'noindex' }] : []),
    // Rendered by HeadContent as <script type="application/ld+json"> in <head>.
    // The router supports this key at runtime, but its types don't list it.
    ...jsonLd.map((data) => ({ 'script:ld+json': data }) as unknown as MetaTag),
  ]

  return {
    meta,
    links: [
      { rel: 'canonical', href: url },
      // The same page in each language, so search engines show the right one.
      ...(noindex
        ? []
        : [
            ...LANGS.map((l) => ({ rel: 'alternate', hrefLang: LANG_TAGS[l].html, href: absoluteUrl(path, l) })),
            { rel: 'alternate', hrefLang: 'x-default', href: absoluteUrl(path) },
          ]),
    ],
  }
}

/** schema.org BreadcrumbList from [name, path] pairs (Home is added first). */
export function breadcrumbs(items: [string, string][], lang: Lang = DEFAULT_LANG) {
  const all: [string, string][] = [[messages(lang).home, '/'], ...items]
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: all.map(([name, path], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item: absoluteUrl(path, lang),
    })),
  }
}

export function organizationJsonLd(settings: ResolvedSettings) {
  const f = settings.footer
  const logo = hasImage(settings.logo) ? urlFor(settings.logo).width(512).url() : undefined
  const sameAs = f.socialLinks.map((s) => s.url).filter(Boolean)
  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'BuddhistTemple'],
    '@id': `${absoluteUrl('/')}#organization`,
    name: settings.siteName,
    url: absoluteUrl('/', settings.lang),
    ...(logo ? { logo, image: logo } : {}),
    ...(f.email ? { email: f.email } : {}),
    ...(f.whatsapp ? { telephone: f.whatsapp } : {}),
    ...(f.address
      ? {
          address: {
            '@type': 'PostalAddress',
            streetAddress: clean(f.address).split('\n').slice(0, 2).join(', '),
            addressLocality: 'Medan',
            addressRegion: 'North Sumatra',
            postalCode: /\b\d{5}\b/.exec(f.address)?.[0],
            addressCountry: 'ID',
          },
        }
      : {}),
    ...(sameAs.length ? { sameAs } : {}),
  }
}

/** Root loader data, for child routes' `head`. */
export function rootSettings(matches: { routeId: string; loaderData?: unknown }[]) {
  return matches.find((m) => m.routeId === '__root__')?.loaderData as ResolvedSettings | undefined
}

/** Settings, language and fixed texts for a child route's `head`. */
export function headContext(matches: { routeId: string; loaderData?: unknown }[]) {
  const settings = rootSettings(matches)
  const lang = settings?.lang ?? DEFAULT_LANG
  return { settings, lang, t: messages(lang) }
}
