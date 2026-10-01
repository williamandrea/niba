import { clean } from '~/lib/text'
import { useT } from '~/lib/i18n'

/** Pali verse with its meaning: side by side on wider screens, stacked on phones. */
export function VerseBlock({
  pali,
  meaning,
  reference,
}: {
  pali: string | null | undefined
  meaning: string | null | undefined
  reference?: string | null
}) {
  const t = useT()
  const ref = clean(reference)
  return (
    <figure className="not-prose my-8 rounded-card border border-gold-400/50 bg-cream-100 p-5 sm:p-7">
      <div className="grid gap-6 md:grid-cols-2 md:gap-8">
        <div>
          <p className="mb-2 font-sans text-base font-semibold uppercase tracking-widest text-brown-700">{t.pali}</p>
          <p lang="pi" className="whitespace-pre-line font-serif text-verse italic leading-relaxed text-brown-900">
            {clean(pali)}
          </p>
        </div>
        {clean(meaning) && (
          <div className="border-t border-gold-400/40 pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
            <p className="mb-2 font-sans text-base font-semibold uppercase tracking-widest text-brown-700">
              {t.meaning}
            </p>
            <p className="whitespace-pre-line font-serif text-verse leading-relaxed text-ink">{clean(meaning)}</p>
          </div>
        )}
      </div>
      {ref && <figcaption className="mt-5 text-base text-ink/70">— {ref}</figcaption>}
    </figure>
  )
}
