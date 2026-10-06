import { defineQuery } from 'groq'

/*
 * All GROQ queries for the site. After changing a query or a schema, run
 * `pnpm typegen` to refresh the TypeScript types in sanity.types.ts.
 *
 * Translatable fields come back as { en, id } objects. The server functions
 * pick the visitor's language (see lib/sanity/localize.ts), so queries only
 * name a language where they filter, sort, or search.
 */

export const SETTINGS_QUERY = defineQuery(`*[_type == "siteSettings" && _id == "siteSettings"][0]{
  siteName,
  logo,
  menu[]{ label, href, children[]{ label, href } },
  footer{
    quote,
    quoteSource,
    address,
    mapsUrl,
    email,
    whatsapp,
    "contacts": contacts[]->{ name, whatsapp },
    usefulLinks[]{ label, href },
    nibaBlurb,
    nibaButton{ label, href },
    socialLinks[]{ platform, label, url }
  },
  seo
}`)

export const HOME_QUERY = defineQuery(`{
  "home": *[_type == "homepage" && _id == "homepage"][0]{
    hero{ image, heading, paliVerse, meaning, tagline, button{ label, href } },
    intro{ heading, text, images, buttons[]{ label, href } },
    teacherQuote{ quote, teacher->{ fullName, shortName, photo, "slug": slug.current } },
    programsIntro,
    venerablesIntro,
    instagram{ feedUrl, heading }
  },
  "featured": *[_type == "post" && category->slug.current == "dhammapada" && count(body.en[_type == "verse"]) > 0]
    | order(publishedAt desc)[0]{
      title,
      "slug": slug.current,
      "category": category->slug.current,
      "verseEn": body.en[_type == "verse"][0]{ pali, meaning, reference },
      "verseId": body.id[_type == "verse"][0]{ pali, meaning, reference }
    },
  "programs": *[_type == "program"] | order(order asc, name.en asc){
    _id, name, "slug": slug.current, icon, shortDescription, schedule[]{ day, startTime, endTime }, scheduleNote,
    audience, button{ label, href }, "contacts": contacts[]->{ name, whatsapp }
  },
  "events": *[_type == "event" && coalesce(endDate, startDate) >= $today] | order(startDate asc)[0...6]{
    _id, title, "slug": slug.current, type, startDate, endDate, audience, image,
    "sessions": sessions[]{ label, start, end },
    "guide": coalesce(guidedBy->fullName, guidedByText)
  },
  "hasPastEvents": count(*[_type == "event" && coalesce(endDate, startDate) < $today]) > 0,
  "venerables": *[_type == "teacher" && role == "resident" && residencyStart <= $today
      && (!defined(residencyEnd) || residencyEnd >= $today)] | order(order asc, fullName asc){
    _id, fullName, shortName, "slug": slug.current, photo, residencyStart, residencyEnd
  },
  "teachers": *[_type == "teacher" && role == "teacher"] | order(order asc, fullName asc){
    _id, fullName, shortName, "slug": slug.current, photo, bio
  },
  "articles": *[_type == "post" && defined(category)] | order(publishedAt desc)[0...3]{
    _id, title, "slug": slug.current, "category": category->{ title, "slug": slug.current }, coverImage, excerpt, publishedAt
  }
}`)

export const POST_LIST_QUERY = defineQuery(`{
  "posts": *[_type == "post" && defined(category)
      && ($category == "" || category->slug.current == $category)
      && ($search == "" || [title.en, title.id, excerpt.en, excerpt.id, pt::text(body.en), pt::text(body.id)] match $terms)]
    | order(publishedAt desc){
      _id, title, "slug": slug.current, "category": category->{ title, "slug": slug.current }, coverImage, excerpt, publishedAt
    },
  "categories": *[_type == "category" && count(*[_type == "post" && references(^._id)]) > 0] | order(title.en asc){
    title, "slug": slug.current
  },
  "page": *[_type == "page" && slug.current == "blog"][0]{ title, intro, seo }
}`)

export const POST_QUERY =
  defineQuery(`*[_type == "post" && slug.current == $slug && category->slug.current == $category][0]{
  _id,
  _updatedAt,
  title,
  "slug": slug.current,
  "category": category->{ title, "slug": slug.current },
  coverImage,
  excerpt,
  publishedAt,
  body,
  seo,
  "related": *[_type == "post" && category._ref == ^.category._ref && _id != ^._id] | order(publishedAt desc)[0...3]{
    _id, title, "slug": slug.current, "category": category->{ title, "slug": slug.current }, coverImage, excerpt, publishedAt
  }
}`)

export const EVENTS_QUERY = defineQuery(`{
  "upcoming": *[_type == "event" && coalesce(endDate, startDate) >= $today] | order(startDate asc){
    _id, title, "slug": slug.current, type, startDate, endDate, audience, image,
    "sessions": sessions[]{ label, start, end },
    "guide": coalesce(guidedBy->fullName, guidedByText)
  },
  "past": *[_type == "event" && coalesce(endDate, startDate) < $today] | order(startDate desc){
    _id, title, "slug": slug.current, type, startDate, endDate, audience, image,
    "sessions": sessions[]{ label, start, end },
    "guide": coalesce(guidedBy->fullName, guidedByText)
  },
  "page": *[_type == "page" && slug.current == "events"][0]{ title, intro, body[]{ _key, heading, content, images, background }, seo }
}`)

export const EVENT_QUERY = defineQuery(`*[_type == "event" && slug.current == $slug][0]{
  _id,
  _updatedAt,
  title,
  "slug": slug.current,
  type,
  startDate,
  endDate,
  "sessions": sessions[]{ _key, label, start, end },
  "guide": coalesce(guidedBy->fullName, guidedByText),
  "guideSlug": guidedBy->slug.current,
  audience,
  image,
  description,
  "contacts": contacts[]->{ name, whatsapp },
  seo
}`)

export const PROGRAMS_QUERY = defineQuery(`{
  "programs": *[_type == "program"] | order(order asc, name.en asc){
    _id, name, "slug": slug.current, icon, shortDescription, schedule[]{ day, startTime, endTime }, scheduleNote,
    audience, images, button{ label, href }, "contacts": contacts[]->{ name, whatsapp }
  },
  "page": *[_type == "page" && slug.current == "programs"][0]{ title, intro, body[]{ _key, heading, content, images, background }, seo }
}`)

export const TEACHERS_QUERY = defineQuery(`{
  "teachers": *[_type == "teacher" && role == "teacher"] | order(order asc, fullName asc){
    _id, fullName, shortName, "slug": slug.current, photo, bio
  },
  "page": *[_type == "page" && slug.current == "teachers"][0]{ title, intro, body[]{ _key, heading, content, images, background }, seo }
}`)

export const VENERABLES_QUERY = defineQuery(`{
  "venerables": *[_type == "teacher" && role == "resident"] | order(residencyStart desc, order asc, fullName asc){
    _id, fullName, shortName, "slug": slug.current, photo, bio, residencyStart, residencyEnd
  },
  "page": *[_type == "page" && slug.current == "residing-venerables"][0]{ title, intro, body[]{ _key, heading, content, images, background }, seo }
}`)

export const PAGE_QUERY = defineQuery(`*[_type == "page" && slug.current == $slug][0]{
  _id,
  _updatedAt,
  title,
  "slug": slug.current,
  intro,
  body[]{ _key, heading, content, images, background },
  seo
}`)

export const CHANTING_PAGE_QUERY =
  defineQuery(`*[_type == "page" && slug.current == $slug && string::startsWith(slug.current, $prefix)][0]{
  _id,
  _updatedAt,
  title,
  "slug": slug.current,
  intro,
  body[]{ _key, heading, content },
  seo,
  "related": *[_type == "page" && string::startsWith(slug.current, $prefix) && _id != ^._id] | order(title.en asc)[0...3]{
    _id, title, "slug": slug.current, intro
  }
}`)

export const NIBA_QUERY = defineQuery(`{
  "page": *[_type == "page" && slug.current == $slug][0]{
    _id, title, "slug": slug.current, intro, body[]{ _key, heading, content, images, background }, seo
  },
  "program": *[_type == "program" && (slug.current match "niba*" || name.en match "NIBA")] | order(order asc)[0]{
    _id, name, "slug": slug.current, icon, shortDescription, schedule[]{ day, startTime, endTime }, scheduleNote,
    audience, button{ label, href }, "contacts": contacts[]->{ name, whatsapp }
  }
}`)

export const SITEMAP_QUERY = defineQuery(`{
  "posts": *[_type == "post" && defined(slug.current) && defined(category)]{
    "slug": slug.current, "category": category->slug.current, _updatedAt
  },
  "events": *[_type == "event" && defined(slug.current)]{ "slug": slug.current, _updatedAt },
  "pages": *[_type == "page" && defined(slug.current)]{ "slug": slug.current, _updatedAt }
}`)
