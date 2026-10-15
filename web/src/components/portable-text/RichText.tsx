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
    normal: ({ children }) => <p className="text-justify">{children}</p>,
    h2: ({ children }) => <h2>{children}</h2>,
    h3: ({ children }) => <h3>{children}</h3>,
    blockquote: ({ children }) => <blockquote className="whitespace-pre-line">{children}</blockquote>,
  },
  marks: {
    em: ({ children }) => <em className="font-serif italic text-brown-900">{children}</em>,
    link: ({ value, children }) => {
      const href = (value as { href?: string } | undefined)?.href
      return href ? <SmartLink href={href}>{children}</SmartLink> : <>{children}</>
    },
  },
  types: {
    verse: ({ value }) => <VerseBlock pali={value.pali} meaning={value.meaning} reference={value.reference} />,
    image: ({ value }) => (
      <figure className="my-8 text-center">
        <SanityImage
          image={value}
          sizes="(min-width: 1152px) 72rem, 100vw"
          className="mx-auto w-full rounded-card shadow-md"
        />
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

/**
 * FAQ: each small heading (h3) becomes a question that opens to show the text
 * under it. Text before the first question shows as usual.
 */
export function FaqAccordion({ value }: { value: BlockContent | null | undefined }) {
  const intro: BlockContent = []
  const items: { key: string; question: string; answer: BlockContent }[] = []
  for (const block of cleanBlocks(value)) {
    if (block._type === 'block' && block.style === 'h3') {
      const question = (block.children ?? []).map((c) => ('text' in c ? (c.text ?? '') : '')).join('')
      items.push({ key: block._key, question, answer: [] })
    } else {
      ;(items.at(-1)?.answer ?? intro).push(block)
    }
  }
  return (
    <div className="max-w-[42rem]">
      <RichText value={intro} />
      {items.length > 0 && (
        <div className={`divide-y divide-gold-400/40 border-y border-gold-400/40 ${intro.length ? 'mt-6' : ''}`}>
          {items.map((item) => (
            <details key={item.key} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 [&::-webkit-details-marker]:hidden">
                <h3>{item.question}</h3>
                <svg
                  viewBox="0 0 20 20"
                  className="h-5 w-5 shrink-0 text-brown-700 transition-transform group-open:rotate-180"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4Z" />
                </svg>
              </summary>
              <RichText value={item.answer} className="prose-nu pb-5" />
            </details>
          ))}
        </div>
      )}
    </div>
  )
}
