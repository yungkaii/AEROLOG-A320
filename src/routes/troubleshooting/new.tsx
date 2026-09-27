import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { PlusCircle, ArrowLeft } from 'lucide-react'
import RecordForm from '../../components/RecordForm'
import { useCreateRecord } from '../../lib/api-client'
import { useToast } from '../../components/Toast'
import type { TroubleshootingFormData } from '../../types/techlog'

export const Route = createFileRoute('/troubleshooting/new')({
  component: NewTroubleshootingPage,
})

function NewTroubleshootingPage() {
  const navigate = useNavigate()
  const createMutation = useCreateRecord()
  const { success, error } = useToast()

  const handleSubmit = (data: TroubleshootingFormData) => {
    createMutation.mutate(data, {
      onSuccess: (newRecord) => {
        success('Troubleshooting record saved successfully.')
        navigate({
          to: '/troubleshooting/$id',
          params: { id: newRecord.id },
        })
      },
      onError: (err) => {
        console.error(err)
        error('Failed to save record to database. Please check your data.')
      },
    })
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-300 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link
              to="/troubleshooting"
              className="text-xs font-mono text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-amber-500" />
              <span>[RETURN TO TROUBLESHOOTING ARCHIVE]</span>
            </Link>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
              // DATA ENTRY PROTOCOL
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <PlusCircle className="w-5 h-5 text-amber-500" />
            <span>New Troubleshooting Record</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
            Log aircraft defect, finding, action performed, and evidence documentation
          </p>
        </div>
      </div>

      {/* Form */}
      <RecordForm
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending}
        onCancel={() => navigate({ to: '/troubleshooting' })}
      />
    </div>
  )
}
