import { htmlToBlocks } from '@portabletext/block-tools'
import { Schema } from '@sanity/schema'
import { JSDOM } from 'jsdom'

/*
 * Converts WordPress (Gutenberg + Stackable) post HTML to Portable Text that
 * matches the Studio's `blockContent` type.
 */

const schema = Schema.compile({
  name: 'migration',
  types: [
    {
      name: 'post',
      type: 'document',
      fields: [
        {
          name: 'body',
          type: 'array',
          of: [
            {
              type: 'block',
              styles: [
                { title: 'Normal', value: 'normal' },
                { title: 'Heading', value: 'h2' },
                { title: 'Small heading', value: 'h3' },
                { title: 'Quote', value: 'blockquote' },
              ],
              lists: [
                { title: 'Bullet list', value: 'bullet' },
                { title: 'Numbered list', value: 'number' },
              ],
              marks: {
                decorators: [
                  { title: 'Bold', value: 'strong' },
                  { title: 'Italic', value: 'em' },
                ],
                annotations: [{ name: 'link', type: 'object', fields: [{ name: 'href', type: 'string' }] }],
              },
            },
          ],
        },
      ],
    },
  ],
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const blockContentType = (schema.get('post') as any).fields.find((f: { name: string }) => f.name === 'body').type

export type PtBlock = { _type: string; _key: string; [key: string]: unknown }

export type ConvertNotes = {
  droppedEmptyParagraphs: number
  joinedLineBreaks: number
  removedFootnoteMarks: number
  removedLinks: string[]
  skippedBlocks: string[]
  verseBlocks: number
  headingsFromText: string[]
  legacyPaliFixes: Record<string, number>
}

type Segment = { name: string; inner: string }

/** Splits Gutenberg content into its top-level blocks. */
function splitBlocks(content: string): Segment[] {
  const re = /<!--\s+(\/)?wp:([a-z0-9/-]+)(\s+\{[\s\S]*?\})?\s*(\/)?-->/g
  const segments: Segment[] = []
  let depth = 0
  let start = 0
  let current = ''
  let match: RegExpExecArray | null
  let lastEnd = 0
  while ((match = re.exec(content))) {
    const [, closing, name = '', , selfClosing] = match
    if (selfClosing) {
      if (depth === 0) segments.push({ name, inner: '' })
      continue
    }
    if (!closing) {
      if (depth === 0) {
        const between = content.slice(lastEnd, match.index).trim()
        if (between) segments.push({ name: 'freeform', inner: between })
        current = name
        start = re.lastIndex
      }
      depth++
    } else {
      depth--
      if (depth === 0) {
        segments.push({ name: current, inner: content.slice(start, match.index) })
        lastEnd = re.lastIndex
      }
    }
  }
  const tail = content.slice(lastEnd).trim()
  if (tail && !segments.length) segments.push({ name: 'freeform', inner: tail })
  return segments
}

const doc = (html: string) => new JSDOM(`<body>${html}</body>`).window.document

function textOf(html: string) {
  return (doc(html).body.textContent ?? '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const ENDS_SENTENCE = /[.!?:;"”’)]$/
const STARTS_SENTENCE = /^[A-Z“"‘(]/

/** Short, title-case lines with no end punctuation read as headings ("Commentary", "The Story of …"). */
function looksLikeHeading(text: string) {
  const words = text.split(/\s+/).filter(Boolean)
  if (!words.length || words.length > 8 || ENDS_SENTENCE.test(text)) return false
  const long = words.filter((w) => w.length > 3)
  const capitalised = long.filter((w) => /^[A-Z]/.test(w))
  return long.length > 0 && capitalised.length / long.length >= 0.6
}

/** Legacy Sinhala-Pali font encoding used in some copied texts, e.g. "Manopubbaïgamà" → "Manopubbaṅgamā". */
const LEGACY_PALI: Record<string, string> = {
  à: 'ā',
  À: 'Ā',
  ã: 'ī',
  å: 'ū',
  ü: 'ṃ',
  ï: 'ṅ',
  ñ: 'ṭ',
  ë: 'ḍ',
  õ: 'ṇ',
  '÷': 'ḷ',
}

export function fixLegacyPali(html: string, notes: ConvertNotes) {
  // Only posts that clearly use the old encoding ("ü" for ṃ or "ï" for ṅ, plus "à" for ā).
  if (!/[a-z][üï]/.test(html) || !/à/.test(html)) {
    // "à" alone (e.g. "Sàvatthi") is still safe to fix.
    return html.replace(/à/g, () => {
      notes.legacyPaliFixes['à→ā'] = (notes.legacyPaliFixes['à→ā'] ?? 0) + 1
      return 'ā'
    })
  }
  return html.replace(/[àÀãåüïñëõ÷]/g, (ch) => {
    const key = `${ch}→${LEGACY_PALI[ch]}`
    notes.legacyPaliFixes[key] = (notes.legacyPaliFixes[key] ?? 0) + 1
    return LEGACY_PALI[ch] ?? ch
  })
}

/** Drops footnote numbers (<sup>1</sup>) but keeps any line break inside them. */
function removeFootnoteMarks(root: Element, notes: ConvertNotes) {
  for (const sup of Array.from(root.querySelectorAll('sup'))) {
    notes.removedFootnoteMarks++
    const breaks = Array.from(sup.querySelectorAll('br'))
    sup.replaceWith(...breaks)
  }
}

/** Removes inline styles, footnote marks, and links to other organisations. */
function tidyInlineHtml(html: string, notes: ConvertNotes) {
  const d = doc(html)
  removeFootnoteMarks(d.body, notes)
  for (const a of Array.from(d.body.querySelectorAll('a'))) {
    const href = a.getAttribute('href') ?? ''
    if (/nalarnurani\.org/i.test(href) || !href) {
      if (href) notes.removedLinks.push(href)
      a.replaceWith(...Array.from(a.childNodes))
    }
  }
  for (const el of Array.from(d.body.querySelectorAll('[style],[class],[id]'))) {
    el.removeAttribute('style')
    el.removeAttribute('class')
    el.removeAttribute('id')
  }
  return d.body.innerHTML.replace(/&nbsp;|\u00a0/g, ' ')
}

/**
 * Splits a paragraph on its <br> tags: line breaks inside a sentence are
 * joined with a space (and "medi-<br>tation" is re-joined), real sentence
 * breaks become new paragraphs, and short title lines become headings.
 */
function splitParagraph(innerHtml: string, notes: ConvertNotes): { tag: 'p' | 'h3'; html: string }[] {
  let html = innerHtml.replace(/([A-Za-zÀ-ɏḀ-ỿ])-\s*<br\s*\/?>\s*(?=[a-zà-ÿā-žḀ-ỿ])/g, (_, ch: string) => {
    notes.joinedLineBreaks++
    return ch
  })
  html = html.replace(/\s*<br\s*\/?>\s*$/g, '')
  const parts = html.split(/\s*<br\s*\/?>\s*/)
  const pieces: string[] = []
  let current = parts[0] ?? ''
  let previousLine = current
  for (const part of parts.slice(1)) {
    const prevText = textOf(current)
    const lineText = textOf(previousLine)
    const nextText = textOf(part)
    if (!nextText) continue
    previousLine = part
    // Text copied from a PDF breaks every ~60 characters. A short line that
    // ends a sentence is the end of a paragraph; other breaks are joined.
    const paragraphEnd = ENDS_SENTENCE.test(lineText) && lineText.length < 45 && STARTS_SENTENCE.test(nextText)
    if (paragraphEnd || looksLikeHeading(prevText) || looksLikeHeading(nextText)) {
      pieces.push(current)
      current = part
    } else {
      notes.joinedLineBreaks++
      current = `${current} ${part}`
    }
  }
  pieces.push(current)
  return pieces
    .filter((p) => textOf(p))
    .map((p) => {
      const text = textOf(p)
      if (pieces.length > 1 && looksLikeHeading(text)) {
        notes.headingsFromText.push(text)
        return { tag: 'h3' as const, html: text }
      }
      return { tag: 'p' as const, html: p }
    })
}

function paragraphInner(html: string) {
  const match = /<p[^>]*>([\s\S]*?)<\/p>/i.exec(html)
  return match ? (match[1] ?? '') : html
}

/** Two columns of Pali + meaning become one `verse` block. */
function columnsToVerse(inner: string, key: string, notes: ConvertNotes): PtBlock | null {
  const d = doc(inner)
  const columns = Array.from(d.body.querySelectorAll('.wp-block-column'))
  if (columns.length !== 2) return null
  const lines = (col: Element) =>
    Array.from(col.querySelectorAll('p'))
      .map((p) => (p.textContent ?? '').replace(/\u00a0/g, ' ').trim())
      .filter(Boolean)
  const pali = lines(columns[0]!)
  const meaning = lines(columns[1]!)
  if (pali.length < 2 || meaning.length < 2) return null

  let reference: string | undefined
  const header = pali[0] && /^dhammapada verse (\d+)\s*:?$/i.exec(pali[0])
  if (header) {
    pali.shift()
    reference = `Dhammapada ${header[1]}`
  }
  if (meaning[0] && /^meaning\s*:?$/i.test(meaning[0])) meaning.shift()
  const last = pali[pali.length - 1] ?? ''
  const ref = /\s*\((\d+:\d+)\)\s*$/.exec(last)
  if (ref) {
    pali[pali.length - 1] = last.slice(0, ref.index)
    reference = `Dhammapada ${ref[1]}`
  }
  notes.verseBlocks++
  return { _type: 'verse', _key: key, pali: pali.join('\n'), meaning: meaning.join('\n'), reference }
}

/** A paragraph of italic Pali lines followed by "Verse N: …" (classic editor style). */
function paragraphsToVerse(paliHtml: string, meaningHtml: string, key: string, notes: ConvertNotes): PtBlock | null {
  const breaks = (paliHtml.match(/<br\s*\/?>/gi) ?? []).length
  const meaningDoc = doc(meaningHtml)
  removeFootnoteMarks(meaningDoc.body, notes)
  const meaningText = textOf(meaningDoc.body.innerHTML)
  const verse = /^Verse (\d+)\s*:\s*/i.exec(meaningText)
  if (breaks < 3 || !verse) return null
  const d = doc(paliHtml)
  removeFootnoteMarks(d.body, notes)
  for (const br of Array.from(d.body.querySelectorAll('br'))) br.replaceWith('\n')
  const pali = (d.body.textContent ?? '')
    .split('\n')
    .map((l) => l.replace(/\u00a0/g, ' ').trim())
    .filter(Boolean)
  const meaning = meaningText
    .slice(verse[0].length)
    .replace(/\s*'dukkha'\s*/, " 'dukkha' ")
    .replace(/\s+/g, ' ')
    .trim()
  notes.verseBlocks++
  return { _type: 'verse', _key: key, pali: pali.join('\n'), meaning, reference: `Dhammapada ${verse[1]}` }
}

export function convertPost(content: string, postId: number) {
  const notes: ConvertNotes = {
    droppedEmptyParagraphs: 0,
    joinedLineBreaks: 0,
    removedFootnoteMarks: 0,
    removedLinks: [],
    skippedBlocks: [],
    verseBlocks: 0,
    headingsFromText: [],
    legacyPaliFixes: {},
  }
  let counter = 0
  const nextKey = () => `wp${postId}k${String(++counter).padStart(3, '0')}`

  const fixed = fixLegacyPali(content, notes)
  const segments = splitBlocks(fixed)
  const blocks: PtBlock[] = []
  // HTML waiting to be converted by block-tools in one go.
  let pending: string[] = []

  const flush = () => {
    if (!pending.length) return
    const html = pending.join('\n')
    pending = []
    const converted = htmlToBlocks(html, blockContentType, {
      parseHtml: (h) => new JSDOM(h).window.document,
      keyGenerator: nextKey,
    }) as PtBlock[]
    for (const block of converted) {
      const children = (block.children as { text?: string }[] | undefined) ?? []
      const text = children.map((c) => c.text ?? '').join('')
      if (block._type === 'block' && !text.trim()) {
        notes.droppedEmptyParagraphs++
        continue
      }
      if (block._type === 'block') {
        // Tidy whitespace left by removed marks and joined lines.
        for (const child of children) {
          if (typeof child.text === 'string') child.text = child.text.replace(/[ \t]{2,}/g, ' ')
        }
        const first = children[0]
        if (first?.text) first.text = first.text.replace(/^\s+/, '')
        const last = children[children.length - 1]
        if (last?.text) last.text = last.text.replace(/\s+$/, '')
      }
      blocks.push(block)
    }
  }

  const addParagraph = (pHtml: string) => {
    const inner = tidyInlineHtml(paragraphInner(pHtml), notes)
    const text = textOf(inner)
    if (!text) {
      notes.droppedEmptyParagraphs++
      return
    }
    // A short paragraph that is all bold reads as a small heading.
    const allBold = /^\s*<strong>[\s\S]*<\/strong>\s*:?\s*$/.test(inner)
    if (allBold && text.split(/\s+/).length <= 8) {
      notes.headingsFromText.push(text.replace(/:$/, ''))
      pending.push(`<h3>${text.replace(/:$/, '')}</h3>`)
      return
    }
    if (!/<br/i.test(inner) && looksLikeHeading(text)) {
      notes.headingsFromText.push(text)
      pending.push(`<h2>${text}</h2>`)
      return
    }
    for (const piece of splitParagraph(inner, notes)) pending.push(`<${piece.tag}>${piece.html}</${piece.tag}>`)
  }

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]!
    switch (seg.name) {
      case 'paragraph': {
        const next = segments[i + 1]
        if (next?.name === 'paragraph') {
          const verse = paragraphsToVerse(paragraphInner(seg.inner), paragraphInner(next.inner), nextKey(), notes)
          if (verse) {
            flush()
            blocks.push(verse)
            i++
            break
          }
        }
        addParagraph(seg.inner)
        break
      }
      case 'columns': {
        const verse = columnsToVerse(seg.inner, nextKey(), notes)
        if (verse) {
          flush()
          blocks.push(verse)
        } else {
          for (const p of seg.inner.match(/<p[\s\S]*?<\/p>/g) ?? []) addParagraph(p)
        }
        break
      }
      case 'stackable/heading':
      case 'heading': {
        const h = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/i.exec(seg.inner)
        const text = textOf(h?.[2] ?? seg.inner)
        if (text) pending.push(seg.name === 'heading' && Number(h?.[1]) >= 3 ? `<h3>${text}</h3>` : `<h2>${text}</h2>`)
        break
      }
      case 'table': {
        // A one-cell table holding a quote: keep the text as a quote block.
        const cells = Array.from(doc(seg.inner).body.querySelectorAll('td, th'))
        const lines = cells
          .flatMap((cell) => cell.innerHTML.split(/<br\s*\/?>/i))
          .map((l) => textOf(l))
          .filter(Boolean)
        if (lines.length) {
          flush()
          blocks.push({
            _type: 'block',
            _key: nextKey(),
            style: 'blockquote',
            markDefs: [],
            children: [{ _type: 'span', _key: nextKey(), text: lines.join('\n'), marks: ['em'] }],
          })
        }
        break
      }
      case 'separator':
      case 'spacer':
      case 'stackable/spacer':
        break
      case 'list': {
        pending.push(tidyInlineHtml(seg.inner, notes))
        break
      }
      default: {
        const paragraphs = seg.inner.match(/<p[\s\S]*?<\/p>/g)
        if (paragraphs?.length) paragraphs.forEach(addParagraph)
        else if (textOf(seg.inner)) notes.skippedBlocks.push(seg.name)
      }
    }
  }
  flush()
  return { blocks, notes }
}

/** First real paragraph of the article, shortened for the excerpt. */
export function excerptFrom(blocks: PtBlock[], max = 200) {
  for (const block of blocks) {
    if (block._type !== 'block' || block.style !== 'normal') continue
    const text = ((block.children as { text?: string }[]) ?? [])
      .map((c) => c.text ?? '')
      .join('')
      .trim()
    // Skip short lines and numbered footnotes ("1. manopubbangama …").
    if (text.length < 60 || /^\d+\.\s/.test(text)) continue
    if (text.length <= max) return text
    return `${text.slice(0, max).replace(/\s+\S*$/, '')}…`
  }
  return ''
}
