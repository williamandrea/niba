import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
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
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => getPostList({ data: deps }),
  component: BlogPage,
})

function BlogPage() {
  const data = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = useNavigate({ from: '/blog/' })
  const [query, setQuery] = useState(search.q ?? '')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    navigate({ search: { category: search.category, q: query.trim() || undefined } })
  }

  const activeCategory = data.categories.find((c) => c.slug === search.category)
  return (
    <>
      <PageHeader
        eyebrow="Resources"
        title={data.page?.title || 'Articles'}
        intro={
          data.page?.intro || 'Stories and teachings from the Dhammapada and the Tipiṭaka, to read and reflect on.'
        }
      />
      <section aria-label="Find articles" className="border-b border-gold-400/30 bg-cream-50">
        <div className="mx-auto flex max-w-site flex-col gap-4 px-4 py-6 sm:px-6 md:flex-row md:items-center md:justify-between">
          <form role="search" onSubmit={submit} className="flex w-full max-w-md gap-2">
            <label htmlFor="blog-search" className="sr-only">
              Search articles
            </label>
            <input
              id="blog-search"
              type="search"
              name="q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles…"
              className="min-h-12 w-full min-w-0 rounded-full border-2 border-gold-400/50 bg-white px-5 text-base placeholder:text-ink/60 focus:border-saffron-600 focus:outline-none"
            />
            <button
              type="submit"
              className="min-h-12 shrink-0 rounded-full bg-saffron-600 px-5 font-semibold text-white hover:bg-brown-700"
            >
              Search
            </button>
          </form>
          {data.categories.length > 0 && (
            <nav aria-label="Categories">
              <ul className="flex flex-wrap gap-2">
                <li>
                  <CategoryChip label="All" active={!search.category} search={{ q: search.q }} />
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
      <section aria-label="Articles" className="py-section">
        <div className="mx-auto max-w-site px-4 sm:px-6">
          <p className="mb-6 text-ink/80" aria-live="polite">
            {data.total === 0
              ? 'No articles found.'
              : `${data.total} article${data.total === 1 ? '' : 's'}${activeCategory ? ` in ${activeCategory.title}` : ''}${search.q ? ` matching “${search.q}”` : ''}`}
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
