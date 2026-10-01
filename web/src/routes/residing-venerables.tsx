import { createFileRoute } from '@tanstack/react-router'
import { buildHead, breadcrumbs, headContext } from '~/lib/seo'
import { langDeps, useLang, useT } from '~/lib/i18n'
import { getVenerables } from '~/lib/sanity/api'
import { formatDateRange } from '~/lib/dates'
import { PageHeader } from '~/components/ui/PageHeader'
import { PageSections } from '~/components/page/PageSections'
import { TeacherCard } from '~/components/cards/TeacherCard'

export const Route = createFileRoute('/residing-venerables')({
  loaderDeps: langDeps,
  loader: ({ deps: { lang } }) => getVenerables({ data: { lang } }),
  head: ({ matches, loaderData }) => {
    const { settings, lang, t } = headContext(matches)
    return buildHead({
      title: loaderData?.page?.title || t.residingVenerablesTitle,
      description: loaderData?.page?.intro || t.venerablesDescription,
      seo: loaderData?.page?.seo,
      path: '/residing-venerables/',
      settings,
      jsonLd: [breadcrumbs([[t.residingVenerablesTitle, '/residing-venerables/']], lang)],
    })
  },
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
  const t = useT()

  return (
    <>
      <PageHeader
        eyebrow={t.about}
        title={page?.title || t.residingVenerablesTitle}
        intro={page?.intro || t.venerablesIntro}
      />
      <Group id="current" title={t.residingNow} items={current} empty={t.noVenerables} />
      {upcoming.length > 0 && <Group id="upcoming" title={t.upcomingResidency} items={upcoming} warm />}
      <PageSections sections={page?.body} />
      {past.length > 0 && <Group id="past" title={t.previousResidencies} items={past} warm={upcoming.length === 0} />}
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
  const lang = useLang()
  const period = items[0]?.residencyStart ? formatDateRange(items[0].residencyStart, items[0].residencyEnd, lang) : ''
  return (
    <section aria-labelledby={`${id}-title`} className={`py-section ${warm ? 'bg-cream-100' : ''}`}>
      <div className="mx-auto max-w-site px-4 sm:px-6">
        <h2 id={`${id}-title`}>{title}</h2>
        {period && <p className="mt-2 font-semibold text-brown-700">{period}</p>}
        {items.length ? (
          // Flex wrap, not grid, so a short last row (e.g. 3 + 2) sits centered.
          <div className="mt-8 flex flex-wrap justify-center gap-6">
            {items.map((v) => (
              <div key={v._id} className="w-full sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]">
                <TeacherCard teacher={v} showBio />
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4">{empty}</p>
        )}
      </div>
    </section>
  )
}
