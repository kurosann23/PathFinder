import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { isSupabaseConfigured } from '../../lib/supabaseClient'

export function RequireAuth() {
  const { isReady, user } = useAuth()
  const location = useLocation()

  // If Supabase isn't configured, treat as not logged-in and direct to login with a clear message.
  if (!isSupabaseConfigured) {
    return <Navigate to="/login" replace state={{ from: location.pathname, reason: 'supabase_not_configured' }} />
  }

  if (!isReady) return null
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}


