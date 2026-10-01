/**
 * Original lotus / mandala drawing used as a soft watermark.
 * Purely decorative, so it is hidden from screen readers.
 */
function petal(inner: number, outer: number, width: number) {
  const mid = inner + (outer - inner) * 0.45
  return `M0 ${-inner} C ${width} ${-mid} ${width * 0.55} ${-outer + width * 0.4} 0 ${-outer} C ${-width * 0.55} ${-outer + width * 0.4} ${-width} ${-mid} 0 ${-inner} Z`
}

const rings = [
  { count: 8, inner: 14, outer: 58, width: 20, offset: 0 },
  { count: 8, inner: 22, outer: 78, width: 24, offset: 22.5 },
  { count: 16, inner: 70, outer: 112, width: 16, offset: 11.25 },
  { count: 24, inner: 112, outer: 138, width: 9, offset: 0 },
]

export function LotusMandala({ className }: { className?: string }) {
  return (
    <svg
      viewBox="-150 -150 300 300"
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    >
      <circle r="10" />
      <circle r="4" fill="currentColor" stroke="none" />
      {rings.map((ring, r) =>
        Array.from({ length: ring.count }, (_, i) => (
          <path
            key={`${r}-${i}`}
            d={petal(ring.inner, ring.outer, ring.width)}
            transform={`rotate(${ring.offset + (360 / ring.count) * i})`}
          />
        )),
      )}
      <circle r="142" strokeDasharray="1.5 6" strokeLinecap="round" />
      <circle r="147" />
    </svg>
  )
}

/** Small lotus mark for the wordmark and buttons. */
export function LotusMark({ className }: { className?: string }) {
  return (
    <svg viewBox="-24 -24 48 48" className={className} aria-hidden="true" focusable="false" fill="currentColor">
      <path d="M0 -20 C 7 -10 7 2 0 10 C -7 2 -7 -10 0 -20 Z" />
      <path d="M-4 9 C -16 6 -20 -4 -18 -12 C -10 -10 -4 -2 -1 8 Z" opacity="0.85" />
      <path d="M4 9 C 16 6 20 -4 18 -12 C 10 -10 4 -2 1 8 Z" opacity="0.85" />
      <path d="M-22 4 C -14 12 14 12 22 4 C 14 16 -14 16 -22 4 Z" opacity="0.7" />
    </svg>
  )
}
