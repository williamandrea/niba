import { Link } from '@tanstack/react-router'
import { LotusMandala } from '~/components/ui/LotusMandala'
import { SmartLink } from '~/components/ui/SmartLink'
import { useT } from '~/lib/i18n'

export function NotFound() {
  const t = useT()
  return (
    <section className="relative isolate overflow-hidden px-4 py-section text-center">
      <LotusMandala className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 text-saffron-500 opacity-[0.06]" />
      <p className="font-sans text-base font-semibold uppercase tracking-widest text-brown-700">{t.pageNotFound}</p>
      <h1 className="mt-3">{t.notFoundTitle}</h1>
      <p className="mx-auto mt-4 max-w-xl">{t.notFoundText}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/"
          className="inline-flex min-h-11 items-center rounded-full bg-saffron-600 px-6 font-semibold text-white hover:bg-brown-700"
        >
          {t.goHome}
        </Link>
        <SmartLink
          href="/blog/"
          className="inline-flex min-h-11 items-center rounded-full border-2 border-brown-900 px-6 font-semibold text-brown-900 hover:bg-brown-900 hover:text-cream-50"
        >
          {t.readArticles}
        </SmartLink>
      </div>
    </section>
  )
}
