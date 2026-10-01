import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import { getNiba } from '~/lib/sanity/api'
import { PageHeader } from '~/components/ui/PageHeader'
import { PageSections } from '~/components/page/PageSections'
import { NibaProgram } from '~/components/page/NibaProgram'
import { ButtonLink } from '~/components/ui/Button'

export const Route = createFileRoute('/niba/')({
  loader: () => getNiba({ data: { slug: 'niba' } }),
  component: NibaPage,
})

function NibaPage() {
  const { page, program } = Route.useLoaderData()
  const { footer } = useLoaderData({ from: '__root__' })
  return (
    <>
      <PageHeader eyebrow="NIBA" title={page?.title || 'About NIBA'} intro={page?.intro || program?.shortDescription} />
      <PageSections sections={page?.body} />
      <NibaProgram program={program} fallbackContacts={footer.contacts} />
      <div className="mx-auto max-w-site px-4 py-12 text-center sm:px-6">
        <ButtonLink href="/niba/registration/">How to register</ButtonLink>
      </div>
    </>
  )
}
