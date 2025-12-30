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
        'relative overflow-hidden rounded-2xl border border-slate-800/50 bg-slate-950/25 backdrop-blur-xl',
        'shadow-[0_18px_60px_rgba(0,0,0,0.35)]',
        // subtle glass highlight + glow like the reference
        'before:pointer-events-none before:absolute before:inset-0 before:opacity-70',
        'before:bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent_35%),radial-gradient(900px_circle_at_18%_12%,rgba(59,130,246,0.18),transparent_60%),radial-gradient(900px_circle_at_85%_75%,rgba(168,85,247,0.12),transparent_65%)]',
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


