import { createFileRoute } from '@tanstack/react-router'
import { sanityClient } from '~/lib/sanity/client'
import { SITEMAP_QUERY } from '~/lib/sanity/queries'
import { PAGE_SLUG_PATHS } from '~/lib/paths'
import { absoluteUrl } from '~/lib/seo'

const STATIC_PATHS = [
  '/',
  '/about/',
  '/teachers/',
  '/residing-venerables/',
  '/niba/',
  '/niba/registration/',
  '/programs/',
  '/events/',
  '/events/past/',
  '/blog/',
  '/books/',
  '/chanting/',
  '/contact/',
]

const escapeXml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const data = await sanityClient.fetch(SITEMAP_QUERY)
        const entries = new Map<string, string | undefined>(STATIC_PATHS.map((p) => [p, undefined]))
        for (const post of data.posts)
          if (post.category) entries.set(`/${post.category}/${post.slug}/`, post._updatedAt)
        for (const event of data.events) entries.set(`/events/${event.slug}/`, event._updatedAt)
        for (const page of data.pages) entries.set(PAGE_SLUG_PATHS[page.slug] ?? `/${page.slug}/`, page._updatedAt)

        const urls = [...entries]
          .map(
            ([path, updated]) =>
              `  <url><loc>${escapeXml(absoluteUrl(path))}</loc>${updated ? `<lastmod>${updated.slice(0, 10)}</lastmod>` : ''}</url>`,
          )
          .join('\n')
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
        return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } })
      },
    },
  },
})
