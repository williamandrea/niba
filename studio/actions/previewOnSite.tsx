import { useEffect, useState } from 'react'
import { LaunchIcon } from '@sanity/icons/Launch'
import { useClient, type DocumentActionComponent } from 'sanity'
import { pathFor } from '../lib/paths'

const SITE_URL = (process.env.SANITY_STUDIO_SITE_URL || 'https://nauyana.id').replace(/\/$/, '')

/**
 * "Preview on site" button. Opens the published page in a new tab.
 * Changes show on the site after you press Publish (allow about 5 minutes).
 */
export const PreviewOnSiteAction: DocumentActionComponent = (props) => {
  const client = useClient({ apiVersion: '2026-09-30' })
  const doc = (props.published ?? props.draft) as {
    _type: string
    slug?: { current?: string }
    role?: string
    category?: { _ref?: string }
  } | null
  const categoryRef = doc?._type === 'post' ? doc.category?._ref : undefined
  const [categorySlug, setCategorySlug] = useState<string | null>(null)

  useEffect(() => {
    if (!categoryRef) return
    let active = true
    client
      .fetch<string | null>('*[_id == $id][0].slug.current', { id: categoryRef })
      .then((slug) => active && setCategorySlug(slug))
      .catch(() => active && setCategorySlug(null))
    return () => {
      active = false
    }
  }, [categoryRef, client])

  if (!doc) return null
  const path = pathFor({ ...doc, categorySlug })
  if (!path) return null

  return {
    label: 'Preview on site',
    icon: LaunchIcon,
    title: props.published ? 'Open the published page' : 'Publish first. The site only shows published content.',
    disabled: !props.published,
    onHandle: () => {
      window.open(`${SITE_URL}${path}`, '_blank', 'noopener')
    },
  }
}
