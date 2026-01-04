import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useRole } from '../../context/RoleContext'

/**
 * Route protection component that ensures only students can access student routes
 * Blocks teachers from accessing student-only routes like /dashboard
 */
export function RequireStudent() {
  const { role, loading } = useRole()
  const location = useLocation()

  // Wait for role to load
  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mb-2 text-sm text-slate-400">Loading...</div>
          <div className="text-xs text-slate-500">Please wait</div>
        </div>
      </div>
    )
  }

  // If user is a teacher, redirect to teacher dashboard
  if (role === 'teacher') {
    return <Navigate to="/teacher/dashboard" replace state={{ from: location.pathname }} />
  }

  // Allow students to access
  return <Outlet />
}
