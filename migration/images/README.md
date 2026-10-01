# Images for the migration

nauyana.id blocks automated downloads, so the migration may not be able to
fetch images from the old site. When that happens, `pnpm migrate` prints a
list of missing images with their links. Open each link in a browser, save the
image into this folder, and run `pnpm migrate` again.

The name must match the one in the report, but the suffixes WordPress adds are
fine, and so is any image type. For "hero-section", all of these work:
`hero-section.webp`, `hero-section-1024x683.webp`, `hero-section-scaled.jpg`.
If there are several copies, the biggest file is used.

Files in this folder are not committed to git.
