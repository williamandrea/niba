import { fileURLToPath } from 'node:url'

/*
 * Fills the "Search & sharing" fields before the site moves to nauyana.id:
 * - Settings: a homepage title with keywords, and a default sharing image
 *   (the homepage hero photo, or the first photo on the About page).
 * - Pages: a short description for Google, in English and Indonesian.
 * Text an admin already wrote is kept. The homepage title is only replaced
 * while it is still just the site name. Drafts get the same changes, so
 * publishing a draft later doesn't undo them.
 *
 * Run: node migration/src/update-seo.ts [--dry-run]
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

type Text = { en: string; id: string }

/** Under 60 characters, so Google shows it whole. */
const HOME_TITLE: Text = {
  en: 'Na Uyana Aranya Indonesia – Theravada Buddhism in Medan',
  id: 'Na Uyana Aranya Indonesia – Buddhis Theravada di Medan',
}

/** Page document ID -> description (160 characters at most). */
const DESCRIPTIONS: Record<string, Text> = {
  'page-about': {
    en: 'A Theravada Buddhist community in Medan, inspired by Nā Uyana Aranya in Sri Lanka. We follow the Pa-Auk meditation system and support the monastic Sangha.',
    id: 'Komunitas Buddhis Theravada di Medan yang terinspirasi oleh Nā Uyana Aranya, Sri Lanka. Kami mengikuti sistem meditasi Pa-Auk dan menyokong Sangha monastik.',
  },
  'page-books': {
    en: 'Free Dhamma books to read and download as PDF, including Knowing and Seeing by Pa-Auk Sayadaw and books from Nā Uyana Aranya, Sri Lanka.',
    id: 'Buku Dhamma gratis untuk dibaca dan diunduh dalam PDF, termasuk Knowing and Seeing karya Pa-Auk Sayadaw dan buku dari Nā Uyana Aranya, Sri Lanka.',
  },
  'page-chanting': {
    en: 'Pali chanting (paritta) we recite together: Daily Chants of the Pa-Auk tradition, the Maha Pirith and the Pātimokkha, with meanings and recordings.',
    id: 'Paritta berbahasa Pali yang kami bacakan bersama: Daily Chants tradisi Pa-Auk, Maha Pirith, dan Pātimokkha, lengkap dengan arti dan rekamannya.',
  },
  'page-contact': {
    en: 'Contact Na Uyana Aranya Indonesia in Medan by WhatsApp or email. Find our address and ask about NIBA, meditation programs and retreats.',
    id: 'Hubungi Na Uyana Aranya Indonesia di Medan lewat WhatsApp atau email. Lihat alamat kami dan tanyakan tentang NIBA, program meditasi, dan retret.',
  },
  'page-meditation': {
    en: 'The meditation we practise in Medan: the Pa-Auk method of samatha (concentration) and vipassanā (insight), as taught by Pa-Auk Sayadaw.',
    id: 'Meditasi yang kami praktikkan di Medan: metode Pa-Auk untuk samatha (konsentrasi) dan vipassanā (pandangan terang), sesuai ajaran Pa-Auk Sayadaw.',
  },
  'page-niba': {
    en: 'NIBA is our Sunday Dhamma school for children and teens in Medan. Dhammapada stories, chanting and gentle meditation that teach kindness and honesty.',
    id: 'NIBA adalah sekolah Minggu Dhamma kami untuk anak dan remaja di Medan. Kisah Dhammapada, paritta, dan meditasi yang mengajarkan kebaikan dan kejujuran.',
  },
  'page-niba-registration': {
    en: 'Register your child for NIBA, our free Sunday Dhamma school in Medan. See the class times and sign up on WhatsApp in a minute.',
    id: 'Daftarkan anak Anda di NIBA, sekolah Minggu Dhamma gratis kami di Medan. Lihat jadwal kelas dan daftar lewat WhatsApp dalam satu menit.',
  },
}

type Image = { _type?: string; asset?: { _ref?: string }; hotspot?: unknown; crop?: unknown; alt?: string }
type Doc = {
  _id: string
  siteName?: string
  seo?: { title?: Partial<Text>; description?: Partial<Text>; ogImage?: Image }
  hero?: { image?: Image }
  body?: { images?: Image[] }[]
}

async function getDoc(id: string): Promise<Doc | undefined> {
  const res = await fetch(`${api}/doc/${dataset}/${id}`, { headers })
  if (!res.ok) throw new Error(`${id}: ${res.status} ${await res.text()}`)
  return (await res.json()).documents?.[0]
}

/** The document and its draft, when there is one. */
async function getVersions(id: string) {
  const docs = await Promise.all([getDoc(id), getDoc(`drafts.${id}`)])
  return docs.filter((d): d is Doc => Boolean(d))
}

const hasText = (v: unknown) => typeof v === 'string' && v.trim().length > 0
const hasImage = (img: Image | undefined): img is Image => Boolean(img?.asset?._ref)

/** Fills empty languages only. */
function missingText(current: Partial<Text> | undefined, wanted: Text) {
  const set: Partial<Text> = {}
  if (!hasText(current?.en)) set.en = wanted.en
  if (!hasText(current?.id)) set.id = wanted.id
  return set
}

async function findSharingImage() {
  const [home] = await getVersions('homepage')
  if (hasImage(home?.hero?.image)) return { from: 'homepage hero', image: home.hero.image }
  const about = await getDoc('page-about')
  const photo = about?.body?.flatMap((s) => s.images ?? []).find(hasImage)
  if (photo) return { from: 'About page', image: photo }
  return null
}

type Mutation = { patch: { id: string; setIfMissing?: object; set?: object } }

/** Creates the parent objects first: mutations in one transaction run in order. */
const patch = (id: string, parents: object, set: object): Mutation[] => [
  { patch: { id, setIfMissing: parents } },
  { patch: { id, set } },
]

async function main() {
  const mutations: Mutation[] = []
  const report: string[] = []
  let docCount = 0

  // Settings: homepage title and default sharing image.
  const settings = await getVersions('siteSettings')
  if (!settings.length) throw new Error('siteSettings not found')
  const sharing = await findSharingImage()
  if (!sharing) report.push('No photo found for the sharing image. Upload one in Settings → Search & sharing.')
  for (const doc of settings) {
    const set: Record<string, unknown> = {}
    for (const lang of ['en', 'id'] as const) {
      const title = doc.seo?.title?.[lang]?.trim()
      if (!title || title === doc.siteName?.trim()) set[`seo.title.${lang}`] = HOME_TITLE[lang]
    }
    if (sharing && !hasImage(doc.seo?.ogImage)) {
      const { asset, hotspot, crop, alt } = sharing.image
      set['seo.ogImage'] = {
        _type: 'image',
        asset: { _type: 'reference', _ref: asset?._ref },
        ...(hotspot ? { hotspot } : {}),
        ...(crop ? { crop } : {}),
        alt: alt || 'Na Uyana Aranya Indonesia',
      }
      report.push(`${doc._id}: sharing image from the ${sharing.from}`)
    }
    if (Object.keys(set).some((k) => k.startsWith('seo.title')))
      report.push(
        `${doc._id}: homepage title → ${Object.keys(set)
          .filter((k) => k.startsWith('seo.title'))
          .join(', ')}`,
      )
    if (!Object.keys(set).length) continue
    docCount++
    mutations.push(...patch(doc._id, { seo: { _type: 'seo' }, 'seo.title': { _type: 'localeString' } }, set))
  }

  // Pages: descriptions.
  for (const [id, text] of Object.entries(DESCRIPTIONS)) {
    const versions = await getVersions(id)
    if (!versions.length) report.push(`${id}: not found, skipped`)
    for (const doc of versions) {
      const missing = missingText(doc.seo?.description, text)
      if (!Object.keys(missing).length) {
        report.push(`${doc._id}: already has a description, skipped`)
        continue
      }
      report.push(`${doc._id}: description (${Object.keys(missing).join(', ')})`)
      docCount++
      mutations.push(
        ...patch(
          doc._id,
          { seo: { _type: 'seo' }, 'seo.description': { _type: 'localeText' } },
          Object.fromEntries(Object.entries(missing).map(([lang, value]) => [`seo.description.${lang}`, value])),
        ),
      )
    }
  }

  console.log(report.join('\n'))
  if (!mutations.length || dryRun) {
    console.log(`${docCount} document(s) to update${dryRun ? ' (dry run)' : ''}`)
    return
  }
  const res = await fetch(`${api}/mutate/${dataset}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ mutations }),
  })
  const result = await res.json()
  if (!res.ok) throw new Error(JSON.stringify(result))
  console.log(`Updated ${docCount} document(s)`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
