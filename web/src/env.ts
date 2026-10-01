declare const __PUBLIC_ENV__: {
  SANITY_PROJECT_ID: string
  SANITY_DATASET: string
  SITE_URL: string
  SANITY_API_HOST: string
}

/** Public build-time values. Set them in the root `.env` (see README). */
export const env = __PUBLIC_ENV__
