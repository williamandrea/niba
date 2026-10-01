import { createFileRoute } from '@tanstack/react-router'
import { buildHead, breadcrumbs, headContext } from '~/lib/seo'
import { langDeps, useT } from '~/lib/i18n'
import { getPrograms } from '~/lib/sanity/api'
import { PageHeader } from '~/components/ui/PageHeader'
import { PageSections } from '~/components/page/PageSections'
import { ProgramCard } from '~/components/cards/ProgramCard'

export const Route = createFileRoute('/programs')({
  loaderDeps: langDeps,
  loader: ({ deps: { lang } }) => getPrograms({ data: { lang } }),
  head: ({ matches, loaderData }) => {
    const { settings, lang, t } = headContext(matches)
    return buildHead({
      title: loaderData?.page?.title || t.ourPrograms,
      description: loaderData?.page?.intro || t.programsDescription,
      seo: loaderData?.page?.seo,
      path: '/programs/',
      settings,
      jsonLd: [breadcrumbs([[t.programs, '/programs/']], lang)],
    })
  },
  component: ProgramsPage,
})

function ProgramsPage() {
  const { programs, page } = Route.useLoaderData()
  const t = useT()
  return (
    <>
      <PageHeader title={page?.title || t.ourPrograms} intro={page?.intro || t.programsIntro} />
      <section aria-label={t.programs} className="py-section">
        <div className="mx-auto grid max-w-site gap-6 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((p) => (
            <ProgramCard key={p._id} program={p} headingLevel={2} showPhoto />
          ))}
        </div>
      </section>
      <PageSections sections={page?.body} />
    </>
  )
}
