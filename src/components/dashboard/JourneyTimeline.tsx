import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { IconBook, IconCheck, IconGamepad, IconPin, IconTarget, IconUser } from '../icons'

export type JourneyStep = {
  key: string
  label: string
  to: string
  done: boolean
  locked?: boolean
  icon: 'profile' | 'psychometric' | 'course' | 'roadmap' | 'games'
}

function StepIcon(props: { icon: JourneyStep['icon']; done: boolean }) {
  const { icon, done } = props
  if (done) return <IconCheck size={18} />
  switch (icon) {
    case 'profile':
      return <IconUser size={18} />
    case 'psychometric':
      return <IconTarget size={18} />
    case 'course':
      return <IconBook size={18} />
    case 'roadmap':
      return <IconPin size={18} />
    case 'games':
      return <IconGamepad size={18} />
  }
}

function clamp100(n: number) {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(100, n))
}

export function JourneyTimeline(props: {
  steps: JourneyStep[]
  progressPercent?: number
  avatarUrl?: string | null
  avatarFallback?: string
}) {
  const { steps, progressPercent } = props
  const completedSteps = steps.filter((s) => s.done).length
  const fallbackProgress =
    steps.length <= 1 ? 0 : ((completedSteps - 1) / (steps.length - 1)) * 100
  const p = clamp100(progressPercent ?? fallbackProgress)

  return (
    <div className="rounded-2xl border border-slate-800/60 bg-slate-950/16 px-5 py-4 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm font-semibold text-slate-100">Gamified Career Journey</div>
        <div className="text-xs font-semibold text-slate-400">
          Click a step to open it
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <div className="relative min-w-[860px] px-2 pb-4 pt-1">
          {/* Track */}
          <div className="absolute left-2 right-2 top-[74px] h-px bg-blue-500/12" />
          {/* Progress fill */}
          <div
            className="absolute left-2 top-[74px] h-px bg-gradient-to-r from-blue-500/70 to-blue-300/70 shadow-[0_0_18px_rgba(59,130,246,0.20)]"
            style={{ width: `calc(${p}% * (100% - 16px) / 100)` }}
          />
          {/* Marker removed (user requested no avatar on the timeline) */}

          <div className="relative grid grid-cols-5 gap-6">
            {steps.map((s) => (
              <StepLink
                key={s.key}
                to={s.to}
                locked={Boolean(s.locked) && !s.done}
                className="group flex flex-col items-center"
              >
                <div
                  className={cn(
                    'rounded-2xl border px-4 py-2 text-center text-xs font-semibold',
                    s.done
                      ? 'border-blue-500/25 bg-blue-600/10 text-blue-100 shadow-[0_0_18px_rgba(59,130,246,0.14)]'
                      : s.locked
                        ? 'border-slate-800/60 bg-slate-950/18 text-slate-300/60'
                        : 'border-slate-800/60 bg-slate-950/18 text-slate-200',
                  )}
                >
                  {s.label}
                </div>
                <motion.div
                  whileHover={s.locked && !s.done ? undefined : { y: -2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className={cn(
                    'mt-4 grid size-12 place-items-center rounded-full border',
                    s.done
                      ? 'border-blue-500/30 bg-blue-500/12 text-blue-200 shadow-[0_0_18px_rgba(59,130,246,0.18)]'
                      : s.locked
                        ? 'border-slate-800/60 bg-slate-950/18 text-slate-300/70'
                        : 'border-slate-800/60 bg-slate-950/18 text-slate-200/90',
                  )}
                >
                  {s.locked && !s.done ? <LockIcon /> : <StepIcon icon={s.icon} done={s.done} />}
                </motion.div>

                <div className="mt-2 text-[11px] font-medium text-slate-400">
                  {s.done ? 'Completed' : s.locked ? 'Locked' : 'Start'}
                </div>
              </StepLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StepLink(props: { to: string; locked: boolean; className?: string; children: ReactNode }) {
  const { to, locked, className, children } = props
  if (locked) {
    return (
      <div className={cn(className, 'cursor-not-allowed')} aria-disabled="true">
        {children}
      </div>
    )
  }
  return (
    <Link to={to} className={cn(className)}>
      {children}
    </Link>
  )
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7.5 11V8.8a4.5 4.5 0 0 1 9 0V11"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M7 11h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M12 16v2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  )
}


