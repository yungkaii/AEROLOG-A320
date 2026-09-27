import { Link } from '@tanstack/react-router'
import { Wrench, Plus, SearchX } from 'lucide-react'

interface EmptyStateProps {
  type?: 'no-records' | 'no-results'
  title?: string
  description?: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
}

export default function EmptyState({
  type = 'no-records',
  title,
  description,
  actionLabel = 'Create Troubleshooting Record',
  actionHref = '/troubleshooting/new',
  onAction,
}: EmptyStateProps) {
  const isSearch = type === 'no-results'

  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-sm border border-dashed border-slate-300 dark:border-slate-800 bg-white/60 dark:bg-[#0c1018]/60 my-6 relative overflow-hidden">
      <div className="w-12 h-12 rounded-sm bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 mb-4 shadow-inner">
        {isSearch ? <SearchX className="w-6 h-6 text-amber-500" /> : <Wrench className="w-6 h-6 text-slate-400" />}
      </div>

      <div className="text-[10px] font-mono tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-1">
        // {isSearch ? 'QUERY RESULT: 0 MATCHES' : 'ARCHIVE REPOSITORY: EMPTY'}
      </div>

      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
        {title || (isSearch ? 'No matching records found' : 'No troubleshooting records yet')}
      </h3>

      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mt-1.5 mb-6 leading-relaxed font-mono">
        {description ||
          (isSearch
            ? 'Adjust ATA chapter filter, aircraft registration, or defect keywords.'
            : 'Record your first Airbus A320 defect, finding, action taken, and photo evidence to build your personal technical archive.')}
      </p>

      {onAction ? (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-xs font-mono font-bold uppercase shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </button>
      ) : actionHref ? (
        <Link
          to={actionHref}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-xs font-mono font-bold uppercase shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </Link>
      ) : null}
    </div>
  )
}
