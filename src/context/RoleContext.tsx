import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useProfile } from './ProfileContext'
import { useAuth } from './AuthContext'
import { fetchUserRole } from '../lib/profileRepo'
import { DEFAULT_ROLE, type UserRole, hasPermission, type Permission } from '../constants/roles'
import { isSupabaseConfigured } from '../lib/supabaseClient'

type RoleContextValue = {
  role: UserRole
  hasPermission: (permission: Permission) => boolean
  isStudent: boolean
  isTeacher: boolean
  loading: boolean
}

const RoleContext = createContext<RoleContextValue | null>(null)

export function RoleProvider(props: { children: ReactNode }) {
  const { profile, loading: profileLoading } = useProfile()
  const { user, isReady } = useAuth()
  const [role, setRole] = useState<UserRole>('student')
  const [roleLoading, setRoleLoading] = useState(true)

  // Fetch role from database (source of truth) - check teacher_profiles first, then profiles (students)
  // All users have profiles, so role is always defined
  useEffect(() => {
    async function loadRole() {
      if (!isSupabaseConfigured || !isReady) {
        setRole('student')
        setRoleLoading(false)
        return
      }

      // If no user, default to student
      if (!user?.id) {
        setRole('student')
        setRoleLoading(false)
        return
      }

      try {
        // Use database as source of truth - check profile tables directly
        const fetchedRole = await fetchUserRole(user.id)
        setRole(fetchedRole) // Always returns a role (teacher or student)
      } catch (error) {
        console.warn('Failed to fetch user role:', error)
        setRole('student') // Default to student on error
      } finally {
        setRoleLoading(false)
      }
    }

    void loadRole()
  }, [user?.id, isReady])

  const value = useMemo<RoleContextValue>(() => {
    return {
      role,
      hasPermission: (permission: Permission) => hasPermission(role, permission),
      isStudent: role === 'student',
      isTeacher: role === 'teacher',
      loading: roleLoading || profileLoading,
    }
  }, [role, roleLoading, profileLoading])

  return <RoleContext.Provider value={value}>{props.children}</RoleContext.Provider>
}

export function useRole() {
  const ctx = useContext(RoleContext)
  if (!ctx) throw new Error('useRole must be used within a RoleProvider')
  return ctx
}
