/*
 * Newest Instagram posts for the homepage, from a Behold JSON feed
 * (https://behold.so/docs/json-feeds/). Admins paste the feed link in the
 * Studio (Homepage sections → Instagram).
 *
 * Behold's free plan counts every request to the feed and allows 1,200 a
 * month, so the Worker keeps the feed in Cloudflare's cache for 6 hours.
 * Behold only refreshes free feeds once a day anyway.
 */

const FEED_PATTERN = /^https:\/\/feeds\.behold\.so\/[\w-]+\/?$/
const CACHE_SECONDS = 6 * 60 * 60
const MAX_POSTS = 9

export type InstagramPhoto = {
  id: string
  permalink: string
  src: string
  srcSet: string
  alt: string
  isVideo: boolean
}

export type InstagramFeed = {
  username: string | null
  posts: InstagramPhoto[]
}

type BeholdSize = { mediaUrl?: string; width?: number; height?: number }

type BeholdPost = {
  id?: string
  permalink?: string
  mediaType?: string
  isReel?: boolean
  mediaUrl?: string
  thumbnailUrl?: string
  caption?: string
  prunedCaption?: string
  sizes?: Partial<Record<'small' | 'medium' | 'large' | 'full', BeholdSize>>
}

/** Returns null when the link is missing or wrong, or Behold can't be reached. The section then hides. */
export async function fetchInstagramFeed(feedUrl: string | null | undefined): Promise<InstagramFeed | null> {
  if (!feedUrl || !FEED_PATTERN.test(feedUrl)) return null
  try {
    const res = await fetch(feedUrl, {
      signal: AbortSignal.timeout(3000),
      // Cloudflare's subrequest cache (not part of the standard RequestInit type).
      cf: { cacheTtl: CACHE_SECONDS, cacheEverything: true },
    } as RequestInit)
    if (!res.ok) return null
    const data = (await res.json()) as { username?: string; posts?: BeholdPost[] } | BeholdPost[]
    const posts = Array.isArray(data) ? data : (data.posts ?? [])
    return {
      username: Array.isArray(data) ? null : (data.username ?? null),
      posts: posts
        .map(toPhoto)
        .filter((p): p is InstagramPhoto => p !== null)
        .slice(0, MAX_POSTS),
    }
  } catch {
    return null
  }
}

function toPhoto(post: BeholdPost): InstagramPhoto | null {
  const isVideo = post.mediaType === 'VIDEO'
  // Behold's sizes are still images, also for videos (their cover frame).
  const sizes = [post.sizes?.small, post.sizes?.medium, post.sizes?.large].filter((s): s is Required<BeholdSize> =>
    Boolean(s?.mediaUrl && s.width),
  )
  const fallback = isVideo ? post.thumbnailUrl : post.mediaUrl
  const src = sizes[1]?.mediaUrl ?? sizes[0]?.mediaUrl ?? fallback
  if (!post.id || !post.permalink?.startsWith('https://') || !src) return null
  return {
    id: post.id,
    permalink: post.permalink,
    src,
    srcSet: sizes.map((s) => `${s.mediaUrl} ${s.width}w`).join(', '),
    alt: describe(post.prunedCaption || post.caption, isVideo || Boolean(post.isReel)),
    isVideo: isVideo || Boolean(post.isReel),
  }
}

/** Instagram has no alt text, so the start of the caption describes the post. */
function describe(caption: string | undefined, isVideo: boolean) {
  const kind = isVideo ? 'Instagram video' : 'Instagram post'
  const text = (caption ?? '').replace(/\s+/g, ' ').trim()
  if (!text) return kind
  const short = text.length > 120 ? `${text.slice(0, 117).replace(/\s+\S*$/, '')}…` : text
  return `${kind}: ${short}`
}
