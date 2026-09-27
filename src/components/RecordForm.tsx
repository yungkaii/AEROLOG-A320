import React, { useState, useEffect } from 'react'
import {
  Plane,
  Calendar,
  Wrench,
  FileText,
  Tag,
  Star,
  Save,
  RotateCcw,
  Sparkles,
  Info,
  AlertCircle,
} from 'lucide-react'
import {
  A320_AIRCRAFT_TYPES,
  DEFAULT_AIRCRAFT_REGISTRATIONS,
  SUPER_AIR_JET_REGISTRATIONS,
  BATIK_AIR_REGISTRATIONS,
  A320_FLEET_DATA,
  getAircraftEngineInfo,
  A320_ATA_CHAPTERS,
  RESULT_STATUS_OPTIONS,
  COMMON_TAGS,
} from '../lib/a320-data'
import { troubleshootingFormSchema, type TroubleshootingFormData, type TroubleshootingImageItem } from '../types/techlog'
import ImageUploader from './ImageUploader'
import { useToast } from './Toast'

interface RecordFormProps {
  initialData?: Partial<TroubleshootingFormData>
  isEditMode?: boolean
  isSubmitting?: boolean
  onSubmit: (data: TroubleshootingFormData) => void
  onCancel?: () => void
}

const DRAFT_STORAGE_KEY = 'aerolog_troubleshooting_draft'

export default function RecordForm({
  initialData,
  isEditMode = false,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: RecordFormProps) {
  const { toast, error: showError } = useToast()

  // Form State
  const [aircraftType, setAircraftType] = useState(initialData?.aircraftType || A320_AIRCRAFT_TYPES[0])
  const [aircraftRegistration, setAircraftRegistration] = useState(
    initialData?.aircraftRegistration || DEFAULT_AIRCRAFT_REGISTRATIONS[0]
  )
  const [aircraftMSN, setAircraftMSN] = useState(initialData?.aircraftMSN || '')
  const [effectivity, setEffectivity] = useState(initialData?.effectivity || '')
  const [date, setDate] = useState(
    initialData?.date || new Date().toISOString().split('T')[0]
  )
  const [ATAChapter, setATAChapter] = useState(initialData?.ATAChapter || '32')
  const [ATASection, setATASection] = useState(initialData?.ATASection || '')
  const [defect, setDefect] = useState(initialData?.defect || '')
  const [troubleshootingAction, setTroubleshootingAction] = useState(
    initialData?.troubleshootingAction || ''
  )
  const [finding, setFinding] = useState(initialData?.finding || '')
  const [rectification, setRectification] = useState(initialData?.rectification || '')
  const [result, setResult] = useState(initialData?.result || RESULT_STATUS_OPTIONS[0])
  const [partNumber, setPartNumber] = useState(initialData?.partNumber || '')
  const [serialNumber, setSerialNumber] = useState(initialData?.serialNumber || '')
  const [jobCardNumber, setJobCardNumber] = useState(initialData?.jobCardNumber || '')
  const [workOrderNumber, setWorkOrderNumber] = useState(initialData?.workOrderNumber || '')
  const [referenceDocument, setReferenceDocument] = useState(
    initialData?.referenceDocument || ''
  )
  const [technicianName, setTechnicianName] = useState(
    initialData?.technicianName || 'M AZZAHABI (AMEL A320 15604)'
  )
  const [notes, setNotes] = useState(initialData?.notes || '')
  const [isPinned, setIsPinned] = useState(initialData?.isPinned || false)
  const [tags, setTags] = useState<string[]>(initialData?.tags || [])
  const [images, setImages] = useState<TroubleshootingImageItem[]>(initialData?.images || [])

  const [tagInput, setTagInput] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false)

  // Check and restore draft on initial create
  useEffect(() => {
    if (!isEditMode && !initialData) {
      try {
        const savedDraft = window.localStorage.getItem(DRAFT_STORAGE_KEY)
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft)
          if (parsed.defect || parsed.finding || parsed.troubleshootingAction) {
            if (confirm('A saved draft was found from your previous session. Would you like to restore it?')) {
              setAircraftType(parsed.aircraftType || A320_AIRCRAFT_TYPES[0])
              setAircraftRegistration(parsed.aircraftRegistration || DEFAULT_AIRCRAFT_REGISTRATIONS[0])
              setAircraftMSN(parsed.aircraftMSN || '')
              setEffectivity(parsed.effectivity || '')
              setDate(parsed.date || new Date().toISOString().split('T')[0])
              setATAChapter(parsed.ATAChapter || '32')
              setATASection(parsed.ATASection || '')
              setDefect(parsed.defect || '')
              setTroubleshootingAction(parsed.troubleshootingAction || '')
              setFinding(parsed.finding || '')
              setRectification(parsed.rectification || '')
              setResult(parsed.result || RESULT_STATUS_OPTIONS[0])
              setPartNumber(parsed.partNumber || '')
              setSerialNumber(parsed.serialNumber || '')
              setJobCardNumber(parsed.jobCardNumber || '')
              setWorkOrderNumber(parsed.workOrderNumber || '')
              setReferenceDocument(parsed.referenceDocument || '')
              setTechnicianName(parsed.technicianName || 'M AZZAHABI (AMEL A320 15604)')
              setNotes(parsed.notes || '')
              setIsPinned(Boolean(parsed.isPinned))
              setTags(parsed.tags || [])
              setImages(parsed.images || [])
              setHasRestoredDraft(true)
              toast('Draft restored from local autosave', 'info')
            }
          }
        }
      } catch (err) {
        console.error('Error restoring draft:', err)
      }
    }
  }, [isEditMode, initialData])

  // Autosave draft every 3 seconds for new records
  useEffect(() => {
    if (isEditMode) return

    const timer = setTimeout(() => {
      const draftData = {
        aircraftType,
        aircraftRegistration,
        aircraftMSN,
        effectivity,
        date,
        ATAChapter,
        ATASection,
        defect,
        troubleshootingAction,
        finding,
        rectification,
        result,
        partNumber,
        serialNumber,
        jobCardNumber,
        workOrderNumber,
        referenceDocument,
        technicianName,
        notes,
        isPinned,
        tags,
        images,
      }
      if (defect || finding || troubleshootingAction) {
        window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData))
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [
    isEditMode,
    aircraftType,
    aircraftRegistration,
    aircraftMSN,
    effectivity,
    date,
    ATAChapter,
    ATASection,
    defect,
    troubleshootingAction,
    finding,
    rectification,
    result,
    partNumber,
    serialNumber,
    jobCardNumber,
    workOrderNumber,
    referenceDocument,
    technicianName,
    notes,
    isPinned,
    tags,
    images,
  ])

  const clearDraft = () => {
    window.localStorage.removeItem(DRAFT_STORAGE_KEY)
    setHasRestoredDraft(false)
    toast('Draft cleared', 'info')
  }

  // Tag helper
  const addTag = (newTag: string) => {
    const formatted = newTag.trim().startsWith('#') ? newTag.trim() : `#${newTag.trim()}`
    if (formatted.length > 1 && !tags.includes(formatted)) {
      setTags([...tags, formatted])
    }
    setTagInput('')
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  // Validation & Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const rawData = {
      aircraftType,
      aircraftRegistration,
      aircraftMSN,
      effectivity,
      date,
      ATAChapter,
      ATASection,
      defect,
      troubleshootingAction,
      finding,
      rectification,
      result,
      partNumber,
      serialNumber,
      jobCardNumber,
      workOrderNumber,
      referenceDocument,
      technicianName,
      notes,
      isPinned,
      tags,
      images,
    }

    const validationResult = troubleshootingFormSchema.safeParse(rawData)

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of validationResult.error.issues) {
        const path = issue.path[0]?.toString() || 'general'
        fieldErrors[path] = issue.message
      }
      setErrors(fieldErrors)
      showError('Please check required fields marked in red.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    // Submit validated data
    onSubmit(validationResult.data)

    // Clear draft on successful submit
    if (!isEditMode) {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY)
    }
  }

  const currentAta = A320_ATA_CHAPTERS.find((a) => a.chapter === ATAChapter)

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto">
      {/* Draft restoration banner */}
      {hasRestoredDraft && !isEditMode && (
        <div className="flex items-center justify-between p-3 rounded-sm bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-700 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-500 shrink-0" />
            <span>[AUTOSAVE DRAFT RESTORED] Currently editing a recovered draft.</span>
          </div>
          <button
            type="button"
            onClick={clearDraft}
            className="text-xs font-semibold text-rose-500 hover:text-rose-600 uppercase underline"
          >
            [DISCARD]
          </button>
        </div>
      )}

      {/* Global Validation Error Banner */}
      {Object.keys(errors).length > 0 && (
        <div className="p-3.5 rounded-sm bg-rose-500/10 border border-rose-500/30 text-xs font-mono text-rose-700 dark:text-rose-300 space-y-1">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>VALIDATION FAULT: PLEASE COMPLETE REQUIRED FIELDS</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 pl-1 text-[11px]">
            {Object.entries(errors).map(([field, msg]) => (
              <li key={field}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      {/* SECTION 1: Aircraft Information */}
      <div className="p-4 sm:p-5 rounded-sm border border-slate-300 dark:border-[#1e2638] bg-white dark:bg-[#111622] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#182030] pb-2.5">
          <div className="flex items-center gap-2 font-mono font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <Plane className="w-4 h-4 text-amber-500" />
            <span>// 01. AIRCRAFT IDENTIFICATION</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono uppercase">AIRBUS A320 FLEET</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Aircraft Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-600 dark:text-slate-300">
              AIRCRAFT TYPE <span className="text-rose-500">*</span>
            </label>
            <select
              value={aircraftType}
              onChange={(e) => setAircraftType(e.target.value)}
              className="w-full text-xs font-mono py-2 px-2.5 rounded-sm border border-slate-300 dark:border-[#20293a] bg-slate-50 dark:bg-[#0c1018] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
            >
              {A320_AIRCRAFT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Aircraft Registration */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase text-slate-600 dark:text-slate-300">
                REGISTRATION <span className="text-rose-500">*</span>
              </label>
              <span className="text-[9px] font-mono text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-xs border border-amber-500/20">
                LION GROUP FLEET (109 A/C)
              </span>
            </div>

            {/* Quick Fleet Dropdown Selector */}
            <select
              value={DEFAULT_AIRCRAFT_REGISTRATIONS.includes(aircraftRegistration) ? aircraftRegistration : ''}
              onChange={(e) => {
                const selected = e.target.value
                if (selected) {
                  setAircraftRegistration(selected)
                  const info = getAircraftEngineInfo(selected)
                  if (info) {
                    setAircraftType(info.aircraftType)
                    if (info.effectivity) {
                      setEffectivity(info.effectivity)
                    }
                  }
                }
              }}
              className="w-full text-xs font-mono font-bold py-1.5 px-2 rounded-sm border border-amber-500/40 bg-amber-500/5 dark:bg-[#131b26] text-amber-600 dark:text-amber-400 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="">-- PILIH FLEET REGISTRASI (SUPER AIR JET / BATIK AIR) --</option>
              <optgroup label={`SUPER AIR JET (${SUPER_AIR_JET_REGISTRATIONS.length} A/C • ALL IAE V2500)`}>
                {SUPER_AIR_JET_REGISTRATIONS.map((reg) => (
                  <option key={reg} value={reg}>
                    {reg} • Super Air Jet (IAE V2500)
                  </option>
                ))}
              </optgroup>
              <optgroup label={`BATIK AIR (${BATIK_AIR_REGISTRATIONS.length} A/C • CFM56 / V2500 / LEAP-1A)`}>
                {BATIK_AIR_REGISTRATIONS.map((reg) => {
                  const info = A320_FLEET_DATA[reg]
                  return (
                    <option key={reg} value={reg}>
                      {reg} • Batik Air ({info ? info.engineDetail : 'A320'})
                    </option>
                  )
                })}
              </optgroup>
            </select>

            {/* Manual input / custom registration */}
            <div className="relative">
              <input
                type="text"
                list="aircraft-reg-suggestions"
                value={aircraftRegistration}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase()
                  setAircraftRegistration(val)
                  const info = getAircraftEngineInfo(val)
                  if (info) {
                    setAircraftType(info.aircraftType)
                    if (info.effectivity) {
                      setEffectivity(info.effectivity)
                    }
                  }
                }}
                placeholder="ATAU KETIK REGISTRASI (MISAL: PK-BKF, PK-BKP, PK-SJT)"
                className={`w-full text-xs font-mono uppercase font-bold py-2 px-2.5 rounded-sm border ${
                  errors.aircraftRegistration
                    ? 'border-rose-500'
                    : 'border-slate-300 dark:border-[#20293a]'
                } bg-slate-50 dark:bg-[#0c1018] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500`}
              />
              <datalist id="aircraft-reg-suggestions">
                {DEFAULT_AIRCRAFT_REGISTRATIONS.map((reg) => (
                  <option key={reg} value={reg} />
                ))}
              </datalist>
            </div>

            {/* Auto linked status badge */}
            {getAircraftEngineInfo(aircraftRegistration) && (
              <div className="flex items-center justify-between text-[10px] font-mono pt-0.5 px-2 py-1 rounded-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <div className="flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold uppercase">{getAircraftEngineInfo(aircraftRegistration)?.airline}:</span>
                  <span>{getAircraftEngineInfo(aircraftRegistration)?.aircraftType}</span>
                </div>
                <span className="text-[9px] text-emerald-500/90 font-bold">({getAircraftEngineInfo(aircraftRegistration)?.engineDetail})</span>
              </div>
            )}
          </div>

          {/* Effectivity (EFF) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase text-slate-600 dark:text-slate-300">
                EFFECTIVITY (EFF)
              </label>
              <span className="text-[9px] font-mono text-slate-400">AMM / TSM</span>
            </div>
            <div className="relative">
              <input
                type="text"
                value={effectivity}
                onChange={(e) => setEffectivity(e.target.value.toUpperCase())}
                placeholder="e.g. 051 / 041-049"
                className="w-full text-xs font-mono uppercase font-bold py-2 px-2.5 rounded-sm border border-slate-300 dark:border-[#20293a] bg-slate-50 dark:bg-[#0c1018] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block pt-0.5">
              {effectivity ? `AIRBUS EFF: ${effectivity}` : 'Manual effectivity filter code'}
            </span>
          </div>

          {/* MSN (Optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-600 dark:text-slate-400">
              MSN <span className="text-slate-400 text-[10px]">(OPTIONAL)</span>
            </label>
            <input
              type="text"
              value={aircraftMSN}
              onChange={(e) => setAircraftMSN(e.target.value)}
              placeholder="e.g. MSN 5410"
              className="w-full text-xs font-mono py-2 px-2.5 rounded-sm border border-slate-300 dark:border-[#20293a] bg-slate-50 dark:bg-[#0c1018] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: Job Information */}
      <div className="p-4 sm:p-5 rounded-sm border border-slate-300 dark:border-[#1e2638] bg-white dark:bg-[#111622] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#182030] pb-2.5">
          <div className="flex items-center gap-2 font-mono font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <Calendar className="w-4 h-4 text-amber-500" />
            <span>// 02. SYSTEM & JOB CLASSIFICATION</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-600 dark:text-slate-300">
              MAINTENANCE DATE <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-xs font-mono py-2 px-2.5 rounded-sm border border-slate-300 dark:border-[#20293a] bg-slate-50 dark:bg-[#0c1018] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* ATA Chapter */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-mono uppercase text-slate-600 dark:text-slate-300 flex items-center justify-between">
              <span>ATA CHAPTER <span className="text-rose-500">*</span></span>
              {currentAta && (
                <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400">
                  {currentAta.title}
                </span>
              )}
            </label>
            <select
              value={ATAChapter}
              onChange={(e) => setATAChapter(e.target.value)}
              className="w-full text-xs font-mono py-2 px-2.5 rounded-sm border border-slate-300 dark:border-[#20293a] bg-slate-50 dark:bg-[#0c1018] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
            >
              {A320_ATA_CHAPTERS.map((item) => (
                <option key={item.chapter} value={item.chapter}>
                  ATA {item.chapter} — {item.title} ({item.category})
                </option>
              ))}
            </select>
          </div>

          {/* ATA Section (Optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-600 dark:text-slate-400">
              ATA SECTION <span className="text-slate-400 text-[10px]">(OPTIONAL)</span>
            </label>
            <input
              type="text"
              value={ATASection}
              onChange={(e) => setATASection(e.target.value)}
              placeholder="e.g. 32-42"
              className="w-full text-xs font-mono py-2 px-2.5 rounded-sm border border-slate-300 dark:border-[#20293a] bg-slate-50 dark:bg-[#0c1018] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Job Card Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-600 dark:text-slate-400">
              JOB CARD NO. <span className="text-slate-400 text-[10px]">(OPTIONAL)</span>
            </label>
            <input
              type="text"
              value={jobCardNumber}
              onChange={(e) => setJobCardNumber(e.target.value)}
              placeholder="e.g. JC-CGK-2609-082"
              className="w-full text-xs font-mono py-2 px-2.5 rounded-sm border border-slate-300 dark:border-[#20293a] bg-slate-50 dark:bg-[#0c1018] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Work Order */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-600 dark:text-slate-400">
              WORK ORDER NO. <span className="text-slate-400 text-[10px]">(OPTIONAL)</span>
            </label>
            <input
              type="text"
              value={workOrderNumber}
              onChange={(e) => setWorkOrderNumber(e.target.value)}
              placeholder="e.g. WO-884210"
              className="w-full text-xs font-mono py-2 px-2.5 rounded-sm border border-slate-300 dark:border-[#20293a] bg-slate-50 dark:bg-[#0c1018] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Technician Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-600 dark:text-slate-300">
              AME TECHNICIAN <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={technicianName}
              onChange={(e) => setTechnicianName(e.target.value)}
              placeholder="M AZZAHABI (AMEL A320 15604)"
              className="w-full text-xs font-mono py-2 px-2.5 rounded-sm border border-slate-300 dark:border-[#20293a] bg-slate-50 dark:bg-[#0c1018] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: Troubleshooting Details */}
      <div className="p-4 sm:p-5 rounded-sm border border-slate-300 dark:border-[#1e2638] bg-white dark:bg-[#111622] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#182030] pb-2.5">
          <div className="flex items-center gap-2 font-mono font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <Wrench className="w-4 h-4 text-amber-500" />
            <span>// 03. DEFECT & TROUBLESHOOTING LOG</span>
          </div>
          <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400">
            CORE RECORD
          </span>
        </div>

        {/* Defect Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase text-slate-600 dark:text-slate-300 flex items-center justify-between">
            <span>DEFECT / FAULT DESCRIPTION <span className="text-rose-500">*</span></span>
            <span className="text-[10px] font-mono text-slate-400">
              Reported by flight crew / ECAM / transit
            </span>
          </label>
          <textarea
            rows={3}
            value={defect}
            onChange={(e) => setDefect(e.target.value)}
            placeholder="e.g. ECAM Warning: WHEEL N/W STRG FAULT on taxi-out after pushback. Rudder pedal steering inoperative."
            className={`w-full text-xs font-mono p-2.5 rounded-sm border ${
              errors.defect
                ? 'border-rose-500'
                : 'border-slate-300 dark:border-[#20293a]'
            } bg-slate-50 dark:bg-[#0c1018] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500`}
          />
          {errors.defect && <p className="text-xs font-mono text-rose-500">{errors.defect}</p>}
        </div>

        {/* Action Taken & Finding */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Troubleshooting Action */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-600 dark:text-slate-300 flex items-center justify-between">
              <span>ACTION PERFORMED</span>
              <span className="text-[9px] font-mono text-amber-500">
                *ACTION OR FINDING REQ.
              </span>
            </label>
            <textarea
              rows={4}
              value={troubleshootingAction}
              onChange={(e) => setTroubleshootingAction(e.target.value)}
              placeholder="TSM steps performed (e.g. MCDU BITE test on BSCU, wiring continuity check at NLG connector 14GG)..."
              className={`w-full text-xs font-mono p-2.5 rounded-sm border ${
                errors.troubleshootingAction
                  ? 'border-rose-500'
                  : 'border-slate-300 dark:border-[#20293a]'
              } bg-slate-50 dark:bg-[#0c1018] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500`}
            />
          </div>

          {/* Finding */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-600 dark:text-slate-300 flex items-center justify-between">
              <span>ROOT CAUSE FINDING</span>
              <span className="text-[9px] font-mono text-amber-500">
                *ACTION OR FINDING REQ.
              </span>
            </label>
            <textarea
              rows={4}
              value={finding}
              onChange={(e) => setFinding(e.target.value)}
              placeholder="What was discovered (e.g. Pin 3 corrosion at cannon plug 14GG, broken bond wire, loose sense line)..."
              className={`w-full text-xs font-mono p-2.5 rounded-sm border ${
                errors.finding
                  ? 'border-rose-500'
                  : 'border-slate-300 dark:border-[#20293a]'
              } bg-slate-50 dark:bg-[#0c1018] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500`}
            />
          </div>
        </div>

        {/* Rectification */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase text-slate-600 dark:text-slate-300 flex items-center justify-between">
            <span>RECTIFICATION / REPAIR ACTION</span>
            <span className="text-[10px] font-mono text-slate-400">
              Cleaned, replaced, adjusted, torqued
            </span>
          </label>
          <textarea
            rows={2}
            value={rectification}
            onChange={(e) => setRectification(e.target.value)}
            placeholder="e.g. Cleaned pins with contact cleaner, torqued connector backshell, performed full BITE test..."
            className="w-full text-xs font-mono p-2.5 rounded-sm border border-slate-300 dark:border-[#20293a] bg-slate-50 dark:bg-[#0c1018] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Result Status */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono uppercase text-slate-600 dark:text-slate-300">
              WORK RESULT STATUS <span className="text-rose-500">*</span>
            </label>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-xs font-bold uppercase border ${
                result === 'Rectified'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/40'
                  : result === 'Deferred / MEL'
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/40'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/40'
              }`}
            >
              {result === 'Rectified'
                ? '● SYSTEM OK / CLOSED'
                : result === 'Deferred / MEL'
                ? '▲ MEL CAUTION APPLIED'
                : '■ FAULT OPEN / IN WORK'}
            </span>
          </div>
          <select
            value={result}
            onChange={(e) => setResult(e.target.value)}
            className={`w-full text-xs font-mono py-2 px-2.5 rounded-sm border ${
              result === 'Rectified'
                ? 'border-emerald-500/60'
                : result === 'Deferred / MEL'
                ? 'border-amber-500/60'
                : 'border-rose-500/60'
            } bg-slate-50 dark:bg-[#0c1018] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 font-bold`}
          >
            {RESULT_STATUS_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SECTION 4: Parts & Approved Documentation */}
      <div className="p-4 sm:p-5 rounded-sm border border-slate-300 dark:border-[#1e2638] bg-white dark:bg-[#111622] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#182030] pb-2.5">
          <div className="flex items-center gap-2 font-mono font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <FileText className="w-4 h-4 text-amber-500" />
            <span>// 04. COMPONENT TRACEABILITY & APPROVED DATA</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Part Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-600 dark:text-slate-400">
              PART NUMBER (P/N)
            </label>
            <input
              type="text"
              value={partNumber}
              onChange={(e) => setPartNumber(e.target.value)}
              placeholder="e.g. C24248002"
              className="w-full text-xs font-mono py-2 px-2.5 rounded-sm border border-slate-300 dark:border-[#20293a] bg-slate-50 dark:bg-[#0c1018] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Serial Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-600 dark:text-slate-400">
              SERIAL NUMBER (S/N)
            </label>
            <input
              type="text"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              placeholder="e.g. SN-04921B"
              className="w-full text-xs font-mono py-2 px-2.5 rounded-sm border border-slate-300 dark:border-[#20293a] bg-slate-50 dark:bg-[#0c1018] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Reference Document */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-600 dark:text-slate-400">
              AMM / TSM REFERENCE
            </label>
            <input
              type="text"
              value={referenceDocument}
              onChange={(e) => setReferenceDocument(e.target.value)}
              placeholder="e.g. TSM 32-42-00-810-801, AMM 32-42-21"
              className="w-full text-xs font-mono py-2 px-2.5 rounded-sm border border-slate-300 dark:border-[#20293a] bg-slate-50 dark:bg-[#0c1018] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* SECTION 5: Evidence & Documentation Photos */}
      <div className="p-4 sm:p-5 rounded-sm border border-slate-300 dark:border-[#1e2638] bg-white dark:bg-[#111622] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#182030] pb-2.5">
          <div className="flex items-center gap-2 font-mono font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>// 05. EVIDENCE & PHOTO DOCUMENTATION</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 uppercase">
            {images.length} ATTACHED
          </span>
        </div>

        <ImageUploader images={images} onChange={setImages} />
      </div>

      {/* SECTION 6: Notes & Custom Tags */}
      <div className="p-4 sm:p-5 rounded-sm border border-slate-300 dark:border-[#1e2638] bg-white dark:bg-[#111622] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#182030] pb-2.5">
          <div className="flex items-center gap-2 font-mono font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <Tag className="w-4 h-4 text-amber-500" />
            <span>// 06. NOTES, TAGS & PINNED STATUS</span>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase text-slate-600 dark:text-slate-400">
            PERSONAL OBSERVATION NOTES
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Special tips, recurring defect pattern, tools used, or reminders for upcoming transit check..."
            className="w-full text-xs font-mono p-2.5 rounded-sm border border-slate-300 dark:border-[#20293a] bg-slate-50 dark:bg-[#0c1018] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <label className="text-xs font-mono uppercase text-slate-600 dark:text-slate-400">
            INDEXING TAGS
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  if (tagInput) addTag(tagInput)
                }
              }}
              placeholder="e.g. #repeated, #corrosion (press Enter)"
              className="flex-1 text-xs font-mono py-1.5 px-2.5 rounded-sm border border-slate-300 dark:border-[#20293a] bg-slate-50 dark:bg-[#0c1018] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
            />
            <button
              type="button"
              onClick={() => tagInput && addTag(tagInput)}
              className="px-3 py-1.5 text-xs font-mono uppercase rounded-sm border border-slate-300 dark:border-[#20293a] bg-slate-100 dark:bg-[#161d2a] hover:border-amber-500 text-slate-700 dark:text-slate-300"
            >
              [ADD TAG]
            </button>
          </div>

          {/* Quick preset tag buttons */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            <span className="text-[10px] font-mono text-slate-400 self-center mr-1 uppercase">PRESETS:</span>
            {COMMON_TAGS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => addTag(t)}
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-xs border transition ${
                  tags.includes(t)
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                    : 'border-slate-300 dark:border-[#20293a] text-slate-500 hover:border-slate-400 dark:hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Active Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-xs bg-slate-100 dark:bg-[#161d2a] text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-[#222b3c]"
                >
                  <span>{t}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(t)}
                    className="hover:text-rose-500 ml-0.5 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Pin toggle */}
        <div className="pt-1">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="w-3.5 h-3.5 rounded-xs text-amber-500 focus:ring-amber-500 bg-slate-50 dark:bg-[#0c1018] border-slate-300 dark:border-[#20293a]"
            />
            <span className="text-xs font-mono uppercase text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Star className={`w-3.5 h-3.5 ${isPinned ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
              PIN TO FAVORITES (FREQUENT REFERENCE)
            </span>
          </label>
        </div>
      </div>

      {/* FORM ACTION BUTTONS (Cockpit Master Panel) */}
      <div className="sticky bottom-18 sm:bottom-20 md:bottom-4 z-30 p-3 sm:p-4 rounded-sm border border-slate-300 dark:border-[#1e2638] bg-white/95 dark:bg-[#0c1018]/95 backdrop-blur-md shadow-xl flex items-center justify-between gap-2 sm:gap-4">
        <button
          type="button"
          onClick={onCancel || (() => window.history.back())}
          disabled={isSubmitting}
          className="px-3.5 sm:px-5 py-2 text-xs font-mono uppercase font-semibold rounded-sm border border-slate-300 dark:border-[#222b3c] bg-white dark:bg-[#161d2a] text-slate-700 dark:text-slate-300 hover:border-slate-400 transition"
        >
          [CANCEL]
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          {!isEditMode && (
            <button
              type="button"
              onClick={clearDraft}
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 text-xs font-mono uppercase text-slate-500 hover:text-rose-500"
            >
              <RotateCcw className="w-3 h-3" />
              CLEAR DRAFT
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 sm:px-6 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-sm bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 shadow-xs transition flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
            <span>
              {isSubmitting ? (
                'SAVING RECORD...'
              ) : isEditMode ? (
                'UPDATE DEFECT RECORD'
              ) : (
                'COMMIT TO LOGBOOK'
              )}
            </span>
          </button>
        </div>
      </div>
    </form>
  )
}
