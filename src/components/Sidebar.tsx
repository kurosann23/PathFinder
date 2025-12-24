import { NavLink } from 'react-router-dom'
import { navigation, type NavKey } from '../constants/navigation'
import { user } from '../constants/user'
import { cn } from '../lib/cn'
import {
  IconBook,
  IconClipboard,
  IconGamepad,
  IconHome,
  IconLogout,
  IconMap,
  IconMoon,
  IconUser,
} from './icons'

function NavIcon(props: { navKey: NavKey; className?: string }) {
  const { navKey, className } = props
  const common = { className: cn('text-slate-400', className), size: 18 }

  switch (navKey) {
    case 'dashboard':
      return <IconHome {...common} />
    case 'profile':
      return <IconUser {...common} />
    case 'psychometric':
      return <IconClipboard {...common} />
    case 'course':
      return <IconBook {...common} />
    case 'roadmap':
      return <IconMap {...common} />
    case 'games':
      return <IconGamepad {...common} />
    default:
      return <IconHome {...common} />
  }
}

export function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-72 md:flex-col md:gap-4 md:border-r md:border-slate-800/70 md:bg-slate-950/40 md:px-4 md:py-5">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-blue-600/20 ring-1 ring-blue-500/30">
            <span className="text-sm font-bold text-blue-200">PF</span>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-slate-100">
              PathFinder
            </div>
            <div className="text-xs text-slate-400">Student Dashboard</div>
          </div>
        </div>
        <button
          type="button"
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-900/60 hover:text-slate-200"
          aria-label="Menu"
        >
          <span className="block h-[2px] w-4 bg-current opacity-80" />
          <span className="mt-1 block h-[2px] w-4 bg-current opacity-60" />
          <span className="mt-1 block h-[2px] w-4 bg-current opacity-40" />
        </button>
      </div>

      <nav className="space-y-1 px-1">
        {navigation.map((item) => (
          <NavLink
            key={item.key}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                isActive
                  ? 'bg-blue-600/20 text-blue-100 ring-1 ring-blue-500/25'
                  : 'text-slate-200/90 hover:bg-slate-900/60 hover:text-slate-100',
              )
            }
          >
            {({ isActive }) => (
              <>
                <NavIcon
                  navKey={item.key}
                  className={cn(
                    isActive ? 'text-blue-200' : 'group-hover:text-slate-200',
                  )}
                />
                <span className="min-w-0 truncate">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-4 px-1">
        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/40 p-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-full bg-blue-600/25 text-sm font-semibold text-blue-200 ring-1 ring-blue-500/25">
              {user.name.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-slate-100">
                {user.name}
              </div>
              <div className="truncate text-xs text-slate-400">{user.email}</div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="text-xs text-slate-400">Theme</div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-900/60"
              aria-label="Toggle theme (UI only)"
            >
              <IconMoon size={16} className="text-slate-300" />
              Dark
            </button>
          </div>
        </div>

        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-800/70 bg-slate-950/40 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-900/60"
        >
          <IconLogout size={18} className="text-slate-300" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}


