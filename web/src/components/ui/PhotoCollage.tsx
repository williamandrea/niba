import type { SanityImageSource } from '~/lib/sanity/image'
import { hasImage } from '~/lib/sanity/image'
import { SanityImage } from './SanityImage'

/**
 * Up to five photos next to text.
 * Desktop: a tall main photo with smaller photos beside it.
 * Phone: one main photo, then a 2-column grid of small photos.
 */
export function PhotoCollage({
  images,
  priority = false,
}: {
  images: (SanityImageSource | null | undefined)[]
  priority?: boolean
}) {
  const photos = images.filter(hasImage).slice(0, 5)
  if (!photos.length) return null
  const [main, ...rest] = photos

  if (!rest.length) {
    return (
      <SanityImage
        image={main}
        aspect={4 / 3}
        sizes="(min-width: 1024px) 34rem, 100vw"
        priority={priority}
        className="w-full rounded-card object-cover shadow-md"
      />
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-[3fr_2fr] lg:grid-rows-2">
      <SanityImage
        image={main}
        aspect={4 / 3}
        sizes="(min-width: 1024px) 22rem, 100vw"
        priority={priority}
        className="col-span-2 w-full rounded-card object-cover shadow-md lg:col-span-1 lg:row-span-2 lg:h-full lg:aspect-auto!"
      />
      {rest.slice(0, 4).map((photo, i) => (
        <SanityImage
          key={photo.asset?._ref ?? i}
          image={photo}
          aspect={1}
          sizes="(min-width: 1024px) 14rem, 50vw"
          widths={[240, 360, 480, 720]}
          className={`w-full rounded-card object-cover shadow-sm ${i >= 2 ? 'lg:hidden' : ''}`}
        />
      ))}
    </div>
  )
}
