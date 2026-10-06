import { Fragment, type ReactNode } from 'react'
import { useT } from '~/lib/i18n'
import { ArticleCard, type ArticleCardData } from '~/components/cards/ArticleCard'
import { LotusMandala } from '~/components/ui/LotusMandala'

/** Title band of an article: breadcrumb links, the page's h1 and a line under it. */
export function ArticleHeader({
  crumbs,
  title,
  children,
}: {
  crumbs: ReactNode[]
  title: string
  children?: ReactNode
}) {
  const t = useT()
  return (
    <header className="relative isolate overflow-hidden bg-cream-100">
      <LotusMandala className="pointer-events-none absolute -right-20 -top-16 -z-10 h-80 w-80 text-saffron-500 opacity-[0.08]" />
      <div className="mx-auto max-w-site px-4 py-12 sm:px-6 sm:py-16">
        <nav aria-label={t.breadcrumb} className="mb-4 text-base">
          <ol className="flex flex-wrap items-center gap-2 text-ink/80">
            {crumbs.map((crumb, i) => (
              <Fragment key={i}>
                {i > 0 && <li aria-hidden="true">/</li>}
                <li>{crumb}</li>
              </Fragment>
            ))}
          </ol>
        </nav>
        <h1>{title}</h1>
        {children && <p className="mt-4 text-ink/80">{children}</p>}
      </div>
    </header>
  )
}

/** "More …" cards under an article. */
export function RelatedArticles({ title, articles }: { title: string; articles: ArticleCardData[] }) {
  if (!articles.length) return null
  return (
    <section aria-labelledby="related-title" className="bg-cream-100 py-section">
      <div className="mx-auto max-w-site px-4 sm:px-6">
        <h2 id="related-title" className="mb-8">
          {title}
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={a._id} article={a} />
          ))}
        </div>
      </div>
    </section>
  )
}
