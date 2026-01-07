import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'
import { cn } from '../lib/cn'
import { IconUser, IconMail, IconShield, IconBook, IconEye, IconEyeOff } from '../components/icons'
import { useTheme, THEME_STORAGE_KEY } from '../context/ThemeContext'
import { useTranslation } from '../context/LanguageContext'
import { Button } from '../components/ui/Button'
import backgroundVideo from '../assets/background-login.mp4'
import styles from './AuthPage.module.css'
import { type TranslationKey } from '../lib/translations'

// --- Types & Props ---
type AuthPageProps = {
  initialMode?: 'login' | 'signup'
}

// --- Components ---

function SignInForm({ email, setEmail, password, setPassword, isLight, t }: {
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  isLight: boolean;
  t: (key: TranslationKey) => string;
}) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="flex flex-col items-center justify-center h-full px-10 text-center">
      <h1 className={cn("text-3xl font-bold mb-6", styles.authHeading, isLight ? "text-slate-800" : "text-white")}>{t('auth.loginTitle')}</h1>
      
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <IconMail className={cn("size-5", isLight ? "text-slate-500" : "text-slate-400")} />
          </div>
          <input
            type="email"
            placeholder={t('auth.email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={cn(
              "w-full rounded-lg border px-3 pl-10 py-3 text-sm outline-none transition-all shadow-sm focus:ring-4",
              isLight 
                ? "bg-white border-slate-300 placeholder-slate-400 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500/10" 
                : "bg-slate-950/50 border-slate-700 placeholder-slate-500 text-slate-100 focus:border-indigo-400 focus:ring-indigo-500/10"
            )}
          />
        </div>
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <IconShield className={cn("size-5", isLight ? "text-slate-500" : "text-slate-400")} />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            placeholder={t('auth.password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={cn(
              "w-full rounded-lg border px-3 pl-10 pr-10 py-3 text-sm outline-none transition-all shadow-sm focus:ring-4",
              isLight 
                ? "bg-white border-slate-300 placeholder-slate-400 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500/10" 
                : "bg-slate-950/50 border-slate-700 placeholder-slate-500 text-slate-100 focus:border-indigo-400 focus:ring-indigo-500/10"
            )}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={cn(
              "absolute inset-y-0 right-0 pr-3 flex items-center z-10 transition-colors",
              isLight ? "text-slate-400 hover:text-slate-600" : "text-slate-500 hover:text-slate-300"
            )}
          >
            {showPassword ? (
              <IconEyeOff className="size-5" />
            ) : (
              <IconEye className="size-5" />
            )}
          </button>
        </div>
      </div>

      <a href="#" className={cn("text-xs mt-6 hover:underline font-medium", isLight ? "text-slate-600" : "text-slate-400")}>Forgot your password?</a>
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
  t: (key: TranslationKey) => string;
}) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="flex flex-col items-center justify-center h-full px-10 text-center">
      <h1 className={cn("text-3xl font-bold mb-6", styles.authHeading, isLight ? "text-slate-800" : "text-white")}>{t('auth.signupTitle')}</h1>
      
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <div className="relative w-full">
           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <IconUser className={cn("size-5", isLight ? "text-slate-500" : "text-slate-400")} />
          </div>
          <input
            type="text"
            placeholder={t('auth.fullName')}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={cn(
              "w-full rounded-lg border px-3 pl-10 py-3 text-sm outline-none transition-all shadow-sm focus:ring-4",
              isLight 
                ? "bg-white border-slate-300 placeholder-slate-400 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500/10" 
                : "bg-slate-950/50 border-slate-700 placeholder-slate-500 text-slate-100 focus:border-indigo-400 focus:ring-indigo-500/10"
            )}
          />
        </div>
        <div className="relative w-full">
           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <IconBook className={cn("size-5", isLight ? "text-slate-500" : "text-slate-400")} />
          </div>
          <input
            type="text"
            placeholder="Class (e.g. 5 Amanah)"
            value={studentClass}
            onChange={(e) => setStudentClass(e.target.value)}
            className={cn(
              "w-full rounded-lg border px-3 pl-10 py-3 text-sm outline-none transition-all shadow-sm focus:ring-4",
              isLight 
                ? "bg-white border-slate-300 placeholder-slate-400 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500/10" 
                : "bg-slate-950/50 border-slate-700 placeholder-slate-500 text-slate-100 focus:border-indigo-400 focus:ring-indigo-500/10"
            )}
          />
        </div>
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <IconMail className={cn("size-5", isLight ? "text-slate-500" : "text-slate-400")} />
          </div>
          <input
            type="email"
            placeholder={t('auth.email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={cn(
              "w-full rounded-lg border px-3 pl-10 py-3 text-sm outline-none transition-all shadow-sm focus:ring-4",
              isLight 
                ? "bg-white border-slate-300 placeholder-slate-400 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500/10" 
                : "bg-slate-950/50 border-slate-700 placeholder-slate-500 text-slate-100 focus:border-indigo-400 focus:ring-indigo-500/10"
            )}
          />
        </div>
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <IconShield className={cn("size-5", isLight ? "text-slate-500" : "text-slate-400")} />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            placeholder={t('auth.password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={cn(
              "w-full rounded-lg border px-3 pl-10 pr-10 py-3 text-sm outline-none transition-all shadow-sm focus:ring-4",
              isLight 
                ? "bg-white border-slate-300 placeholder-slate-400 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500/10" 
                : "bg-slate-950/50 border-slate-700 placeholder-slate-500 text-slate-100 focus:border-indigo-400 focus:ring-indigo-500/10"
            )}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={cn(
              "absolute inset-y-0 right-0 pr-3 flex items-center z-10 transition-colors",
              isLight ? "text-slate-400 hover:text-slate-600" : "text-slate-500 hover:text-slate-300"
            )}
          >
            {showPassword ? (
              <IconEyeOff className="size-5" />
            ) : (
              <IconEye className="size-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function TogglePanel({ isSignUp, toggleAuthMode, t }: {
  isSignUp: boolean;
  toggleAuthMode: () => void;
  t: (key: TranslationKey) => string;
}) {
  return (
    <div className="relative h-full w-full flex text-white z-10">
      
      {/* Left Panel Content - Visible in Sign Up Mode (Panel on Left) -> Target: Existing Users */}
      <div className={cn(
        "w-1/2 flex flex-col items-center justify-center px-8 text-center transition-all duration-700 ease-in-out absolute top-0 h-full left-0 z-20",
        isSignUp ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10 pointer-events-none"
      )}>
        <h1 className="text-3xl font-semibold mb-2 tracking-tight text-indigo-50">Welcome to PathFinder</h1>
        <p className="text-lg font-medium mb-4 text-indigo-100">Let’s find a career that fits you</p>
        <p className="text-sm text-indigo-100/90 mb-8 max-w-[260px] font-medium">Take a short psychometric test and explore paths made for you</p>
        <button
          onClick={toggleAuthMode}
          className="group relative rounded-full border-2 border-indigo-100 px-10 py-3 text-sm font-bold uppercase tracking-widest text-indigo-50 transition-all hover:bg-white hover:text-indigo-600 shadow-xl backdrop-blur-sm overflow-hidden"
        >
          <span className="relative z-10">{t('auth.signIn')}</span>
        </button>
      </div>

      {/* Right Panel Content - Visible in Login Mode (Panel on Right) -> Target: New Users */}
      <div className={cn(
        "w-1/2 flex flex-col items-center justify-center px-8 text-center transition-all duration-700 ease-in-out absolute top-0 h-full right-0 z-20",
        !isSignUp ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10 pointer-events-none"
      )}>
        <h1 className="text-3xl font-semibold mb-2 tracking-tight text-indigo-50">Welcome Back</h1>
        <p className="text-lg font-medium mb-4 text-indigo-100">Let’s continue your career journey</p>
        <p className="text-sm text-indigo-100/90 mb-8 max-w-[260px] font-medium">View your recommendations and track your progress</p>
        <button
          onClick={toggleAuthMode}
          className="group relative rounded-full border-2 border-indigo-100 px-10 py-3 text-sm font-bold uppercase tracking-widest text-indigo-50 transition-all hover:bg-white hover:text-indigo-600 shadow-xl backdrop-blur-sm overflow-hidden"
        >
          <span className="relative z-10">{t('auth.signUp')}</span>
        </button>
      </div>
    </div>
  )
}

// --- Main Page Component ---

export function AuthPage({ initialMode = 'login' }: AuthPageProps) {
  const nav = useNavigate()
  const location = useLocation()
  const { theme, setTheme } = useTheme()
  const isLight = theme === 'light'
  const { t } = useTranslation()

  const state = location.state as { reason?: string; from?: string } | null
  const reason = state?.reason
  const from = state?.from

  // State
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  // Form Fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [studentClass, setStudentClass] = useState('')

  // Sync mode
  useEffect(() => {
    setIsSignUp(initialMode === 'signup')
  }, [initialMode])

  // Force light theme on auth pages to isolate dashboard theme
  useEffect(() => {
    setTheme('light')
  }, [setTheme])

  // Clear error
  useEffect(() => {
    setError('')
  }, [isSignUp])

  // Info message
  useEffect(() => {
    if (reason === 'supabase_not_configured') {
      setInfo('Supabase is not configured. Check .env.local.')
    } else {
      setInfo('')
    }
  }, [reason])

  const toggleAuthMode = () => setIsSignUp(!isSignUp)

  // Auth Handlers
  async function handleLogin() {
    setError('')
    if (!isSupabaseConfigured || !supabase) {
      setError('Supabase is not configured.')
      return
    }
    if (!email.trim() || !password) {
      setError('Please enter email and password.')
      return
    }

    setLoading(true)
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (authError) throw authError
      if (data.session) await supabase.auth.setSession(data.session)
      if (typeof window !== 'undefined') {
        localStorage.setItem(THEME_STORAGE_KEY, 'light')
      }
      nav(from || '/', { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSignUp() {
    setError('')
    if (!isSupabaseConfigured || !supabase) {
      setError('Supabase is not configured.')
      return
    }
    if (!fullName.trim() || !studentClass.trim() || !email.trim() || password.length < 6) {
      setError('Please fill all fields. Password min 6 chars.')
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
        setError('Account created. Please check email for verification or login.')
        return
      }

      const { error: profileError } = await supabase.from('profiles').insert({
        id: user.id,
        full_name: fullName.trim(),
        class: studentClass.trim(),
        email: email.trim(),
      })
      if (profileError) throw profileError

      if (typeof window !== 'undefined') {
        localStorage.setItem(THEME_STORAGE_KEY, 'light')
      }
      nav('/dashboard', { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign up failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("min-h-screen relative flex items-center justify-center p-4 overflow-hidden", styles.authPage)}>
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
         <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ objectPosition: '60% center' }}
         >
            <source src={backgroundVideo} type="video/mp4" />
         </video>
         <div className={cn("absolute inset-0 backdrop-blur-[2px]", isLight ? "bg-white/30" : "bg-black/40")} />
      </div>

      <div className={cn(
        "relative z-10 w-[768px] max-w-full h-[480px] rounded-[30px] shadow-2xl overflow-hidden transition-all duration-500",
        isLight ? "bg-white/90 backdrop-blur-md" : "bg-slate-900/90 backdrop-blur-md"
      )}>
        
        {/* Sign Up Form Container */}
        <div className={cn(
          "absolute top-0 h-full transition-all duration-700 ease-in-out left-0 w-1/2 flex flex-col justify-center",
          isSignUp 
            ? "translate-x-full opacity-100 z-50" 
            : "opacity-0 z-10"
        )}>
           <SignUpForm 
             fullName={fullName} setFullName={setFullName}
             studentClass={studentClass} setStudentClass={setStudentClass}
             email={email} setEmail={setEmail}
             password={password} setPassword={setPassword}
             isLight={isLight} t={t}
           />
           <div className="px-10 pb-6 text-center">
             {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
             <Button onClick={handleSignUp} disabled={loading} fullWidth className="rounded-lg font-bold uppercase tracking-wider py-3 shadow-md">
                {loading ? t('common.loading') : t('auth.signUp')}
             </Button>
           </div>
        </div>

        {/* Sign In Form Container */}
        <div className={cn(
          "absolute top-0 h-full transition-all duration-700 ease-in-out left-0 w-1/2 flex flex-col justify-center",
          isSignUp 
            ? "translate-x-full opacity-0 z-10" 
            : "z-20 opacity-100"
        )}>
          <SignInForm 
            email={email} setEmail={setEmail}
            password={password} setPassword={setPassword}
            isLight={isLight} t={t}
          />
          <div className="px-10 pb-6 text-center">
             {info && <p className="text-amber-500 text-xs mb-2">{info}</p>}
             {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
             <Button onClick={handleLogin} disabled={loading} fullWidth className="rounded-lg font-bold uppercase tracking-wider py-3 shadow-md">
                {loading ? t('common.loading') : t('auth.signIn')}
             </Button>
          </div>
        </div>

        {/* Toggle Container (Overlay) */}
        <div className={cn(
          "absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-all duration-700 ease-in-out z-[100]",
          isSignUp 
            ? "-translate-x-full rounded-r-[100px] rounded-l-[30px]" // When on Left
            : "rounded-l-[100px] rounded-r-[30px]" // When on Right
        )}>
           {/* Inner Gradient Panel */}
           <div className={cn(
             "bg-gradient-to-br from-indigo-500 via-purple-500 to-teal-400 relative -left-full h-full w-[200%] transform transition-transform duration-700 ease-in-out text-white",
             isSignUp ? "translate-x-1/2" : "translate-x-0"
           )}>
             <TogglePanel isSignUp={isSignUp} toggleAuthMode={toggleAuthMode} t={t} />
           </div>
        </div>

      </div>
    </div>
  )
}
