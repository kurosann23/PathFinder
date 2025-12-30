import { cn } from '../../lib/cn'

type ProgressBarProps = {
  label: string
  value: number
  barClass?: string
}

export function ProgressBar(props: ProgressBarProps) {
  const { label, value, barClass } = props
  const clamped = Math.max(0, Math.min(100, value))

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-200/90">
          {label}
        </div>
        <div className="text-xs font-semibold tabular-nums text-slate-300/70">
          {clamped}%
        </div>
      </div>
      <div className="h-2.5 w-full rounded-full bg-slate-950/40 ring-1 ring-slate-800/60">
        <div
          className={cn(
            'h-2.5 rounded-full shadow-[0_0_18px_rgba(59,130,246,0.25)]',
            barClass ?? 'bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500',
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}


