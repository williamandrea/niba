import { clean } from '~/lib/text'
import { hasImage, imageDimensions, urlFor, type SanityImageSource } from '~/lib/sanity/image'

const DEFAULT_WIDTHS = [320, 480, 640, 800, 1024, 1280, 1600, 2000]

type Props = {
  image: SanityImageSource | null | undefined
  /** The `sizes` attribute, e.g. "(min-width: 1024px) 50vw, 100vw". */
  sizes: string
  /** Width / height. When set, the image is cropped to this shape around the hotspot. */
  aspect?: number
  widths?: number[]
  /** For the one image at the top of the page (hero). */
  priority?: boolean
  alt?: string
  className?: string
}

export function SanityImage({ image, sizes, aspect, widths = DEFAULT_WIDTHS, priority, alt, className }: Props) {
  if (!hasImage(image)) return null
  const dims = imageDimensions(image)
  const maxWidth = Math.min(widths[widths.length - 1] ?? 2000, dims?.width ?? Infinity)
  const usable = widths.filter((w) => w <= maxWidth)
  if (usable.length === 0) usable.push(Math.round(maxWidth))

  const build = (w: number) => {
    let b = urlFor(image).width(w)
    if (aspect) {
      b = b.height(Math.round(w / aspect)).fit('crop')
      // Keep the top of the image unless an editor picked a focus point in the Studio.
      if (!image.hotspot) b = b.crop('top')
    }
    return b.url()
  }

  const largest = usable[usable.length - 1] ?? 800
  const width = largest
  const height = aspect
    ? Math.round(largest / aspect)
    : dims
      ? Math.round((largest * dims.height) / dims.width)
      : undefined

  return (
    <img
      src={build(Math.min(largest, 1024))}
      srcSet={usable.map((w) => `${build(w)} ${w}w`).join(', ')}
      sizes={sizes}
      width={width}
      height={height}
      alt={alt ?? clean(image.alt)}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : undefined}
      className={className}
      style={{ objectPosition: 'top', ...(aspect ? { aspectRatio: String(aspect) } : {}) }}
    />
  )
}
