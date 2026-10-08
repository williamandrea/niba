import handler, { createServerEntry } from '@tanstack/react-start/server-entry'
import { legacyRedirect } from './lib/legacy-redirects'
import { env } from './env'

/** The live site's host. Other hosts (workers.dev, PR previews) stay out of search engines. */
const SITE_HOST = new URL(env.SITE_URL).host

/**
 * Pages are cached at Cloudflare's edge (Workers Caching, see wrangler.jsonc):
 * fresh for 5 minutes, then served stale for up to a day while refreshing in
 * the background. So admin edits show up within about 5 minutes.
 *
 * `Cache-Control` is the header from the spec, for browsers and other caches.
 * Cloudflare ignores stale-while-revalidate when s-maxage is present, so the
 * edge gets its own `Cloudflare-CDN-Cache-Control` (stripped before reaching
 * the browser).
 */
const CACHE_OK = 'public, s-maxage=300, stale-while-revalidate=86400'
const EDGE_OK = 'max-age=300, stale-while-revalidate=86400'

function withCaching(response: Response) {
  if (response.headers.has('Cache-Control')) return response
  const res = new Response(response.body, response)
  if (res.status === 200) {
    res.headers.set('Cache-Control', CACHE_OK)
    res.headers.set('Cloudflare-CDN-Cache-Control', EDGE_OK)
  } else if (res.status === 301 || res.status === 308) {
    res.headers.set('Cache-Control', 'public, max-age=86400')
  } else if (res.status === 404) {
    res.headers.set('Cache-Control', 'public, s-maxage=60')
    res.headers.set('Cloudflare-CDN-Cache-Control', 'max-age=60')
  } else {
    res.headers.set('Cache-Control', 'no-store')
  }
  return res
}

function redirect(location: string) {
  return new Response(null, { status: 301, headers: { Location: location, 'Cache-Control': 'public, max-age=86400' } })
}

export default createServerEntry({
  async fetch(request) {
    const url = new URL(request.url)
    const isRead = request.method === 'GET' || request.method === 'HEAD'

    if (isRead) {
      // Old WordPress addresses (?p=85, /feed/, /category/…).
      const legacy = legacyRedirect(url)
      if (legacy) return redirect(new URL(legacy, url.origin).toString())

      // WordPress-style trailing slashes: /about -> /about/ (permanent).
      const last = url.pathname.split('/').pop() ?? ''
      const internal =
        url.pathname.startsWith('/_') || url.pathname.startsWith('/@') || url.pathname.startsWith('/cdn-cgi')
      if (!internal && last && !last.includes('.')) {
        url.pathname += '/'
        return redirect(url.toString())
      }
    }

    const response = await handler.fetch(request)
    const res = isRead ? withCaching(response) : response
    if (url.host === SITE_HOST) return res
    const hidden = new Response(res.body, res)
    hidden.headers.set('X-Robots-Tag', 'noindex')
    return hidden
  },
})
