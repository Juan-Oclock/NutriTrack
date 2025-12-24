/**
 * Image compression utility for meal scanning
 * Reduces image size before sending to Gemini API for faster uploads
 */

interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 1024,
  maxHeight: 1024,
  quality: 0.85,
}

/**
 * Compresses an image data URL to reduce file size
 * @param dataUrl - The base64 data URL of the image
 * @param options - Compression options (maxWidth, maxHeight, quality)
 * @returns Promise<string> - Compressed image as base64 data URL
 */
export async function compressImage(
  dataUrl: string,
  options: CompressionOptions = {}
): Promise<string> {
  const { maxWidth, maxHeight, quality } = { ...DEFAULT_OPTIONS, ...options }

  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img

      if (width > maxWidth! || height > maxHeight!) {
        const ratio = Math.min(maxWidth! / width, maxHeight! / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      // Create canvas and draw resized image
      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject(new Error("Could not get canvas context"))
        return
      }

      // Use better image smoothing for quality
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"

      // Draw the image
      ctx.drawImage(img, 0, 0, width, height)

      // Convert to JPEG with specified quality
      const compressedDataUrl = canvas.toDataURL("image/jpeg", quality)

      resolve(compressedDataUrl)
    }

    img.onerror = () => {
      reject(new Error("Failed to load image for compression"))
    }

    img.src = dataUrl
  })
}

/**
 * Gets the approximate size of a base64 data URL in bytes
 */
export function getBase64Size(dataUrl: string): number {
  // Remove the data URL prefix to get just the base64
  const base64 = dataUrl.split(",")[1] || dataUrl
  // Base64 encodes 3 bytes as 4 characters
  return Math.round((base64.length * 3) / 4)
}

/**
 * Formats bytes to human readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
