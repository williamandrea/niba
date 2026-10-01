import { createFileRoute } from '@tanstack/react-router'
import { buildHead, breadcrumbs, headContext } from '~/lib/seo'
import { langDeps, useT } from '~/lib/i18n'
import { getEvents } from '~/lib/sanity/api'
import { PageHeader } from '~/components/ui/PageHeader'
import { PageSections } from '~/components/page/PageSections'
import { EventCard } from '~/components/cards/EventCard'
import { ButtonLink } from '~/components/ui/Button'

export const Route = createFileRoute('/events/')({
  loaderDeps: langDeps,
  loader: ({ deps: { lang } }) => getEvents({ data: { lang } }),
  head: ({ matches, loaderData }) => {
    const { settings, lang, t } = headContext(matches)
    return buildHead({
      title: loaderData?.page?.title || t.upcomingEventsTitle,
      description: loaderData?.page?.intro || t.eventsDescription,
      seo: loaderData?.page?.seo,
      path: '/events/',
      settings,
      jsonLd: [breadcrumbs([[t.events, '/events/']], lang)],
    })
  },
  component: UpcomingEventsPage,
})

function UpcomingEventsPage() {
  const { upcoming, past, page } = Route.useLoaderData()
  const t = useT()
  return (
    <>
      <PageHeader title={page?.title || t.upcomingEventsTitle} intro={page?.intro || t.eventsIntro} />
      <section aria-label={t.upcomingEvents} className="py-section">
        <div className="mx-auto max-w-site px-4 sm:px-6">
          {upcoming.length ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((e) => (
                <EventCard key={e._id} event={e} />
              ))}
            </div>
          ) : (
            <p className="max-w-xl text-lg">{t.noUpcomingEvents}</p>
          )}
          {past.length > 0 && (
            <div className="mt-12">
              <ButtonLink href="/events/past/" variant="outline">
                {t.seePastEvents}
              </ButtonLink>
            </div>
          )}
        </div>
      </section>
      <PageSections sections={page?.body} />
    </>
  )
}
