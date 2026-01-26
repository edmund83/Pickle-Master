/**
 * Camera Manager
 *
 * Unified camera stream management for all scanner engines.
 * Handles camera enumeration, stream acquisition, and frame capture.
 */

import type { CameraDevice, CameraConfig } from '../engines/types'

/**
 * CameraManager handles all camera-related operations:
 * - Enumerate available cameras
 * - Start/stop camera streams
 * - Capture frames for barcode detection
 */
export class CameraManager {
  private stream: MediaStream | null = null
  private videoElement: HTMLVideoElement | null = null
  private canvas: HTMLCanvasElement | null = null
  private canvasCtx: CanvasRenderingContext2D | null = null

  /**
   * Enumerate available camera devices
   * @returns List of camera devices with their IDs and labels
   */
  async enumerateCameras(): Promise<CameraDevice[]> {
    try {
      // Request permission first to get device labels
      const tempStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })

      // Get devices
      const devices = await navigator.mediaDevices.enumerateDevices()

      // Stop temp stream
      tempStream.getTracks().forEach((track) => track.stop())

      return devices
        .filter((d) => d.kind === 'videoinput')
        .map((d) => ({
          id: d.deviceId,
          label: d.label || `Camera ${d.deviceId.slice(0, 8)}`,
          facing: this.inferFacingMode(d.label),
        }))
    } catch (error) {
      // If permission denied, return empty list
      console.warn('Camera enumeration failed:', error)
      return []
    }
  }

  /**
   * Infer facing mode from camera label
   */
  private inferFacingMode(label: string): 'user' | 'environment' | undefined {
    const lowerLabel = label.toLowerCase()
    if (
      lowerLabel.includes('back') ||
      lowerLabel.includes('rear') ||
      lowerLabel.includes('environment')
    ) {
      return 'environment'
    }
    if (lowerLabel.includes('front') || lowerLabel.includes('user') || lowerLabel.includes('face')) {
      return 'user'
    }
    return undefined
  }

  /**
   * Find the best camera for barcode scanning (prefers back/environment camera)
   */
  async findBestCamera(): Promise<CameraDevice | null> {
    const cameras = await this.enumerateCameras()
    if (cameras.length === 0) return null

    // Prefer environment-facing camera
    const backCamera = cameras.find((c) => c.facing === 'environment')
    if (backCamera) return backCamera

    // Fallback to first camera
    return cameras[0]
  }

  /**
   * Start camera stream with given configuration
   * @param config - Camera configuration options
   * @returns The MediaStream
   */
  async startStream(config: CameraConfig = {}): Promise<MediaStream> {
    // Stop any existing stream
    this.stopStream()

    const constraints: MediaStreamConstraints = {
      video: {
        width: { ideal: config.width || 1280, min: 640 },
        height: { ideal: config.height || 720, min: 480 },
        frameRate: { ideal: config.frameRate || 30, min: 15 },
        ...(config.deviceId
          ? { deviceId: { exact: config.deviceId } }
          : { facingMode: config.facingMode || 'environment' }),
      },
      audio: false,
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints)
      return this.stream
    } catch (error) {
      // If specific device fails, try without device constraint
      if (config.deviceId) {
        console.warn('Specific camera failed, trying default:', error)
        return this.startStream({ ...config, deviceId: undefined })
      }
      throw error
    }
  }

  /**
   * Bind the camera stream to a video element
   * @param video - The HTML video element to display the stream
   */
  bindToVideo(video: HTMLVideoElement): void {
    if (!this.stream) {
      throw new Error('No stream available. Call startStream() first.')
    }

    this.videoElement = video
    video.srcObject = this.stream
    video.setAttribute('playsinline', 'true') // Required for iOS
    video.muted = true

    // Create canvas for frame capture (reused for performance)
    this.canvas = document.createElement('canvas')
    this.canvasCtx = this.canvas.getContext('2d', {
      willReadFrequently: true, // Hint for optimization
    })
  }

  /**
   * Capture a single frame from the video as ImageData
   * @returns ImageData of the current frame, or null if not ready
   */
  captureFrame(): ImageData | null {
    if (!this.videoElement || !this.canvas || !this.canvasCtx) {
      return null
    }

    const video = this.videoElement
    if (video.readyState < video.HAVE_CURRENT_DATA) {
      return null
    }

    const width = video.videoWidth
    const height = video.videoHeight

    if (width === 0 || height === 0) {
      return null
    }

    // Resize canvas if needed
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width
      this.canvas.height = height
    }

    // Draw video frame to canvas
    this.canvasCtx.drawImage(video, 0, 0, width, height)

    // Extract ImageData
    return this.canvasCtx.getImageData(0, 0, width, height)
  }

  /**
   * Get the current video dimensions
   */
  getVideoDimensions(): { width: number; height: number } | null {
    if (!this.videoElement) return null
    return {
      width: this.videoElement.videoWidth,
      height: this.videoElement.videoHeight,
    }
  }

  /**
   * Check if camera has torch/flashlight capability
   */
  hasTorch(): boolean {
    if (!this.stream) return false
    const track = this.stream.getVideoTracks()[0]
    if (!track) return false

    const capabilities = track.getCapabilities?.() as MediaTrackCapabilities & { torch?: boolean }
    return capabilities?.torch === true
  }

  /**
   * Toggle torch/flashlight
   * @param enabled - Whether to enable the torch
   */
  async setTorch(enabled: boolean): Promise<void> {
    if (!this.stream) return

    const track = this.stream.getVideoTracks()[0]
    if (!track) return

    try {
      await track.applyConstraints({
        // @ts-expect-error - torch is not in the standard types but is supported
        advanced: [{ torch: enabled }],
      })
    } catch (error) {
      console.warn('Torch control failed:', error)
    }
  }

  /**
   * Stop the camera stream and release resources
   */
  stopStream(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop())
      this.stream = null
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null
      this.videoElement = null
    }

    this.canvas = null
    this.canvasCtx = null
  }

  /**
   * Check if the stream is active
   */
  isActive(): boolean {
    return this.stream !== null && this.stream.active
  }
}
