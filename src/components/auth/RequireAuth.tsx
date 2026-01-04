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

  // Show loading state while checking auth
  if (!isReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#060817]">
        <div className="text-center">
          <div className="mb-2 text-sm text-slate-400">Checking authentication...</div>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}


