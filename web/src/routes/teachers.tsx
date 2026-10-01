import { createFileRoute } from '@tanstack/react-router'
import { buildHead, breadcrumbs, headContext } from '~/lib/seo'
import { langDeps, useT } from '~/lib/i18n'
import { getTeachers } from '~/lib/sanity/api'
import { PageHeader } from '~/components/ui/PageHeader'
import { PageSections } from '~/components/page/PageSections'
import { TeacherCard } from '~/components/cards/TeacherCard'

export const Route = createFileRoute('/teachers')({
  loaderDeps: langDeps,
  loader: ({ deps: { lang } }) => getTeachers({ data: { lang } }),
  head: ({ matches, loaderData }) => {
    const { settings, lang, t } = headContext(matches)
    return buildHead({
      title: loaderData?.page?.title || t.ourTeachers,
      description: loaderData?.page?.intro || t.teachersDescription,
      seo: loaderData?.page?.seo,
      path: '/teachers/',
      settings,
      jsonLd: [breadcrumbs([[t.ourTeachers, '/teachers/']], lang)],
    })
  },
  component: TeachersPage,
})

function TeachersPage() {
  const { teachers, page } = Route.useLoaderData()
  const t = useT()
  return (
    <>
      <PageHeader eyebrow={t.about} title={page?.title || t.ourTeachers} intro={page?.intro || t.teachersIntro} />
      <section aria-label={t.teachers} className="py-section">
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
