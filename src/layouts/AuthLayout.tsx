import { Outlet } from 'react-router-dom'
import { cn } from '../lib/cn'
import { useTheme } from '../context/ThemeContext'

export function AuthLayout() {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  return (
    <div className={cn('min-h-screen', isLight ? 'bg-slate-50' : 'bg-slate-950')}>
      {!isLight && (
        <div
          className={cn(
            'pointer-events-none fixed inset-0 opacity-60',
            'bg-[radial-gradient(600px_circle_at_20%_15%,rgba(59,130,246,0.25),transparent_45%),radial-gradient(700px_circle_at_80%_30%,rgba(168,85,247,0.20),transparent_55%),radial-gradient(500px_circle_at_70%_85%,rgba(34,211,238,0.10),transparent_55%)]',
          )}
        />
      )}
      {isLight && (
        <div className="pointer-events-none fixed inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-slate-50/20" />
      )}
      <div className="relative mx-auto flex min-h-screen max-w-xl items-center px-4 py-10">
        <div className="w-full">
          <Outlet />
        </div>
      </div>
    </div>
  )
}


