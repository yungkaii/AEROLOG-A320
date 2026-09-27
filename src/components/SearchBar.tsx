import { useState, useRef } from 'react'
import { Search, X, Clock } from 'lucide-react'
import { useRecentSearches, useClearRecentSearches } from '../lib/api-client'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onSearchSubmit?: (value: string) => void
  placeholder?: string
  autoFocus?: boolean
  showRecentSearches?: boolean
  showQuickAtaChips?: boolean
  onSelectAtaChapter?: (chapter: string) => void
}

export default function SearchBar({
  value,
  onChange,
  onSearchSubmit,
  placeholder = 'Search troubleshooting, defect, ATA, registration, part number, finding...',
  autoFocus = false,
  showRecentSearches = true,
  showQuickAtaChips = true,
  onSelectAtaChapter,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { data: recentSearches = [] } = useRecentSearches()
  const clearRecentMutation = useClearRecentSearches()

  const quickAtaPills = [
    { chapter: '32', label: 'ATA 32 Landing Gear' },
    { chapter: '21', label: 'ATA 21 Air Cond' },
    { chapter: '29', label: 'ATA 29 Hydraulic' },
    { chapter: '36', label: 'ATA 36 Pneumatic' },
    { chapter: '52', label: 'ATA 52 Doors' },
    { chapter: '34', label: 'ATA 34 Navigation' },
  ]

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearchSubmit?.(value)
      setIsFocused(false)
    } else if (e.key === 'Escape') {
      onChange('')
      setIsFocused(false)
    }
  }

  return (
    <div className="w-full space-y-2.5">
      {/* Search Input Box */}
      <div
        className={`relative flex items-center rounded-sm border transition-all duration-150 bg-white dark:bg-[#0c1018] shadow-xs ${
          isFocused
            ? 'border-amber-500 ring-1 ring-amber-500/30'
            : 'border-slate-300 dark:border-[#20293a] hover:border-slate-400 dark:hover:border-[#2c3850]'
        }`}
      >
        <div className="pl-3.5 pr-2 text-slate-400 dark:text-slate-500 flex items-center">
          <Search className="w-4 h-4 text-amber-500" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          placeholder={placeholder}
          className="w-full py-3 pr-10 text-sm font-mono bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
        />

        {value ? (
          <button
            type="button"
            onClick={() => {
              onChange('')
              inputRef.current?.focus()
            }}
            className="p-1 mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xs hover:bg-slate-100 dark:hover:bg-[#171f2e] transition"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <div className="hidden sm:flex items-center gap-1 mr-3 text-xs text-slate-400 font-mono">
            <span className="px-1.5 py-0.5 rounded-xs bg-slate-100 dark:bg-[#161c28] border border-slate-300 dark:border-[#242e42] text-[10px]">
              [ENTER ↵]
            </span>
          </div>
        )}
      </div>

      {/* Recent searches dropdown / hints */}
      {showRecentSearches && isFocused && recentSearches.length > 0 && !value && (
        <div className="p-3 rounded-sm border border-slate-300 dark:border-[#20293a] bg-white dark:bg-[#111622] shadow-xl space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono uppercase tracking-wider">
            <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <Clock className="w-3 h-3 text-amber-500" />
              PRIOR QUERIES
            </span>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => clearRecentMutation.mutate()}
              className="text-[10px] text-slate-400 hover:text-rose-500 transition"
            >
              [CLEAR]
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {recentSearches.map((term, i) => (
              <button
                key={i}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(term)
                  onSearchSubmit?.(term)
                  setIsFocused(false)
                }}
                className="px-2 py-0.5 text-xs font-mono rounded-sm bg-slate-100 dark:bg-[#161d2a] hover:border-amber-500/50 border border-slate-200 dark:border-[#222b3c] text-slate-700 dark:text-slate-300 transition flex items-center gap-1"
              >
                <span>{term}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick ATA Chips */}
      {showQuickAtaChips && onSelectAtaChapter && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap pl-1">
            SYS:
          </span>
          {quickAtaPills.map((pill) => (
            <button
              key={pill.chapter}
              type="button"
              onClick={() => onSelectAtaChapter(pill.chapter)}
              className="whitespace-nowrap px-2.5 py-1 rounded-sm border border-slate-300 dark:border-[#20293a] bg-slate-100/70 dark:bg-[#111622] hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 text-slate-700 dark:text-slate-300 text-xs font-mono transition"
            >
              {pill.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
