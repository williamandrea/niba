/** Site-wide defaults. Sanity values override these when present. */
import type { Messages } from './messages'

export type NavLink = { label: string; href: string }
export type MenuItem = NavLink & { children?: NavLink[] }

export const SITE_NAME = 'Na Uyana Aranya Indonesia'
export const SITE_SHORT_NAME = 'Na Uyana Indonesia'
export const TIME_ZONE = 'Asia/Jakarta'

export function defaultMenu(t: Messages): MenuItem[] {
  return [
    { label: t.menuHome, href: '/' },
    {
      label: t.menuAbout,
      href: '/about/',
      children: [
        { label: t.menuAboutUs, href: '/about/' },
        { label: t.menuTeachers, href: '/teachers/' },
        { label: t.menuVenerables, href: '/residing-venerables/' },
      ],
    },
    {
      label: 'NIBA',
      href: '/niba/',
      children: [
        { label: t.menuAboutNiba, href: '/niba/' },
        { label: t.menuRegistration, href: '/niba/registration/' },
      ],
    },
    { label: t.menuPrograms, href: '/programs/' },
    {
      label: t.menuEvents,
      href: '/events/',
      children: [
        { label: t.menuUpcoming, href: '/events/' },
        { label: t.menuPast, href: '/events/past/' },
      ],
    },
    {
      label: t.menuResources,
      href: '/blog/',
      children: [
        { label: t.menuArticles, href: '/blog/' },
        { label: t.menuBooks, href: '/books/' },
        { label: t.menuChanting, href: '/chanting/' },
      ],
    },
    { label: t.menuContact, href: '/contact/' },
  ]
}

export function defaultUsefulLinks(t: Messages): NavLink[] {
  return [
    { label: t.linkAboutUs, href: '/about/' },
    { label: t.linkTeachers, href: '/teachers/' },
    { label: t.menuAboutNiba, href: '/niba/' },
    { label: t.menuArticles, href: '/blog/' },
    { label: t.menuBooks, href: '/books/' },
  ]
}
