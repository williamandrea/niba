import { createFileRoute } from '@tanstack/react-router'
import { buildHead, breadcrumbs, headContext } from '~/lib/seo'
import { langDeps, useT } from '~/lib/i18n'
import { getVideos } from '~/lib/sanity/api'
import { PageHeader } from '~/components/ui/PageHeader'
import { PageSections } from '~/components/page/PageSections'
import { VideoCard } from '~/components/cards/VideoCard'

export const Route = createFileRoute('/videos')({
  loaderDeps: langDeps,
  loader: ({ deps: { lang } }) => getVideos({ data: { lang } }),
  head: ({ matches, loaderData }) => {
    const { settings, lang, t } = headContext(matches)
    return buildHead({
      title: loaderData?.page?.title || t.videos,
      description: loaderData?.page?.intro || t.videosDescription,
      seo: loaderData?.page?.seo,
      path: '/videos/',
      settings,
      jsonLd: [breadcrumbs([[t.videos, '/videos/']], lang)],
    })
  },
  component: VideosPage,
})

function VideosPage() {
  const { videos, page } = Route.useLoaderData()
  const t = useT()
  return (
    <>
      <PageHeader eyebrow={t.resources} title={page?.title || t.videos} intro={page?.intro || t.videosDescription} />
      <section aria-label={t.videos} className="py-section">
        <div className="mx-auto max-w-site px-4 sm:px-6">
          {videos.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((video) => (
                <VideoCard key={video._id} video={video} />
              ))}
            </div>
          ) : (
            <p className="text-center text-lg text-ink/75">{t.noVideos}</p>
          )}
        </div>
      </section>
      <PageSections sections={page?.body} />
    </>
  )
}
