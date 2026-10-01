import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import { buildHead, breadcrumbs, rootSettings } from '~/lib/seo'
import { getNiba } from '~/lib/sanity/api'
import { PageHeader } from '~/components/ui/PageHeader'
import { PageSections } from '~/components/page/PageSections'
import { NibaProgram } from '~/components/page/NibaProgram'

export const Route = createFileRoute('/niba/registration')({
  loader: () => getNiba({ data: { slug: 'niba-registration' } }),
  head: ({ matches, loaderData }) =>
    buildHead({
      title: loaderData?.page?.title || 'NIBA Registration',
      description:
        loaderData?.page?.intro || 'Register your child for NIBA, our Sunday Dhamma school, through WhatsApp.',
      seo: loaderData?.page?.seo,
      path: '/niba/registration/',
      settings: rootSettings(matches),
      jsonLd: [
        breadcrumbs([
          ['NIBA', '/niba/'],
          ['Registration', '/niba/registration/'],
        ]),
      ],
    }),
  component: RegistrationPage,
})

function RegistrationPage() {
  const { page, program } = Route.useLoaderData()
  const { footer } = useLoaderData({ from: '__root__' })
  return (
    <>
      <PageHeader
        eyebrow="NIBA"
        title={page?.title || 'NIBA Registration'}
        intro={page?.intro || 'Register your child through WhatsApp.'}
      />
      <NibaProgram program={program} fallbackContacts={footer.contacts} heading="When we meet" />
      <PageSections sections={page?.body} />
    </>
  )
}
