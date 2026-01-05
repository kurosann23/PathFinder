export type NavKey =
  | 'dashboard'
  | 'profile'
  | 'psychometric'
  | 'course'
  | 'roadmap'
  | 'appointment'
  | 'teacher'
  | 'teacher-questions'
  | 'teacher-courses'
  | 'teacher-students'
  | 'teacher-appointments'

export const studentNavigation: Array<{
  key: NavKey
  label: string
  to: string
}> = [
  { key: 'dashboard', label: 'Dashboard', to: '/dashboard' },
  { key: 'profile', label: 'Profile', to: '/profile' },
  { key: 'psychometric', label: 'Psychometric Test', to: '/psychometric-test' },
  { key: 'course', label: 'Course Recommendation', to: '/course-recommendation' },
  { key: 'roadmap', label: 'Learning Roadmap', to: '/learning-roadmap' },
  { key: 'appointment', label: 'Appointment', to: '/appointment' },
] as const

export const teacherNavigation: Array<{
  key: NavKey
  label: string
  to: string
}> = [
  { key: 'teacher', label: 'Teacher Dashboard', to: '/teacher/dashboard' },
  { key: 'profile', label: 'Profile', to: '/profile' },
  { key: 'teacher-students', label: 'Student Overview', to: '/teacher/students' },
  { key: 'teacher-appointments', label: 'Appointments', to: '/teacher/appointments' },
  { key: 'teacher-questions', label: 'Manage Questions', to: '/teacher/questions' },
  { key: 'teacher-courses', label: 'Manage Courses', to: '/teacher/courses' },
] as const

// Legacy export for backward compatibility
export const navigation = studentNavigation


