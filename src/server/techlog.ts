import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { troubleshootingFormSchema } from '../types/techlog'
import type { SearchFilterParams } from '../types/techlog'

// ── Zod schemas for server-side validation ───────────────────────────────────

/**
 * Validates search/filter parameters from client.
 * All fields are optional and bounded to prevent abuse.
 */
const searchParamsSchema = z.object({
  query: z.string().max(500).optional(),
  aircraftRegistration: z.string().max(20).optional(),
  ATAChapter: z.string().max(10).optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
    .optional(),
  monthYear: z
    .string()
    .regex(/^\d{4}-\d{2}$/, 'Invalid month-year format')
    .optional(),
  result: z.string().max(100).optional(),
  tag: z.string().max(50).optional(),
  pinnedOnly: z.boolean().optional(),
  limit: z.number().int().min(1).max(200).optional(),
  offset: z.number().int().min(0).optional(),
})

/**
 * Full server-side form validation using the existing Zod schema.
 * Additional server-side constraints are applied here.
 */
const serverFormSchema = troubleshootingFormSchema.superRefine((data, ctx) => {
  // Validate each image
  for (let i = 0; i < data.images.length; i++) {
    const img = data.images[i]
    // URL must be a data URI (base64 image) or a valid https URL
    const isDataUri = img.url.startsWith('data:image/')
    const isHttpsUrl = img.url.startsWith('https://')
    if (!isDataUri && !isHttpsUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Image ${i}: URL must be a data URI (data:image/...) or HTTPS URL`,
        path: ['images', i, 'url'],
      })
    }
    // Limit data URI size: ~5MB base64 string
    if (isDataUri && img.url.length > 7_000_000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Image ${i}: file size exceeds maximum allowed limit`,
        path: ['images', i, 'url'],
      })
    }
    // Caption must be reasonable length
    if (img.caption.length > 200) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Image ${i}: caption exceeds 200 characters`,
        path: ['images', i, 'caption'],
      })
    }
  }
  // Limit total images
  if (data.images.length > 20) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Maximum 20 images per record',
      path: ['images'],
    })
  }
})

// ── Server Functions ─────────────────────────────────────────────────────────

// 1. Dashboard Stats
export const getDashboardStatsFn = createServerFn({ method: 'GET' }).handler(async () => {
  const { requireAuth } = await import('./auth.server')
  requireAuth()
  const { getDashboardStats } = await import('./techlog-db')
  return getDashboardStats()
})

// 2. Search & Filter
export const searchRecordsFn = createServerFn({ method: 'GET' })
  .validator((d: unknown) => {
    return searchParamsSchema.parse(d)
  })
  .handler(async ({ data }) => {
    const { requireAuth } = await import('./auth.server')
    requireAuth()
    const { searchTroubleshootingRecords } = await import('./techlog-db')
    return searchTroubleshootingRecords(data as SearchFilterParams)
  })

// 3. Get By ID
export const getRecordByIdFn = createServerFn({ method: 'GET' })
  .validator((id: unknown) => {
    return z.string().min(1).max(100).parse(id)
  })
  .handler(async ({ data }) => {
    const { requireAuth } = await import('./auth.server')
    requireAuth()
    const { getTroubleshootingRecordById } = await import('./techlog-db')
    return getTroubleshootingRecordById(data)
  })

// 4. Create Record — MUTATING, requires auth
export const createRecordFn = createServerFn({ method: 'POST' })
  .validator((d: unknown) => {
    return serverFormSchema.parse(d)
  })
  .handler(async ({ data }) => {
    const { requireAuth } = await import('./auth.server')
    requireAuth()
    const { createTroubleshootingRecord } = await import('./techlog-db')
    return createTroubleshootingRecord(data)
  })

// 5. Update Record — MUTATING, requires auth
export const updateRecordFn = createServerFn({ method: 'POST' })
  .validator((payload: unknown) => {
    const schema = z.object({
      id: z.string().min(1).max(100),
      data: serverFormSchema,
    })
    return schema.parse(payload)
  })
  .handler(async ({ data }) => {
    const { requireAuth } = await import('./auth.server')
    requireAuth()
    const { updateTroubleshootingRecord } = await import('./techlog-db')
    return updateTroubleshootingRecord(data.id, data.data)
  })

// 6. Delete Record — MUTATING, requires auth
export const deleteRecordFn = createServerFn({ method: 'POST' })
  .validator((id: unknown) => {
    return z.string().min(1).max(100).parse(id)
  })
  .handler(async ({ data }) => {
    const { requireAuth } = await import('./auth.server')
    requireAuth()
    const { deleteTroubleshootingRecord } = await import('./techlog-db')
    return deleteTroubleshootingRecord(data)
  })

// 7. Toggle Pin — MUTATING, requires auth
export const togglePinFn = createServerFn({ method: 'POST' })
  .validator((id: unknown) => {
    return z.string().min(1).max(100).parse(id)
  })
  .handler(async ({ data }) => {
    const { requireAuth } = await import('./auth.server')
    requireAuth()
    const { togglePinTroubleshootingRecord } = await import('./techlog-db')
    return togglePinTroubleshootingRecord(data)
  })

// 8. Recent Searches
export const getRecentSearchesFn = createServerFn({ method: 'GET' }).handler(async () => {
  const { requireAuth } = await import('./auth.server')
  requireAuth()
  const { getRecentSearches } = await import('./techlog-db')
  return getRecentSearches()
})

export const clearRecentSearchesFn = createServerFn({ method: 'POST' }).handler(async () => {
  const { requireAuth } = await import('./auth.server')
  requireAuth()
  const { clearRecentSearches } = await import('./techlog-db')
  return clearRecentSearches()
})

// 9. Filter Options
export const getFilterOptionsFn = createServerFn({ method: 'GET' }).handler(async () => {
  const { requireAuth } = await import('./auth.server')
  requireAuth()
  const { getFilterOptions } = await import('./techlog-db')
  return getFilterOptions()
})
