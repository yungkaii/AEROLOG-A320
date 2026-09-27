import { useState, type MouseEvent } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Calendar,
  Layers,
  Camera,
  Star,
  ArrowRight,
  ZoomIn,
} from 'lucide-react'
import type { TroubleshootingRecordWithImages } from '../types/techlog'
import { A320_ATA_CHAPTERS } from '../lib/a320-data'
import { useTogglePin } from '../lib/api-client'
import { useToast } from './Toast'
import ImageGallery from './ImageGallery'

interface RecordCardProps {
  record: TroubleshootingRecordWithImages
  viewMode?: 'card' | 'table'
}

export default function RecordCard({ record, viewMode = 'card' }: RecordCardProps) {
  const [previewImageIdx, setPreviewImageIdx] = useState<number | null>(null)
  const togglePinMutation = useTogglePin()
  const { toast } = useToast()

  const ataInfo = A320_ATA_CHAPTERS.find((a) => a.chapter === record.ATAChapter)
  const ataTitle = ataInfo ? ataInfo.title : `ATA ${record.ATAChapter}`

  const handleTogglePin = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    togglePinMutation.mutate(record.id, {
      onSuccess: (newPinned) => {
        toast(newPinned ? 'Record pinned to favorites' : 'Record unpinned', 'info')
      },
    })
  }

  // Format date nicely e.g. "27 September 2026"
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

  // Result status color (Annunciator pill style)
  const getStatusBadge = (res: string) => {
    if (res.toLowerCase().includes('rectified') || res.toLowerCase().includes('satisfactory') || res.toLowerCase().includes('ok')) {
      return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
    }
    if (res.toLowerCase().includes('deferred') || res.toLowerCase().includes('mel')) {
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
    }
    if (res.toLowerCase().includes('component replaced')) {
      return 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/30'
    }
    return 'bg-slate-100 text-slate-700 dark:bg-[#161d2a] dark:text-slate-300 border-slate-300 dark:border-[#222b3c]'
  }

  // Card top status accent line
  const getStatusBorder = (res: string) => {
    if (res.toLowerCase().includes('rectified') || res.toLowerCase().includes('satisfactory') || res.toLowerCase().includes('ok')) {
      return 'border-t-2 border-t-emerald-500'
    }
    if (res.toLowerCase().includes('deferred') || res.toLowerCase().includes('mel')) {
      return 'border-t-2 border-t-amber-500'
    }
    if (res.toLowerCase().includes('component replaced')) {
      return 'border-t-2 border-t-cyan-500'
    }
    return 'border-t-2 border-t-slate-400 dark:border-t-slate-600'
  }

  if (viewMode === 'table') {
    return (
      <div className={`group flex flex-col md:flex-row md:items-center justify-between p-3.5 rounded-sm border border-slate-300 dark:border-[#1e2638] bg-white dark:bg-[#111622] hover:border-amber-500/80 transition shadow-xs gap-3.5 ${getStatusBorder(record.result)}`}>
        {/* Left Column: Identifiers */}
        <div className="flex items-center gap-3 min-w-[220px]">
          <button
            type="button"
            onClick={handleTogglePin}
            className={`p-1 rounded-xs transition ${
              record.isPinned
                ? 'text-amber-500 fill-amber-500 hover:text-amber-600'
                : 'text-slate-300 hover:text-amber-400 dark:text-slate-600'
            }`}
          >
            <Star className={`w-4 h-4 ${record.isPinned ? 'fill-current' : ''}`} />
          </button>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-slate-900 dark:text-amber-400">
                {record.aircraftRegistration}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-xs bg-slate-100 dark:bg-[#161d2a] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#242e40]">
                {record.aircraftType.split(' ')[0]}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">ATA {record.ATAChapter}</span>
              <span>//</span>
              <span className="truncate max-w-[130px] uppercase text-[11px]">{ataTitle}</span>
            </div>
          </div>
        </div>

        {/* Center: Defect Summary & Finding */}
        <div className="flex-1 space-y-1">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-amber-500 transition">
            {record.defect}
          </p>
          <p className="text-xs font-mono text-slate-500 dark:text-slate-400 line-clamp-1">
            {record.finding ? `FINDING: ${record.finding}` : `ACTION: ${record.troubleshootingAction}`}
          </p>
        </div>

        {/* Right Column: Status, Images & Link */}
        <div className="flex items-center gap-2.5 shrink-0">
          <span
            className={`px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase border ${getStatusBadge(
              record.result
            )}`}
          >
            {record.result}
          </span>

          {record.images.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setPreviewImageIdx(0)
              }}
              className="flex items-center gap-1 text-[11px] font-mono text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-xs bg-slate-100 dark:bg-[#161d2a] border border-slate-200 dark:border-[#222b3c] hover:border-amber-500 hover:text-amber-500 transition cursor-pointer"
              title={`Inspect ${record.images.length} evidence photo(s)`}
            >
              <Camera className="w-3 h-3 text-amber-500" />
              <span>{record.images.length}</span>
            </button>
          )}

          <Link
            to="/troubleshooting/$id"
            params={{ id: record.id }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm border border-slate-300 dark:border-[#222b3e] bg-slate-100 dark:bg-[#161d2a] hover:border-amber-500 hover:text-amber-400 text-slate-700 dark:text-slate-300 text-xs font-mono uppercase tracking-wider transition"
          >
            <span>VIEW</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Optical Zoom Lightbox in Table Mode */}
        {previewImageIdx !== null && (
          <ImageGallery
            images={record.images}
            initialOpenIndex={previewImageIdx}
            onClose={() => setPreviewImageIdx(null)}
            hideGrid={true}
            readOnly={true}
          />
        )}
      </div>
    )
  }

  // Card View Mode
  return (
    <div className={`group relative flex flex-col justify-between p-4 sm:p-5 rounded-sm border border-slate-300 dark:border-[#1e2638] bg-white dark:bg-[#111622] hover:border-amber-500/80 transition-all duration-150 shadow-xs space-y-3.5 ${getStatusBorder(record.result)}`}>
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Aircraft Registration Badge */}
          <span className="font-mono font-bold text-xs tracking-wider px-2 py-0.5 rounded-xs bg-slate-900 text-amber-400 dark:bg-[#161d2a] dark:text-amber-400 border border-slate-700 dark:border-[#263246]">
            {record.aircraftRegistration}
          </span>

          {/* Aircraft Type */}
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-xs bg-slate-100 dark:bg-[#161d2a] border border-slate-200 dark:border-[#20293a]">
            {record.aircraftType.split(' ')[0]}
          </span>

          {/* ATA Pill */}
          <span className="inline-flex items-center gap-1 text-[11px] font-bold font-mono px-1.5 py-0.5 rounded-xs bg-slate-100 dark:bg-[#161d2a] text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-[#242e42]">
            <Layers className="w-3 h-3 text-amber-500" />
            ATA {record.ATAChapter}
          </span>
        </div>

        {/* Favorite Pin Button */}
        <button
          type="button"
          onClick={handleTogglePin}
          title={record.isPinned ? 'Remove from favorites' : 'Pin to favorites'}
          className={`p-1 rounded-xs transition ${
            record.isPinned
              ? 'text-amber-500 hover:text-amber-600'
              : 'text-slate-300 hover:text-amber-400 dark:text-slate-600'
          }`}
        >
          <Star className={`w-4 h-4 ${record.isPinned ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* ATA Title & Date */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-[#182030] pb-2">
        <span className="font-mono text-[11px] uppercase tracking-wider truncate max-w-[190px]" title={ataTitle}>
          {ataTitle}
        </span>
        <div className="flex items-center gap-1 font-mono text-[10px]">
          <Calendar className="w-3 h-3 text-slate-400" />
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* Defect Description */}
      <div className="space-y-2 flex-1">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-amber-500 transition">
          {record.defect}
        </h4>

        {/* Finding / Action Snippet */}
        {(record.finding || record.troubleshootingAction) && (
          <div className="text-xs font-mono text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed bg-slate-50 dark:bg-[#0c1018] p-2 rounded-xs border border-slate-200 dark:border-[#1a2232]">
            <span className="text-amber-600 dark:text-amber-400 font-bold">
              {record.finding ? 'FINDING: ' : 'ACTION: '}
            </span>
            {record.finding || record.troubleshootingAction}
          </div>
        )}
      </div>

      {/* Tags Chips */}
      {record.tags && record.tags.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap pt-0.5">
          {record.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[9px] font-mono px-1.5 py-0.2 rounded-xs bg-slate-100 text-slate-600 dark:bg-[#161d2a] dark:text-slate-400 border border-slate-200 dark:border-[#20293a]"
            >
              {tag}
            </span>
          ))}
          {record.tags.length > 3 && (
            <span className="text-[9px] text-slate-400 font-mono">
              +{record.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Evidence Photos Quick Preview Strip */}
      {record.images && record.images.length > 0 && (
        <div className="flex items-center gap-1.5 pt-1">
          {record.images.slice(0, 3).map((img, idx) => (
            <button
              key={img.id || idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setPreviewImageIdx(idx)
              }}
              className="group/thumb relative w-12 h-9 rounded-xs overflow-hidden border border-slate-300 dark:border-slate-800 bg-slate-950 hover:border-amber-500 transition shrink-0 cursor-pointer"
              title={`Inspect: ${img.caption || 'Evidence photo'}`}
            >
              <img
                src={img.url}
                alt={img.caption || 'Evidence'}
                className="w-full h-full object-cover group-hover/thumb:scale-110 transition duration-200"
              />
              <div className="absolute inset-0 bg-slate-950/20 group-hover/thumb:bg-transparent flex items-center justify-center">
                <ZoomIn className="w-3 h-3 text-amber-400 opacity-0 group-hover/thumb:opacity-100 transition" />
              </div>
            </button>
          ))}
          {record.images.length > 3 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setPreviewImageIdx(3)
              }}
              className="text-[10px] font-mono text-slate-500 hover:text-amber-500 transition"
            >
              +{record.images.length - 3} more
            </button>
          )}
        </div>
      )}

      {/* Footer Row: Result Badge, Image Counter, and View Details Button */}
      <div className="pt-2.5 border-t border-slate-100 dark:border-[#182030] flex items-center justify-between gap-2">
        <span
          className={`px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase border ${getStatusBadge(
            record.result
          )} truncate max-w-[130px] sm:max-w-[180px]`}
          title={record.result}
        >
          {record.result}
        </span>

        <div className="flex items-center gap-2">
          {record.images.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setPreviewImageIdx(0)
              }}
              className="flex items-center gap-1 text-[11px] font-mono text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-xs bg-slate-100 dark:bg-[#161d2a] border border-slate-200 dark:border-[#222b3c] hover:border-amber-500 hover:text-amber-500 transition cursor-pointer"
              title={`Inspect ${record.images.length} evidence photo(s)`}
            >
              <Camera className="w-3 h-3 text-amber-500" />
              <span>{record.images.length}</span>
            </button>
          )}

          <Link
            to="/troubleshooting/$id"
            params={{ id: record.id }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm border border-slate-300 dark:border-[#222b3e] bg-slate-100 dark:bg-[#161d2a] hover:border-amber-500 hover:text-amber-400 text-slate-700 dark:text-slate-300 text-xs font-mono uppercase tracking-wider transition"
          >
            <span>DETAILS</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Optical Zoom Lightbox in Card Mode */}
      {previewImageIdx !== null && (
        <ImageGallery
          images={record.images}
          initialOpenIndex={previewImageIdx}
          onClose={() => setPreviewImageIdx(null)}
          hideGrid={true}
          readOnly={true}
        />
      )}
    </div>
  )
}
