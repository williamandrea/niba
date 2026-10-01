import { clean } from '~/lib/text'
import { LotusMandala } from './LotusMandala'

/** Title band at the top of inner pages. Holds the page's only h1. */
export function PageHeader({ title, intro, eyebrow }: { title: string; intro?: string | null; eyebrow?: string }) {
  const text = clean(intro)
  return (
    <header className="relative isolate overflow-hidden bg-cream-100">
      <LotusMandala className="pointer-events-none absolute -right-20 -top-16 -z-10 h-80 w-80 text-saffron-500 opacity-[0.08] sm:h-96 sm:w-96" />
      <div className="mx-auto max-w-site px-4 py-12 sm:px-6 sm:py-16">
        {eyebrow && <p className="mb-2 text-base font-semibold uppercase tracking-widest text-brown-700">{eyebrow}</p>}
        <h1 className="max-w-3xl">{title}</h1>
        {text && <p className="mt-4 max-w-2xl text-lg text-ink/85">{text}</p>}
      </div>
    </header>
  )
}
