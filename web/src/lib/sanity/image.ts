import { createImageUrlBuilder } from '@sanity/image-url'
import { env } from '~/env'

const builder = createImageUrlBuilder({
  projectId: env.SANITY_PROJECT_ID || 'missing-project-id',
  dataset: env.SANITY_DATASET,
})

/** The parts of a Sanity image field that the site needs. */
export type SanityImageSource = {
  asset?: { _ref: string } | null
  hotspot?: { x?: number; y?: number; width?: number; height?: number } | null
  crop?: { top?: number; bottom?: number; left?: number; right?: number } | null
  alt?: string | null
}

export function urlFor(source: SanityImageSource) {
  return builder.image(source).auto('format')
}

/** Reads width and height from an asset id like `image-abc-1200x800-jpg`. */
export function imageDimensions(source: SanityImageSource) {
  const match = /-(\d+)x(\d+)-/.exec(source.asset?._ref ?? '')
  if (!match) return null
  const width = Number(match[1])
  const height = Number(match[2])
  if (!width || !height) return null
  // Apply crop so the ratio matches what the CDN returns.
  const crop = source.crop
  const w = width * (1 - (crop?.left ?? 0) - (crop?.right ?? 0))
  const h = height * (1 - (crop?.top ?? 0) - (crop?.bottom ?? 0))
  return { width: Math.round(w), height: Math.round(h) }
}

export function hasImage(source: SanityImageSource | null | undefined): source is SanityImageSource {
  return Boolean(source?.asset?._ref)
}
