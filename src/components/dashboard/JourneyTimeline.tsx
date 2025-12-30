import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
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

export function JourneyTimeline(props: { steps: JourneyStep[] }) {
  const { steps } = props

  return (
    <div className="rounded-2xl border border-slate-800/60 bg-slate-950/16 px-5 py-4 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm font-semibold text-slate-100">Career Journey</div>
        <div className="text-xs font-semibold text-slate-400">
          Click a step to open it
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <div className="relative min-w-[860px] px-2 pb-2">
          <div className="absolute left-2 right-2 top-6 h-px bg-blue-500/20" />
          <div className="relative grid grid-cols-5 gap-6">
            {steps.map((s) => (
              <Link
                key={s.key}
                to={s.to}
                className={cn('group flex flex-col items-center')}
              >
                <motion.div
                  whileHover={{ y: -2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className={cn(
                    'grid size-12 place-items-center rounded-full border',
                    s.done
                      ? 'border-blue-500/30 bg-blue-500/12 text-blue-200 shadow-[0_0_18px_rgba(59,130,246,0.18)]'
                      : 'border-slate-800/60 bg-slate-950/18 text-slate-200/90',
                  )}
                >
                  <StepIcon icon={s.icon} done={s.done} />
                </motion.div>

                <div className="mt-3 text-xs font-semibold text-slate-200">
                  {s.label}
                </div>
                <div className="mt-1 text-[11px] font-medium text-slate-400">
                  {s.done ? 'Completed' : 'Locked'}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


