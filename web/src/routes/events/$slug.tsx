import { Link, createFileRoute, useLoaderData } from '@tanstack/react-router'
import { getEvent } from '~/lib/sanity/api'
import { formatDateRange } from '~/lib/dates'
import { EVENT_TYPE_LABELS } from '~/lib/labels'
import { clean } from '~/lib/text'
import { PageHeader } from '~/components/ui/PageHeader'
import { SanityImage } from '~/components/ui/SanityImage'
import { RichText } from '~/components/portable-text/RichText'
import { AudienceBadge } from '~/components/cards/ProgramCard'
import { WhatsAppButtons } from '~/components/ui/WhatsApp'

export const Route = createFileRoute('/events/$slug')({
  loader: ({ params }) => getEvent({ data: { slug: params.slug } }),
  component: EventPage,
})

function EventPage() {
  const { event, today } = Route.useLoaderData()
  const { footer } = useLoaderData({ from: '__root__' })
  const isPast = (event.endDate ?? event.startDate) < today
  const contacts = event.contacts?.length ? event.contacts : footer.contacts
  return (
    <article>
      <PageHeader eyebrow={EVENT_TYPE_LABELS[event.type] ?? 'Event'} title={event.title} />
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
          aria-label="Event details"
          className="h-fit rounded-card border border-gold-400/30 bg-white/70 p-6 shadow-sm lg:sticky lg:top-28"
        >
          {isPast && (
            <p className="mb-4 rounded-lg bg-cream-100 px-3 py-2 font-semibold text-brown-700">This event has ended.</p>
          )}
          <dl className="space-y-4">
            <div>
              <dt className="font-semibold text-brown-900">When</dt>
              <dd>{formatDateRange(event.startDate, event.endDate)}</dd>
            </div>
            {event.sessions && event.sessions.length > 0 && (
              <div>
                <dt className="font-semibold text-brown-900">Sessions</dt>
                {event.sessions.map((s) => (
                  <dd key={s._key}>
                    {s.label}: {formatDateRange(s.start, s.end)}
                  </dd>
                ))}
              </div>
            )}
            {clean(event.guide) && (
              <div>
                <dt className="font-semibold text-brown-900">Guided by</dt>
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
              <dt className="sr-only">Who can join</dt>
              <dd>
                <AudienceBadge audience={event.audience} />
              </dd>
            </div>
          </dl>
          {!isPast && (
            <div className="mt-6">
              <p className="mb-3 font-semibold text-brown-900">Questions or registration</p>
              <WhatsAppButtons contacts={contacts} message={`Hello, I'd like to ask about ${event.title}.`} />
            </div>
          )}
          <Link
            to={isPast ? '/events/past/' : '/events/'}
            className="mt-6 inline-flex min-h-11 items-center font-semibold text-brown-700 hover:underline"
          >
            ← {isPast ? 'All past events' : 'All upcoming events'}
          </Link>
        </aside>
      </div>
    </article>
  )
}
