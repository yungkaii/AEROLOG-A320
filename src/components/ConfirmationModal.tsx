import { useEffect } from 'react'
import { AlertTriangle, Trash2, X } from 'lucide-react'

interface ConfirmationModalProps {
  isOpen: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  isDestructive?: boolean
  isLoading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmationModal({
  isOpen,
  title = 'Delete this troubleshooting record?',
  message = 'This action cannot be undone. All recorded findings, actions, and evidence photos will be permanently deleted.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isDestructive = true,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-[#111622] border border-slate-300 dark:border-slate-800 rounded-sm p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 relative">
        {/* Top accent line */}
        <div className={`h-1 w-full absolute top-0 left-0 ${isDestructive ? 'bg-rose-500' : 'bg-amber-500'}`} />

        <div className="flex items-start justify-between pt-1">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-sm ${
                isDestructive
                  ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60'
                  : 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60'
              }`}
            >
              {isDestructive ? <Trash2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-widest text-slate-500 dark:text-slate-400 uppercase">
                // SYSTEM PROMPT
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-100 dark:bg-[#0c1018] p-3.5 rounded-sm border border-slate-200 dark:border-slate-800 font-mono">
          {message}
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-3.5 py-1.5 text-xs font-mono font-medium rounded-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition uppercase"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-1.5 text-xs font-mono font-bold rounded-sm text-white shadow-sm transition flex items-center gap-1.5 uppercase ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-500 active:bg-rose-700'
                : 'bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold'
            }`}
          >
            {isLoading ? 'PROCESSING...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
