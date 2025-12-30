import { Link } from 'react-router-dom'
import { Card } from '../ui/Card'
import { buttonClasses } from '../ui/buttonStyles'
import { cn } from '../../lib/cn'
import { IconCheck } from '../icons'

export type FocusTask = {
  id: string
  title: string
  subtitle?: string
  to: string
  done?: boolean
  xp: number
}

export type RewardBadge =
  | { id: string; type: 'count'; value: string }
  | { id: string; type: 'bolt' | 'medal' | 'trophy' | 'star' }

function BadgeIcon(props: { type: Exclude<RewardBadge['type'], 'count'> }) {
  const { type } = props
  const common = {
    className: 'size-5 text-blue-200',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  switch (type) {
    case 'star':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M12 3.5l2.6 5.4 6 .9-4.3 4.2 1 6-5.3-2.8-5.3 2.8 1-6L3.4 9.8l6-.9L12 3.5z" />
        </svg>
      )
    case 'bolt':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M13 2L4 14h7l-1 8 10-13h-7l0-7z" />
        </svg>
      )
    case 'medal':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M7 2h4l1 3 1-3h4l-3.5 7H10.5L7 2z" />
          <circle cx="12" cy="15.5" r="5.5" />
          <path d="M12 12.8l.9 1.8 2 .3-1.4 1.4.3 2-1.8-1-1.8 1 .3-2-1.4-1.4 2-.3.9-1.8z" />
        </svg>
      )
    case 'trophy':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M8 4h8v4a4 4 0 0 1-8 0V4z" />
          <path d="M9 20h6" />
          <path d="M10 16h4" />
          <path d="M6 5H4v2a4 4 0 0 0 4 4" />
          <path d="M18 5h2v2a4 4 0 0 1-4 4" />
        </svg>
      )
  }
}

export function TodaysFocusCard(props: {
  title?: string
  tasks: FocusTask[]
  rewards?: RewardBadge[]
}) {
  const { title = "Today's Focus", tasks, rewards = [] } = props

  return (
    <Card
      title={title}
      right={
        <div className="rounded-full border border-slate-800/60 bg-slate-950/20 px-3 py-1 text-xs font-semibold text-slate-200">
          + 50 XP
        </div>
      }
    >
      <div className="space-y-3">
        {tasks.map((t) => (
          <Link
            key={t.id}
            to={t.to}
            className={cn(
              'flex items-center justify-between gap-4 rounded-2xl border border-slate-800/60 bg-slate-950/18 px-4 py-3',
              'hover:bg-slate-950/26',
            )}
          >
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={cn(
                  'grid size-8 place-items-center rounded-full border',
                  t.done
                    ? 'border-blue-500/30 bg-blue-500/12 text-blue-200'
                    : 'border-slate-800/60 bg-slate-950/20 text-slate-200',
                )}
              >
                {t.done ? (
                  <IconCheck size={16} />
                ) : (
                  <span className="block size-2 rounded-full bg-slate-200/70 opacity-70" />
                )}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-100">
                  {t.title}
                </div>
                {t.subtitle && (
                  <div className="mt-0.5 text-xs text-slate-400">
                    {t.subtitle}
                  </div>
                )}
              </div>
            </div>
            <div className="shrink-0">
              <span className="rounded-full border border-slate-800/60 bg-slate-950/18 px-3 py-1 text-xs font-semibold text-slate-200">
                + {t.xp} XP
              </span>
            </div>
          </Link>
        ))}

        {rewards.length > 0 && (
          <div className="pt-3">
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-300/70">
              Rewards
            </div>
            <div className="flex items-center gap-2">
              {rewards.slice(0, 6).map((r) => (
                <div
                  key={r.id}
                  className="grid size-10 place-items-center rounded-2xl border border-slate-800/60 bg-slate-950/18 text-xs font-semibold text-slate-200"
                >
                  {r.type === 'count' ? (
                    <span className="text-sm font-semibold tabular-nums">{r.value}</span>
                  ) : (
                    <BadgeIcon type={r.type} />
                  )}
                </div>
              ))}

              <Link
                to="/profile"
                className={buttonClasses({ variant: 'ghost', size: 'sm' })}
              >
                View
              </Link>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}


