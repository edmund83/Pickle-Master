const TESTIMONIALS = [
  {
    name: 'Warehouse Manager',
    title: 'Fewer count mistakes',
    quote:
      'We cut our monthly stock count time in half. Scanning + quick adjustments make discrepancies obvious, and the audit trail keeps everyone honest.',
  },
  {
    name: 'Small Business Owner',
    title: 'Finally predictable pricing',
    quote:
      'We outgrew spreadsheets fast, but other tools punished us for having more items. Nook stayed simple and the pricing didn’t spike.',
  },
  {
    name: 'Construction Ops',
    title: 'Tools stop “walking away”',
    quote:
      'Check-out to staff by scan changed everything. We know who has what, and returns don’t rely on memory anymore.',
  },
]

export function TestimonialGrid() {
  return (
    <div className="py-8 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 space-y-4 text-center sm:mb-16 lg:mb-24">
          <p className="text-primary text-sm font-medium uppercase">Real teams</p>
          <h2 className="text-base-content text-2xl font-semibold md:text-3xl lg:text-4xl">Loved for speed and simplicity</h2>
          <p className="text-base-content/80 text-xl">Short feedback from people who manage inventory every day.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div key={t.title} className="card card-border shadow-none">
              <div className="card-body gap-5">
                <div className="flex gap-1">
                  <span className="icon-[tabler--star-filled] text-warning size-6 shrink-0"></span>
                  <span className="icon-[tabler--star-filled] text-warning size-6 shrink-0"></span>
                  <span className="icon-[tabler--star-filled] text-warning size-6 shrink-0"></span>
                  <span className="icon-[tabler--star-filled] text-warning size-6 shrink-0"></span>
                  <span className="icon-[tabler--star-filled] text-warning size-6 shrink-0"></span>
                </div>
                <p className="text-base-content/80">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <h3 className="text-base-content font-semibold">{t.title}</h3>
                  <p className="text-base-content/70 text-sm">{t.name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

