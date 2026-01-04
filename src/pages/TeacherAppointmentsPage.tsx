import { useEffect, useState } from 'react'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/PageHeader'
import { Button } from '../components/ui/Button'
import {
  fetchTeacherAppointments,
  updateAppointmentStatus,
  type AppointmentWithNames,
} from '../lib/appointmentsRepo'
import { isSupabaseConfigured } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { cn } from '../lib/cn'
import { IconX } from '../components/icons'

export function TeacherAppointmentsPage() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<AppointmentWithNames[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [rejectModalOpen, setRejectModalOpen] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState<string>('')

  useEffect(() => {
    if (!isSupabaseConfigured || !user?.id) {
      setError('Supabase is not configured or user not found.')
      setLoading(false)
      return
    }

    loadAppointments()
  }, [user?.id])

  async function loadAppointments() {
    setLoading(true)
    setError('')
    try {
      const data = await fetchTeacherAppointments(user!.id)
      setAppointments(data)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load appointments.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove(appointmentId: string) {
    setUpdating(appointmentId)
    setError('')
    setSuccess('')

    try {
      await updateAppointmentStatus(appointmentId, 'approved')
      setSuccess('Appointment approved successfully!')
      await loadAppointments()
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to approve appointment.'
      setError(msg)
    } finally {
      setUpdating(null)
    }
  }

  function handleRejectClick(appointmentId: string) {
    setRejectModalOpen(appointmentId)
    setRejectionReason('')
    setError('')
  }

  function handleRejectCancel() {
    setRejectModalOpen(null)
    setRejectionReason('')
    setError('')
  }

  async function handleRejectConfirm() {
    if (!rejectModalOpen) return

    if (!rejectionReason.trim()) {
      setError('Please provide a reason for rejection.')
      return
    }

    setUpdating(rejectModalOpen)
    setError('')
    setSuccess('')

    try {
      await updateAppointmentStatus(rejectModalOpen, 'rejected', rejectionReason.trim())
      setSuccess('Appointment rejected successfully!')
      setRejectModalOpen(null)
      setRejectionReason('')
      await loadAppointments()
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to reject appointment.'
      setError(msg)
    } finally {
      setUpdating(null)
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

  // Group appointments by status (priority order: Approved, Pending, Rejected)
  const approvedAppointments = appointments.filter((a) => a.status === 'approved')
  const pendingAppointments = appointments.filter((a) => a.status === 'pending')
  const rejectedAppointments = appointments.filter((a) => a.status === 'rejected')

  if (!isSupabaseConfigured) {
    return (
      <div className="space-y-6 pb-24">
        <PageHeader title="APPOINTMENTS" subtitle="Manage appointment requests from students" />
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
      <PageHeader title="APPOINTMENTS" subtitle="Manage appointment requests from students" />

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

      {/* Pending Appointments */}
      {loading ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-2 text-sm text-slate-400">Loading appointments...</div>
              <div className="text-xs text-slate-500">Please wait</div>
            </div>
          </div>
        </Card>
      ) : (
        <>
          {/* Approved Appointments - Top Priority */}
          {approvedAppointments.length > 0 && (
            <Card>
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wide">
                  Approved Appointments
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  {approvedAppointments.length} confirmed appointment{approvedAppointments.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="space-y-4">
                {approvedAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="text-lg font-semibold text-slate-100">
                            {appointment.student_name || 'Student'}
                          </div>
                          <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
                            Approved
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-slate-200">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">Mode:</span>
                            <span className="font-medium capitalize">{appointment.mode}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">Date:</span>
                            <span className="font-medium">{formatDate(appointment.date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">Time:</span>
                            <span className="font-medium">{formatTime(appointment.time)}</span>
                          </div>
                          {appointment.reason && (
                            <div className="mt-2 pt-2 border-t border-emerald-500/10">
                              <div className="text-slate-400 mb-1">Reason:</div>
                              <div className="text-slate-200">{appointment.reason}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Pending Appointments */}
          {pendingAppointments.length > 0 && (
            <Card>
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                  Appointment Requests
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  {pendingAppointments.length} awaiting response{pendingAppointments.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="space-y-4">
                {pendingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="rounded-xl border border-slate-800/70 bg-slate-950/40 p-5 space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-lg font-semibold text-slate-100 mb-1">
                          {appointment.student_name || 'Student'}
                        </div>
                        <div className="space-y-2 text-sm text-slate-300">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">Mode:</span>
                            <span className="font-medium capitalize">{appointment.mode}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">Date:</span>
                            <span className="font-medium">{formatDate(appointment.date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">Time:</span>
                            <span className="font-medium">{formatTime(appointment.time)}</span>
                          </div>
                          <div className="mt-3 pt-3 border-t border-slate-800/70">
                            <div className="text-slate-400 mb-1">Reason:</div>
                            <div className="text-slate-200">{appointment.reason}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button
                        variant="primary"
                        onClick={() => handleApprove(appointment.id)}
                        disabled={updating === appointment.id}
                        className="flex-1"
                      >
                        {updating === appointment.id ? 'Processing...' : 'Approve'}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleRejectClick(appointment.id)}
                        disabled={updating === appointment.id}
                        className="flex-1"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Rejected / Cancelled Appointments */}
          {rejectedAppointments.length > 0 && (
            <Card>
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                  Rejected / Cancelled
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {rejectedAppointments.length} appointment{rejectedAppointments.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="space-y-4">
                {rejectedAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="rounded-xl border border-slate-800/50 bg-slate-950/20 p-5 opacity-75"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="text-lg font-semibold text-slate-400">
                            {appointment.student_name || 'Student'}
                          </div>
                          <span className="inline-flex items-center rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-400">
                            Rejected
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-slate-400">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500">Mode:</span>
                            <span className="font-medium capitalize">{appointment.mode}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500">Date:</span>
                            <span className="font-medium">{formatDate(appointment.date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500">Time:</span>
                            <span className="font-medium">{formatTime(appointment.time)}</span>
                          </div>
                          {appointment.reason && (
                            <div className="mt-2 pt-2 border-t border-slate-800/30">
                              <div className="text-slate-500 mb-1">Reason:</div>
                              <div className="text-slate-400">{appointment.reason}</div>
                            </div>
                          )}
                          {appointment.rejection_reason && (
                            <div className="mt-2 pt-2 border-t border-slate-800/30">
                              <div className="text-slate-500 mb-1">Rejection Reason:</div>
                              <div className="text-slate-400">{appointment.rejection_reason}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {appointments.length === 0 && (
            <Card>
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="mb-2 text-sm text-slate-400">No appointments yet</div>
                  <div className="text-xs text-slate-500">Appointment requests will appear here</div>
                </div>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Rejection Modal */}
      {rejectModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleRejectCancel()
            }
          }}
        >
          <Card className="w-full max-w-md">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-100">Reject Appointment</h3>
                <button
                  type="button"
                  onClick={handleRejectCancel}
                  className="text-slate-400 hover:text-slate-200 transition"
                  aria-label="Close"
                >
                  <IconX size={20} />
                </button>
              </div>

              <div>
                <label htmlFor="rejection-reason" className="block text-sm font-semibold text-slate-400 mb-2">
                  Reason for Rejection <span className="text-rose-400">*</span>
                </label>
                <textarea
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  disabled={updating === rejectModalOpen}
                  required
                  rows={4}
                  placeholder="Please provide a reason for rejecting this appointment..."
                  className="w-full rounded-2xl border border-slate-800/70 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 resize-none"
                />
                <div className="mt-1 text-xs text-slate-500">
                  This message will be visible to the student.
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleRejectConfirm}
                  disabled={updating === rejectModalOpen || !rejectionReason.trim()}
                  className="flex-1"
                >
                  {updating === rejectModalOpen ? 'Processing...' : 'Confirm Reject'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleRejectCancel}
                  disabled={updating === rejectModalOpen}
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
