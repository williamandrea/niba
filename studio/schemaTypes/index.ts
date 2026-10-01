import { blockContent, callout, verse } from './objects/blockContent'
import { link } from './objects/link'
import { menuItem } from './objects/menuItem'
import { eventSession, pageSection, scheduleItem, socialLink } from './objects/misc'
import { seo } from './objects/seo'
import { category } from './documents/category'
import { contactPerson } from './documents/contactPerson'
import { event } from './documents/event'
import { homepage } from './documents/homepage'
import { page } from './documents/page'
import { post } from './documents/post'
import { program } from './documents/program'
import { siteSettings } from './documents/siteSettings'
import { teacher } from './documents/teacher'

export const SINGLETONS = ['siteSettings', 'homepage']

export const schemaTypes = [
  // Documents
  siteSettings,
  homepage,
  post,
  category,
  event,
  program,
  teacher,
  contactPerson,
  page,
  // Objects
  seo,
  link,
  menuItem,
  blockContent,
  verse,
  callout,
  scheduleItem,
  eventSession,
  socialLink,
  pageSection,
]
