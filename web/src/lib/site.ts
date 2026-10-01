/** Site-wide defaults. Sanity values override these when present. */

export type NavLink = { label: string; href: string }
export type MenuItem = NavLink & { children?: NavLink[] }

export const SITE_NAME = 'Na Uyana Aranya Indonesia'
export const SITE_SHORT_NAME = 'Na Uyana Indonesia'
export const TIME_ZONE = 'Asia/Jakarta'

export const DEFAULT_MENU: MenuItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'About',
    href: '/about/',
    children: [
      { label: 'About Us', href: '/about/' },
      { label: 'Our Teachers', href: '/teachers/' },
      { label: 'Residing Venerables', href: '/residing-venerables/' },
    ],
  },
  {
    label: 'NIBA',
    href: '/niba/',
    children: [
      { label: 'About NIBA', href: '/niba/' },
      { label: 'Registration', href: '/niba/registration/' },
    ],
  },
  { label: 'Programs', href: '/programs/' },
  {
    label: 'Events',
    href: '/events/',
    children: [
      { label: 'Upcoming', href: '/events/' },
      { label: 'Past', href: '/events/past/' },
    ],
  },
  {
    label: 'Resources',
    href: '/blog/',
    children: [
      { label: 'Articles', href: '/blog/' },
      { label: 'Books', href: '/books/' },
      { label: 'Chanting', href: '/chanting/' },
    ],
  },
  { label: 'Contact', href: '/contact/' },
]

export const DEFAULT_USEFUL_LINKS: NavLink[] = [
  { label: 'About us', href: '/about/' },
  { label: 'Our teachers', href: '/teachers/' },
  { label: 'About NIBA', href: '/niba/' },
  { label: 'Articles', href: '/blog/' },
  { label: 'Books', href: '/books/' },
]

export const DEFAULT_DESCRIPTION =
  'Na Uyana Aranya Indonesia is a Theravada Buddhist community in Medan. Join our Sunday Dhamma school for children (NIBA), weekly Dhamma and meditation programs, and retreats.'
