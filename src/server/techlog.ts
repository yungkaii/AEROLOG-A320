import { createServerFn } from '@tanstack/react-start'
import type {
  TroubleshootingFormData,
  SearchFilterParams,
} from '../types/techlog'

// 1. Dashboard Stats
export const getDashboardStatsFn = createServerFn({ method: 'GET' }).handler(async () => {
  const { getDashboardStats } = await import('./techlog-db')
  return getDashboardStats()
})

// 2. Search & Filter
export const searchRecordsFn = createServerFn({ method: 'GET' })
  .validator((d: SearchFilterParams) => d)
  .handler(async ({ data }) => {
    const { searchTroubleshootingRecords } = await import('./techlog-db')
    return searchTroubleshootingRecords(data)
  })

// 3. Get By ID
export const getRecordByIdFn = createServerFn({ method: 'GET' })
  .validator((id: string) => id)
  .handler(async ({ data }) => {
    const { getTroubleshootingRecordById } = await import('./techlog-db')
    return getTroubleshootingRecordById(data)
  })

// 4. Create Record
export const createRecordFn = createServerFn({ method: 'POST' })
  .validator((d: TroubleshootingFormData) => d)
  .handler(async ({ data }) => {
    const { createTroubleshootingRecord } = await import('./techlog-db')
    return createTroubleshootingRecord(data)
  })

// 5. Update Record
export const updateRecordFn = createServerFn({ method: 'POST' })
  .validator((payload: { id: string; data: TroubleshootingFormData }) => payload)
  .handler(async ({ data }) => {
    const { updateTroubleshootingRecord } = await import('./techlog-db')
    return updateTroubleshootingRecord(data.id, data.data)
  })

// 6. Delete Record
export const deleteRecordFn = createServerFn({ method: 'POST' })
  .validator((id: string) => id)
  .handler(async ({ data }) => {
    const { deleteTroubleshootingRecord } = await import('./techlog-db')
    return deleteTroubleshootingRecord(data)
  })

// 7. Toggle Pin
export const togglePinFn = createServerFn({ method: 'POST' })
  .validator((id: string) => id)
  .handler(async ({ data }) => {
    const { togglePinTroubleshootingRecord } = await import('./techlog-db')
    return togglePinTroubleshootingRecord(data)
  })

// 8. Recent Searches
export const getRecentSearchesFn = createServerFn({ method: 'GET' }).handler(async () => {
  const { getRecentSearches } = await import('./techlog-db')
  return getRecentSearches()
})

export const clearRecentSearchesFn = createServerFn({ method: 'POST' }).handler(async () => {
  const { clearRecentSearches } = await import('./techlog-db')
  return clearRecentSearches()
})

// 9. Filter Options
export const getFilterOptionsFn = createServerFn({ method: 'GET' }).handler(async () => {
  const { getFilterOptions } = await import('./techlog-db')
  return getFilterOptions()
})
