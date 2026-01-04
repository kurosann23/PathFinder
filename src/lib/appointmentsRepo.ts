import { supabase } from './supabaseClient'
import type { TeacherProfileRow } from './profileRepo'

export type AppointmentRow = {
  id: string
  student_id: string
  teacher_id: string
  mode: 'online' | 'face-to-face'
  date: string
  time: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  rejection_reason: string | null
  created_at: string | null
  updated_at: string | null
}

export type AppointmentWithNames = AppointmentRow & {
  student_name: string | null
  teacher_name: string | null
}

/**
 * Fetch all teachers (for student dropdown)
 * Students need to see available teachers to book appointments
 */
export async function fetchAllTeachers(): Promise<TeacherProfileRow[]> {
  if (!supabase) throw new Error('Supabase not configured')

  // Note: This requires an RLS policy allowing students to read teacher profiles
  // For now, we'll try to fetch. If it fails, the RLS policy needs to be added.
  const { data, error } = await supabase
    .from('teacher_profiles')
    .select('*')
    .order('full_name', { ascending: true, nullsFirst: false })

  if (error) {
    const msg = error.message || 'Failed to fetch teachers.'
    throw new Error(`${msg} (Check RLS policies for students to read teacher_profiles.)`)
  }

  return (data as TeacherProfileRow[]) || []
}

/**
 * Create a new appointment request (student only)
 */
export async function createAppointment(input: {
  studentId: string
  teacherId: string
  mode: 'online' | 'face-to-face'
  date: string
  time: string
  reason: string
}): Promise<AppointmentRow> {
  if (!supabase) throw new Error('Supabase not configured')

  const { data, error } = await supabase
    .from('appointments')
    .insert({
      student_id: input.studentId,
      teacher_id: input.teacherId,
      mode: input.mode,
      date: input.date,
      time: input.time,
      reason: input.reason,
      status: 'pending',
    })
    .select('*')
    .single()

  if (error) {
    const msg = error.message || 'Failed to create appointment.'
    throw new Error(`${msg} (Check RLS policies for appointments INSERT.)`)
  }

  return data as AppointmentRow
}

/**
 * Fetch appointments for a student (student's own appointments)
 */
export async function fetchStudentAppointments(studentId: string): Promise<AppointmentWithNames[]> {
  if (!supabase) throw new Error('Supabase not configured')

  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('student_id', studentId)
    .order('date', { ascending: false })
    .order('time', { ascending: false })

  if (error) {
    const msg = error.message || 'Failed to fetch appointments.'
    throw new Error(`${msg} (Check RLS policies for appointments SELECT.)`)
  }

  // Fetch teacher names separately
  const teacherIds = Array.from(new Set((data || []).map((a: AppointmentRow) => a.teacher_id)))
  const teacherMap: Record<string, string | null> = {}

  if (teacherIds.length > 0) {
    const { data: teachers } = await supabase
      .from('teacher_profiles')
      .select('id, full_name')
      .in('id', teacherIds)

    if (teachers) {
      for (const teacher of teachers) {
        teacherMap[teacher.id] = teacher.full_name
      }
    }
  }

  // Transform the data to include teacher name
  return (data || []).map((row: AppointmentRow) => ({
    ...row,
    teacher_name: teacherMap[row.teacher_id] || null,
    student_name: null, // Student knows their own name
  })) as AppointmentWithNames[]
}

/**
 * Fetch appointments for a teacher (appointments assigned to this teacher)
 */
export async function fetchTeacherAppointments(teacherId: string): Promise<AppointmentWithNames[]> {
  if (!supabase) throw new Error('Supabase not configured')

  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('teacher_id', teacherId)
    .order('date', { ascending: true })
    .order('time', { ascending: true })

  if (error) {
    const msg = error.message || 'Failed to fetch appointments.'
    throw new Error(`${msg} (Check RLS policies for appointments SELECT.)`)
  }

  // Fetch student names separately
  const studentIds = Array.from(new Set((data || []).map((a: AppointmentRow) => a.student_id)))
  const studentMap: Record<string, string | null> = {}

  if (studentIds.length > 0) {
    const { data: students } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', studentIds)

    if (students) {
      for (const student of students) {
        studentMap[student.id] = student.full_name
      }
    }
  }

  // Transform the data to include student name
  return (data || []).map((row: AppointmentRow) => ({
    ...row,
    student_name: studentMap[row.student_id] || null,
    teacher_name: null, // Teacher knows their own name
  })) as AppointmentWithNames[]
}

/**
 * Update appointment status (teacher only - approve/reject)
 * When rejecting, rejection_reason must be provided
 */
export async function updateAppointmentStatus(
  appointmentId: string,
  status: 'approved' | 'rejected',
  rejectionReason?: string,
): Promise<AppointmentRow> {
  if (!supabase) throw new Error('Supabase not configured')

  if (status === 'rejected' && !rejectionReason?.trim()) {
    throw new Error('Rejection reason is required when rejecting an appointment.')
  }

  const updateData: { status: 'approved' | 'rejected'; rejection_reason?: string } = { status }
  if (status === 'rejected' && rejectionReason) {
    updateData.rejection_reason = rejectionReason.trim()
  }

  const { data, error } = await supabase
    .from('appointments')
    .update(updateData)
    .eq('id', appointmentId)
    .select('*')
    .single()

  if (error) {
    const msg = error.message || 'Failed to update appointment status.'
    throw new Error(`${msg} (Check RLS policies for appointments UPDATE.)`)
  }

  return data as AppointmentRow
}

/**
 * Cancel appointment (student only)
 * Can only cancel if status is 'pending'
 * Sets status to 'rejected' with rejection_reason = 'Cancelled by student'
 */
export async function cancelAppointment(appointmentId: string): Promise<AppointmentRow> {
  if (!supabase) throw new Error('Supabase not configured')

  const { data, error } = await supabase
    .from('appointments')
    .update({
      status: 'rejected',
      rejection_reason: 'Cancelled by student',
    })
    .eq('id', appointmentId)
    .select('*')
    .single()

  if (error) {
    const msg = error.message || 'Failed to cancel appointment.'
    throw new Error(`${msg} (Check RLS policies. You can only cancel pending appointments.)`)
  }

  return data as AppointmentRow
}
