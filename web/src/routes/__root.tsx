/// <reference types="vite/client" />
import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import appCss from '~/styles/app.css?url'
import { SiteHeader } from '~/components/layout/SiteHeader'
import { SiteFooter } from '~/components/layout/SiteFooter'
import { NotFound } from '~/components/layout/NotFound'
import { getSettings } from '~/lib/sanity/api'
import { resolveSettings } from '~/lib/settings'

export const Route = createRootRoute({
  loader: async () => resolveSettings(await getSettings()),
  // Settings change rarely; don't refetch them on every page change.
  staleTime: 5 * 60_000,
  head: ({ loaderData }) => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: '#fdf8e1' },
      { title: loaderData?.siteName },
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
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
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
      <SiteHeader siteName={settings.siteName} logo={settings.logo} menu={settings.menu} />
      <main id="main" tabIndex={-1} className="outline-none">
        <Outlet />
      </main>
      <SiteFooter data={settings.footer} />
    </>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
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
