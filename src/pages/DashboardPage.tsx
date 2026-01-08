import { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  careerSnapshotMeta,
  journeyMeta,
  type JourneyKey,
} from '../constants/dashboard'
import { useUserProgress } from '../context/UserProgressContext'
import { useProfile } from '../context/ProfileContext'
import { useTheme } from '../context/ThemeContext'
import { useTranslation } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import { HeroProgressRing } from '../components/dashboard/HeroProgressRing'
import { type JourneyStep } from '../components/dashboard/JourneyTimeline'
import { CareerSnapshot } from '../components/dashboard/CareerSnapshot'
import { DashboardProfileCard } from '../components/dashboard/DashboardProfileCard'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { cn } from '../lib/cn'

export function DashboardPage() {
  const { progress, isHydrating, markProfileCompleted } = useUserProgress()
  const { profile, loading: profileLoading } = useProfile()
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { user } = useAuth()
  const isLight = theme === 'light'
  const guideStorageKey = user ? `pathfinder_dashboard_guide_seen_${user.id}` : null
  const [showGuide, setShowGuide] = useState(false)
  const [guideInitialized, setGuideInitialized] = useState(false)

  // Sync profile completion status when profile loads
  useEffect(() => {
    if (!profileLoading && profile?.full_name && profile?.avatar_url && !progress.journey.profile) {
      markProfileCompleted()
    }
  }, [profile, profileLoading, progress.journey.profile, markProfileCompleted])

  // Show the dashboard guide on first login and allow reopening via button.
  useEffect(() => {
    if (!guideStorageKey || isHydrating) return
    const alreadySeen = typeof window !== 'undefined' && localStorage.getItem(guideStorageKey) === 'true'
    setShowGuide(!alreadySeen)
    setGuideInitialized(true)
  }, [guideStorageKey, isHydrating])

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
      const prevKey = journeyMeta[idx - 1]?.key as JourneyKey | undefined
      const prevDone = idx === 0 ? true : Boolean(prevKey && progress.journey[prevKey])
      const rawDone = Boolean(progress.journey[j.key as JourneyKey])
      const done = rawDone && prevDone

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

      const locked = idx !== 0 && !prevDone

      return {
        key: j.key,
        label: j.label,
        to,
        done,
        locked,
        icon,
      }
    })
  }, [progress.journey])

  const roadmapPercent = useMemo(() => {
    const done = journeySteps.filter((step) => step.done).length
    return Math.round((done / journeySteps.length) * 100)
  }, [journeySteps])

  // Get first 4 journey steps for the prominent display
  const visibleSteps = useMemo(() => {
    return journeySteps.slice(0, 4)
  }, [journeySteps])

  const handleGuideClose = () => {
    setShowGuide(false)
    if (guideStorageKey) {
      localStorage.setItem(guideStorageKey, 'true')
    }
  }

  const handleGuideOpen = () => {
    setShowGuide(true)
  }

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
      {/* Header: PATHFINDER Dashboard */}
      <header className="flex items-center justify-between gap-4">
        <h1 className={cn('text-2xl font-semibold', isLight ? 'text-slate-900' : 'text-slate-50')}>
          PATHFINDER Dashboard
        </h1>
        {guideInitialized && (
          <Button variant="secondary" size="sm" onClick={handleGuideOpen} className="text-sm">
            Dashboard Guide
          </Button>
        )}
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

      {guideInitialized && showGuide && <DashboardGuide onClose={handleGuideClose} />}
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

type DashboardGuideProps = {
  onClose: () => void
}

function DashboardGuide({ onClose }: DashboardGuideProps) {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    { 
      title: 'Complete Your Profile', 
      detail: 'Upload a profile photo and fill in your basic information to unlock your career journey.',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    { 
      title: 'Take Psychometric Test', 
      detail: 'Discover your RIASEC personality type through a simple questionnaire. This helps identify careers that match your interests.',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      ),
    },
    { 
      title: 'Explore Recommendations', 
      detail: 'Based on your test results, explore personalized course recommendations and career paths tailored just for you.',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      ),
    },
    { 
      title: 'Book an Appointment', 
      detail: 'Schedule a one-on-one session with your teacher to discuss your results and plan your next steps together.',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
  ]

  const isLastStep = currentStep === steps.length - 1
  const step = steps[currentStep]

  const handleNext = () => {
    if (isLastStep) {
      onClose()
    } else {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1))
  }

  const handleSkip = () => {
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className={cn(
        "w-full max-w-md rounded-3xl border p-6 shadow-2xl overflow-hidden",
        isLight 
          ? "border-slate-200 bg-white" 
          : "border-slate-800/80 bg-slate-950/95"
      )}>
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  idx === currentStep 
                    ? "w-8 bg-blue-500" 
                    : idx < currentStep 
                      ? "w-4 bg-blue-400" 
                      : isLight ? "w-4 bg-slate-200" : "w-4 bg-slate-700"
                )}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={handleSkip}
            className={cn(
              "text-xs font-medium transition-colors",
              isLight ? "text-slate-500 hover:text-slate-700" : "text-slate-400 hover:text-slate-200"
            )}
          >
            Skip
          </button>
        </div>

        {/* Step content with slide animation */}
        <div className="relative min-h-[280px]">
          <div
            key={currentStep}
            className="animate-fade-in-slide"
          >
            {/* Icon */}
            <div className={cn(
              "flex h-16 w-16 items-center justify-center rounded-2xl mb-5 mx-auto",
              isLight 
                ? "bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600" 
                : "bg-gradient-to-br from-blue-600/20 to-blue-500/10 text-blue-400"
            )}>
              {step.icon}
            </div>

            {/* Step number */}
            <div className={cn(
              "text-center text-xs font-semibold uppercase tracking-wider mb-2",
              isLight ? "text-blue-600" : "text-blue-400"
            )}>
              Step {currentStep + 1} of {steps.length}
            </div>

            {/* Title */}
            <h2 className={cn(
              "text-center text-xl font-bold mb-3",
              isLight ? "text-slate-900" : "text-slate-50"
            )}>
              {step.title}
            </h2>

            {/* Description */}
            <p className={cn(
              "text-center text-sm leading-relaxed mb-6",
              isLight ? "text-slate-600" : "text-slate-400"
            )}>
              {step.detail}
            </p>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 0}
            className={cn(
              "rounded-xl px-5 py-2.5 text-sm font-semibold transition-all disabled:opacity-0",
              isLight 
                ? "border border-slate-200 text-slate-700 hover:bg-slate-50" 
                : "border border-slate-700 text-slate-300 hover:bg-slate-800"
            )}
          >
            Back
          </button>

          <button
            type="button"
            onClick={handleNext}
            className={cn(
              "rounded-xl px-6 py-2.5 text-sm font-semibold transition-all",
              isLight 
                ? "bg-blue-500 text-white hover:bg-blue-600 shadow-md" 
                : "bg-blue-600/20 text-blue-100 ring-1 ring-blue-500/25 hover:bg-blue-600/30"
            )}
          >
            {isLastStep ? 'Get Started!' : 'Next'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fade-in-slide {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fade-in-slide {
          animation: fade-in-slide 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}


