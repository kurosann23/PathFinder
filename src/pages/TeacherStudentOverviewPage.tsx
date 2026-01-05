import { useEffect, useState, useMemo } from 'react'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/PageHeader'
import { fetchAllClasses, fetchStudentsByClass, fetchRiasecResultsForStudents, type StudentProfileRow } from '../lib/profileRepo'
import { isSupabaseConfigured } from '../lib/supabaseClient'
import { cn } from '../lib/cn'
import { useTheme } from '../context/ThemeContext'

type StudentWithRiasec = StudentProfileRow & {
  dominantRiasecCode: string | null
  hasTestResult: boolean
}

type RiasecStats = {
  R: number
  I: number
  A: number
  S: number
  E: number
  C: number
}

const RIASEC_LABELS: Record<string, string> = {
  R: 'Realistic',
  I: 'Investigative',
  A: 'Artistic',
  S: 'Social',
  E: 'Enterprising',
  C: 'Conventional',
}

const RIASEC_COLORS: Record<string, { bg: string; border: string; text: string; bgLight: string; borderLight: string; textLight: string }> = {
  R: { 
    bg: 'bg-blue-500/10', 
    border: 'border-blue-500/30', 
    text: 'text-blue-400',
    bgLight: 'bg-[#e8f1ff]',
    borderLight: 'border-blue-300',
    textLight: 'text-[#1e293b]',
  },
  I: { 
    bg: 'bg-blue-500/10', 
    border: 'border-blue-500/30', 
    text: 'text-blue-400',
    bgLight: 'bg-blue-50',
    borderLight: 'border-blue-300',
    textLight: 'text-blue-700',
  },
  A: { 
    bg: 'bg-purple-500/10', 
    border: 'border-purple-500/30', 
    text: 'text-purple-400',
    bgLight: 'bg-purple-50',
    borderLight: 'border-purple-300',
    textLight: 'text-purple-700',
  },
  S: { 
    bg: 'bg-cyan-500/10', 
    border: 'border-cyan-500/30', 
    text: 'text-cyan-400',
    bgLight: 'bg-cyan-50',
    borderLight: 'border-cyan-300',
    textLight: 'text-cyan-700',
  },
  E: { 
    bg: 'bg-emerald-500/10', 
    border: 'border-emerald-500/30', 
    text: 'text-emerald-400',
    bgLight: 'bg-emerald-50',
    borderLight: 'border-emerald-300',
    textLight: 'text-emerald-700',
  },
  C: { 
    bg: 'bg-green-500/10', 
    border: 'border-green-500/30', 
    text: 'text-green-400',
    bgLight: 'bg-green-50',
    borderLight: 'border-green-300',
    textLight: 'text-green-700',
  },
}

export function TeacherStudentOverviewPage() {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const [classes, setClasses] = useState<string[]>([])
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [students, setStudents] = useState<StudentWithRiasec[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [error, setError] = useState<string>('')

  // Load available classes on mount
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setError('Supabase is not configured.')
      setLoading(false)
      return
    }

    loadClasses()
  }, [])

  // Load students when class is selected
  useEffect(() => {
    if (!selectedClass || !isSupabaseConfigured) {
      setStudents([])
      return
    }

    loadStudents(selectedClass)
  }, [selectedClass])

  async function loadClasses() {
    setLoading(true)
    setError('')
    try {
      const allClasses = await fetchAllClasses()
      setClasses(allClasses)
      if (allClasses.length > 0) {
        setSelectedClass(allClasses[0])
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load classes.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  async function loadStudents(className: string) {
    setLoadingStudents(true)
    setError('')
    try {
      const studentProfiles = await fetchStudentsByClass(className)
      const userIds = studentProfiles.map((s) => s.id)
      
      // Fetch RIASEC results for all students
      const riasecResults = await fetchRiasecResultsForStudents(userIds)

      // Combine student profiles with RIASEC data
      const studentsWithRiasec: StudentWithRiasec[] = studentProfiles.map((student) => {
        const result = riasecResults[student.id]
        return {
          ...student,
          dominantRiasecCode: result?.dominantCode || null,
          hasTestResult: !!result,
        }
      })

      setStudents(studentsWithRiasec)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load students.'
      setError(msg)
    } finally {
      setLoadingStudents(false)
    }
  }

  // Calculate RIASEC statistics for the selected class
  const riasecStats = useMemo<RiasecStats>(() => {
    const stats: RiasecStats = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }

    for (const student of students) {
      if (!student.dominantRiasecCode) continue

      // Count each letter in the dominant code (e.g., "I-S" counts I and S)
      const codes = student.dominantRiasecCode.split('-').filter(Boolean)
      for (const code of codes) {
        const upperCode = code.toUpperCase()
        if (upperCode in stats) {
          stats[upperCode as keyof RiasecStats]++
        }
      }
    }

    return stats
  }, [students])

  const totalStudentsWithResults = useMemo(() => {
    return students.filter((s) => s.hasTestResult).length
  }, [students])

  if (!isSupabaseConfigured) {
    return (
      <div className="space-y-6 pb-24">
        <PageHeader title="STUDENT OVERVIEW" subtitle="View student RIASEC results by class" />
        <Card>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            Supabase is not configured. Please set your environment variables.
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-24">
      <PageHeader
        title="STUDENT OVERVIEW"
        subtitle="View student RIASEC results by class for counselling reference"
      />

      {error && (
        <div className={cn(
          'rounded-xl border px-4 py-3 text-base font-medium',
          isLight 
            ? 'border-rose-300 bg-rose-50 text-rose-800' 
            : 'border-rose-500/20 bg-rose-500/10 text-rose-200'
        )}>
          {error}
        </div>
      )}

      {/* Class Selector */}
      <Card>
        <div className="space-y-4">
          <div>
            <label htmlFor="class-select" className={cn('block text-base font-semibold mb-2', isLight ? 'text-slate-700' : 'text-slate-400')}>
              Select Class
            </label>
            <select
              id="class-select"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              disabled={loading || classes.length === 0}
              className={cn(
                'w-full rounded-2xl border px-4 py-3 text-base focus:outline-none focus:ring-2 disabled:opacity-60',
                isLight
                  ? 'border-slate-300 bg-white text-slate-900 focus:ring-blue-500/30'
                  : 'border-slate-800/70 bg-slate-950/40 text-slate-100 focus:ring-blue-500/20'
              )}
            >
              {loading ? (
                <option>Loading classes...</option>
              ) : classes.length === 0 ? (
                <option>No classes available</option>
              ) : (
                classes.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))
              )}
            </select>
          </div>
          <div className={cn(
            'rounded-xl border px-4 py-3 text-sm',
            isLight 
              ? 'border-blue-200 bg-blue-50 text-blue-800' 
              : 'border-blue-500/20 bg-blue-500/10 text-blue-200'
          )}>
            <strong>Note:</strong> This overview is for counselling reference only. It provides a high-level view of
            student RIASEC tendencies to support guidance decisions.
          </div>
        </div>
      </Card>

      {/* Summary Statistics */}
      {selectedClass && (
        <Card title="Summary Statistics">
          <div className="space-y-4">
            <div className={cn('text-base', isLight ? 'text-slate-700' : 'text-slate-400')}>
              {students.length} student{students.length !== 1 ? 's' : ''} in {selectedClass}
              {totalStudentsWithResults > 0 && (
                <span className="ml-2">
                  ({totalStudentsWithResults} with test results)
                </span>
              )}
            </div>

            {totalStudentsWithResults > 0 && (
              <div>
                <div className={cn('text-sm font-semibold mb-3 uppercase tracking-wide', isLight ? 'text-slate-700' : 'text-slate-400')}>
                  Students per RIASEC Category
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {(['R', 'I', 'A', 'S', 'E', 'C'] as const).map((code) => {
                    const count = riasecStats[code]
                    const colors = RIASEC_COLORS[code]
                    return (
                      <div
                        key={code}
                        className={cn(
                          'rounded-xl border p-3 text-center',
                          isLight ? colors.bgLight : colors.bg,
                          isLight ? colors.borderLight : colors.border,
                        )}
                      >
                        <div className={cn('text-2xl font-bold mb-1', isLight ? colors.textLight : colors.text)}>{count}</div>
                        <div className={cn('text-sm font-semibold', isLight ? 'text-slate-700' : 'text-slate-300')}>{code}</div>
                        <div className={cn('text-xs mt-1', isLight ? 'text-slate-600' : 'text-slate-500')}>{RIASEC_LABELS[code]}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Student List */}
      {selectedClass && (
        <Card title={`Students in ${selectedClass}`}>
          {loadingStudents ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className={cn('mb-2 text-base', isLight ? 'text-slate-600' : 'text-slate-400')}>Loading students...</div>
                <div className={cn('text-sm', isLight ? 'text-slate-500' : 'text-slate-500')}>Please wait</div>
              </div>
            </div>
          ) : students.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className={cn('mb-2 text-base', isLight ? 'text-slate-600' : 'text-slate-400')}>No students found</div>
                <div className={cn('text-sm', isLight ? 'text-slate-500' : 'text-slate-500')}>This class may be empty</div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800/70">
                      <th className={cn('text-left py-3 px-4 text-sm font-semibold uppercase tracking-wide', isLight ? 'text-slate-700' : 'text-slate-400')}>
                        Name
                      </th>
                      <th className={cn('text-left py-3 px-4 text-sm font-semibold uppercase tracking-wide', isLight ? 'text-slate-700' : 'text-slate-400')}>
                        Class
                      </th>
                      <th className={cn('text-left py-3 px-4 text-sm font-semibold uppercase tracking-wide', isLight ? 'text-slate-700' : 'text-slate-400')}>
                        Dominant RIASEC
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => {
                      const colors = student.dominantRiasecCode
                        ? (() => {
                            const firstCode = student.dominantRiasecCode.split('-')[0]?.toUpperCase()
                            return RIASEC_COLORS[firstCode] || RIASEC_COLORS.I
                          })()
                        : null

                      return (
                        <tr
                          key={student.id}
                          className="border-b border-slate-800/50 hover:bg-slate-950/30 transition"
                        >
                          <td className="py-3 px-4">
                            <div className={cn('text-base font-medium', isLight ? 'text-slate-900' : 'text-slate-100')}>
                              {student.full_name || 'Unnamed Student'}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className={cn('text-base', isLight ? 'text-slate-700' : 'text-slate-300')}>{student.class || '—'}</div>
                          </td>
                          <td className="py-3 px-4">
                            {student.hasTestResult && student.dominantRiasecCode ? (
                              <div className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    'inline-flex items-center justify-center rounded-lg border px-2.5 py-1 text-sm font-semibold',
                                    isLight ? colors.bgLight : colors.bg,
                                    isLight ? colors.borderLight : colors.border,
                                    isLight ? colors.textLight : colors.text,
                                  )}
                                >
                                  {student.dominantRiasecCode}
                                </span>
                              </div>
                            ) : (
                              <span className={cn('text-sm italic', isLight ? 'text-slate-500' : 'text-slate-500')}>No test result</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
