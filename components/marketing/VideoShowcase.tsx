export function VideoShowcase() {
  return (
    <section className="bg-base-100 py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="intersect-once intersect:motion-preset-fade-lg intersect:motion-duration-700 aspect-video overflow-hidden rounded-2xl border border-base-content/10 bg-base-300">
          <div className="flex h-full items-center justify-center">
            <span className="icon-[tabler--player-play] size-20 text-primary/40" />
          </div>
        </div>
      </div>
    </section>
  )
}
