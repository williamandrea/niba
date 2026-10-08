import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { buildHead, breadcrumbs, headContext } from '~/lib/seo'
import { parseLang, useT } from '~/lib/i18n'
import { useState, type FormEvent } from 'react'
import { getPostList } from '~/lib/sanity/api'
import { ArticleCard } from '~/components/cards/ArticleCard'
import { PageHeader } from '~/components/ui/PageHeader'
import { Pagination } from '~/components/ui/Pagination'

type BlogSearch = { q?: string; category?: string; page?: number }

export const Route = createFileRoute('/blog/')({
  validateSearch: (search: Record<string, unknown>): BlogSearch => {
    const page = Number(search.page)
    return {
      q: typeof search.q === 'string' && search.q.trim() ? search.q.trim().slice(0, 80) : undefined,
      category: typeof search.category === 'string' && search.category ? search.category : undefined,
      page: Number.isInteger(page) && page > 1 ? page : undefined,
    }
  },
  loaderDeps: ({ search }) => ({
    q: search.q,
    category: search.category,
    page: search.page,
    lang: parseLang(search.lang),
  }),
  loader: ({ deps }) => getPostList({ data: deps }),
  head: ({ matches, match, loaderData }) => {
    const { settings, lang, t } = headContext(matches)
    const category = loaderData?.categories.find((c) => c.slug === match.search.category)
    const currentPage = loaderData?.currentPage ?? 1
    // Each category and page is its own address for search engines, so articles
    // on later pages get found. Same parameter order as the links on the page.
    const params = new URLSearchParams()
    if (category) params.set('category', category.slug)
    if (currentPage > 1) params.set('page', String(currentPage))
    const path = params.size ? `/blog/?${params}` : '/blog/'
    const title = loaderData?.page?.title || t.articles
    return buildHead({
      title: [category?.title, title, currentPage > 1 && t.pageNumber(currentPage)].filter(Boolean).join(' – '),
      description: loaderData?.page?.intro || t.blogDescription,
      seo: category || currentPage > 1 ? { ...loaderData?.page?.seo, title: null } : loaderData?.page?.seo,
      path,
      settings,
      jsonLd: [
        breadcrumbs(
          category
            ? [
                [t.articles, '/blog/'],
                [category.title, `/blog/?category=${category.slug}`],
              ]
            : [[t.articles, '/blog/']],
          lang,
        ),
      ],
      // Search results and unknown categories are not pages to show in Google.
      noindex: Boolean(match.search.q) || Boolean(match.search.category && !category) || loaderData?.total === 0,
    })
  },
  component: BlogPage,
})

function BlogPage() {
  const data = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = useNavigate({ from: '/blog/' })
  const [query, setQuery] = useState(search.q ?? '')
  const t = useT()

  const submit = (e: FormEvent) => {
    e.preventDefault()
    navigate({ search: { category: search.category, q: query.trim() || undefined } })
  }

  const activeCategory = data.categories.find((c) => c.slug === search.category)
  return (
    <>
      <PageHeader
        eyebrow={t.resources}
        title={data.page?.title || t.articles}
        intro={data.page?.intro || t.blogDescription}
      />
      <section aria-label={t.findArticles} className="border-b border-gold-400/30 bg-cream-50">
        <div className="mx-auto flex max-w-site flex-col gap-4 px-4 py-6 sm:px-6 md:flex-row md:items-center md:justify-between">
          <form role="search" onSubmit={submit} className="flex w-full max-w-md gap-2">
            <label htmlFor="blog-search" className="sr-only">
              {t.searchArticles}
            </label>
            <input
              id="blog-search"
              type="search"
              name="q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="min-h-12 w-full min-w-0 rounded-full border-2 border-gold-400/50 bg-white px-5 text-base placeholder:text-ink/60 focus:border-saffron-600 focus:outline-none"
            />
            <button
              type="submit"
              className="min-h-12 shrink-0 rounded-full bg-saffron-600 px-5 font-semibold text-white hover:bg-brown-700"
            >
              {t.search}
            </button>
          </form>
          {data.categories.length > 0 && (
            <nav aria-label={t.categories}>
              <ul className="flex flex-wrap gap-2">
                <li>
                  <CategoryChip label={t.all} active={!search.category} search={{ q: search.q }} />
                </li>
                {data.categories.map((c) => (
                  <li key={c.slug}>
                    <CategoryChip
                      label={c.title}
                      active={search.category === c.slug}
                      search={{ q: search.q, category: c.slug }}
                    />
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </section>
      <section aria-label={t.articles} className="py-section">
        <div className="mx-auto max-w-site px-4 sm:px-6">
          <p className="mb-6 text-ink/80" aria-live="polite">
            {data.total === 0 ? t.noArticles : t.articleCount(data.total, activeCategory?.title, search.q)}
          </p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.posts.map((post) => (
              <ArticleCard key={post._id} article={post} headingLevel={2} />
            ))}
          </div>
          <Pagination
            current={data.currentPage}
            count={data.pageCount}
            search={{ q: search.q, category: search.category }}
          />
        </div>
      </section>
    </>
  )
}

function CategoryChip({ label, active, search }: { label: string; active: boolean; search: BlogSearch }) {
  return (
    <Link
      to="/blog/"
      search={search}
      aria-current={active ? 'page' : undefined}
      className={`inline-flex min-h-11 items-center rounded-full px-4 text-base font-semibold ${active ? 'bg-brown-900 text-cream-50' : 'border-2 border-gold-400/50 text-brown-900 hover:border-brown-900'}`}
    >
      {label}
    </Link>
  )
}
