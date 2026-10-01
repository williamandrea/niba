import { createFileRoute } from '@tanstack/react-router'
import { buildHead, breadcrumbs, rootSettings } from '~/lib/seo'
import { getEvents } from '~/lib/sanity/api'
import { PageHeader } from '~/components/ui/PageHeader'
import { PageSections } from '~/components/page/PageSections'
import { EventCard } from '~/components/cards/EventCard'
import { ButtonLink } from '~/components/ui/Button'

export const Route = createFileRoute('/events/')({
  loader: () => getEvents(),
  head: ({ matches, loaderData }) =>
    buildHead({
      title: loaderData?.page?.title || 'Upcoming Events',
      description:
        loaderData?.page?.intro || 'Retreats, pabbajjā programs, and Dhamma talks at Na Uyana Aranya Indonesia.',
      seo: loaderData?.page?.seo,
      path: '/events/',
      settings: rootSettings(matches),
      jsonLd: [breadcrumbs([['Events', '/events/']])],
    }),
  component: UpcomingEventsPage,
})

function UpcomingEventsPage() {
  const { upcoming, past, page } = Route.useLoaderData()
  return (
    <>
      <PageHeader
        title={page?.title || 'Upcoming Events'}
        intro={page?.intro || 'Retreats, pabbajjā programs, and Dhamma talks.'}
      />
      <section aria-label="Upcoming events" className="py-section">
        <div className="mx-auto max-w-site px-4 sm:px-6">
          {upcoming.length ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((e) => (
                <EventCard key={e._id} event={e} />
              ))}
            </div>
          ) : (
            <p className="max-w-xl text-lg">
              There are no upcoming events right now. New events are announced here and on our Instagram.
            </p>
          )}
          {past.length > 0 && (
            <div className="mt-12">
              <ButtonLink href="/events/past/" variant="outline">
                See past events
              </ButtonLink>
            </div>
          )}
        </div>
      </section>
      <PageSections sections={page?.body} />
    </>
  )
}
