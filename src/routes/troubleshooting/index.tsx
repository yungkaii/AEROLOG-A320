import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import {
  FileSpreadsheet,
  Plus,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react'
import type { SearchFilterParams } from '../../types/techlog'
import { useSearchRecords } from '../../lib/api-client'
import SearchBar from '../../components/SearchBar'
import FilterBar from '../../components/FilterBar'
import RecordCard from '../../components/RecordCard'
import EmptyState from '../../components/EmptyState'
import LoadingState from '../../components/LoadingState'

export const Route = createFileRoute('/troubleshooting/')({
  validateSearch: (search: Record<string, unknown>): SearchFilterParams => {
    return {
      query: (search.query as string) || '',
      aircraftRegistration: (search.aircraftRegistration as string) || 'ALL',
      ATAChapter: (search.ATAChapter as string) || 'ALL',
      startDate: (search.startDate as string) || '',
      endDate: (search.endDate as string) || '',
      result: (search.result as string) || 'ALL',
      tag: (search.tag as string) || 'ALL',
      pinnedOnly: Boolean(search.pinnedOnly),
      limit: Number(search.limit) || 15,
      offset: Number(search.offset) || 0,
    }
  },
  component: TroubleshootingListPage,
})

function TroubleshootingListPage() {
  const navigate = useNavigate()
  const searchParams = Route.useSearch()
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card')
  const [showFilters, setShowFilters] = useState(false)
  const [localSearch, setLocalSearch] = useState(searchParams.query || '')

  // Keep local search input synced if searchParams.query changes externally
  useEffect(() => {
    setLocalSearch(searchParams.query || '')
  }, [searchParams.query])

  // Query records
  const { data, isLoading, isError, refetch } = useSearchRecords(searchParams)
  const records = data?.records || []
  const total = data?.total || 0

  const limit = searchParams.limit || 15
  const offset = searchParams.offset || 0
  const currentPage = Math.floor(offset / limit) + 1
  const totalPages = Math.ceil(total / limit) || 1

  const updateSearch = (newParams: Partial<SearchFilterParams>) => {
    navigate({
      to: '/troubleshooting',
      search: {
        ...searchParams,
        ...newParams,
      },
    })
  }

  const handleSearchSubmit = (q: string) => {
    updateSearch({ query: q.trim(), offset: 0 })
  }

  const handleResetFilters = () => {
    setLocalSearch('')
    navigate({
      to: '/troubleshooting',
      search: {
        query: '',
        aircraftRegistration: 'ALL',
        ATAChapter: 'ALL',
        startDate: '',
        endDate: '',
        result: 'ALL',
        tag: 'ALL',
        pinnedOnly: false,
        limit: 15,
        offset: 0,
      },
    })
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-300 dark:border-[#1e2638] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
              // ARCHIVE SYSTEM
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white uppercase font-sans flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-500" />
            <span>Troubleshooting Logbook</span>
          </h1>
          <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
            PERSONAL MAINTENANCE RECORDS • SYMPTOM RECOVERY • ROOT-CAUSE AUDIT
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View mode toggle */}
          <div className="flex items-center p-0.5 rounded-sm border border-slate-300 dark:border-[#20293a] bg-white dark:bg-[#111622]">
            <button
              onClick={() => setViewMode('card')}
              title="Card view"
              className={`p-1.5 rounded-xs text-xs transition ${
                viewMode === 'card'
                  ? 'bg-slate-900 text-amber-400 dark:bg-[#182132] dark:text-amber-400'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Compact list view"
              className={`p-1.5 rounded-xs text-xs transition ${
                viewMode === 'table'
                  ? 'bg-slate-900 text-amber-400 dark:bg-[#182132] dark:text-amber-400'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-sm border transition ${
              showFilters ||
              searchParams.aircraftRegistration !== 'ALL' ||
              searchParams.ATAChapter !== 'ALL' ||
              searchParams.pinnedOnly
                ? 'bg-slate-900 text-amber-400 dark:bg-[#171f2e] dark:text-amber-400 border-slate-700 dark:border-[#2a3850]'
                : 'border-slate-300 dark:border-[#20293a] bg-white dark:bg-[#111622] text-slate-700 dark:text-slate-300 hover:border-slate-400'
            }`}
          >
            <Filter className="w-3.5 h-3.5 text-amber-500" />
            <span>[FILTERS]</span>
          </button>

          {/* New Troubleshooting Button */}
          <Link
            to="/troubleshooting/new"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>+ LOG DEFECT</span>
          </Link>
        </div>
      </div>

      {/* Main Search Bar */}
      <SearchBar
        value={localSearch}
        onChange={(v) => {
          setLocalSearch(v)
          updateSearch({ query: v, offset: 0 })
        }}
        onSearchSubmit={handleSearchSubmit}
        onSelectAtaChapter={(ch) => updateSearch({ ATAChapter: ch, offset: 0 })}
        placeholder="Type keywords (e.g. nose wheel steering, yellow hydraulic, bleed prv, brake hot)..."
      />

      {/* Parametric Filter Bar */}
      {showFilters && (
        <FilterBar
          filters={searchParams}
          onChange={(newFilters) => updateSearch(newFilters)}
          onReset={handleResetFilters}
        />
      )}

      {/* Results Header: Count & Status */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
        <div>
          ENTRIES: <strong className="text-slate-900 dark:text-slate-100">{records.length}</strong> /{' '}
          <strong className="text-slate-900 dark:text-slate-100">{total}</strong> TOTAL
          {searchParams.query && (
            <span>
              {' '}
              QUERY: &quot;
              <strong className="text-amber-600 dark:text-amber-400">{searchParams.query}</strong>
              &quot;
            </span>
          )}
        </div>

        {total > 0 && (
          <div className="text-xs font-mono text-slate-500">
            PAGE {currentPage} / {totalPages}
          </div>
        )}
      </div>

      {/* Content Area */}
      {isLoading ? (
        <LoadingState message="Searching maintenance records..." />
      ) : isError ? (
        <div className="p-8 text-center rounded-sm border border-rose-300 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20 space-y-3">
          <p className="text-xs font-mono text-rose-600 dark:text-rose-400">
            ERROR: UNABLE TO ACCESS LOCAL LOGBOOK DATABASE.
          </p>
          <button
            onClick={() => refetch()}
            className="px-3 py-1.5 rounded-sm bg-rose-600 text-white text-xs font-mono uppercase"
          >
            RETRY QUERY
          </button>
        </div>
      ) : records.length === 0 ? (
        <EmptyState
          type="no-results"
          title={searchParams.query ? 'No matching defect records' : 'No records found'}
          description={
            searchParams.query
              ? `No records found matching "${searchParams.query}". Try searching for defect symptoms, ATA numbers, or component names.`
              : 'No troubleshooting records match the active filter criteria.'
          }
          actionLabel="Reset Search & Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div
          className={
            viewMode === 'card'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4'
              : 'space-y-2.5'
          }
        >
          {records.map((record) => (
            <RecordCard key={record.id} record={record} viewMode={viewMode} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-5 border-t border-slate-300 dark:border-[#1e2638]">
          <button
            type="button"
            disabled={offset === 0}
            onClick={() => updateSearch({ offset: Math.max(0, offset - limit) })}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase rounded-sm border border-slate-300 dark:border-[#20293a] bg-white dark:bg-[#111622] text-slate-700 dark:text-slate-300 hover:border-amber-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>PREV</span>
          </button>

          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            {currentPage} / {totalPages}
          </span>

          <button
            type="button"
            disabled={offset + limit >= total}
            onClick={() => updateSearch({ offset: offset + limit })}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase rounded-sm border border-slate-300 dark:border-[#20293a] bg-white dark:bg-[#111622] text-slate-700 dark:text-slate-300 hover:border-amber-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <span>NEXT</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
