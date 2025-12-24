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
        <div className="text-xs font-medium text-slate-200">{label}</div>
        <div className="text-xs text-slate-400">{clamped}%</div>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-800/70">
        <div
          className={cn('h-2 rounded-full', barClass ?? 'bg-slate-200')}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}


