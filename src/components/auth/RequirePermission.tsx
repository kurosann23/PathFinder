import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useRole } from '../../context/RoleContext'
import { useProfile } from '../../context/ProfileContext'
import type { Permission } from '../../constants/roles'

type RequirePermissionProps = {
  permission: Permission
  redirectTo?: string
}

/**
 * Route protection component that checks if user has required permission
 */
export function RequirePermission({ permission, redirectTo = '/dashboard' }: RequirePermissionProps) {
  const { profile, loading } = useProfile()
  const location = useLocation()
  
  // Wait for profile to load before checking permissions
  if (loading) {
    return null // Loading state
  }

  // If profile is not loaded and we're past loading, user might not be authenticated
  // This will be handled by RequireAuth, so just return null
  if (!profile) {
    return null
  }

  const { hasPermission } = useRole()

  if (!hasPermission(permission)) {
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
