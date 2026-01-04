import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { useProfile } from '../context/ProfileContext'
import { IconArrowRight, IconEdit } from '../components/icons'
import { fetchAllQuestionsForTeachers, type QuestionRow } from '../lib/questionsRepo'
import { fetchAllCoursesForTeachers, type CourseRow } from '../lib/coursesRepo'
import { cn } from '../lib/cn'

const RIASEC_COLORS: Record<string, { bg: string; text: string }> = {
  R: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
  I: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  A: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  S: { bg: 'bg-blue-600/20', text: 'text-blue-500' },
  E: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  C: { bg: 'bg-green-500/20', text: 'text-green-400' },
}

export function TeacherDashboardPage() {
  const { profile } = useProfile()
  const [questions, setQuestions] = useState<QuestionRow[]>([])
  const [courses, setCourses] = useState<CourseRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    loadData()
    
    // Safety timeout - if loading takes more than 10 seconds, show content anyway
    const timeout = setTimeout(() => {
      setLoading((prevLoading) => {
        if (prevLoading) {
          console.warn('Dashboard loading timeout - showing content anyway')
          return false
        }
        return prevLoading
      })
    }, 10000)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [questionsData, coursesData] = await Promise.all([
        fetchAllQuestionsForTeachers().catch((err) => {
          console.error('Error loading questions:', err)
          const msg = err instanceof Error ? err.message : 'Failed to load questions.'
          setError((prev) => prev ? `${prev}; Questions: ${msg}` : `Questions: ${msg}`)
          return [] as QuestionRow[]
        }),
        fetchAllCoursesForTeachers().catch((err) => {
          console.error('Error loading courses:', err)
          const msg = err instanceof Error ? err.message : 'Failed to load courses.'
          setError((prev) => prev ? `${prev}; Courses: ${msg}` : `Courses: ${msg}`)
          return [] as CourseRow[]
        }),
      ])
      setQuestions(questionsData)
      setCourses(coursesData)
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      const msg = err instanceof Error ? err.message : 'Failed to load dashboard data.'
      setError(msg)
      // Set empty arrays on error to prevent stuck state
      setQuestions([])
      setCourses([])
    } finally {
      // Always set loading to false, even on error
      setLoading(false)
    }
  }

  const stats = useMemo(() => {
    const activeQuestions = questions.filter((q) => q.is_active).length
    const draftQuestions = questions.filter((q) => !q.is_active).length
    const activeCourses = courses.filter((c) => c.is_active).length
    const draftCourses = courses.filter((c) => !c.is_active).length

    return {
      activeQuestions,
      draftQuestions,
      activeCourses,
      draftCourses,
    }
  }, [questions, courses])

  const recentQuestions = useMemo(() => {
    return questions.slice(0, 5)
  }, [questions])

  const recentCourses = useMemo(() => {
    return courses.slice(0, 5)
  }, [courses])

  const teacherName = profile?.full_name || 'Cikgu'

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-200">
          {error}
        </div>
      )}

      {/* Welcome Banner - Always show immediately */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800/70 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-slate-950/50 p-8 backdrop-blur-xl">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-100 mb-2">
              SELAMAT KEMBALI, {teacherName}
            </h1>
            <p className="text-slate-300/90 mb-6">
              Anda kini boleh mengurus soalan psikometrik RIASEC dan cadangan kursus dengan mudah.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/teacher/questions"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition"
              >
                Manage Questions
                <IconArrowRight size={16} />
              </Link>
              <Link
                to="/teacher/courses"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/20 transition backdrop-blur-sm"
              >
                Manage Courses
                <IconArrowRight size={16} />
              </Link>
            </div>
          </div>
          <div className="hidden lg:flex justify-end">
            <div className="relative">
              {/* Placeholder for illustration - you can add an actual image here */}
              <div className="w-48 h-48 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                <div className="text-6xl">👩‍🏫</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Questions */}
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-blue-600/20 p-2.5 ring-1 ring-blue-500/25">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-100">{stats.activeQuestions}</div>
              <div className="text-sm text-slate-400 mt-1">Active Questions</div>
            </div>
            <div className="pt-2 border-t border-slate-800/70">
              <p className="text-xs text-slate-500 mb-2">More questions?</p>
              <Link
                to="/teacher/questions"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition"
              >
                Manage Questions
                <IconArrowRight size={12} />
              </Link>
            </div>
          </div>
        </Card>

        {/* Draft Questions */}
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-amber-600/20 p-2.5 ring-1 ring-amber-500/25">
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-100">{stats.draftQuestions}</div>
              <div className="text-sm text-slate-400 mt-1">Draft Questions</div>
            </div>
            <div className="pt-2 border-t border-slate-800/70">
              <p className="text-xs text-slate-500 mb-2">Ready to review?</p>
              <Link
                to="/teacher/questions"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition"
              >
                Review Drafts
                <IconArrowRight size={12} />
              </Link>
            </div>
          </div>
        </Card>

        {/* Active Courses */}
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-purple-600/20 p-2.5 ring-1 ring-purple-500/25">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
                </svg>
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-100">{stats.activeCourses}</div>
              <div className="text-sm text-slate-400 mt-1">Active Courses</div>
            </div>
            <div className="pt-2 border-t border-slate-800/70">
              <p className="text-xs text-slate-500 mb-2">Need updates?</p>
              <Link
                to="/teacher/courses"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300 transition"
              >
                Manage Courses
                <IconArrowRight size={12} />
              </Link>
            </div>
          </div>
        </Card>

        {/* Draft Courses */}
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-emerald-600/20 p-2.5 ring-1 ring-emerald-500/25">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
                </svg>
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-100">{stats.draftCourses}</div>
              <div className="text-sm text-slate-400 mt-1">Draft Courses</div>
            </div>
            <div className="pt-2 border-t border-slate-800/70">
              <p className="text-xs text-slate-500 mb-2">Pending final touches?</p>
              <Link
                to="/teacher/courses"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
              >
                Review Drafts
                <IconArrowRight size={12} />
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Psychometric Questions Overview */}
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-100">Psychometric Questions</h3>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                +12% this week
              </span>
            </div>
            {loading ? (
              <div className="py-8 text-center text-sm text-slate-400">Loading...</div>
            ) : recentQuestions.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">No questions yet</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-800/70">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">Question</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">Code</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentQuestions.map((question) => {
                        const color = RIASEC_COLORS[question.type] || { bg: 'bg-slate-500/20', text: 'text-slate-400' }
                        return (
                          <tr key={question.id} className="border-b border-slate-800/50 hover:bg-slate-900/30 transition">
                            <td className="py-3 px-4">
                              <div className="text-sm text-slate-200 line-clamp-1">{question.text}</div>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={cn(
                                  'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold',
                                  color.bg,
                                  color.text,
                                )}
                              >
                                {question.type}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={cn(
                                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
                                  question.is_active
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-amber-500/20 text-amber-400',
                                )}
                              >
                                {question.is_active ? 'Active' : 'Draft'}
                                <IconArrowRight size={10} />
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <Link
                  to="/teacher/questions"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800/70 bg-slate-950/40 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-900/60 transition"
                >
                  Manage Questions
                  <IconArrowRight size={16} />
                </Link>
              </>
            )}
          </div>
        </Card>

        {/* Courses Overview */}
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-100">Courses Overview</h3>
              <span className="rounded-full bg-blue-500/20 px-2.5 py-1 text-xs font-semibold text-blue-400">
                +5 new this week
              </span>
            </div>
            {loading ? (
              <div className="py-8 text-center text-sm text-slate-400">Loading...</div>
            ) : recentCourses.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">No courses yet</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-800/70">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">Course</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">Code</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">Status</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">Edit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentCourses.map((course) => {
                        const color = RIASEC_COLORS[course.riasec_type] || { bg: 'bg-slate-500/20', text: 'text-slate-400' }
                        return (
                          <tr key={course.id} className="border-b border-slate-800/50 hover:bg-slate-900/30 transition">
                            <td className="py-3 px-4">
                              <div className="text-sm font-medium text-slate-200 line-clamp-1">{course.course_name}</div>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={cn(
                                  'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold',
                                  color.bg,
                                  color.text,
                                )}
                              >
                                {course.riasec_type}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={cn(
                                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
                                  course.is_active
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-amber-500/20 text-amber-400',
                                )}
                              >
                                {course.is_active ? 'Active' : 'Draft'}
                                <IconArrowRight size={10} />
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <Link
                                to="/teacher/courses"
                                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition"
                              >
                                Edit
                                <IconEdit size={12} />
                              </Link>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <Link
                  to="/teacher/courses"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800/70 bg-slate-950/40 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-900/60 transition"
                >
                  Manage Courses
                  <IconArrowRight size={16} />
                </Link>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
