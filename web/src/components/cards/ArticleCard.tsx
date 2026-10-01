import { Link } from '@tanstack/react-router'
import type { SanityImageSource } from '~/lib/sanity/image'
import { formatDate } from '~/lib/dates'
import { clean } from '~/lib/text'
import { useLang, useT } from '~/lib/i18n'
import { SanityImage } from '~/components/ui/SanityImage'
import { LotusMandala } from '~/components/ui/LotusMandala'

export type ArticleCardData = {
  _id: string
  title: string
  slug: string
  category: { title: string; slug: string } | null
  coverImage: SanityImageSource | null
  excerpt: string | null
  publishedAt: string
}

export function ArticleCard({ article, headingLevel = 3 }: { article: ArticleCardData; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3'
  const category = article.category?.slug ?? 'blog'
  const lang = useLang()
  const t = useT()
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-card border border-gold-400/30 bg-white/70 shadow-sm">
      {article.coverImage?.asset ? (
        <SanityImage
          image={article.coverImage}
          aspect={16 / 10}
          sizes="(min-width: 1024px) 24rem, (min-width: 768px) 50vw, 100vw"
          alt=""
          className="w-full object-cover"
        />
      ) : (
        <div className="flex aspect-[16/10] items-center justify-center bg-saffron-100" aria-hidden="true">
          <LotusMandala className="h-2/3 text-saffron-500/40" />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-6">
        <p className="text-base text-ink/75">
          {article.category && <span className="font-semibold text-brown-700">{article.category.title}</span>}
          {article.category && ' · '}
          <time dateTime={article.publishedAt}>{formatDate(article.publishedAt, lang)}</time>
        </p>
        <Heading className="text-h3">
          <Link
            to="/$category/$slug/"
            params={{ category, slug: article.slug }}
            className="after:absolute after:inset-0 after:content-[''] hover:text-brown-700 hover:underline"
          >
            {article.title}
          </Link>
        </Heading>
        {clean(article.excerpt) && <p className="line-clamp-4 text-ink/85">{clean(article.excerpt)}</p>}
        <span className="mt-auto pt-2 font-semibold text-brown-700" aria-hidden="true">
          {t.readMore}
        </span>
      </div>
    </article>
  )
}
