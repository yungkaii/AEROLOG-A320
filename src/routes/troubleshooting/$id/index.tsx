import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import {
  ArrowLeft,
  Edit,
  Trash2,
  Printer,
  Star,
  Plane,
  Calendar,
  Layers,
  Wrench,
  Clock,
  Tag,
  ShieldCheck,
  Copy,
  Check,
} from 'lucide-react'
import RecordCard from '../../../components/RecordCard'
import ImageGallery from '../../../components/ImageGallery'
import ConfirmationModal from '../../../components/ConfirmationModal'
import LoadingState from '../../../components/LoadingState'
import { useRecord, useDeleteRecord, useTogglePin } from '../../../lib/api-client'
import { A320_ATA_CHAPTERS } from '../../../lib/a320-data'
import { useToast } from '../../../components/Toast'

export const Route = createFileRoute('/troubleshooting/$id/')({
  component: TroubleshootingDetailPage,
})

function TroubleshootingDetailPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const { data, isLoading, isError } = useRecord(id)
  const deleteMutation = useDeleteRecord()
  const togglePinMutation = useTogglePin()
  const { success, error, toast } = useToast()

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [copied, setCopied] = useState(false)

  if (isLoading) {
    return <LoadingState message="Loading troubleshooting details & evidence photos..." />
  }

  if (isError || !data || !data.record) {
    return (
      <div className="p-8 text-center rounded-sm border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#111622] space-y-4 my-6 font-mono">
        <div className="text-[10px] tracking-widest text-rose-500 uppercase">
          // [NOT FOUND] TELEMETRY NULL
        </div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Record Not Found
        </h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          The requested troubleshooting log record could not be found or has been purged from the archive.
        </p>
        <Link
          to="/troubleshooting"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-bold uppercase rounded-sm bg-amber-500 hover:bg-amber-400 text-slate-950 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Archive
        </Link>
      </div>
    )
  }

  const { record, relatedRecords } = data

  const ataInfo = A320_ATA_CHAPTERS.find((a) => a.chapter === record.ATAChapter)
  const ataTitle = ataInfo ? ataInfo.title : `ATA ${record.ATAChapter}`

  // Format date
  const formattedDate = (() => {
    try {
      const d = new Date(record.date)
      return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    } catch {
      return record.date
    }
  })()

  // Format timestamps
  const formattedCreated = new Date(record.createdAt).toLocaleString('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
  const formattedUpdated = new Date(record.updatedAt).toLocaleString('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  // Delete handler
  const handleDeleteConfirm = () => {
    deleteMutation.mutate(record.id, {
      onSuccess: () => {
        success('Troubleshooting record deleted successfully.')
        navigate({ to: '/troubleshooting' })
      },
      onError: (err) => {
        console.error(err)
        error('Failed to delete record.')
      },
    })
  }

  // Copy handover summary to clipboard
  const handleCopySummary = () => {
    const summaryText = `[A320 TECHLOG RECORD]
A/C: ${record.aircraftRegistration} (${record.aircraftType})
DATE: ${record.date} | ATA ${record.ATAChapter} (${ataTitle})
DEFECT: ${record.defect}
FINDING: ${record.finding || 'N/A'}
ACTION: ${record.troubleshootingAction || 'N/A'}
RECTIFICATION: ${record.rectification || 'N/A'}
RESULT: ${record.result}
TECH: ${record.technicianName}
REF: ${record.referenceDocument || 'N/A'}`

    navigator.clipboard.writeText(summaryText)
    setCopied(true)
    toast('Handover summary copied to clipboard!', 'info')
    setTimeout(() => setCopied(false), 2500)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleTogglePin = () => {
    togglePinMutation.mutate(record.id, {
      onSuccess: (newPinned) => {
        toast(newPinned ? 'Pinned to favorites' : 'Unpinned from favorites', 'info')
      },
    })
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      {/* Printable Sheet Header (Only visible when printing) */}
      <div className="hidden print-only mb-6 border-b-2 border-slate-900 pb-4 text-left">
        <h1 className="text-xl font-bold font-mono">AIRBUS A320 MAINTENANCE TROUBLESHOOTING LOG</h1>
        <p className="text-xs text-slate-600 font-mono mt-0.5">
          Record ID: {record.id} • Printed: {new Date().toLocaleString()}
        </p>
      </div>

      {/* Top Navigation & Action Buttons (Hidden when printing) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-300 dark:border-[#1e2638] pb-4 no-print">
        <Link
          to="/troubleshooting"
          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>[BACK TO LOGBOOK ARCHIVE]</span>
        </Link>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Favorite Toggle */}
          <button
            type="button"
            onClick={handleTogglePin}
            title={record.isPinned ? 'Remove from favorites' : 'Pin to favorites'}
            className={`p-1.5 rounded-sm border transition ${
              record.isPinned
                ? 'bg-amber-500/15 text-amber-500 border-amber-500/40'
                : 'border-slate-300 dark:border-[#20293a] text-slate-400 hover:text-amber-500'
            }`}
          >
            <Star className={`w-4 h-4 ${record.isPinned ? 'fill-current' : ''}`} />
          </button>

          {/* Copy Summary */}
          <button
            type="button"
            onClick={handleCopySummary}
            title="Copy technical summary for shift handover"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-sm border border-slate-300 dark:border-[#20293a] bg-white dark:bg-[#111622] text-slate-700 dark:text-slate-300 hover:border-amber-500 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'COPIED' : 'COPY SUMMARY'}</span>
          </button>

          {/* Print / Export */}
          <button
            type="button"
            onClick={handlePrint}
            title="Print technical sheet (A4 formatted)"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-sm border border-slate-300 dark:border-[#20293a] bg-white dark:bg-[#111622] text-slate-700 dark:text-slate-300 hover:border-amber-500 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PRINT SHEET</span>
          </button>

          {/* Edit */}
          <Link
            to="/troubleshooting/$id/edit"
            params={{ id: record.id }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider rounded-sm bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs transition"
          >
            <Edit className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>EDIT RECORD</span>
          </Link>

          {/* Delete */}
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase rounded-sm border border-rose-300 dark:border-rose-900/60 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">DELETE</span>
          </button>
        </div>
      </div>

      {/* Banner Card: Registration, ATA, Result & Date */}
      <div className="p-5 rounded-sm border border-slate-300 dark:border-[#1e2638] bg-white dark:bg-[#111622] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-mono text-lg font-bold px-3 py-1 rounded-xs bg-slate-900 text-amber-400 dark:bg-[#151c2a] border border-slate-700 dark:border-[#2a3850]">
              {record.aircraftRegistration}
            </span>
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-xs bg-slate-100 dark:bg-[#161d2a] text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-[#222b3c]">
              ATA {record.ATAChapter} {record.ATASection ? `// ${record.ATASection}` : ''}
            </span>
            <span className="text-xs font-mono uppercase text-slate-600 dark:text-slate-400">
              {ataTitle}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xs text-xs font-mono font-bold uppercase border bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
              {record.result}
            </span>
          </div>
        </div>

        {/* Primary Defect Title */}
        <div className="space-y-1 pt-2.5 border-t border-slate-100 dark:border-[#182030]">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
            // DEFECT LOG SYMPTOM
          </span>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
            {record.defect}
          </h2>
        </div>
      </div>

      {/* Two-Column Grid: AIRCRAFT INFO & JOB INFO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* AIRCRAFT INFORMATION */}
        <div className="p-4 rounded-sm border border-slate-300 dark:border-[#1e2638] bg-white dark:bg-[#111622] shadow-xs space-y-3">
          <div className="flex items-center gap-2 font-mono font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-[#182030] pb-2">
            <Plane className="w-3.5 h-3.5 text-amber-500" />
            <span>// AIRCRAFT TELEMETRY</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div>
              <span className="text-slate-400">TYPE:</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {record.aircraftType}
              </p>
            </div>
            <div>
              <span className="text-slate-400">REGISTRATION:</span>
              <p className="font-bold text-slate-800 dark:text-amber-400 mt-0.5">
                {record.aircraftRegistration}
              </p>
            </div>
            <div>
              <span className="text-slate-400">MSN:</span>
              <p className="text-slate-800 dark:text-slate-200 mt-0.5">
                {record.aircraftMSN || '—'}
              </p>
            </div>
            <div>
              <span className="text-slate-400">LOGGED BY:</span>
              <p className="text-slate-800 dark:text-slate-200 mt-0.5">
                {record.technicianName}
              </p>
            </div>
          </div>
        </div>

        {/* JOB INFORMATION */}
        <div className="p-4 rounded-sm border border-slate-300 dark:border-[#1e2638] bg-white dark:bg-[#111622] shadow-xs space-y-3">
          <div className="flex items-center gap-2 font-mono font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-[#182030] pb-2">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            <span>// JOB & SYSTEM TRACE</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div>
              <span className="text-slate-400">DATE:</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {formattedDate}
              </p>
            </div>
            <div>
              <span className="text-slate-400">ATA CHAPTER:</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                ATA {record.ATAChapter} {record.ATASection ? `(${record.ATASection})` : ''}
              </p>
            </div>
            <div>
              <span className="text-slate-400">JOB CARD:</span>
              <p className="text-slate-800 dark:text-slate-200 mt-0.5">
                {record.jobCardNumber || '—'}
              </p>
            </div>
            <div>
              <span className="text-slate-400">WORK ORDER:</span>
              <p className="text-slate-800 dark:text-slate-200 mt-0.5">
                {record.workOrderNumber || '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* TROUBLESHOOTING INVESTIGATION DETAILS */}
      <div className="p-5 rounded-sm border border-slate-300 dark:border-[#1e2638] bg-white dark:bg-[#111622] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#182030] pb-2.5">
          <div className="flex items-center gap-2 font-mono font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <Wrench className="w-4 h-4 text-amber-500" />
            <span>// ACTION & ROOT CAUSE RECTIFICATION</span>
          </div>
        </div>

        {/* Action Taken */}
        <div className="space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            ACTION PERFORMED:
          </span>
          <div className="p-3 rounded-xs bg-slate-50 dark:bg-[#0c1018] border border-slate-200 dark:border-[#1a2334] text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed">
            {record.troubleshootingAction || 'No specific troubleshooting step logged.'}
          </div>
        </div>

        {/* Finding */}
        <div className="space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            ROOT CAUSE FINDING:
          </span>
          <div className="p-3 rounded-xs bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-slate-900 dark:text-amber-300 leading-relaxed font-medium">
            {record.finding || 'No specific finding logged.'}
          </div>
        </div>

        {/* Rectification */}
        <div className="space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            RECTIFICATION / CORRECTIVE ACTION:
          </span>
          <div className="p-3 rounded-xs bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-slate-900 dark:text-emerald-300 leading-relaxed">
            {record.rectification || 'No corrective action logged.'}
          </div>
        </div>

        {/* Result & Parts Traceability */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-[#182030] text-xs font-mono">
          <div>
            <span className="text-slate-400">STATUS:</span>
            <p className="font-bold text-slate-900 dark:text-white mt-0.5">{record.result}</p>
          </div>
          <div>
            <span className="text-slate-400">P/N:</span>
            <p className="text-slate-800 dark:text-slate-200 mt-0.5 font-bold">
              {record.partNumber || '—'}
            </p>
          </div>
          <div>
            <span className="text-slate-400">S/N:</span>
            <p className="text-slate-800 dark:text-slate-200 mt-0.5 font-bold">
              {record.serialNumber || '—'}
            </p>
          </div>
        </div>
      </div>

      {/* APPROVED MAINTENANCE REFERENCE vs PERSONAL RECORD */}
      <div className="p-4 rounded-sm border border-slate-300 dark:border-[#1e2638] bg-slate-50 dark:bg-[#0e131d] shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span>// APPROVED TECHNICAL DATA REFERENCE</span>
          </div>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-xs bg-slate-200 dark:bg-[#182030] text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-[#222b3c]">
            AMM / TSM
          </span>
        </div>
        <div className="pt-1 font-mono text-xs font-semibold text-slate-900 dark:text-amber-400 bg-white dark:bg-[#111622] p-2.5 rounded-xs border border-slate-300 dark:border-[#1e2638]">
          {record.referenceDocument || 'No reference document recorded.'}
        </div>
      </div>

      {/* EVIDENCE & IMAGE GALLERY */}
      <div className="p-5 rounded-sm border border-slate-300 dark:border-[#1e2638] bg-white dark:bg-[#111622] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#182030] pb-2.5">
          <div className="flex items-center gap-2 font-mono font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <Layers className="w-4 h-4 text-amber-500" />
            <span>// EVIDENCE & PHOTO DOCUMENTATION</span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {record.images.length} ATTACHED
          </span>
        </div>

        <ImageGallery images={record.images} readOnly={true} />
      </div>

      {/* NOTES & TAGS */}
      {(record.notes || (record.tags && record.tags.length > 0)) && (
        <div className="p-4 rounded-sm border border-slate-300 dark:border-[#1e2638] bg-white dark:bg-[#111622] shadow-xs space-y-3">
          <div className="flex items-center gap-2 font-mono font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-[#182030] pb-2">
            <Tag className="w-4 h-4 text-amber-500" />
            <span>// TECHNICIAN NOTES & TAGS</span>
          </div>

          {record.notes && (
            <p className="text-xs font-mono text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed bg-slate-50 dark:bg-[#0c1018] p-3 rounded-xs border border-slate-200 dark:border-[#1a2334]">
              {record.notes}
            </p>
          )}

          {record.tags && record.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {record.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] font-mono px-2 py-0.5 rounded-xs bg-slate-100 dark:bg-[#161d2a] text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-[#20293a]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AUDIT TIMELINE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-sm border border-slate-300 dark:border-[#1e2638] bg-slate-50 dark:bg-[#0c1018] text-[10px] text-slate-400 font-mono">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>CREATED: {formattedCreated}</span>
        </div>
        <div>
          <span>REVISED: {formattedUpdated}</span>
        </div>
      </div>

      {/* RELATED RECORDS (Matching ATA Chapter or Registration) */}
      {relatedRecords && relatedRecords.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-300 dark:border-[#1e2638] no-print">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <Layers className="w-4 h-4 text-amber-500" />
              <span>// CORRELATED DEFECT ARCHIVE (ATA {record.ATAChapter})</span>
            </div>
            <Link
              to="/troubleshooting"
              search={{ ATAChapter: record.ATAChapter }}
              className="text-xs font-mono text-amber-600 dark:text-amber-400 hover:underline uppercase"
            >
              VIEW ALL ATA {record.ATAChapter} →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {relatedRecords.map((rel) => (
              <RecordCard key={rel.id} record={rel} viewMode="card" />
            ))}
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete this troubleshooting record?"
        message="This action cannot be undone. The defect history, findings, and evidence photos will be permanently removed from your logbook."
        confirmText="Delete Record"
        cancelText="Cancel"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  )
}
