
export default function LoadingState({ message = 'Accessing maintenance archive...' }: { message?: string }) {
  return (
    <div className="w-full py-12 flex flex-col items-center justify-center space-y-3">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border border-amber-500/20 animate-ping" />
        <div className="w-10 h-10 rounded-full border-2 border-t-amber-500 border-r-transparent border-b-slate-700 border-l-transparent animate-spin" />
      </div>
      <p className="text-xs font-mono text-slate-500 dark:text-slate-400 animate-pulse tracking-wider uppercase">
        // {message}
      </p>
    </div>
  )
}

export function RecordCardSkeleton() {
  return (
    <div className="p-4 sm:p-5 rounded-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111622] animate-pulse space-y-3 relative overflow-hidden">
      <div className="h-0.5 w-full bg-slate-200 dark:bg-slate-800 absolute top-0 left-0" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded-sm" />
          <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-sm" />
        </div>
        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-sm" />
      </div>
      <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-sm" />
      <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-sm" />
      <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded-sm" />
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded-sm" />
        <div className="h-7 w-20 bg-slate-200 dark:bg-slate-800 rounded-sm" />
      </div>
    </div>
  )
}
