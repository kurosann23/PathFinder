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
  const { loading: roleLoading } = useRole()
  const location = useLocation()
  
  // Wait for role to load before checking permissions
  // Note: We don't require profile to exist - permissions are based on role, not profile
  if (roleLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mb-2 text-sm text-slate-400">Loading...</div>
          <div className="text-xs text-slate-500">Please wait</div>
        </div>
      </div>
    )
  }

  const { hasPermission } = useRole()

  if (!hasPermission(permission)) {
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
