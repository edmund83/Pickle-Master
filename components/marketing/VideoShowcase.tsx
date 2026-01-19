export function VideoShowcase() {
  return (
    <section className="bg-base-100 py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="intersect-once intersect:motion-preset-fade-lg intersect:motion-duration-700 aspect-video overflow-hidden rounded-2xl">
          <iframe
            className="h-full w-full"
            src="https://www.youtube.com/embed/q3iZkLgx_Pw"
            title="StockZip Product Demo"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  )
}
