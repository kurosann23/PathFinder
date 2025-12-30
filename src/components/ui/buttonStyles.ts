import { cn } from '../../lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'icon'
export type ButtonSize = 'sm' | 'md' | 'lg'

export function buttonClasses(opts?: {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  className?: string
}) {
  const {
    variant = 'secondary',
    size = 'md',
    fullWidth = false,
    className,
  } = opts ?? {}

  const base =
    'inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition ' +
    'focus:outline-none focus:ring-2 focus:ring-blue-400/20 disabled:cursor-not-allowed disabled:opacity-60 ' +
    'select-none'

  const sizes: Record<ButtonSize, string> = {
    sm: 'rounded-xl px-3 py-2 text-xs',
    md: 'rounded-2xl px-4 py-2.5 text-sm',
    lg: 'rounded-2xl px-5 py-3 text-sm',
  }

  // Neon-blue only (no rainbow)
  const variants: Record<ButtonVariant, string> = {
    primary:
      'border border-blue-500/30 bg-blue-500/12 text-slate-50 ' +
      'shadow-[0_0_20px_rgba(59,130,246,0.18)] ' +
      'hover:bg-blue-500/16',
    secondary:
      'border border-slate-800/60 bg-slate-950/25 text-slate-200 hover:bg-slate-950/35',
    ghost:
      'border border-transparent bg-transparent text-slate-200 hover:border-slate-800/60 hover:bg-slate-950/20',
    danger:
      'border border-rose-500/25 bg-rose-500/10 text-rose-100 hover:bg-rose-500/14',
    icon:
      'rounded-xl border border-slate-800/60 bg-slate-950/25 p-2 text-slate-200 hover:bg-slate-950/35',
  }

  return cn(base, sizes[size], variants[variant], fullWidth && 'w-full', className)
}


