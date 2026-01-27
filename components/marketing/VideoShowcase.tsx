'use client'

import { useState } from 'react'
import Image from 'next/image'

export function VideoShowcase() {
  const [showVideo, setShowVideo] = useState(false)
  const videoId = 'q3iZkLgx_Pw'

  return (
    <section className="bg-base-100 py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="intersect-once intersect:motion-preset-fade-lg intersect:motion-duration-700 aspect-video overflow-hidden rounded-2xl relative">
          {showVideo ? (
            <iframe
              className="h-full w-full"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              title="StockZip Product Demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : (
            <button
              onClick={() => setShowVideo(true)}
              className="w-full h-full relative group cursor-pointer"
              aria-label="Play StockZip Product Demo video"
            >
              <Image
                src={`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`}
                alt="StockZip Product Demo thumbnail"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 md:w-10 md:h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
