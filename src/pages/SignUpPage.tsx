import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'
import { cn } from '../lib/cn'
import { Button } from '../components/ui/Button'
import { useTheme } from '../context/ThemeContext'

export function SignUpPage() {
  const nav = useNavigate()
  const { theme } = useTheme()
  const isLight = theme === 'light'

  const [fullName, setFullName] = useState('')
  const [studentClass, setStudentClass] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSignUp() {
    setError('')
    if (!isSupabaseConfigured || !supabase) {
      setError('Supabase is not configured. Please set env vars and restart the dev server.')
      return
    }
    if (!fullName.trim()) {
      setError('Please enter your full name.')
      return
    }
    if (!studentClass.trim()) {
      setError('Please enter your class.')
      return
    }
    if (!email.trim()) {
      setError('Please enter your email.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      })
      if (signUpError) throw signUpError

      const user = data.user
      const session = data.session

      // If email confirmations are enabled on the Supabase project, session may be null.
      // For the FYP "simple auth" requirement, disable email confirmation in Supabase Auth settings.
      if (!user || !session) {
        setError('Account created, but login session was not returned. Disable email confirmation in Supabase Auth settings, then try again.')
        return
      }

      // Store student profile in profiles table (all signups are students by default)
      const { error: profileError } = await supabase.from('profiles').insert({
        id: user.id,
        full_name: fullName.trim(),
        class: studentClass.trim(),
        email: email.trim(),
      })
      if (profileError) throw profileError

      nav('/dashboard', { replace: true })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Sign up failed.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card
      title="Sign Up"
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
      <div className="space-y-4">
        <div>
          <div className={cn(
            'text-2xl font-semibold',
            isLight ? 'text-slate-900' : 'text-slate-100'
          )}>Create your account</div>
          <div className={cn(
            'mt-1 text-sm',
            isLight ? 'text-slate-600' : 'text-slate-400'
          )}>
            Email + password authentication using Supabase.
          </div>
        </div>

        <label className="block">
          <div className={cn(
            'text-xs font-semibold',
            isLight ? 'text-slate-700' : 'text-slate-400'
          )}>Full Name</div>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={cn(
              'mt-2 w-full rounded-2xl border px-4 py-3 text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2',
              isLight
                ? 'border-slate-200 bg-white text-slate-900 focus:ring-blue-500/30'
                : 'border-slate-800/70 bg-slate-950/40 text-slate-100 focus:ring-blue-500/20'
            )}
            placeholder="Your name"
          />
        </label>

        <label className="block">
          <div className={cn(
            'text-xs font-semibold',
            isLight ? 'text-slate-700' : 'text-slate-400'
          )}>Class</div>
          <input
            value={studentClass}
            onChange={(e) => setStudentClass(e.target.value)}
            className={cn(
              'mt-2 w-full rounded-2xl border px-4 py-3 text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2',
              isLight
                ? 'border-slate-200 bg-white text-slate-900 focus:ring-blue-500/30'
                : 'border-slate-800/70 bg-slate-950/40 text-slate-100 focus:ring-blue-500/20'
            )}
            placeholder="e.g., DIT 5A / CS 2025"
          />
        </label>

        <label className="block">
          <div className={cn(
            'text-xs font-semibold',
            isLight ? 'text-slate-700' : 'text-slate-400'
          )}>Email</div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
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
            className={cn(
              'mt-2 w-full rounded-2xl border px-4 py-3 text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2',
              isLight
                ? 'border-slate-200 bg-white text-slate-900 focus:ring-blue-500/30'
                : 'border-slate-800/70 bg-slate-950/40 text-slate-100 focus:ring-blue-500/20'
            )}
            placeholder="Minimum 6 characters"
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
          onClick={handleSignUp}
          disabled={loading}
          fullWidth
          size="lg"
          variant="primary"
          className={cn(loading && 'opacity-60')}
        >
          {loading ? 'Creating account…' : 'Create Account'}
        </Button>

        <div className={cn(
          'text-center text-sm',
          isLight ? 'text-slate-600' : 'text-slate-400'
        )}>
          Already have an account?{' '}
          <Link to="/login" className={cn(
            'font-semibold',
            isLight
              ? 'text-blue-600 hover:text-blue-700'
              : 'text-slate-200 hover:text-slate-50'
          )}>
            Login
          </Link>
        </div>
      </div>
    </Card>
  )
}


