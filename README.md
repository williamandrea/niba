# Na Uyana Aranya Indonesia website

The website for [nauyana.id](https://nauyana.id): a Theravada Buddhist community in Medan
with a Sunday Dhamma school for children (NIBA), weekly programs, and retreats.

- **Website:** TanStack Start (React, TypeScript) + Tailwind CSS v4, on Cloudflare Workers (free plan).
- **Content:** Sanity (free plan). Volunteers edit everything in Sanity Studio, a separate app at
  `https://<name>.sanity.studio`.
- **No backend, database, or forms.** Contact and registration go through WhatsApp links.
- **Cost:** $0. Everything runs on free tiers.

## Repo layout

| Folder       | What it is                                                  |
| ------------ | ----------------------------------------------------------- |
| `web/`       | The public website (TanStack Start, deployed to Cloudflare) |
| `studio/`    | Sanity Studio, where admins edit content (`sanity deploy`)  |
| `migration/` | One-time WordPress import + seed content (`pnpm migrate`)   |

pnpm workspaces. ESLint + Prettier at the root.

## Requirements

- Node.js 22+ and pnpm 10 (`corepack enable`)
- A free [Sanity](https://www.sanity.io) account and project
- A free [Cloudflare](https://dash.cloudflare.com) account

## 1. Set up

```bash
pnpm install
cp .env.example .env   # then fill it in
```

### Environment variables (root `.env`)

| Name                     | Used by                | Secret? | What it is                                                                       |
| ------------------------ | ---------------------- | ------- | -------------------------------------------------------------------------------- |
| `SANITY_PROJECT_ID`      | web, studio, migration | no      | From sanity.io/manage                                                            |
| `SANITY_DATASET`         | web, studio, migration | no      | Usually `production`                                                             |
| `SITE_URL`               | web, studio            | no      | `https://nauyana.id` (no trailing slash). Canonical URLs, sitemap, preview links |
| `SANITY_STUDIO_SITE_URL` | studio                 | no      | Where "Preview on site" opens. Defaults to `SITE_URL`                            |
| `SANITY_STUDIO_APP_ID`   | studio                 | no      | Printed by the first `sanity deploy`. Keeps later deploys on the same Studio     |
| `SANITY_WRITE_TOKEN`     | migration only         | **yes** | Editor token from sanity.io/manage → API → Tokens. Keep it in `.env` only        |
| `SANITY_API_HOST`        | web (optional)         | no      | Only for testing against a local mock API. Leave empty                           |

The website gets `SANITY_PROJECT_ID`, `SANITY_DATASET`, and `SITE_URL` at **build time**
(see `web/vite.config.ts`). Only those three values reach the browser. Never add tokens there.

### Create the Sanity project

1. Create a project at [sanity.io/manage](https://www.sanity.io/manage) (free plan) with a `production` dataset.
2. Make the dataset **public** (Datasets → production → Visibility: Public). The site reads published
   content without a token.
3. Put the project ID in `.env`.

## 2. Run locally

```bash
pnpm dev            # website on http://localhost:3000
pnpm dev:studio     # Studio on http://localhost:3333
```

Add `http://localhost:3000` and `http://localhost:3333` as CORS origins (see below) the first time.

After changing a schema or a GROQ query, regenerate the types:

```bash
pnpm typegen        # studio/schema.json → web/src/lib/sanity/sanity.types.ts
```

Before pushing: `pnpm check` (lint, type-check, formatting).

## 3. Import content from WordPress

```bash
pnpm migrate --dry-run   # shows what would happen; writes migration/out/documents.ndjson
pnpm migrate             # imports into Sanity
```

The script imports the 3 published Dhammapada articles (same URLs: `/dhammapada/<slug>/`),
uploads the logo and homepage photos, creates starter content (settings, homepage, programs,
events, teachers, residing venerables, contacts, pages), and prints a report.

- **Images:** nauyana.id blocks bots, so downloads may fail. The report lists missing files.
  Save them from the old site into `migration/images/` with the same names and run again.
- **Re-running is safe:** every document has a fixed ID, so it updates instead of duplicating.
  But it **overwrites** those documents, including edits made in the Studio. Run it before admins
  start editing.
- Anything unsure is marked `TODO:` in the Studio. The public site hides TODO notes automatically.

## 4. Deploy the website (Cloudflare Workers)

The site deploys with **Workers Builds** from GitHub: every push to `main` goes live, and pull
requests get a preview URL.

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Import a repository** → pick this repo.
2. Build settings:
   - **Root directory:** `/` (the repo root, so pnpm sees the workspace)
   - **Build command:** `pnpm --filter web build`
   - **Deploy command:** `pnpm --filter web exec wrangler deploy`
   - **Preview command (non-production branches):** `pnpm --filter web exec wrangler preview`
   - **Production branch:** `main`. Turn on **builds for non-production branches** for PR previews.
   - **Build watch paths** (optional): include `web/*`, `pnpm-lock.yaml`.
3. **Build variables** (Settings → Build → Variables): `SANITY_PROJECT_ID`, `SANITY_DATASET`,
   `SITE_URL=https://nauyana.id`. These are needed at build time, not runtime.
4. The Worker name comes from `web/wrangler.jsonc` (`nauyana-web`).

Manual deploy from your machine: `pnpm --filter web deploy` (after `npx wrangler login`).

### Custom domain (nauyana.id)

1. Add `nauyana.id` to Cloudflare (Websites → Add a domain, free plan) and switch the domain's
   nameservers at your registrar to the two Cloudflare gives you. Wait until it shows **Active**.
2. Workers & Pages → `nauyana-web` → **Settings → Domains & Routes → Add → Custom domain**:
   add `nauyana.id`, then `www.nauyana.id`. Cloudflare creates the DNS records and certificate.
3. Redirect `www` to the bare domain: Rules → **Redirect Rules** → "Redirect from WWW to root" template.
4. Remove the old WordPress DNS records for the root only after the Worker domain works.

### Caching

Every page is server-rendered and sent with:

```
Cache-Control: public, s-maxage=300, stale-while-revalidate=86400
Cloudflare-CDN-Cache-Control: max-age=300, stale-while-revalidate=86400
```

`wrangler.jsonc` turns on **Workers Caching**, so Cloudflare serves cached pages without running
the Worker. Admin edits appear within about 5 minutes. The cache belongs to each deployed
version of the Worker, so a new deploy (for example **Retry build** on the latest build in
Workers Builds) starts with an empty cache. Zone-level "Purge cache" in the dashboard does not
affect it.

### Bundle size

Measured with `pnpm --filter web build` then `npx wrangler deploy --dry-run` (in `web/`):

| Date       | Total upload | Gzip    | Free plan limit (Worker size, uncompressed) |
| ---------- | ------------ | ------- | ------------------------------------------- |
| 2026-10-01 | 1,454 KiB    | 319 KiB | 64 MiB                                      |

Re-check after the first real deploy (the dashboard shows the size of each version) and update
this table. The Studio is a separate app, so it never adds to the Worker.

## 5. Deploy the Studio

```bash
pnpm deploy:studio
```

The first time, it asks for a hostname (e.g. `nauyana` → `https://nauyana.sanity.studio`) and
prints an app ID. Put it in `.env` as `SANITY_STUDIO_APP_ID` so later deploys reuse the same Studio.
The Studio updates itself to new Sanity versions (`autoUpdates` in `studio/sanity.cli.ts`).

### CORS origins

The Studio and the website need to be allowed to talk to Sanity:

```bash
cd studio
npx sanity cors add https://nauyana.id --no-credentials
npx sanity cors add http://localhost:3000 --no-credentials
npx sanity cors add http://localhost:3333 --credentials
```

`sanity deploy` normally adds the hosted `*.sanity.studio` address for you. If admins can't log
in there, add it the same way with `--credentials`.

## 6. Admins

### Invite an admin

1. [sanity.io/manage](https://www.sanity.io/manage) → the project → **Members** → **Invite members**.
2. Enter their email and choose the **Editor** role (or **Administrator** for the person who
   manages members). The free plan has a limited number of seats; check
   [sanity.io/pricing](https://www.sanity.io/pricing) for the current number.
3. They accept the email invitation and create a Sanity login (Google, GitHub, or email).

### How admins log in and edit

1. Open the Studio address (e.g. `https://nauyana.sanity.studio`) and log in.
2. Pick a section on the left: **Settings**, **Homepage sections**, **Articles**, **Events**,
   **Programs**, **Teachers**, **Contacts**, **Pages**.
3. Edit, then press **Publish**. Use **Preview on site** (in the ⋯ / actions menu at the bottom)
   to open the live page. Changes show on the site within about 5 minutes.
4. Search the Studio for `TODO:` to find things that still need checking.

Tips for admins:

- **Events** move to "Past events" by themselves after their last day.
- **Residing venerables** appear on the homepage only between their residency start and end dates.
- **WhatsApp numbers** start with `+` and the country code, with no spaces: `+6281378880880`.
- **Pali verses** in articles: use the "Pali verse" block from the **+** menu. The newest
  Dhammapada article's first verse is shown on the homepage.
- Every photo needs **alt text**: a short description for people who cannot see it.

## Routes

| Path                                                | Content                                           |
| --------------------------------------------------- | ------------------------------------------------- |
| `/`                                                 | Homepage                                          |
| `/blog/`                                            | Articles, with search, category filter, pages     |
| `/<category>/<slug>/` (e.g. `/dhammapada/<slug>/`)  | Article                                           |
| `/about/`, `/books/`, `/chanting/`, `/contact/`     | Pages (Sanity `page` with that slug)              |
| `/niba/`, `/niba/registration/`                     | Page + NIBA class times + WhatsApp buttons        |
| `/programs/`, `/teachers/`, `/residing-venerables/` | Lists (optional intro from a page with that slug) |
| `/events/`, `/events/past/`, `/events/<slug>/`      | Events (upcoming/past computed from dates)        |
| `/<slug>/`                                          | Any other Sanity page                             |
| `/sitemap.xml`, `/robots.txt`                       | Generated                                         |

Old WordPress links (`/?p=85`, `/?page_id=161`, `/?s=…`, `/feed/`, `/category/…`, `/page/2/`)
redirect permanently to the closest page (`web/src/lib/legacy-redirects.ts`). URLs without a
trailing slash redirect to the version with one, like WordPress.

## Decisions

Choices made where the brief was open, or where the current docs required a change:

1. **Homepage content is its own singleton ("Homepage sections")** with the hero, intro, teacher
   quote, and short section intros. The brief listed these under Settings but also asked for a
   separate "Homepage sections" desk item; two documents is the simplest way to give both.
   Settings keeps site name, logo, menu, footer, and default SEO.
2. **Edge caching uses Workers Caching plus an extra header.** Cloudflare's docs say responses
   from a Worker are cached only with `"cache": { "enabled": true }`, and that `s-maxage`
   turns off `stale-while-revalidate`. So pages send the requested `Cache-Control` and also
   `Cloudflare-CDN-Cache-Control: max-age=300, stale-while-revalidate=86400` for the edge.
3. **Sanity is only called from server functions** (`web/src/lib/sanity/api.ts`). This keeps
   `@sanity/client` out of the browser bundle, and client-side page changes are cached too.
4. **One `.env` at the repo root** for all three apps. The website gets the public values at
   build time through `define`, not `VITE_` variables, so a token can't leak by prefix.
5. **TODO notes are hidden on the public site.** Text like `TODO: …` stays visible in the Studio
   so admins find it, but the website removes it (and hides blocks left empty).
6. **Programs have an optional "Schedule note"** for notes like "except public holidays". It also
   holds the TODOs about the NIBA and Tuesday times.
7. **Pages are built from sections** (heading, rich text, up to 5 photos as a collage, light or
   warm background). That's how "Portable Text with sections" was read.
8. **Events: "Guided by" is two fields**, a teacher from the list or a typed name.
9. **Article URLs are `/<category slug>/<post slug>/`**, matching WordPress. Category and page
   slugs can't use addresses the site already uses (`blog`, `events`, …); the Studio checks this.
10. **The NIBA pages find the NIBA program** by a slug starting with `niba` or a name containing
    "NIBA". The seeded program's slug is `niba-dhammapada-class`.
11. **Fonts are self-hosted, subset variable fonts** (Latin, Latin Extended, Latin Extended
    Additional, and combining accents), so every Pali mark renders. Plus Jakarta Sans has no
    precomposed `ṁ`; the browser builds it from `m` + combining dot. Libre Baskerville's license
    reserves its name for modified versions; if that matters to you, rename the subset files'
    family or ask the authors (this is how most web font services ship it).
12. **Colour contrast:** small text that would have been saffron uses brown-700, and buttons and
    the hero panel use saffron-600 with white text, so text passes WCAG AA. Saffron-500 stays
    for decoration.
13. **Teacher cards on phones** show a small photo beside the name, so tall photos don't stack.
14. **Residing venerables page** shows current, upcoming, and previous residencies. The homepage
    shows only those residing today (Medan time).
15. **"Preview on site" opens the published page.** There is no draft preview (it would need a
    token and a server), so the button is off until a document is published.
16. **Migration:**
    - The WordPress export includes a photo titled "Ven Pak Auk Sayadaw"; it was attached to
      Pa-Auk Sayadaw. Remove it in the Studio if wrong.
    - "Dhammapada Verse 2" was copied from a PDF in an old Pali font ("Manopubbaïgamà"). The script
      converts those letters (à→ā, ï→ṅ, ñ→ṭ, ü→ṃ, ã→ī) and reports it. Please check the spelling.
    - Verse 1 had its Pali in plain paragraphs, not columns; it is also turned into a verse block.
      Footnote numbers inside the verse were removed.
    - Images with poor titles (screenshots, UUIDs) get `TODO:` alt text or the article title.
    - Article excerpts are the first real paragraph (WordPress excerpts were empty).
17. **Search** uses GROQ `match` with word prefixes ("medit" finds "meditation"). 9 articles per page.
18. **Studio "Vision" tab** is kept for the developer to test GROQ. Admins can ignore it.

## Known issues to review

From the migration report (see `pnpm migrate --dry-run`):

- "Dhammapada Verse 3" ends mid-story. A TODO note was added at the end of the article.
- "Dhammapada Verse 2": the verse line "manoseṭṭā" is missing an "h" in the source.
- The "About us" WordPress template contains another organisation's text and was ignored.
  The new About page has original placeholder text marked TODO.
- Links to nalarnurani.org were ignored.
- NIBA class time (09.30–11.30 or 14.00–17.00) and the Tuesday meditation session need confirming.
- WhatsApp numbers for Mr. Arman and Mrs. Fenny are missing; their buttons stay hidden until added.
- Teacher bios and photos (except Pa-Auk Sayadaw) are missing; a lotus placeholder is shown.
