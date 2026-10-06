import { fileURLToPath } from 'node:url'

/*
 * Points the paritta links on the Chanting page (and its draft, if any) at
 * /chanting/<slug>/ instead of /<slug>/.
 *
 * Run: node migration/src/update-chanting-links.ts [--dry-run]
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

const DOC_IDS = ['page-chanting', 'drafts.page-chanting']
const OLD_HREF = /^\/(paritta-[^/]+\/?)$/
const api = `https://${projectId}.api.sanity.io/v2026-09-30/data`
const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

type MarkDef = { _type: string; href?: string }
type Block = { markDefs?: MarkDef[] }
type Section = { content?: Record<string, Block[] | string | undefined> }
type ChantingDoc = { _id: string; _rev: string; body?: Section[] }

async function main() {
  const res = await fetch(`${api}/doc/${dataset}/${DOC_IDS.join(',')}`, { headers })
  const docs: ChantingDoc[] = (await res.json()).documents ?? []
  if (!docs.length) throw new Error('Chanting page not found')

  const mutations = []
  for (const doc of docs) {
    let changed = 0
    for (const section of doc.body ?? [])
      for (const blocks of Object.values(section.content ?? {}))
        if (Array.isArray(blocks))
          for (const def of blocks.flatMap((b) => b.markDefs ?? [])) {
            const match = def._type === 'link' && def.href ? OLD_HREF.exec(def.href) : null
            if (!match) continue
            const href = `/chanting/${match[1]}`
            console.log(`${doc._id}: ${def.href} -> ${href}`)
            def.href = href
            changed++
          }
    if (changed) mutations.push({ patch: { id: doc._id, ifRevisionID: doc._rev, set: { body: doc.body } } })
    console.log(`${doc._id}: ${changed} link(s) to update`)
  }

  if (dryRun || !mutations.length) return
  const mutate = await fetch(`${api}/mutate/${dataset}?returnIds=true`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ mutations }),
  })
  const result = await mutate.json()
  if (!mutate.ok) throw new Error(JSON.stringify(result))
  console.log('Updated:', result.results?.map((r: { id: string }) => r.id).join(', '))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
