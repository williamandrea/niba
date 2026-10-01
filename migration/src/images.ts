import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { basename, extname, join } from 'node:path'
import type { SanityClient } from '@sanity/client'
import { imageSize } from 'image-size'

export const LOCAL_IMAGES_DIR = new URL('../images/', import.meta.url).pathname

export type LoadedImage = { buffer: Buffer; filename: string; from: 'download' | 'local' }

/** Names to look for in migration/images/ (the export sometimes has .jpeg and .webp copies). */
function candidateNames(url: string) {
  const name = decodeURIComponent(basename(new URL(url).pathname))
  const stem = name.slice(0, -extname(name).length)
  const stems = [stem, stem.replace(/-scaled$/, '')]
  const exts = ['.webp', '.jpg', '.jpeg', '.png']
  return [name, ...stems.flatMap((s) => exts.map((e) => s + e))]
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
  if (!existsSync(LOCAL_IMAGES_DIR)) return null
  const files = new Map(readdirSync(LOCAL_IMAGES_DIR).map((f) => [f.toLowerCase(), f]))
  for (const name of candidateNames(url)) {
    const found = files.get(name.toLowerCase())
    if (found) return { buffer: readFileSync(join(LOCAL_IMAGES_DIR, found)), filename: found, from: 'local' }
  }
  return null
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
