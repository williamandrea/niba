import { PortableText, type PortableTextComponents } from '@portabletext/react'
import type { BlockContent } from '~/lib/sanity/sanity.types'
import { clean } from '~/lib/text'
import { SanityImage } from '~/components/ui/SanityImage'
import { SmartLink } from '~/components/ui/SmartLink'
import { VerseBlock } from './VerseBlock'

type Block = BlockContent[number]

/** Drops admin "TODO:" notes and anything left empty by that. */
export function cleanBlocks(blocks: BlockContent | null | undefined): BlockContent {
  if (!blocks) return []
  const out: BlockContent = []
  for (const block of blocks) {
    if (block._type === 'block') {
      const children = (block.children ?? []).map((child) =>
        child._type === 'span' && child.text?.includes('TODO:') ? { ...child, text: clean(child.text) } : child,
      )
      const text = children.map((c) => ('text' in c ? (c.text ?? '') : '')).join('')
      if (!text.trim()) continue
      out.push({ ...block, children })
    } else if (block._type === 'callout') {
      const body = clean(block.body)
      if (body) out.push({ ...block, body, title: clean(block.title) || undefined })
    } else if (block._type === 'verse') {
      const pali = clean(block.pali)
      if (pali) out.push({ ...block, pali, meaning: clean(block.meaning) })
    } else {
      out.push(block)
    }
  }
  return out
}

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p>{children}</p>,
    h2: ({ children }) => <h2>{children}</h2>,
    h3: ({ children }) => <h3>{children}</h3>,
    blockquote: ({ children }) => <blockquote className="whitespace-pre-line">{children}</blockquote>,
  },
  marks: {
    link: ({ value, children }) => {
      const href = (value as { href?: string } | undefined)?.href
      return href ? <SmartLink href={href}>{children}</SmartLink> : <>{children}</>
    },
  },
  types: {
    verse: ({ value }) => <VerseBlock pali={value.pali} meaning={value.meaning} reference={value.reference} />,
    image: ({ value }) => (
      <figure className="my-8">
        <SanityImage image={value} sizes="(min-width: 768px) 42rem, 100vw" className="w-full rounded-card" />
        {clean(value.caption) && <figcaption className="mt-2 text-base text-ink/75">{clean(value.caption)}</figcaption>}
      </figure>
    ),
    callout: ({ value }) => (
      <aside className="rounded-card border-l-4 border-saffron-500 bg-saffron-100/70 px-5 py-4">
        {value.title && <p className="font-semibold text-brown-900">{value.title}</p>}
        <p className="whitespace-pre-line">{value.body}</p>
      </aside>
    ),
  },
}

export function RichText({
  value,
  className = 'prose-nu',
}: {
  value: BlockContent | null | undefined
  className?: string
}) {
  const blocks = cleanBlocks(value)
  if (!blocks.length) return null
  return (
    <div className={className}>
      <PortableText value={blocks as Block[]} components={components} />
    </div>
  )
}
