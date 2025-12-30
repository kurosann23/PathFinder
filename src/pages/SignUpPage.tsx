import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'
import { cn } from '../lib/cn'

export function SignUpPage() {
  const nav = useNavigate()

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

      // Store additional profile fields in public.profiles linked to auth.users.id
      const { error: profileError } = await supabase.from('profiles').insert({
        id: user.id,
        full_name: fullName.trim(),
        class: studentClass.trim(),
        email: email.trim(),
        created_at: new Date().toISOString(),
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
        <span className="rounded-xl bg-slate-950/40 px-3 py-2 text-xs font-semibold text-slate-200 ring-1 ring-slate-800/70">
          Student
        </span>
      }
    >
      <div className="space-y-4">
        <div>
          <div className="text-2xl font-semibold text-slate-100">Create your account</div>
          <div className="mt-1 text-sm text-slate-400">
            Email + password authentication using Supabase.
          </div>
        </div>

        <label className="block">
          <div className="text-xs font-semibold text-slate-400">Full Name</div>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-800/70 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="Your name"
          />
        </label>

        <label className="block">
          <div className="text-xs font-semibold text-slate-400">Class</div>
          <input
            value={studentClass}
            onChange={(e) => setStudentClass(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-800/70 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="e.g., DIT 5A / CS 2025"
          />
        </label>

        <label className="block">
          <div className="text-xs font-semibold text-slate-400">Email</div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
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
            className="mt-2 w-full rounded-2xl border border-slate-800/70 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="Minimum 6 characters"
          />
        </label>

        {error && (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-100">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleSignUp}
          disabled={loading}
          className={cn(
            'w-full rounded-2xl bg-blue-600/20 px-5 py-3 text-sm font-semibold text-blue-100 ring-1 ring-blue-500/25 hover:bg-blue-600/25',
            loading && 'opacity-60',
          )}
        >
          {loading ? 'Creating account…' : 'Create Account'}
        </button>

        <div className="text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-slate-200 hover:text-slate-50">
            Login
          </Link>
        </div>
      </div>
    </Card>
  )
}


