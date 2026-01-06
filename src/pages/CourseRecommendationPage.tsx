import { Link } from 'react-router-dom'
import { useEffect, useState, useCallback } from 'react'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/PageHeader'
import { useUserProgress } from '../context/UserProgressContext'
import { useTheme } from '../context/ThemeContext'
import { useTranslation } from '../context/LanguageContext'
import { cn } from '../lib/cn'
import { IconX, IconChevronDown, IconArrowRight, IconBook, IconWrench, IconSettings, IconBriefcase } from '../components/icons'
import { fetchCoursesByType, courseRowToUI } from '../lib/coursesRepo'

// Course icon component - simple and general
function CourseIcon({ riasecType, className }: { riasecType: string; className?: string }) {
  const colors = {
    R: 'text-blue-400',
    I: 'text-purple-400',
    A: 'text-pink-400',
    S: 'text-orange-400',
    E: 'text-emerald-400',
    C: 'text-cyan-400',
  }
  const color = colors[riasecType as keyof typeof colors] || 'text-slate-400'

  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      <div className={cn('rounded-2xl bg-gradient-to-br p-6', color.replace('text-', 'bg-').replace('-400', '-600/20'))}>
        <IconBook size={48} className={color} />
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
}

const ALL_RIASEC_TYPES = ['R', 'I', 'A', 'S', 'E', 'C'] as const

export function CourseRecommendationPage() {
  const { progress } = useUserProgress()
  const { theme } = useTheme()
  const { t } = useTranslation()
  const isLight = theme === 'light'

  const isReady = progress.psychometricCompleted
  const topRiasecType = progress.psychometricResult?.[0] || 'I'

  const [primaryCourses, setPrimaryCourses] = useState<UICourse[]>([])
  const [otherCourses, setOtherCourses] = useState<Record<string, UICourse[]>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

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
    workOn: boolean
    tools: boolean
    jobs: boolean
  }>({
    learn: true,
    workOn: false,
    tools: false,
    jobs: false,
  })

  // Reset expanded sections when course changes
  useEffect(() => {
    if (selectedCourse) {
      setExpandedSections({
        learn: true,
        workOn: false,
        tools: false,
        jobs: false,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourse?.course.courseName, selectedCourse?.riasecType])

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  return (
    <div className="space-y-6">
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
                'rounded-xl px-3 py-2 text-xs font-semibold ring-1',
                isLight
                  ? 'bg-blue-50 text-blue-700 ring-blue-200'
                  : 'bg-blue-600/20 text-blue-100 ring-blue-500/25'
              )}>
                RIASEC Code: {progress.psychometricResult}
              </span>
              <span className={cn(
                'rounded-xl px-3 py-2 text-xs font-semibold ring-1',
                isLight
                  ? 'bg-slate-100 text-slate-700 ring-slate-200'
                  : 'bg-slate-950/40 text-slate-200 ring-slate-800/70'
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
              <div className={cn('py-8 text-center text-sm', isLight ? 'text-slate-600' : 'text-slate-400')}>
                {t('course.loading')}
              </div>
            </Card>
          )}

          {/* Primary Recommended Courses - Large Cards */}
          {!loading && primaryCourses.length > 0 && (
            <div className="space-y-4">
              <div>
                <h2 className={cn('text-xl font-semibold', isLight ? 'text-slate-900' : 'text-slate-100')}>
                  {t('course.recommendations')}
                </h2>
                <p className={cn('mt-1 text-sm', isLight ? 'text-slate-600' : 'text-slate-400')}>
                  These courses align with your primary interests and learning style.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {primaryCourses.map((course, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedCourse({ course, riasecType: topRiasecType })}
                    className={cn(
                      'group relative overflow-hidden rounded-3xl border-2 p-8 text-left backdrop-blur-xl transition',
                      isLight
                        ? 'border-blue-100/60 bg-white shadow-md hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/10 ring-1 ring-blue-100/50'
                        : 'border-slate-800/70 bg-slate-950/30 hover:border-slate-700/70 hover:bg-slate-950/40 hover:shadow-xl hover:shadow-blue-500/10 before:pointer-events-none before:absolute before:inset-0 before:opacity-80 before:bg-[radial-gradient(500px_circle_at_50%_50%,rgba(59,130,246,0.12),transparent_70%)] ring-1 ring-blue-500/20',
                    )}
                  >
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <div className="mb-6 flex items-center justify-center">
                        <CourseIcon riasecType={topRiasecType} />
                      </div>
                      <h3 className={cn('mb-3 text-xl font-semibold', isLight ? 'text-slate-900' : 'text-slate-100')}>
                        {course.courseName}
                      </h3>
                      <p className={cn('mb-6 text-base leading-relaxed line-clamp-3', isLight ? 'text-slate-600' : 'text-slate-400')}>
                        {course.focusDescription}
                      </p>
                      <div className={cn(
                        'inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold ring-1 transition',
                        isLight
                          ? 'bg-blue-50 text-blue-700 ring-blue-200 group-hover:bg-blue-100'
                          : 'bg-blue-600/20 text-blue-100 ring-blue-500/25 group-hover:bg-blue-600/25'
                      )}>
                        {t('course.viewDetails')} <IconArrowRight size={16} />
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
            <div className="space-y-4 pt-8">
              <div>
                <h2 className="text-lg font-semibold text-slate-200">
                  Explore Other Learning Paths
                </h2>
                <p className="mt-1 text-sm text-slate-400">
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
                      onClick={() => setSelectedCourse({ course, riasecType: type })}
                      className="group relative overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-950/25 p-6 text-left backdrop-blur-xl transition hover:border-slate-700/70 hover:bg-slate-950/35"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CourseIcon riasecType={type} className="!p-3" />
                          <span className="rounded-lg bg-slate-950/40 px-2 py-0.5 text-[10px] font-semibold text-slate-300 ring-1 ring-slate-800/70">
                            {getRiasecTypeName(type)}
                          </span>
                        </div>
                      </div>
                      <h4 className="mb-2 text-base font-semibold text-slate-100">{course.courseName}</h4>
                      <p className="mb-3 text-xs text-slate-400 leading-relaxed line-clamp-2">
                        {course.focusDescription}
                      </p>
                      <div
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-semibold ring-1 transition',
                          isLight
                            ? 'bg-blue-50 text-blue-700 ring-blue-200 group-hover:bg-blue-100'
                            : 'bg-blue-600/35 text-blue-50 ring-blue-500/40 group-hover:bg-blue-600/45'
                        )}
                      >
                        {t('course.viewDetails')} <IconArrowRight size={11} />
                      </div>
                    </button>
                  ))
                })}
              </div>
            </div>
          )}

          {/* Course Detail Modal */}
          {selectedCourse && (
            <>
              {/* Backdrop */}
              <div
                className={cn(
                  "fixed inset-0 z-40 backdrop-blur-md",
                  isLight ? "bg-black/40" : "bg-black/70"
                )}
                onClick={() => setSelectedCourse(null)}
              />
              {/* Modal */}
              <div className={cn(
                "fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl p-8 shadow-2xl",
                isLight
                  ? "border border-slate-200 bg-white"
                  : "border border-slate-800/70 bg-slate-950/95 backdrop-blur-xl"
              )}>
                <div className="space-y-4">
                  {/* Course Image */}
                  {selectedCourse.course.courseImageUrl && (
                    <div className="overflow-hidden rounded-xl">
                      <img
                        src={selectedCourse.course.courseImageUrl}
                        alt={selectedCourse.course.courseName}
                        className="h-48 w-full object-cover"
                      />
                    </div>
                  )}

                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <span className={cn(
                          "rounded-lg px-2 py-1 text-xs font-semibold ring-1",
                          isLight
                            ? "bg-blue-100 text-blue-800 ring-blue-200"
                            : "bg-slate-950/40 text-slate-300 ring-slate-800/70"
                        )}>
                          {getRiasecTypeName(selectedCourse.riasecType)}
                        </span>
                      </div>
                      <h2 className={cn(
                        "text-2xl font-bold",
                        isLight ? "text-[#0f172a]" : "text-slate-100"
                      )}>
                        {selectedCourse.course.courseName}
                      </h2>
                      <p className={cn(
                        "mt-2 text-base leading-relaxed",
                        isLight ? "text-[#334155]" : "text-slate-400"
                      )}>
                        {selectedCourse.course.focusDescription}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedCourse(null)}
                      className={cn(
                        "shrink-0 rounded-full p-2 transition",
                        isLight
                          ? "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
                          : "bg-slate-900/60 text-slate-300 hover:bg-slate-800/80 hover:text-slate-100"
                      )}
                    >
                      <IconX size={18} />
                    </button>
                  </div>

                  {/* Expandable Sections */}
                  <div className="space-y-3">
                    {/* What you'll learn */}
                    <div className={cn(
                      "rounded-2xl border",
                      isLight
                        ? "border-slate-200 bg-white"
                        : "border-slate-800/70 bg-slate-950/30"
                    )}>
                      <button
                        type="button"
                        onClick={() => toggleSection('learn')}
                        className="flex w-full items-center justify-between px-4 py-3 text-left"
                      >
                        <div className="flex items-center gap-3">
                          <IconBook size={18} className={cn(
                            isLight ? "text-slate-600" : "text-slate-400"
                          )} />
                          <span className={cn(
                            "text-sm font-semibold",
                            isLight ? "text-[#1e293b]" : "text-slate-200"
                          )}>
                            What you'll learn
                          </span>
                        </div>
                        <IconChevronDown
                          size={16}
                          className={cn(
                            'transition-transform',
                            isLight ? 'text-slate-600' : 'text-slate-400',
                            expandedSections.learn && 'rotate-180',
                          )}
                        />
                      </button>
                      {expandedSections.learn && (
                        <div className={cn(
                          "border-t px-4 py-3",
                          isLight ? "border-slate-200" : "border-slate-800/70"
                        )}>
                          <ul className="space-y-2">
                            {selectedCourse.course.whatYouLearn.map((item, idx) => (
                              <li key={idx} className={cn(
                                "flex items-start gap-2 text-sm",
                                isLight ? "text-[#334155]" : "text-slate-300/90"
                              )}>
                                <span className={cn(
                                  "mt-1.5 size-1.5 shrink-0 rounded-full",
                                  isLight ? "bg-blue-600" : "bg-blue-400/60"
                                )} />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* What you'll work on */}
                    <div className={cn(
                      "rounded-2xl border",
                      isLight
                        ? "border-slate-200 bg-white"
                        : "border-slate-800/70 bg-slate-950/30"
                    )}>
                      <button
                        type="button"
                        onClick={() => toggleSection('workOn')}
                        className="flex w-full items-center justify-between px-4 py-3 text-left"
                      >
                        <div className="flex items-center gap-3">
                          <IconWrench size={18} className={cn(
                            isLight ? "text-slate-600" : "text-slate-400"
                          )} />
                          <span className={cn(
                            "text-sm font-semibold",
                            isLight ? "text-[#1e293b]" : "text-slate-200"
                          )}>
                            What you'll work on
                          </span>
                        </div>
                        <IconChevronDown
                          size={16}
                          className={cn(
                            'transition-transform',
                            isLight ? 'text-slate-600' : 'text-slate-400',
                            expandedSections.workOn && 'rotate-180',
                          )}
                        />
                      </button>
                      {expandedSections.workOn && (
                        <div className={cn(
                          "border-t px-4 py-3 text-sm",
                          isLight
                            ? "border-slate-200 text-[#334155]"
                            : "border-slate-800/70 text-slate-300/90"
                        )}>
                          <p className="mb-3">
                            In this course, students typically engage in practical activities and projects that reinforce
                            the learning objectives. You'll work on assignments, case studies, and hands-on exercises
                            that help you apply the concepts you're learning.
                          </p>
                          <p>
                            The course emphasizes active learning through real-world applications, allowing you to build
                            a portfolio of work that demonstrates your understanding and skills.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Tools & skills */}
                    <div className={cn(
                      "rounded-2xl border",
                      isLight
                        ? "border-slate-200 bg-white"
                        : "border-slate-800/70 bg-slate-950/30"
                    )}>
                      <button
                        type="button"
                        onClick={() => toggleSection('tools')}
                        className="flex w-full items-center justify-between px-4 py-3 text-left"
                      >
                        <div className="flex items-center gap-3">
                          <IconSettings size={18} className={cn(
                            isLight ? "text-slate-600" : "text-slate-400"
                          )} />
                          <span className={cn(
                            "text-sm font-semibold",
                            isLight ? "text-[#1e293b]" : "text-slate-200"
                          )}>
                            {t('course.toolsAndSkills')}
                          </span>
                        </div>
                        <IconChevronDown
                          size={16}
                          className={cn(
                            'transition-transform',
                            isLight ? 'text-slate-600' : 'text-slate-400',
                            expandedSections.tools && 'rotate-180',
                          )}
                        />
                      </button>
                      {expandedSections.tools && (
                        <div className={cn(
                          "border-t px-4 py-3",
                          isLight ? "border-slate-200" : "border-slate-800/70"
                        )}>
                          <div className="flex flex-wrap gap-2">
                            {selectedCourse.course.toolsAndSkills.map((tool, idx) => (
                              <span
                                key={idx}
                                className={cn(
                                  "rounded-xl border px-3 py-1.5 text-sm font-semibold",
                                  isLight
                                    ? "border-slate-200 bg-slate-50 text-slate-900"
                                    : "border-slate-800/70 bg-slate-950/40 text-slate-200"
                                )}
                              >
                                {tool}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Example job roles - Static Cards */}
                    <div className={cn(
                      "rounded-2xl border p-4",
                      isLight
                        ? "border-slate-200 bg-white"
                        : "border-slate-800/70 bg-slate-950/30"
                    )}>
                      <div className="mb-4 flex items-center gap-3">
                        <IconBriefcase size={18} className={cn(
                          isLight ? "text-slate-600" : "text-slate-400"
                        )} />
                        <div>
                          <span className={cn(
                            "text-sm font-semibold",
                            isLight ? "text-[#1e293b]" : "text-slate-200"
                          )}>
                            {t('course.exampleJobRoles')}
                          </span>
                          <span className={cn(
                            "ml-2 rounded-lg px-2 py-0.5 text-[10px] font-medium ring-1",
                            isLight
                              ? "bg-blue-100 text-blue-800 ring-blue-200"
                              : "bg-slate-950/40 text-slate-400 ring-slate-800/70"
                          )}>
                            {t('course.informational')}
                          </span>
                        </div>
                      </div>
                      <p className={cn(
                        "mb-4 text-xs italic",
                        isLight ? "text-slate-600" : "text-slate-400"
                      )}>
                        These are example roles that people with similar interests and training often explore. They
                        are provided for informational purposes only and do not represent guaranteed career outcomes.
                      </p>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {selectedCourse.course.exampleJobRoles.map((role, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              "rounded-xl border p-4",
                              isLight
                                ? "border-slate-200 bg-slate-50"
                                : "border-slate-800/70 bg-slate-950/40"
                            )}
                          >
                            <div className="flex gap-3">
                              {role.image_url && (
                                <img
                                  src={role.image_url}
                                  alt={role.title}
                                  className={cn(
                                    "h-16 w-16 shrink-0 rounded-lg border object-cover",
                                    isLight
                                      ? "border-slate-200"
                                      : "border-slate-800/70"
                                  )}
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className={cn(
                                  "mb-1 text-sm font-semibold",
                                  isLight ? "text-slate-900" : "text-slate-200"
                                )}>
                                  {role.title}
                                </h4>
                                <p className={cn(
                                  "text-sm",
                                  isLight ? "text-slate-700" : "text-slate-300/90"
                                )}>
                                  {role.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Close Button */}
                  <button
                    type="button"
                    onClick={() => setSelectedCourse(null)}
                    className={cn(
                      "w-full rounded-xl border px-4 py-3 text-base font-semibold transition",
                      isLight
                        ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 shadow-md"
                        : "bg-purple-600/20 border-purple-500/30 text-slate-100 hover:bg-purple-600/30"
                    )}
                  >
                    {t('common.close')}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
