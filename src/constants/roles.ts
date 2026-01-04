/**
 * User roles in the system
 */
export type UserRole = 'student' | 'teacher'

/**
 * Permission flags for role-based access control
 */
export type Permission =
  | 'view_dashboard'
  | 'take_psychometric_test'
  | 'view_riasec_results'
  | 'view_course_recommendations'
  | 'view_learning_roadmap'
  | 'play_mini_games'
  | 'manage_psychometric_questions'
  | 'manage_courses'
  | 'view_teacher_dashboard'
  | 'view_student_results'

/**
 * Role-based permissions mapping
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  student: [
    'view_dashboard',
    'take_psychometric_test',
    'view_riasec_results',
    'view_course_recommendations',
    'view_learning_roadmap',
    'play_mini_games',
  ],
  teacher: [
    'view_teacher_dashboard',
    'manage_psychometric_questions',
    'manage_courses',
    // Teachers cannot:
    // - view_dashboard (student dashboard)
    // - take_psychometric_test
    // - view_riasec_results (individual student results)
    // - view_course_recommendations (student-specific)
    // - view_learning_roadmap (student-specific)
    // - play_mini_games
    // - view_student_results (individual)
  ],
}

/**
 * Default role for new users
 */
export const DEFAULT_ROLE: UserRole = 'student'

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

/**
 * Get all permissions for a role
 */
export function getPermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? []
}
