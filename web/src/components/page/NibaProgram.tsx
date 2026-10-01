import type { NIBA_QUERY_RESULT } from '~/lib/sanity/sanity.types'
import { clean } from '~/lib/text'
import { AudienceBadge, ScheduleList } from '~/components/cards/ProgramCard'
import { WhatsAppButtons } from '~/components/ui/WhatsApp'

type Program = NonNullable<NIBA_QUERY_RESULT['program']>
type Contact = { name: string | null; whatsapp: string | null }

/** Class times and WhatsApp buttons for NIBA. Falls back to the site's contacts. */
export function NibaProgram({
  program,
  fallbackContacts,
  heading = 'Class times',
}: {
  program: Program | null | undefined
  fallbackContacts: Contact[]
  heading?: string
}) {
  const contacts = program?.contacts?.length ? program.contacts : fallbackContacts
  return (
    <section aria-labelledby="niba-times" className="bg-cream-100 py-section">
      <div className="mx-auto grid max-w-site gap-8 px-4 sm:px-6 md:grid-cols-2">
        <div>
          <h2 id="niba-times">{heading}</h2>
          {program ? (
            <div className="mt-5 space-y-4">
              <ScheduleList schedule={program.schedule} note={program.scheduleNote} />
              <AudienceBadge audience={program.audience} />
            </div>
          ) : (
            <p className="mt-4">Please message us for the class schedule.</p>
          )}
        </div>
        <div className="rounded-card border border-gold-400/30 bg-white/70 p-6 shadow-sm">
          <h2 className="text-h3">Register through WhatsApp</h2>
          <p className="mt-2">
            Send us a message and we will help you get started{program ? ` with ${clean(program.name)}` : ''}.
          </p>
          <div className="mt-4">
            <WhatsAppButtons
              contacts={contacts}
              message="Hello, I would like to register my child for NIBA."
              label={(name) => `Message ${name}`}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
