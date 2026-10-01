import { createFileRoute } from '@tanstack/react-router'
import { buildHead, breadcrumbs, rootSettings } from '~/lib/seo'
import { getPage } from '~/lib/sanity/api'
import { PageView } from '~/components/page/PageView'

export const Route = createFileRoute('/books')({
  loader: () => getPage({ data: { slug: 'books' } }),
  head: ({ matches, loaderData: page }) =>
    buildHead({
      title: page?.title || 'Books',
      description: page?.intro,
      seo: page?.seo,
      image: page?.body?.[0]?.images?.[0],
      path: '/books/',
      settings: rootSettings(matches),
      jsonLd: [breadcrumbs([['Books', '/books/']])],
    }),
  component: function Page() {
    return <PageView page={Route.useLoaderData()} fallbackTitle="Books" />
  },
})
