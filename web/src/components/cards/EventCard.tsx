import { Link } from '@tanstack/react-router'
import type { SanityImageSource } from '~/lib/sanity/image'
import { dateBadge, formatDateRange } from '~/lib/dates'
import { clean } from '~/lib/text'
import { useLang, useT } from '~/lib/i18n'
import { SanityImage } from '~/components/ui/SanityImage'
import { AudienceBadge } from './ProgramCard'

export type EventCardData = {
  _id: string
  title: string
  slug: string
  type: string
  startDate: string
  endDate: string | null
  audience: string
  image: SanityImageSource | null
  sessions: { label: string; start: string; end: string | null }[] | null
  guide: string | null
}

export function EventCard({ event, past = false }: { event: EventCardData; past?: boolean }) {
  const lang = useLang()
  const t = useT()
  const badge = dateBadge(event.startDate, lang)
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-card border border-gold-400/30 bg-white/70 shadow-sm">
      {event.image?.asset && (
        <SanityImage
          image={event.image}
          aspect={16 / 10}
          sizes="(min-width: 1024px) 24rem, (min-width: 768px) 50vw, 100vw"
          className={`w-full object-cover ${past ? 'grayscale-[35%]' : ''}`}
        />
      )}
      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex items-start gap-4">
          <div
            className="flex w-14 shrink-0 flex-col items-center rounded-xl bg-saffron-600 py-2 text-white"
            aria-hidden="true"
          >
            <span className="text-xl font-bold leading-none">{badge.day}</span>
            <span className="text-base leading-tight">{badge.month}</span>
          </div>
          <div>
            <p className="text-base font-semibold uppercase tracking-wider text-brown-700">
              {t.eventTypes[event.type] ?? t.event}
            </p>
            <h3 className="text-h3">
              <Link
                to="/events/$slug/"
                params={{ slug: event.slug }}
                className="after:absolute after:inset-0 after:content-[''] hover:text-brown-700 hover:underline"
              >
                {event.title}
              </Link>
            </h3>
          </div>
        </div>
        <p className="font-semibold">{formatDateRange(event.startDate, event.endDate, lang)}</p>
        {event.sessions && event.sessions.length > 1 && (
          <ul className="text-ink/85">
            {event.sessions.map((s) => (
              <li key={s.label}>
                {s.label}: {formatDateRange(s.start, s.end, lang)}
              </li>
            ))}
          </ul>
        )}
        {clean(event.guide) && <p className="text-ink/85">{t.guidedBy(clean(event.guide))}</p>}
        <div className="mt-auto pt-2">
          <AudienceBadge audience={event.audience} />
        </div>
      </div>
    </article>
  )
}
