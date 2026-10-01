import type { StructureResolver } from 'sanity/structure'
import { CalendarIcon } from '@sanity/icons/Calendar'
import { CogIcon } from '@sanity/icons/Cog'
import { DocumentIcon } from '@sanity/icons/Document'
import { DocumentTextIcon } from '@sanity/icons/DocumentText'
import { HomeIcon } from '@sanity/icons/Home'
import { RocketIcon } from '@sanity/icons/Rocket'
import { TagIcon } from '@sanity/icons/Tag'
import { UserIcon } from '@sanity/icons/User'
import { UsersIcon } from '@sanity/icons/Users'

/** Today's date in Medan (WIB), e.g. 2026-10-01. */
function todayInMedan() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date())
}

export const structure: StructureResolver = (S) => {
  const today = todayInMedan()
  return S.list()
    .title('Na Uyana website')
    .items([
      S.listItem()
        .title('Settings')
        .icon(CogIcon)
        .child(S.document().schemaType('siteSettings').documentId('siteSettings').title('Settings')),
      S.listItem()
        .title('Homepage sections')
        .icon(HomeIcon)
        .child(S.document().schemaType('homepage').documentId('homepage').title('Homepage sections')),
      S.divider(),
      S.listItem()
        .title('Articles')
        .icon(DocumentTextIcon)
        .child(
          S.list()
            .title('Articles')
            .items([
              S.listItem()
                .title('All articles')
                .icon(DocumentTextIcon)
                .child(
                  S.documentTypeList('post')
                    .title('All articles')
                    .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }]),
                ),
              S.listItem().title('Categories').icon(TagIcon).child(S.documentTypeList('category').title('Categories')),
            ]),
        ),
      S.listItem()
        .title('Events')
        .icon(CalendarIcon)
        .child(
          S.list()
            .title('Events')
            .items([
              S.listItem()
                .title('Upcoming events')
                .icon(CalendarIcon)
                .child(
                  S.documentTypeList('event')
                    .title('Upcoming events')
                    .filter('_type == "event" && coalesce(endDate, startDate) >= $today')
                    .params({ today })
                    .defaultOrdering([{ field: 'startDate', direction: 'asc' }]),
                ),
              S.listItem()
                .title('Past events')
                .icon(CalendarIcon)
                .child(
                  S.documentTypeList('event')
                    .title('Past events')
                    .filter('_type == "event" && coalesce(endDate, startDate) < $today')
                    .params({ today })
                    .defaultOrdering([{ field: 'startDate', direction: 'desc' }]),
                ),
              S.listItem()
                .title('All events')
                .icon(CalendarIcon)
                .child(S.documentTypeList('event').title('All events')),
            ]),
        ),
      S.listItem()
        .title('Programs')
        .icon(RocketIcon)
        .child(
          S.documentTypeList('program')
            .title('Programs')
            .defaultOrdering([{ field: 'order', direction: 'asc' }]),
        ),
      S.listItem()
        .title('Teachers')
        .icon(UsersIcon)
        .child(
          S.list()
            .title('Teachers')
            .items([
              S.listItem()
                .title('Spiritual teachers')
                .icon(UsersIcon)
                .child(
                  S.documentTypeList('teacher')
                    .title('Spiritual teachers')
                    .filter('_type == "teacher" && role == "teacher"')
                    .initialValueTemplates([S.initialValueTemplateItem('teacher-role', { role: 'teacher' })])
                    .defaultOrdering([{ field: 'order', direction: 'asc' }]),
                ),
              S.listItem()
                .title('Residing venerables')
                .icon(UsersIcon)
                .child(
                  S.documentTypeList('teacher')
                    .title('Residing venerables')
                    .filter('_type == "teacher" && role == "resident"')
                    .initialValueTemplates([S.initialValueTemplateItem('teacher-role', { role: 'resident' })])
                    .defaultOrdering([{ field: 'residencyStart', direction: 'desc' }]),
                ),
            ]),
        ),
      S.listItem().title('Contacts').icon(UserIcon).child(S.documentTypeList('contactPerson').title('Contacts')),
      S.listItem().title('Pages').icon(DocumentIcon).child(S.documentTypeList('page').title('Pages')),
    ])
}
