import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes, SINGLETONS } from './schemaTypes'
import { structure } from './structure'
import { PreviewOnSiteAction, PreviewOnSiteIndonesianAction } from './actions/previewOnSite'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? ''
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

export default defineConfig({
  name: 'default',
  title: 'Na Uyana website',
  projectId,
  dataset,
  plugins: [
    structureTool({ structure }),
    // GROQ playground for the developer. Admins can ignore the "Vision" tab.
    visionTool({ defaultApiVersion: '2026-09-30' }),
  ],
  schema: {
    types: schemaTypes,
    templates: (templates) => [
      // Singletons are created once by the migration script, never from the "+" menu.
      ...templates.filter(({ schemaType }) => !SINGLETONS.includes(schemaType)),
      {
        id: 'teacher-role',
        title: 'Teacher with role',
        schemaType: 'teacher',
        parameters: [{ name: 'role', type: 'string' }],
        value: (params: { role: string }) => ({ role: params.role }),
      },
    ],
  },
  document: {
    actions: (prev, context) => {
      const actions = SINGLETONS.includes(context.schemaType)
        ? prev.filter(({ action }) => action && !['unpublish', 'delete', 'duplicate'].includes(action))
        : prev
      return [...actions, PreviewOnSiteAction, PreviewOnSiteIndonesianAction]
    },
    newDocumentOptions: (prev) =>
      prev.filter((item) => !SINGLETONS.includes(item.templateId) && item.templateId !== 'teacher-role'),
  },
})
