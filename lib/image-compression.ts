import imageCompression from 'browser-image-compression'

export interface CompressionOptions {
  maxSizeMB?: number
  maxWidthOrHeight?: number
  useWebWorker?: boolean
}

/**
 * Compresses an image file using browser-image-compression library.
 * Converts to WebP format for best compression while preserving quality.
 *
 * @param file - The image file to compress
 * @param options - Optional compression settings
 * @returns Promise<File> - The compressed image file
 */
export async function compressImage(
  file: File,
  options?: CompressionOptions
): Promise<File> {
  const defaultOptions = {
    maxSizeMB: 1, // Target max 1MB
    maxWidthOrHeight: 1920, // Full HD max dimension
    useWebWorker: true, // Non-blocking compression
    initialQuality: 0.8, // 80% quality - perceptually lossless
    preserveExif: false, // Remove EXIF data for privacy
    fileType: 'image/webp' as const, // Convert to WebP for best compression
  }

  const compressionOptions = {
    ...defaultOptions,
    ...options,
  }

  // Skip compression for already small files (< 100KB)
  if (file.size < 100 * 1024) {
    return file
  }

  try {
    const compressedFile = await imageCompression(file, compressionOptions)

    // Log compression results in development
    if (process.env.NODE_ENV === 'development') {
      const originalSize = (file.size / 1024).toFixed(1)
      const compressedSize = (compressedFile.size / 1024).toFixed(1)
      const reduction = ((1 - compressedFile.size / file.size) * 100).toFixed(0)
      console.log(`Image compressed: ${originalSize}KB → ${compressedSize}KB (${reduction}% reduction)`)
    }

    return compressedFile
  } catch (error) {
    console.error('Image compression failed, using original:', error)
    return file // Fallback to original if compression fails
  }
}

/**
 * Compresses multiple image files in parallel.
 *
 * @param files - Array of image files to compress
 * @param options - Optional compression settings
 * @returns Promise<File[]> - Array of compressed image files
 */
export async function compressImages(
  files: File[],
  options?: CompressionOptions
): Promise<File[]> {
  return Promise.all(files.map(file => compressImage(file, options)))
}
