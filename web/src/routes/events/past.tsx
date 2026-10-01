import { createFileRoute } from '@tanstack/react-router'
import { getEvents } from '~/lib/sanity/api'
import { PageHeader } from '~/components/ui/PageHeader'
import { EventCard } from '~/components/cards/EventCard'
import { ButtonLink } from '~/components/ui/Button'

export const Route = createFileRoute('/events/past')({
  loader: () => getEvents(),
  component: PastEventsPage,
})

function PastEventsPage() {
  const { past, upcoming } = Route.useLoaderData()
  return (
    <>
      <PageHeader
        eyebrow="Events"
        title="Past Events"
        intro="A look back at retreats and programs we have shared together."
      />
      <section aria-label="Past events" className="py-section">
        <div className="mx-auto max-w-site px-4 sm:px-6">
          {past.length ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {past.map((e) => (
                <EventCard key={e._id} event={e} past />
              ))}
            </div>
          ) : (
            <p className="text-lg">No past events yet.</p>
          )}
          {upcoming.length > 0 && (
            <div className="mt-12">
              <ButtonLink href="/events/">See upcoming events</ButtonLink>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
