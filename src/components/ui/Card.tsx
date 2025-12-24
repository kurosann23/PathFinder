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
        'rounded-2xl border border-slate-800/70 bg-slate-900/40 shadow-sm',
        className,
      )}
    >
      {(title || right) && (
        <div className="flex items-center justify-between gap-3 border-b border-slate-800/60 px-5 py-4">
          <div className="min-w-0">
            {title && (
              <h3 className="truncate text-sm font-semibold text-slate-100">
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


