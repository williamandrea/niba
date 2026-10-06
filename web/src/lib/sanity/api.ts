import { createServerFn } from '@tanstack/react-start'
import { notFound } from '@tanstack/react-router'
import { sanityClient } from './client'
import {
  CHANTING_PAGE_QUERY,
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
  VIDEOS_QUERY,
} from './queries'
import { todayInMedan } from '../dates'
import { parseLang, type Lang } from '../i18n'
import { CHANTING_PREFIX } from '../paths'
import { localize, type Localized } from './localize'
import { fetchInstagramFeed } from '../instagram'

/*
 * Server functions: Sanity is only called from the Worker, so @sanity/client
 * stays out of the browser bundle. GET responses are cached at the edge
 * (see src/server.ts). Each one takes the page's language and returns text
 * in that language (English where a translation is missing).
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

async function fetchQuery<T>(promise: Promise<T>, lang: Lang) {
  return localize(await promise, lang) as Localized<WithoutMedia<T>>
}

type LangInput = { lang?: Lang }
const withLang = <T extends object>(data: T & LangInput) => ({ ...data, lang: parseLang(data.lang) })

export const getSettings = createServerFn({ method: 'GET' })
  .validator((data: LangInput) => withLang(data))
  .handler(({ data }) => fetchQuery(sanityClient.fetch(SETTINGS_QUERY), data.lang))

export const getHome = createServerFn({ method: 'GET' })
  .validator((data: LangInput) => withLang(data))
  .handler(async ({ data: { lang } }) => {
    const { featured, ...data } = await fetchQuery(sanityClient.fetch(HOME_QUERY, { today: todayInMedan() }), lang)
    return {
      ...data,
      // The Indonesian article text has its own verse blocks; use them when there are any.
      featured: featured && {
        title: featured.title,
        slug: featured.slug,
        category: featured.category,
        verse: (lang === 'id' && featured.verseId) || featured.verseEn,
      },
      instagram: await fetchInstagramFeed(data.home?.instagram?.feedUrl, lang),
    }
  })

export const getPostList = createServerFn({ method: 'GET' })
  .validator((data: { category?: string; q?: string; page?: number } & LangInput) => withLang(data))
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
      data.lang,
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
  .validator((data: { category: string; slug: string } & LangInput) => withLang(data))
  .handler(async ({ data: { lang, ...params } }) => {
    const post = await fetchQuery(sanityClient.fetch(POST_QUERY, params), lang)
    if (!post) throw notFound()
    return post
  })

export const getEvents = createServerFn({ method: 'GET' })
  .validator((data: LangInput) => withLang(data))
  .handler(({ data }) => fetchQuery(sanityClient.fetch(EVENTS_QUERY, { today: todayInMedan() }), data.lang))

export const getEvent = createServerFn({ method: 'GET' })
  .validator((data: { slug: string } & LangInput) => withLang(data))
  .handler(async ({ data: { lang, slug } }) => {
    const event = await fetchQuery(sanityClient.fetch(EVENT_QUERY, { slug }), lang)
    if (!event) throw notFound()
    return { event, today: todayInMedan() }
  })

export const getPrograms = createServerFn({ method: 'GET' })
  .validator((data: LangInput) => withLang(data))
  .handler(({ data }) => fetchQuery(sanityClient.fetch(PROGRAMS_QUERY), data.lang))

export const getTeachers = createServerFn({ method: 'GET' })
  .validator((data: LangInput) => withLang(data))
  .handler(({ data }) => fetchQuery(sanityClient.fetch(TEACHERS_QUERY), data.lang))

export const getVideos = createServerFn({ method: 'GET' })
  .validator((data: LangInput) => withLang(data))
  .handler(({ data }) => fetchQuery(sanityClient.fetch(VIDEOS_QUERY), data.lang))

export const getVenerables = createServerFn({ method: 'GET' })
  .validator((data: LangInput) => withLang(data))
  .handler(async ({ data }) => ({
    ...(await fetchQuery(sanityClient.fetch(VENERABLES_QUERY), data.lang)),
    today: todayInMedan(),
  }))

/** A Sanity `page` by slug. Returns null when the page does not exist yet. */
export const getPage = createServerFn({ method: 'GET' })
  .validator((data: { slug: string } & LangInput) => withLang(data))
  .handler(({ data: { lang, slug } }) => fetchQuery(sanityClient.fetch(PAGE_QUERY, { slug }), lang))

export const getChantingPage = createServerFn({ method: 'GET' })
  .validator((data: { slug: string } & LangInput) => withLang(data))
  .handler(async ({ data: { lang, slug } }) => {
    const page = await fetchQuery(sanityClient.fetch(CHANTING_PAGE_QUERY, { slug, prefix: CHANTING_PREFIX }), lang)
    if (!page) throw notFound()
    return page
  })

export const getNiba = createServerFn({ method: 'GET' })
  .validator((data: { slug: string } & LangInput) => withLang(data))
  .handler(({ data: { lang, slug } }) => fetchQuery(sanityClient.fetch(NIBA_QUERY, { slug }), lang))
