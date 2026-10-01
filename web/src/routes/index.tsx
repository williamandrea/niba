import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <section className="mx-auto max-w-site px-4 py-section sm:px-6">
      <h1>Na Uyana Aranya Indonesia</h1>
      <p className="mt-4">Theruwan Saranai with Metta.</p>
    </section>
  )
}
