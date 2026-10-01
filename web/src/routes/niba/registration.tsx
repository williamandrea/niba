import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import { buildHead, breadcrumbs, headContext } from '~/lib/seo'
import { getNiba } from '~/lib/sanity/api'
import { langDeps, useT } from '~/lib/i18n'
import { PageHeader } from '~/components/ui/PageHeader'
import { PageSections } from '~/components/page/PageSections'
import { NibaProgram } from '~/components/page/NibaProgram'

export const Route = createFileRoute('/niba/registration')({
  loaderDeps: langDeps,
  loader: ({ deps: { lang } }) => getNiba({ data: { slug: 'niba-registration', lang } }),
  head: ({ matches, loaderData }) => {
    const { settings, lang, t } = headContext(matches)
    return buildHead({
      title: loaderData?.page?.title || t.nibaRegistrationTitle,
      description: loaderData?.page?.intro || t.nibaRegistrationDescription,
      seo: loaderData?.page?.seo,
      path: '/niba/registration/',
      settings,
      jsonLd: [
        breadcrumbs(
          [
            ['NIBA', '/niba/'],
            [t.registration, '/niba/registration/'],
          ],
          lang,
        ),
      ],
    })
  },
  component: RegistrationPage,
})

function RegistrationPage() {
  const { page, program } = Route.useLoaderData()
  const { footer } = useLoaderData({ from: '__root__' })
  const t = useT()
  return (
    <>
      <PageHeader
        eyebrow="NIBA"
        title={page?.title || t.nibaRegistrationTitle}
        intro={page?.intro || t.nibaRegistrationIntro}
      />
      <NibaProgram program={program} fallbackContacts={footer.contacts} heading={t.whenWeMeet} />
      <PageSections sections={page?.body} />
    </>
  )
}
