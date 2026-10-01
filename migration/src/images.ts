import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { basename, extname, join } from 'node:path'
import type { SanityClient } from '@sanity/client'
import { imageSize } from 'image-size'

export const LOCAL_IMAGES_DIR = new URL('../images/', import.meta.url).pathname

export type LoadedImage = { buffer: Buffer; filename: string; from: 'download' | 'local' }

/**
 * A file's "base name" for matching: lowercase, no extension, and without the
 * suffixes WordPress adds to copies of the same photo. So these all match
 * `hero-section.webp`:
 *   hero-section-1024x683.webp   (resized copy the site shows)
 *   hero-section-scaled.jpg      (large originals)
 *   hero-section (1).webp        (saved twice by the browser)
 */
export function baseName(file: string) {
  let name = decodeURIComponent(basename(file)).toLowerCase()
  name = name.slice(0, name.length - extname(name).length)
  let previous = ''
  while (previous !== name) {
    previous = name
    name = name
      .replace(/\s*\(\d+\)$/, '')
      .replace(/-\d+x\d+$/, '')
      .replace(/-(scaled|rotated)$/, '')
      .replace(/-e\d{10,}$/, '')
  }
  return name
}

const IMAGE_EXT = /\.(webp|jpe?g|png|gif|avif)$/i

/** Finds the photo in migration/images/. When there are several copies, takes the biggest file. */
function findLocal(url: string) {
  if (!existsSync(LOCAL_IMAGES_DIR)) return null
  const wanted = baseName(new URL(url).pathname)
  const matches = readdirSync(LOCAL_IMAGES_DIR)
    .filter((f) => IMAGE_EXT.test(f) && baseName(f) === wanted)
    .map((f) => ({ f, size: statSync(join(LOCAL_IMAGES_DIR, f)).size }))
    .sort((a, b) => b.size - a.size)
  return matches[0]?.f ?? null
}

/**
 * Gets an image: first tries to download it from the old site, then looks in
 * migration/images/. The old site blocks most bots, so the local folder is
 * the usual source.
 */
export async function loadImage(url: string): Promise<LoadedImage | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (NaUyana migration)', Accept: 'image/*' },
      signal: AbortSignal.timeout(15_000),
    })
    const type = res.headers.get('content-type') ?? ''
    if (res.ok && type.startsWith('image/')) {
      return {
        buffer: Buffer.from(await res.arrayBuffer()),
        filename: basename(new URL(url).pathname),
        from: 'download',
      }
    }
  } catch {
    // Fall through to the local folder.
  }
  const found = findLocal(url)
  return found ? { buffer: readFileSync(join(LOCAL_IMAGES_DIR, found)), filename: found, from: 'local' } : null
}

/** Sanity names image assets `image-<sha1>-<width>x<height>-<format>`, so the id is known before upload. */
export function predictAssetId(image: LoadedImage) {
  const size = imageSize(image.buffer)
  const sha1 = createHash('sha1').update(image.buffer).digest('hex')
  const format = size.type === 'jpg' ? 'jpg' : (size.type ?? extname(image.filename).slice(1))
  return `image-${sha1}-${size.width}x${size.height}-${format}`
}

/** Uploads once: Sanity keeps one asset per file, so re-running reuses it. */
export async function uploadImage(client: SanityClient, image: LoadedImage) {
  const asset = await client.assets.upload('image', image.buffer, { filename: image.filename })
  return asset._id
}
