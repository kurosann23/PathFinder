import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  careerSnapshotMeta,
  dashboardHeader,
  initialCareerTraits,
  journeyMeta,
  type JourneyKey,
} from '../constants/dashboard'
import { useUserProgress } from '../context/UserProgressContext'
import { Card } from '../components/ui/Card'
import { ProgressBar } from '../components/ui/ProgressBar'
import { PageHeader } from '../components/PageHeader'
import { cn } from '../lib/cn'
import {
  IconBell,
  IconBook,
  IconCheck,
  IconGamepad,
  IconPin,
  IconSettings,
  IconTarget,
} from '../components/icons'

function StatIcon(props: { icon: string; className?: string }) {
  const { icon, className } = props
  const common = { size: 18, className }

  switch (icon) {
    case 'target':
      return <IconTarget {...common} />
    case 'book':
      return <IconBook {...common} />
    case 'pin':
      return <IconPin {...common} />
    case 'gamepad':
      return <IconGamepad {...common} />
    default:
      return <IconTarget {...common} />
  }
}

function StatCard(props: {
  title: string
  primary: string
  secondary: string
  accent: 'emerald' | 'blue' | 'violet' | 'orange'
  icon: string
}) {
  const { title, primary, secondary, accent, icon } = props

  const accentClasses: Record<typeof accent, string> = {
    emerald: 'ring-emerald-500/25 bg-emerald-500/10 text-emerald-200',
    blue: 'ring-blue-500/25 bg-blue-500/10 text-blue-200',
    violet: 'ring-violet-500/25 bg-violet-500/10 text-violet-200',
    orange: 'ring-orange-500/25 bg-orange-500/10 text-orange-200',
  }

  return (
    <Card className="px-0 py-0">
      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <div className="min-w-0">
          <div className="text-xs text-slate-400">{title}</div>
          <div className="mt-2 text-2xl font-semibold text-slate-100">
            {primary}
          </div>
          <div className="mt-1 text-xs font-medium text-slate-400">
            {secondary}
          </div>
        </div>
        <div
          className={cn(
            'grid size-10 place-items-center rounded-xl ring-1',
            accentClasses[accent],
          )}
        >
          <StatIcon icon={icon} className="opacity-95" />
        </div>
      </div>
    </Card>
  )
}

export function DashboardPage() {
  const { progress, simulateProgress, resetDemo } = useUserProgress()

  // Dashboard-only dummy values (not shared in context yet).
  const coursesMatched = 12
  const xp = 850
  const careerTraits = useMemo(() => {
    if (!progress.psychometricCompleted) return initialCareerTraits

    // Use REAL psychometric RIASEC percentages for the snapshot once the test is completed.
    return {
      realistic: progress.riasecPercentages.R,
      investigative: progress.riasecPercentages.I,
      artistic: progress.riasecPercentages.A,
      social: progress.riasecPercentages.S,
      enterprising: progress.riasecPercentages.E,
      conventional: progress.riasecPercentages.C,
    } as const
  }, [progress.psychometricCompleted, progress.riasecPercentages])

  const stats = useMemo(() => {
    const psychoPrimary = progress.psychometricCompleted
      ? progress.psychometricResult
      : '—'
    const psychoSecondary = progress.psychometricCompleted
      ? 'Completed'
      : 'Not Taken'

    return [
      {
        title: 'Psychometric Test',
        primary: psychoPrimary,
        secondary: psychoSecondary,
        accent: 'emerald' as const,
        icon: 'target',
      },
      {
        title: 'Course Recommendation',
        primary: String(coursesMatched),
        secondary: `${coursesMatched} Matched`,
        accent: 'blue' as const,
        icon: 'book',
      },
      {
        title: 'Roadmap Progress',
        primary: `${progress.roadmapProgress}%`,
        secondary: `${progress.roadmapProgress}% Complete`,
        accent: 'violet' as const,
        icon: 'pin',
      },
      {
        title: 'Mini Games',
        primary: String(xp),
        secondary: `${xp} XP`,
        accent: 'orange' as const,
        icon: 'gamepad',
      },
    ]
  }, [coursesMatched, progress.psychometricCompleted, progress.psychometricResult, progress.roadmapProgress])

  const topCareerTypeLabel = useMemo(() => {
    let topKey = careerSnapshotMeta[0]?.key
    let topValue = -Infinity

    for (const item of careerSnapshotMeta) {
      const v = careerTraits[item.key]
      if (v > topValue) {
        topValue = v
        topKey = item.key
      }
    }

    return careerSnapshotMeta.find((t) => t.key === topKey)?.label ?? '—'
  }, [careerTraits])

  return (
    <div className="space-y-6">
      <PageHeader
        title={dashboardHeader.title}
        subtitle={dashboardHeader.subtitle}
      />

      <Card className="overflow-hidden">
        <div className="relative">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_circle_at_20%_20%,rgba(59,130,246,0.25),transparent_55%),radial-gradient(700px_circle_at_80%_70%,rgba(34,211,238,0.12),transparent_55%)]" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="grid size-11 place-items-center rounded-2xl bg-slate-950/40 ring-1 ring-slate-800/60">
                <span className="text-lg">🧑‍💻</span>
              </div>
              <div className="min-w-0">
                <div className="text-lg font-semibold text-slate-100">
                  {`Welcome back, ${progress.userName}! 👋`}
                </div>
                <div className="mt-1 text-sm text-slate-300/80">
                  {`You're ${progress.roadmapProgress}% done with your career journey. Keep up the amazing work!`}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl border border-slate-800/70 bg-slate-950/40 p-2 text-slate-300 hover:bg-slate-900/60 hover:text-slate-100"
                aria-label="Notifications (UI only)"
              >
                <IconBell size={18} />
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl border border-slate-800/70 bg-slate-950/40 p-2 text-slate-300 hover:bg-slate-900/60 hover:text-slate-100"
                aria-label="Settings (UI only)"
              >
                <IconSettings size={18} />
              </button>

              {/* Dev-only demo button: simulates progress for presentations/testing (no backend). */}
              <button
                type="button"
                onClick={simulateProgress}
                className="inline-flex items-center justify-center rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-900/60"
              >
                Simulate Progress
              </button>
              <button
                type="button"
                onClick={resetDemo}
                className="inline-flex items-center justify-center rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-900/60"
              >
                Reset Demo
              </button>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <StatCard
            key={s.title}
            title={s.title}
            primary={s.primary}
            secondary={s.secondary}
            accent={s.accent}
            icon={s.icon}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card
          title="Career Snapshot"
          right={
            <Link
              to={progress.psychometricCompleted ? '/psychometric-test#results' : '/psychometric-test'}
              className="text-xs font-semibold text-slate-300 hover:text-slate-100"
            >
              View Full Report
            </Link>
          }
        >
          <div className="space-y-4">
            {careerSnapshotMeta.map((item) => (
              <ProgressBar
                key={item.label}
                label={item.label}
                value={careerTraits[item.key]}
                barClass={item.barClass}
              />
            ))}

            <div className="rounded-xl bg-slate-950/40 px-4 py-3 text-sm font-semibold text-slate-200 ring-1 ring-slate-800/70">
              {`Top Career Type: ${topCareerTypeLabel}`}
            </div>
          </div>
        </Card>

        <Card title="Your Journey">
          <div className="space-y-3">
            {journeyMeta.map((item) => {
              const done = progress.journey[item.key as JourneyKey]
              return (
                <div
                  key={item.label}
                  className={cn(
                    'flex items-center justify-between gap-4 rounded-2xl border px-4 py-3',
                    done
                      ? 'border-emerald-500/25 bg-emerald-500/10'
                      : 'border-slate-800/70 bg-slate-950/30',
                  )}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={cn(
                        'grid size-7 place-items-center rounded-full ring-1',
                        done
                          ? 'bg-emerald-500/20 text-emerald-200 ring-emerald-500/25'
                          : 'bg-slate-900/40 text-slate-400 ring-slate-800/70',
                      )}
                    >
                      {done ? (
                        <IconCheck size={16} />
                      ) : (
                        <span className="block size-2 rounded-full bg-current opacity-70" />
                      )}
                    </div>
                    <div className="truncate text-sm font-semibold text-slate-100">
                      {item.label}
                    </div>
                  </div>
                  <div className="shrink-0 text-xs font-semibold text-slate-400">
                    {done ? 'Done' : 'Pending'}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}


