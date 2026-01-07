import { Link } from 'react-router-dom'
import { useEffect, useState, useCallback } from 'react'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/PageHeader'
import { useUserProgress } from '../context/UserProgressContext'
import { useTheme } from '../context/ThemeContext'
import { useTranslation } from '../context/LanguageContext'
import { cn } from '../lib/cn'
import { IconX, IconChevronDown, IconArrowRight, IconBook, IconWrench, IconSettings, IconBriefcase, IconUsers, IconTarget, IconLightbulb } from '../components/icons'
import { fetchCoursesByType, courseRowToUI } from '../lib/coursesRepo'

// Activity options for the interactive section
const activityOptions = [
  {
    id: 'projects',
    title: 'Real-world Projects',
    icon: IconBriefcase,
    color: 'blue',
    description: "Engage in comprehensive projects that mirror actual industry challenges. You'll take ownership of tasks from conception to delivery, building a portfolio that showcases your practical skills."
  },
  {
    id: 'labs',
    title: 'Interactive Labs',
    icon: IconWrench,
    color: 'emerald',
    description: "Participate in hands-on sessions using professional-grade tools and software. These guided exercises help you master technical workflows and troubleshooting techniques safely."
  },
  {
    id: 'collaboration',
    title: 'Team Collaboration',
    icon: IconUsers,
    color: 'purple',
    description: "Work alongside peers to solve complex problems. You'll develop essential soft skills like communication, conflict resolution, and agile project management in a simulated work environment."
  }
]

// Course icon component
function CourseIcon({ riasecType, className }: { riasecType: string; className?: string }) {
  const colors = {
    R: 'text-blue-500',
    I: 'text-purple-500',
    A: 'text-pink-500',
    S: 'text-orange-500',
    E: 'text-emerald-500',
    C: 'text-cyan-500',
  }
  const bgColors = {
    R: 'bg-blue-500',
    I: 'bg-purple-500',
    A: 'bg-pink-500',
    S: 'bg-orange-500',
    E: 'bg-emerald-500',
    C: 'bg-cyan-500',
  }
  
  const color = colors[riasecType as keyof typeof colors] || 'text-slate-400'
  const bgColor = bgColors[riasecType as keyof typeof bgColors] || 'bg-slate-400'

  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      <div className={cn('rounded-2xl p-4 shadow-lg ring-1 ring-inset ring-white/10', bgColor.replace('bg-', 'bg-opacity-10 '))}>
        <div className={cn('absolute inset-0 rounded-2xl opacity-20 blur-xl', bgColor)}></div>
        <IconBook size={32} className={color} />
      </div>
    </div>
  )
}

// Get RIASEC type name
function getRiasecTypeName(type: string): string {
  const names: Record<string, string> = {
    R: 'Realistic',
    I: 'Investigative',
    A: 'Artistic',
    S: 'Social',
    E: 'Enterprising',
    C: 'Conventional',
  }
  return names[type] || type
}

type UICourse = {
  courseName: string
  focusDescription: string
  whatYouLearn: string[]
  toolsAndSkills: string[]
  exampleJobRoles: Array<{ title: string; description: string; image_url?: string | null }>
  courseImageUrl?: string | null
  workProjects?: string
  workLabs?: string
  workCollaboration?: string
  whatYouWillWork?: string
}

const ALL_RIASEC_TYPES = ['R', 'I', 'A', 'S', 'E', 'C'] as const

export function CourseRecommendationPage() {
  const { progress, markCourseViewed } = useUserProgress()
  const { theme } = useTheme()
  const { t } = useTranslation()
  const isLight = theme === 'light'

  const isReady = progress.psychometricCompleted
  const topRiasecType = progress.psychometricResult?.[0] || 'I'

  const [primaryCourses, setPrimaryCourses] = useState<UICourse[]>([])
  const [otherCourses, setOtherCourses] = useState<Record<string, UICourse[]>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  
  // Interactive section state
  const [activeActivity, setActiveActivity] = useState<string>('projects')

  // Get courses for all other RIASEC types (for optional exploration)
  const otherRiasecTypes = ALL_RIASEC_TYPES.filter((t) => t !== topRiasecType)

  const [selectedCourse, setSelectedCourse] = useState<{
    course: UICourse
    riasecType: string
  } | null>(null)

  const loadPrimaryCourses = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const courses = await fetchCoursesByType(topRiasecType as 'R' | 'I' | 'A' | 'S' | 'E' | 'C')
      setPrimaryCourses(courses.map(courseRowToUI))
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load courses.'
      setError(msg)
      console.error('Error loading primary courses:', err)
    } finally {
      setLoading(false)
    }
  }, [topRiasecType])

  const loadOtherCourses = useCallback(async () => {
    const coursesMap: Record<string, UICourse[]> = {}
    const otherTypes = ALL_RIASEC_TYPES.filter((t) => t !== topRiasecType)
    for (const type of otherTypes) {
      try {
        const courses = await fetchCoursesByType(type as 'R' | 'I' | 'A' | 'S' | 'E' | 'C')
        coursesMap[type] = courses.map(courseRowToUI)
      } catch (err) {
        console.error(`Error loading courses for ${type}:`, err)
        coursesMap[type] = []
      }
    }
    setOtherCourses(coursesMap)
  }, [topRiasecType])

  // Load primary courses
  useEffect(() => {
    if (isReady) {
      loadPrimaryCourses()
    }
  }, [isReady, loadPrimaryCourses])

  // Load other courses
  useEffect(() => {
    if (isReady) {
      loadOtherCourses()
    }
  }, [isReady, loadOtherCourses])

  const [expandedSections, setExpandedSections] = useState<{
    learn: boolean
    tools: boolean
  }>({
    learn: true,
    tools: true,
  })

  // Reset expanded sections when course changes
  useEffect(() => {
    if (selectedCourse) {
      setExpandedSections({
        learn: true,
        tools: true,
      })
      setActiveActivity('projects')
    }
  }, [selectedCourse?.course.courseName, selectedCourse?.riasecType])

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  return (
    <div className="space-y-6 font-poppins">
      {/* Animation Styles */}
      <style>{`
        @keyframes modal-overlay-enter {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modal-content-enter {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-modal-overlay {
          animation: modal-overlay-enter 0.3s ease-out forwards;
        }
        .animate-modal-content {
          animation: modal-content-enter 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>

      <PageHeader
        title={t('course.title')}
        subtitle="Based on your RIASEC profile, here are recommended learning paths to explore."
      />

      {!isReady ? (
        <Card title="Complete the Psychometric Test first">
          <div className={cn('space-y-3 text-sm', isLight ? 'text-slate-700' : 'text-slate-300')}>
            <p>
              Complete the <span className={cn('font-semibold', isLight ? 'text-slate-900' : 'text-slate-100')}>
                Psychometric Test
              </span>{' '}
              to generate your personalized course recommendations.
            </p>
            <div className="pt-2">
              <Link
                to="/psychometric-test"
                className={cn(
                  'inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold ring-1 transition',
                  isLight
                    ? 'bg-blue-50 text-blue-700 ring-blue-200 hover:bg-blue-100'
                    : 'bg-blue-600/20 text-blue-100 ring-blue-500/25 hover:bg-blue-600/25'
                )}
              >
                Go to Psychometric Test
              </Link>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* RIASEC Badge */}
          {progress.psychometricResult && (
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn(
                'rounded-full px-4 py-1.5 text-xs font-semibold ring-1 shadow-sm',
                isLight
                  ? 'bg-white text-blue-700 ring-blue-100'
                  : 'bg-blue-900/30 text-blue-100 ring-blue-500/30'
              )}>
                RIASEC Code: {progress.psychometricResult}
              </span>
              <span className={cn(
                'rounded-full px-4 py-1.5 text-xs font-semibold ring-1 shadow-sm',
                isLight
                  ? 'bg-white text-slate-700 ring-slate-200'
                  : 'bg-slate-900/40 text-slate-200 ring-slate-800/60'
              )}>
                Primary Type: {getRiasecTypeName(topRiasecType)}
              </span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className={cn(
              'rounded-xl border px-4 py-3 text-sm font-medium',
              isLight
                ? 'border-rose-300 bg-rose-50 text-rose-800'
                : 'border-rose-500/20 bg-rose-500/10 text-rose-200'
            )}>
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <Card>
              <div className={cn('py-12 text-center text-base animate-pulse', isLight ? 'text-slate-600' : 'text-slate-400')}>
                {t('course.loading')}
              </div>
            </Card>
          )}

          {/* Primary Recommended Courses - Large Cards */}
          {!loading && primaryCourses.length > 0 && (
            <div className="space-y-6">
              <div>
                <h2 className={cn('text-2xl font-bold tracking-tight', isLight ? 'text-slate-900' : 'text-white')}>
                  {t('course.recommendations')}
                </h2>
                <p className={cn('mt-2 text-base', isLight ? 'text-slate-600' : 'text-slate-400')}>
                  These courses align with your primary interests and learning style.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {primaryCourses.map((course, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedCourse({ course, riasecType: topRiasecType })
                      markCourseViewed()
                    }}
                    className={cn(
                      'group relative flex flex-col overflow-hidden rounded-[2rem] border p-8 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl',
                      isLight
                        ? 'border-slate-100 bg-white shadow-lg hover:shadow-blue-500/10'
                        : 'border-slate-800/60 bg-slate-900/40 shadow-xl hover:shadow-blue-500/10 hover:border-slate-700'
                    )}
                  >
                    {/* Decorative gradient blob */}
                    <div className={cn(
                      "absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-10",
                      isLight ? "bg-blue-400" : "bg-blue-600"
                    )} />
                    
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="mb-6 flex items-center justify-between">
                        <CourseIcon riasecType={topRiasecType} />
                        <span className={cn(
                          "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
                          isLight ? "bg-slate-100 text-slate-600" : "bg-slate-800 text-slate-300"
                        )}>
                          Highly Recommended
                        </span>
                      </div>
                      
                      <h3 className={cn('mb-3 text-xl font-bold leading-tight', isLight ? 'text-slate-900' : 'text-white')}>
                        {course.courseName}
                      </h3>
                      
                      <p className={cn('mb-8 flex-1 text-base leading-relaxed line-clamp-3', isLight ? 'text-slate-600' : 'text-slate-400')}>
                        {course.focusDescription}
                      </p>
                      
                      <div className={cn(
                        'mt-auto inline-flex items-center gap-2 text-sm font-bold transition-colors',
                        isLight ? 'text-blue-600 group-hover:text-blue-700' : 'text-blue-400 group-hover:text-blue-300'
                      )}>
                        {t('course.viewDetails')} <IconArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No Courses Message */}
          {!loading && primaryCourses.length === 0 && !error && (
            <Card>
              <div className={cn('py-8 text-center text-sm', isLight ? 'text-slate-600' : 'text-slate-400')}>
                {t('course.noRecommendations')}
              </div>
            </Card>
          )}

          {/* Other RIASEC Courses - Smaller Optional Cards */}
          {!loading && otherRiasecTypes.length > 0 && Object.keys(otherCourses).length > 0 && (
            <div className="space-y-6 pt-12 border-t border-slate-200/10">
              <div>
                <h2 className={cn('text-xl font-bold', isLight ? 'text-slate-800' : 'text-slate-200')}>
                  Explore Other Learning Paths
                </h2>
                <p className={cn('mt-2 text-sm', isLight ? 'text-slate-600' : 'text-slate-400')}>
                  You can also explore courses related to other interest areas.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {otherRiasecTypes.map((type) => {
                  const courses = otherCourses[type] || []
                  return courses.slice(0, 1).map((course, idx) => (
                    <button
                      key={`${type}-${idx}`}
                      type="button"
                      onClick={() => {
                        setSelectedCourse({ course, riasecType: type })
                        markCourseViewed()
                      }}
                      className={cn(
                        "group relative overflow-hidden rounded-2xl border p-5 text-left transition hover:shadow-lg",
                        isLight
                          ? "border-slate-200 bg-white hover:border-slate-300"
                          : "border-slate-800/70 bg-slate-950/25 hover:border-slate-700/70 hover:bg-slate-950/35"
                      )}
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CourseIcon riasecType={type} className="scale-75 origin-left" />
                          <span className={cn(
                            "rounded-lg px-2 py-0.5 text-[10px] font-semibold ring-1",
                            isLight
                              ? "bg-slate-100 text-slate-600 ring-slate-200"
                              : "bg-slate-950/40 text-slate-300 ring-slate-800/70"
                          )}>
                            {getRiasecTypeName(type)}
                          </span>
                        </div>
                      </div>
                      <h4 className={cn("mb-2 text-base font-bold", isLight ? "text-slate-900" : "text-slate-100")}>
                        {course.courseName}
                      </h4>
                      <p className={cn("mb-3 text-xs leading-relaxed line-clamp-2", isLight ? "text-slate-500" : "text-slate-400")}>
                        {course.focusDescription}
                      </p>
                    </button>
                  ))
                })}
              </div>
            </div>
          )}

          {/* Course Detail Modal - REDESIGNED */}
          {selectedCourse && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
              {/* Backdrop */}
              <div
                className={cn(
                  "fixed inset-0 animate-modal-overlay backdrop-blur-sm",
                  isLight ? "bg-slate-900/20" : "bg-black/60"
                )}
                onClick={() => setSelectedCourse(null)}
              />
              
              {/* Modal Container */}
              <div className={cn(
                "animate-modal-content relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl shadow-2xl ring-1",
                isLight
                  ? "bg-white ring-black/5"
                  : "bg-[#0B0E14] ring-white/10"
              )}>
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setSelectedCourse(null)}
                  className={cn(
                    "absolute right-4 top-4 z-20 rounded-full p-2 transition-transform hover:rotate-90 hover:scale-110 focus:outline-none focus:ring-2",
                    isLight
                      ? "bg-white/80 text-slate-500 hover:text-slate-900 backdrop-blur-sm shadow-sm"
                      : "bg-black/50 text-slate-400 hover:text-white backdrop-blur-sm"
                  )}
                >
                  <IconX size={20} />
                </button>

                {/* Content Wrapper - Scrollable */}
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                  <div className="flex flex-col lg:flex-row">
                    
                    {/* Left Column: Visuals & Core Info */}
                    <div className={cn(
                      "relative w-full lg:w-[40%] p-8 flex flex-col",
                      isLight ? "bg-slate-50" : "bg-slate-900/50"
                    )}>
                      {/* Image or Pattern */}
                      <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-2xl shadow-lg">
                        {selectedCourse.course.courseImageUrl ? (
                          <img
                            src={selectedCourse.course.courseImageUrl}
                            alt={selectedCourse.course.courseName}
                            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                          />
                        ) : (
                          <div className={cn(
                            "flex h-full w-full items-center justify-center bg-gradient-to-br",
                            isLight ? "from-blue-100 to-indigo-50" : "from-blue-900/20 to-purple-900/20"
                          )}>
                             <CourseIcon riasecType={selectedCourse.riasecType} className="scale-150" />
                          </div>
                        )}
                        <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-2xl"></div>
                      </div>

                      {/* Header Info */}
                      <div className="mb-6">
                         <div className="mb-4 flex items-center gap-2">
                          <span className={cn(
                            "rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-sm ring-1 ring-inset",
                            isLight
                              ? "bg-white text-blue-700 ring-blue-100"
                              : "bg-blue-500/10 text-blue-300 ring-blue-500/20"
                          )}>
                            {getRiasecTypeName(selectedCourse.riasecType)}
                          </span>
                        </div>
                        <h2 className={cn(
                          "text-3xl font-bold leading-tight",
                          isLight ? "text-slate-900" : "text-white"
                        )}>
                          {selectedCourse.course.courseName}
                        </h2>
                      </div>

                      <p className={cn(
                        "text-lg leading-relaxed mb-8",
                        isLight ? "text-slate-600" : "text-slate-300"
                      )}>
                        {selectedCourse.course.focusDescription}
                      </p>

                      {/* Job Roles Section - Moved here for better flow */}
                      <div className="mt-auto">
                        <h3 className={cn(
                          "mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider",
                          isLight ? "text-slate-500" : "text-slate-400"
                        )}>
                          <IconBriefcase size={16} />
                          {t('course.exampleJobRoles')}
                        </h3>
                        <div className="space-y-3">
                          {selectedCourse.course.exampleJobRoles.slice(0, 3).map((role, idx) => (
                            <div
                              key={idx}
                              className={cn(
                                "flex items-center gap-3 rounded-xl p-3 transition-colors",
                                isLight
                                  ? "bg-white shadow-sm ring-1 ring-slate-200 hover:ring-blue-200"
                                  : "bg-slate-800/50 ring-1 ring-slate-700 hover:bg-slate-800 hover:ring-slate-600"
                              )}
                            >
                              {role.image_url ? (
                                <img src={role.image_url} alt="" className="h-10 w-10 rounded-lg object-cover bg-slate-200" />
                              ) : (
                                <div className={cn(
                                  "flex h-10 w-10 items-center justify-center rounded-lg",
                                  isLight ? "bg-slate-100 text-slate-500" : "bg-slate-700 text-slate-300"
                                )}>
                                  <IconBriefcase size={18} />
                                </div>
                              )}
                              <div>
                                <div className={cn("text-sm font-bold", isLight ? "text-slate-900" : "text-slate-200")}>
                                  {role.title}
                                </div>
                                <div className={cn("text-xs line-clamp-1", isLight ? "text-slate-500" : "text-slate-400")}>
                                  {role.description}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Detailed Breakdown */}
                    <div className="relative w-full lg:w-[60%] p-8">
                      <div className="space-y-8">
                        
                        {/* 1. What you'll learn - Modern List */}
                        <div>
                           <button
                            onClick={() => toggleSection('learn')}
                            className="group flex w-full items-center justify-between py-2 text-left"
                          >
                            <h3 className={cn(
                              "flex items-center gap-3 text-xl font-bold",
                              isLight ? "text-slate-900" : "text-white"
                            )}>
                              <span className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                                isLight ? "bg-blue-100 text-blue-600" : "bg-blue-500/20 text-blue-400"
                              )}>
                                <IconTarget size={18} />
                              </span>
                              What you'll learn
                            </h3>
                            <IconChevronDown
                              className={cn(
                                "transition-transform duration-300",
                                isLight ? "text-slate-400" : "text-slate-500",
                                expandedSections.learn && "rotate-180"
                              )}
                            />
                          </button>
                          
                          {expandedSections.learn && (
                            <div className="mt-4 grid gap-3 sm:grid-cols-2 animate-modal-content" style={{ animationDuration: '0.3s' }}>
                              {selectedCourse.course.whatYouLearn.map((item, idx) => (
                                <div key={idx} className={cn(
                                  "flex items-start gap-3 rounded-xl p-3 transition-colors",
                                  isLight
                                    ? "bg-slate-50 hover:bg-slate-100"
                                    : "bg-white/5 hover:bg-white/10"
                                )}>
                                  <div className={cn(
                                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                                    isLight ? "bg-green-100 text-green-600" : "bg-green-500/20 text-green-400"
                                  )}>
                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  </div>
                                  <span className={cn(
                                    "text-sm font-medium leading-snug",
                                    isLight ? "text-slate-700" : "text-slate-300"
                                  )}>
                                    {item}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* 2. Interactive "What you'll work on" Section */}
                        <div>
                          <div className="mb-4">
                            <h3 className={cn(
                              "flex items-center gap-3 text-xl font-bold",
                              isLight ? "text-slate-900" : "text-white"
                            )}>
                              <span className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-lg",
                                isLight ? "bg-purple-100 text-purple-600" : "bg-purple-500/20 text-purple-400"
                              )}>
                                <IconLightbulb size={18} />
                              </span>
                              What you'll work on
                            </h3>
                            <p className={cn("mt-1 ml-11 text-sm", isLight ? "text-slate-500" : "text-slate-400")}>
                              {selectedCourse.course.whatYouWillWork || "Explore the activities you'll encounter in this course."}
                            </p>
                          </div>

                          <div className="rounded-2xl overflow-hidden ring-1 ring-inset ring-slate-200/50 dark:ring-slate-800">
                            {/* Tabs */}
                            <div className="flex border-b border-slate-200 dark:border-slate-800">
                              {activityOptions.map((option) => (
                                <button
                                  key={option.id}
                                  onClick={() => setActiveActivity(option.id)}
                                  className={cn(
                                    "flex-1 py-3 text-sm font-semibold transition-all relative",
                                    activeActivity === option.id
                                      ? isLight
                                        ? "text-blue-600 bg-blue-50/50"
                                        : "text-blue-400 bg-blue-500/10"
                                      : isLight
                                        ? "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                                        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                                  )}
                                >
                                  {option.title}
                                  {activeActivity === option.id && (
                                    <div className={cn(
                                      "absolute bottom-0 left-0 right-0 h-0.5",
                                      isLight ? "bg-blue-600" : "bg-blue-400"
                                    )} />
                                  )}
                                </button>
                              ))}
                            </div>
                            
                            {/* Active Content */}
                            <div className={cn(
                              "p-5 transition-all",
                              isLight ? "bg-slate-50/30" : "bg-white/5"
                            )}>
                              {activityOptions.map((option) => {
                                if (option.id !== activeActivity) return null
                                const Icon = option.icon
                                
                                let description = option.description
                                if (option.id === 'projects' && selectedCourse.course.workProjects) {
                                  description = selectedCourse.course.workProjects
                                } else if (option.id === 'labs' && selectedCourse.course.workLabs) {
                                  description = selectedCourse.course.workLabs
                                } else if (option.id === 'collaboration' && selectedCourse.course.workCollaboration) {
                                  description = selectedCourse.course.workCollaboration
                                }

                                return (
                                  <div key={option.id} className="animate-modal-content" style={{ animationDuration: '0.2s' }}>
                                    <div className="flex gap-4">
                                      <div className={cn(
                                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm",
                                        isLight ? "bg-white text-blue-600" : "bg-slate-800 text-blue-400"
                                      )}>
                                        <Icon size={24} />
                                      </div>
                                      <div>
                                        <h4 className={cn("text-base font-bold", isLight ? "text-slate-900" : "text-white")}>
                                          {option.title}
                                        </h4>
                                        <p className={cn("mt-1 text-sm leading-relaxed whitespace-pre-line", isLight ? "text-slate-600" : "text-slate-300")}>
                                          {description}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>

                        {/* 3. Tools & Skills - Tag Cloud Style */}
                        <div>
                          <button
                            onClick={() => toggleSection('tools')}
                            className="group flex w-full items-center justify-between py-2 text-left"
                          >
                            <h3 className={cn(
                              "flex items-center gap-3 text-xl font-bold",
                              isLight ? "text-slate-900" : "text-white"
                            )}>
                              <span className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-lg",
                                isLight ? "bg-orange-100 text-orange-600" : "bg-orange-500/20 text-orange-400"
                              )}>
                                <IconWrench size={18} />
                              </span>
                              {t('course.toolsAndSkills')}
                            </h3>
                             <IconChevronDown
                              className={cn(
                                "transition-transform duration-300",
                                isLight ? "text-slate-400" : "text-slate-500",
                                expandedSections.tools && "rotate-180"
                              )}
                            />
                          </button>
                          
                          {expandedSections.tools && (
                             <div className="mt-4 flex flex-wrap gap-2 animate-modal-content" style={{ animationDuration: '0.3s' }}>
                              {selectedCourse.course.toolsAndSkills.map((tool, idx) => (
                                <span
                                  key={idx}
                                  className={cn(
                                    "inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium transition-transform hover:scale-105 cursor-default select-none",
                                    isLight
                                      ? "bg-white border border-slate-200 text-slate-700 shadow-sm"
                                      : "bg-slate-800 border border-slate-700 text-slate-300"
                                  )}
                                >
                                  {tool}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Footer Actions */}
                <div className={cn(
                  "border-t p-4 flex justify-end gap-3",
                  isLight ? "border-slate-200 bg-slate-50" : "border-slate-800 bg-slate-900/80"
                )}>
                  <button
                    type="button"
                    onClick={() => setSelectedCourse(null)}
                    className={cn(
                      "rounded-xl px-6 py-2.5 text-sm font-bold transition focus:outline-none focus:ring-2",
                      isLight
                        ? "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-slate-200"
                        : "bg-transparent text-slate-300 border border-slate-700 hover:bg-white/5 focus:ring-slate-700"
                    )}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCourse(null)}
                    className={cn(
                      "rounded-xl px-6 py-2.5 text-sm font-bold shadow-md transition focus:outline-none focus:ring-2",
                      isLight
                        ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-200"
                        : "bg-blue-600 text-white hover:bg-blue-500 focus:ring-blue-900"
                    )}
                  >
                    Save Course
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
