import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const rootDir = fileURLToPath(new URL('..', import.meta.url))

export default defineConfig(({ mode }) => {
  // One .env file at the repo root (see .env.example). CI (GitHub Actions)
  // passes the same names as build variables, which land in process.env.
  const env = { ...loadEnv(mode, rootDir, ''), ...process.env }

  // Only these public values reach the bundle. Never add tokens here.
  const publicEnv = {
    SANITY_PROJECT_ID: env.SANITY_PROJECT_ID ?? '',
    SANITY_DATASET: env.SANITY_DATASET || 'production',
    SITE_URL: (env.SITE_URL || 'https://nauyana.id').replace(/\/$/, ''),
    // Optional. Only for local testing against a mock Sanity API.
    SANITY_API_HOST: env.SANITY_API_HOST ?? '',
  }

  return {
    server: {
      port: 3000,
    },
    resolve: {
      tsconfigPaths: true,
    },
    define: {
      __PUBLIC_ENV__: JSON.stringify(publicEnv),
    },
    plugins: [tailwindcss(), cloudflare({ viteEnvironment: { name: 'ssr' } }), tanstackStart(), viteReact()],
  }
})
