import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MAX_COMPRESSION_OPTIONS, compressImage, compressImages } from '@/lib/image-compression'

// Mock browser-image-compression
vi.mock('browser-image-compression', () => ({
  default: vi.fn(),
}))

import imageCompression from 'browser-image-compression'

describe('image-compression', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('MAX_COMPRESSION_OPTIONS', () => {
    it('should have Notion-style compression settings', () => {
      expect(MAX_COMPRESSION_OPTIONS.maxSizeMB).toBe(0.3) // 300KB
      expect(MAX_COMPRESSION_OPTIONS.maxWidthOrHeight).toBe(1600)
      expect(MAX_COMPRESSION_OPTIONS.initialQuality).toBe(0.75) // 75%
      expect(MAX_COMPRESSION_OPTIONS.useWebWorker).toBe(true)
    })
  })

  describe('compressImage', () => {
    it('should call imageCompression with correct default options', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const mockCompressedFile = new File(['compressed'], 'test.webp', { type: 'image/webp' })

      vi.mocked(imageCompression).mockResolvedValue(mockCompressedFile)

      const result = await compressImage(mockFile)

      expect(imageCompression).toHaveBeenCalledWith(mockFile, {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
        initialQuality: 0.75,
        preserveExif: false,
        fileType: 'image/webp',
      })
      expect(result).toBe(mockCompressedFile)
    })

    it('should allow custom options to override defaults', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const mockCompressedFile = new File(['compressed'], 'test.webp', { type: 'image/webp' })

      vi.mocked(imageCompression).mockResolvedValue(mockCompressedFile)

      await compressImage(mockFile, { maxSizeMB: 1, initialQuality: 0.9 })

      expect(imageCompression).toHaveBeenCalledWith(mockFile, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
        initialQuality: 0.9,
        preserveExif: false,
        fileType: 'image/webp',
      })
    })

    it('should return original file if compression fails', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

      vi.mocked(imageCompression).mockRejectedValue(new Error('Compression failed'))

      const result = await compressImage(mockFile)

      expect(result).toBe(mockFile)
    })
  })

  describe('compressImages', () => {
    it('should compress multiple images in parallel', async () => {
      const mockFiles = [
        new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['test2'], 'test2.jpg', { type: 'image/jpeg' }),
        new File(['test3'], 'test3.jpg', { type: 'image/jpeg' }),
      ]
      const mockCompressedFiles = [
        new File(['compressed1'], 'test1.webp', { type: 'image/webp' }),
        new File(['compressed2'], 'test2.webp', { type: 'image/webp' }),
        new File(['compressed3'], 'test3.webp', { type: 'image/webp' }),
      ]

      vi.mocked(imageCompression)
        .mockResolvedValueOnce(mockCompressedFiles[0])
        .mockResolvedValueOnce(mockCompressedFiles[1])
        .mockResolvedValueOnce(mockCompressedFiles[2])

      const results = await compressImages(mockFiles)

      expect(imageCompression).toHaveBeenCalledTimes(3)
      expect(results).toHaveLength(3)
      expect(results).toEqual(mockCompressedFiles)
    })
  })
})
