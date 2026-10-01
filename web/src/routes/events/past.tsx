import { createFileRoute } from '@tanstack/react-router'
import { buildHead, breadcrumbs, headContext } from '~/lib/seo'
import { langDeps, useT } from '~/lib/i18n'
import { getEvents } from '~/lib/sanity/api'
import { PageHeader } from '~/components/ui/PageHeader'
import { EventCard } from '~/components/cards/EventCard'
import { ButtonLink } from '~/components/ui/Button'

export const Route = createFileRoute('/events/past')({
  loaderDeps: langDeps,
  loader: ({ deps: { lang } }) => getEvents({ data: { lang } }),
  head: ({ matches }) => {
    const { settings, lang, t } = headContext(matches)
    return buildHead({
      title: t.pastEventsTitle,
      description: t.pastEventsDescription,
      path: '/events/past/',
      settings,
      jsonLd: [
        breadcrumbs(
          [
            [t.events, '/events/'],
            [t.pastEvents, '/events/past/'],
          ],
          lang,
        ),
      ],
    })
  },
  component: PastEventsPage,
})

function PastEventsPage() {
  const { past, upcoming } = Route.useLoaderData()
  const t = useT()
  return (
    <>
      <PageHeader eyebrow={t.events} title={t.pastEventsTitle} intro={t.pastEventsIntro} />
      <section aria-label={t.pastEvents} className="py-section">
        <div className="mx-auto max-w-site px-4 sm:px-6">
          {past.length ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {past.map((e) => (
                <EventCard key={e._id} event={e} past />
              ))}
            </div>
          ) : (
            <p className="text-lg">{t.noPastEvents}</p>
          )}
          {upcoming.length > 0 && (
            <div className="mt-12">
              <ButtonLink href="/events/">{t.seeUpcomingEvents}</ButtonLink>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
