import { Link } from '@tanstack/react-router'
import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { isExternal } from '~/lib/text'

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: string
  children: ReactNode
}

/**
 * Link for URLs that come from Sanity (menus, buttons). Internal paths use the
 * router for fast page changes; anything else is a normal link.
 */
export function SmartLink({ href, children, ...rest }: Props) {
  if (isExternal(href) || href.startsWith('#')) {
    const external = /^(https?:)?\/\//.test(href)
    return (
      <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>
        {children}
      </a>
    )
  }
  const [path = '/', hash] = href.split('#')
  return (
    // CMS paths are plain strings, so they can't be checked against the route tree.
    <Link to={path as string} hash={hash} {...rest}>
      {children}
    </Link>
  )
}
