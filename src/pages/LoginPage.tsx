import { useMemo, useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'
import { cn } from '../lib/cn'
import { IconUser, IconMail, IconShield, IconBook } from '../components/icons'
import { useTheme } from '../context/ThemeContext'
import { useTranslation } from '../context/LanguageContext'
import { Button } from '../components/ui/Button'

type AuthPageProps = {
  initialMode?: 'login' | 'signup'
}

function SignInForm({ email, setEmail, password, setPassword, isLight, t }: {
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  isLight: boolean;
  t: (key: any) => string;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className={cn("text-xs font-semibold", isLight ? "text-slate-700" : "text-slate-400")}>{t('auth.email')}</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IconMail className={cn("size-4", isLight ? "text-slate-400" : "text-slate-500")} />
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@university.edu"
            className={cn(
              "w-full rounded-lg border px-3 pl-10 py-2.5 text-sm outline-none transition-all focus:ring-2",
              isLight 
                ? "border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20" 
                : "border-slate-800 bg-slate-950/50 text-slate-100 placeholder-slate-500 focus:border-blue-500/50 focus:ring-blue-500/20"
            )}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className={cn("text-xs font-semibold", isLight ? "text-slate-700" : "text-slate-400")}>{t('auth.password')}</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IconShield className={cn("size-4", isLight ? "text-slate-400" : "text-slate-500")} />
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={cn(
              "w-full rounded-lg border px-3 pl-10 py-2.5 text-sm outline-none transition-all focus:ring-2",
              isLight 
                ? "border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20" 
                : "border-slate-800 bg-slate-950/50 text-slate-100 placeholder-slate-500 focus:border-blue-500/50 focus:ring-blue-500/20"
            )}
          />
        </div>
      </div>
    </div>
  )
}

function SignUpForm({ fullName, setFullName, studentClass, setStudentClass, email, setEmail, password, setPassword, isLight, t }: {
  fullName: string;
  setFullName: (value: string) => void;
  studentClass: string;
  setStudentClass: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  isLight: boolean;
  t: (key: any) => string;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className={cn("text-xs font-semibold", isLight ? "text-slate-700" : "text-slate-400")}>{t('auth.fullName')}</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IconUser className={cn("size-4", isLight ? "text-slate-400" : "text-slate-500")} />
          </div>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe"
            className={cn(
              "w-full rounded-lg border px-3 pl-10 py-2.5 text-sm outline-none transition-all focus:ring-2",
              isLight 
                ? "border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20" 
                : "border-slate-800 bg-slate-950/50 text-slate-100 placeholder-slate-500 focus:border-blue-500/50 focus:ring-blue-500/20"
            )}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className={cn("text-xs font-semibold", isLight ? "text-slate-700" : "text-slate-400")}>{t('auth.class')}</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IconBook className={cn("size-4", isLight ? "text-slate-400" : "text-slate-500")} />
          </div>
          <input
            type="text"
            value={studentClass}
            onChange={(e) => setStudentClass(e.target.value)}
            placeholder="e.g. 5 Amanah"
            className={cn(
              "w-full rounded-lg border px-3 pl-10 py-2.5 text-sm outline-none transition-all focus:ring-2",
              isLight 
                ? "border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20" 
                : "border-slate-800 bg-slate-950/50 text-slate-100 placeholder-slate-500 focus:border-blue-500/50 focus:ring-blue-500/20"
            )}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className={cn("text-xs font-semibold", isLight ? "text-slate-700" : "text-slate-400")}>{t('auth.email')}</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IconMail className={cn("size-4", isLight ? "text-slate-400" : "text-slate-500")} />
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@university.edu"
            className={cn(
              "w-full rounded-lg border px-3 pl-10 py-2.5 text-sm outline-none transition-all focus:ring-2",
              isLight 
                ? "border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20" 
                : "border-slate-800 bg-slate-950/50 text-slate-100 placeholder-slate-500 focus:border-blue-500/50 focus:ring-blue-500/20"
            )}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className={cn("text-xs font-semibold", isLight ? "text-slate-700" : "text-slate-400")}>{t('auth.password')}</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IconShield className={cn("size-4", isLight ? "text-slate-400" : "text-slate-500")} />
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={cn(
              "w-full rounded-lg border px-3 pl-10 py-2.5 text-sm outline-none transition-all focus:ring-2",
              isLight 
                ? "border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20" 
                : "border-slate-800 bg-slate-950/50 text-slate-100 placeholder-slate-500 focus:border-blue-500/50 focus:ring-blue-500/20"
            )}
          />
        </div>
      </div>
    </div>
  )
}

function TogglePanel({ isSignUp, toggleAuthMode, t }: {
  isSignUp: boolean;
  toggleAuthMode: () => void;
  t: (key: any) => string;
}) {
  return (
    <div className="relative w-full h-full overflow-hidden">
      <div className={cn(
        "absolute inset-0 bg-gradient-to-r from-indigo-500 to-teal-500 transition-all duration-700 ease-in-out",
        isSignUp ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex items-center justify-center h-full p-8 text-white">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">
              {isSignUp ? t('auth.welcomeBack') : t('auth.helloStudent')}
            </h2>
            <p className="mb-6 opacity-90">
              {isSignUp 
                ? t('auth.alreadyHaveAccount') 
                : t('auth.newToPathfinder')}
            </p>
            <button
              onClick={toggleAuthMode}
              className="rounded-xl border-2 border-white/30 bg-white/10 px-6 py-2.5 text-sm font-semibold backdrop-blur-sm transition-all hover:bg-white/20"
            >
              {isSignUp ? t('auth.signIn') : t('auth.signUp')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function LoginPage({ initialMode = 'login' }: AuthPageProps) {
  const nav = useNavigate()
  const location = useLocation()
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const { t } = useTranslation()

  const state = location.state as { reason?: string; from?: string } | null
  const reason = state?.reason
  const from = state?.from

  // Unified State
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form Fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [studentClass, setStudentClass] = useState('')

  // Sync mode if initialMode changes
  useEffect(() => {
    setIsSignUp(initialMode === 'signup')
  }, [initialMode])

  // Clear error when switching modes
  useEffect(() => {
    setError('')
  }, [isSignUp])

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
      
      if (data.session) {
        await supabase.auth.setSession(data.session)
      }
      
      nav(from || '/', { replace: true })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Login failed.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

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

      if (!user || !session) {
        setError('Account created, but login session was not returned. Disable email confirmation in Supabase Auth settings, then try again.')
        return
      }

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

  const toggleAuthMode = () => {
    setIsSignUp((prev) => !prev)
  }

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center p-4 transition-colors duration-500",
      isLight 
        ? "bg-slate-50" 
        : "bg-[#060817]"
    )}>
      <div className="w-full max-w-4xl">
        <div className={cn(
          "relative w-full h-[480px] rounded-3xl shadow-xl overflow-hidden transition-all duration-700 ease-in-out",
          isLight 
            ? "bg-white" 
            : "bg-slate-950/50"
        )}>
          <div className="absolute inset-0 grid md:grid-cols-2">
            {/* Left Panel - Forms */}
            <div className="relative p-12 flex items-center justify-center">
              <div className="w-full max-w-sm">
                {/* Sign In Form */}
                <div className={cn(
                  "transition-all duration-700 ease-in-out",
                  isSignUp 
                    ? "opacity-0 translate-x-full absolute inset-0 -z-10 pointer-events-none" 
                    : "opacity-100 translate-x-0 relative z-10"
                )}>
                  <div className="text-center mb-8">
                    <h1 className={cn("text-2xl font-bold", isLight ? "text-slate-900" : "text-white")}>
                      {t('auth.loginTitle')}
                    </h1>
                    <p className={cn("mt-2 text-sm", isLight ? "text-slate-600" : "text-slate-400")}>
                      {t('auth.alreadyHaveAccount')}
                    </p>
                  </div>
                  <SignInForm 
                    email={email} 
                    setEmail={setEmail} 
                    password={password} 
                    setPassword={setPassword} 
                    isLight={isLight}
                    t={t}
                  />
                </div>

                {/* Sign Up Form */}
                <div className={cn(
                  "transition-all duration-700 ease-in-out",
                  isSignUp 
                    ? "opacity-100 translate-x-0 relative z-10" 
                    : "opacity-0 -translate-x-full absolute inset-0 -z-10 pointer-events-none"
                )}>
                  <div className="text-center mb-8">
                    <h1 className={cn("text-2xl font-bold", isLight ? "text-slate-900" : "text-white")}>
                      {t('auth.signupTitle')}
                    </h1>
                    <p className={cn("mt-2 text-sm", isLight ? "text-slate-600" : "text-slate-400")}>
                      {t('auth.newToPathfinder')}
                    </p>
                  </div>
                  <SignUpForm 
                    fullName={fullName}
                    setFullName={setFullName}
                    studentClass={studentClass}
                    setStudentClass={setStudentClass}
                    email={email}
                    setEmail={setEmail}
                    password={password}
                    setPassword={setPassword}
                    isLight={isLight}
                    t={t}
                  />
                </div>

                {/* Error / Info Messages */}
                {(info || error) && (
                  <div className="mt-6 space-y-3">
                    {info && (
                      <div className={cn(
                        "rounded-lg p-3 text-xs font-medium",
                        isLight ? "bg-amber-50 text-amber-800 border border-amber-200" : "bg-amber-500/10 text-amber-200 border border-amber-500/20"
                      )}>
                        {info}
                      </div>
                    )}
                    {error && (
                      <div className={cn(
                        "rounded-lg p-3 text-xs font-medium",
                        isLight ? "bg-rose-50 text-rose-600 border border-rose-200" : "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                      )}>
                        {error}
                      </div>
                    )}
                  </div>
                )}

                {/* Action Button */}
                <div className="mt-8">
                  <Button
                    onClick={isSignUp ? handleSignUp : handleLogin}
                    disabled={loading}
                    fullWidth
                    size="lg"
                    variant="primary"
                    className={cn(
                      "font-semibold",
                      loading && "opacity-80"
                    )}
                  >
                    {loading ? t('common.loading') : (isSignUp ? t('auth.signUp') : t('auth.signIn'))}
                  </Button>
                </div>

                {/* Switch Mode Link */}
                <div className="mt-6 text-center text-sm md:hidden">
                  <span className={isLight ? "text-slate-600" : "text-slate-400"}>
                    {isSignUp ? "Already have an account?" : "Don't have an account?"}
                  </span>
                  <button
                    onClick={toggleAuthMode}
                    className={cn(
                      "ml-1.5 font-semibold transition-colors hover:underline",
                      isLight ? "text-blue-600 hover:text-blue-700" : "text-blue-400 hover:text-blue-300"
                    )}
                  >
                    {isSignUp ? "Log in" : "Sign up"}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Panel - Toggle */}
            <div className="relative">
              <TogglePanel 
                isSignUp={isSignUp} 
                toggleAuthMode={toggleAuthMode}
                t={t}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
