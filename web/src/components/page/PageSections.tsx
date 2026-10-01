import type { SanityImageSource } from '~/lib/sanity/image'
import type { BlockContent } from '~/lib/sanity/sanity.types'
import { clean } from '~/lib/text'
import { useT } from '~/lib/i18n'
import { PhotoCollage } from '~/components/ui/PhotoCollage'
import { RichText, cleanBlocks } from '~/components/portable-text/RichText'

export type PageSectionData = {
  _key: string
  heading?: string | null
  content?: BlockContent | null
  images?: SanityImageSource[] | null
  background?: string | null
}

/** Sanity page sections: text with an optional photo collage, alternating sides. */
export function PageSections({ sections }: { sections: PageSectionData[] | null | undefined }) {
  const visible = (sections ?? []).filter(
    (s) => clean(s.heading) || cleanBlocks(s.content).length || s.images?.some((i) => i?.asset),
  )
  if (!visible.length) return null
  return (
    <>
      {visible.map((section, index) => {
        const hasPhotos = section.images?.some((i) => i?.asset)
        const warm = section.background === 'warm'
        const id = `section-${section._key}`
        return (
          <section
            key={section._key}
            aria-labelledby={clean(section.heading) ? id : undefined}
            className={`py-section ${warm ? 'bg-cream-100' : 'bg-cream-50'}`}
          >
            <div
              className={`mx-auto max-w-site px-4 sm:px-6 ${hasPhotos ? 'grid items-start gap-10 lg:grid-cols-2 lg:gap-16' : ''}`}
            >
              {hasPhotos && (
                <div className={`fade-in ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <PhotoCollage images={section.images ?? []} />
                </div>
              )}
              <div>
                {clean(section.heading) && (
                  <h2 id={id} className="mb-5">
                    {clean(section.heading)}
                  </h2>
                )}
                <RichText value={section.content} />
              </div>
            </div>
          </section>
        )
      })}
    </>
  )
}

/** Friendly message for pages that admins have not filled in yet. */
export function ComingSoon() {
  const t = useT()
  return (
    <div className="mx-auto max-w-site px-4 py-section sm:px-6">
      <p className="max-w-xl text-lg">{t.comingSoon}</p>
    </div>
  )
}
