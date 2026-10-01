import { useState, type ReactNode } from 'react'
import type { NavLink } from '~/lib/site'
import { clean, formatPhone, whatsappUrl } from '~/lib/text'
import { SmartLink } from '~/components/ui/SmartLink'
import { LotusMandala } from '~/components/ui/LotusMandala'

export type FooterData = {
  siteName: string
  quote?: string | null
  quoteSource?: string | null
  address?: string | null
  mapsUrl?: string | null
  email?: string | null
  whatsapp?: string | null
  contacts: { name: string | null; whatsapp: string | null }[]
  usefulLinks: NavLink[]
  nibaBlurb?: string | null
  nibaLink?: NavLink | null
  socialLinks: { platform: string | null; label: string | null; url: string | null }[]
}

export function SiteFooter({ data }: { data: FooterData }) {
  const year = new Date().getFullYear()
  const quote = clean(data.quote)
  const contacts = data.contacts
    .map((c) => ({ name: clean(c.name), href: whatsappUrl(c.whatsapp) }))
    .filter((c): c is { name: string; href: string } => Boolean(c.name && c.href))
  const mainWa = whatsappUrl(data.whatsapp)
  const socials = data.socialLinks.filter((s): s is { platform: string | null; label: string | null; url: string } =>
    Boolean(s.url),
  )

  return (
    <footer className="relative isolate overflow-hidden bg-brown-900 text-base text-cream-100">
      <LotusMandala className="pointer-events-none absolute -right-24 -top-24 -z-10 h-[28rem] w-[28rem] text-gold-400 opacity-[0.07] sm:-right-16" />
      <LotusMandala className="pointer-events-none absolute -bottom-40 -left-32 -z-10 h-[24rem] w-[24rem] text-gold-400 opacity-[0.05]" />

      {quote && (
        <figure className="mx-auto max-w-3xl px-4 pt-14 text-center sm:px-6">
          <blockquote className="font-serif text-verse italic leading-relaxed text-cream-50">“{quote}”</blockquote>
          {data.quoteSource && (
            <figcaption className="mt-3 text-base text-gold-400">— {clean(data.quoteSource)}</figcaption>
          )}
        </figure>
      )}

      <div className="mx-auto grid max-w-site gap-x-10 gap-y-2 px-4 py-12 sm:px-6 md:grid-cols-2 md:gap-y-10 lg:grid-cols-4">
        <FooterGroup title="Address">
          {data.address && <p className="whitespace-pre-line">{clean(data.address)}</p>}
          <ul className="mt-3 space-y-1">
            {data.mapsUrl && (
              <li>
                <FooterLink href={data.mapsUrl}>Open in Google Maps</FooterLink>
              </li>
            )}
            {data.email && (
              <li>
                <FooterLink href={`mailto:${data.email}`}>{data.email}</FooterLink>
              </li>
            )}
          </ul>
        </FooterGroup>

        <FooterGroup title="Our contact">
          <ul className="space-y-1">
            {mainWa && data.whatsapp && (
              <li>
                <FooterLink href={mainWa}>WhatsApp {formatPhone(data.whatsapp)}</FooterLink>
              </li>
            )}
            {contacts.map((c) => (
              <li key={c.href}>
                <FooterLink href={c.href}>{c.name}</FooterLink>
              </li>
            ))}
          </ul>
        </FooterGroup>

        <FooterGroup title="Useful links">
          <ul className="space-y-1">
            {data.usefulLinks.map((link) => (
              <li key={link.href + link.label}>
                <FooterLink href={link.href}>{link.label}</FooterLink>
              </li>
            ))}
          </ul>
        </FooterGroup>

        <FooterGroup title="NIBA registration">
          {data.nibaBlurb && <p>{clean(data.nibaBlurb)}</p>}
          {data.nibaLink && (
            <SmartLink
              href={data.nibaLink.href}
              className="mt-4 inline-flex min-h-11 items-center rounded-full bg-saffron-500 px-5 font-semibold text-white hover:bg-saffron-600"
            >
              {data.nibaLink.label}
            </SmartLink>
          )}
          {socials.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Social media">
              {socials.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-cream-100/30 px-4 hover:border-gold-400 hover:text-gold-400"
                  >
                    <SocialIcon platform={s.platform} />
                    {s.label || s.platform}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </FooterGroup>
      </div>

      <div className="border-t border-cream-100/15">
        <p className="mx-auto max-w-site px-4 py-6 text-center text-base text-cream-100/80 sm:px-6">
          © {year} {data.siteName}. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

/** A footer column. On phones it is a tap-to-open group; on wider screens it is always open. */
function FooterGroup({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const id = `footer-${title.toLowerCase().replace(/\W+/g, '-')}`
  return (
    <section className="border-b border-cream-100/15 md:border-0" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="font-sans text-base font-bold tracking-wide text-gold-400">
        <button
          type="button"
          className="flex min-h-12 w-full items-center justify-between text-left md:hidden"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen(!open)}
        >
          {title}
          <svg
            viewBox="0 0 20 20"
            className={`h-5 w-5 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4Z" />
          </svg>
        </button>
        <span className="hidden md:block md:pb-4">{title}</span>
      </h2>
      <div id={id} className={`${open ? 'block' : 'hidden'} pb-5 md:block md:pb-0`}>
        {children}
      </div>
    </section>
  )
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <SmartLink
      href={href}
      className="inline-flex min-h-11 items-center underline-offset-4 hover:text-gold-400 hover:underline"
    >
      {children}
    </SmartLink>
  )
}

function SocialIcon({ platform }: { platform: string | null }) {
  if (platform === 'instagram') {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    )
  }
  if (platform === 'youtube') {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <rect x="2.5" y="5" width="19" height="14" rx="4" />
        <path d="M10 9.5v5l4.5-2.5z" fill="currentColor" stroke="none" />
      </svg>
    )
  }
  if (platform === 'facebook') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
        <path d="M13.5 21v-7.5H16l.5-3h-3V8.6c0-.9.3-1.6 1.6-1.6h1.6V4.3c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1v2.2H8v3h2.3V21z" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18" />
    </svg>
  )
}
