import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getDashboardStatsFn,
  searchRecordsFn,
  getRecordByIdFn,
  createRecordFn,
  updateRecordFn,
  deleteRecordFn,
  togglePinFn,
  getFilterOptionsFn,
  getRecentSearchesFn,
  clearRecentSearchesFn,
} from '../server/techlog'
import type { SearchFilterParams, TroubleshootingFormData } from '../types/techlog'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => getDashboardStatsFn(),
  })
}

export function useSearchRecords(params: SearchFilterParams) {
  return useQuery({
    queryKey: ['troubleshooting-records', params],
    queryFn: () => searchRecordsFn({ data: params }),
  })
}

export function useRecord(id: string) {
  return useQuery({
    queryKey: ['troubleshooting-record', id],
    queryFn: () => getRecordByIdFn({ data: id }),
    enabled: Boolean(id),
  })
}

export function useFilterOptions() {
  return useQuery({
    queryKey: ['filter-options'],
    queryFn: () => getFilterOptionsFn(),
  })
}

export function useRecentSearches() {
  return useQuery({
    queryKey: ['recent-searches'],
    queryFn: () => getRecentSearchesFn(),
  })
}

export function useCreateRecord() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: TroubleshootingFormData) => createRecordFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['troubleshooting-records'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['filter-options'] })
      queryClient.invalidateQueries({ queryKey: ['recent-searches'] })
    },
  })
}

export function useUpdateRecord() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TroubleshootingFormData }) =>
      updateRecordFn({ data: { id, data } }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['troubleshooting-records'] })
      queryClient.invalidateQueries({ queryKey: ['troubleshooting-record', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['filter-options'] })
    },
  })
}

export function useDeleteRecord() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteRecordFn({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['troubleshooting-records'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['filter-options'] })
    },
  })
}

export function useTogglePin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => togglePinFn({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['troubleshooting-records'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export function useClearRecentSearches() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => clearRecentSearchesFn(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-searches'] })
    },
  })
}
