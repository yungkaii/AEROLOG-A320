export interface CompressedImageResult {
  url: string
  fileName: string
  fileSize: number
  mimeType: string
  width: number
  height: number
}

/**
 * Compresses and resizes an image file to reduce storage footprint
 * while preserving clear technical details and text legibility.
 */
export async function compressAndResizeImage(
  file: File,
  maxDimension = 1024,
  quality = 0.72
): Promise<CompressedImageResult> {
  return new Promise((resolve, reject) => {
    // If SVG, preserve directly without loss
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader()
      reader.onload = () => {
        resolve({
          url: reader.result as string,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          width: 800,
          height: 600,
        })
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
      return
    }

    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = (event) => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        let width = img.width
        let height = img.height

        // Calculate aspect-preserving dimensions
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          } else {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          // Fallback to uncompressed
          resolve({
            url: event.target?.result as string,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
            width: img.width,
            height: img.height,
          })
          return
        }

        // Draw image on canvas with high-quality smoothing
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)

        const mime = file.type === 'image/png' ? 'image/jpeg' : file.type || 'image/jpeg'
        let compressedDataUrl = canvas.toDataURL(mime, quality)

        // Adaptive second-pass compression if output is still > 380,000 chars (~285KB)
        if (compressedDataUrl.length > 380_000) {
          const secondMaxDim = Math.min(width, 800)
          const secondHeight = Math.round((height * secondMaxDim) / width)
          const secondCanvas = document.createElement('canvas')
          secondCanvas.width = secondMaxDim
          secondCanvas.height = secondHeight
          const secondCtx = secondCanvas.getContext('2d')
          if (secondCtx) {
            secondCtx.imageSmoothingEnabled = true
            secondCtx.imageSmoothingQuality = 'high'
            secondCtx.drawImage(img, 0, 0, secondMaxDim, secondHeight)
            compressedDataUrl = secondCanvas.toDataURL('image/jpeg', 0.62)
            width = secondMaxDim
            height = secondHeight
          }
        }

        // Calculate approximate size in bytes from base64
        const stringLength = compressedDataUrl.length - 'data:image/jpeg;base64,'.length
        const sizeInBytes = Math.round(stringLength * 0.75)

        resolve({
          url: compressedDataUrl,
          fileName: file.name,
          fileSize: sizeInBytes,
          mimeType: 'image/jpeg',
          width,
          height,
        })
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
}
