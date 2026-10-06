import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useT } from '~/lib/i18n'
import { LotusMandala } from '~/components/ui/LotusMandala'

export type VideoCardData = {
  _id: string
  title: string
  driveUrl: string
  article: { slug: string; category: string | null } | null
}

const driveFileId = (url: string) => url.match(/\/file\/d\/([\w-]+)/)?.[1]

/** A Google Drive video. The player opens in a dialog when the visitor presses play. */
export function VideoCard({ video }: { video: VideoCardData }) {
  const t = useT()
  const [playing, setPlaying] = useState(false)
  const [thumbFailed, setThumbFailed] = useState(false)
  const id = driveFileId(video.driveUrl)
  if (!id) return null

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-card border border-gold-400/30 bg-white/70 shadow-sm">
      <div className="relative aspect-video bg-saffron-100">
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={t.playVideo(video.title)}
          className="group absolute inset-0 flex items-center justify-center"
        >
          {thumbFailed ? (
            <LotusMandala className="absolute h-2/3 text-saffron-500/40" />
          ) : (
            <img
              src={`https://drive.google.com/thumbnail?id=${id}&sz=w800`}
              alt=""
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setThumbFailed(true)}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-brown-700/85 text-white shadow-lg transition group-hover:scale-110 group-hover:bg-brown-700">
            <svg viewBox="0 0 24 24" className="ml-1 h-8 w-8" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-6">
        <h2 className="text-h3">{video.title}</h2>
        {video.article?.category && (
          <Link
            to="/$category/$slug/"
            params={{ category: video.article.category, slug: video.article.slug }}
            className="mt-auto inline-flex min-h-11 items-center pt-2 font-semibold text-brown-700 hover:underline"
          >
            {t.readTheStory}
          </Link>
        )}
      </div>
      {playing && <VideoDialog id={id} title={video.title} onClose={() => setPlaying(false)} />}
    </article>
  )
}

function VideoDialog({ id, title, onClose }: { id: string; title: string; onClose: () => void }) {
  const t = useT()
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    ref.current?.showModal()
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [])

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClose={onClose}
      // A click on the dialog itself (not its content) is a click on the backdrop.
      onClick={(e) => e.target === e.currentTarget && ref.current?.close()}
      className="m-auto w-[min(64rem,calc(100vw-2rem))] max-w-none overflow-visible bg-transparent p-0 backdrop:bg-black/80"
    >
      <div className="mb-2 flex items-center justify-between gap-4 text-white">
        <h2 className="truncate font-serif text-lg font-bold text-white">{title}</h2>
        <button
          type="button"
          autoFocus
          onClick={() => ref.current?.close()}
          className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full hover:bg-white/15"
        >
          <span className="sr-only">{t.closeVideo}</span>
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <div className="relative aspect-video overflow-hidden rounded-card bg-black shadow-2xl">
        <iframe
          src={`https://drive.google.com/file/d/${id}/preview`}
          title={title}
          allow="autoplay; fullscreen"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    </dialog>
  )
}
