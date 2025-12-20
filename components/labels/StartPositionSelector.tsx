'use client'

interface StartPositionSelectorProps {
  rows: number
  cols: number
  selectedPosition: number // 1-indexed
  onChange: (position: number) => void
  labelsNeeded?: number // Optional: highlight how many positions will be used
}

export default function StartPositionSelector({
  rows,
  cols,
  selectedPosition,
  onChange,
  labelsNeeded = 1,
}: StartPositionSelectorProps) {
  const total = rows * cols

  // Calculate which positions will be filled based on start position and labels needed
  const getPositionState = (position: number): 'selected' | 'filled' | 'available' => {
    if (position === selectedPosition) return 'selected'
    if (position >= selectedPosition && position < selectedPosition + labelsNeeded) return 'filled'
    return 'available'
  }

  return (
    <div className="space-y-3">
      <div className="text-xs text-neutral-500">
        Click to select starting position ({total} labels per sheet)
      </div>

      <div
        className="inline-grid gap-1 p-3 bg-neutral-50 rounded-lg border border-neutral-200"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: total }, (_, i) => {
          const position = i + 1 // 1-indexed
          const state = getPositionState(position)

          return (
            <button
              key={position}
              type="button"
              onClick={() => onChange(position)}
              className={`
                w-8 h-6 rounded text-xs font-medium transition-all
                ${state === 'selected'
                  ? 'bg-pickle-500 text-white shadow-sm ring-2 ring-pickle-300'
                  : state === 'filled'
                  ? 'bg-pickle-200 text-pickle-700'
                  : 'bg-white text-neutral-400 hover:bg-neutral-100 border border-neutral-200'
                }
              `}
              title={`Position ${position}`}
            >
              {position}
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-4 text-xs text-neutral-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-pickle-500" />
          <span>Start</span>
        </div>
        {labelsNeeded > 1 && (
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-pickle-200" />
            <span>Will be printed</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-white border border-neutral-200" />
          <span>Available</span>
        </div>
      </div>
    </div>
  )
}
