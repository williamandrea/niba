import type { PAGE_QUERY_RESULT } from '~/lib/sanity/sanity.types'
import { PageHeader } from '~/components/ui/PageHeader'
import { ComingSoon, PageSections, type PageSectionData } from './PageSections'

type PageData = Pick<NonNullable<PAGE_QUERY_RESULT>, 'title' | 'intro'> & { body: PageSectionData[] | null }

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
