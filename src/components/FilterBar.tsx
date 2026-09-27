import { Filter, Calendar, Star, Plane, Layers, Tag, RotateCcw } from 'lucide-react'
import type { SearchFilterParams } from '../types/techlog'
import { A320_ATA_CHAPTERS, RESULT_STATUS_OPTIONS, COMMON_TAGS } from '../lib/a320-data'
import { useFilterOptions } from '../lib/api-client'

interface FilterBarProps {
  filters: SearchFilterParams
  onChange: (filters: SearchFilterParams) => void
  onReset: () => void
}

export default function FilterBar({ filters, onChange, onReset }: FilterBarProps) {
  const { data: options } = useFilterOptions()

  const isRegActive = Boolean(filters.aircraftRegistration && filters.aircraftRegistration !== 'ALL')
  const isAtaActive = Boolean(filters.ATAChapter && filters.ATAChapter !== 'ALL')
  const isResultActive = Boolean(filters.result && filters.result !== 'ALL')
  const isStartDateActive = Boolean(filters.startDate)
  const isEndDateActive = Boolean(filters.endDate)
  const isTagActive = Boolean(filters.tag && filters.tag !== 'ALL')

  const hasActiveFilters = Boolean(
    isRegActive ||
    isAtaActive ||
    isResultActive ||
    isTagActive ||
    isStartDateActive ||
    isEndDateActive ||
    filters.pinnedOnly
  )

  const registrations = options?.registrations || []

  return (
    <div className="p-4 rounded-sm border border-slate-300 dark:border-[#1e2638] bg-white dark:bg-[#111622] shadow-xs space-y-3.5">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#182030] pb-2.5">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          <Filter className="w-3.5 h-3.5 text-amber-500" />
          <span>// PARAMETRIC LOGBOOK FILTERS</span>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 font-mono text-xs text-rose-500 hover:text-rose-400 font-semibold transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>[RESET ALL FILTERS]</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Aircraft Registration */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Plane className="w-3 h-3 text-amber-500" />
            REGISTRATION
          </label>
          <select
            value={filters.aircraftRegistration || 'ALL'}
            onChange={(e) =>
              onChange({ ...filters, aircraftRegistration: e.target.value, offset: 0 })
            }
            className={`w-full text-xs font-mono py-1.5 px-2 rounded-sm border ${
              isRegActive
                ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold'
                : 'border-slate-300 dark:border-[#20293a] bg-slate-50 dark:bg-[#0c1018] text-slate-900 dark:text-slate-100'
            } focus:outline-none focus:border-amber-500`}
          >
            <option value="ALL">ALL AIRCRAFT</option>
            {registrations.map((reg) => (
              <option key={reg} value={reg}>
                {reg}
              </option>
            ))}
          </select>
        </div>

        {/* ATA Chapter */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Layers className="w-3 h-3 text-amber-500" />
            ATA CHAPTER
          </label>
          <select
            value={filters.ATAChapter || 'ALL'}
            onChange={(e) =>
              onChange({ ...filters, ATAChapter: e.target.value, offset: 0 })
            }
            className={`w-full text-xs font-mono py-1.5 px-2 rounded-sm border ${
              isAtaActive
                ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold'
                : 'border-slate-300 dark:border-[#20293a] bg-slate-50 dark:bg-[#0c1018] text-slate-900 dark:text-slate-100'
            } focus:outline-none focus:border-amber-500`}
          >
            <option value="ALL">ALL ATA CHAPTERS</option>
            {A320_ATA_CHAPTERS.map((item) => (
              <option key={item.chapter} value={item.chapter}>
                ATA {item.chapter} - {item.title}
              </option>
            ))}
          </select>
        </div>

        {/* Result Status */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
            WORK RESULT
          </label>
          <select
            value={filters.result || 'ALL'}
            onChange={(e) => onChange({ ...filters, result: e.target.value, offset: 0 })}
            className={`w-full text-xs font-mono py-1.5 px-2 rounded-sm border ${
              isResultActive
                ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold'
                : 'border-slate-300 dark:border-[#20293a] bg-slate-50 dark:bg-[#0c1018] text-slate-900 dark:text-slate-100'
            } focus:outline-none focus:border-amber-500`}
          >
            <option value="ALL">ALL RESULTS</option>
            {RESULT_STATUS_OPTIONS.map((res) => (
              <option key={res} value={res}>
                {res}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-amber-500" />
            DATE FROM
          </label>
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => onChange({ ...filters, startDate: e.target.value, offset: 0 })}
            className={`w-full text-xs font-mono py-1.5 px-2 rounded-sm border ${
              isStartDateActive
                ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold'
                : 'border-slate-300 dark:border-[#20293a] bg-slate-50 dark:bg-[#0c1018] text-slate-900 dark:text-slate-100'
            } focus:outline-none focus:border-amber-500`}
          />
        </div>

        {/* End Date */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-amber-500" />
            DATE TO
          </label>
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => onChange({ ...filters, endDate: e.target.value, offset: 0 })}
            className={`w-full text-xs font-mono py-1.5 px-2 rounded-sm border ${
              isEndDateActive
                ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold'
                : 'border-slate-300 dark:border-[#20293a] bg-slate-50 dark:bg-[#0c1018] text-slate-900 dark:text-slate-100'
            } focus:outline-none focus:border-amber-500`}
          />
        </div>

        {/* Tags / Favorites */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Tag className="w-3 h-3 text-amber-500" />
            TAGS / PINNED
          </label>
          <div className="flex items-center gap-2">
            <select
              value={filters.tag || 'ALL'}
              onChange={(e) => onChange({ ...filters, tag: e.target.value, offset: 0 })}
              className={`flex-1 text-xs font-mono py-1.5 px-2 rounded-sm border ${
                isTagActive
                  ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold'
                  : 'border-slate-300 dark:border-[#20293a] bg-slate-50 dark:bg-[#0c1018] text-slate-900 dark:text-slate-100'
              } focus:outline-none focus:border-amber-500`}
            >
              <option value="ALL">ALL TAGS</option>
              {COMMON_TAGS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => onChange({ ...filters, pinnedOnly: !filters.pinnedOnly, offset: 0 })}
              title={filters.pinnedOnly ? 'Show all records' : 'Show pinned records only'}
              className={`p-1.5 rounded-sm border transition ${
                filters.pinnedOnly
                  ? 'bg-amber-500 border-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'border-slate-300 dark:border-[#20293a] bg-slate-50 dark:bg-[#0c1018] text-slate-400 hover:text-amber-500'
              }`}
            >
              <Star className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Constraints Strip */}
      {hasActiveFilters && (
        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100 dark:border-[#182030] text-[11px] font-mono">
          <span className="text-slate-400 uppercase text-[10px]">ACTIVE FILTERS:</span>
          {isRegActive && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs bg-amber-500/10 border border-amber-500/40 text-amber-700 dark:text-amber-300">
              REG: {filters.aircraftRegistration}
              <button
                type="button"
                onClick={() => onChange({ ...filters, aircraftRegistration: 'ALL', offset: 0 })}
                className="hover:text-rose-500 font-bold ml-0.5"
              >
                ×
              </button>
            </span>
          )}
          {isAtaActive && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs bg-amber-500/10 border border-amber-500/40 text-amber-700 dark:text-amber-300">
              ATA: {filters.ATAChapter}
              <button
                type="button"
                onClick={() => onChange({ ...filters, ATAChapter: 'ALL', offset: 0 })}
                className="hover:text-rose-500 font-bold ml-0.5"
              >
                ×
              </button>
            </span>
          )}
          {isResultActive && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs bg-amber-500/10 border border-amber-500/40 text-amber-700 dark:text-amber-300">
              STATUS: {filters.result}
              <button
                type="button"
                onClick={() => onChange({ ...filters, result: 'ALL', offset: 0 })}
                className="hover:text-rose-500 font-bold ml-0.5"
              >
                ×
              </button>
            </span>
          )}
          {isTagActive && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs bg-amber-500/10 border border-amber-500/40 text-amber-700 dark:text-amber-300">
              TAG: {filters.tag}
              <button
                type="button"
                onClick={() => onChange({ ...filters, tag: 'ALL', offset: 0 })}
                className="hover:text-rose-500 font-bold ml-0.5"
              >
                ×
              </button>
            </span>
          )}
          {filters.pinnedOnly && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs bg-amber-500 text-slate-950 font-bold">
              ★ PINNED ONLY
              <button
                type="button"
                onClick={() => onChange({ ...filters, pinnedOnly: false, offset: 0 })}
                className="hover:text-rose-700 font-bold ml-0.5"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}
