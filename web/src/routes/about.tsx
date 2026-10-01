import { createFileRoute } from '@tanstack/react-router'
import { getPage } from '~/lib/sanity/api'
import { PageView } from '~/components/page/PageView'

export const Route = createFileRoute('/about')({
  loader: () => getPage({ data: { slug: 'about' } }),
  component: function Page() {
    return <PageView page={Route.useLoaderData()} fallbackTitle="About Us" />
  },
})
