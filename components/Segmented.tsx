"use client"

type Props<T extends string> = {
  name: string
  options: readonly T[]
  value: T | undefined
  onChange: (value: T) => void
  disabled?: boolean
  invalid?: boolean
}

// A row of small buttons where exactly one can be picked (yes / no / unknown).
export function Segmented<T extends string>({ name, options, value, onChange, disabled, invalid }: Props<T>) {
  return (
    <div role="radiogroup" aria-label={name} className={`flex shrink-0 gap-1 rounded ${invalid ? "ring-2 ring-red-400 ring-offset-1" : ""}`}>
      {options.map((option) => {
        const selected = value === option
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(option)}
            className={`rounded border px-2.5 py-1 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
              selected ? "border-teal-700 bg-teal-700 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}
