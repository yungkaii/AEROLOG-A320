import { useRef, useState } from 'react'
import { UploadCloud, Trash2, Tag, Loader2, Info } from 'lucide-react'
import { compressAndResizeImage, formatFileSize } from '../lib/image-utils'
import { IMAGE_CAPTIONS } from '../lib/a320-data'
import type { TroubleshootingImageItem } from '../types/techlog'
import { useToast } from './Toast'

interface ImageUploaderProps {
  images: TroubleshootingImageItem[]
  onChange: (images: TroubleshootingImageItem[]) => void
}

export default function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const { error, success } = useToast()

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setIsProcessing(true)
    const newItems: TroubleshootingImageItem[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (!file.type.startsWith('image/')) {
          error(`Skipped non-image file: ${file.name}`)
          continue
        }

        // Auto-compress and resize image
        const compressed = await compressAndResizeImage(file)
        
        // Suggest default caption based on index or existing count
        let defaultCaption = 'During Inspection'
        const total = images.length + newItems.length
        if (total === 0) defaultCaption = 'Finding / Defect Evidence'
        else if (total === 1) defaultCaption = 'During Inspection'
        else if (total === 2) defaultCaption = 'After Rectification / Clean Installation'

        newItems.push({
          id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          caption: defaultCaption,
          url: compressed.url,
          fileName: compressed.fileName,
          fileSize: compressed.fileSize,
          mimeType: compressed.mimeType,
          createdAt: new Date().toISOString(),
        })
      }

      if (newItems.length > 0) {
        onChange([...images, ...newItems])
        success(`Added ${newItems.length} evidence photo(s)`)
      }
    } catch (err) {
      console.error(err)
      error('Failed to process image file. Please try again.')
    } finally {
      setIsProcessing(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemove = (id: string) => {
    onChange(images.filter((img) => img.id !== id))
  }

  const handleCaptionChange = (id: string, caption: string) => {
    onChange(
      images.map((img) => (img.id === id ? { ...img, caption } : img))
    )
  }

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          handleFiles(e.dataTransfer.files)
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer border-2 border-dashed rounded-sm p-6 transition flex flex-col items-center justify-center text-center ${
          dragOver
            ? 'border-amber-500 bg-amber-500/5'
            : 'border-slate-300 dark:border-slate-800 hover:border-amber-500/60 bg-white/40 dark:bg-[#0c1018]/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="w-10 h-10 rounded-sm bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 flex items-center justify-center text-amber-500 mb-2">
          {isProcessing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <UploadCloud className="w-5 h-5" />
          )}
        </div>

        <div className="text-[10px] font-mono tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-0.5">
          // OPTICAL DOCUMENTATION ATTACHMENT
        </div>
        <p className="text-sm font-bold text-slate-900 dark:text-slate-200">
          {isProcessing ? 'Optimizing & resizing evidence photos...' : 'Upload Maintenance Evidence Photos'}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
          Drag & drop or click to browse (Auto-compressed for fast retrieval)
        </p>
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 font-mono">
          <Info className="w-3 h-3 text-amber-500" />
          <span>Supports PNG, JPG, WEBP • Captions categorized per A320 inspection stage</span>
        </div>
      </div>

      {/* Previews List */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
          {images.map((img, idx) => (
            <div
              key={img.id}
              className="group relative rounded-sm border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#111622] overflow-hidden shadow-sm flex flex-col"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-200 dark:border-slate-800">
                <img
                  src={img.url}
                  alt={img.caption || `Evidence ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => handleRemove(img.id)}
                  title="Remove photo"
                  className="absolute top-2 right-2 p-1.5 rounded-sm bg-slate-950/80 hover:bg-rose-600 text-slate-200 hover:text-white transition backdrop-blur-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* File size badge */}
                {img.fileSize && (
                  <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded-sm text-[10px] font-mono bg-slate-950/80 text-slate-300 backdrop-blur-sm border border-slate-800">
                    {formatFileSize(img.fileSize)}
                  </span>
                )}
              </div>

              {/* Caption selector */}
              <div className="p-2.5 bg-white dark:bg-[#111622] flex-1 flex flex-col justify-between gap-1.5">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400">
                    <Tag className="w-3 h-3 text-amber-500" />
                    <span>Evidence Category</span>
                  </div>
                  <select
                    value={img.caption}
                    onChange={(e) => handleCaptionChange(img.id, e.target.value)}
                    className="w-full text-xs font-mono py-1.5 px-2 rounded-sm border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-[#0c1018] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    {IMAGE_CAPTIONS.map((cap) => (
                      <option key={cap} value={cap}>
                        {cap}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
