import { Link, type ErrorComponentProps } from '@tanstack/react-router'
import { useT } from '~/lib/i18n'

export function ErrorView({ error, reset }: ErrorComponentProps) {
  const t = useT()
  if (import.meta.env.DEV) console.error(error)
  return (
    <section className="px-4 py-section text-center">
      <h1>{t.errorTitle}</h1>
      <p className="mx-auto mt-4 max-w-xl">{t.errorText}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-11 items-center rounded-full bg-saffron-600 px-6 font-semibold text-white hover:bg-brown-700"
        >
          {t.tryAgain}
        </button>
        <Link
          to="/"
          className="inline-flex min-h-11 items-center rounded-full border-2 border-brown-900 px-6 font-semibold text-brown-900"
        >
          {t.home}
        </Link>
      </div>
    </section>
  )
}
