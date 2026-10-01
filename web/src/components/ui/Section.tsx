import type { ReactNode } from 'react'

type Props = {
  tone?: 'light' | 'warm'
  id?: string
  labelledBy?: string
  className?: string
  children: ReactNode
}

/** A full-width page band. Alternate `light` and `warm` for rhythm. */
export function Section({ tone = 'light', id, labelledBy, className = '', children }: Props) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={`py-section ${tone === 'warm' ? 'bg-cream-100' : 'bg-cream-50'} ${className}`}
    >
      <div className="mx-auto max-w-site px-4 sm:px-6">{children}</div>
    </section>
  )
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  intro,
  align = 'left',
  action,
}: {
  id: string
  eyebrow?: string
  title: string
  intro?: string | null
  align?: 'left' | 'center'
  action?: ReactNode
}) {
  const centered = align === 'center'
  return (
    <div
      className={`mb-10 flex gap-4 ${centered ? 'flex-col items-center text-center' : 'flex-wrap items-end justify-between'}`}
    >
      <div className={centered ? 'max-w-2xl' : 'max-w-3xl'}>
        {eyebrow && <p className="mb-2 text-base font-semibold uppercase tracking-widest text-brown-700">{eyebrow}</p>}
        <h2 id={id}>{title}</h2>
        {intro && <p className="mt-3 text-ink/85">{intro}</p>}
      </div>
      {action}
    </div>
  )
}
