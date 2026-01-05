import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'
import { cn } from '../lib/cn'
import { IconTarget } from '../components/icons'
import { Button } from '../components/ui/Button'
import { useTheme } from '../context/ThemeContext'

export function LoginPage() {
  const nav = useNavigate()
  const location = useLocation()
  const { theme } = useTheme()
  const isLight = theme === 'light'

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
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (authError) throw authError
      
      // Refresh session to ensure we have latest user metadata (including role)
      if (data.session) {
        await supabase.auth.setSession(data.session)
      }
      
      // Redirect to root, which will use RoleBasedRedirect to send to correct dashboard
      nav(from || '/', { replace: true })
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
        <span className={cn(
          'rounded-xl px-3 py-2 text-xs font-semibold ring-1',
          isLight
            ? 'bg-blue-50 text-blue-700 ring-blue-200'
            : 'bg-slate-950/40 text-slate-200 ring-slate-800/70'
        )}>
          Student
        </span>
      }
    >
      <div className="relative space-y-4">
        {/* Subtle login animation overlay */}
        {loading && (
          <div className={cn(
            'absolute inset-0 z-10 rounded-2xl backdrop-blur-sm',
            isLight ? 'bg-white/80' : 'bg-slate-950/50'
          )}>
            <div className="grid h-full place-items-center px-6">
              <div className={cn(
                'w-full max-w-sm rounded-2xl border px-5 py-4',
                isLight
                  ? 'border-blue-200 bg-white shadow-lg'
                  : 'border-slate-800/70 bg-slate-950/60'
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'grid size-10 place-items-center rounded-2xl ring-1',
                    isLight
                      ? 'bg-blue-50 ring-blue-200'
                      : 'bg-blue-600/20 ring-blue-500/25'
                  )}>
                    <div className="relative">
                      <div className={cn(
                        'absolute inset-0 rounded-full animate-ping motion-reduce:animate-none',
                        isLight ? 'bg-blue-400/20' : 'bg-blue-400/10'
                      )} />
                      <IconTarget size={18} className={cn(
                        'relative',
                        isLight ? 'text-blue-600' : 'text-blue-200'
                      )} />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className={cn(
                      'text-sm font-semibold',
                      isLight ? 'text-slate-900' : 'text-slate-100'
                    )}>Signing you in…</div>
                    <div className={cn(
                      'mt-1 text-xs',
                      isLight ? 'text-slate-600' : 'text-slate-400'
                    )}>
                      Preparing your dashboard
                    </div>
                  </div>
                </div>

                <div className={cn(
                  'mt-4 h-2 w-full rounded-full',
                  isLight ? 'bg-slate-200' : 'bg-slate-800/70'
                )}>
                  <div className={cn(
                    'h-2 w-1/2 rounded-full animate-[pulse_1.2s_ease-in-out_infinite] motion-reduce:animate-none',
                    isLight ? 'bg-blue-500' : 'bg-blue-500/60'
                  )} />
                </div>
              </div>
            </div>
          </div>
        )}

        <div>
          <div className={cn(
            'text-2xl font-semibold',
            isLight ? 'text-slate-900' : 'text-slate-100'
          )}>Welcome back</div>
          <div className={cn(
            'mt-1 text-sm',
            isLight ? 'text-slate-600' : 'text-slate-400'
          )}>
            Log in to continue to your dashboard.
          </div>
        </div>

        {info && (
          <div className={cn(
            'rounded-2xl border px-4 py-3 text-sm',
            isLight
              ? 'border-amber-300 bg-amber-50 text-amber-800'
              : 'border-amber-500/20 bg-amber-500/10 text-amber-100'
          )}>
            {info}
          </div>
        )}

        <label className="block">
          <div className={cn(
            'text-xs font-semibold',
            isLight ? 'text-slate-700' : 'text-slate-400'
          )}>Email</div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            disabled={loading}
            className={cn(
              'mt-2 w-full rounded-2xl border px-4 py-3 text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2',
              isLight
                ? 'border-slate-200 bg-white text-slate-900 focus:ring-blue-500/30'
                : 'border-slate-800/70 bg-slate-950/40 text-slate-100 focus:ring-blue-500/20'
            )}
            placeholder="student@email.com"
          />
        </label>

        <label className="block">
          <div className={cn(
            'text-xs font-semibold',
            isLight ? 'text-slate-700' : 'text-slate-400'
          )}>Password</div>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            disabled={loading}
            className={cn(
              'mt-2 w-full rounded-2xl border px-4 py-3 text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2',
              isLight
                ? 'border-slate-200 bg-white text-slate-900 focus:ring-blue-500/30'
                : 'border-slate-800/70 bg-slate-950/40 text-slate-100 focus:ring-blue-500/20'
            )}
            placeholder="••••••••"
          />
        </label>

        {error && (
          <div className={cn(
            'rounded-2xl border px-4 py-3 text-sm font-semibold',
            isLight
              ? 'border-rose-300 bg-rose-50 text-rose-800'
              : 'border-rose-500/20 bg-rose-500/10 text-rose-100'
          )}>
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

        <div className={cn(
          'text-center text-sm',
          isLight ? 'text-slate-600' : 'text-slate-400'
        )}>
          No account?{' '}
          <Link to="/signup" className={cn(
            'font-semibold',
            isLight
              ? 'text-blue-600 hover:text-blue-700'
              : 'text-slate-200 hover:text-slate-50'
          )}>
            Sign up
          </Link>
        </div>
      </div>
    </Card>
  )
}


