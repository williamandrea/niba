import { createFileRoute, notFound, redirect } from '@tanstack/react-router'
import { buildHead, breadcrumbs, headContext } from '~/lib/seo'
import { getPage } from '~/lib/sanity/api'
import { langDeps } from '~/lib/i18n'
import { pagePath } from '~/lib/paths'
import { PageView } from '~/components/page/PageView'

/** Any other Sanity `page`, at /<slug>/. */
export const Route = createFileRoute('/$slug')({
  loaderDeps: langDeps,
  loader: async ({ params, deps: { lang } }) => {
    const path = pagePath(params.slug)
    if (path !== `/${params.slug}/`)
      // CMS paths are plain strings, so they can't be checked against the route tree.
      throw redirect({ to: path as '/', statusCode: 301 })
    const page = await getPage({ data: { slug: params.slug, lang } })
    if (!page) throw notFound()
    return page
  },
  head: ({ matches, loaderData: page }) => {
    if (!page) return {}
    const { settings, lang } = headContext(matches)
    return buildHead({
      title: page.title,
      description: page.intro,
      seo: page.seo,
      image: page.body?.[0]?.images?.[0],
      path: `/${page.slug}/`,
      settings,
      jsonLd: [breadcrumbs([[page.title, `/${page.slug}/`]], lang)],
    })
  },
  component: function GenericPage() {
    return <PageView page={Route.useLoaderData()} fallbackTitle="" />
  },
})
