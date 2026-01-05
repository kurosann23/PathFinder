import { cn } from './cn'

/**
 * Utility function to get theme-aware input field classes
 * Use this for consistent input styling across all pages
 */
export function inputClasses(isLight: boolean, className?: string) {
  return cn(
    'mt-2 w-full rounded-2xl border px-4 py-3 text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2',
    isLight
      ? 'border-slate-200 bg-white text-slate-900 focus:ring-blue-500/30'
      : 'border-slate-800/70 bg-slate-950/40 text-slate-100 focus:ring-blue-500/20',
    className,
  )
}

/**
 * Utility function to get theme-aware label text classes
 */
export function labelClasses(isLight: boolean, className?: string) {
  return cn(
    'text-xs font-semibold',
    isLight ? 'text-slate-700' : 'text-slate-400',
    className,
  )
}

/**
 * Utility function to get theme-aware text color classes
 */
export function textColorClasses(isLight: boolean, variant: 'primary' | 'secondary' | 'muted' = 'primary') {
  if (isLight) {
    switch (variant) {
      case 'primary':
        return 'text-slate-900'
      case 'secondary':
        return 'text-slate-700'
      case 'muted':
        return 'text-slate-600'
    }
  } else {
    switch (variant) {
      case 'primary':
        return 'text-slate-100'
      case 'secondary':
        return 'text-slate-200'
      case 'muted':
        return 'text-slate-400'
    }
  }
}
