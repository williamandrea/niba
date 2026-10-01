import type { getPage } from '~/lib/sanity/api'
import { PageHeader } from '~/components/ui/PageHeader'
import { ComingSoon, PageSections, type PageSectionData } from './PageSections'

type PageData = Pick<NonNullable<Awaited<ReturnType<typeof getPage>>>, 'title' | 'intro'> & {
  body: PageSectionData[] | null
}

/** A Sanity `page` document: title band and sections. */
export function PageView({ page, fallbackTitle }: { page: PageData | null | undefined; fallbackTitle: string }) {
  const hasBody = page?.body?.length
  return (
    <>
      <PageHeader title={page?.title || fallbackTitle} intro={page?.intro} />
      {hasBody ? <PageSections sections={page.body} /> : <ComingSoon />}
    </>
  )
}
