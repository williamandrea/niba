import { fileURLToPath } from 'node:url'

const root = (p: string) => fileURLToPath(new URL(`../${p}`, import.meta.url))

try {
  process.loadEnvFile(root('../.env'))
} catch {
  // Rely on process.env
}

const projectId = process.env.SANITY_PROJECT_ID
const dataset = process.env.SANITY_DATASET || 'production'
const token = process.env.SANITY_WRITE_TOKEN

if (!projectId || !token) {
  console.error('Missing SANITY_PROJECT_ID or SANITY_WRITE_TOKEN')
  process.exit(1)
}

const DOC_ID = 'page-about'
const api = `https://${projectId}.api.sanity.io/v2026-09-30/data`
const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

let keyCounter = 0
const nextKey = () => `abt${String(++keyCounter).padStart(3, '0')}`

const block = (text: string, extra: Record<string, unknown> = {}) => ({
  _key: nextKey(),
  _type: 'block',
  style: 'normal',
  markDefs: [],
  children: [
    {
      _key: `${nextKey()}s`,
      _type: 'span',
      marks: [],
      text,
    },
  ],
  ...extra,
})

const bullet = (text: string) => block(text, { level: 1, listItem: 'bullet' })

const section = (_key: string, heading: string, background: string, content: unknown[], images?: unknown[]) => ({
  _key,
  _type: 'pageSection',
  background,
  heading: { _type: 'localeString', en: heading },
  content: { _type: 'localeBlockContent', en: content },
  ...(images?.length ? { images } : {}),
})

type AboutDoc = { _rev: string; body?: { images?: unknown[] }[] }

async function main() {
  const res = await fetch(`${api}/doc/${dataset}/${DOC_ID}`, { headers })
  const current: AboutDoc | undefined = (await res.json()).documents?.[0]
  if (!current) throw new Error(`Document ${DOC_ID} not found`)

  // Keep the photos already on the page and show them in the top section.
  const images = (current.body ?? []).flatMap((s) => s.images ?? [])

  const body = [
    section(
      's077',
      'Nā Uyana Aranya',
      'light',
      [
        block(
          'Nā Uyana Aranya (‘Ironwood Grove Forest Monastery’) is one of the oldest Buddhist forest monasteries in Sri Lanka, dating back to the time of King Uttiya (3rd Century BCE). The modern revival of this ancient monastery during the past few decades has seen its emergence as one of the main meditation centres in the country. Today it is again a home to a thriving community of monastic and lay Buddhist practitioners.',
        ),
        block(
          'Nā Uyana Aranya is the largest meditation monastery of Śrī Kalyāṇī Yogāśrama Saṃsthā (also known as Galduwa Tradition), the main forest monastic organisation of Sri Lanka.',
        ),
      ],
      images,
    ),
    section('s061', 'Na Uyana Aranya Indonesia', 'warm', [
      block(
        'Na Uyana Aranya Indonesia is a Theravada Buddhist community in Medan, North Sumatra. We come together to learn the Buddha’s teaching, to practise meditation, and to support the monastic Sangha.',
      ),
      block('Everyone is welcome: families, young people, and anyone curious about the Dhamma.'),
    ]),
    section('s068', 'AT A GLANCE', 'light', [
      bullet('Follows the Pa-Auk Meditation System.'),
      bullet('Strict adherence to Vinaya (Buddhist Monastic Discipline) and the Theravada tradition.'),
      bullet('Strong loving-kindness atmosphere'),
      bullet('NIBA, a Sunday Dhamma school for children and teenagers'),
      bullet('A weekly Abhidhamma discussion'),
      bullet('Retreats and pabbajjā (temporary ordination) programs'),
    ]),
  ]

  console.log('Updating About page sections in Sanity...')
  const mutate = await fetch(`${api}/mutate/${dataset}?returnIds=true`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ mutations: [{ patch: { id: DOC_ID, ifRevisionID: current._rev, set: { body } } }] }),
  })
  const result = await mutate.json()
  if (!mutate.ok) throw new Error(JSON.stringify(result))
  console.log('Updated document with ID:', result.results?.[0]?.id)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
