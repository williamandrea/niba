/**
 * Old WordPress addresses that no longer exist, sent to the closest new page
 * with a permanent (301) redirect so search engines update their links.
 */

/** WordPress post IDs (?p=…) from the export. */
const POSTS: Record<string, string> = {
  '85': '/dhammapada/dhammapada-verse-1-cakkhupalatthera-vatthu/',
  '143': '/dhammapada/dhammapada-verse-2-the-story-of-mattakundali/',
  '241': '/dhammapada/dhammapada-verse-3-the-story-of-monk-tissa/',
}

/** WordPress page IDs (?page_id=…) from the export. */
const PAGES: Record<string, string> = {
  '32': '/',
  '81': '/blog/',
  '46': '/about/',
  '156': '/teachers/',
  '161': '/niba/',
  '293': '/chanting/',
}

/** WordPress category IDs (?cat=…). */
const CATEGORIES: Record<string, string> = { '8': 'dhammapada' }

const PATHS: [RegExp, (m: RegExpExecArray) => string][] = [
  [/^\/(?:.+\/)?feed\/?$/, () => '/blog/'],
  [/^\/category\/([^/]+)(?:\/page\/\d+)?\/?$/, (m) => `/blog/?category=${m[1]}`],
  [/^\/tag\/[^/]+(?:\/page\/\d+)?\/?$/, () => '/blog/'],
  [/^\/author\/[^/]+\/?$/, () => '/about/'],
  [/^\/(?:blog\/)?page\/(\d+)\/?$/, (m) => (m[1] === '1' ? '/blog/' : `/blog/?page=${m[1]}`)],
  [/^\/homepage\/?$/, () => '/'],
  [/^\/about-teachers\/?$/, () => '/teachers/'],
  [/^\/about-us\/?$/, () => '/about/'],
  [/^\/upcoming-event\/?$/, () => '/events/'],
]

/** Returns the new path for an old WordPress URL, or null. */
export function legacyRedirect(url: URL): string | null {
  const q = url.searchParams
  if (url.pathname === '/' || url.pathname === '/index.php') {
    const p = q.get('p')
    if (p) return POSTS[p] ?? '/blog/'
    const pageId = q.get('page_id')
    if (pageId) return PAGES[pageId] ?? '/'
    if (q.has('attachment_id')) return '/'
    const cat = q.get('cat')
    if (cat) return CATEGORIES[cat] ? `/blog/?category=${CATEGORIES[cat]}` : '/blog/'
    const search = q.get('s')
    if (search !== null) return search.trim() ? `/blog/?q=${encodeURIComponent(search.trim())}` : '/blog/'
    if (q.has('feed')) return '/blog/'
  }
  for (const [pattern, to] of PATHS) {
    const match = pattern.exec(url.pathname)
    if (match) return to(match)
  }
  return null
}
