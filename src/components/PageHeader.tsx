import type { ReactNode } from 'react'
import { useTheme } from '../context/ThemeContext'
import { themeCn } from '../lib/themeUtils'

type PageHeaderProps = {
  title: string
  subtitle?: string
  right?: ReactNode
}

export function PageHeader(props: PageHeaderProps) {
  const { title, subtitle, right } = props
  const { theme } = useTheme()

  return (
    <header className="space-y-2">
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <div className={themeCn(
            'text-xs font-semibold uppercase tracking-[0.18em] text-slate-300/70',
            'text-xs font-semibold uppercase tracking-[0.18em] text-slate-600',
            theme,
          )}>
            Pathfinder
          </div>
          <h1 className={themeCn(
            'mt-1 truncate text-3xl font-semibold tracking-tight text-slate-50 md:text-4xl',
            'mt-1 truncate text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl',
            theme,
          )}>
            {title}
          </h1>
        </div>
        {right && <div className="shrink-0">{right}</div>}
      </div>

      <div className={themeCn(
        'h-px bg-gradient-to-r from-transparent via-slate-700/60 to-transparent',
        'h-px bg-gradient-to-r from-transparent via-slate-300/60 to-transparent',
        theme,
      )} />

      {subtitle && (
        <p className={themeCn(
          'text-sm leading-relaxed text-slate-300/80',
          'text-sm leading-relaxed text-slate-700',
          theme,
        )}>
          {subtitle}
        </p>
      )}
    </header>
  )
}


