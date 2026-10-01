import { createFileRoute, notFound, redirect } from '@tanstack/react-router'
import { buildHead, breadcrumbs, rootSettings } from '~/lib/seo'
import { getPage } from '~/lib/sanity/api'
import { PAGE_SLUG_PATHS } from '~/lib/paths'
import { PageView } from '~/components/page/PageView'

/** Any other Sanity `page`, at /<slug>/. */
export const Route = createFileRoute('/$slug')({
  loader: async ({ params }) => {
    const special = PAGE_SLUG_PATHS[params.slug]
    if (special && special !== `/${params.slug}/`)
      // CMS paths are plain strings, so they can't be checked against the route tree.
      throw redirect({ to: special as '/', statusCode: 301 })
    const page = await getPage({ data: { slug: params.slug } })
    if (!page) throw notFound()
    return page
  },
  head: ({ matches, loaderData: page }) =>
    page
      ? buildHead({
          title: page.title,
          description: page.intro,
          seo: page.seo,
          image: page.body?.[0]?.images?.[0],
          path: `/${page.slug}/`,
          settings: rootSettings(matches),
          jsonLd: [breadcrumbs([[page.title, `/${page.slug}/`]])],
        })
      : {},
  component: function GenericPage() {
    return <PageView page={Route.useLoaderData()} fallbackTitle="" />
  },
})
