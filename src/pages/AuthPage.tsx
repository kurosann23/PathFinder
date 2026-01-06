import { useEffect, useState, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'
import { cn } from '../lib/cn'
import { IconUser, IconMail, IconShield, IconBook } from '../components/icons'
import { useTheme } from '../context/ThemeContext'
import { useTranslation } from '../context/LanguageContext'
import { Button } from '../components/ui/Button'

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
  t: (key: any) => string;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-10 text-center">
      <h1 className={cn("text-3xl font-bold mb-4", isLight ? "text-slate-800" : "text-white")}>{t('auth.loginTitle')}</h1>
      <div className="social-container mb-4">
        {/* Social Icons would go here if needed, keeping it simple as per original code */}
      </div>
      <span className={cn("text-sm mb-4", isLight ? "text-slate-600" : "text-slate-400")}>{t('auth.useEmailAccount')}</span>
      
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IconMail className={cn("size-4", isLight ? "text-slate-400" : "text-slate-500")} />
          </div>
          <input
            type="email"
            placeholder={t('auth.email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={cn(
              "w-full rounded-lg border px-3 pl-10 py-3 text-sm outline-none transition-all",
              isLight 
                ? "bg-slate-100 border-none placeholder-slate-500 text-slate-900" 
                : "bg-slate-800 border-slate-700 placeholder-slate-400 text-slate-100"
            )}
          />
        </div>
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IconShield className={cn("size-4", isLight ? "text-slate-400" : "text-slate-500")} />
          </div>
          <input
            type="password"
            placeholder={t('auth.password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={cn(
              "w-full rounded-lg border px-3 pl-10 py-3 text-sm outline-none transition-all",
              isLight 
                ? "bg-slate-100 border-none placeholder-slate-500 text-slate-900" 
                : "bg-slate-800 border-slate-700 placeholder-slate-400 text-slate-100"
            )}
          />
        </div>
      </div>

      <a href="#" className={cn("text-xs mt-4 hover:underline", isLight ? "text-slate-600" : "text-slate-400")}>Forgot your password?</a>
      {/* Button is handled in the parent to share loading state/logic, but for UI match it should be here. 
          However, the original code had the button outside the form fields. 
          In standard sliding UI, the button is INSIDE the form container. 
          I will place a button here that triggers the parent handler? 
          No, I will pass the handler down or just render the button here. 
          For now, I'll let the parent render the button to keep logic centralized, 
          OR I can just accept the handler as a prop.
          Actually, the original LoginPage had the button *below* the form fields.
          I will put the button here. */}
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
    <div className="flex flex-col items-center justify-center h-full px-10 text-center">
      <h1 className={cn("text-3xl font-bold mb-4", isLight ? "text-slate-800" : "text-white")}>{t('auth.signupTitle')}</h1>
      <div className="social-container mb-4">
        {/* Social Icons */}
      </div>
      <span className={cn("text-sm mb-4", isLight ? "text-slate-600" : "text-slate-400")}>{t('auth.useEmailRegistration')}</span>
      
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <div className="relative w-full">
           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IconUser className={cn("size-4", isLight ? "text-slate-400" : "text-slate-500")} />
          </div>
          <input
            type="text"
            placeholder={t('auth.fullName')}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={cn(
              "w-full rounded-lg border px-3 pl-10 py-3 text-sm outline-none transition-all",
              isLight 
                ? "bg-slate-100 border-none placeholder-slate-500 text-slate-900" 
                : "bg-slate-800 border-slate-700 placeholder-slate-400 text-slate-100"
            )}
          />
        </div>
        <div className="relative w-full">
           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IconBook className={cn("size-4", isLight ? "text-slate-400" : "text-slate-500")} />
          </div>
          <input
            type="text"
            placeholder="Class (e.g. 5 Amanah)"
            value={studentClass}
            onChange={(e) => setStudentClass(e.target.value)}
            className={cn(
              "w-full rounded-lg border px-3 pl-10 py-3 text-sm outline-none transition-all",
              isLight 
                ? "bg-slate-100 border-none placeholder-slate-500 text-slate-900" 
                : "bg-slate-800 border-slate-700 placeholder-slate-400 text-slate-100"
            )}
          />
        </div>
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IconMail className={cn("size-4", isLight ? "text-slate-400" : "text-slate-500")} />
          </div>
          <input
            type="email"
            placeholder={t('auth.email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={cn(
              "w-full rounded-lg border px-3 pl-10 py-3 text-sm outline-none transition-all",
              isLight 
                ? "bg-slate-100 border-none placeholder-slate-500 text-slate-900" 
                : "bg-slate-800 border-slate-700 placeholder-slate-400 text-slate-100"
            )}
          />
        </div>
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IconShield className={cn("size-4", isLight ? "text-slate-400" : "text-slate-500")} />
          </div>
          <input
            type="password"
            placeholder={t('auth.password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={cn(
              "w-full rounded-lg border px-3 pl-10 py-3 text-sm outline-none transition-all",
              isLight 
                ? "bg-slate-100 border-none placeholder-slate-500 text-slate-900" 
                : "bg-slate-800 border-slate-700 placeholder-slate-400 text-slate-100"
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
    <div className="relative h-full w-full flex text-white">
      
      {/* Left Panel Content - "Welcome Back" (Visible when Overlay is Left) */}
          <div className="w-1/2 flex flex-col items-center justify-center px-8 text-center">
            <h1 className="text-3xl font-bold mb-4">{t('auth.welcomeBack')}</h1>
            <p className="mb-8">{t('auth.alreadyHaveAccount')}</p>
            <button
              onClick={toggleAuthMode}
              className="rounded-full border border-white bg-transparent px-10 py-3 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-white hover:text-indigo-500"
            >
              {t('auth.signIn')}
            </button>
          </div>

          {/* Right Panel Content - "Hello Friend" (Visible when Overlay is Right) */}
          <div className="w-1/2 flex flex-col items-center justify-center px-8 text-center">
            <h1 className="text-3xl font-bold mb-4">{t('auth.helloStudent')}</h1>
            <p className="mb-8">{t('auth.newToPathfinder')}</p>
            <button
              onClick={toggleAuthMode}
              className="rounded-full border border-white bg-transparent px-10 py-3 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-white hover:text-indigo-500"
            >
              {t('auth.signUp')}
            </button>
          </div>
    </div>
  )
}

// --- Main Page Component ---

export function AuthPage({ initialMode = 'login' }: AuthPageProps) {
  const nav = useNavigate()
  const location = useLocation()
  const { theme } = useTheme()
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

      nav('/dashboard', { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign up failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center p-4 transition-colors duration-500 overflow-hidden",
      isLight ? "bg-[#c9d6ff] bg-gradient-to-r from-[#e2e2e2] to-[#c9d6ff]" : "bg-slate-950"
    )}>
      <div className={cn(
        "relative w-[768px] max-w-full h-[480px] bg-white rounded-[30px] shadow-2xl overflow-hidden",
        !isLight && "bg-slate-900"
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
             <Button onClick={handleSignUp} disabled={loading} fullWidth className="rounded-lg font-bold uppercase tracking-wider py-3">
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
             <Button onClick={handleLogin} disabled={loading} fullWidth className="rounded-lg font-bold uppercase tracking-wider py-3">
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
             "bg-gradient-to-r from-indigo-500 to-teal-500 relative -left-full h-full w-[200%] transform transition-transform duration-700 ease-in-out text-white",
             isSignUp ? "translate-x-1/2" : "translate-x-0"
           )}>
             <TogglePanel isSignUp={isSignUp} toggleAuthMode={toggleAuthMode} t={t} />
           </div>
        </div>

      </div>
    </div>
  )
}
