import type { Lang } from './i18n'
import { messages } from './messages'
import { TIME_ZONE } from './site'

/** Today's date in Medan (WIB) as YYYY-MM-DD. */
export function todayInMedan(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(now)
}

function parts(date: string) {
  const [y, m, d] = date.slice(0, 10).split('-').map(Number)
  return { y: y ?? 0, m: (m ?? 1) - 1, d: d ?? 1 }
}

/** "2026-05-23" -> "23 May 2026" (or "23 Mei 2026") */
export function formatDate(date: string | null | undefined, lang: Lang) {
  if (!date) return ''
  const { y, m, d } = parts(date)
  return `${d} ${messages(lang).months[m]} ${y}`
}

/** A date range in plain words: "23–30 May 2026", "30 Apr – 2 May 2026". */
export function formatDateRange(start: string | null | undefined, end: string | null | undefined, lang: Lang) {
  if (!start) return ''
  if (!end || end === start) return formatDate(start, lang)
  const months = messages(lang).months
  const a = parts(start)
  const b = parts(end)
  if (a.y === b.y && a.m === b.m) return `${a.d}–${b.d} ${months[b.m]} ${b.y}`
  if (a.y === b.y) return `${a.d} ${months[a.m]} – ${b.d} ${months[b.m]} ${b.y}`
  return `${formatDate(start, lang)} – ${formatDate(end, lang)}`
}

/** Short day + month for date badges: { day: "23", month: "May" } */
export function dateBadge(date: string, lang: Lang) {
  const { m, d } = parts(date)
  return { day: String(d), month: messages(lang).shortMonths[m] ?? '' }
}

export function dayName(day: string | null | undefined, lang: Lang) {
  return day ? (messages(lang).days[day] ?? day) : ''
}

/** "09:30" -> "09.30" (Indonesian style, as on the old site). */
export function formatTime(time: string | null | undefined) {
  return (time ?? '').replace(':', '.')
}
