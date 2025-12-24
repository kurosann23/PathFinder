import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import { cn } from '../lib/cn'

function MobileTopbar() {
  const location = useLocation()
  const title =
    location.pathname
      .replace('/', '')
      .split('-')
      .map((s) => (s ? s[0].toUpperCase() + s.slice(1) : s))
      .join(' ') || 'Dashboard'

  return (
    <div className="sticky top-0 z-20 border-b border-slate-800/70 bg-slate-950/70 backdrop-blur md:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-xl bg-blue-600/20 ring-1 ring-blue-500/30">
            <span className="text-xs font-bold text-blue-200">PF</span>
          </div>
          <div className="text-sm font-semibold text-slate-100">{title}</div>
        </div>
        <button
          type="button"
          className="rounded-lg border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-xs font-semibold text-slate-200"
        >
          Menu
        </button>
      </div>
    </div>
  )
}

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-950">
      <div
        className={cn(
          'pointer-events-none fixed inset-0 opacity-60',
          'bg-[radial-gradient(600px_circle_at_20%_15%,rgba(59,130,246,0.25),transparent_45%),radial-gradient(700px_circle_at_80%_30%,rgba(168,85,247,0.20),transparent_55%),radial-gradient(500px_circle_at_70%_85%,rgba(34,211,238,0.10),transparent_55%)]',
        )}
      />

      <div className="relative mx-auto max-w-[1400px]">
        <MobileTopbar />

        <div className="md:flex">
          <div className="md:fixed md:inset-y-0 md:w-72">
            <Sidebar />
          </div>

          <main className="min-h-screen px-4 py-6 md:ml-72 md:px-8 md:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}


