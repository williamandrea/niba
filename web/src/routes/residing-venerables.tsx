import { createFileRoute } from '@tanstack/react-router'
import { getVenerables } from '~/lib/sanity/api'
import { formatDateRange } from '~/lib/dates'
import { PageHeader } from '~/components/ui/PageHeader'
import { PageSections } from '~/components/page/PageSections'
import { TeacherCard } from '~/components/cards/TeacherCard'

export const Route = createFileRoute('/residing-venerables')({
  loader: () => getVenerables(),
  component: VenerablesPage,
})

type Venerable = ReturnType<typeof Route.useLoaderData>['venerables'][number]

function VenerablesPage() {
  const { venerables, page, today } = Route.useLoaderData()
  const isCurrent = (v: Venerable) =>
    Boolean(v.residencyStart && v.residencyStart <= today && (!v.residencyEnd || v.residencyEnd >= today))
  const current = venerables.filter(isCurrent)
  const upcoming = venerables.filter((v) => v.residencyStart && v.residencyStart > today)
  const past = venerables.filter((v) => v.residencyEnd && v.residencyEnd < today)

  return (
    <>
      <PageHeader
        eyebrow="About"
        title={page?.title || 'Residing Venerables'}
        intro={page?.intro || 'Venerable monks who stay with us for the rains retreat and teaching periods.'}
      />
      <Group
        id="current"
        title="Residing with us now"
        items={current}
        empty="No venerables are residing with us at the moment."
      />
      {upcoming.length > 0 && <Group id="upcoming" title="Coming soon" items={upcoming} warm />}
      <PageSections sections={page?.body} />
      {past.length > 0 && <Group id="past" title="Previous residencies" items={past} warm={upcoming.length === 0} />}
    </>
  )
}

function Group({
  id,
  title,
  items,
  empty,
  warm,
}: {
  id: string
  title: string
  items: Venerable[]
  empty?: string
  warm?: boolean
}) {
  const period = items[0]?.residencyStart ? formatDateRange(items[0].residencyStart, items[0].residencyEnd) : ''
  return (
    <section aria-labelledby={`${id}-title`} className={`py-section ${warm ? 'bg-cream-100' : ''}`}>
      <div className="mx-auto max-w-site px-4 sm:px-6">
        <h2 id={`${id}-title`}>{title}</h2>
        {period && <p className="mt-2 font-semibold text-brown-700">{period}</p>}
        {items.length ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((v) => (
              <TeacherCard key={v._id} teacher={v} showBio />
            ))}
          </div>
        ) : (
          <p className="mt-4">{empty}</p>
        )}
      </div>
    </section>
  )
}
