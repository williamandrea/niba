import { clean } from '~/lib/text'
import type { SanityImageSource } from '~/lib/sanity/image'
import { TeacherPhoto } from '~/components/ui/TeacherPhoto'

export type TeacherCardData = {
  _id: string
  fullName: string
  shortName?: string | null
  slug: string
  photo: SanityImageSource | null
  bio?: string | null
}

export function TeacherCard({
  teacher,
  showBio = false,
  headingLevel = 3,
  eyebrow,
}: {
  teacher: TeacherCardData
  showBio?: boolean
  eyebrow?: string
  headingLevel?: 2 | 3
}) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3'
  const bio = clean(teacher.bio)
  return (
    <article
      id={teacher.slug}
      className="flex h-full scroll-mt-28 flex-row overflow-hidden rounded-card border border-gold-400/30 bg-white/70 shadow-sm sm:flex-col"
    >
      {/* Phones: small photo beside the name, so tall photos don't stack up. */}
      <div className="w-28 shrink-0 sm:w-full">
        <TeacherPhoto
          photo={teacher.photo}
          name={teacher.fullName}
          sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 7rem"
          className="h-full sm:h-auto"
        />
      </div>
      <div
        className={`flex min-w-0 flex-1 flex-col justify-center gap-2 p-4 sm:p-6 sm:text-center ${showBio ? 'sm:justify-start' : ''}`}
      >
        {eyebrow && <p className="text-base font-semibold uppercase tracking-wider text-brown-700">{eyebrow}</p>}
        <Heading className="text-lg leading-snug sm:text-xl">{teacher.fullName}</Heading>
        {teacher.shortName && <p className="text-ink/75">{teacher.shortName}</p>}
        {showBio && bio && <p className="mt-2 whitespace-pre-line text-left">{bio}</p>}
      </div>
    </article>
  )
}
