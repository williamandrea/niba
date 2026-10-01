import { createFileRoute } from '@tanstack/react-router'
import { buildHead, breadcrumbs, rootSettings } from '~/lib/seo'
import { getPage } from '~/lib/sanity/api'
import { PageView } from '~/components/page/PageView'

export const Route = createFileRoute('/chanting')({
  loader: () => getPage({ data: { slug: 'chanting' } }),
  head: ({ matches, loaderData: page }) =>
    buildHead({
      title: page?.title || 'Chanting',
      description: page?.intro,
      seo: page?.seo,
      image: page?.body?.[0]?.images?.[0],
      path: '/chanting/',
      settings: rootSettings(matches),
      jsonLd: [breadcrumbs([['Chanting', '/chanting/']])],
    }),
  component: function Page() {
    return <PageView page={Route.useLoaderData()} fallbackTitle="Chanting" />
  },
})
