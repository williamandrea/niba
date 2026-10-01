import { Link, createFileRoute } from '@tanstack/react-router'
import { absoluteUrl, buildHead, breadcrumbs, ogImageUrl, rootSettings } from '~/lib/seo'
import { getPost } from '~/lib/sanity/api'
import { formatDate } from '~/lib/dates'
import { clean } from '~/lib/text'
import { ArticleCard } from '~/components/cards/ArticleCard'
import { RichText } from '~/components/portable-text/RichText'
import { SanityImage } from '~/components/ui/SanityImage'
import { LotusMandala } from '~/components/ui/LotusMandala'

export const Route = createFileRoute('/$category/$slug')({
  loader: ({ params }) => getPost({ data: { category: params.category, slug: params.slug } }),
  head: ({ matches, loaderData: post }) => {
    if (!post) return {}
    const settings = rootSettings(matches)
    const path = `/${post.category?.slug}/${post.slug}/`
    const image = ogImageUrl(post.seo?.ogImage) ?? ogImageUrl(post.coverImage)
    return buildHead({
      title: post.title,
      description: post.excerpt,
      seo: post.seo,
      image: post.coverImage,
      path,
      type: 'article',
      settings,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title,
          description: clean(post.seo?.description) || clean(post.excerpt) || undefined,
          datePublished: post.publishedAt,
          dateModified: post._updatedAt,
          mainEntityOfPage: absoluteUrl(path),
          ...(image ? { image } : {}),
          articleSection: post.category?.title,
          author: { '@type': 'Organization', name: settings?.siteName, url: absoluteUrl('/') },
          publisher: { '@id': `${absoluteUrl('/')}#organization` },
        },
        breadcrumbs([
          ['Articles', '/blog/'],
          [post.category?.title ?? 'Articles', `/blog/?category=${post.category?.slug}`],
          [post.title, path],
        ]),
      ],
    })
  },
  component: PostPage,
})

function PostPage() {
  const post = Route.useLoaderData()
  return (
    <>
      <article>
        <header className="relative isolate overflow-hidden bg-cream-100">
          <LotusMandala className="pointer-events-none absolute -right-20 -top-16 -z-10 h-80 w-80 text-saffron-500 opacity-[0.08]" />
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
            <nav aria-label="Breadcrumb" className="mb-4 text-base">
              <ol className="flex flex-wrap items-center gap-2 text-ink/80">
                <li>
                  <Link to="/blog/" className="inline-flex min-h-11 items-center hover:underline">
                    Articles
                  </Link>
                </li>
                {post.category && (
                  <>
                    <li aria-hidden="true">/</li>
                    <li>
                      <Link
                        to="/blog/"
                        search={{ category: post.category.slug }}
                        className="inline-flex min-h-11 items-center font-semibold text-brown-700 hover:underline"
                      >
                        {post.category.title}
                      </Link>
                    </li>
                  </>
                )}
              </ol>
            </nav>
            <h1>{post.title}</h1>
            <p className="mt-4 text-ink/80">
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            </p>
          </div>
        </header>
        {post.coverImage?.asset && (
          <div className="mx-auto max-w-4xl px-4 pt-10 sm:px-6">
            <SanityImage
              image={post.coverImage}
              sizes="(min-width: 896px) 56rem, 100vw"
              priority
              className="w-full rounded-card shadow-md"
            />
          </div>
        )}
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <RichText value={post.body} className="prose-nu max-w-none" />
        </div>
      </article>
      {post.related.length > 0 && (
        <section aria-labelledby="related-title" className="bg-cream-100 py-section">
          <div className="mx-auto max-w-site px-4 sm:px-6">
            <h2 id="related-title" className="mb-8">
              More {clean(post.category?.title) || 'articles'}
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {post.related.map((a) => (
                <ArticleCard key={a._id} article={a} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
