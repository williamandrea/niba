import { createFileRoute } from '@tanstack/react-router'
import { getPrograms } from '~/lib/sanity/api'
import { PageHeader } from '~/components/ui/PageHeader'
import { PageSections } from '~/components/page/PageSections'
import { ProgramCard } from '~/components/cards/ProgramCard'

export const Route = createFileRoute('/programs')({
  loader: () => getPrograms(),
  component: ProgramsPage,
})

function ProgramsPage() {
  const { programs, page } = Route.useLoaderData()
  return (
    <>
      <PageHeader
        title={page?.title || 'Our Programs'}
        intro={
          page?.intro ||
          'Weekly Dhamma classes and meditation. Everyone is welcome, and all programs are free of charge.'
        }
      />
      <section aria-label="Programs" className="py-section">
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
