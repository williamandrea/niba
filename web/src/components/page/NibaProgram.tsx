import type { getNiba } from '~/lib/sanity/api'
import { clean } from '~/lib/text'
import { useT } from '~/lib/i18n'
import { AudienceBadge, ScheduleList } from '~/components/cards/ProgramCard'
import { WhatsAppButtons } from '~/components/ui/WhatsApp'
import { ButtonLink } from '~/components/ui/Button'

type Program = NonNullable<Awaited<ReturnType<typeof getNiba>>['program']>
type Contact = { name: string | null; whatsapp: string | null }

/**
 * Class times and how to register for NIBA. Falls back to the site's contacts.
 * Links to /niba/#register land here.
 */
export function NibaProgram({
  program,
  fallbackContacts,
}: {
  program: Program | null | undefined
  fallbackContacts: Contact[]
}) {
  const t = useT()
  const contacts = program?.contacts?.length ? program.contacts : fallbackContacts
  const form = program?.registrationForm?.href ? program.registrationForm : null
  return (
    <section id="register" aria-labelledby="niba-times" className="bg-cream-100 py-section">
      <div className="mx-auto grid max-w-site gap-8 px-4 sm:px-6 md:grid-cols-2">
        <div>
          <h2 id="niba-times">{t.classTimes}</h2>
          {program ? (
            <div className="mt-5 space-y-4">
              <ScheduleList schedule={program.schedule} note={program.scheduleNote} />
              <AudienceBadge audience={program.audience} />
            </div>
          ) : (
            <p className="mt-4">{t.askSchedule}</p>
          )}
        </div>
        <div className="rounded-card border border-gold-400/30 bg-white/70 p-6 shadow-sm">
          {form ? (
            <>
              <h2 className="text-h3">{t.registerOnline}</h2>
              <p className="mt-2">{t.registerFormHelp}</p>
              <ButtonLink href={form.href} className="mt-4">
                {form.label}
              </ButtonLink>
              <p className="mt-6">{t.questionsWhatsApp}</p>
              <div className="mt-3">
                <WhatsAppButtons contacts={contacts} message={t.nibaMessage} label={t.messageTo} tone="soft" />
              </div>
            </>
          ) : (
            <>
              <h2 className="text-h3">{t.registerWhatsApp}</h2>
              <p className="mt-2">{t.registerHelp(program ? clean(program.name) : undefined)}</p>
              <div className="mt-4">
                <WhatsAppButtons contacts={contacts} message={t.nibaMessage} label={t.messageTo} />
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
