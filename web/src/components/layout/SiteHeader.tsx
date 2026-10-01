import { Link, useRouterState } from '@tanstack/react-router'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import type { MenuItem } from '~/lib/site'
import { SmartLink } from '~/components/ui/SmartLink'

type Props = {
  siteName: string
  menu: MenuItem[]
}

function isActive(pathname: string, item: MenuItem) {
  const hrefs = [item.href, ...(item.children ?? []).map((c) => c.href)]
  return hrefs.some((href) => (href === '/' ? pathname === '/' : pathname.startsWith(href)))
}

export function SiteHeader({ siteName, menu }: Props) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  // Remember which page the drawer was opened on, so it closes after navigating.
  const [drawerOpenOn, setDrawerOpenOn] = useState<string | null>(null)
  const drawerOpen = drawerOpenOn === pathname
  const closeDrawer = useCallback(() => setDrawerOpenOn(null), [])

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gold-400/30 bg-cream-50/95 backdrop-blur supports-[backdrop-filter]:bg-cream-50/85">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-brown-900 focus:px-4 focus:py-2 focus:text-cream-50"
        >
          Skip to content
        </a>
        <div className="mx-auto flex h-16 max-w-site items-center justify-between gap-4 px-4 sm:px-6 lg:h-20">
          <Link to="/" className="flex min-h-11 min-w-0 items-center" aria-label={`${siteName} – home`}>
            {/* The logo image already shows the name and tagline. */}
            <img src="/logo.webp" width={747} height={222} alt="" className="h-11 w-auto lg:h-14" />
          </Link>

          <DesktopNav menu={menu} pathname={pathname} />

          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-brown-900 hover:bg-saffron-100 lg:hidden"
            aria-expanded={drawerOpen}
            aria-controls="mobile-drawer"
            onClick={() => setDrawerOpenOn(pathname)}
          >
            <span className="sr-only">Open menu</span>
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </header>
      {/* Outside the header: its backdrop blur would trap a fixed-position drawer inside it. */}
      <MobileDrawer menu={menu} pathname={pathname} open={drawerOpen} onClose={closeDrawer} />
    </>
  )
}

function DesktopNav({ menu, pathname }: { menu: MenuItem[]; pathname: string }) {
  // Dropdowns close after navigating: state is tied to the page it was opened on.
  const [openState, setOpenState] = useState<{ index: number; path: string } | null>(null)
  const openIndex = openState?.path === pathname ? openState.index : null
  const setOpenIndex = useCallback(
    (next: number | null | ((current: number | null) => number | null)) =>
      setOpenState((prev) => {
        const current = prev?.path === pathname ? prev.index : null
        const value = typeof next === 'function' ? next(current) : next
        return value === null ? null : { index: value, path: pathname }
      }),
    [pathname],
  )
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (openIndex === null) return
    const onPointer = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpenIndex(null)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenIndex(null)
        navRef.current?.querySelector<HTMLButtonElement>(`[data-menu-button="${openIndex}"]`)?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [openIndex, setOpenIndex])

  const linkBase =
    'inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-base font-semibold text-brown-900 transition-colors hover:bg-saffron-100 hover:text-brown-700'

  return (
    <nav ref={navRef} aria-label="Main" className="hidden lg:block">
      <ul className="flex items-center gap-1">
        {menu.map((item, index) => {
          const active = isActive(pathname, item)
          const activeClass = active ? ' text-brown-700' : ''
          if (!item.children?.length) {
            return (
              <li key={item.label}>
                <SmartLink
                  href={item.href}
                  className={linkBase + activeClass}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                </SmartLink>
              </li>
            )
          }
          const open = openIndex === index
          const panelId = `menu-panel-${index}`
          return (
            <li
              key={item.label}
              className="relative"
              onPointerEnter={(e) => {
                if (e.pointerType === 'mouse') setOpenIndex(index)
              }}
              onPointerLeave={(e) => {
                if (e.pointerType === 'mouse') setOpenIndex((current) => (current === index ? null : current))
              }}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                  setOpenIndex((current) => (current === index ? null : current))
                }
              }}
            >
              <button
                type="button"
                data-menu-button={index}
                className={linkBase + activeClass}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenIndex(open ? null : index)}
              >
                {item.label}
                <svg
                  viewBox="0 0 20 20"
                  className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4Z" />
                </svg>
              </button>
              <div id={panelId} hidden={!open} className="absolute left-0 top-full pt-2">
                <ul className="min-w-56 rounded-card border border-gold-400/40 bg-cream-50 p-2 shadow-lg shadow-brown-900/10">
                  {item.children.map((child) => {
                    const childActive = pathname === child.href
                    return (
                      <li key={child.href + child.label}>
                        <SmartLink
                          href={child.href}
                          className={`flex min-h-11 items-center rounded-lg px-3 text-base text-ink hover:bg-saffron-100 hover:text-brown-700${childActive ? ' font-semibold text-brown-700' : ''}`}
                          aria-current={childActive ? 'page' : undefined}
                        >
                          {child.label}
                        </SmartLink>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

function MobileDrawer({
  menu,
  pathname,
  open,
  onClose,
}: {
  menu: MenuItem[]
  pathname: string
  open: boolean
  onClose: () => void
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const [expanded, setExpanded] = useState<number | null>(null)
  const id = useId()

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    document.documentElement.style.overflow = 'hidden'
    closeRef.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key !== 'Tab' || !panelRef.current) return
      // Keep keyboard focus inside the drawer.
      const focusable = panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last?.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.documentElement.style.overflow = ''
      document.removeEventListener('keydown', onKey)
      previous?.focus()
    }
  }, [open, onClose])

  return (
    // The fixed, clipped wrapper keeps the closed drawer from widening the page.
    <div
      className={`fixed inset-0 z-50 overflow-hidden lg:hidden ${open ? '' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <div
        className={`absolute inset-0 bg-brown-900/50 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        id="mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        inert={!open}
        className={`absolute inset-y-0 right-0 flex w-[min(22rem,88vw)] flex-col bg-cream-50 transition-transform duration-300 ${open ? 'translate-x-0 shadow-2xl' : 'translate-x-full'}`}
      >
        <div className="flex h-16 items-center justify-between border-b border-gold-400/30 px-4">
          <span className="font-serif text-lg font-bold text-brown-900">Menu</span>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-brown-900 hover:bg-saffron-100"
          >
            <span className="sr-only">Close menu</span>
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <nav aria-label="Mobile" className="flex-1 overflow-y-auto overscroll-contain px-2 py-3">
          <ul className="space-y-1">
            {menu.map((item, index) => {
              const active = isActive(pathname, item)
              if (!item.children?.length) {
                return (
                  <li key={item.label}>
                    <SmartLink
                      href={item.href}
                      className={`flex min-h-12 items-center rounded-lg px-3 text-lg font-semibold hover:bg-saffron-100 ${active ? 'text-brown-700' : 'text-brown-900'}`}
                      aria-current={active ? 'page' : undefined}
                    >
                      {item.label}
                    </SmartLink>
                  </li>
                )
              }
              const isOpen = expanded === index
              const subId = `${id}-sub-${index}`
              return (
                <li key={item.label}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={subId}
                    onClick={() => setExpanded(isOpen ? null : index)}
                    className={`flex min-h-12 w-full items-center justify-between rounded-lg px-3 text-left text-lg font-semibold hover:bg-saffron-100 ${active ? 'text-brown-700' : 'text-brown-900'}`}
                  >
                    {item.label}
                    <svg
                      viewBox="0 0 20 20"
                      className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4Z" />
                    </svg>
                  </button>
                  <ul id={subId} hidden={!isOpen} className="mb-2 ml-3 border-l-2 border-gold-400/50 pl-2">
                    {item.children.map((child) => (
                      <li key={child.href + child.label}>
                        <SmartLink
                          href={child.href}
                          className={`flex min-h-11 items-center rounded-lg px-3 text-base hover:bg-saffron-100 ${pathname === child.href ? 'font-semibold text-brown-700' : 'text-ink'}`}
                          aria-current={pathname === child.href ? 'page' : undefined}
                        >
                          {child.label}
                        </SmartLink>
                      </li>
                    ))}
                  </ul>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </div>
  )
}
