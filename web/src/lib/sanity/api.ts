import { createServerFn } from '@tanstack/react-start'
import { notFound } from '@tanstack/react-router'
import { sanityClient } from './client'
import {
  EVENT_QUERY,
  EVENTS_QUERY,
  HOME_QUERY,
  NIBA_QUERY,
  PAGE_QUERY,
  POST_LIST_QUERY,
  POST_QUERY,
  PROGRAMS_QUERY,
  SETTINGS_QUERY,
  TEACHERS_QUERY,
  VENERABLES_QUERY,
} from './queries'
import { todayInMedan } from '../dates'

/*
 * Server functions: Sanity is only called from the Worker, so @sanity/client
 * stays out of the browser bundle. GET responses are cached at the edge
 * (see src/server.ts).
 */

export const POSTS_PER_PAGE = 9

/**
 * Generated image types include `media?: unknown` (Sanity Media Library),
 * which server functions can't prove is serializable. We never use it.
 */
type WithoutMedia<T> = T extends (infer U)[]
  ? WithoutMedia<U>[]
  : T extends object
    ? { [K in keyof T as K extends 'media' ? never : K]: WithoutMedia<T[K]> }
    : T

async function fetchQuery<T>(promise: Promise<T>) {
  return (await promise) as WithoutMedia<T>
}

export const getSettings = createServerFn({ method: 'GET' }).handler(() =>
  fetchQuery(sanityClient.fetch(SETTINGS_QUERY)),
)

export const getHome = createServerFn({ method: 'GET' }).handler(() =>
  fetchQuery(sanityClient.fetch(HOME_QUERY, { today: todayInMedan() })),
)

export const getPostList = createServerFn({ method: 'GET' })
  .validator((data: { category?: string; q?: string; page?: number }) => data)
  .handler(async ({ data }) => {
    const search = (data.q ?? '').trim().slice(0, 80)
    // Each word must match; "*" also finds longer words ("medit" -> "meditation").
    const terms = search
      .split(/\s+/)
      .map((word) => word.replace(/[^\p{L}\p{N}]/gu, ''))
      .filter(Boolean)
      .map((word) => `${word}*`)
    const result = await fetchQuery(
      sanityClient.fetch(POST_LIST_QUERY, {
        category: data.category ?? '',
        search: terms.length ? search : '',
        terms,
      }),
    )
    const total = result.posts.length
    const pageCount = Math.max(1, Math.ceil(total / POSTS_PER_PAGE))
    const page = Math.min(Math.max(1, data.page ?? 1), pageCount)
    return {
      posts: result.posts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE),
      categories: result.categories,
      page: result.page,
      total,
      pageCount,
      currentPage: page,
    }
  })

export const getPost = createServerFn({ method: 'GET' })
  .validator((data: { category: string; slug: string }) => data)
  .handler(async ({ data }) => {
    const post = await fetchQuery(sanityClient.fetch(POST_QUERY, data))
    if (!post) throw notFound()
    return post
  })

export const getEvents = createServerFn({ method: 'GET' }).handler(() =>
  fetchQuery(sanityClient.fetch(EVENTS_QUERY, { today: todayInMedan() })),
)

export const getEvent = createServerFn({ method: 'GET' })
  .validator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const event = await fetchQuery(sanityClient.fetch(EVENT_QUERY, data))
    if (!event) throw notFound()
    return { event, today: todayInMedan() }
  })

export const getPrograms = createServerFn({ method: 'GET' }).handler(() =>
  fetchQuery(sanityClient.fetch(PROGRAMS_QUERY)),
)

export const getTeachers = createServerFn({ method: 'GET' }).handler(() =>
  fetchQuery(sanityClient.fetch(TEACHERS_QUERY)),
)

export const getVenerables = createServerFn({ method: 'GET' }).handler(async () => ({
  ...(await fetchQuery(sanityClient.fetch(VENERABLES_QUERY))),
  today: todayInMedan(),
}))

/** A Sanity `page` by slug. Returns null when the page does not exist yet. */
export const getPage = createServerFn({ method: 'GET' })
  .validator((data: { slug: string }) => data)
  .handler(({ data }) => fetchQuery(sanityClient.fetch(PAGE_QUERY, data)))

export const getNiba = createServerFn({ method: 'GET' })
  .validator((data: { slug: string }) => data)
  .handler(({ data }) => fetchQuery(sanityClient.fetch(NIBA_QUERY, data)))
