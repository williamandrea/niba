/// <reference types="vite/client" />
import { HeadContent, Outlet, Scripts, createRootRoute, retainSearchParams } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import appCss from '~/styles/app.css?url'
import { SiteHeader } from '~/components/layout/SiteHeader'
import { SiteFooter } from '~/components/layout/SiteFooter'
import { NotFound } from '~/components/layout/NotFound'
import { getSettings } from '~/lib/sanity/api'
import { resolveSettings } from '~/lib/settings'
import { organizationJsonLd } from '~/lib/seo'
import { LANG_TAGS, langDeps, parseLang, validateLangSearch } from '~/lib/i18n'

export const Route = createRootRoute({
  // `lang` comes from the /id/ prefix (see lib/i18n.ts) and stays on every link.
  validateSearch: validateLangSearch,
  search: { middlewares: [retainSearchParams(['lang'])] },
  loaderDeps: langDeps,
  loader: async ({ deps: { lang } }) => resolveSettings(await getSettings({ data: { lang } }), lang),
  // Settings change rarely; don't refetch them on every page change.
  staleTime: 5 * 60_000,
  head: ({ loaderData }) => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: '#fdf8e1' },
      { title: loaderData?.siteName },
      ...(loaderData ? [{ 'script:ld+json': organizationJsonLd(loaderData) } as unknown as { name: string }] : []),
    ],
    links: [
      {
        rel: 'preload',
        href: '/fonts/plus-jakarta-sans-var.woff2',
        as: 'font',
        type: 'font/woff2',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'preload',
        href: '/fonts/libre-baskerville-var.woff2',
        as: 'font',
        type: 'font/woff2',
        crossOrigin: 'anonymous',
      },
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.png', type: 'image/png', sizes: '32x32' },
      { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
    ],
  }),
  notFoundComponent: NotFound,
  shellComponent: RootDocument,
  component: RootLayout,
})

function RootLayout() {
  const settings = Route.useLoaderData()
  return (
    <>
      <SiteHeader siteName={settings.siteName} menu={settings.menu} />
      <main id="main" tabIndex={-1} className="outline-none">
        <Outlet />
      </main>
      <SiteFooter data={settings.footer} />
    </>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  const lang = parseLang(Route.useSearch().lang)
  return (
    <html lang={LANG_TAGS[lang].html}>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
