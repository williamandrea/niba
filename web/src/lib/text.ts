/**
 * Admins mark unsure content with "TODO: ..." in Sanity so they can find it.
 * The public site never shows those notes.
 */
const TODO_PATTERN = /\s*[([]?\s*TODO:[^)\]\n]*[)\]]?/g

export function clean(value: string | null | undefined): string {
  if (!value) return ''
  return value.replace(TODO_PATTERN, '').trim()
}

/** Returns the cleaned text, or undefined when nothing is left. */
export function cleanOrUndefined(value: string | null | undefined) {
  return clean(value) || undefined
}

/** Builds a WhatsApp chat link from an E.164 number like +6281234567. */
export function whatsappUrl(number: string | null | undefined, message?: string) {
  const digits = (number ?? '').replace(/[^\d]/g, '')
  if (!/^[1-9]\d{6,14}$/.test(digits)) return null
  const text = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${digits}${text}`
}

/** "+6281215004788" -> "+62 812-1500-4788" for display. */
export function formatPhone(number: string) {
  const digits = number.replace(/[^\d]/g, '')
  if (digits.startsWith('62')) {
    const rest = digits.slice(2)
    const parts = [rest.slice(0, 3), rest.slice(3, 7), rest.slice(7)].filter(Boolean)
    return `+62 ${parts.join('-')}`
  }
  return `+${digits}`
}

export function isExternal(href: string) {
  return /^(https?:)?\/\//.test(href) || href.startsWith('mailto:') || href.startsWith('tel:')
}
