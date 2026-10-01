import { createFileRoute } from '@tanstack/react-router'
import { buildHead, breadcrumbs, rootSettings } from '~/lib/seo'
import { getPage } from '~/lib/sanity/api'
import { PageView } from '~/components/page/PageView'

export const Route = createFileRoute('/about')({
  loader: () => getPage({ data: { slug: 'about' } }),
  head: ({ matches, loaderData: page }) =>
    buildHead({
      title: page?.title || 'About Us',
      description: page?.intro,
      seo: page?.seo,
      image: page?.body?.[0]?.images?.[0],
      path: '/about/',
      settings: rootSettings(matches),
      jsonLd: [breadcrumbs([['About Us', '/about/']])],
    }),
  component: function Page() {
    return <PageView page={Route.useLoaderData()} fallbackTitle="About Us" />
  },
})
