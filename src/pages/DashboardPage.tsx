import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  careerSnapshotMeta,
  dashboardHeader,
  initialCareerTraits,
  journeyMeta,
  type JourneyKey,
} from '../constants/dashboard'
import { useUserProgress } from '../context/UserProgressContext'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../context/ProfileContext'
import { PageHeader } from '../components/PageHeader'
import { Button } from '../components/ui/Button'
import { cn } from '../lib/cn'
import {
  IconBell,
  IconBook,
  IconGamepad,
  IconPin,
  IconSettings,
  IconTarget,
} from '../components/icons'
import { HeroProgressRing } from '../components/dashboard/HeroProgressRing'
import { TodaysFocusCard, type FocusTask } from '../components/dashboard/TodaysFocusCard'
import { JourneyTimeline, type JourneyStep } from '../components/dashboard/JourneyTimeline'
import { CareerSnapshot } from '../components/dashboard/CareerSnapshot'

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

export function DashboardPage() {
  const { progress } = useUserProgress()
  const { signOut } = useAuth()
  const { profile } = useProfile()
  const navigate = useNavigate()

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

  const roadmapPercent = useMemo(() => {
    const keys = journeyMeta.map((j) => j.key)
    const done = keys.filter((k) => Boolean(progress.journey[k])).length
    return Math.round((done / keys.length) * 100)
  }, [progress.journey])

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

  const focusTasks: FocusTask[] = useMemo(() => {
    // Keep the focus card stable and informative: show the first 2 journey steps,
    // reflecting their real completion status (completed vs locked).
    const items = journeyMeta
      .slice(0, 2)
      .map((j) => {
        const to =
          j.key === 'profile'
            ? '/profile'
            : j.key === 'psychometric'
              ? '/psychometric-test'
              : j.key === 'course'
                ? '/course-recommendation'
                : j.key === 'roadmap'
                  ? '/learning-roadmap'
                  : '/mini-games'

        const subtitle =
          progress.journey[j.key as JourneyKey]
            ? 'Completed'
            : j.key === 'psychometric'
              ? 'Start'
              : j.key === 'course'
                ? 'Go'
                : 'Start'

        return {
          id: j.key,
          title: j.label,
          subtitle,
          to,
          done: Boolean(progress.journey[j.key as JourneyKey]),
          xp: 50,
        }
      })

    return items
  }, [progress.journey])

  const journeySteps: JourneyStep[] = useMemo(() => {
    return journeyMeta.map((j) => {
      const to =
        j.key === 'profile'
          ? '/profile'
          : j.key === 'psychometric'
            ? '/psychometric-test'
            : j.key === 'course'
              ? '/course-recommendation'
              : j.key === 'roadmap'
                ? '/learning-roadmap'
                : '/mini-games'

      const icon =
        j.key === 'profile'
          ? 'profile'
          : j.key === 'psychometric'
            ? 'psychometric'
            : j.key === 'course'
              ? 'course'
              : j.key === 'roadmap'
                ? 'roadmap'
                : 'games'

      return {
        key: j.key,
        label: j.label,
        to,
        done: Boolean(progress.journey[j.key as JourneyKey]),
        icon,
      }
    })
  }, [progress.journey])

  return (
    <div className="space-y-6">
      <PageHeader
        title={dashboardHeader.title}
        subtitle={dashboardHeader.subtitle}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[360px_1fr_360px]">
        <div className="flex justify-center rounded-2xl border border-slate-800/60 bg-slate-950/16 p-6 backdrop-blur-xl">
          <HeroProgressRing value={roadmapPercent} label="Journey Complete" size={300} />
        </div>

        <div className="rounded-2xl border border-slate-800/60 bg-slate-950/16 p-6 backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300/70">
                Welcome back
              </div>
              <div className="mt-2 truncate text-4xl font-semibold tracking-tight text-slate-50">
                {profile?.full_name ?? 'Student'}
              </div>
              <div className="mt-3 text-sm text-slate-300/80">
                Top career type:{' '}
                <span className="font-semibold text-slate-100">{topCareerTypeLabel}</span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <Button type="button" variant="icon" aria-label="Notifications (UI only)">
                  <IconBell size={18} />
                </Button>
                <Button type="button" variant="icon" aria-label="Settings (UI only)">
                  <IconSettings size={18} />
                </Button>
              </div>

              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={async () => {
                  await signOut()
                  navigate('/login', { replace: true })
                }}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>

        <TodaysFocusCard
          tasks={focusTasks}
          rewards={[
            { id: 'r1', type: 'count', value: '22' },
            { id: 'r2', type: 'bolt' },
            { id: 'r3', type: 'medal' },
            { id: 'r4', type: 'trophy' },
          ]}
        />
      </div>

      <JourneyTimeline
        steps={journeySteps}
        progressPercent={roadmapPercent}
        avatarUrl={profile?.avatar_url ?? null}
        avatarFallback={profile?.full_name ?? 'U'}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CareerSnapshot
          viewReportTo={progress.psychometricCompleted ? '/psychometric-test#results' : '/psychometric-test'}
          traits={careerSnapshotMeta.map((t) => ({
            key: t.key,
            label: t.label,
            value: careerTraits[t.key],
          }))}
          topCareerTypeLabel={topCareerTypeLabel}
        />

        <div className="rounded-2xl border border-slate-800/60 bg-slate-950/16 p-6 backdrop-blur-xl">
          <div className="text-sm font-semibold text-slate-100">Quick Actions</div>
          <div className="mt-4 grid grid-cols-1 gap-2">
            <Link to="/psychometric-test" className={cn('rounded-2xl border border-slate-800/60 bg-slate-950/18 px-4 py-3 hover:bg-slate-950/26')}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded-full border border-slate-800/60 bg-slate-950/20 text-blue-200">
                    <IconTarget size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-100">Psychometric Test</div>
                    <div className="mt-0.5 text-xs text-slate-400">Open / view results</div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-300/70">→</span>
              </div>
            </Link>
            <Link to="/learning-roadmap" className={cn('rounded-2xl border border-slate-800/60 bg-slate-950/18 px-4 py-3 hover:bg-slate-950/26')}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded-full border border-slate-800/60 bg-slate-950/20 text-blue-200">
                    <IconPin size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-100">Learning Roadmap</div>
                    <div className="mt-0.5 text-xs text-slate-400">Continue your journey</div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-300/70">→</span>
              </div>
            </Link>
            <Link to="/course-recommendation" className={cn('rounded-2xl border border-slate-800/60 bg-slate-950/18 px-4 py-3 hover:bg-slate-950/26')}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded-full border border-slate-800/60 bg-slate-950/20 text-blue-200">
                    <StatIcon icon="book" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-100">Course Recommendation</div>
                    <div className="mt-0.5 text-xs text-slate-400">Explore suggested paths</div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-300/70">→</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}


