import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Star,
  ArrowRight,
  RotateCw,
} from 'lucide-react'
import { useDashboardStats } from '../lib/api-client'
import SearchBar from '../components/SearchBar'
import RecordCard from '../components/RecordCard'
import LoadingState from '../components/LoadingState'
import EmptyState from '../components/EmptyState'
import { A320_ATA_CHAPTERS } from '../lib/a320-data'

export const Route = createFileRoute('/')({
  component: DashboardPage,
})

function DashboardPage() {
  const navigate = useNavigate()
  const { data: stats, isLoading, isError, refetch } = useDashboardStats()
  const [activeTab, setActiveTab] = useState<'recent' | 'updated'>('recent')
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearchSubmit = (q: string) => {
    if (q.trim()) {
      navigate({
        to: '/troubleshooting',
        search: { query: q.trim() },
      })
    }
  }

  const handleAtaClick = (chapter: string) => {
    navigate({
      to: '/troubleshooting',
      search: { ATAChapter: chapter },
    })
  }

  if (isLoading) {
    return <LoadingState message="Loading maintenance dashboard & aircraft fleet status..." />
  }

  if (isError || !stats) {
    return (
      <div className="p-8 text-center rounded-sm border border-rose-300 dark:border-rose-900 bg-rose-50/50 dark:bg-[#1f0a0d]/60 space-y-4 font-mono">
        <p className="text-xs text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider">
          // [DATABASE READ ERROR] UNABLE TO COMPILE COCKPIT TELEMETRY
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-1.5 text-xs font-mono font-bold uppercase rounded-sm bg-rose-600 hover:bg-rose-500 text-white shadow-sm flex items-center gap-1.5 mx-auto transition"
        >
          <RotateCw className="w-3.5 h-3.5" />
          RETRY TELEMETRY ACQUISITION
        </button>
      </div>
    )
  }

  const currentRecords = activeTab === 'recent' ? stats.recentRecords : stats.recentlyUpdated

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Hero Welcome & Quick Search (Technical Engineering Blueprint Panel) */}
      <div className="relative overflow-hidden rounded-sm border border-slate-300 dark:border-[#1e2638] bg-white dark:bg-[#0c1018] text-slate-900 dark:text-white p-5 sm:p-7 lg:p-8 tech-grid shadow-xs">
        {/* Top Accent Line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-amber-500/50 to-transparent" />

        <div className="relative z-10 max-w-4xl space-y-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-xs bg-slate-900 text-amber-400 dark:bg-[#151c2a] dark:text-amber-400 border border-slate-700 dark:border-[#28354c] tracking-widest uppercase">
                // A320 TECHNICAL LOGBOOK
              </span>
              <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                AME MAINTENANCE ARCHIVE
              </span>
              <span className="inline-flex items-center gap-1 font-mono text-[9px] text-emerald-600 dark:text-emerald-400 px-1.5 py-0.2 rounded-xs bg-emerald-500/10 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>DATABASE READY</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 uppercase font-sans">
              Airbus A320 Defect & Troubleshooting History
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Personal engineering database for quick defect symptom lookup, confirmed root-cause findings, component rectifications, and verified photo documentation.
            </p>
          </div>

          {/* Primary Quick Search Bar */}
          <div className="pt-1 max-w-3xl">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearchSubmit={handleSearchSubmit}
              placeholder="Search symptom, defect, ATA, aircraft reg, P/N, or finding..."
              showRecentSearches={true}
              showQuickAtaChips={true}
              onSelectAtaChapter={handleAtaClick}
            />
          </div>
        </div>
      </div>

      {/* METRIC KPI INSTRUMENT READOUT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Records */}
        <div className="relative rounded-sm border border-slate-300 dark:border-[#1e2638] bg-white dark:bg-[#111622] p-4 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#182030]">
            <span className="font-mono text-[10px] tracking-widest text-slate-500 dark:text-slate-400 uppercase">
              // TOTAL LOGGED
            </span>
            <div className="flex items-center gap-1 font-mono text-[9px] px-1 py-0.2 rounded-xs bg-slate-100 dark:bg-[#161d2a] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#222b3c]">
              <span>CNT:REC</span>
            </div>
          </div>
          <div className="pt-3 pb-1 flex items-baseline justify-between">
            <div>
              <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-slate-900 dark:text-amber-400 tabular-nums">
                {String(stats.totalRecords).padStart(3, '0')}
              </div>
              <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">
                DEFECT ENTRIES
              </p>
            </div>
            <div className="text-right font-mono text-[9px] text-slate-400 border-l border-slate-200 dark:border-[#1c2436] pl-2 space-y-0.5">
              <div>A320-200</div>
              <div className="text-emerald-500 font-semibold">ALL SYS</div>
            </div>
          </div>
        </div>

        {/* Card 2: Aircraft Recorded */}
        <div className="relative rounded-sm border border-slate-300 dark:border-[#1e2638] bg-white dark:bg-[#111622] p-4 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#182030]">
            <span className="font-mono text-[10px] tracking-widest text-slate-500 dark:text-slate-400 uppercase">
              // FLEET REG
            </span>
            <div className="flex items-center gap-1 font-mono text-[9px] px-1 py-0.2 rounded-xs bg-slate-100 dark:bg-[#161d2a] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#222b3c]">
              <span>AIRFRAMES</span>
            </div>
          </div>
          <div className="pt-3 pb-1 flex items-baseline justify-between">
            <div>
              <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
                {String(stats.totalAircraft).padStart(2, '0')}
              </div>
              <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">
                UNIQUE TAILS
              </p>
            </div>
            <div className="text-right font-mono text-[9px] text-slate-400 border-l border-slate-200 dark:border-[#1c2436] pl-2 space-y-0.5">
              <div>MSN RANGE</div>
              <div className="text-slate-600 dark:text-slate-300 font-semibold">ACTIVE</div>
            </div>
          </div>
        </div>

        {/* Card 3: This Month */}
        <div className="relative rounded-sm border border-slate-300 dark:border-[#1e2638] bg-white dark:bg-[#111622] p-4 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#182030]">
            <span className="font-mono text-[10px] tracking-widest text-slate-500 dark:text-slate-400 uppercase">
              // CURRENT PERIOD
            </span>
            <div className="flex items-center gap-1 font-mono text-[9px] px-1 py-0.2 rounded-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>ACTIVE</span>
            </div>
          </div>
          <div className="pt-3 pb-1 flex items-baseline justify-between">
            <div>
              <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-slate-900 dark:text-emerald-400 tabular-nums">
                {String(stats.recordsThisMonth).padStart(2, '0')}
              </div>
              <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">
                THIS MONTH LOGS
              </p>
            </div>
            <div className="text-right font-mono text-[9px] text-slate-400 border-l border-slate-200 dark:border-[#1c2436] pl-2 space-y-0.5">
              <div>MAINT CYC</div>
              <div className="text-emerald-500 font-semibold">LOGGED</div>
            </div>
          </div>
        </div>

        {/* Card 4: Pinned Favorites */}
        <div className="relative rounded-sm border border-slate-300 dark:border-[#1e2638] bg-white dark:bg-[#111622] p-4 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#182030]">
            <span className="font-mono text-[10px] tracking-widest text-slate-500 dark:text-slate-400 uppercase">
              // PINNED CAUTION
            </span>
            <div className="flex items-center gap-1 font-mono text-[9px] px-1 py-0.2 rounded-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Star className="w-2.5 h-2.5 fill-current" />
              <span>REF</span>
            </div>
          </div>
          <div className="pt-3 pb-1 flex items-baseline justify-between">
            <div>
              <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-slate-900 dark:text-amber-400 tabular-nums">
                {String(stats.pinnedRecords).padStart(2, '0')}
              </div>
              <Link
                to="/troubleshooting"
                search={{ pinnedOnly: true }}
                className="text-[10px] font-mono text-amber-600 dark:text-amber-400 hover:underline uppercase tracking-wider mt-0.5 inline-block"
              >
                VIEW PINNED →
              </Link>
            </div>
            <div className="text-right font-mono text-[9px] text-slate-400 border-l border-slate-200 dark:border-[#1c2436] pl-2 space-y-0.5">
              <div>FREQUENT</div>
              <div className="text-amber-500 font-semibold">BOOKMARK</div>
            </div>
          </div>
        </div>
      </div>

      {/* ATA Chapters Breakdown Strip */}
      {stats.topATAChapters.length > 0 && (
        <div className="p-4 sm:p-5 rounded-sm border border-slate-300 dark:border-[#1e2638] bg-white dark:bg-[#111622] shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#182030] pb-2.5">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <span className="text-amber-500">//</span>
              <span>ATA SYSTEM DEFECT DISTRIBUTION</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 uppercase">[CLICK ATA TO FILTER]</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {stats.topATAChapters.map((item) => {
              const ata = A320_ATA_CHAPTERS.find((a) => a.chapter === item.chapter)
              return (
                <button
                  key={item.chapter}
                  onClick={() => handleAtaClick(item.chapter)}
                  className="flex flex-col p-2.5 rounded-sm border border-slate-300 dark:border-[#1e2638] bg-slate-50 dark:bg-[#0c1018] hover:border-amber-500 transition text-left group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-xs text-amber-600 dark:text-amber-400">
                      ATA {item.chapter}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-xs bg-slate-200 dark:bg-[#182030] text-slate-700 dark:text-slate-300 font-semibold">
                      {item.count}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 line-clamp-1 group-hover:text-slate-900 dark:group-hover:text-white uppercase">
                    {ata ? ata.title : `SYS ${item.chapter}`}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* RECENT RECORDS SECTION */}
      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-300 dark:border-[#1e2638] pb-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('recent')}
              className={`px-3 py-1.5 rounded-sm text-xs font-mono uppercase tracking-wider transition ${
                activeTab === 'recent'
                  ? 'bg-slate-900 text-amber-400 dark:bg-[#161d2a] dark:text-amber-400 border border-slate-700 dark:border-[#2a3850]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#141b27]'
              }`}
            >
              [ LATEST LOGBOOK ENTRIES ]
            </button>
            <button
              onClick={() => setActiveTab('updated')}
              className={`px-3 py-1.5 rounded-sm text-xs font-mono uppercase tracking-wider transition ${
                activeTab === 'updated'
                  ? 'bg-slate-900 text-amber-400 dark:bg-[#161d2a] dark:text-amber-400 border border-slate-700 dark:border-[#2a3850]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#141b27]'
              }`}
            >
              [ RECENTLY REVISED ]
            </button>
          </div>

          {/* View All link */}
          <Link
            to="/troubleshooting"
            className="inline-flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 hover:underline"
          >
            <span>VIEW ALL LOGS ({stats.totalRecords})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Cards Grid */}
        {currentRecords.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentRecords.map((record) => (
              <RecordCard key={record.id} record={record} viewMode="card" />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
