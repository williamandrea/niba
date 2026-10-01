import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import { buildHead, breadcrumbs, headContext } from '~/lib/seo'
import { getNiba } from '~/lib/sanity/api'
import { langDeps, useT } from '~/lib/i18n'
import { PageHeader } from '~/components/ui/PageHeader'
import { PageSections } from '~/components/page/PageSections'
import { NibaProgram } from '~/components/page/NibaProgram'
import { ButtonLink } from '~/components/ui/Button'

export const Route = createFileRoute('/niba/')({
  loaderDeps: langDeps,
  loader: ({ deps: { lang } }) => getNiba({ data: { slug: 'niba', lang } }),
  head: ({ matches, loaderData }) => {
    const { settings, lang, t } = headContext(matches)
    return buildHead({
      title: loaderData?.page?.title || t.aboutNiba,
      description: loaderData?.page?.intro || loaderData?.program?.shortDescription,
      seo: loaderData?.page?.seo,
      image: loaderData?.page?.body?.[0]?.images?.[0],
      path: '/niba/',
      settings,
      jsonLd: [breadcrumbs([['NIBA', '/niba/']], lang)],
    })
  },
  component: NibaPage,
})

function NibaPage() {
  const { page, program } = Route.useLoaderData()
  const { footer } = useLoaderData({ from: '__root__' })
  const t = useT()
  return (
    <>
      <PageHeader eyebrow="NIBA" title={page?.title || t.aboutNiba} intro={page?.intro || program?.shortDescription} />
      <PageSections sections={page?.body} />
      <NibaProgram program={program} fallbackContacts={footer.contacts} />
      <div className="mx-auto max-w-site px-4 py-12 text-center sm:px-6">
        <ButtonLink href="/niba/registration/">{t.howToRegister}</ButtonLink>
      </div>
    </>
  )
}
