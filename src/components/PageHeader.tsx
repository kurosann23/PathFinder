import type { ReactNode } from 'react'

type PageHeaderProps = {
  title: string
  subtitle?: string
  right?: ReactNode
}

export function PageHeader(props: PageHeaderProps) {
  const { title, subtitle, right } = props

  return (
    <header className="space-y-2">
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300/70">
            Pathfinder
          </div>
          <h1 className="mt-1 truncate text-3xl font-semibold tracking-tight text-slate-50 md:text-4xl">
            {title}
          </h1>
        </div>
        {right && <div className="shrink-0">{right}</div>}
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-slate-700/60 to-transparent" />

      {subtitle && (
        <p className="text-sm leading-relaxed text-slate-300/80">
          {subtitle}
        </p>
      )}
    </header>
  )
}


