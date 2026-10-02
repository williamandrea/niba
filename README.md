# Na Uyana Aranya Indonesia website

The website for [nauyana.id](https://nauyana.id): a Theravada Buddhist community in Medan
with a Sunday Dhamma school for children (NIBA), weekly programs, and retreats.

- **Website:** TanStack Start (React, TypeScript) + Tailwind CSS v4, on Cloudflare Workers (free plan).
- **Content:** Sanity (free plan). Volunteers edit everything in Sanity Studio, a separate app at
  `https://<name>.sanity.studio`.
- **Two languages:** English at the usual addresses (`/about/`) and Indonesian under `/id/`
  (`/id/about/`), with an EN | ID switch in the header. See [Languages](#languages-english-and-indonesian).
- **No backend, database, or forms.** Contact and registration go through WhatsApp links.
- **Cost:** $0. Everything runs on free tiers.

## Repo layout

| Folder    | What it is                                                  |
| --------- | ----------------------------------------------------------- |
| `web/`    | The public website (TanStack Start, deployed to Cloudflare) |
| `studio/` | Sanity Studio, where admins edit content (`sanity deploy`)  |

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

| Name                     | Used by        | Secret? | What it is                                                                       |
| ------------------------ | -------------- | ------- | -------------------------------------------------------------------------------- |
| `SANITY_PROJECT_ID`      | web, studio    | no      | From sanity.io/manage                                                            |
| `SANITY_DATASET`         | web, studio    | no      | Usually `production`                                                             |
| `SITE_URL`               | web, studio    | no      | `https://nauyana.id` (no trailing slash). Canonical URLs, sitemap, preview links |
| `SANITY_STUDIO_SITE_URL` | studio         | no      | Where "Preview on site" opens. Defaults to `SITE_URL`                            |
| `SANITY_STUDIO_APP_ID`   | studio         | no      | Printed by the first `sanity deploy`. Keeps later deploys on the same Studio     |
| `SANITY_API_HOST`        | web (optional) | no      | Only for testing against a local mock API. Leave empty                           |

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

## 3. Deploy the website (Cloudflare Workers)

The site deploys with **GitHub Actions** (`.github/workflows/deploy.yml`). Every pull request
gets checks (lint, types, format), a build, and a preview link posted on the PR. Every push to
`main` does the same checks and build, then updates the live site.

One-time setup:

1. Cloudflare → **My Profile → API Tokens → Create Token** → template **Edit Cloudflare
   Workers** → create, then copy the token.
2. GitHub repo → **Settings → Secrets and variables → Actions**:
   - **Secrets** tab: `CLOUDFLARE_API_TOKEN` = the token.
   - **Variables** tab: `SANITY_PROJECT_ID` = the Sanity project ID.
3. If the repo was connected to Cloudflare **Workers Builds** before, disconnect it
   (Workers & Pages → `niba` → **Settings → Builds → Disconnect**) so the code isn't built twice.

`SANITY_DATASET` (`production`), `SITE_URL` (`https://nauyana.id`) and the Cloudflare account ID
are set in the workflow file. The Worker is named `niba`, and the `name` in `web/wrangler.jsonc`
must stay the same. `web/wrangler.jsonc` has the required (empty) `previews` block for
`wrangler preview`.

If a run fails, open the PR's **Checks** tab or the repo's **Actions** tab to read the log.
To run it again without a code change, use **Re-run jobs** there.

Manual deploy from your machine: `pnpm --filter web run deploy` (after `npx wrangler login`).

### Custom domain (nauyana.id)

1. Add `nauyana.id` to Cloudflare (Websites → Add a domain, free plan) and switch the domain's
   nameservers at your registrar to the two Cloudflare gives you. Wait until it shows **Active**.
2. Workers & Pages → `niba` → **Settings → Domains & Routes → Add → Custom domain**:
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
version of the Worker, so a new deploy (for example **Re-run jobs** on the latest `main` run in
GitHub Actions) starts with an empty cache. Zone-level "Purge cache" in the dashboard does not
affect it.

### Bundle size

Measured with `pnpm --filter web build` then `npx wrangler deploy --dry-run` (in `web/`):

| Date       | Total upload | Gzip    | Free plan limit (Worker size, uncompressed) |
| ---------- | ------------ | ------- | ------------------------------------------- |
| 2026-10-01 | 1,454 KiB    | 319 KiB | 64 MiB                                      |

Re-check after the first real deploy (the dashboard shows the size of each version) and update
this table. The Studio is a separate app, so it never adds to the Worker.

## 4. Deploy the Studio

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

## 5. Admins

### Invite an admin

1. [sanity.io/manage](https://www.sanity.io/manage) → the project → **Members** → **Invite members**.
2. Enter their email and choose the **Editor** role (or **Administrator** for the person who
   manages members). The free plan has a limited number of seats; check
   [sanity.io/pricing](https://www.sanity.io/pricing) for the current number.
3. They accept the email invitation and create a Sanity login (Google, GitHub, or email).

### How admins log in and edit

1. Open the Studio address (e.g. `https://nauyana.sanity.studio`) and log in.
2. Pick a section on the left: **Settings**, **Homepage sections**, **Articles**, **Events**,
   **Programs**, **Teachers**, **Contacts**, **Pages**, **Not yet in Indonesian**.
3. Edit, then press **Publish**. Use **Preview on site (English)** or **(Indonesian)** (in the ⋯ /
   actions menu at the bottom) to open the live page. Changes show on the site within about 5 minutes.
4. Search the Studio for `TODO:` to find things that still need checking.

Tips for admins:

- **Events** move to "Past events" by themselves after their last day.
- **Residing venerables** appear on the homepage only between their residency start and end dates.
- **WhatsApp numbers** start with `+` and the country code, with no spaces: `+6281378880880`.
- **Pali verses** in articles: use the "Pali verse" block from the **+** menu. The newest
  Dhammapada article's first verse is shown on the homepage.
- Every photo needs **alt text**: a short description for people who cannot see it.

### Languages (English and Indonesian)

Visitors switch with the **EN | ID** buttons in the header. Indonesian pages have the same
address with `/id` in front: `/programs/` → `/id/programs/`.

**For admins:** every text field has two boxes, **English** and **Bahasa Indonesia**.

- English is required where the field is required. Indonesian is optional.
- If the Indonesian box is empty, the Indonesian site shows the English text, so nothing is
  ever blank. A yellow warning ("Not translated yet") marks those fields.
- **Not yet in Indonesian** (bottom of the Studio menu) lists articles, events, pages, programs
  and teachers whose main text has no Indonesian yet.
- Articles and events have a separate rich text box per language. Add a "Pali verse" block in
  each one. On the Indonesian homepage, the featured verse comes from the Indonesian article text
  when it has one.
- These stay the same in both languages: names of people, Pali verses on the homepage, addresses,
  web addresses (slugs), dates, and photo alt text.
- Links to site pages (like `/programs/`) open in the visitor's language by themselves.

**For developers:**

- Fixed texts (buttons, headings, labels, month names) are in `web/src/lib/messages.ts`.
  Add a text to `en` and TypeScript asks for the Indonesian one.
- Sanity stores translatable fields as `{ en, id }` (`studio/schemaTypes/objects/locale.ts`).
  Add one with `localeField()` from `studio/lib/fields.ts`. The server functions pick the language (`web/src/lib/sanity/localize.ts`),
  so components and most queries never see `{ en, id }`.
- The `/id/` prefix is handled by a router rewrite (`web/src/lib/i18n.ts`): routes keep their
  English paths and read the language from a hidden `lang` search param. Use `useLang()` and
  `useT()` in components, and `langDeps` as `loaderDeps` in routes that load data.

### Instagram photos on the homepage

The homepage can show the newest photos from Instagram (6 on Behold's free plan, up to 9 on a
paid plan). It uses [Behold](https://behold.so), a free service that reads the Instagram feed.
The section stays hidden until a feed link is added.

1. **The Instagram account must be a Business or Creator account.** Meta only lets services read
   those. To check: open the profile in the Instagram app. If you see "Professional dashboard",
   it already is one. Switching (Settings → Account type and tools) is free and keeps all posts
   and followers.
2. Someone who can log in to the Instagram account signs up at [behold.so](https://behold.so)
   (free plan), connects the account, and creates a feed of type **JSON**.
3. Copy the feed link (like `https://feeds.behold.so/abc123`).
4. Studio → **Homepage sections** → **Instagram** tab → paste it in **Behold feed link** → **Publish**.

Behold's free plan updates once a day and allows 1,200 feed requests a month. The website keeps
the feed in Cloudflare's cache for 6 hours, so it stays well under that. If Behold is down or the
limit is reached, the section hides by itself and the rest of the page still works.

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
| `/id/…` (e.g. `/id/`, `/id/programs/`)              | The same pages in Indonesian                      |
| `/sitemap.xml`, `/robots.txt`                       | Generated (sitemap lists both languages)          |

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
4. **One `.env` at the repo root** for both apps. The website gets the public values at
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
    "NIBA". The current program's slug is `niba-dhammapada-class`.
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
16. **Search** uses GROQ `match` with word prefixes ("medit" finds "meditation"). 9 articles per page.
17. **Studio "Vision" tab** is kept for the developer to test GROQ. Admins can ignore it.
18. **Instagram photos come from Behold, not Instagram's API directly.** Both need a Business or
    Creator account, but Behold needs no Meta developer app and renews Instagram's 60-day access
    key by itself. The free plan gives 6 posts. The feed link lives in the Studio, so it can be
    changed without a deploy; the website only accepts `https://feeds.behold.so/…` links.
19. **Deploys use GitHub Actions, not Workers Builds.** Workers Builds only shows its logs in the
    Cloudflare dashboard. GitHub Actions shows them on the PR, runs the code checks on every PR,
    and is free (2,000 minutes a month for private repos; a run takes about 2).
20. **Translations are per field, not per document.** Each text field holds English and
    Indonesian side by side, so photos, dates, contacts and slugs are entered once, and a missing
    translation falls back to English field by field. The other common way (a separate copy of each
    document per language) suits sites with many languages but doubles the work for volunteers.
21. **English keeps the old addresses; Indonesian is under `/id/`.** Old links and Google results
    keep working. Pages list each other with `hreflang` tags and in the sitemap. Slugs are shared,
    so `/dhammapada/<slug>/` becomes `/id/dhammapada/<slug>/`.
22. **No automatic language choice from the browser.** Pages are cached at Cloudflare's edge per
    address; choosing by browser language would need a redirect on every visit and break that.
    Visitors pick with the switch, and links keep their choice.
23. **Photo alt text is one language** (written in English). Two alt boxes on every photo would be a
    lot of extra work for little gain. Rich text images inside the Indonesian article text have
    their own alt text.

## Known issues to review

Content to check in the Studio:

- A photo titled "Ven Pak Auk Sayadaw" from the old site is attached to Pa-Auk Sayadaw.
  Remove it if wrong.
- "Dhammapada Verse 2" was copied from a PDF in an old Pali font. Please check the spelling.
- "Dhammapada Verse 3" ends mid-story. A TODO note was added at the end of the article.
- "Dhammapada Verse 2": the verse line "manoseṭṭā" is missing an "h" in the source.
- The "About us" WordPress template contains another organisation's text and was ignored.
  The new About page has original placeholder text marked TODO.
- Links to nalarnurani.org were ignored.
- NIBA class time (09.30–11.30 or 14.00–17.00) and the Tuesday meditation session need confirming.
- WhatsApp numbers for Mr. Arman and Mrs. Fenny are missing; their buttons stay hidden until added.
- Teacher bios and photos (except Pa-Auk Sayadaw) are missing; a lotus placeholder is shown.
