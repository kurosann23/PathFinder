import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useProfile } from './ProfileContext'
import { DEFAULT_ROLE, type UserRole, hasPermission, type Permission } from '../constants/roles'

type RoleContextValue = {
  role: UserRole
  hasPermission: (permission: Permission) => boolean
  isStudent: boolean
  isTeacher: boolean
}

const RoleContext = createContext<RoleContextValue | null>(null)

export function RoleProvider(props: { children: ReactNode }) {
  const { profile } = useProfile()

  const value = useMemo<RoleContextValue>(() => {
    // Default to 'student' if profile is not loaded or role is not set
    const role: UserRole = (profile?.role && ['student', 'teacher'].includes(profile.role))
      ? (profile.role as UserRole)
      : DEFAULT_ROLE

    return {
      role,
      hasPermission: (permission: Permission) => hasPermission(role, permission),
      isStudent: role === 'student',
      isTeacher: role === 'teacher',
    }
  }, [profile?.role])

  return <RoleContext.Provider value={value}>{props.children}</RoleContext.Provider>
}

export function useRole() {
  const ctx = useContext(RoleContext)
  if (!ctx) throw new Error('useRole must be used within a RoleProvider')
  return ctx
}
