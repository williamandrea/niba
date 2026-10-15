import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import { buildHead, breadcrumbs, headContext } from '~/lib/seo'
import { getNiba } from '~/lib/sanity/api'
import { langDeps, useT } from '~/lib/i18n'
import { PageHeader } from '~/components/ui/PageHeader'
import { PageSections } from '~/components/page/PageSections'
import { NibaProgram } from '~/components/page/NibaProgram'

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
  const body = page?.body ?? []
  // Class times go just above the parents' FAQ (section key "faq"), or last if there is none.
  const faqIndex = body.findIndex((s) => s._key === 'faq')
  const split = faqIndex === -1 ? body.length : faqIndex
  return (
    <>
      <PageHeader eyebrow="NIBA" title={page?.title || t.aboutNiba} intro={page?.intro || program?.shortDescription} />
      <PageSections sections={body.slice(0, split)} />
      <NibaProgram program={program} fallbackContacts={footer.contacts} />
      <PageSections sections={body.slice(split)} />
    </>
  )
}
