import { createFileRoute } from '@tanstack/react-router'
import { getPage } from '~/lib/sanity/api'
import { PageView } from '~/components/page/PageView'

export const Route = createFileRoute('/chanting')({
  loader: () => getPage({ data: { slug: 'chanting' } }),
  component: function Page() {
    return <PageView page={Route.useLoaderData()} fallbackTitle="Chanting" />
  },
})
