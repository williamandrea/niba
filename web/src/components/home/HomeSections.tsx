import { Link } from '@tanstack/react-router'
import type { SanityImageSource } from '~/lib/sanity/image'
import { clean } from '~/lib/text'
import { formatDateRange } from '~/lib/dates'
import { useLang, useT } from '~/lib/i18n'
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
import type { InstagramFeed } from '~/lib/instagram'

type LinkData = { label: string; href: string } | null | undefined

/* 1. Hero: photo on one side, dark brown panel with a Pali verse on the other. */
export function Hero({
  siteName,
  image,
  heading,
  paliVerse,
  meaning,
  tagline,
  button,
}: {
  siteName: string
  image: SanityImageSource | null | undefined
  heading: string | null | undefined
  paliVerse: string | null | undefined
  meaning: string | null | undefined
  tagline: string | null | undefined
  button: LinkData
}) {
  const verse = clean(paliVerse)
  return (
    // Fills the screen below the sticky header (4rem, 5rem on desktop, plus its 1px border).
    <section
      aria-labelledby="hero-title"
      className="grid min-h-[calc(100svh-4rem-1px)] grid-rows-[auto_1fr] lg:min-h-[calc(100svh-5rem-1px)] lg:grid-cols-2 lg:grid-rows-1"
    >
      <div className="relative bg-brown-900">
        {image?.asset ? (
          <SanityImage
            image={image}
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
            className="aspect-[4/3] h-full w-full object-cover object-top lg:absolute lg:inset-0 lg:aspect-auto"
          />
        ) : (
          <div className="aspect-[4/3] lg:absolute lg:inset-0 lg:aspect-auto" />
        )}
      </div>
      <div className="relative isolate flex items-center overflow-hidden bg-brown-900 px-6 py-12 text-white sm:px-10 lg:px-14 lg:py-16">
        <LotusMandala className="pointer-events-none absolute -bottom-24 -right-24 -z-10 h-96 w-96 text-gold-300 opacity-[0.16]" />
        <div className="max-w-xl">
          <h1 id="hero-title" className="font-sans text-sm font-semibold uppercase tracking-widest text-gold-400">
            {clean(heading) || siteName}
          </h1>
          {verse && (
            <p lang="pi" className="mt-5 whitespace-pre-line font-hero text-h2 font-bold leading-snug text-white">
              {verse}
            </p>
          )}
          {clean(meaning) && (
            <p className="mt-5 font-serif text-base italic leading-relaxed text-white">{clean(meaning)}</p>
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
  const t = useT()
  if (!heading && !text) return null
  const [main, ...others] = buttons ?? []
  return (
    <Section labelledBy="intro-title">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="fade-in">
          <PhotoCollage images={images ?? []} />
        </div>
        <div>
          <p className="mb-2 text-base font-semibold uppercase tracking-widest text-brown-700">{t.introEyebrow}</p>
          <h2 id="intro-title">{clean(heading)}</h2>
          {clean(text) && <p className="mt-4 whitespace-pre-line">{clean(text)}</p>}
          {main ? (
            <div className="mt-8 flex flex-wrap gap-3">
              {others.map((b) => (
                <ButtonLink key={b.href + b.label} href={b.href} variant="outline">
                  {b.label}
                </ButtonLink>
              ))}
              <ButtonLink href={main.href}>{main.label} →</ButtonLink>
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
  const t = useT()
  const text = clean(quote)
  if (!text) return null
  return (
    <Section tone="warm" labelledBy="quote-title">
      <h2 id="quote-title" className="sr-only">
        {t.fromTeachers}
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
  const t = useT()
  if (!featured?.verse) return null
  const { verse } = featured
  return (
    <section aria-labelledby="verse-title" className="relative isolate overflow-hidden bg-cream-100 py-section">
      <LotusMandala className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[38rem] w-[38rem] -translate-x-1/2 -translate-y-1/2 text-saffron-500 opacity-[0.07]" />
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <p className="text-base font-semibold uppercase tracking-widest text-brown-700">{t.fromDhammapada}</p>
        <h2 id="verse-title" className="sr-only">
          {clean(verse.reference) || t.featuredVerse}
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
          {t.readStory}
          <span className="sr-only">: {featured.title}</span> →
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
  const t = useT()
  if (!programs.length) return null
  return (
    <Section tone="warm" labelledBy="programs-title">
      <SectionHeading
        id="programs-title"
        eyebrow={t.programsEyebrow}
        title={t.programsTitle}
        intro={clean(intro)}
        action={
          <div className="w-full">
            <ButtonLink href="/programs/" variant="outline">
              {t.allPrograms}
            </ButtonLink>
          </div>
        }
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {programs.map((p) => (
          <ProgramCard key={p._id} program={p} outlineButton />
        ))}
      </div>
    </Section>
  )
}

/* 6. Upcoming events. The whole section hides when there are none. */
export function EventsSection({ events, hasPastEvents }: { events: EventCardData[]; hasPastEvents: boolean }) {
  const t = useT()
  if (!events.length) return null
  return (
    <Section labelledBy="events-title">
      <SectionHeading
        id="events-title"
        eyebrow={t.eventsEyebrow}
        title={t.upcomingEvents}
        action={
          hasPastEvents ? (
            <ButtonLink href="/events/past/" variant="outline">
              {t.pastEvents}
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

/* 7. Our teachers */
export function TeachersSection({ teachers }: { teachers: TeacherCardData[] }) {
  const t = useT()
  if (!teachers.length) return null
  return (
    <Section tone="warm" labelledBy="teachers-title">
      <SectionHeading
        id="teachers-title"
        eyebrow={t.guidance}
        title={t.teachersTitle}
        action={
          <div className="w-full">
            <ButtonLink href="/teachers/" variant="outline">
              {t.readTeachers}
            </ButtonLink>
          </div>
        }
      />
      {/* Flex wrap, not grid, so a short last row (e.g. 3 + 2) sits centered. */}
      <div className="flex flex-wrap justify-center gap-6 text-center">
        {teachers.map((teacher) => (
          <div key={teacher._id} className="w-full sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]">
            <TeacherCard teacher={teacher} />
          </div>
        ))}
      </div>
    </Section>
  )
}

/* 8. Residing venerables: only those staying with us today. Same grid as Our teachers. */
export function VenerablesSection({
  venerables,
  intro,
}: {
  venerables: (TeacherCardData & { residencyStart: string | null; residencyEnd: string | null })[]
  intro: string | null | undefined
}) {
  const t = useT()
  const lang = useLang()
  if (!venerables.length) return null
  const first = venerables[0]
  const period = first?.residencyStart ? formatDateRange(first.residencyStart, first.residencyEnd, lang) : ''
  return (
    <Section labelledBy="venerables-title">
      <SectionHeading
        id="venerables-title"
        eyebrow={period ? `${t.residingWithUs} · ${period}` : t.residingWithUs}
        title={t.residingVenerables}
        intro={clean(intro)}
        action={
          <div className="w-full">
            <ButtonLink href="/residing-venerables/" variant="outline">
              {t.moreResidency}
            </ButtonLink>
          </div>
        }
      />
      {/* Tablet: flex wrap, three per row, so a short last row (e.g. 3 + 2) sits centered. */}
      <ul
        className="flex flex-wrap justify-center gap-6 lg:grid lg:auto-cols-fr lg:grid-flow-col"
        aria-label={t.residingVenerables}
      >
        {venerables.map((v) => (
          <li key={v._id} className="w-full sm:max-lg:w-[calc((100%-3rem)/3)]">
            <article className="flex h-full flex-row overflow-hidden rounded-card border border-gold-400/30 bg-white/70 text-center shadow-sm sm:flex-col">
              {/* Phones: small photo beside the name, like the teacher cards. */}
              <div className="w-28 shrink-0 sm:w-full">
                <TeacherPhoto
                  photo={v.photo}
                  name={v.fullName}
                  sizes="(min-width: 1024px) 22rem, (min-width: 640px) 30vw, 7rem"
                  className="h-full sm:h-auto"
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-center p-4 sm:justify-start">
                <p className="text-base font-semibold uppercase tracking-wider text-brown-700">{t.venerable}</p>
                <h3 className="mt-1 text-lg leading-snug">{v.fullName}</h3>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </Section>
  )
}

/* 9. Latest articles */
export function LatestArticles({ articles }: { articles: ArticleCardData[] }) {
  const t = useT()
  if (!articles.length) return null
  return (
    <Section labelledBy="articles-title">
      <SectionHeading
        id="articles-title"
        eyebrow={t.blogEyebrow}
        title={t.blogTitle}
        action={
          <div className="w-full">
            <ButtonLink href="/blog/" variant="outline">
              {t.allArticles}
            </ButtonLink>
          </div>
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

/* 10. Newest Instagram photos (Behold feed). Hidden until a feed link is set in the Studio. */
export function InstagramSection({
  feed,
  heading,
}: {
  feed: InstagramFeed | null
  heading: string | null | undefined
}) {
  const t = useT()
  if (!feed?.posts.length) return null
  const profileUrl = feed.username ? `https://www.instagram.com/${encodeURIComponent(feed.username)}/` : null
  return (
    <Section labelledBy="instagram-title">
      <SectionHeading
        id="instagram-title"
        eyebrow={feed.username ? `Instagram · @${feed.username}` : 'Instagram'}
        title={clean(heading) || t.instagramTitle}
        action={
          profileUrl ? (
            <ButtonLink href={profileUrl} variant="outline">
              {t.followInstagram}
            </ButtonLink>
          ) : undefined
        }
      />
      <ul className="grid grid-cols-3 gap-1.5 sm:gap-3 lg:gap-4" aria-label={t.newestInstagram}>
        {feed.posts.map((post) => (
          <li key={post.id}>
            <a
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block aspect-square overflow-hidden rounded-md bg-cream-100 sm:rounded-card"
            >
              <img
                src={post.src}
                srcSet={post.srcSet || undefined}
                sizes="(min-width: 1280px) 400px, 33vw"
                alt={post.alt}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {post.isVideo && (
                <svg
                  viewBox="0 0 24 24"
                  className="absolute right-2 top-2 h-5 w-5 text-white drop-shadow sm:h-6 sm:w-6"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M8 5.5v13l11-6.5z" />
                </svg>
              )}
            </a>
          </li>
        ))}
      </ul>
    </Section>
  )
}
