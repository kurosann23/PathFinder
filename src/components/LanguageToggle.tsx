import { useLanguage } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'
import { cn } from '../lib/cn'

type LanguageToggleProps = {
  variant?: 'button' | 'sidebar'
  className?: string
  showLabel?: boolean
}

export function LanguageToggle({ variant = 'button', className, showLabel = true }: LanguageToggleProps) {
  const { language, toggleLanguage } = useLanguage()
  const { theme } = useTheme()
  const isLight = theme === 'light'

  if (variant === 'sidebar') {
    return (
      <button
        type="button"
        onClick={toggleLanguage}
        className={cn(
          'flex w-full items-center justify-between rounded-xl border px-3 py-3.5 text-sm font-semibold transition',
          isLight
            ? 'border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50 shadow-sm'
            : 'border-slate-800/60 bg-slate-950/25 text-slate-200 hover:border-slate-700/60 hover:bg-slate-900/40',
          className,
        )}
        aria-label={language === 'en' ? 'Switch to Bahasa Melayu' : 'Switch to English'}
      >
        {showLabel && (
          <span className={cn(isLight && 'font-semibold text-slate-900')}>
            {language === 'en' ? 'English' : 'Bahasa Melayu'}
          </span>
        )}
        <span className="text-base">
          {language === 'en' ? '🇬🇧 EN' : '🇲🇾 MY'}
        </span>
      </button>
    )
  }

  // Default button variant (for top-right placement)
  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={cn(
        'flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition',
        isLight
          ? 'border-slate-300 bg-white/90 text-slate-800 hover:border-slate-400 hover:bg-slate-50 shadow-md'
          : 'border-slate-800/60 bg-slate-950/40 text-slate-200 hover:border-slate-700/60 hover:bg-slate-900/60',
        className,
      )}
      aria-label={language === 'en' ? 'Switch to Bahasa Melayu' : 'Switch to English'}
    >
      <span className="text-base">
        {language === 'en' ? '🇬🇧 EN' : '🇲🇾 MY'}
      </span>
      {showLabel && (
        <span>
          {language === 'en' ? 'EN ⇄ MY' : 'MY ⇄ EN'}
        </span>
      )}
    </button>
  )
}
