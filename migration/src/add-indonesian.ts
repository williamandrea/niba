import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

/*
 * Fills empty Indonesian (`id`) fields from migration/data/id/<document id>.json.
 * Each file maps a field path to its translation. Rich text is a list that lines up
 * with the English blocks: a string per text block (<b>, <i>, <a:markKey> keep the
 * formatting), { meaning } per verse, { title, body } per note, { caption } per image,
 * and null for anything copied as is. English is never changed, and fields that
 * already have Indonesian are skipped.
 *
 * Run: node migration/src/add-indonesian.ts [--dry-run]
 */

const root = (p: string) => fileURLToPath(new URL(`../${p}`, import.meta.url))

try {
  process.loadEnvFile(root('../.env'))
} catch {
  // Rely on process.env
}

const projectId = process.env.SANITY_PROJECT_ID
const dataset = process.env.SANITY_DATASET || 'production'
const token = process.env.SANITY_WRITE_TOKEN
const dryRun = process.argv.includes('--dry-run')

if (!projectId || !token) {
  console.error('Missing SANITY_PROJECT_ID or SANITY_WRITE_TOKEN')
  process.exit(1)
}

const api = `https://${projectId}.api.sanity.io/v2026-09-30/data`
const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

type Span = { _key: string; _type: 'span'; text: string; marks?: string[] }
type Item = { _key: string; _type: string; children?: Span[]; [field: string]: unknown }
type Translation = string | null | { meaning?: string; title?: string; body?: string; caption?: string }
type Locale = { en?: string | Item[]; id?: string | Item[] }
type Doc = { _id: string; _rev: string }

const MARKS: Record<string, string> = { b: 'strong', i: 'em' }

function select(doc: unknown, path: string): Locale | undefined {
  let node = doc as Record<string, unknown> | undefined
  for (const part of path.match(/[^.[\]]+|\[[^\]]+\]/g) ?? []) {
    if (!node) return undefined
    const key = part.match(/^\[_key=="(.*)"\]$/)?.[1]
    node = key
      ? (node as unknown as Item[]).find((item) => item._key === key)
      : (node[part] as Record<string, unknown> | undefined)
  }
  return node as Locale | undefined
}

/** "Text with <b>bold</b> and <a:dr004>a link</a>" → spans with marks. */
function parseSpans(text: string, blockKey: string): Span[] {
  const spans: Span[] = []
  const open: string[] = []
  for (const token of text.split(/(<\/?(?:b|i|a:[\w-]+|a)>)/)) {
    if (!token) continue
    const tag = token.match(/^<(\/?)(b|i|a:[\w-]+|a)>$/)
    if (!tag) {
      spans.push({ _key: `${blockKey}-id${spans.length}`, _type: 'span', text: token, marks: [...open] })
    } else if (tag[1]) {
      if (!open.pop()) throw new Error(`Extra closing tag in: ${text}`)
    } else {
      open.push(MARKS[tag[2]] ?? tag[2].slice(2))
    }
  }
  if (open.length) throw new Error(`Unclosed tag in: ${text}`)
  return spans.length ? spans : [{ _key: `${blockKey}-id0`, _type: 'span', text: '', marks: [] }]
}

/** The Indonesian rich text: the English blocks with their text swapped for the translation. */
function buildBlocks(en: Item[], translated: Translation[], where: string): Item[] {
  if (en.length !== translated.length) {
    throw new Error(`${where}: ${translated.length} translations for ${en.length} English blocks`)
  }
  return en.map((item, i) => {
    const t = translated[i]
    if (item._type === 'block') {
      if (typeof t !== 'string') throw new Error(`${where}[${i}]: expected text`)
      const markDefs = (item.markDefs as { _key: string }[] | undefined) ?? []
      const children = parseSpans(t, item._key)
      for (const span of children) {
        for (const mark of span.marks ?? []) {
          if (!['strong', 'em'].includes(mark) && !markDefs.some((d) => d._key === mark)) {
            throw new Error(`${where}[${i}]: unknown link ${mark}`)
          }
        }
      }
      return { ...item, children }
    }
    return t && typeof t === 'object' ? { ...item, ...t } : item
  })
}

const isEmpty = (value: unknown) =>
  value == null || (typeof value === 'string' ? !value.trim() : Array.isArray(value) && !value.length)

async function main() {
  const dir = root('data/id')
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    const docId = file.replace(/\.json$/, '')
    const fields: Record<string, string | Translation[]> = JSON.parse(readFileSync(`${dir}/${file}`, 'utf8'))

    const res = await fetch(`${api}/doc/${dataset}/${docId}`, { headers })
    const doc: Doc | undefined = (await res.json()).documents?.[0]
    if (!doc) {
      console.warn(`${docId}: not found, skipped`)
      continue
    }

    const set: Record<string, unknown> = {}
    for (const [path, value] of Object.entries(fields)) {
      const field = select(doc, path)
      if (!field || isEmpty(field.en)) {
        console.warn(`${docId} ${path}: no English text, skipped`)
      } else if (!isEmpty(field.id)) {
        console.log(`${docId} ${path}: already in Indonesian, skipped`)
      } else if (typeof value === 'string') {
        set[`${path}.id`] = value
      } else {
        set[`${path}.id`] = buildBlocks(field.en as Item[], value, `${docId} ${path}`)
      }
    }

    const count = Object.keys(set).length
    if (!count || dryRun) {
      console.log(`${docId}: ${count} field(s) to fill${dryRun ? ' (dry run)' : ''}`)
      continue
    }
    const mutate = await fetch(`${api}/mutate/${dataset}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ mutations: [{ patch: { id: docId, ifRevisionID: doc._rev, set } }] }),
    })
    const result = await mutate.json()
    if (!mutate.ok) throw new Error(`${docId}: ${JSON.stringify(result)}`)
    console.log(`${docId}: filled ${count} field(s)`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
