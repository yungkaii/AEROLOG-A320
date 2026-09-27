import { ShieldCheck, AlertCircle } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-300 dark:border-slate-800/80 bg-white/80 dark:bg-[#0c1018]/90 py-5 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>
            <strong className="text-slate-900 dark:text-slate-200">AEROLOG // A320</strong> personal maintenance repository
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 max-w-xl text-center md:text-right">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
          <span>
            OPERATIONAL COMPLIANCE: Personal historical log only. Maintenance must strictly comply with active Airbus AMM, TSM, and MEL revisions.
          </span>
        </div>
      </div>
    </footer>
  )
}
