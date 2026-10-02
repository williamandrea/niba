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
        <div className="mx-auto max-w-site px-4 sm:px-6">
          {/* Flex wrap, not grid, so a short last row (e.g. 3 + 2) sits centered. */}
          <div className="flex flex-wrap justify-center gap-6">
            {teachers.map((t) => (
              <div key={t._id} className="w-full sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]">
                <TeacherCard teacher={t} showBio headingLevel={2} />
              </div>
            ))}
          </div>
        </div>
      </section>
      <PageSections sections={page?.body} />
    </>
  )
}
