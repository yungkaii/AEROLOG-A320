import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Maximize2,
  Minimize2,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Trash2,
  Tag,
  FileImage,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Move,
  Scan,
} from 'lucide-react'
import type { TroubleshootingImageItem } from '../types/techlog'
import { formatFileSize } from '../lib/image-utils'

interface ImageGalleryProps {
  images: TroubleshootingImageItem[]
  onDeleteImage?: (id: string) => void
  readOnly?: boolean
  initialOpenIndex?: number | null
  onClose?: () => void
  hideGrid?: boolean
}

export default function ImageGallery({
  images,
  onDeleteImage,
  readOnly = false,
  initialOpenIndex = null,
  onClose,
  hideGrid = false,
}: ImageGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(initialOpenIndex)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)

  // Hardware-accelerated transform source-of-truth in a mutable ref
  const transformRef = useRef({
    scale: 1,
    x: 0,
    y: 0,
    rotation: 0,
  })

  // State strictly for HUD telemetry readouts (decoupled from 60/120fps motion)
  const [hudScale, setHudScale] = useState<number>(1)
  const [hudRotation, setHudRotation] = useState<number>(0)
  const [hudPos, setHudPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [isZoomed, setIsZoomed] = useState<boolean>(false)
  const [isDragging, setIsDragging] = useState<boolean>(false)

  const viewerContainerRef = useRef<HTMLDivElement>(null)
  const imageWrapperRef = useRef<HTMLDivElement>(null)
  const rafIdRef = useRef<number | null>(null)

  // Pointer drag state
  const dragStartRef = useRef<{
    startX: number
    startY: number
    initX: number
    initY: number
  } | null>(null)

  // Mobile pinch state
  const pinchRef = useRef<{
    initialDist: number
    initialScale: number
    initialCenter: { x: number; y: number }
    initialPos: { x: number; y: number }
  } | null>(null)

  const lastTapRef = useRef<number>(0)

  // High-performance direct DOM transform via requestAnimationFrame
  const applyTransform = useCallback((withTransition: boolean = false) => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current)
    }

    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null
      const el = imageWrapperRef.current
      if (!el) return

      const { scale, x, y, rotation } = transformRef.current

      if (withTransition) {
        el.style.transition = 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)'
      } else {
        el.style.transition = 'none'
      }

      el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(4)}) rotate(${rotation}deg)`

      // Sync telemetry readouts
      setHudScale(scale)
      setHudRotation(rotation)
      setHudPos({ x: Math.round(x), y: Math.round(y) })
      setIsZoomed(scale > 1.01)
    })
  }, [])

  // Reset zoom & pan when switching photos
  const resetTransform = useCallback(
    (withTransition: boolean = false) => {
      transformRef.current = {
        scale: 1,
        x: 0,
        y: 0,
        rotation: 0,
      }
      setIsDragging(false)
      applyTransform(withTransition)
    },
    [applyTransform]
  )

  useEffect(() => {
    if (initialOpenIndex !== undefined && initialOpenIndex !== null) {
      resetTransform(false)
      setLightboxIndex(initialOpenIndex)
    }
  }, [initialOpenIndex, resetTransform])

  const handleOpenPhoto = (idx: number) => {
    resetTransform(false)
    setLightboxIndex(idx)
  }

  const handleClose = () => {
    resetTransform(false)
    setLightboxIndex(null)
    onClose?.()
  }

  const handleNext = useCallback(() => {
    if (images.length <= 1) return
    resetTransform(false)
    setLightboxIndex((prev) => (prev !== null ? (prev + 1) % images.length : 0))
  }, [images.length, resetTransform])

  const handlePrev = useCallback(() => {
    if (images.length <= 1) return
    resetTransform(false)
    setLightboxIndex((prev) => (prev !== null ? (prev - 1 + images.length) % images.length : 0))
  }, [images.length, resetTransform])

  // Step Zoom In button
  const handleZoomIn = () => {
    const cur = transformRef.current
    cur.scale = Math.min(cur.scale + 0.5, 6)
    applyTransform(true)
  }

  // Step Zoom Out button
  const handleZoomOut = () => {
    const cur = transformRef.current
    cur.scale = Math.max(cur.scale - 0.5, 1)
    if (cur.scale <= 1.01) {
      cur.scale = 1
      cur.x = 0
      cur.y = 0
    }
    applyTransform(true)
  }

  // Rotate button
  const handleRotate = () => {
    const cur = transformRef.current
    cur.rotation = (cur.rotation + 90) % 360
    applyTransform(true)
  }

  // Fullscreen button
  const handleToggleFullscreen = () => {
    if (!viewerContainerRef.current) return
    if (!document.fullscreenElement) {
      viewerContainerRef.current.requestFullscreen?.().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen?.().catch(() => {})
      setIsFullscreen(false)
    }
  }

  // Keyboard navigation & zoom shortcuts
  useEffect(() => {
    if (lightboxIndex === null) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      } else if (e.key === 'ArrowRight' && transformRef.current.scale <= 1.01) {
        handleNext()
      } else if (e.key === 'ArrowLeft' && transformRef.current.scale <= 1.01) {
        handlePrev()
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault()
        handleZoomIn()
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault()
        handleZoomOut()
      } else if (e.key === 'r' || e.key === '0') {
        e.preventDefault()
        resetTransform(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxIndex, handleNext, handlePrev, resetTransform])

  // Butter-Smooth Mouse Wheel Zoom (Exponential Scaling with Focal Point Tracking)
  useEffect(() => {
    const el = viewerContainerRef.current
    if (!el || lightboxIndex === null) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()

      const rect = el.getBoundingClientRect()
      const mouseX = e.clientX - rect.left - rect.width / 2
      const mouseY = e.clientY - rect.top - rect.height / 2

      // Continuous exponential scaling factor for natural zoom feel
      const zoomFactor = Math.exp(-e.deltaY * 0.0022)
      const current = transformRef.current
      const prevScale = current.scale
      const nextScale = Math.min(Math.max(1, prevScale * zoomFactor), 6)

      if (nextScale <= 1.01) {
        current.scale = 1
        current.x = 0
        current.y = 0
      } else {
        const scaleRatio = nextScale / prevScale
        current.x = mouseX - (mouseX - current.x) * scaleRatio
        current.y = mouseY - (mouseY - current.y) * scaleRatio
        current.scale = nextScale
      }

      applyTransform(false)
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [lightboxIndex, applyTransform])

  // Butter-Smooth Pointer (Mouse) Drag & Pan
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return
    if (transformRef.current.scale <= 1.01) return

    e.preventDefault()
    setIsDragging(true)
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: transformRef.current.x,
      initY: transformRef.current.y,
    }

    try {
      ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
    } catch {}
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragStartRef.current) return
    e.preventDefault()
    const dx = e.clientX - dragStartRef.current.startX
    const dy = e.clientY - dragStartRef.current.startY

    transformRef.current.x = dragStartRef.current.initX + dx
    transformRef.current.y = dragStartRef.current.initY + dy

    applyTransform(false)
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragStartRef.current) return
    dragStartRef.current = null
    setIsDragging(false)

    try {
      ;(e.target as HTMLElement).releasePointerCapture?.(e.pointerId)
    } catch {}
  }

  // Smooth Double-Click / Double-Tap Toggle (1x <-> 2.5x)
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    const el = viewerContainerRef.current
    if (!el) return

    const current = transformRef.current
    if (current.scale > 1.05) {
      resetTransform(true)
    } else {
      const rect = el.getBoundingClientRect()
      const clickX = e.clientX - rect.left - rect.width / 2
      const clickY = e.clientY - rect.top - rect.height / 2
      current.scale = 2.5
      current.x = -clickX * 1.5
      current.y = -clickY * 1.5
      applyTransform(true)
    }
  }

  // Native Multi-Touch Pinch-to-Zoom & Mobile Pan (Passive: false)
  useEffect(() => {
    const el = viewerContainerRef.current
    if (!el || lightboxIndex === null) return

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault()
        const t1 = e.touches[0]
        const t2 = e.touches[1]
        const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)
        const rect = el.getBoundingClientRect()
        const center = {
          x: (t1.clientX + t2.clientX) / 2 - rect.left - rect.width / 2,
          y: (t1.clientY + t2.clientY) / 2 - rect.top - rect.height / 2,
        }

        pinchRef.current = {
          initialDist: dist,
          initialScale: transformRef.current.scale,
          initialCenter: center,
          initialPos: { x: transformRef.current.x, y: transformRef.current.y },
        }
      } else if (e.touches.length === 1) {
        const now = Date.now()
        // Mobile Double-Tap detection
        if (now - lastTapRef.current < 300) {
          const t = e.touches[0]
          const rect = el.getBoundingClientRect()
          const current = transformRef.current

          if (current.scale > 1.05) {
            resetTransform(true)
          } else {
            const tapX = t.clientX - rect.left - rect.width / 2
            const tapY = t.clientY - rect.top - rect.height / 2
            current.scale = 2.5
            current.x = -tapX * 1.5
            current.y = -tapY * 1.5
            applyTransform(true)
          }
          lastTapRef.current = 0
          return
        }
        lastTapRef.current = now

        // Single touch pan when zoomed
        if (transformRef.current.scale > 1.01) {
          setIsDragging(true)
          dragStartRef.current = {
            startX: e.touches[0].clientX,
            startY: e.touches[0].clientY,
            initX: transformRef.current.x,
            initY: transformRef.current.y,
          }
        }
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchRef.current) {
        e.preventDefault()
        const t1 = e.touches[0]
        const t2 = e.touches[1]
        const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)
        const ratio = dist / pinchRef.current.initialDist

        const nextScale = Math.min(Math.max(1, pinchRef.current.initialScale * ratio), 6)
        const current = transformRef.current

        if (nextScale <= 1.01) {
          current.scale = 1
          current.x = 0
          current.y = 0
        } else {
          const { initialCenter, initialScale, initialPos } = pinchRef.current
          const scaleRatio = nextScale / initialScale
          current.x = initialCenter.x - (initialCenter.x - initialPos.x) * scaleRatio
          current.y = initialCenter.y - (initialCenter.y - initialPos.y) * scaleRatio
          current.scale = nextScale
        }

        applyTransform(false)
      } else if (e.touches.length === 1 && dragStartRef.current && transformRef.current.scale > 1.01) {
        e.preventDefault()
        const dx = e.touches[0].clientX - dragStartRef.current.startX
        const dy = e.touches[0].clientY - dragStartRef.current.startY

        transformRef.current.x = dragStartRef.current.initX + dx
        transformRef.current.y = dragStartRef.current.initY + dy

        applyTransform(false)
      }
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        pinchRef.current = null
      }
      if (e.touches.length === 0) {
        dragStartRef.current = null
        setIsDragging(false)
      }
    }

    el.addEventListener('touchstart', onTouchStart, { passive: false })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd)
    el.addEventListener('touchcancel', onTouchEnd)

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
      el.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [lightboxIndex, applyTransform, resetTransform])

  if (!images || images.length === 0) {
    return (
      <div className="p-6 text-center rounded-sm border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-[#0c1018]/50 text-xs text-slate-400 font-mono">
        <FileImage className="w-5 h-5 mx-auto mb-2 text-slate-500 opacity-60" />
        // NO OPTICAL EVIDENCE RECORDED FOR THIS ENTRY
      </div>
    )
  }

  const activeImage = lightboxIndex !== null ? images[lightboxIndex] : null

  if (hideGrid && lightboxIndex === null) {
    return null
  }

  return (
    <div>
      {/* Thumbnail Grid */}
      {!hideGrid && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {images.map((img, idx) => (
            <div
              key={img.id || idx}
              onClick={() => handleOpenPhoto(idx)}
              className="group relative cursor-pointer rounded-sm border border-slate-300 dark:border-slate-800 bg-slate-950 overflow-hidden shadow-sm hover:border-amber-500/80 transition"
            >
              {/* Aspect container */}
              <div className="aspect-[4/3] w-full overflow-hidden flex items-center justify-center bg-slate-950 relative">
                <img
                  src={img.url}
                  alt={img.caption || `Evidence photo ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  loading="lazy"
                />

                {/* Zoom hint badge */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition duration-150 flex items-center gap-1 px-1.5 py-0.5 rounded-xs bg-slate-950/80 text-amber-400 border border-amber-500/40 text-[10px] font-mono backdrop-blur-xs">
                  <ZoomIn className="w-3 h-3" />
                  <span>INSPECT</span>
                </div>
              </div>

              {/* Overlay Caption on Bottom Bar */}
              <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-slate-950/95 via-slate-950/80 to-transparent flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-mono font-semibold bg-slate-900/90 text-amber-400 border border-slate-700/80 backdrop-blur-sm truncate">
                  <Tag className="w-2.5 h-2.5 shrink-0 text-amber-500" />
                  <span className="truncate uppercase">{img.caption || 'Evidence'}</span>
                </span>

                <div className="opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
                  <span className="p-1 rounded-sm bg-slate-800/90 text-white backdrop-blur-sm">
                    <Maximize2 className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cockpit Optical Inspection Lightbox */}
      {lightboxIndex !== null && activeImage && (
        <div
          ref={viewerContainerRef}
          style={{ touchAction: 'none' }}
          className="fixed inset-0 z-50 flex flex-col bg-slate-950/98 backdrop-blur-md select-none animate-in fade-in duration-200"
        >
          {/* TOP BAR: Telemetry Readouts & System Controls */}
          <div className="shrink-0 w-full px-3 py-2.5 bg-[#0a0d14]/90 border-b border-slate-800 flex items-center justify-between gap-2 text-white z-20">
            {/* Left: Caption & Evidence Index */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="px-2 py-0.5 rounded-sm bg-slate-900 text-amber-400 border border-amber-500/40 text-[11px] font-mono font-bold uppercase truncate max-w-[150px] sm:max-w-xs">
                {activeImage.caption || 'Maintenance Evidence'}
              </span>
              <span className="text-xs text-slate-400 font-mono shrink-0">
                [{lightboxIndex + 1} / {images.length}]
              </span>
            </div>

            {/* Center: Live Optical Telemetry (Desktop / Tablet) */}
            <div className="hidden sm:flex items-center gap-2.5 text-xs font-mono">
              <span className="text-amber-400 font-bold bg-[#111622] px-2 py-0.5 rounded-sm border border-slate-800">
                MAG: {(hudScale * 100).toFixed(0)}%
              </span>
              {hudRotation > 0 && (
                <span className="text-slate-300 bg-[#111622] px-2 py-0.5 rounded-sm border border-slate-800">
                  ROT: {hudRotation}°
                </span>
              )}
              {isZoomed && (
                <span className="text-slate-400 text-[11px] hidden md:inline">
                  PAN: X:{hudPos.x} Y:{hudPos.y}
                </span>
              )}
            </div>

            {/* Right: Actions (Fullscreen, Download, Delete, Close) */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleToggleFullscreen}
                className="hidden sm:flex p-1.5 rounded-sm bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Inspection Mode'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <a
                href={activeImage.url}
                download={activeImage.fileName || `a320_evidence_${activeImage.id}.jpg`}
                className="p-1.5 rounded-sm bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition"
                title="Download full image"
              >
                <Download className="w-4 h-4" />
              </a>

              {!readOnly && onDeleteImage && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm('Delete this photo?')) {
                      onDeleteImage(activeImage.id)
                      handleClose()
                    }
                  }}
                  className="p-1.5 rounded-sm bg-rose-950/80 hover:bg-rose-800 text-rose-300 hover:text-white border border-rose-800/60 transition"
                  title="Delete photo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 rounded-sm bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition"
                title="Close (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* MAIN VIEWPORT CANVAS */}
          <div
            className={`flex-1 relative overflow-hidden flex items-center justify-center p-2 sm:p-4 ${
              isZoomed
                ? isDragging
                  ? 'cursor-grabbing'
                  : 'cursor-grab'
                : 'cursor-default'
            }`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onDoubleClick={handleDoubleClick}
          >
            {/* Visual alignment grid overlay when zoomed in */}
            {isZoomed && (
              <div className="absolute inset-0 pointer-events-none opacity-20 tech-grid" />
            )}

            {/* Hardware-Accelerated Transform Wrapper */}
            <div
              ref={imageWrapperRef}
              style={{
                willChange: 'transform',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
              className="max-w-full max-h-full flex items-center justify-center select-none"
            >
              <img
                src={activeImage.url}
                alt={activeImage.caption || 'Evidence'}
                draggable={false}
                className="max-w-[92vw] max-h-[72vh] object-contain rounded-xs shadow-2xl border border-slate-800 select-none pointer-events-none"
              />
            </div>

            {/* Left / Right Photo Arrows */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePrev()
                  }}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 rounded-sm bg-slate-900/90 hover:bg-slate-800 text-white transition border border-slate-700 shadow-xl z-20"
                  title="Previous image (Left arrow)"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleNext()
                  }}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 rounded-sm bg-slate-900/90 hover:bg-slate-800 text-white transition border border-slate-700 shadow-xl z-20"
                  title="Next image (Right arrow)"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </>
            )}
          </div>

          {/* BOTTOM COCKPIT OPTICAL CONTROL CONSOLE */}
          <div className="shrink-0 w-full px-3 py-2 bg-[#0a0d14]/95 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-white z-20 safe-area-pb">
            {/* Gesture / Usage hint */}
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <Move className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="hidden sm:inline">
                SCROLL TO ZOOM • DRAG TO PAN • DOUBLE-CLICK TOGGLE (1x / 2.5x)
              </span>
              <span className="sm:hidden">
                PINCH / TAP TO ZOOM • DRAG TO PAN • DOUBLE-TAP TOGGLE
              </span>
            </div>

            {/* Floating Optical Zoom Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Zoom Out Button */}
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={hudScale <= 1.01}
                className="flex items-center justify-center p-1.5 sm:px-2.5 sm:py-1 rounded-sm bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 text-slate-200 border border-slate-700 text-xs font-mono transition"
                title="Zoom Out (-)"
              >
                <ZoomOut className="w-4 h-4" />
                <span className="hidden md:inline ml-1 font-mono">OUT</span>
              </button>

              {/* Magnification Slider */}
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-sm bg-slate-900 border border-slate-800 font-mono text-xs">
                <input
                  type="range"
                  min="1"
                  max="6"
                  step="0.05"
                  value={hudScale}
                  onChange={(e) => {
                    const next = parseFloat(e.target.value)
                    transformRef.current.scale = next
                    if (next <= 1.01) {
                      transformRef.current.scale = 1
                      transformRef.current.x = 0
                      transformRef.current.y = 0
                    }
                    applyTransform(false)
                  }}
                  className="w-18 sm:w-28 accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-xs"
                />
                <span className="w-12 text-center text-amber-400 font-bold text-[11px]">
                  {(hudScale * 100).toFixed(0)}%
                </span>
              </div>

              {/* Zoom In Button */}
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={hudScale >= 6}
                className="flex items-center justify-center p-1.5 sm:px-2.5 sm:py-1 rounded-sm bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 text-slate-200 border border-slate-700 text-xs font-mono transition"
                title="Zoom In (+)"
              >
                <ZoomIn className="w-4 h-4" />
                <span className="hidden md:inline ml-1 font-mono">IN</span>
              </button>

              {/* 1:1 Reset / Fit View */}
              <button
                type="button"
                onClick={() => resetTransform(true)}
                disabled={hudScale <= 1.01 && hudPos.x === 0 && hudPos.y === 0 && hudRotation === 0}
                className="p-1.5 sm:px-2 sm:py-1 rounded-sm bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-amber-500 hover:text-amber-400 border border-slate-700 text-xs font-mono font-bold transition flex items-center gap-1"
                title="Reset to 1:1 Fit (0 / R)"
              >
                <Scan className="w-3.5 h-3.5" />
                <span className="text-[10px] font-mono">FIT</span>
              </button>

              {/* Rotate 90° Clockwise */}
              <button
                type="button"
                onClick={handleRotate}
                className="p-1.5 sm:px-2 sm:py-1 rounded-sm bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-mono transition flex items-center gap-1"
                title="Rotate 90° Clockwise"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span className="hidden md:inline text-[10px]">90°</span>
              </button>
            </div>

            {/* Metadata Footer */}
            <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-400 font-mono">
              {activeImage.fileName && <span className="truncate max-w-[150px]">FILE: {activeImage.fileName}</span>}
              {activeImage.fileSize && <span>SIZE: {formatFileSize(activeImage.fileSize)}</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
