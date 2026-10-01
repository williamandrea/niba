/**
 * WordPress → Sanity migration for nauyana.id.
 *
 *   pnpm migrate --dry-run   # show what would happen, write nothing to Sanity
 *   pnpm migrate             # import posts, upload images, create seed content
 *
 * Safe to re-run: every document has a fixed _id, so running again updates
 * the same documents instead of making copies. Note that it also overwrites
 * edits made in the Studio to those documents.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createClient } from '@sanity/client'
import { convertPost, excerptFrom } from './convert'
import { LOCAL_IMAGES_DIR, loadImage, predictAssetId, uploadImage } from './images'
import { ID, image, seedDocuments, type ImageRef, type SanityDoc, type SeedImages } from './seed'
import { readWxr, type WxrItem } from './wxr'

const dryRun = process.argv.includes('--dry-run')
const root = (p: string) => fileURLToPath(new URL(`../${p}`, import.meta.url))

try {
  process.loadEnvFile(root('../.env'))
} catch {
  // No .env file: rely on the environment.
}

const report = {
  imported: [] as string[],
  skipped: [] as string[],
  todos: [] as string[],
  issues: [] as string[],
  missingImages: [] as string[],
}

/** Homepage and other images to upload, by WordPress attachment id. */
const IMAGE_ROLES: Record<number, { role: keyof SeedImages; alt?: string }> = {
  17: { role: 'logo', alt: 'Na Uyana Aranya Indonesia logo' },
  295: { role: 'hero', alt: 'Na Uyana Aranya Indonesia' },
  40: { role: 'buddhaRupang', alt: 'Buddha rupa at Na Uyana Aranya Indonesia' },
  27: { role: 'nauyana', alt: 'Na Uyana Aranya Indonesia' },
  145: { role: 'pabbajja', alt: 'Pabbajjā participants' },
  144: { role: 'retreat', alt: 'Meditation retreat' },
  224: { role: 'abhidhamma', alt: 'Abhidhamma discussion' },
  132: { role: 'meditation', alt: 'Meditation program' },
  135: { role: 'paAuk', alt: 'Venerable Pa-Auk Sayadaw' },
  // NIBA class photos
  15: { role: 'niba' },
  230: { role: 'niba' },
  231: { role: 'niba' },
  233: { role: 'niba' },
  234: { role: 'niba' },
  235: { role: 'niba' },
  236: { role: 'niba' },
}

/** WordPress titles like "Screenshot 2026-…" or a UUID make poor alt text. */
function altFrom(title: string, fallback: string) {
  const poor =
    /^(screenshot|whatsapp image|img[-_ ]|dsc|[0-9a-f]{8}-[0-9a-f]{4}-)/i.test(title) ||
    /^[\w-]+\.(webp|jpe?g|png)$/i.test(title)
  return poor ? fallback : title
}

async function main() {
  const projectId = process.env.SANITY_PROJECT_ID
  const dataset = process.env.SANITY_DATASET || 'production'
  const token = process.env.SANITY_WRITE_TOKEN
  if (!dryRun && (!projectId || !token)) {
    console.error('Set SANITY_PROJECT_ID and SANITY_WRITE_TOKEN in the root .env (see .env.example), or use --dry-run.')
    process.exit(1)
  }
  const client = createClient({
    projectId: projectId || 'dry-run',
    dataset,
    token,
    apiVersion: '2026-09-30',
    useCdn: false,
  })

  console.log(
    dryRun ? '\n— DRY RUN: nothing will be written to Sanity —\n' : `\nImporting into ${projectId}/${dataset}\n`,
  )

  const { items } = readWxr(root('wordpress-export.xml'))
  const byId = new Map(items.map((i) => [i.id, i]))
  const usedAttachments = new Set<number>()

  /** Loads, uploads (or predicts the id in a dry run), and remembers an attachment. */
  const imageCache = new Map<number, ImageRef>()
  async function attachment(id: number, fallbackAlt: string): Promise<ImageRef> {
    if (imageCache.has(id)) return imageCache.get(id)
    const item = byId.get(id)
    if (!item?.attachmentUrl) return undefined
    usedAttachments.add(id)
    const loaded = await loadImage(item.attachmentUrl)
    if (!loaded) {
      report.missingImages.push(
        decodeURIComponent(new URL(item.attachmentUrl).pathname.split('/').pop() ?? item.attachmentUrl),
      )
      imageCache.set(id, undefined)
      return undefined
    }
    const assetId = dryRun ? predictAssetId(loaded) : await uploadImage(client, loaded)
    const alt = altFrom(item.title, fallbackAlt)
    const ref = { assetId, alt }
    imageCache.set(id, ref)
    console.log(`  image ${loaded.filename} (${loaded.from})`)
    return ref
  }

  // 1. Seed images
  const seedImages: SeedImages = { niba: [] }
  for (const [idText, { role, alt }] of Object.entries(IMAGE_ROLES)) {
    const id = Number(idText)
    const ref = await attachment(id, alt ?? 'TODO: describe this photo of the NIBA class')
    if (role === 'niba') {
      if (ref) seedImages.niba.push(ref)
    } else {
      seedImages[role] = ref
    }
  }
  if (seedImages.paAuk) {
    report.issues.push(
      'Found a photo titled "Ven Pak Auk Sayadaw" in the export and used it for Pa-Auk Sayadaw. Remove it in the Studio if that is wrong.',
    )
  }

  // 2. Posts
  const docs: SanityDoc[] = []
  const categories = new Map<string, string>()
  const posts = items.filter((i) => i.type === 'post')
  for (const post of posts) {
    if (post.status !== 'publish') {
      report.skipped.push(`Post "${post.title}" (status: ${post.status})`)
      continue
    }
    docs.push(await buildPost(post))
  }

  async function buildPost(post: WxrItem): Promise<SanityDoc> {
    const category = post.categories[0] ?? { slug: 'uncategorized', name: 'Uncategorized' }
    const categoryId = `category-${category.slug}`
    categories.set(categoryId, category.name)
    const { blocks, notes } = convertPost(post.content, post.id)

    const thumbId = Number(post.meta._thumbnail_id || 0)
    const cover = thumbId ? await attachment(thumbId, `Cover image for “${post.title}”`) : undefined
    const excerpt = post.excerpt || excerptFrom(blocks)

    if (/Verse 3/i.test(post.title)) {
      report.issues.push(
        `"${post.title}" ends mid-story (at Devala's curse). A TODO note was added at the end of the article.`,
      )
      blocks.push({
        _type: 'callout',
        _key: `wp${post.id}todo`,
        body: 'TODO: this story ends mid-way. Please add the rest of the story from the source.',
      })
    }
    if (Object.keys(notes.legacyPaliFixes).length) {
      report.issues.push(
        `"${post.title}": converted old Pali font letters (${Object.entries(notes.legacyPaliFixes)
          .map(([k, v]) => `${k} ×${v}`)
          .join(', ')}). Please check the Pali spelling.`,
      )
    }
    if (post.id === 143) {
      report.issues.push(
        `"${post.title}": the verse line "manoseṭṭā" is missing an "h" in the source (should likely be "manoseṭṭhā").`,
      )
    }
    if (notes.removedFootnoteMarks) {
      report.issues.push(
        `"${post.title}": removed ${notes.removedFootnoteMarks} footnote number(s) from the verse text.`,
      )
    }
    if (notes.removedLinks.length) report.issues.push(`"${post.title}": removed links ${notes.removedLinks.join(', ')}`)
    if (notes.skippedBlocks.length)
      report.issues.push(`"${post.title}": skipped blocks ${notes.skippedBlocks.join(', ')}`)

    report.imported.push(
      `Article "${post.title}" → /${category.slug}/${post.slug}/ (${blocks.length} blocks, ${notes.verseBlocks} verse, ${notes.joinedLineBreaks} line breaks fixed${cover ? ', cover image' : ', no cover image'})`,
    )
    return {
      _id: `post-wp-${post.id}`,
      _type: 'post',
      title: post.title.replace(/\s{2,}/g, ' '),
      slug: { _type: 'slug', current: post.slug },
      category: { _type: 'reference', _ref: categoryId },
      ...(cover ? { coverImage: image(cover) } : {}),
      excerpt,
      publishedAt: new Date(`${post.date.replace(' ', 'T')}Z`).toISOString(),
      body: blocks,
    }
  }

  for (const [id, title] of categories) {
    docs.unshift({ _id: id, _type: 'category', title, slug: { _type: 'slug', current: id.replace(/^category-/, '') } })
    report.imported.push(`Category "${title}"`)
  }
  if (!categories.has(ID.categoryDhammapada)) {
    report.issues.push('No Dhammapada category was found, so the homepage featured verse will stay hidden.')
  }

  // 3. Seed content
  const seed = seedDocuments(seedImages)
  docs.push(...seed)
  for (const d of seed)
    report.imported.push(`Seed ${d._type} "${String(d.title ?? d.name ?? d.fullName ?? d.siteName ?? d._id)}"`)
  collectTodos(seed)

  // 4. Things we deliberately did not import
  const pages = items.filter((i) => i.type === 'page')
  for (const p of pages) {
    const why = /about us/i.test(p.title)
      ? 'ignored: the template contains text from another organisation'
      : 'rebuilt as new pages in Sanity'
    report.skipped.push(`Page "${p.title}" (${p.status}) – ${why}`)
  }
  const otherTypes = new Map<string, number>()
  for (const i of items) {
    if (i.type === 'post' || i.type === 'page' || i.type === 'attachment') continue
    otherTypes.set(i.type, (otherTypes.get(i.type) ?? 0) + 1)
  }
  for (const [type, count] of otherTypes) report.skipped.push(`${count} × ${type} (WordPress theme/plugin data)`)
  for (const a of items.filter((i) => i.type === 'attachment' && !usedAttachments.has(i.id))) {
    report.skipped.push(`Image "${a.title}" (not used on the new site)`)
  }
  report.issues.push('Links to nalarnurani.org in the WordPress templates were ignored.')

  // 5. Write
  if (dryRun) {
    const outDir = root('out')
    mkdirSync(outDir, { recursive: true })
    writeFileSync(`${outDir}/documents.ndjson`, docs.map((d) => JSON.stringify(d)).join('\n') + '\n')
    console.log(`\nWould create or update ${docs.length} documents. Preview: migration/out/documents.ndjson`)
  } else {
    for (let i = 0; i < docs.length; i += 50) {
      const tx = client.transaction()
      for (const d of docs.slice(i, i + 50)) tx.createOrReplace(d)
      await tx.commit({ visibility: 'async' })
    }
    console.log(`\nCreated or updated ${docs.length} documents.`)
  }

  printReport()
}

function collectTodos(docs: SanityDoc[]) {
  const walk = (value: unknown, path: string, doc: SanityDoc) => {
    if (typeof value === 'string' && value.includes('TODO:')) {
      const label = String(doc.title ?? doc.name ?? doc.fullName ?? doc.siteName ?? doc._id)
      report.todos.push(
        `${doc._type} "${label}" → ${path.replace(/\.(\d+)/g, '[$1]')}: ${value.slice(value.indexOf('TODO:'))}`,
      )
    } else if (Array.isArray(value)) value.forEach((v, i) => walk(v, `${path}.${i}`, doc))
    else if (value && typeof value === 'object') {
      for (const [k, v] of Object.entries(value)) if (!k.startsWith('_')) walk(v, path ? `${path}.${k}` : k, doc)
    }
  }
  for (const d of docs) walk(d, '', d)
}

function printReport() {
  const section = (title: string, lines: string[]) => {
    console.log(`\n${title} (${lines.length})`)
    for (const line of lines) console.log(`  • ${line}`)
  }
  console.log('\n================ MIGRATION REPORT ================')
  section('Imported', report.imported)
  section('Skipped', report.skipped)
  section('TODOs for admins', report.todos)
  section('Known issues to review', report.issues)
  if (report.missingImages.length) {
    section(`Missing images – add these files to ${LOCAL_IMAGES_DIR} and run again`, report.missingImages)
  } else {
    console.log('\nAll images found.')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
