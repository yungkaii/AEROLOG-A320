import { Link, useRouterState } from '@tanstack/react-router'
import {
  LayoutDashboard,
  FileSpreadsheet,
  Plus,
  Star,
  Lock,
} from 'lucide-react'
import { usePrivacyLock } from './PrivacyLock'

export default function MobileNav() {
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname
  const searchParams = routerState.location.search as Record<string, unknown>
  const isPinnedSearch = Boolean(searchParams?.pinnedOnly)
  const { lock } = usePrivacyLock()

  const isDashboard = currentPath === '/'
  const isTroubleshooting =
    currentPath === '/troubleshooting' || currentPath === '/troubleshooting/'
  const isNewRecord = currentPath === '/troubleshooting/new'

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 dark:bg-[#0c1018]/95 border-t border-slate-300 dark:border-[#1e2638] backdrop-blur-xl px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.5)] no-print safe-area-pb">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {/* Dashboard */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-sm transition duration-150 ${
            isDashboard
              ? 'text-amber-500 dark:text-amber-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <LayoutDashboard className={`w-5 h-5 ${isDashboard ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            {isDashboard && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-xs bg-amber-500" />
            )}
          </div>
          <span className="text-[9px] font-mono tracking-wider mt-1 uppercase">DASH</span>
        </Link>

        {/* History / Log */}
        <Link
          to="/troubleshooting"
          search={{ pinnedOnly: false }}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-sm transition duration-150 ${
            isTroubleshooting && !isPinnedSearch
              ? 'text-amber-500 dark:text-amber-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <FileSpreadsheet
              className={`w-5 h-5 ${
                isTroubleshooting && !isPinnedSearch ? 'stroke-[2.5]' : 'stroke-[1.8]'
              }`}
            />
            {isTroubleshooting && !isPinnedSearch && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-xs bg-amber-500" />
            )}
          </div>
          <span className="text-[9px] font-mono tracking-wider mt-1 uppercase">LOGBOOK</span>
        </Link>

        {/* Prominent Center Action: + New Defect */}
        <Link
          to="/troubleshooting/new"
          className="flex flex-col items-center justify-center -mt-5 mx-1 group"
          title="New Defect Record"
        >
          <div
            className={`w-11 h-11 rounded-sm flex items-center justify-center text-slate-950 font-mono font-bold shadow-lg transition transform duration-200 group-active:scale-95 ${
              isNewRecord
                ? 'bg-amber-400 ring-2 ring-amber-500/40 shadow-amber-500/30'
                : 'bg-amber-500 hover:bg-amber-400 shadow-amber-500/20'
            }`}
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </div>
          <span className="text-[9px] font-mono font-bold text-amber-600 dark:text-amber-400 mt-1 uppercase">
            + LOG
          </span>
        </Link>

        {/* Favorites */}
        <Link
          to="/troubleshooting"
          search={{ pinnedOnly: true }}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-sm transition duration-150 ${
            isTroubleshooting && isPinnedSearch
              ? 'text-amber-500 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Star
              className={`w-5 h-5 ${
                isTroubleshooting && isPinnedSearch
                  ? 'fill-amber-500 text-amber-500 stroke-[2.5]'
                  : 'stroke-[1.8]'
              }`}
            />
            {isTroubleshooting && isPinnedSearch && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-xs bg-amber-500" />
            )}
          </div>
          <span className="text-[9px] font-mono tracking-wider mt-1 uppercase">PINNED</span>
        </Link>

        {/* Lock Screen */}
        <button
          type="button"
          onClick={() => void lock()}
          title="Lock session"
          className="flex flex-col items-center justify-center flex-1 py-1 rounded-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition duration-150"
        >
          <Lock className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[9px] font-mono tracking-wider mt-1 uppercase">LOCK</span>
        </button>
      </div>
    </nav>
  )
}
