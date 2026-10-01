import type { SanityImageSource } from '~/lib/sanity/image'
import { hasImage } from '~/lib/sanity/image'
import { SanityImage } from './SanityImage'
import { LotusMandala } from './LotusMandala'

/** A teacher's photo, or a calm lotus placeholder when there is none yet. */
export function TeacherPhoto({
  photo,
  name,
  sizes,
  className = '',
}: {
  photo: SanityImageSource | null | undefined
  name: string
  sizes: string
  className?: string
}) {
  if (hasImage(photo)) {
    return (
      <SanityImage
        image={photo}
        aspect={4 / 5}
        sizes={sizes}
        widths={[240, 360, 480, 640, 800]}
        alt={photo.alt ? undefined : name}
        className={`w-full object-cover ${className}`}
      />
    )
  }
  return (
    <div
      className={`relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden bg-gradient-to-b from-saffron-100 to-cream-100 ${className}`}
      role="img"
      aria-label={`${name} (photo coming soon)`}
    >
      <LotusMandala className="h-3/4 w-3/4 text-saffron-500/40" />
    </div>
  )
}
