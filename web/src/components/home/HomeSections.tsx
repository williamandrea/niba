import { Link } from '@tanstack/react-router'
import type { SanityImageSource } from '~/lib/sanity/image'
import { clean } from '~/lib/text'
import { formatDateRange } from '~/lib/dates'
import { ButtonLink } from '~/components/ui/Button'
import { LotusMandala } from '~/components/ui/LotusMandala'
import { PhotoCollage } from '~/components/ui/PhotoCollage'
import { SanityImage } from '~/components/ui/SanityImage'
import { Section, SectionHeading } from '~/components/ui/Section'
import { TeacherPhoto } from '~/components/ui/TeacherPhoto'
import { ProgramCard, type ProgramCardData } from '~/components/cards/ProgramCard'
import { EventCard, type EventCardData } from '~/components/cards/EventCard'
import { ArticleCard, type ArticleCardData } from '~/components/cards/ArticleCard'
import { TeacherCard, type TeacherCardData } from '~/components/cards/TeacherCard'

type LinkData = { label: string; href: string } | null | undefined

/* 1. Hero: photo on one side, saffron panel with a Pali verse on the other. */
export function Hero({
  siteName,
  image,
  paliVerse,
  meaning,
  tagline,
  button,
}: {
  siteName: string
  image: SanityImageSource | null | undefined
  paliVerse: string | null | undefined
  meaning: string | null | undefined
  tagline: string | null | undefined
  button: LinkData
}) {
  const verse = clean(paliVerse)
  return (
    <section aria-labelledby="hero-title" className="grid lg:min-h-[34rem] lg:grid-cols-2">
      <div className="relative bg-brown-900">
        {image?.asset ? (
          <SanityImage
            image={image}
            aspect={4 / 3}
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
            className="h-full w-full object-cover lg:absolute lg:inset-0 lg:aspect-auto!"
          />
        ) : (
          <div className="aspect-[4/3] lg:absolute lg:inset-0 lg:aspect-auto" />
        )}
      </div>
      <div className="relative isolate flex items-center overflow-hidden bg-saffron-600 px-6 py-12 text-white sm:px-10 lg:px-14 lg:py-16">
        <LotusMandala className="pointer-events-none absolute -bottom-24 -right-24 -z-10 h-96 w-96 text-gold-300 opacity-[0.16]" />
        <div className="max-w-xl">
          <h1 id="hero-title" className="font-sans text-base font-semibold uppercase tracking-widest text-white">
            {siteName}
          </h1>
          {verse && (
            <p lang="pi" className="mt-5 whitespace-pre-line font-serif text-h1 leading-tight text-white">
              {verse}
            </p>
          )}
          {clean(meaning) && (
            <p className="mt-5 font-serif text-verse italic leading-relaxed text-white">{clean(meaning)}</p>
          )}
          {clean(tagline) && (
            <p className="mt-6 flex items-center gap-3 text-lg font-semibold text-white">
              <span className="h-px w-10 bg-gold-300" aria-hidden="true" />
              {clean(tagline)}
            </p>
          )}
          {button && (
            <ButtonLink href={button.href} variant="light" className="mt-8">
              {button.label}
            </ButtonLink>
          )}
        </div>
      </div>
    </section>
  )
}

/* 2. Intro: photo collage next to text and buttons. */
export function Intro({
  heading,
  text,
  images,
  buttons,
}: {
  heading: string | null | undefined
  text: string | null | undefined
  images: SanityImageSource[] | null | undefined
  buttons: { label: string; href: string }[] | null | undefined
}) {
  if (!heading && !text) return null
  return (
    <Section labelledBy="intro-title">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="fade-in">
          <PhotoCollage images={images ?? []} />
        </div>
        <div>
          <p className="mb-2 text-base font-semibold uppercase tracking-widest text-brown-700">
            NIBA · Sunday Dhamma School
          </p>
          <h2 id="intro-title">{clean(heading)}</h2>
          {clean(text) && <p className="mt-4 whitespace-pre-line">{clean(text)}</p>}
          {buttons?.length ? (
            <div className="mt-8 flex flex-wrap gap-3">
              {buttons.map((b, i) => (
                <ButtonLink key={b.href + b.label} href={b.href} variant={i === 0 ? 'primary' : 'outline'}>
                  {b.label}
                </ButtonLink>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </Section>
  )
}

/* 3. Teacher quote. Hidden when there is no quote. */
export function TeacherQuote({
  quote,
  teacher,
}: {
  quote: string | null | undefined
  teacher:
    { fullName: string; shortName: string | null; photo: SanityImageSource | null; slug: string } | null | undefined
}) {
  const text = clean(quote)
  if (!text) return null
  return (
    <Section tone="warm" labelledBy="quote-title">
      <h2 id="quote-title" className="sr-only">
        From our teachers
      </h2>
      <figure className="mx-auto grid max-w-4xl items-center gap-8 md:grid-cols-[12rem_1fr]">
        {teacher && (
          <TeacherPhoto
            photo={teacher.photo}
            name={teacher.fullName}
            sizes="12rem"
            className="mx-auto max-w-48 rounded-full md:max-w-none"
          />
        )}
        <div>
          <blockquote className="font-serif text-verse italic leading-relaxed text-brown-900">“{text}”</blockquote>
          {teacher && (
            <figcaption className="mt-4 font-semibold text-brown-700">
              — {teacher.shortName || teacher.fullName}
            </figcaption>
          )}
        </div>
      </figure>
    </Section>
  )
}

/* 4. Featured verse: first verse of the newest Dhammapada article. */
export function FeaturedVerse({
  featured,
}: {
  featured:
    | {
        title: string
        slug: string
        category: string | null
        verse: { pali: string; meaning: string; reference: string | null } | null
      }
    | null
    | undefined
}) {
  if (!featured?.verse) return null
  const { verse } = featured
  return (
    <section aria-labelledby="verse-title" className="relative isolate overflow-hidden bg-cream-50 py-section">
      <LotusMandala className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[38rem] w-[38rem] -translate-x-1/2 -translate-y-1/2 text-saffron-500 opacity-[0.07]" />
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <p className="text-base font-semibold uppercase tracking-widest text-brown-700">From the Dhammapada</p>
        <h2 id="verse-title" className="sr-only">
          {clean(verse.reference) || 'Featured verse'}
        </h2>
        <p lang="pi" className="mt-6 whitespace-pre-line font-serif text-verse italic leading-relaxed text-brown-900">
          {clean(verse.pali)}
        </p>
        <div className="mx-auto my-6 h-px w-16 bg-gold-400" aria-hidden="true" />
        <p className="whitespace-pre-line font-serif text-verse leading-relaxed text-ink">{clean(verse.meaning)}</p>
        {clean(verse.reference) && <p className="mt-4 text-base text-ink/75">— {clean(verse.reference)}</p>}
        <Link
          to="/$category/$slug/"
          params={{ category: featured.category ?? 'dhammapada', slug: featured.slug }}
          className="mt-8 inline-flex min-h-11 items-center gap-2 font-semibold text-brown-700 underline-offset-4 hover:underline"
        >
          Read the story<span className="sr-only">: {featured.title}</span> →
        </Link>
      </div>
    </section>
  )
}

/* 5. Programs */
export function ProgramsSection({
  programs,
  intro,
}: {
  programs: ProgramCardData[]
  intro: string | null | undefined
}) {
  if (!programs.length) return null
  return (
    <Section tone="warm" labelledBy="programs-title">
      <SectionHeading
        id="programs-title"
        eyebrow="Weekly programs"
        title="Learn and practise with us"
        intro={clean(intro)}
        action={
          <ButtonLink href="/programs/" variant="outline">
            All programs
          </ButtonLink>
        }
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {programs.map((p) => (
          <ProgramCard key={p._id} program={p} />
        ))}
      </div>
    </Section>
  )
}

/* 6. Upcoming events. The whole section hides when there are none. */
export function EventsSection({ events, hasPastEvents }: { events: EventCardData[]; hasPastEvents: boolean }) {
  if (!events.length) return null
  return (
    <Section labelledBy="events-title">
      <SectionHeading
        id="events-title"
        eyebrow="Events"
        title="Upcoming events"
        action={
          hasPastEvents ? (
            <ButtonLink href="/events/past/" variant="outline">
              Past events
            </ButtonLink>
          ) : undefined
        }
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((e) => (
          <EventCard key={e._id} event={e} />
        ))}
      </div>
    </Section>
  )
}

/* 7. Residing venerables: only those staying with us today. Swipe row on phones. */
export function VenerablesSection({
  venerables,
  intro,
}: {
  venerables: (TeacherCardData & { residencyStart: string | null; residencyEnd: string | null })[]
  intro: string | null | undefined
}) {
  if (!venerables.length) return null
  const first = venerables[0]
  const period = first?.residencyStart ? formatDateRange(first.residencyStart, first.residencyEnd) : ''
  return (
    <Section tone="warm" labelledBy="venerables-title">
      <SectionHeading
        id="venerables-title"
        eyebrow={period ? `Residing with us · ${period}` : 'Residing with us'}
        title="Residing venerables"
        intro={clean(intro)}
        action={
          <ButtonLink href="/residing-venerables/" variant="outline">
            More about the residency
          </ButtonLink>
        }
      />
      <ul
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0"
        aria-label="Residing venerables"
      >
        {venerables.map((v) => (
          <li key={v._id} className="w-[min(15rem,70vw)] shrink-0 snap-start lg:w-auto">
            <article className="h-full overflow-hidden rounded-card border border-gold-400/30 bg-white/70 text-center shadow-sm">
              <TeacherPhoto photo={v.photo} name={v.fullName} sizes="(min-width: 1024px) 13rem, 70vw" />
              <div className="p-4">
                <p className="text-base font-semibold uppercase tracking-wider text-brown-700">Venerable</p>
                <h3 className="mt-1 text-lg leading-snug">{v.fullName}</h3>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </Section>
  )
}

/* 8. Our teachers */
export function TeachersSection({ teachers }: { teachers: TeacherCardData[] }) {
  if (!teachers.length) return null
  return (
    <Section labelledBy="teachers-title">
      <SectionHeading id="teachers-title" eyebrow="Guidance" title="Our venerable teachers" align="center" />
      <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {teachers.map((t) => (
          <TeacherCard key={t._id} teacher={t} />
        ))}
      </div>
      <div className="mt-10 text-center">
        <ButtonLink href="/teachers/" variant="outline">
          Read more about our teachers
        </ButtonLink>
      </div>
    </Section>
  )
}

/* 9. Latest articles */
export function LatestArticles({ articles }: { articles: ArticleCardData[] }) {
  if (!articles.length) return null
  return (
    <Section tone="warm" labelledBy="articles-title">
      <SectionHeading
        id="articles-title"
        eyebrow="From our blog"
        title="Reading the Dhamma together"
        action={
          <ButtonLink href="/blog/" variant="outline">
            All articles
          </ButtonLink>
        }
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <ArticleCard key={a._id} article={a} />
        ))}
      </div>
    </Section>
  )
}
