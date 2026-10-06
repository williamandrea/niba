import { Link, createFileRoute } from '@tanstack/react-router'
import { buildHead, breadcrumbs, headContext } from '~/lib/seo'
import { getChantingPage } from '~/lib/sanity/api'
import { langDeps, useT } from '~/lib/i18n'
import { clean } from '~/lib/text'
import { ArticleHeader, RelatedArticles } from '~/components/article/ArticleLayout'
import { RichText } from '~/components/portable-text/RichText'

/** A paritta `page`, at /chanting/<slug>/, laid out like a blog post. */
export const Route = createFileRoute('/chanting/$slug')({
  loaderDeps: langDeps,
  loader: ({ params, deps: { lang } }) => getChantingPage({ data: { slug: params.slug, lang } }),
  head: ({ matches, loaderData: page }) => {
    if (!page) return {}
    const { settings, lang, t } = headContext(matches)
    const path = `/chanting/${page.slug}/`
    return buildHead({
      title: page.title,
      description: page.intro,
      seo: page.seo,
      path,
      settings,
      jsonLd: [
        breadcrumbs(
          [
            [t.chanting, '/chanting/'],
            [page.title, path],
          ],
          lang,
        ),
      ],
    })
  },
  component: ChantingPage,
})

function ChantingPage() {
  const page = Route.useLoaderData()
  const t = useT()
  const category = { title: t.chanting, slug: 'chanting' }
  return (
    <>
      <article>
        <ArticleHeader
          title={page.title}
          crumbs={[
            <Link
              to="/chanting/"
              activeOptions={{ exact: true }}
              className="inline-flex min-h-11 items-center font-semibold text-brown-700 hover:underline"
            >
              {t.chanting}
            </Link>,
          ]}
        >
          {clean(page.intro)}
        </ArticleHeader>
        <div className="mx-auto max-w-site px-4 py-12 sm:px-6">
          {page.body?.map((section) => (
            <section key={section._key}>
              {clean(section.heading) && <h2 className="mb-5">{clean(section.heading)}</h2>}
              <RichText value={section.content} className="prose-nu max-w-none" />
            </section>
          ))}
        </div>
      </article>
      <RelatedArticles
        title={t.moreArticles(t.chanting)}
        articles={page.related.map((p) => ({ ...p, category, coverImage: null, excerpt: p.intro }))}
      />
    </>
  )
}
