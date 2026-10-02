import type { SanityImageSource } from '~/lib/sanity/image'
import { dayName, formatTime } from '~/lib/dates'
import { clean } from '~/lib/text'
import { useLang, useT } from '~/lib/i18n'
import { ButtonLink } from '~/components/ui/Button'
import { SanityImage } from '~/components/ui/SanityImage'
import { WhatsAppButtons } from '~/components/ui/WhatsApp'

export type ProgramCardData = {
  _id: string
  name: string
  slug: string
  icon: string | null
  shortDescription: string
  schedule: { day: string; startTime: string; endTime: string }[] | null
  scheduleNote: string | null
  audience: string
  button: { label: string; href: string } | null
  contacts: { name: string; whatsapp: string }[] | null
  images?: SanityImageSource[] | null
}

export function ScheduleList({ schedule, note }: { schedule: ProgramCardData['schedule']; note?: string | null }) {
  const lang = useLang()
  const t = useT()
  const text = clean(note)
  if (!schedule?.length && !text) return null
  return (
    <ul className="space-y-1.5">
      {schedule?.map((s) => (
        <li key={`${s.day}-${s.startTime}`} className="flex items-start gap-2">
          <svg
            viewBox="0 0 20 20"
            className="mt-1 h-4 w-4 shrink-0 text-brown-700"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm.8 4v3.7l2.8 1.7-.8 1.3-3.6-2.2V6h1.6Z" />
          </svg>
          <span>
            <span className="font-semibold">{t.every(dayName(s.day, lang))}</span>, {formatTime(s.startTime)}–
            {formatTime(s.endTime)} WIB
          </span>
        </li>
      ))}
      {text && <li className="pl-6 text-ink/75">{text}</li>}
    </ul>
  )
}

export function AudienceBadge({ audience }: { audience: string | null | undefined }) {
  const t = useT()
  if (!audience) return null
  const open = audience === 'public'
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-base font-semibold ${open ? 'bg-forest-700/10 text-forest-700' : 'bg-saffron-100 text-brown-700'}`}
    >
      {t.audience[audience] ?? audience}
    </span>
  )
}

/** Program card for the homepage and Programs page. Never shows photos on phones. */
export function ProgramCard({
  program,
  headingLevel = 3,
  showPhoto = false,
  outlineButton = false,
}: {
  program: ProgramCardData
  headingLevel?: 2 | 3
  showPhoto?: boolean
  outlineButton?: boolean
}) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3'
  const photo = program.images?.[0]
  const t = useT()
  return (
    <article
      id={program.slug}
      className="flex h-full scroll-mt-28 flex-col overflow-hidden rounded-card border border-gold-400/30 bg-white/70 shadow-sm"
    >
      {showPhoto && photo && (
        <SanityImage
          image={photo}
          aspect={16 / 9}
          sizes="(min-width: 1024px) 24rem, (min-width: 768px) 50vw, 100vw"
          className="hidden w-full object-cover md:block"
        />
      )}
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-start gap-3">
          {program.icon && (
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-saffron-100 text-2xl"
              aria-hidden="true"
            >
              {program.icon}
            </span>
          )}
          <Heading className="pt-1 text-h3">{program.name}</Heading>
        </div>
        <p>{clean(program.shortDescription)}</p>
        <ScheduleList schedule={program.schedule} note={program.scheduleNote} />
        <div className="mt-auto flex flex-wrap items-center gap-3 pt-2">
          <AudienceBadge audience={program.audience} />
        </div>
        {program.button && (
          <ButtonLink href={program.button.href} variant={outlineButton ? 'outline' : 'primary'} className="self-start">
            {program.button.label}
          </ButtonLink>
        )}
        <WhatsAppButtons
          contacts={program.contacts}
          tone="soft"
          label={(name) => name}
          message={t.askAbout(program.name)}
        />
      </div>
    </article>
  )
}
