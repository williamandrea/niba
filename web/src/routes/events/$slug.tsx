import { Link, createFileRoute, useLoaderData } from '@tanstack/react-router'
import { absoluteUrl, buildHead, breadcrumbs, headContext, ogImageUrl } from '~/lib/seo'
import { LANG_TAGS, langDeps, useLang, useT } from '~/lib/i18n'
import { blocksToText } from '~/lib/portable-text'
import { getEvent } from '~/lib/sanity/api'
import { formatDateRange } from '~/lib/dates'
import { clean } from '~/lib/text'
import { PageHeader } from '~/components/ui/PageHeader'
import { SanityImage } from '~/components/ui/SanityImage'
import { RichText } from '~/components/portable-text/RichText'
import { AudienceBadge } from '~/components/cards/ProgramCard'
import { WhatsAppButtons } from '~/components/ui/WhatsApp'

export const Route = createFileRoute('/events/$slug')({
  loaderDeps: langDeps,
  loader: ({ params, deps: { lang } }) => getEvent({ data: { slug: params.slug, lang } }),
  head: ({ matches, loaderData }) => {
    if (!loaderData) return {}
    const { event } = loaderData
    const { settings, lang, t } = headContext(matches)
    const path = `/events/${event.slug}/`
    const image = ogImageUrl(event.seo?.ogImage) ?? ogImageUrl(event.image)
    const description = blocksToText(event.description).slice(0, 300)
    return buildHead({
      title: event.title,
      description,
      seo: event.seo,
      image: event.image,
      path,
      settings,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'Event',
          name: event.title,
          inLanguage: LANG_TAGS[lang].html,
          ...(description ? { description } : {}),
          startDate: event.startDate,
          endDate: event.endDate ?? event.startDate,
          eventStatus: 'https://schema.org/EventScheduled',
          eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
          ...(image ? { image: [image] } : {}),
          url: absoluteUrl(path, lang),
          location: {
            '@type': 'Place',
            name: settings?.siteName,
            address: clean(settings?.footer.address).replace(/\n/g, ', ') || 'Medan, Indonesia',
          },
          organizer: { '@type': 'Organization', name: settings?.siteName, url: absoluteUrl('/') },
          ...(clean(event.guide) ? { performer: { '@type': 'Person', name: clean(event.guide) } } : {}),
          isAccessibleForFree: true,
        },
        breadcrumbs(
          [
            [t.events, '/events/'],
            [event.title, path],
          ],
          lang,
        ),
      ],
    })
  },
  component: EventPage,
})

function EventPage() {
  const { event, today } = Route.useLoaderData()
  const { footer } = useLoaderData({ from: '__root__' })
  const isPast = (event.endDate ?? event.startDate) < today
  const contacts = event.contacts?.length ? event.contacts : footer.contacts
  const lang = useLang()
  const t = useT()
  return (
    <article>
      <PageHeader eyebrow={t.eventTypes[event.type] ?? t.event} title={event.title} />
      <div className="mx-auto grid max-w-site gap-10 px-4 py-section sm:px-6 lg:grid-cols-[1fr_22rem]">
        <div className="min-w-0">
          {event.image?.asset && (
            <SanityImage
              image={event.image}
              sizes="(min-width: 1024px) 44rem, 100vw"
              priority
              className="mb-10 w-full rounded-card shadow-md"
            />
          )}
          <RichText value={event.description} />
        </div>
        <aside
          aria-label={t.eventDetails}
          className="h-fit rounded-card border border-gold-400/30 bg-white/70 p-6 shadow-sm lg:sticky lg:top-28"
        >
          {isPast && (
            <p className="mb-4 rounded-lg bg-cream-100 px-3 py-2 font-semibold text-brown-700">{t.eventEnded}</p>
          )}
          <dl className="space-y-4">
            <div>
              <dt className="font-semibold text-brown-900">{t.when}</dt>
              <dd>{formatDateRange(event.startDate, event.endDate, lang)}</dd>
            </div>
            {event.sessions && event.sessions.length > 0 && (
              <div>
                <dt className="font-semibold text-brown-900">{t.sessions}</dt>
                {event.sessions.map((s) => (
                  <dd key={s._key}>
                    {s.label}: {formatDateRange(s.start, s.end, lang)}
                  </dd>
                ))}
              </div>
            )}
            {clean(event.guide) && (
              <div>
                <dt className="font-semibold text-brown-900">{t.guidedByLabel}</dt>
                <dd>
                  {event.guideSlug ? (
                    <Link
                      to="/teachers/"
                      hash={event.guideSlug}
                      className="underline underline-offset-4 hover:text-brown-700"
                    >
                      {clean(event.guide)}
                    </Link>
                  ) : (
                    clean(event.guide)
                  )}
                </dd>
              </div>
            )}
            <div>
              <dt className="sr-only">{t.whoCanJoin}</dt>
              <dd>
                <AudienceBadge audience={event.audience} />
              </dd>
            </div>
          </dl>
          {!isPast && (
            <div className="mt-6">
              <p className="mb-3 font-semibold text-brown-900">{t.questionsOrRegistration}</p>
              <WhatsAppButtons contacts={contacts} message={t.askAbout(event.title)} />
            </div>
          )}
          <Link
            to={isPast ? '/events/past/' : '/events/'}
            className="mt-6 inline-flex min-h-11 items-center font-semibold text-brown-700 hover:underline"
          >
            {isPast ? t.allPastEvents : t.allUpcomingEvents}
          </Link>
        </aside>
      </div>
    </article>
  )
}
