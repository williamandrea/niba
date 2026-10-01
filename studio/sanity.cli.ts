import { fileURLToPath } from 'node:url'
import { defineCliConfig } from 'sanity/cli'

// One .env file at the repo root holds the project settings (see .env.example).
try {
  process.loadEnvFile(fileURLToPath(new URL('../.env', import.meta.url)))
} catch {
  // No root .env (e.g. in CI). Use the environment as is.
}

const projectId = process.env.SANITY_PROJECT_ID ?? process.env.SANITY_STUDIO_PROJECT_ID ?? ''
const dataset = process.env.SANITY_DATASET || process.env.SANITY_STUDIO_DATASET || 'production'

// The Studio bundle reads SANITY_STUDIO_* variables. Mirror the shared names.
process.env.SANITY_STUDIO_PROJECT_ID ??= projectId
process.env.SANITY_STUDIO_DATASET ??= dataset
process.env.SANITY_STUDIO_SITE_URL ??= process.env.SITE_URL ?? 'https://nauyana.id'

export default defineCliConfig({
  api: { projectId, dataset },
  deployment: {
    // Hosted at https://<studioHost>.sanity.studio. The first `sanity deploy` asks for the name
    // and prints an appId. Paste it here so later deploys reuse the same Studio.
    appId: process.env.SANITY_STUDIO_APP_ID || undefined,
    autoUpdates: true,
  },
  schemaExtraction: {
    path: './schema.json',
    // Required fields become non-optional in the generated types.
    enforceRequiredFields: true,
  },
  typegen: {
    path: '../web/src/**/*.{ts,tsx}',
    schema: './schema.json',
    generates: '../web/src/lib/sanity/sanity.types.ts',
    overloadClientMethods: true,
  },
})
