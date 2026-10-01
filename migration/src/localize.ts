/**
 * One-time conversion of existing Sanity content to the two-language shape.
 *
 *   pnpm localize --dry-run   # list what would change, write nothing
 *   pnpm localize             # convert in place (published documents and drafts)
 *
 * Text fields that are still plain ("About Us") become { en: "About Us" }.
 * Fields that already have { en, id } are left alone, so it is safe to run again.
 * Nothing else changes, so edits made in the Studio are kept.
 */
import { createClient } from '@sanity/client'
import { fileURLToPath, pathToFileURL } from 'node:url'

type Kind = 'localeString' | 'localeText' | 'localeBlockContent'
const S: Kind = 'localeString'
const T: Kind = 'localeText'
const B: Kind = 'localeBlockContent'

const SEO: [string, Kind][] = [
  ['seo.title', S],
  ['seo.description', T],
]

/** Translatable fields per document type. "[]" means every item of a list. Keep in sync with the Studio schemas. */
const FIELDS: Record<string, [string, Kind][]> = {
  siteSettings: [
    ['menu[].label', S],
    ['menu[].children[].label', S],
    ['footer.quote', T],
    ['footer.quoteSource', S],
    ['footer.usefulLinks[].label', S],
    ['footer.nibaBlurb', T],
    ['footer.nibaButton.label', S],
    ...SEO,
  ],
  homepage: [
    ['hero.meaning', T],
    ['hero.tagline', S],
    ['hero.button.label', S],
    ['intro.heading', S],
    ['intro.text', T],
    ['intro.buttons[].label', S],
    ['teacherQuote.quote', T],
    ['programsIntro', T],
    ['venerablesIntro', T],
    ['instagram.heading', S],
  ],
  post: [['title', S], ['excerpt', T], ['body', B], ...SEO],
  category: [['title', S]],
  event: [['title', S], ['sessions[].label', S], ['description', B], ...SEO],
  program: [
    ['name', S],
    ['shortDescription', T],
    ['scheduleNote', S],
    ['button.label', S],
  ],
  teacher: [['bio', T]],
  page: [['title', S], ['intro', T], ['body[].heading', S], ['body[].content', B], ...SEO],
}

const dryRun = process.argv.includes('--dry-run')

try {
  process.loadEnvFile(fileURLToPath(new URL('../../.env', import.meta.url)))
} catch {
  // No .env file: rely on the environment.
}

/** Wraps plain values at `path` in `node`. Returns the paths it changed. */
function wrap(node: unknown, parts: string[], kind: Kind, at: string): string[] {
  if (!node || typeof node !== 'object' || parts.length === 0) return []
  const [head, ...rest] = parts as [string, ...string[]]
  const isList = head.endsWith('[]')
  const name = isList ? head.slice(0, -2) : head
  const record = node as Record<string, unknown>
  const value = record[name]
  if (value === undefined || value === null) return []

  if (isList) {
    if (!Array.isArray(value)) return []
    return value.flatMap((item, i) => wrap(item, rest, kind, `${at}${name}[${i}].`))
  }
  if (rest.length) return wrap(value, rest, kind, `${at}${name}.`)

  const plain = kind === B ? Array.isArray(value) : typeof value === 'string'
  if (!plain) return []
  record[name] = { _type: kind, en: value }
  return [`${at}${name}`]
}

/** Converts one document in place. Returns the paths it changed. */
export function localizeDoc(doc: Record<string, unknown>) {
  const fields = FIELDS[doc._type as string] ?? []
  return fields.flatMap(([path, kind]) => wrap(doc, path.split('.'), kind, ''))
}

async function main() {
  const projectId = process.env.SANITY_PROJECT_ID
  const token = process.env.SANITY_WRITE_TOKEN
  if (!projectId || !token) {
    console.error('Set SANITY_PROJECT_ID and SANITY_WRITE_TOKEN in the root .env (see .env.example).')
    process.exit(1)
  }
  const client = createClient({
    projectId,
    dataset: process.env.SANITY_DATASET || 'production',
    token,
    apiVersion: '2026-09-30',
    useCdn: false,
    // Drafts too, so unpublished edits are converted as well.
    perspective: 'raw',
  })

  const docs = await client.fetch<Record<string, unknown>[]>('*[_type in $types]', { types: Object.keys(FIELDS) })
  const changed: { doc: Record<string, unknown>; paths: string[] }[] = []
  for (const doc of docs) {
    const paths = localizeDoc(doc)
    if (paths.length) changed.push({ doc, paths })
  }

  for (const { doc, paths } of changed) console.log(`${doc._id}: ${paths.join(', ')}`)
  console.log(`\n${changed.length} of ${docs.length} documents ${dryRun ? 'would change' : 'changed'}.`)
  if (dryRun || !changed.length) return

  for (let i = 0; i < changed.length; i += 50) {
    const tx = client.transaction()
    for (const { doc, paths } of changed.slice(i, i + 50)) {
      // Only the changed top-level fields are written. If someone edits the document
      // while this runs, Sanity rejects the batch (ifRevisionId): just run it again.
      const fields = [...new Set(paths.map((p) => p.split(/[.[]/)[0] as string))]
      tx.patch(doc._id as string, (patch) =>
        patch.ifRevisionId(doc._rev as string).set(Object.fromEntries(fields.map((f) => [f, doc[f]]))),
      )
    }
    await tx.commit({ visibility: 'async' })
  }
  console.log('Done. Open the Studio and check a few documents.')
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
