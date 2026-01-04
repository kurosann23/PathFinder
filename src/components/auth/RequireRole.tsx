import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useRole } from '../../context/RoleContext'
import { useProfile } from '../../context/ProfileContext'
import type { UserRole } from '../../constants/roles'

type RequireRoleProps = {
  allowedRoles: UserRole[]
  redirectTo?: string
}

/**
 * Route protection component that checks if user has required role
 */
export function RequireRole({ allowedRoles, redirectTo }: RequireRoleProps) {
  const { profile, loading } = useProfile()
  const location = useLocation()

  // Wait for profile to load before checking role
  // Show loading state instead of null to prevent blank page
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

  // If profile is not loaded and we're past loading, user might not be authenticated
  // This will be handled by RequireAuth, but show a message just in case
  if (!profile) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mb-2 text-sm text-slate-400">Unable to load profile</div>
          <div className="text-xs text-slate-500">Redirecting...</div>
        </div>
      </div>
    )
  }

  const { role } = useRole()

  if (!allowedRoles.includes(role)) {
    // Redirect based on role if no redirectTo specified
    const defaultRedirect = role === 'teacher' ? '/teacher/dashboard' : '/dashboard'
    return <Navigate to={redirectTo || defaultRedirect} replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
