import { createClient } from '@sanity/client'
import { env } from '~/env'

export const apiVersion = '2026-09-30'

export const sanityClient = createClient({
  projectId: env.SANITY_PROJECT_ID || 'missing-project-id',
  dataset: env.SANITY_DATASET,
  apiVersion,
  // Public dataset, read through Sanity's CDN. Admin edits show up within
  // seconds on the CDN, then within ~5 minutes on the cached site pages.
  useCdn: true,
  perspective: 'published',
  ...(env.SANITY_API_HOST ? { apiHost: env.SANITY_API_HOST, useProjectHostname: false } : {}),
})
