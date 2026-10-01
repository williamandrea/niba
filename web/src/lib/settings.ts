import type { FooterData } from '~/components/layout/SiteFooter'
import type { getSettings } from './sanity/api'
import type { Lang } from './i18n'
import { messages } from './messages'
import { defaultMenu, defaultUsefulLinks, SITE_NAME, type MenuItem } from './site'

type Settings = NonNullable<Awaited<ReturnType<typeof getSettings>>>

/** Sanity settings with built-in fallbacks, so the site works before anything is filled in. */
export function resolveSettings(settings: Settings | null | undefined, lang: Lang) {
  const t = messages(lang)
  const s: Partial<Settings> = settings ?? {}
  const siteName = s.siteName || SITE_NAME
  const menu: MenuItem[] = s.menu?.length
    ? s.menu.map((item) => ({
        label: item.label,
        href: item.href,
        children: item.children?.map((c) => ({ label: c.label, href: c.href })),
      }))
    : defaultMenu(t)
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
    usefulLinks: f?.usefulLinks?.length ? f.usefulLinks : defaultUsefulLinks(t),
    nibaBlurb: f?.nibaBlurb,
    nibaLink: f?.nibaButton ?? { label: t.registerForNiba, href: '/niba/registration/' },
    socialLinks: f?.socialLinks ?? [],
  }
  return { lang, siteName, logo: s.logo ?? null, menu, footer, seo: s.seo ?? null }
}

export type ResolvedSettings = ReturnType<typeof resolveSettings>
