import { Link } from '@tanstack/react-router'

type Search = { q?: string; category?: string; page?: number }

export function Pagination({ current, count, search }: { current: number; count: number; search: Search }) {
  if (count <= 1) return null
  const pages = Array.from({ length: count }, (_, i) => i + 1)
  const base = 'inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-3 text-base font-semibold'
  return (
    <nav aria-label="Pages" className="mt-12 flex flex-wrap items-center justify-center gap-2">
      {current > 1 && (
        <Link
          to="/blog/"
          search={{ ...search, page: current - 1 === 1 ? undefined : current - 1 }}
          className={`${base} text-brown-900 hover:bg-saffron-100`}
        >
          ← Newer
        </Link>
      )}
      {pages.map((p) => (
        <Link
          key={p}
          to="/blog/"
          search={{ ...search, page: p === 1 ? undefined : p }}
          aria-current={p === current ? 'page' : undefined}
          className={`${base} ${p === current ? 'bg-brown-900 text-cream-50' : 'text-brown-900 hover:bg-saffron-100'}`}
        >
          {p}
        </Link>
      ))}
      {current < count && (
        <Link
          to="/blog/"
          search={{ ...search, page: current + 1 }}
          className={`${base} text-brown-900 hover:bg-saffron-100`}
        >
          Older →
        </Link>
      )}
    </nav>
  )
}
