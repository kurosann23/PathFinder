import { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  careerSnapshotMeta,
  journeyMeta,
  type JourneyKey,
} from '../constants/dashboard'
import { useAuth } from '../context/AuthContext'
import { useUserProgress } from '../context/UserProgressContext'
import { useProfile } from '../context/ProfileContext'
import { useTheme } from '../context/ThemeContext'
import { useTranslation } from '../context/LanguageContext'
import { HeroProgressRing } from '../components/dashboard/HeroProgressRing'
import { type JourneyStep } from '../components/dashboard/JourneyTimeline'
import { CareerSnapshot } from '../components/dashboard/CareerSnapshot'
import { DashboardProfileCard } from '../components/dashboard/DashboardProfileCard'
import { Card } from '../components/ui/Card'
import { OnboardingGuide } from '../components/dashboard/OnboardingGuide'
import { IconQuestion } from '../components/icons'
import { cn } from '../lib/cn'

export function DashboardPage() {
  const { user } = useAuth()
  const { progress, isHydrating, checkProfileCompletion } = useUserProgress()
  const { profile, loading: profileLoading } = useProfile()
  const { t } = useTranslation()
  const { theme } = useTheme()
  const isLight = theme === 'light'
  
  const [guideOpen, setGuideOpen] = useState(false)

  // Auto-open guide for new users
  useEffect(() => {
    if (user?.id) {
      const hasSeenGuide = localStorage.getItem(`pathfinder_onboarding_completed_${user.id}`)
      if (!hasSeenGuide) {
        const timer = setTimeout(() => setGuideOpen(true), 500)
        return () => clearTimeout(timer)
      }
    }
  }, [user?.id])

  // Ensure profile completion status is accurate when visiting dashboard
  useEffect(() => {
    if (!isHydrating) {
      checkProfileCompletion()
    }
  }, [isHydrating, checkProfileCompletion])

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

  const journeySteps: JourneyStep[] = useMemo(() => {
    return journeyMeta.map((j, idx) => {
      const to =
        j.key === 'profile'
          ? '/dashboard#profile'
          : j.key === 'psychometric'
            ? '/psychometric-test'
            : j.key === 'course'
              ? '/course-recommendations'
              : j.key === 'appointment'
                ? '/appointment'
                : j.key === 'futureRole'
                  ? '/psychometric-test'
                  : '/dashboard#profile'

      const icon: JourneyStep['icon'] =
        j.key === 'profile'
          ? 'profile'
          : j.key === 'psychometric'
            ? 'psychometric'
            : j.key === 'course'
              ? 'course'
              : j.key === 'futureRole'
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

  // Get first 4 journey steps for the prominent display
  const visibleSteps = useMemo(() => {
    return journeySteps.slice(0, 4)
  }, [journeySteps])

  // Show loading state while data is being fetched
  if (isHydrating || profileLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div
            className={cn(
              'mb-2 text-sm',
              isLight ? 'text-slate-600' : 'text-slate-400',
            )}
          >
            Loading dashboard...
          </div>
          <div
            className={cn(
              'text-xs',
              isLight ? 'text-slate-500' : 'text-slate-500',
            )}
          >
            Please wait
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10 pb-10">
      <OnboardingGuide isOpen={guideOpen} onClose={() => setGuideOpen(false)} />
      {/* Header: PATHFINDER Dashboard */}
      <header className="flex items-center justify-between">
        <h1 className={cn('text-2xl font-semibold', isLight ? 'text-slate-900' : 'text-slate-50')}>
          PATHFINDER Dashboard
        </h1>
        <button
          onClick={() => setGuideOpen(true)}
          className={cn(
            "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300",
            isLight
              ? "bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 hover:text-blue-600 hover:ring-blue-200"
              : "bg-slate-900 text-slate-400 ring-1 ring-slate-800 hover:text-blue-400 hover:ring-blue-900"
          )}
        >
          <IconQuestion size={18} />
          <span>Guide</span>
        </button>
      </header>

      {/* Top Section: 3 columns */}
      <div className={cn(
        'grid grid-cols-1 gap-12 rounded-3xl p-6',
        isLight 
          ? 'bg-gradient-to-br from-blue-50/50 via-slate-50/30 to-blue-50/30' 
          : ''
      )}>
        <div className={cn('grid grid-cols-1 gap-4 lg:grid-cols-[320px_2fr_320px]', isLight && 'lg:gap-6')}>
        {/* Left: Journey Progress Ring */}
        <div className={cn(
          'flex flex-col justify-center rounded-2xl border p-6 backdrop-blur-xl',
          isLight 
            ? 'border-blue-100/60 bg-white shadow-lg' 
            : 'border-slate-800/60 bg-slate-950/16 shadow-[0_0_55px_rgba(59,130,246,0.10)]'
        )}>
          <div className="mb-4 text-center">
            <h3 className={cn(
              'text-base font-bold',
              isLight ? 'text-slate-900' : 'text-slate-100'
            )}>
              {t('dashboard.careerJourneyProgress')}
            </h3>
            <p className={cn(
              'mt-1 text-xs',
              isLight ? 'text-slate-600' : 'text-slate-400'
            )}>
              {t('dashboard.keepGoing')}
            </p>
          </div>
          <div className="flex justify-center">
            <HeroProgressRing value={roadmapPercent} label={t('dashboard.journeyComplete')} size={240} stroke={14} />
          </div>
        </div>

        {/* Middle: User Profile and GaTCS Themes */}
        <div className={cn(
          'rounded-2xl border p-6 backdrop-blur-xl',
          isLight 
            ? 'border-blue-100/60 bg-white shadow-lg' 
            : 'border-slate-800/60 bg-slate-950/16'
        )}>
          <div className="space-y-5">
            <div className={cn(
              'rounded-xl p-5',
              isLight 
                ? 'bg-gradient-to-br from-blue-50/80 to-blue-100/40' 
                : ''
            )}>
              <div className={cn(
                'flex items-center gap-2 text-xs font-semibold uppercase tracking-wider',
                isLight ? 'text-slate-600' : 'text-slate-300/70'
              )}>
                <span>🔥</span>
                <span>WELCOME BACK</span>
              </div>
              <div className={cn(
                'mt-3 text-3xl font-bold tracking-tight',
                isLight ? 'text-slate-900' : 'text-slate-50'
              )}>
                {profile?.full_name ?? 'Student'}
              </div>
              <div className="mt-3">
                <span className={cn(
                  'inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold',
                  isLight 
                    ? 'bg-blue-100 text-blue-800 border border-blue-200/60' 
                    : 'text-slate-300/80'
                )}>
                  {t('dashboard.topCareerType')} {topCareerTypeLabel}
                </span>
              </div>
            </div>

            {/* Motivational Words Carousel */}
            <MotivationalCarousel />
          </div>
        </div>

        {/* Right: Profile Card */}
        <DashboardProfileCard />
        </div>
      </div>

      {/* Gamified Career Journey - 4 Step Progression */}
      <div className={cn(
        'rounded-2xl border p-6 backdrop-blur-xl',
        isLight 
          ? 'border-slate-200 bg-white shadow-md' 
          : 'border-slate-800/60 bg-slate-950/16'
      )}>
        <div className={cn('mb-6 text-sm font-semibold', isLight ? 'text-slate-900' : 'text-slate-100')}>{t('dashboard.gamifiedCareerJourney')}</div>
        
        {/* Scrollable container for responsiveness */}
        <div className="overflow-x-auto py-4">
          <div className="relative min-w-[768px] px-2">
            {/* Progress bar background */}
            <div className={cn(
              "absolute left-0 right-0 top-[88px] h-2 rounded-full",
              isLight ? "bg-slate-100" : "bg-slate-800"
            )} />
            
            {/* Progress fill */}
            <div
              className={cn(
                'absolute left-0 top-[88px] h-2 rounded-full transition-all duration-1000 ease-out z-0',
                isLight 
                  ? 'bg-blue-500 shadow-sm' 
                  : 'bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
              )}
              style={{ width: `${(visibleSteps.filter(s => s.done).length / visibleSteps.length) * 100}%` }}
            >
              {/* Arrow Indicator */}
              <div className={cn(
                "absolute -right-2 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full p-1 shadow-sm",
                isLight ? "bg-blue-500" : "bg-orange-500"
              )}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-white ml-0.5">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </div>
            
            {/* Steps */}
            <div className="relative grid grid-cols-4 gap-8">
              {visibleSteps.map((step, idx) => {
                const isLocked = step.locked
                return (
                  <Link
                    key={step.key}
                    to={isLocked ? '#' : step.to}
                    className={cn(
                      'group relative flex flex-col items-center',
                      isLocked && 'cursor-not-allowed opacity-60 pointer-events-none',
                    )}
                  >
                  <div
                    className={cn(
                      'relative z-10 w-full h-[72px] flex items-center justify-center rounded-2xl border px-2 text-center text-sm font-semibold transition-all',
                      step.done
                        ? isLight
                          ? 'border-blue-500/50 bg-blue-50 text-blue-700 shadow-sm'
                          : 'border-blue-500/40 bg-blue-600/20 text-blue-100 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                        : idx >= 2
                          ? isLight
                            ? 'border-blue-500/30 bg-white text-slate-700 border-2'
                            : 'border-orange-500/40 bg-orange-600/20 text-orange-100 shadow-[0_0_20px_rgba(251,146,60,0.3)]'
                          : isLight
                            ? 'border-slate-300 bg-white text-slate-700'
                            : 'border-purple-500/40 bg-purple-600/20 text-purple-100 shadow-[0_0_20px_rgba(168,85,247,0.3)]',
                      !isLocked && 'group-hover:scale-105'
                    )}
                  >
                    <div className="flex items-center justify-center gap-2">
                    {step.done && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    {step.label}
                    {idx === 2 && (
                        <span className={cn(
                          'shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                          isLight ? 'bg-emerald-500/20 text-emerald-700' : 'bg-orange-500/30 text-orange-100'
                        )}>
                          New!
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={cn('mt-10 text-center text-xs leading-relaxed px-2', isLight ? 'text-slate-600' : 'text-slate-400')}>
                    {step.done
                      ? 'Completed'
                    : step.locked
                      ? 'Locked'
                      : idx === 0
                        ? 'Upload your profile photo and basic information.'
                        : idx === 1
                          ? 'Identify your RIASEC personality.'
                          : idx === 2
                            ? 'Explore career paths and strategies.'
                            : 'Book a session for guidance.'}
                </div>
                </Link>
              )
            })}
            </div>
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
  const { theme } = useTheme()
  const isLight = theme === 'light'
  
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
    if (isLight) {
      const lightColors: Record<string, { bg: string; border: string; glow: string; text: string }> = {
        R: { bg: 'bg-blue-50', border: 'border-blue-200', glow: 'rgba(59, 130, 246, 0.2)', text: 'text-blue-700' },
        I: { bg: 'bg-emerald-50', border: 'border-emerald-200', glow: 'rgba(16, 185, 129, 0.2)', text: 'text-emerald-700' },
        A: { bg: 'bg-amber-50', border: 'border-amber-200', glow: 'rgba(245, 158, 11, 0.2)', text: 'text-amber-700' },
        S: { bg: 'bg-orange-50', border: 'border-orange-200', glow: 'rgba(251, 146, 60, 0.2)', text: 'text-orange-700' },
        E: { bg: 'bg-purple-50', border: 'border-purple-200', glow: 'rgba(168, 85, 247, 0.2)', text: 'text-purple-700' },
        C: { bg: 'bg-slate-50', border: 'border-slate-200', glow: 'rgba(148, 163, 184, 0.2)', text: 'text-slate-700' },
      }
      return lightColors[key] || lightColors.I
    }
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
        <div className={cn('text-xs', isLight ? 'text-slate-600' : 'text-slate-400')}>
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

function MotivationalCarousel() {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  
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
    <div className={cn(
      'relative pl-4',
      isLight 
        ? '' 
        : 'mt-6 rounded-2xl border border-slate-800/60 bg-slate-950/18 p-4'
    )}>
      {/* Left accent line for light mode */}
      {isLight && (
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-full bg-gradient-to-b from-blue-400 to-blue-500" />
      )}
      
      <div className={cn(
        'mb-3 text-sm font-semibold',
        isLight ? 'text-slate-700' : 'text-slate-100'
      )}>
        Daily Motivation
      </div>
      <div
        className="relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Quote Container */}
        <div className={cn('relative', isLight ? 'h-20' : 'h-16')}>
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
              <p className={cn(
                'leading-relaxed',
                isLight ? 'text-base text-slate-800' : 'text-sm text-slate-300'
              )}>
                {quote}
              </p>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={goToPrevious}
            className={cn(
              'flex items-center justify-center rounded-lg p-2 transition-colors',
              isLight
                ? 'border border-slate-200 bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'
                : 'border border-slate-800/60 bg-slate-950/20 text-slate-400 hover:bg-slate-950/30 hover:text-slate-200'
            )}
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
                    ? isLight ? 'w-6 bg-blue-500' : 'w-6 bg-blue-500'
                    : isLight ? 'w-2 bg-slate-300 hover:bg-slate-400' : 'w-2 bg-slate-700/50 hover:bg-slate-600/50'
                )}
                aria-label={`Go to quote ${index + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={goToNext}
            className={cn(
              'flex items-center justify-center rounded-lg p-2 transition-colors',
              isLight
                ? 'border border-slate-200 bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'
                : 'border border-slate-800/60 bg-slate-950/20 text-slate-400 hover:bg-slate-950/30 hover:text-slate-200'
            )}
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


