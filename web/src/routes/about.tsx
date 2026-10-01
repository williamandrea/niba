import { createFileRoute } from '@tanstack/react-router'
import { buildHead, breadcrumbs, headContext } from '~/lib/seo'
import { getPage } from '~/lib/sanity/api'
import { langDeps, useT } from '~/lib/i18n'
import { PageView } from '~/components/page/PageView'

export const Route = createFileRoute('/about')({
  loaderDeps: langDeps,
  loader: ({ deps: { lang } }) => getPage({ data: { slug: 'about', lang } }),
  head: ({ matches, loaderData: page }) => {
    const { settings, lang, t } = headContext(matches)
    return buildHead({
      title: page?.title || t.aboutUs,
      description: page?.intro,
      seo: page?.seo,
      image: page?.body?.[0]?.images?.[0],
      path: '/about/',
      settings,
      jsonLd: [breadcrumbs([[t.aboutUs, '/about/']], lang)],
    })
  },
  component: function Page() {
    const t = useT()
    return <PageView page={Route.useLoaderData()} fallbackTitle={t.aboutUs} />
  },
})
