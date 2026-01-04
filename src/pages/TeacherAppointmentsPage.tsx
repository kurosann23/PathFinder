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

const STATUS_COLORS = {
  pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  approved: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  rejected: { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/30' },
}

export function TeacherAppointmentsPage() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<AppointmentWithNames[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [rejectModalOpen, setRejectModalOpen] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState<string>('')
  const [approveModalOpen, setApproveModalOpen] = useState<string | null>(null)
  const [meetingLink, setMeetingLink] = useState<string>('')
  const [meetingPlace, setMeetingPlace] = useState<string>('')
  const [meetingNote, setMeetingNote] = useState<string>('')
  const [expandedRejected, setExpandedRejected] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!isSupabaseConfigured || !user?.id) {
      setError('Supabase is not configured or user not found.')
      setLoading(false)
      return
    }

    loadAppointments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  function handleApproveClick(appointmentId: string) {
    setApproveModalOpen(appointmentId)
    setMeetingLink('')
    setMeetingPlace('')
    setMeetingNote('')
    setError('')
  }

  function handleApproveCancel() {
    setApproveModalOpen(null)
    setMeetingLink('')
    setMeetingPlace('')
    setMeetingNote('')
    setError('')
  }

  async function handleApproveConfirm() {
    if (!approveModalOpen) return

    setUpdating(approveModalOpen)
    setError('')
    setSuccess('')

    try {
      await updateAppointmentStatus(
        approveModalOpen,
        'approved',
        undefined,
        meetingLink.trim() || undefined,
        meetingPlace.trim() || undefined,
        meetingNote.trim() || undefined,
      )
      setSuccess('Appointment approved successfully!')
      setApproveModalOpen(null)
      setMeetingLink('')
      setMeetingPlace('')
      setMeetingNote('')
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
                <h3 className="text-sm font-semibold uppercase tracking-wide">Approved Appointments</h3>
                <p className="mt-1 text-xs text-slate-400">
                  {approvedAppointments.length} confirmed appointment{approvedAppointments.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="space-y-3">
                {approvedAppointments.map((appointment) => (
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
                          {appointment.student_name || 'Student'}
                        </div>
                        {appointment.reason && (
                          <div className="text-xs text-slate-400 mt-2 line-clamp-2">{appointment.reason}</div>
                        )}
                        {(appointment.meeting_link || appointment.meeting_place || appointment.meeting_note) && (
                          <div className="mt-3 pt-3 border-t border-slate-800/50 space-y-1">
                            {appointment.meeting_link && (
                              <div>
                                <div className="text-xs text-slate-400 mb-1">Meeting Link:</div>
                                <a
                                  href={appointment.meeting_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-400 hover:text-blue-300 underline break-all"
                                >
                                  {appointment.meeting_link}
                                </a>
                              </div>
                            )}
                            {appointment.meeting_place && (
                              <div>
                                <div className="text-xs text-slate-400 mb-1">Place:</div>
                                <div className="text-xs text-slate-200">{appointment.meeting_place}</div>
                              </div>
                            )}
                            {appointment.meeting_note && (
                              <div>
                                <div className="text-xs text-slate-400 mb-1">Notes:</div>
                                <div className="text-xs text-slate-200 whitespace-pre-wrap">{appointment.meeting_note}</div>
                              </div>
                            )}
                          </div>
                        )}
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
                        onClick={() => handleApproveClick(appointment.id)}
                        disabled={updating === appointment.id}
                        className="flex-1"
                      >
                        Approve
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
                <h3 className="text-sm font-semibold uppercase tracking-wide">Rejected / Cancelled</h3>
                <p className="mt-1 text-xs text-slate-400">
                  {rejectedAppointments.length} appointment{rejectedAppointments.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="space-y-2">
                {rejectedAppointments.map((appointment) => {
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
                            {appointment.student_name || 'Student'}
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

      {/* Approval Modal */}
      {approveModalOpen && (() => {
        const appointment = appointments.find((a) => a.id === approveModalOpen)
        const isOnline = appointment?.mode === 'online'
        
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleApproveCancel()
              }
            }}
          >
            <Card className="w-full max-w-md">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-100">Approve Appointment</h3>
                  <button
                    type="button"
                    onClick={handleApproveCancel}
                    className="text-slate-400 hover:text-slate-200 transition"
                    aria-label="Close"
                  >
                    <IconX size={20} />
                  </button>
                </div>

                {/* Meeting Link - Show only for online appointments */}
                {isOnline && (
                  <div>
                    <label htmlFor="meeting-link" className="block text-sm font-semibold text-slate-400 mb-2">
                      Meeting Link
                    </label>
                    <input
                      type="text"
                      id="meeting-link"
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      disabled={updating === approveModalOpen}
                      placeholder="Optional: e.g., https://zoom.us/j/..."
                      className="w-full rounded-2xl border border-slate-800/70 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                    />
                  </div>
                )}

                {/* Meeting Place - Show for both online and face-to-face */}
                <div>
                  <label htmlFor="meeting-place" className="block text-sm font-semibold text-slate-400 mb-2">
                    Place
                  </label>
                  <input
                    type="text"
                    id="meeting-place"
                    value={meetingPlace}
                    onChange={(e) => setMeetingPlace(e.target.value)}
                    disabled={updating === approveModalOpen}
                    placeholder={isOnline ? "Optional: e.g., Zoom Room 1, Google Meet" : "Optional: e.g., Room 201, Building A"}
                    className="w-full rounded-2xl border border-slate-800/70 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                  />
                </div>

                {/* Meeting Notes - Optional */}
                <div>
                  <label htmlFor="meeting-note" className="block text-sm font-semibold text-slate-400 mb-2">
                    Notes
                  </label>
                  <textarea
                    id="meeting-note"
                    value={meetingNote}
                    onChange={(e) => setMeetingNote(e.target.value)}
                    disabled={updating === approveModalOpen}
                    rows={3}
                    placeholder="Optional: Additional instructions or notes..."
                    className="w-full rounded-2xl border border-slate-800/70 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleApproveConfirm}
                    disabled={updating === approveModalOpen}
                    className="flex-1"
                  >
                    {updating === approveModalOpen ? 'Processing...' : 'Confirm Approve'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleApproveCancel}
                    disabled={updating === approveModalOpen}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )
      })()}

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
