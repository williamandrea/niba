import { fileURLToPath } from 'node:url'

/*
 * Adds the Dhammapada story videos from the shared Google Drive folder
 * (https://drive.google.com/drive/folders/10JSQOZjS--cP0UVC-vgKN8mBfE8r8NBE).
 * Each video takes its title from the matching article and links to it.
 *
 * Run: node migration/src/add-videos.ts [--dry-run]
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

/** First verse number → Drive file ID. */
const VIDEOS: [number, string][] = [
  [1, '1Jzk_r5rUkbnC-2Gs-9pRWxBiPae6Gcsv'],
  [2, '1_EfyV1IWqV-2MFooCQbRiCxrnXUFnF_Z'],
  [3, '1ukFSlcgS8jbOkb6kh-PIv4PTTLwehZ2v'],
  [5, '1sCIercAcC9mrQ-hGob97oAuUVSSdnXFB'],
  [6, '14Djt8qbM70ndw298X7UphjxHtaJgqq3i'],
  [7, '18jvlslFsU2vZJyKV2Df8cT3MfQqB5JHS'],
  [9, '1jHV0wKj3koR2oPx2ZUNYkv52tzFVZJdX'],
  [11, '1rdpo26Bx5YcvVWJbs6uiSVU7Z57jB0HJ'],
  [13, '1rm0PDe5hMSY0E0UiKjgvxo5DZUjwjiBx'],
  [15, '12se8LmFvGfaxIK2ibKZpSfn1kn8GM073'],
  [16, '1GU4aS_F-DHXwh_jhA0UkgdPeUQXtRi4M'],
  [17, '1YHujAo4TQkVo0g6Ugyg7_clG9i9JmzsU'],
  [18, '1c40FOgdHHRVOVFMyI5_XISRNRnpl4YLe'],
]

type Post = { _id: string; title: { en: string; id?: string } }

async function main() {
  const query = `*[_type == "post" && category->slug.current == "dhammapada" && !(_id in path("drafts.**"))]{ _id, title }`
  const res = await fetch(`${api}/query/${dataset}?query=${encodeURIComponent(query)}`, { headers })
  const posts: Post[] = (await res.json()).result ?? []

  const mutations = []
  for (const [verse, fileId] of VIDEOS) {
    const post = posts.find((p) => new RegExp(`^Dhammapada Verse ${verse}[,:]`).test(p.title.en))
    if (!post) throw new Error(`No article found for verse ${verse}`)
    const doc = {
      _id: `video-dhammapada-verse-${verse}`,
      _type: 'video',
      title: { _type: 'localeString', ...post.title },
      driveUrl: `https://drive.google.com/file/d/${fileId}/view`,
      article: { _type: 'reference', _ref: post._id },
      order: verse,
    }
    console.log(`${doc._id}: ${post.title.en} | ${post.title.id ?? '(no Indonesian)'}`)
    mutations.push({ createOrReplace: doc })
  }

  if (dryRun) return console.log(`Dry run: ${VIDEOS.length} video(s) not saved.`)
  const mutate = await fetch(`${api}/mutate/${dataset}?returnIds=true`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ mutations }),
  })
  const result = await mutate.json()
  if (!mutate.ok) throw new Error(JSON.stringify(result))
  console.log(`Saved ${result.results?.length ?? 0} video(s).`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
