# Images for the migration

nauyana.id blocks automated downloads, so the migration may not be able to
fetch images from the old site. When that happens, `pnpm migrate` prints a
list of missing files. Download them by hand (open each URL in a browser and
save it) and put them in this folder with the same file names, then run
`pnpm migrate` again.

Files in this folder are not committed to git.
