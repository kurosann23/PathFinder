import { useTheme } from '../context/ThemeContext'
import { IconSun, IconMoon } from './icons'
import { cn } from '../lib/cn'
import { themeCn } from '../lib/themeUtils'

type ThemeToggleProps = {
  variant?: 'button' | 'sidebar'
  className?: string
  showLabel?: boolean
}

export function ThemeToggle({ variant = 'button', className, showLabel = true }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const isLight = theme === 'light'

  if (variant === 'sidebar') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={themeCn(
          'flex w-full items-center justify-between rounded-xl border border-slate-800/60 bg-slate-950/25 px-3 py-3.5 text-sm font-semibold transition hover:border-slate-700/60 hover:bg-slate-900/40 text-slate-200',
          'flex w-full items-center justify-between rounded-xl border-2 border-blue-300 bg-white px-3 py-3.5 text-sm font-semibold shadow-sm transition hover:border-blue-400 hover:bg-blue-50 hover:shadow-md text-slate-800',
          theme,
          className,
        )}
        aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      >
        {showLabel && <span className={cn(isLight && 'font-bold text-slate-900')}>{isLight ? 'Light Mode' : 'Dark Mode'}</span>}
        {isLight ? (
          <IconSun size={20} className="text-amber-500" />
        ) : (
          <IconMoon size={20} className="text-slate-300" />
        )}
      </button>
    )
  }

  // Default button variant (for top-right placement)
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={themeCn(
        'flex items-center gap-2 rounded-xl border border-slate-800/60 bg-slate-950/40 px-4 py-2.5 text-sm font-semibold transition hover:border-slate-700/60 hover:bg-slate-900/60 text-slate-200',
        'flex items-center gap-2 rounded-xl border border-slate-300/60 bg-white/90 px-4 py-2.5 text-sm font-semibold transition hover:border-slate-400/60 hover:bg-slate-50 text-slate-800 shadow-md',
        theme,
        className,
      )}
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {isLight ? (
        <>
          <IconSun size={18} className="text-amber-600" />
          {showLabel && <span>Light Mode</span>}
        </>
      ) : (
        <>
          <IconMoon size={18} className="text-slate-300" />
          {showLabel && <span>Dark Mode</span>}
        </>
      )}
    </button>
  )
}
