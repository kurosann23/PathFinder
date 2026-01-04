import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { RoleBasedRedirect } from './RoleBasedRedirect'

export function RedirectIfAuth() {
  const { isReady, user } = useAuth()
  if (!isReady) return null
  if (user) return <RoleBasedRedirect />
  return <Outlet />
}


