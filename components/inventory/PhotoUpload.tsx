'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Camera, Image as ImageIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface PhotoUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  disabled?: boolean
}

export function PhotoUpload({
  images,
  onImagesChange,
  maxImages = 5,
  disabled = false,
}: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Not authenticated')
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('inventory-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('inventory-images')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (err) {
      console.error('Upload error:', err)
      return null
    }
  }

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const remainingSlots = maxImages - images.length
    if (remainingSlots <= 0) {
      setError(`Maximum ${maxImages} images allowed`)
      return
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots)
    const validFiles = filesToUpload.filter((file) => {
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed')
        return false
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB')
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    setUploading(true)
    setError(null)

    try {
      const uploadPromises = validFiles.map((file) => uploadImage(file))
      const results = await Promise.all(uploadPromises)
      const successfulUploads = results.filter((url): url is string => url !== null)

      if (successfulUploads.length > 0) {
        onImagesChange([...images, ...successfulUploads])
      }

      if (successfulUploads.length < validFiles.length) {
        setError('Some images failed to upload')
      }
    } catch {
      setError('Failed to upload images')
    } finally {
      setUploading(false)
    }
  }, [images, maxImages, onImagesChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return
    const newImages = [...images]
    const [removed] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, removed)
    onImagesChange(newImages)
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
          dragOver
            ? 'border-pickle-500 bg-pickle-50'
            : 'border-neutral-300 hover:border-neutral-400'
        } ${disabled || uploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-pickle-500" />
            <p className="text-sm text-neutral-600">Uploading...</p>
          </div>
        ) : (
          <>
            <Upload className="mx-auto h-8 w-8 text-neutral-400" />
            <p className="mt-2 text-sm text-neutral-600">
              Drag and drop images here, or
            </p>
            <div className="mt-3 flex justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || images.length >= maxImages}
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Browse
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => cameraInputRef.current?.click()}
                disabled={disabled || images.length >= maxImages}
              >
                <Camera className="mr-2 h-4 w-4" />
                Camera
              </Button>
            </div>
            <p className="mt-2 text-xs text-neutral-400">
              Max {maxImages} images, up to 5MB each
            </p>
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {images.map((url, index) => (
            <div
              key={url}
              className="group relative aspect-square overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100"
            >
              <img
                src={url}
                alt={`Upload ${index + 1}`}
                className="h-full w-full object-cover"
              />
              {/* Primary Badge */}
              {index === 0 && (
                <span className="absolute left-2 top-2 rounded bg-pickle-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  Primary
                </span>
              )}
              {/* Actions Overlay */}
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => moveImage(index, 0)}
                    className="rounded bg-white px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
                  >
                    Set Primary
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="rounded bg-red-500 p-1.5 text-white hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
