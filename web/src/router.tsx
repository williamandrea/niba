import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { NotFound } from './components/layout/NotFound'
import { ErrorView } from './components/layout/ErrorView'

export function getRouter() {
  return createRouter({
    routeTree,
    // Keep WordPress-style URLs: /about/, /blog/, /dhammapada/<slug>/
    trailingSlash: 'always',
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    defaultStaleTime: 60_000,
    defaultErrorComponent: ErrorView,
    defaultNotFoundComponent: NotFound,
    scrollRestoration: true,
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
