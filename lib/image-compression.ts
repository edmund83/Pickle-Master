import imageCompression from 'browser-image-compression'

export interface CompressionOptions {
  maxSizeMB?: number
  maxWidthOrHeight?: number
  useWebWorker?: boolean
  initialQuality?: number
}

/**
 * Maximum compression preset for aggressive file size reduction.
 * Use this for all user uploads to minimize storage and bandwidth.
 */
export const MAX_COMPRESSION_OPTIONS: CompressionOptions = {
  maxSizeMB: 0.2, // Target max 200KB for maximum compression
  maxWidthOrHeight: 1280, // HD max dimension (sufficient for web display)
  useWebWorker: true,
  initialQuality: 0.5, // 50% quality - aggressive but acceptable for web
}

/**
 * Compresses an image file using browser-image-compression library.
 * Uses maximum compression by default - converts to WebP format with aggressive settings.
 *
 * @param file - The image file to compress
 * @param options - Optional compression settings (defaults to maximum compression)
 * @returns Promise<File> - The compressed image file
 */
export async function compressImage(
  file: File,
  options?: CompressionOptions
): Promise<File> {
  const defaultOptions = {
    maxSizeMB: MAX_COMPRESSION_OPTIONS.maxSizeMB,
    maxWidthOrHeight: MAX_COMPRESSION_OPTIONS.maxWidthOrHeight,
    useWebWorker: MAX_COMPRESSION_OPTIONS.useWebWorker,
    initialQuality: MAX_COMPRESSION_OPTIONS.initialQuality,
    preserveExif: false, // Remove EXIF data for privacy
    fileType: 'image/webp' as const, // Convert to WebP for best compression
  }

  const compressionOptions = {
    ...defaultOptions,
    ...options,
  }

  // Always compress to ensure WebP format and consistent output
  // Even small files benefit from WebP conversion

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
