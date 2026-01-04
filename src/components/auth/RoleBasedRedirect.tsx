import { Navigate } from 'react-router-dom'
import { useRole } from '../../context/RoleContext'
import { useAuth } from '../../context/AuthContext'

/**
 * Redirects users based on their role (database as source of truth)
 * - Teachers -> /teacher/dashboard
 * - Students -> /dashboard
 * All users have profiles, so role is always defined
 */
export function RoleBasedRedirect() {
  const { user, isReady } = useAuth()
  const { role, loading: roleLoading } = useRole()

  // Wait for auth to be ready
  if (!isReady) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#060817]">
        <div className="text-center">
          <div className="mb-2 text-sm text-slate-400">Initializing...</div>
        </div>
      </div>
    )
  }

  // Wait for role to load if we have a user
  // Show a full-screen loading overlay to prevent any dashboard content from flashing
  if (user && roleLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#060817]">
        <div className="text-center">
          <div className="mb-2 text-sm text-slate-400">Loading your profile...</div>
          <div className="text-xs text-slate-500">Please wait</div>
        </div>
      </div>
    )
  }

  // If no user, should be handled by RequireAuth
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Redirect teachers to teacher dashboard, students to regular dashboard
  if (role === 'teacher') {
    return <Navigate to="/teacher/dashboard" replace />
  }

  return <Navigate to="/dashboard" replace />
}
