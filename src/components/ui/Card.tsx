import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type CardProps = {
  title?: string
  right?: ReactNode
  children: ReactNode
  className?: string
}

export function Card(props: CardProps) {
  const { title, right, children, className } = props

  return (
    <section
      className={cn(
        // Neon-glass HUD base
        'relative overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-950/18 backdrop-blur-xl',
        'shadow-[0_8px_28px_rgba(0,0,0,0.22)]',
        'before:pointer-events-none before:absolute before:inset-0 before:opacity-60',
        'before:bg-[radial-gradient(900px_circle_at_18%_12%,rgba(59,130,246,0.20),transparent_60%),radial-gradient(900px_circle_at_85%_75%,rgba(59,130,246,0.10),transparent_65%)]',
        'after:pointer-events-none after:absolute after:inset-0 after:ring-1 after:ring-white/5',
        className,
      )}
    >
      {(title || right) && (
        <div className="relative flex items-center justify-between gap-3 px-5 py-4">
          <div className="pointer-events-none absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-700/60 to-transparent" />
          <div className="min-w-0">
            {title && (
              <h3 className="truncate text-xs font-semibold uppercase tracking-[0.16em] text-slate-200/90">
                {title}
              </h3>
            )}
          </div>
          {right && <div className="shrink-0">{right}</div>}
        </div>
      )}
      <div className="px-5 py-4">{children}</div>
    </section>
  )
}


