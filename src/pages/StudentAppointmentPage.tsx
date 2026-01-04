import { useEffect, useState } from 'react'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/PageHeader'
import { Button } from '../components/ui/Button'
import {
  fetchAllTeachers,
  createAppointment,
  fetchStudentAppointments,
  cancelAppointment,
  type AppointmentWithNames,
  type TeacherProfileRow,
} from '../lib/appointmentsRepo'
import { isSupabaseConfigured } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { cn } from '../lib/cn'

const STATUS_COLORS = {
  pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  approved: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  rejected: { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/30' },
}

export function StudentAppointmentPage() {
  const { user } = useAuth()
  const [teachers, setTeachers] = useState<TeacherProfileRow[]>([])
  const [appointments, setAppointments] = useState<AppointmentWithNames[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [cancelling, setCancelling] = useState<string | null>(null)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')

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

      {/* Book Appointment Form */}
      <Card title="Book an Appointment">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="teacher-select" className="block text-sm font-semibold text-slate-400 mb-2">
              Select Teacher
            </label>
            <select
              id="teacher-select"
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              disabled={loading || submitting}
              required
              className="w-full rounded-2xl border border-slate-800/70 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
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
            <label className="block text-sm font-semibold text-slate-400 mb-2">Appointment Mode</label>
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
                <span className="text-sm text-slate-300">Online</span>
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
                <span className="text-sm text-slate-300">Face-to-Face</span>
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

      {/* Appointment History */}
      {loading ? (
        <Card title="Appointment History">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-2 text-sm text-slate-400">Loading appointments...</div>
              <div className="text-xs text-slate-500">Please wait</div>
            </div>
          </div>
        </Card>
      ) : appointments.length === 0 ? (
        <Card title="Appointment History">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-2 text-sm text-slate-400">No appointments yet</div>
              <div className="text-xs text-slate-500">Book your first appointment above</div>
            </div>
          </div>
        </Card>
      ) : (
        <>
          {/* Group appointments by status */}
          {(() => {
            const approved = appointments.filter((a) => a.status === 'approved')
            const pending = appointments.filter((a) => a.status === 'pending')
            const rejected = appointments.filter((a) => a.status === 'rejected')

            return (
              <div className="space-y-6">
                {/* Approved Appointments - Top Priority */}
                {approved.length > 0 && (
                  <Card>
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wide">
                        Approved Appointments
                      </h3>
                      <p className="mt-1 text-xs text-slate-400">
                        {approved.length} confirmed appointment{approved.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-emerald-500/20">
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
                          {approved.map((appointment) => (
                            <tr
                              key={appointment.id}
                              className="border-b border-emerald-500/10 hover:bg-emerald-500/5 transition"
                            >
                              <td className="py-3 px-4">
                                <div className="text-sm font-medium text-slate-100">
                                  {appointment.teacher_name || 'Teacher'}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="text-sm text-slate-200">{formatDate(appointment.date)}</div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="text-sm text-slate-200">{formatTime(appointment.time)}</div>
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={cn(
                                    'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold',
                                    STATUS_COLORS.approved.bg,
                                    STATUS_COLORS.approved.border,
                                    STATUS_COLORS.approved.text,
                                  )}
                                >
                                  Approved
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                )}

                {/* Pending Appointments */}
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

                {/* Rejected / Cancelled Appointments */}
                {rejected.length > 0 && (
                  <Card>
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                        Rejected / Cancelled
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {rejected.length} appointment{rejected.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-800/50">
                            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                              Teacher
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                              Date
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                              Time
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {rejected.map((appointment) => (
                            <tr
                              key={appointment.id}
                              className="border-b border-slate-800/30 hover:bg-slate-950/20 transition opacity-75"
                            >
                              <td className="py-3 px-4">
                                <div className="text-sm text-slate-400">{appointment.teacher_name || 'Teacher'}</div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="text-sm text-slate-500">{formatDate(appointment.date)}</div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="text-sm text-slate-500">{formatTime(appointment.time)}</div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="space-y-2">
                                  <span
                                    className={cn(
                                      'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold',
                                      STATUS_COLORS.rejected.bg,
                                      STATUS_COLORS.rejected.border,
                                      STATUS_COLORS.rejected.text,
                                    )}
                                  >
                                    Rejected
                                  </span>
                                  {appointment.rejection_reason && (
                                    <div className="pt-2 border-t border-slate-800/30">
                                      <div className="text-xs text-slate-500 mb-1">Reason:</div>
                                      <div className="text-xs text-slate-400">{appointment.rejection_reason}</div>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                )}
              </div>
            )
          })()}
        </>
      )}
    </div>
  )
}
