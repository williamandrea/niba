import { Link, type ErrorComponentProps } from '@tanstack/react-router'

export function ErrorView({ error, reset }: ErrorComponentProps) {
  if (import.meta.env.DEV) console.error(error)
  return (
    <section className="px-4 py-section text-center">
      <h1>Something went wrong</h1>
      <p className="mx-auto mt-4 max-w-xl">We could not load this page. Please try again in a moment.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-11 items-center rounded-full bg-saffron-500 px-6 font-semibold text-white hover:bg-saffron-600"
        >
          Try again
        </button>
        <Link
          to="/"
          className="inline-flex min-h-11 items-center rounded-full border-2 border-brown-900 px-6 font-semibold text-brown-900"
        >
          Home
        </Link>
      </div>
    </section>
  )
}
