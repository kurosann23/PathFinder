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
} from '../components/icons'
import { HeroProgressRing } from '../components/dashboard/HeroProgressRing'
import { TodaysFocusCard, type FocusTask } from '../components/dashboard/TodaysFocusCard'
import { JourneyTimeline, type JourneyStep } from '../components/dashboard/JourneyTimeline'
import { CareerSnapshot } from '../components/dashboard/CareerSnapshot'

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

  const meaning = useMemo(() => getMeaning(topCareerTypeLabel), [topCareerTypeLabel])

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
    return journeyMeta.map((j, idx) => {
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

      const locked =
        idx === 0
          ? false
          : !progress.journey[journeyMeta[idx - 1].key as JourneyKey] &&
            !progress.journey[j.key as JourneyKey]

      return {
        key: j.key,
        label: j.label,
        to,
        done: Boolean(progress.journey[j.key as JourneyKey]),
        locked,
        icon,
      }
    })
  }, [progress.journey])

  return (
    <div className="space-y-5 md:space-y-6">
      <PageHeader
        title={dashboardHeader.title}
        // Matches the reference: cleaner top area with right-side actions
        subtitle={undefined}
        right={
          <div className="flex items-center gap-2">
            <Button type="button" variant="icon" aria-label="Search (UI only)">
              <SearchIcon />
            </Button>
            <Button type="button" variant="icon" aria-label="Messages (UI only)">
              <MailIcon />
            </Button>
            <Button type="button" variant="icon" aria-label="Notifications (UI only)">
              <IconBell size={18} />
            </Button>

            <Link
              to="/profile"
              className={cn(
                'ml-1 flex items-center gap-2 rounded-2xl border border-slate-800/60 bg-slate-950/25 px-2.5 py-1.5',
                'backdrop-blur-xl hover:bg-slate-950/35',
              )}
              aria-label="Open profile"
            >
              <span className="grid size-9 place-items-center overflow-hidden rounded-full border border-slate-800/60 bg-slate-950/40 text-sm font-semibold text-slate-100">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  (profile?.full_name ?? 'U').slice(0, 1).toUpperCase()
                )}
              </span>
              <span className="hidden max-w-[160px] truncate text-sm font-semibold text-slate-100 sm:block">
                {profile?.full_name ?? 'Student'}
              </span>
              <ChevronDownIcon />
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[360px_1fr_360px]">
        <div className="flex justify-center rounded-2xl border border-slate-800/60 bg-slate-950/16 p-4 backdrop-blur-xl shadow-[0_0_55px_rgba(59,130,246,0.10)]">
          <HeroProgressRing value={roadmapPercent} label="Journey Complete" size={290} stroke={14} />
        </div>

        <div className="rounded-2xl border border-slate-800/60 bg-slate-950/16 p-5 backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300/70">
                Welcome back <span aria-hidden="true">👋</span>
              </div>
              <div className="mt-2 truncate text-3xl font-semibold tracking-tight text-slate-50 md:text-4xl">
                {profile?.full_name ?? 'Student'}
              </div>
              <div className="mt-3 text-sm text-slate-300/80">
                Top career type:{' '}
                <span className="font-semibold text-slate-100">{topCareerTypeLabel}</span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
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

          {/* Small glass info card (matches the reference's inner card) */}
          <div className="mt-6 rounded-2xl border border-slate-800/60 bg-slate-950/18 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-100">Garc’s Thumers</div>
                <div className="mt-1 text-xs text-slate-400">
                  Your personalized hub is getting smarter as you complete more steps.
                </div>
              </div>
              <button
                type="button"
                aria-label="More (UI only)"
                className="rounded-xl border border-slate-800/60 bg-slate-950/25 px-2 py-1 text-xs font-semibold text-slate-300 hover:bg-slate-950/35"
              >
                •••
              </button>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-5 text-[11px] font-semibold text-slate-300/70">
              <span className="flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-xl border border-slate-800/60 bg-slate-950/20 text-blue-200">
                  <IconPin size={16} />
                </span>
                Locked
              </span>
              <span className="flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-xl border border-slate-800/60 bg-slate-950/20 text-blue-200">
                  <IconBook size={16} />
                </span>
                Locked
              </span>
              <span className="flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-xl border border-slate-800/60 bg-slate-950/20 text-blue-200">
                  <IconGamepad size={16} />
                </span>
                Locked
              </span>
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

        <div className="rounded-2xl border border-slate-800/60 bg-slate-950/16 p-5 backdrop-blur-xl">
          <div className="text-sm font-semibold text-slate-100">What this means for you</div>
          <div className="mt-3 text-sm font-semibold text-slate-100">{meaning.title}</div>
          <div className="mt-2 text-sm leading-relaxed text-slate-300/80">{meaning.body}</div>

          <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-slate-800/60 bg-slate-950/18 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <span className="grid size-8 place-items-center rounded-full border border-slate-800/60 bg-slate-950/25">
                <span className="text-[13px]">⛁</span>
              </span>
              <span className="tabular-nums">127</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <span className="grid size-8 place-items-center rounded-full border border-slate-800/60 bg-slate-950/25">
                <span className="text-[13px]">◎</span>
              </span>
              <span className="tabular-nums">107</span>
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                HAMMED
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M21 21l-4.3-4.3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 7.5 12 12l5.5-4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-slate-300/80">
      <path
        d="m6 9 6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function getMeaning(topCareerTypeLabel: string) {
  const copy: Record<string, { title: string; body: string }> = {
    Conventional: {
      title: 'Well-organized and detail-oriented',
      body: 'You excel in structured environments and enjoy working with data and systems. Consider roles in office administration, operations, analysis, or finance.',
    },
    Investigative: {
      title: 'Analytical and curious',
      body: 'You thrive on problem-solving and learning. Roles involving research, engineering, data, or troubleshooting are often a strong match.',
    },
    Artistic: {
      title: 'Creative and expressive',
      body: 'You enjoy creating, exploring ideas, and producing original work. Roles involving design, content, UX, or creative tech often fit well.',
    },
    Social: {
      title: 'People-focused and supportive',
      body: 'You enjoy helping others learn and grow. Roles involving teaching, collaboration, community, or user success often fit well.',
    },
    Enterprising: {
      title: 'Ambitious and persuasive',
      body: 'You enjoy leading, initiating, and turning ideas into action. Roles involving product, business, marketing, or entrepreneurship often fit well.',
    },
    Realistic: {
      title: 'Hands-on and practical',
      body: 'You prefer building and doing. Roles involving technical implementation, systems, hardware, or applied engineering often fit well.',
    },
  }

  return (
    copy[topCareerTypeLabel] ?? {
      title: 'Your strengths are emerging',
      body: 'Complete the psychometric test to unlock a personalized interpretation and a clearer direction for your next steps.',
    }
  )
}


