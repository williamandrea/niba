/// <reference types="vite/client" />
import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import appCss from '~/styles/app.css?url'
import { SiteHeader } from '~/components/layout/SiteHeader'
import { SiteFooter } from '~/components/layout/SiteFooter'
import { NotFound } from '~/components/layout/NotFound'
import { DEFAULT_MENU, DEFAULT_USEFUL_LINKS, SITE_NAME } from '~/lib/site'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: '#fdf8e1' },
      { title: SITE_NAME },
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
  return (
    <>
      <SiteHeader siteName={SITE_NAME} logo={null} menu={DEFAULT_MENU} />
      <main id="main" tabIndex={-1} className="outline-none">
        <Outlet />
      </main>
      <SiteFooter
        data={{
          siteName: SITE_NAME,
          contacts: [],
          usefulLinks: DEFAULT_USEFUL_LINKS,
          socialLinks: [],
        }}
      />
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
