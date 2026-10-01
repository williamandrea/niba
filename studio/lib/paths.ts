/**
 * Where documents live on the website. Keep in sync with web/src/lib/paths.ts.
 */

/** Page slugs that fill a special page on the site. */
export const PAGE_SLUG_PATHS: Record<string, string> = {
  about: '/about/',
  niba: '/niba/',
  'niba-registration': '/niba/registration/',
  books: '/books/',
  chanting: '/chanting/',
  contact: '/contact/',
  teachers: '/teachers/',
  'residing-venerables': '/residing-venerables/',
  programs: '/programs/',
  events: '/events/',
  blog: '/blog/',
}

/** First path segments the site already uses. Pages and categories cannot use them. */
export const RESERVED_SLUGS = [
  ...Object.keys(PAGE_SLUG_PATHS),
  'blog',
  // Indonesian pages live under /id/.
  'id',
  'sitemap.xml',
  'robots.txt',
  'feed',
  'fonts',
  'assets',
]

type Doc = {
  _type: string
  slug?: { current?: string }
  role?: string
  categorySlug?: string | null
}

/** Path on the site for a document, or null if it has no page. */
export function pathFor(doc: Doc): string | null {
  const slug = doc.slug?.current
  switch (doc._type) {
    case 'siteSettings':
    case 'homepage':
      return '/'
    case 'post':
      return slug && doc.categorySlug ? `/${doc.categorySlug}/${slug}/` : null
    case 'category':
      return slug ? `/blog/?category=${slug}` : '/blog/'
    case 'event':
      return slug ? `/events/${slug}/` : '/events/'
    case 'program':
      return slug ? `/programs/#${slug}` : '/programs/'
    case 'teacher':
      return doc.role === 'resident' ? '/residing-venerables/' : slug ? `/teachers/#${slug}` : '/teachers/'
    case 'page':
      return slug ? (PAGE_SLUG_PATHS[slug] ?? `/${slug}/`) : null
    default:
      return null
  }
}
