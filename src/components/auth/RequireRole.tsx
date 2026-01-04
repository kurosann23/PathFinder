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
export function RequireRole({ allowedRoles, redirectTo = '/dashboard' }: RequireRoleProps) {
  const { profile, loading } = useProfile()
  const location = useLocation()

  // Wait for profile to load before checking role
  if (loading) {
    return null // Loading state
  }

  // If profile is not loaded and we're past loading, user might not be authenticated
  // This will be handled by RequireAuth, so just return null
  if (!profile) {
    return null
  }

  const { role } = useRole()

  if (!allowedRoles.includes(role)) {
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
