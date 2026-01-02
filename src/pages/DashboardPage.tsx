import { useMemo, useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  careerSnapshotMeta,
  dashboardHeader,
  journeyMeta,
  type JourneyKey,
} from '../constants/dashboard'
import { useUserProgress } from '../context/UserProgressContext'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../context/ProfileContext'
import { Button } from '../components/ui/Button'
import {
  IconBell,
  IconBook,
  IconGamepad,
  IconPin,
  IconSettings,
  IconHome,
  IconSearch,
  IconUser,
  IconArrowRight,
} from '../components/icons'
import { HeroProgressRing } from '../components/dashboard/HeroProgressRing'
import { TodaysFocusCard, type FocusTask } from '../components/dashboard/TodaysFocusCard'
import { JourneyTimeline, type JourneyStep } from '../components/dashboard/JourneyTimeline'
import { CareerSnapshot } from '../components/dashboard/CareerSnapshot'
import { Card } from '../components/ui/Card'
import { cn } from '../lib/cn'

export function DashboardPage() {
  const { progress } = useUserProgress()
  const { signOut } = useAuth()
  const { profile } = useProfile()
  const navigate = useNavigate()

  const careerTraits = useMemo(() => {
    if (!progress.psychometricCompleted) {
      // After a reset, we should not show demo traits. Show a "cleared" snapshot.
      return {
        realistic: 0,
        investigative: 0,
        artistic: 0,
        social: 0,
        enterprising: 0,
        conventional: 0,
      } as const
    }

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
    const values = Object.values(careerTraits)
    const allZero = values.every((v) => (Number.isFinite(v) ? v : 0) <= 0)
    if (allZero) return '—'

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

  // Get first 3 journey steps for the prominent display
  const firstThreeSteps = useMemo(() => {
    return journeySteps.slice(0, 3)
  }, [journeySteps])

  return (
    <div className="space-y-6">
      {/* Header: PATHFINDER Dashboard with navigation icons */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-50">PATHFINDER Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button type="button" variant="icon" aria-label="Home" className="text-slate-300 hover:text-slate-100">
            <IconHome size={20} />
          </Button>
          <Button type="button" variant="icon" aria-label="Search" className="text-slate-300 hover:text-slate-100">
            <IconSearch size={20} />
          </Button>
          <Button type="button" variant="icon" aria-label="Notifications" className="relative text-slate-300 hover:text-slate-100">
            <IconBell size={20} />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
              0
            </span>
          </Button>
          <Button type="button" variant="icon" aria-label="Settings" className="text-slate-300 hover:text-slate-100">
            <IconSettings size={20} />
          </Button>
          <Button type="button" variant="icon" aria-label="Profile" className="text-slate-300 hover:text-slate-100">
            <IconUser size={20} />
          </Button>
        </div>
      </header>

      {/* Top Section: 3 columns */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr_360px]">
        {/* Left: Journey Progress Ring */}
        <div className="flex justify-center rounded-2xl border border-slate-800/60 bg-slate-950/16 p-6 backdrop-blur-xl shadow-[0_0_55px_rgba(59,130,246,0.10)]">
          <HeroProgressRing value={roadmapPercent} label="Journey Complete" size={240} stroke={14} />
        </div>

        {/* Middle: User Profile and GaTCS Themes */}
        <div className="rounded-2xl border border-slate-800/60 bg-slate-950/16 p-6 backdrop-blur-xl">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300/70">
                <span>🔥</span>
                <span>WELCOME BACK</span>
              </div>
              <div className="mt-2 text-3xl font-bold tracking-tight text-slate-50">
                {profile?.full_name ?? 'Student'}
              </div>
              <div className="mt-2 text-sm text-slate-300/80">
                Top career type:{' '}
                <span className="font-semibold text-slate-100">{topCareerTypeLabel}</span>
              </div>
            </div>

            {/* Motivational Words Carousel */}
            <MotivationalCarousel />
          </div>
        </div>

        {/* Right: Today's Focus */}
        <TodaysFocusCard
          tasks={focusTasks}
          rewards={[
            { id: 'r1', type: 'count', value: '22' },
            { id: 'r2', type: 'trophy' },
            { id: 'r3', type: 'trophy' },
          ]}
        />
      </div>

      {/* Gamified Career Journey - 3 Step Progression */}
      <div className="rounded-2xl border border-slate-800/60 bg-slate-950/16 p-6 backdrop-blur-xl">
        <div className="mb-6 text-sm font-semibold text-slate-100">Gamified Career Journey</div>
        <div className="relative">
          {/* Progress bar background */}
          <div className="absolute left-0 right-0 top-12 h-1.5 rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-orange-500/20" />
          {/* Progress fill */}
          <div
            className="absolute left-0 top-12 h-1.5 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
            style={{ width: `${(firstThreeSteps.filter(s => s.done).length / firstThreeSteps.length) * 100}%` }}
          />
          
          {/* Steps */}
          <div className="relative grid grid-cols-3 gap-4">
            {firstThreeSteps.map((step, idx) => {
              const StepWrapper = step.locked ? 'div' : Link
              const wrapperProps = step.locked
                ? { className: 'group relative flex flex-col items-center cursor-not-allowed opacity-60' }
                : { to: step.to, className: 'group relative flex flex-col items-center' }
              
              return (
                <StepWrapper key={step.key} {...wrapperProps}>
                <div
                  className={cn(
                    'relative z-10 rounded-2xl border px-4 py-3 text-center text-sm font-semibold transition-all',
                    step.done
                      ? 'border-blue-500/40 bg-blue-600/20 text-blue-100 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                      : idx === 2
                        ? 'border-orange-500/40 bg-orange-600/20 text-orange-100 shadow-[0_0_20px_rgba(251,146,60,0.3)]'
                        : 'border-purple-500/40 bg-purple-600/20 text-purple-100 shadow-[0_0_20px_rgba(168,85,247,0.3)]',
                    !step.locked && 'group-hover:scale-105'
                  )}
                >
                  {step.label}
                  {idx === 2 && (
                    <span className="ml-2 rounded-full bg-orange-500/30 px-2 py-0.5 text-[10px] font-semibold text-orange-100">
                      New!
                    </span>
                  )}
                </div>
                <div className="mt-3 text-xs text-slate-400">
                  {step.done
                    ? 'Completed'
                    : step.locked
                      ? 'Locked'
                      : idx === 0
                        ? 'Upload your profile photo and basic information for a personalized experience.'
                        : idx === 1
                          ? 'Take the test to identify your RIASEC personality and progress.'
                          : 'Explore more career paths, specialization and career strategies.'}
                </div>
                </StepWrapper>
              )
            })}
          </div>
        </div>
      </div>

      {/* Bottom Section: 2 columns - Career Snapshot (larger) and RIASEC Profile */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        {/* Left: Career Snapshot - Takes up 2/3 of the space */}
        <div>
          <CareerSnapshot
            viewReportTo={progress.psychometricCompleted ? '/psychometric-test#results' : '/psychometric-test'}
            traits={careerSnapshotMeta.map((t) => ({
              key: t.key,
              label: t.label,
              value: careerTraits[t.key],
            }))}
            topCareerTypeLabel={topCareerTypeLabel}
          />
        </div>

        {/* Right: RIASEC Profile - Takes up 1/3 of the space */}
        <div>
          <RiasecProfileCard progress={progress} />
        </div>
      </div>
    </div>
  )
}


type RiasecProfileCardProps = {
  progress: {
    psychometricCompleted: boolean
    riasecPercentages: Record<string, number>
    psychometricResult: string
  }
}

function RiasecProfileCard({ progress }: RiasecProfileCardProps) {
  const topThree = useMemo(() => {
    if (!progress.psychometricCompleted) return []
    const sorted = Object.entries(progress.riasecPercentages || {})
      .map(([key, value]) => ({ key, value: Math.min(100, Math.max(0, value || 0)) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)
    return sorted
  }, [progress.psychometricCompleted, progress.riasecPercentages])

  const getRiasecLabel = (key: string) => {
    const labels: Record<string, string> = {
      R: 'Realistic',
      I: 'Investigative',
      A: 'Artistic',
      S: 'Social',
      E: 'Enterprising',
      C: 'Conventional',
    }
    return labels[key] || key
  }

  const getRiasecColor = (key: string) => {
    const colors: Record<string, { bg: string; border: string; glow: string; text: string }> = {
      R: { bg: 'bg-blue-600/20', border: 'border-blue-500/40', glow: 'rgba(59, 130, 246, 0.4)', text: 'text-blue-100' },
      I: { bg: 'bg-purple-600/20', border: 'border-purple-500/40', glow: 'rgba(168, 85, 247, 0.4)', text: 'text-purple-100' },
      A: { bg: 'bg-purple-600/20', border: 'border-purple-500/40', glow: 'rgba(168, 85, 247, 0.4)', text: 'text-purple-100' },
      S: { bg: 'bg-orange-600/20', border: 'border-orange-500/40', glow: 'rgba(251, 146, 60, 0.4)', text: 'text-orange-100' },
      E: { bg: 'bg-orange-600/20', border: 'border-orange-500/40', glow: 'rgba(251, 146, 60, 0.4)', text: 'text-orange-100' },
      C: { bg: 'bg-orange-600/20', border: 'border-orange-500/40', glow: 'rgba(251, 146, 60, 0.4)', text: 'text-orange-100' },
    }
    return colors[key] || colors.I
  }

  if (!progress.psychometricCompleted || topThree.length === 0) {
    return (
      <Card title="RIASEC Profile">
        <div className="text-center py-8 text-slate-400">
          Complete the psychometric test to see your RIASEC profile.
        </div>
      </Card>
    )
  }

  const primary = topThree[0]
  const secondary = topThree[1]
  const tertiary = topThree[2]

  return (
    <Card title="RIASEC Profile">
      <div className="space-y-4">
        <div className="text-xs text-slate-400">
          Your dominant personality traits based on your psychometric test.
        </div>
        <div className="grid grid-cols-3 gap-3">
          {primary && (() => {
            const colors = getRiasecColor(primary.key)
            return (
              <div
                className={cn(
                  'relative flex flex-col items-center justify-center rounded-2xl border p-5 shadow-lg backdrop-blur-sm',
                  colors.bg,
                  colors.border,
                )}
                style={{ boxShadow: `0 0 40px ${colors.glow}` }}
              >
                <div className={cn('text-4xl font-bold mb-1', colors.text)}>{primary.key}</div>
                <div className={cn('text-xs font-semibold text-center', colors.text)}>{getRiasecLabel(primary.key)}</div>
              </div>
            )
          })()}
          {secondary && (() => {
            const colors = getRiasecColor(secondary.key)
            return (
              <div
                className={cn(
                  'relative flex flex-col items-center justify-center rounded-2xl border p-5 shadow-lg backdrop-blur-sm',
                  colors.bg,
                  colors.border,
                )}
                style={{ boxShadow: `0 0 40px ${colors.glow}` }}
              >
                <div className={cn('text-4xl font-bold mb-1', colors.text)}>{secondary.key}</div>
                <div className={cn('text-xs font-semibold text-center', colors.text)}>{getRiasecLabel(secondary.key)}</div>
              </div>
            )
          })()}
          {tertiary && (() => {
            const colors = getRiasecColor(tertiary.key)
            return (
              <div
                className={cn(
                  'relative flex flex-col items-center justify-center rounded-2xl border p-5 shadow-lg backdrop-blur-sm',
                  colors.bg,
                  colors.border,
                )}
                style={{ boxShadow: `0 0 40px ${colors.glow}` }}
              >
                <div className={cn('text-4xl font-bold mb-1', colors.text)}>{tertiary.key}</div>
                <div className={cn('text-xs font-semibold text-center', colors.text)}>{getRiasecLabel(tertiary.key)}</div>
              </div>
            )
          })()}
        </div>
      </div>
    </Card>
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

function MotivationalCarousel() {
  const motivationalQuotes = [
    "Every expert was once a beginner. Every pro was once an amateur. Keep going! 💪",
    "Your career journey is unique. Trust the process and celebrate every step forward. 🌟",
    "The only way to do great work is to love what you do. Keep exploring! ✨",
    "Success is not final, failure is not fatal: it is the courage to continue that counts. 🚀",
    "Your potential is limitless. Every challenge you overcome makes you stronger. 💎",
    "The future belongs to those who believe in the beauty of their dreams. Dream big! 🌈",
  ]

  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  // Auto-rotate every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % motivationalQuotes.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [motivationalQuotes.length])

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const minSwipeDistance = 50

    if (distance > minSwipeDistance) {
      // Swipe left - next quote
      setCurrentIndex((prev) => (prev + 1) % motivationalQuotes.length)
    } else if (distance < -minSwipeDistance) {
      // Swipe right - previous quote
      setCurrentIndex((prev) => (prev - 1 + motivationalQuotes.length) % motivationalQuotes.length)
    }
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % motivationalQuotes.length)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + motivationalQuotes.length) % motivationalQuotes.length)
  }

  return (
    <div className="mt-6 rounded-2xl border border-slate-800/60 bg-slate-950/18 p-4">
      <div className="mb-3 text-sm font-semibold text-slate-100">Daily Motivation</div>
      <div
        className="relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Quote Container */}
        <div className="relative h-16">
          {motivationalQuotes.map((quote, index) => (
            <div
              key={index}
              className={cn(
                'absolute inset-0 flex items-center transition-all duration-500 ease-in-out',
                index === currentIndex
                  ? 'translate-x-0 opacity-100'
                  : index < currentIndex
                    ? '-translate-x-full opacity-0'
                    : 'translate-x-full opacity-0'
              )}
            >
              <p className="text-sm leading-relaxed text-slate-300">{quote}</p>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={goToPrevious}
            className="flex items-center justify-center rounded-lg border border-slate-800/60 bg-slate-950/20 p-2 text-slate-400 transition-colors hover:bg-slate-950/30 hover:text-slate-200"
            aria-label="Previous quote"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center gap-2">
            {motivationalQuotes.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  'h-2 rounded-full transition-all',
                  index === currentIndex
                    ? 'w-6 bg-blue-500'
                    : 'w-2 bg-slate-700/50 hover:bg-slate-600/50'
                )}
                aria-label={`Go to quote ${index + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={goToNext}
            className="flex items-center justify-center rounded-lg border border-slate-800/60 bg-slate-950/20 p-2 text-slate-400 transition-colors hover:bg-slate-950/30 hover:text-slate-200"
            aria-label="Next quote"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}


