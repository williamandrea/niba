import type { ReactNode } from 'react'
import { SmartLink } from './SmartLink'

const VARIANTS = {
  primary: 'bg-saffron-600 text-white hover:bg-brown-700 shadow-sm shadow-saffron-600/20',
  outline: 'border-2 border-brown-900 text-brown-900 hover:bg-brown-900 hover:text-cream-50',
  light: 'bg-cream-50 text-brown-900 hover:bg-white',
  ghostLight: 'border-2 border-cream-50/80 text-cream-50 hover:bg-cream-50 hover:text-brown-900',
}

export type ButtonVariant = keyof typeof VARIANTS

export const buttonClass = (variant: ButtonVariant = 'primary') =>
  `inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-center text-base font-semibold transition-colors ${VARIANTS[variant]}`

export function ButtonLink({
  href,
  variant = 'primary',
  children,
  className = '',
}: {
  href: string
  variant?: ButtonVariant
  children: ReactNode
  className?: string
}) {
  return (
    <SmartLink href={href} className={`${buttonClass(variant)} ${className}`}>
      {children}
    </SmartLink>
  )
}
