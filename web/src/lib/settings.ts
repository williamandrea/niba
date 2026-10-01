import type { SETTINGS_QUERY_RESULT } from './sanity/sanity.types'
import type { FooterData } from '~/components/layout/SiteFooter'
import { DEFAULT_MENU, DEFAULT_USEFUL_LINKS, SITE_NAME, type MenuItem } from './site'

type Settings = NonNullable<SETTINGS_QUERY_RESULT>

/** Sanity settings with built-in fallbacks, so the site works before anything is filled in. */
export function resolveSettings(settings: SETTINGS_QUERY_RESULT | null | undefined) {
  const s: Partial<Settings> = settings ?? {}
  const siteName = s.siteName || SITE_NAME
  const menu: MenuItem[] = s.menu?.length
    ? s.menu.map((item) => ({
        label: item.label,
        href: item.href,
        children: item.children?.map((c) => ({ label: c.label, href: c.href })),
      }))
    : DEFAULT_MENU
  const f = s.footer
  const footer: FooterData = {
    siteName,
    quote: f?.quote,
    quoteSource: f?.quoteSource,
    address: f?.address,
    mapsUrl: f?.mapsUrl,
    email: f?.email,
    whatsapp: f?.whatsapp,
    contacts: f?.contacts ?? [],
    usefulLinks: f?.usefulLinks?.length ? f.usefulLinks : DEFAULT_USEFUL_LINKS,
    nibaBlurb: f?.nibaBlurb,
    nibaLink: f?.nibaButton ?? { label: 'Register for NIBA', href: '/niba/registration/' },
    socialLinks: f?.socialLinks ?? [],
  }
  return { siteName, logo: s.logo ?? null, menu, footer, seo: s.seo ?? null }
}

export type ResolvedSettings = ReturnType<typeof resolveSettings>
