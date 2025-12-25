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
  const common = { className: cn('text-slate-400', className), size: 20 }

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

type SidebarProps = {
  variant?: 'desktop' | 'mobile'
  onMenuClick?: () => void
  collapsed?: boolean
  onToggleCollapse?: () => void
}

export function Sidebar(props: SidebarProps) {
  const { variant = 'desktop', onMenuClick, collapsed = false, onToggleCollapse } = props

  const isMobile = variant === 'mobile'
  const isCollapsed = !isMobile && collapsed

  return (
    <aside
      className={cn(
        'h-screen flex-col border-r border-slate-800/70 bg-slate-950/70 px-4 py-6 backdrop-blur',
        isCollapsed ? 'w-20' : 'w-72',
        isMobile ? 'flex md:hidden' : 'hidden md:flex',
      )}
    >
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-xl bg-blue-600/20 ring-1 ring-blue-500/30">
            <span className="text-base font-bold text-blue-200">🎓</span>
          </div>
          {!isCollapsed && (
            <div className="leading-tight">
              <div className="text-base font-semibold text-slate-100">
                PathFinder
              </div>
              <div className="text-sm text-slate-400">Student Dashboard</div>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={isMobile ? onMenuClick : onToggleCollapse}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-900/60 hover:text-slate-200"
          aria-label={
            isMobile
              ? 'Close menu'
              : isCollapsed
                ? 'Expand sidebar'
                : 'Collapse sidebar'
          }
        >
          {isMobile ? (
            <span className="relative block size-4">
              <span className="absolute left-1/2 top-1/2 block h-[2px] w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-current opacity-80" />
              <span className="absolute left-1/2 top-1/2 block h-[2px] w-4 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-current opacity-80" />
            </span>
          ) : (
            <>
              <span className="block h-[2px] w-4 bg-current opacity-80" />
              <span className="mt-1 block h-[2px] w-4 bg-current opacity-60" />
              <span className="mt-1 block h-[2px] w-4 bg-current opacity-40" />
            </>
          )}
        </button>
      </div>

      {/* Nav: top-aligned like the reference sidebar (space fills between nav and footer). */}
      <nav className="mt-6 flex flex-1 flex-col gap-2 px-1">
        {navigation.map((item) => (
          <NavLink
            key={item.key}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-3 rounded-xl px-3 py-3.5 text-base font-medium transition',
                isActive
                  ? 'bg-blue-600/25 text-slate-50'
                  : 'text-slate-200/90 hover:bg-slate-900/60 hover:text-slate-100',
                isActive &&
                  'before:absolute before:left-0 before:top-1/2 before:h-6 before:w-1 before:-translate-y-1/2 before:rounded-r before:bg-slate-50',
                isCollapsed && 'justify-center px-2',
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
                {!isCollapsed && (
                  <span
                    className={cn(
                      'min-w-0',
                      item.key === 'course'
                        ? 'whitespace-normal leading-snug'
                        : 'truncate',
                    )}
                  >
                    {item.label}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-1">
        <div className={cn('rounded-2xl border border-slate-800/70 bg-slate-950/40', isCollapsed ? 'p-3' : 'p-4')}>
          <div className={cn('flex items-center gap-3', isCollapsed && 'justify-center')}>
            <div className="grid size-11 place-items-center rounded-full bg-blue-600/25 text-base font-semibold text-blue-200 ring-1 ring-blue-500/25">
              {user.name.slice(0, 1).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="truncate text-base font-semibold text-slate-100">
                  {user.name}
                </div>
                <div className="truncate text-sm text-slate-400">{user.email}</div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-2 px-2">
          <button
            type="button"
            className={cn(
              'flex w-full items-center justify-between gap-3 rounded-xl px-2 py-2.5 text-base text-slate-300 hover:bg-slate-900/50 hover:text-slate-100',
              isCollapsed && 'justify-center',
            )}
            aria-label="Theme (UI only)"
          >
            {!isCollapsed && <span>Theme</span>}
            <IconMoon size={20} className="text-slate-300" />
          </button>
          <button
            type="button"
            className={cn(
              'flex w-full items-center justify-between gap-3 rounded-xl px-2 py-2.5 text-base text-slate-300 hover:bg-slate-900/50 hover:text-slate-100',
              isCollapsed && 'justify-center',
            )}
            aria-label="Sign out (UI only)"
          >
            {!isCollapsed && <span>Sign Out</span>}
            <IconLogout size={20} className="text-slate-300" />
          </button>
        </div>
      </div>
    </aside>
  )
}


