import type { BlockContent } from './sanity/sanity.types'
import { clean } from './text'

/** Plain text from Portable Text (paragraphs only), for meta descriptions. */
export function blocksToText(blocks: BlockContent | null | undefined) {
  return clean(
    (blocks ?? [])
      .filter((b) => b._type === 'block')
      .map((b) => ('children' in b ? (b.children ?? []).map((c) => c.text ?? '').join('') : ''))
      .join(' '),
  )
}
