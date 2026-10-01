import { readFileSync } from 'node:fs'
import { XMLParser } from 'fast-xml-parser'

/** One <item> from a WordPress export (WXR) file. */
export type WxrItem = {
  id: number
  title: string
  slug: string
  type: string
  status: string
  date: string
  content: string
  excerpt: string
  parentId: number
  attachmentUrl?: string
  categories: { slug: string; name: string }[]
  meta: Record<string, string>
}

export type WxrCategory = { slug: string; name: string }

function text(value: unknown): string {
  if (value === undefined || value === null) return ''
  if (typeof value === 'object' && '#text' in (value as Record<string, unknown>)) {
    return String((value as Record<string, unknown>)['#text'])
  }
  return String(value)
}

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return []
  return Array.isArray(value) ? value : [value]
}

export function readWxr(path: string) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@',
    parseTagValue: false,
    trimValues: false,
  })
  const xml = parser.parse(readFileSync(path, 'utf8'))
  const channel = xml.rss.channel

  const categories: WxrCategory[] = asArray(channel['wp:category']).map((c: Record<string, unknown>) => ({
    slug: text(c['wp:category_nicename']).trim(),
    name: text(c['wp:cat_name']).trim(),
  }))

  const items: WxrItem[] = asArray(channel.item).map((item: Record<string, unknown>) => {
    const meta: Record<string, string> = {}
    for (const m of asArray(item['wp:postmeta'] as Record<string, unknown>[] | undefined)) {
      meta[text(m['wp:meta_key'])] = text(m['wp:meta_value'])
    }
    return {
      id: Number(text(item['wp:post_id'])),
      title: text(item.title).trim(),
      slug: text(item['wp:post_name']).trim(),
      type: text(item['wp:post_type']).trim(),
      status: text(item['wp:status']).trim(),
      date: text(item['wp:post_date_gmt']).trim(),
      content: text(item['content:encoded']),
      excerpt: text(item['excerpt:encoded']).trim(),
      parentId: Number(text(item['wp:post_parent']) || 0),
      attachmentUrl: text(item['wp:attachment_url']).trim() || undefined,
      categories: asArray(item.category as Record<string, unknown>[] | undefined)
        .filter((c) => c['@domain'] === 'category')
        .map((c) => ({ slug: String(c['@nicename']), name: text(c).trim() })),
      meta,
    }
  })

  return { categories, items }
}
