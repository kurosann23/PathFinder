import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'
import { cn } from '../lib/cn'
import { IconTarget } from '../components/icons'
import { Button } from '../components/ui/Button'

export function LoginPage() {
  const nav = useNavigate()
  const location = useLocation()

  const reason = (location.state as any)?.reason as string | undefined
  const from = (location.state as any)?.from as string | undefined

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const info = useMemo(() => {
    if (reason === 'supabase_not_configured') {
      return 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local, then restart.'
    }
    return ''
  }, [reason])

  async function handleLogin() {
    setError('')
    if (!isSupabaseConfigured || !supabase) {
      setError('Supabase is not configured. Please set env vars and restart the dev server.')
      return
    }
    if (!email.trim()) {
      setError('Please enter your email.')
      return
    }
    if (!password) {
      setError('Please enter your password.')
      return
    }

    setLoading(true)
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (authError) throw authError
      nav(from || '/dashboard', { replace: true })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Login failed.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card
      title="Login"
      right={
        <span className="rounded-xl bg-slate-950/40 px-3 py-2 text-xs font-semibold text-slate-200 ring-1 ring-slate-800/70">
          Student
        </span>
      }
    >
      <div className="relative space-y-4">
        {/* Subtle login animation overlay */}
        {loading && (
          <div className="absolute inset-0 z-10 rounded-2xl bg-slate-950/50 backdrop-blur-sm">
            <div className="grid h-full place-items-center px-6">
              <div className="w-full max-w-sm rounded-2xl border border-slate-800/70 bg-slate-950/60 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-2xl bg-blue-600/20 ring-1 ring-blue-500/25">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-blue-400/10 animate-ping motion-reduce:animate-none" />
                      <IconTarget size={18} className="relative text-blue-200" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-100">Signing you in…</div>
                    <div className="mt-1 text-xs text-slate-400">
                      Preparing your dashboard
                    </div>
                  </div>
                </div>

                <div className="mt-4 h-2 w-full rounded-full bg-slate-800/70">
                  <div className="h-2 w-1/2 rounded-full bg-blue-500/60 animate-[pulse_1.2s_ease-in-out_infinite] motion-reduce:animate-none" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div>
          <div className="text-2xl font-semibold text-slate-100">Welcome back</div>
          <div className="mt-1 text-sm text-slate-400">
            Log in to continue to your dashboard.
          </div>
        </div>

        {info && (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            {info}
          </div>
        )}

        <label className="block">
          <div className="text-xs font-semibold text-slate-400">Email</div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            disabled={loading}
            className="mt-2 w-full rounded-2xl border border-slate-800/70 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="student@email.com"
          />
        </label>

        <label className="block">
          <div className="text-xs font-semibold text-slate-400">Password</div>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            disabled={loading}
            className="mt-2 w-full rounded-2xl border border-slate-800/70 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="••••••••"
          />
        </label>

        {error && (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-100">
            {error}
          </div>
        )}

        <Button
          type="button"
          onClick={handleLogin}
          disabled={loading}
          fullWidth
          size="lg"
          variant="primary"
          className={cn(loading && 'opacity-60')}
        >
          <span className="inline-flex items-center justify-center gap-2">
            {loading && (
              <span className="inline-block size-4 animate-spin rounded-full border-2 border-blue-200/70 border-t-transparent motion-reduce:animate-none" />
            )}
            {loading ? 'Logging in…' : 'Login'}
          </span>
        </Button>

        <div className="text-center text-sm text-slate-400">
          No account?{' '}
          <Link to="/signup" className="font-semibold text-slate-200 hover:text-slate-50">
            Sign up
          </Link>
        </div>
      </div>
    </Card>
  )
}


