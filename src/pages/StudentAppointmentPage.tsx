import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/PageHeader'
import { Button } from '../components/ui/Button'
import {
  fetchAllTeachers,
  createAppointment,
  fetchStudentAppointments,
  cancelAppointment,
  cancelApprovedAppointment,
  type AppointmentWithNames,
  type TeacherProfileRow,
} from '../lib/appointmentsRepo'
import { isSupabaseConfigured } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useUserProgress } from '../context/UserProgressContext'
import { useTheme } from '../context/ThemeContext'
import { cn } from '../lib/cn'
import { IconX } from '../components/icons'

export function StudentAppointmentPage() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const { markAppointmentCompleted, progress } = useUserProgress()
  const isLight = theme === 'light'
  const [searchParams, setSearchParams] = useSearchParams()
  const view = searchParams.get('view') === 'status' ? 'status' : 'book'
  
  // Check if psychometric test is completed
  const psychometricCompleted = progress.psychometricCompleted
  
  const STATUS_COLORS = isLight
    ? {
        pending: { bg: 'bg-yellow-100', text: 'text-yellow-900', border: 'border-yellow-300' },
        approved: { bg: 'bg-emerald-100', text: 'text-emerald-900', border: 'border-emerald-300' },
        rejected: { bg: 'bg-rose-100', text: 'text-rose-900', border: 'border-rose-300' },
        cancelled: { bg: 'bg-orange-100', text: 'text-orange-900', border: 'border-orange-300' },
      }
    : {
        pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
        approved: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
        rejected: { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/30' },
        cancelled: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
      }
  const [teachers, setTeachers] = useState<TeacherProfileRow[]>([])
  const [appointments, setAppointments] = useState<AppointmentWithNames[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [cancelling, setCancelling] = useState<string | null>(null)
  const [cancelModalOpen, setCancelModalOpen] = useState<string | null>(null)
  const [cancellationReason, setCancellationReason] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [expandedRejected, setExpandedRejected] = useState<Set<string>>(new Set())
  const handleViewChange = (next: 'book' | 'status') => {
    setSearchParams({ view: next })
  }

  // Form state
  const [selectedTeacher, setSelectedTeacher] = useState<string>('')
  const [mode, setMode] = useState<'online' | 'face-to-face'>('online')
  const [date, setDate] = useState<string>('')
  const [time, setTime] = useState<string>('')
  const [reason, setReason] = useState<string>('')

  useEffect(() => {
    if (!isSupabaseConfigured || !user?.id) {
      setError('Supabase is not configured or user not found.')
      setLoading(false)
      return
    }

    loadData()
  }, [user?.id])

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [teachersData, appointmentsData] = await Promise.all([
        fetchAllTeachers().catch((err) => {
          console.error('Error loading teachers:', err)
          return [] as TeacherProfileRow[]
        }),
        fetchStudentAppointments(user!.id).catch((err) => {
          console.error('Error loading appointments:', err)
          return [] as AppointmentWithNames[]
        }),
      ])
      setTeachers(teachersData)
      setAppointments(appointmentsData)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load data.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!selectedTeacher) {
      setError('Please select a teacher.')
      return
    }

    if (!date) {
      setError('Please select a date.')
      return
    }

    if (!time) {
      setError('Please select a time.')
      return
    }

    if (!reason.trim()) {
      setError('Please provide a reason for the appointment.')
      return
    }

    if (!user?.id) {
      setError('User not found.')
      return
    }

    setSubmitting(true)

    try {
      await createAppointment({
        studentId: user.id,
        teacherId: selectedTeacher,
        mode,
        date,
        time,
        reason: reason.trim(),
      })

      setSuccess('Appointment request submitted successfully!')
      markAppointmentCompleted()
      // Reset form
      setSelectedTeacher('')
      setDate('')
      setTime('')
      setReason('')
      setMode('online')

      // Reload appointments
      await loadData()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to submit appointment request.'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCancel(appointmentId: string) {
    const confirmed = window.confirm('Are you sure you want to cancel this appointment?')
    if (!confirmed) return

    setCancelling(appointmentId)
    setError('')
    setSuccess('')

    try {
      await cancelAppointment(appointmentId)
      setSuccess('Appointment cancelled successfully!')
      await loadData()
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to cancel appointment.'
      setError(msg)
    } finally {
      setCancelling(null)
    }
  }

  function handleCancelApprovedClick(appointmentId: string) {
    setCancelModalOpen(appointmentId)
    setCancellationReason('')
    setError('')
  }

  function handleCancelModalCancel() {
    setCancelModalOpen(null)
    setCancellationReason('')
    setError('')
  }

  async function handleCancelApprovedConfirm() {
    if (!cancelModalOpen) return

    if (!cancellationReason.trim()) {
      setError('Please provide a reason for cancellation.')
      return
    }

    setCancelling(cancelModalOpen)
    setError('')
    setSuccess('')

    try {
      await cancelApprovedAppointment(cancelModalOpen, cancellationReason.trim())
      setSuccess('Appointment cancelled successfully!')
      setCancelModalOpen(null)
      setCancellationReason('')
      await loadData()
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to cancel appointment.'
      setError(msg)
    } finally {
      setCancelling(null)
    }
  }

  function formatDate(dateStr: string): string {
    if (!dateStr) return ''
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    } catch {
      return dateStr
    }
  }

  function formatTime(timeStr: string): string {
    if (!timeStr) return ''
    try {
      const [hours, minutes] = timeStr.split(':')
      const hour = parseInt(hours, 10)
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour % 12 || 12
      return `${displayHour}:${minutes} ${ampm}`
    } catch {
      return timeStr
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="space-y-6 pb-24">
        <PageHeader title="APPOINTMENT" subtitle="Book an appointment with your teacher" />
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
      <PageHeader title="APPOINTMENT" subtitle="Book an appointment with your teacher" />

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant={view === 'book' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => handleViewChange('book')}
        >
          Book an Appointment
        </Button>
        <Button
          type="button"
          variant={view === 'status' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => handleViewChange('status')}
        >
          Appointment Status
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-200">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-100">
          {success}
        </div>
      )}

      {view === 'book' && (
        !psychometricCompleted ? (
          <Card title="Book an Appointment">
            <div className={cn(
              "rounded-2xl border p-6 text-center",
              isLight 
                ? "border-amber-200 bg-amber-50" 
                : "border-amber-500/20 bg-amber-500/10"
            )}>
              <div className={cn(
                "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full",
                isLight ? "bg-amber-100" : "bg-amber-500/20"
              )}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isLight ? "text-amber-600" : "text-amber-400"}>
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <h3 className={cn(
                "text-lg font-semibold mb-2",
                isLight ? "text-slate-900" : "text-slate-100"
              )}>
                Complete Your Psychometric Test First
              </h3>
              <p className={cn(
                "text-sm mb-6",
                isLight ? "text-slate-600" : "text-slate-400"
              )}>
                Before booking an appointment with a teacher, please complete the psychometric test to help your teacher better understand your career interests and guide you effectively.
              </p>
              <Link
                to="/psychometric-test"
                className={cn(
                  "inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold transition-all",
                  isLight 
                    ? "bg-blue-500 text-white hover:bg-blue-600 shadow-md" 
                    : "bg-blue-600/20 text-blue-100 ring-1 ring-blue-500/25 hover:bg-blue-600/30"
                )}
              >
                Take Psychometric Test
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </div>
          </Card>
        ) : (
        <Card title="Book an Appointment">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="teacher-select" className={cn("block text-sm font-semibold mb-2", isLight ? "text-slate-600" : "text-slate-400")}>
                Select Teacher
              </label>
              <select
                id="teacher-select"
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                disabled={loading || submitting}
                required
                className={cn(
                  "w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60",
                  isLight 
                    ? "border-slate-200 bg-white text-slate-900" 
                    : "border-slate-800/70 bg-slate-950/40 text-slate-100"
                )}
              >
                <option value="">Select a teacher...</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.full_name || teacher.email || 'Teacher'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={cn("block text-sm font-semibold mb-2", isLight ? "text-slate-600" : "text-slate-400")}>Appointment Mode</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    value="online"
                    checked={mode === 'online'}
                    onChange={(e) => setMode(e.target.value as 'online' | 'face-to-face')}
                    disabled={submitting}
                    className="w-4 h-4 text-blue-500 border-slate-700/50 bg-slate-950/40 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <span className={cn("text-sm", isLight ? "text-slate-700" : "text-slate-300")}>Online</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    value="face-to-face"
                    checked={mode === 'face-to-face'}
                    onChange={(e) => setMode(e.target.value as 'online' | 'face-to-face')}
                    disabled={submitting}
                    className="w-4 h-4 text-blue-500 border-slate-700/50 bg-slate-950/40 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <span className={cn("text-sm", isLight ? "text-slate-700" : "text-slate-300")}>Face-to-Face</span>
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-semibold text-slate-400 mb-2">
                Select Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  disabled={submitting}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full rounded-2xl border border-slate-800/70 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                />
                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>

            <div>
              <label htmlFor="time" className="block text-sm font-semibold text-slate-400 mb-2">
                Select Time
              </label>
              <div className="relative">
                <input
                  type="time"
                  id="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  disabled={submitting}
                  required
                  className="w-full rounded-2xl border border-slate-800/70 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                />
                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-semibold text-slate-400 mb-2">
                Reason for Appointment
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={submitting}
                required
                rows={4}
                placeholder="Briefly describe your reason."
                className="w-full rounded-2xl border border-slate-800/70 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 resize-none"
              />
            </div>

            <Button type="submit" variant="primary" disabled={submitting || loading} className="w-full">
              {submitting ? 'Submitting...' : 'Request Appointment'}
            </Button>
          </form>
        </Card>
        )
      )}

      {view === 'status' &&
        (loading ? (
          <Card title="Appointment Status">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mb-2 text-sm text-slate-400">Loading appointments...</div>
                <div className="text-xs text-slate-500">Please wait</div>
              </div>
            </div>
          </Card>
        ) : appointments.length === 0 ? (
          <Card title="Appointment Status">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mb-2 text-sm text-slate-400">No appointments yet</div>
                <div className="text-xs text-slate-500">Book your first appointment above</div>
              </div>
            </div>
          </Card>
        ) : (
          <>
            {(() => {
              const approved = appointments.filter((a) => a.status === 'approved')
              const pending = appointments.filter((a) => a.status === 'pending')
              const cancelled = appointments.filter((a) => a.status === 'cancelled')
              const rejected = appointments.filter((a) => a.status === 'rejected')

              return (
                <div className="space-y-6">
                  {approved.length > 0 && (
                    <Card>
                      <div className="mb-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wide">Approved Appointments</h3>
                        <p className="mt-1 text-xs text-slate-400">
                          {approved.length} confirmed appointment{approved.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="space-y-3">
                        {approved.map((appointment) => (
                          <div
                            key={appointment.id}
                            className="rounded-lg border border-slate-800/70 bg-slate-950/40 p-4"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                  <span
                                    className={cn(
                                      'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold shrink-0',
                                      STATUS_COLORS.approved.bg,
                                      STATUS_COLORS.approved.border,
                                      STATUS_COLORS.approved.text,
                                    )}
                                  >
                                    Approved
                                  </span>
                                  <span className="text-sm font-medium text-slate-100">
                                    {formatTime(appointment.time)}
                                  </span>
                                  <span className="text-sm text-slate-300">{formatDate(appointment.date)}</span>
                                  <span className="text-xs text-slate-400 capitalize">{appointment.mode}</span>
                                </div>
                                <div className="text-sm font-medium text-slate-200 mb-1">
                                  {appointment.teacher_name || 'Teacher'}
                                </div>
                                {appointment.reason && (
                                  <div className="text-xs text-slate-400 mt-2 line-clamp-2">{appointment.reason}</div>
                                )}
                              </div>
                            </div>
                            {(appointment.meeting_link || appointment.meeting_place || appointment.meeting_note) && (
                              <div className="mt-4 pt-4 border-t border-emerald-500/30">
                                <div className="mb-3">
                                  <h4 className="text-sm font-semibold text-emerald-400 uppercase tracking-wide">
                                    Next Step
                                  </h4>
                                </div>
                                <div className="space-y-3">
                                  {appointment.mode === 'online' && appointment.meeting_link && (
                                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3">
                                      <div className="text-xs text-emerald-400/80 mb-1 font-semibold uppercase tracking-wide">
                                        Meeting Link
                                      </div>
                                      <a
                                        href={appointment.meeting_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-400 hover:text-blue-300 underline break-all"
                                      >
                                        {appointment.meeting_link}
                                      </a>
                                    </div>
                                  )}

                                  {appointment.mode === 'face-to-face' && appointment.meeting_place && (
                                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3">
                                      <div className="text-xs text-emerald-400/80 mb-1 font-semibold uppercase tracking-wide">
                                        Meeting Place
                                      </div>
                                      <div className="text-sm text-slate-100">
                                        {appointment.meeting_place}
                                      </div>
                                    </div>
                                  )}

                                  {appointment.mode === 'online' && appointment.meeting_place && (
                                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3">
                                      <div className="text-xs text-emerald-400/80 mb-1 font-semibold uppercase tracking-wide">
                                        Place
                                      </div>
                                      <div className="text-sm text-slate-100">
                                        {appointment.meeting_place}
                                      </div>
                                    </div>
                                  )}

                                  {appointment.meeting_note && (
                                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3">
                                      <div className="text-xs text-emerald-400/80 mb-1 font-semibold uppercase tracking-wide">
                                        Notes
                                      </div>
                                      <div className="text-sm text-slate-100 whitespace-pre-wrap">
                                        {appointment.meeting_note}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            <div className="mt-4 pt-4 border-t border-emerald-500/30">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleCancelApprovedClick(appointment.id)}
                                disabled={cancelling === appointment.id}
                                className="text-xs"
                              >
                                Request Cancellation
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {pending.length > 0 && (
                    <Card>
                      <div className="mb-4">
                        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                          Pending Appointments
                        </h3>
                        <p className="mt-1 text-xs text-slate-400">
                          {pending.length} awaiting response{pending.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-slate-800/70">
                              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                                Teacher
                              </th>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                                Date
                              </th>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                                Time
                              </th>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {pending.map((appointment) => (
                              <tr
                                key={appointment.id}
                                className="border-b border-slate-800/50 hover:bg-slate-950/30 transition"
                              >
                                <td className="py-3 px-4">
                                  <div className="text-sm text-slate-100">{appointment.teacher_name || 'Teacher'}</div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="text-sm text-slate-300">{formatDate(appointment.date)}</div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="text-sm text-slate-300">{formatTime(appointment.time)}</div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={cn(
                                          'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold',
                                          STATUS_COLORS.pending.bg,
                                          STATUS_COLORS.pending.border,
                                          STATUS_COLORS.pending.text,
                                        )}
                                      >
                                        Pending
                                      </span>
                                      <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => handleCancel(appointment.id)}
                                        disabled={cancelling === appointment.id}
                                        className="text-xs"
                                      >
                                        {cancelling === appointment.id ? 'Cancelling...' : 'Cancel'}
                                      </Button>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  )}

                  {cancelled.length > 0 && (
                    <Card>
                      <div className="mb-4">
                        <h3
                          className={cn(
                            'text-sm font-semibold uppercase tracking-wide',
                            isLight ? 'text-slate-900' : '',
                          )}
                        >
                          Cancelled Appointments
                        </h3>
                        <p
                          className={cn(
                            'mt-1 text-xs',
                            isLight ? 'text-slate-600' : 'text-slate-400',
                          )}
                        >
                          {cancelled.length} cancelled appointment{cancelled.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="space-y-2">
                        {cancelled.map((appointment) => {
                          const isExpanded = expandedRejected.has(appointment.id)
                          return (
                            <div
                              key={appointment.id}
                              className={cn(
                                'rounded-lg border',
                                isLight ? 'border-slate-200 bg-white' : 'border-slate-800/50 bg-slate-950/20',
                              )}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  const newExpanded = new Set(expandedRejected)
                                  if (isExpanded) {
                                    newExpanded.delete(appointment.id)
                                  } else {
                                    newExpanded.add(appointment.id)
                                  }
                                  setExpandedRejected(newExpanded)
                                }}
                                className={cn(
                                  'w-full p-3 flex items-center justify-between gap-3 text-left transition',
                                  isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-950/30',
                                )}
                              >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  <span
                                    className={cn(
                                      'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold shrink-0',
                                      STATUS_COLORS.cancelled.bg,
                                      STATUS_COLORS.cancelled.border,
                                      STATUS_COLORS.cancelled.text,
                                    )}
                                  >
                                    Cancelled
                                  </span>
                                  <span
                                    className={cn(
                                      'text-sm font-medium truncate',
                                      isLight ? 'text-slate-700' : 'text-slate-300',
                                    )}
                                  >
                                    {appointment.teacher_name || 'Teacher'}
                                  </span>
                                  <span
                                    className={cn(
                                      'text-xs shrink-0',
                                      isLight ? 'text-slate-600' : 'text-slate-400',
                                    )}
                                  >
                                    {formatDate(appointment.date)}
                                  </span>
                                </div>
                                <svg
                                  className={cn(
                                    'w-4 h-4 shrink-0 transition-transform',
                                    isLight ? 'text-slate-600' : 'text-slate-400',
                                    isExpanded && 'rotate-180',
                                  )}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                              {isExpanded && (
                                <div
                                  className={cn(
                                    'px-3 pb-3 pt-2 border-t space-y-2',
                                    isLight ? 'border-slate-200' : 'border-slate-800/30',
                                  )}
                                >
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                      <span className={cn(isLight ? 'text-slate-600' : 'text-slate-400')}>Time:</span>
                                      <span
                                        className={cn(
                                          'ml-2',
                                          isLight ? 'text-slate-700' : 'text-slate-300',
                                        )}
                                      >
                                        {formatTime(appointment.time)}
                                      </span>
                                    </div>
                                    <div>
                                      <span className={cn(isLight ? 'text-slate-600' : 'text-slate-400')}>Mode:</span>
                                      <span
                                        className={cn(
                                          'ml-2 capitalize',
                                          isLight ? 'text-slate-700' : 'text-slate-300',
                                        )}
                                      >
                                        {appointment.mode}
                                      </span>
                                    </div>
                                  </div>
                                  {appointment.reason && (
                                    <div
                                      className={cn(
                                        'pt-2 border-t',
                                        isLight ? 'border-slate-200' : 'border-slate-800/30',
                                      )}
                                    >
                                      <div
                                        className={cn(
                                          'text-xs mb-1',
                                          isLight ? 'text-slate-600' : 'text-slate-400',
                                        )}
                                      >
                                        Reason:
                                      </div>
                                      <div
                                        className={cn(
                                          'text-xs',
                                          isLight ? 'text-slate-700' : 'text-slate-300',
                                        )}
                                      >
                                        {appointment.reason}
                                      </div>
                                    </div>
                                  )}
                                  {appointment.cancellation_reason && (
                                    <div
                                      className={cn(
                                        'pt-2 border-t',
                                        isLight ? 'border-slate-200' : 'border-slate-800/30',
                                      )}
                                    >
                                      <div
                                        className={cn(
                                          'text-xs mb-1',
                                          isLight ? 'text-slate-600' : 'text-slate-400',
                                        )}
                                      >
                                        Cancellation Reason:
                                      </div>
                                      <div
                                        className={cn(
                                          'text-xs',
                                          isLight ? 'text-slate-700' : 'text-slate-300',
                                        )}
                                      >
                                        {appointment.cancellation_reason}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </Card>
                  )}

                  {rejected.length > 0 && (
                    <Card>
                      <div className="mb-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wide">Rejected Appointments</h3>
                        <p className="mt-1 text-xs text-slate-400">
                          {rejected.length} rejected appointment{rejected.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="space-y-2">
                        {rejected.map((appointment) => {
                          const isExpanded = expandedRejected.has(appointment.id)
                          return (
                            <div
                              key={appointment.id}
                              className="rounded-lg border border-slate-800/50 bg-slate-950/20"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  const newExpanded = new Set(expandedRejected)
                                  if (isExpanded) {
                                    newExpanded.delete(appointment.id)
                                  } else {
                                    newExpanded.add(appointment.id)
                                  }
                                  setExpandedRejected(newExpanded)
                                }}
                                className="w-full p-3 flex items-center justify-between gap-3 text-left hover:bg-slate-950/30 transition"
                              >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  <span
                                    className={cn(
                                      'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold shrink-0',
                                      STATUS_COLORS.rejected.bg,
                                      STATUS_COLORS.rejected.border,
                                      STATUS_COLORS.rejected.text,
                                    )}
                                  >
                                    Rejected
                                  </span>
                                  <span className="text-sm font-medium text-slate-300 truncate">
                                    {appointment.teacher_name || 'Teacher'}
                                  </span>
                                  <span className="text-xs text-slate-400 shrink-0">{formatDate(appointment.date)}</span>
                                </div>
                                <svg
                                  className={cn(
                                    'w-4 h-4 text-slate-400 shrink-0 transition-transform',
                                    isExpanded && 'rotate-180',
                                  )}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                              {isExpanded && (
                                <div className="px-3 pb-3 pt-2 border-t border-slate-800/30 space-y-2">
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                      <span className="text-slate-400">Time:</span>
                                      <span className="ml-2 text-slate-300">{formatTime(appointment.time)}</span>
                                    </div>
                                    <div>
                                      <span className="text-slate-400">Mode:</span>
                                      <span className="ml-2 text-slate-300 capitalize">{appointment.mode}</span>
                                    </div>
                                  </div>
                                  {appointment.reason && (
                                    <div className="pt-2 border-t border-slate-800/30">
                                      <div className="text-xs text-slate-400 mb-1">Reason:</div>
                                      <div className="text-xs text-slate-300">{appointment.reason}</div>
                                    </div>
                                  )}
                                  {appointment.rejection_reason && (
                                    <div className="pt-2 border-t border-slate-800/30">
                                      <div className="text-xs text-slate-400 mb-1">Rejection Reason:</div>
                                      <div className="text-xs text-slate-300">{appointment.rejection_reason}</div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </Card>
                  )}
                </div>
              )
            })()}
          </>
        ))}

      {/* Cancellation Modal */}
      {cancelModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCancelModalCancel()
            }
          }}
        >
          <Card className="w-full max-w-md">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-100">Request Cancellation</h3>
                <button
                  type="button"
                  onClick={handleCancelModalCancel}
                  className="text-slate-400 hover:text-slate-200 transition"
                  aria-label="Close"
                >
                  <IconX size={20} />
                </button>
              </div>

              <div>
                <label htmlFor="cancellation-reason" className="block text-sm font-semibold text-slate-400 mb-2">
                  Reason for Cancellation <span className="text-rose-400">*</span>
                </label>
                <textarea
                  id="cancellation-reason"
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  disabled={cancelling === cancelModalOpen}
                  required
                  rows={4}
                  placeholder="Please provide a reason for cancelling this appointment..."
                  className="w-full rounded-2xl border border-slate-800/70 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 resize-none"
                />
                <div className="mt-1 text-xs text-slate-500">
                  This reason will be visible to the teacher.
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleCancelApprovedConfirm}
                  disabled={cancelling === cancelModalOpen || !cancellationReason.trim()}
                  className="flex-1"
                >
                  {cancelling === cancelModalOpen ? 'Processing...' : 'Confirm Cancellation'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancelModalCancel}
                  disabled={cancelling === cancelModalOpen}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
