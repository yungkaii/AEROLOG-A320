import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { Edit, ArrowLeft } from 'lucide-react'
import RecordForm from '../../../components/RecordForm'
import { useRecord, useUpdateRecord } from '../../../lib/api-client'
import { useToast } from '../../../components/Toast'
import LoadingState from '../../../components/LoadingState'
import type { TroubleshootingFormData } from '../../../types/techlog'

export const Route = createFileRoute('/troubleshooting/$id/edit')({
  component: EditTroubleshootingPage,
})

function EditTroubleshootingPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const { data, isLoading, isError } = useRecord(id)
  const updateMutation = useUpdateRecord()
  const { success, error } = useToast()

  if (isLoading) {
    return <LoadingState message="Loading record for editing..." />
  }

  if (isError || !data || !data.record) {
    return (
      <div className="p-8 text-center rounded-sm border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#111622] space-y-3 font-mono">
        <p className="text-sm text-rose-500">// [SYSTEM ERROR] RECORD NOT FOUND FOR MODIFICATION</p>
        <Link
          to="/troubleshooting"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold uppercase transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to List
        </Link>
      </div>
    )
  }

  const { record } = data

  const handleSubmit = (formData: TroubleshootingFormData) => {
    updateMutation.mutate(
      { id: record.id, data: formData },
      {
        onSuccess: () => {
          success('Troubleshooting record updated successfully.')
          navigate({
            to: '/troubleshooting/$id',
            params: { id: record.id },
          })
        },
        onError: (err) => {
          console.error(err)
          error('Failed to update record. Please check your data.')
        },
      }
    )
  }

  const initialFormData: Partial<TroubleshootingFormData> = {
    aircraftType: record.aircraftType,
    aircraftRegistration: record.aircraftRegistration,
    aircraftMSN: record.aircraftMSN || '',
    effectivity: record.effectivity || '',
    date: record.date,
    ATAChapter: record.ATAChapter,
    ATASection: record.ATASection || '',
    defect: record.defect,
    troubleshootingAction: record.troubleshootingAction || '',
    finding: record.finding || '',
    rectification: record.rectification || '',
    result: record.result,
    partNumber: record.partNumber || '',
    serialNumber: record.serialNumber || '',
    jobCardNumber: record.jobCardNumber || '',
    workOrderNumber: record.workOrderNumber || '',
    referenceDocument: record.referenceDocument || '',
    technicianName: record.technicianName,
    notes: record.notes || '',
    isPinned: Boolean(record.isPinned),
    tags: record.tags || [],
    images: record.images || [],
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-300 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link
              to="/troubleshooting/$id"
              params={{ id: record.id }}
              className="text-xs font-mono text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-amber-500" />
              <span>[RETURN TO RECORD TELEMETRY]</span>
            </Link>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
              // RECORD MODIFICATION PROTOCOL
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Edit className="w-5 h-5 text-amber-500" />
            <span>Edit Troubleshooting Record</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
            Modify findings, actions, references, or manage evidence photos for{' '}
            <strong className="font-mono text-amber-600 dark:text-amber-400">
              {record.aircraftRegistration}
            </strong>
          </p>
        </div>
      </div>

      {/* Form with Preloaded Data */}
      <RecordForm
        initialData={initialFormData}
        isEditMode={true}
        isSubmitting={updateMutation.isPending}
        onSubmit={handleSubmit}
        onCancel={() =>
          navigate({
            to: '/troubleshooting/$id',
            params: { id: record.id },
          })
        }
      />
    </div>
  )
}
