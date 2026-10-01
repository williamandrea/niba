import { clean, whatsappUrl } from '~/lib/text'
import { useT } from '~/lib/i18n'

function WhatsAppIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2.2a9.7 9.7 0 0 0-8.4 14.6L2.3 21.8l5.1-1.3A9.7 9.7 0 1 0 12 2.2Zm0 17.7a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 19.9Zm4.4-6c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.8 1c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 0 0-.7.3 2.8 2.8 0 0 0-.9 2.1 4.9 4.9 0 0 0 1 2.6 11.2 11.2 0 0 0 4.3 3.8c1.6.7 2.2.7 3 .6a2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .2-1.2c-.1-.1-.3-.2-.6-.3Z" />
    </svg>
  )
}

type Contact = { name: string | null; whatsapp: string | null }

/** Green WhatsApp chat buttons. Contacts without a valid number are left out. */
export function WhatsAppButtons({
  contacts,
  message,
  label,
  tone = 'solid',
}: {
  contacts: Contact[] | null | undefined
  message?: string
  label?: (name: string) => string
  tone?: 'solid' | 'soft'
}) {
  const t = useT()
  const valid = (contacts ?? [])
    .map((c) => ({ name: clean(c.name), href: whatsappUrl(c.whatsapp, message) }))
    .filter((c): c is { name: string; href: string } => Boolean(c.name && c.href))
  if (!valid.length) return null
  const style =
    tone === 'solid'
      ? 'bg-forest-700 text-white hover:bg-forest-700/90'
      : 'border-2 border-forest-700/30 bg-white/60 text-forest-700 hover:border-forest-700'
  return (
    <ul className="flex flex-wrap gap-2">
      {valid.map((c) => (
        <li key={c.href}>
          <a
            href={c.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-base font-semibold transition-colors ${style}`}
          >
            <WhatsAppIcon />
            {(label ?? t.chatWith)(c.name)}
            <span className="sr-only">{t.opensWhatsApp}</span>
          </a>
        </li>
      ))}
    </ul>
  )
}

export { WhatsAppIcon }
