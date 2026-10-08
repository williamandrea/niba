import { Link, createFileRoute } from '@tanstack/react-router'
import { absoluteUrl, buildHead, breadcrumbs, headContext, ogImageUrl } from '~/lib/seo'
import { LANG_TAGS, langDeps, useLang, useT } from '~/lib/i18n'
import { getPost } from '~/lib/sanity/api'
import { formatDate } from '~/lib/dates'
import { clean } from '~/lib/text'
import { ArticleHeader, RelatedArticles } from '~/components/article/ArticleLayout'
import { RichText } from '~/components/portable-text/RichText'
import { SanityImage } from '~/components/ui/SanityImage'

export const Route = createFileRoute('/$category/$slug')({
  loaderDeps: langDeps,
  loader: ({ params, deps: { lang } }) => getPost({ data: { category: params.category, slug: params.slug, lang } }),
  head: ({ matches, loaderData: post }) => {
    if (!post) return {}
    const { settings, lang, t } = headContext(matches)
    const path = `/${post.category?.slug}/${post.slug}/`
    const image = ogImageUrl(post.seo?.ogImage) ?? ogImageUrl(post.coverImage)
    return buildHead({
      title: post.title,
      description: post.excerpt,
      seo: post.seo,
      image: post.coverImage,
      path,
      type: 'article',
      published: post.publishedAt,
      modified: post._updatedAt,
      settings,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title,
          description: clean(post.seo?.description) || clean(post.excerpt) || undefined,
          inLanguage: LANG_TAGS[lang].html,
          datePublished: post.publishedAt,
          dateModified: post._updatedAt,
          mainEntityOfPage: absoluteUrl(path, lang),
          ...(image ? { image } : {}),
          articleSection: post.category?.title,
          author: { '@type': 'Organization', name: settings?.siteName, url: absoluteUrl('/') },
          publisher: { '@id': `${absoluteUrl('/')}#organization` },
        },
        breadcrumbs(
          [
            [t.articles, '/blog/'],
            [post.category?.title ?? t.articles, `/blog/?category=${post.category?.slug}`],
            [post.title, path],
          ],
          lang,
        ),
      ],
    })
  },
  component: PostPage,
})

function PostPage() {
  const post = Route.useLoaderData()
  const lang = useLang()
  const t = useT()
  return (
    <>
      <article>
        <ArticleHeader
          title={post.title}
          crumbs={[
            <Link to="/blog/" className="inline-flex min-h-11 items-center hover:underline">
              {t.articles}
            </Link>,
            post.category && (
              <Link
                to="/blog/"
                search={{ category: post.category.slug }}
                className="inline-flex min-h-11 items-center font-semibold text-brown-700 hover:underline"
              >
                {post.category.title}
              </Link>
            ),
          ].filter(Boolean)}
        >
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, lang)}</time>
        </ArticleHeader>
        {post.coverImage?.asset && (
          <div className="mx-auto max-w-site px-4 pt-10 sm:px-6">
            <SanityImage
              image={post.coverImage}
              sizes="(min-width: 1152px) 72rem, 100vw"
              priority
              className="w-full rounded-card shadow-md"
            />
          </div>
        )}
        <div className="mx-auto max-w-site px-4 py-12 sm:px-6">
          <RichText value={post.body} className="prose-nu max-w-none" />
        </div>
      </article>
      <RelatedArticles title={t.moreArticles(clean(post.category?.title))} articles={post.related} />
    </>
  )
}
