import { createFileRoute } from '@tanstack/react-router'
import { getPage } from '~/lib/sanity/api'
import { PageView } from '~/components/page/PageView'

export const Route = createFileRoute('/books')({
  loader: () => getPage({ data: { slug: 'books' } }),
  component: function Page() {
    return <PageView page={Route.useLoaderData()} fallbackTitle="Books" />
  },
})
