import { createFileRoute } from '@tanstack/react-router'
import { getTeachers } from '~/lib/sanity/api'
import { PageHeader } from '~/components/ui/PageHeader'
import { PageSections } from '~/components/page/PageSections'
import { TeacherCard } from '~/components/cards/TeacherCard'

export const Route = createFileRoute('/teachers')({
  loader: () => getTeachers(),
  component: TeachersPage,
})

function TeachersPage() {
  const { teachers, page } = Route.useLoaderData()
  return (
    <>
      <PageHeader
        eyebrow="About"
        title={page?.title || 'Our Teachers'}
        intro={page?.intro || 'The venerable teachers who guide our community.'}
      />
      <section aria-label="Teachers" className="py-section">
        <div className="mx-auto grid max-w-5xl gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
          {teachers.map((t) => (
            <TeacherCard key={t._id} teacher={t} showBio headingLevel={2} />
          ))}
        </div>
      </section>
      <PageSections sections={page?.body} />
    </>
  )
}
