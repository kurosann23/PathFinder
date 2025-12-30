import { NavLink, useNavigate } from 'react-router-dom'
import { navigation, type NavKey } from '../constants/navigation'
import { cn } from '../lib/cn'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../context/ProfileContext'
import { Button } from './ui/Button'
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
  const { user, signOut } = useAuth()
  const { profile } = useProfile()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <aside
      className={cn(
        // Neon-glass HUD sidebar
        'relative h-screen flex-col border-r border-slate-800/50 bg-slate-950/45 px-4 py-6 backdrop-blur-xl',
        'shadow-[0_18px_60px_rgba(0,0,0,0.40)]',
        isCollapsed ? 'w-20' : 'w-72',
        isMobile ? 'flex md:hidden' : 'hidden md:flex',
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-70 [mask-image:radial-gradient(900px_circle_at_20%_10%,black,transparent_70%)]">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent_35%),radial-gradient(700px_circle_at_15%_15%,rgba(59,130,246,0.16),transparent_62%),radial-gradient(800px_circle_at_90%_80%,rgba(168,85,247,0.12),transparent_68%)]" />
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl border border-slate-800/60 bg-slate-950/35 shadow-[0_0_30px_rgba(59,130,246,0.18)]">
            <span className="text-base font-bold tracking-wide text-slate-100">
              P
            </span>
          </div>
          {!isCollapsed && (
            <div className="leading-tight">
              <div className="text-base font-semibold tracking-tight text-slate-100">
                PathFinder
              </div>
              <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400/90">
                Student Dashboard
              </div>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={isMobile ? onMenuClick : onToggleCollapse}
          className="rounded-xl border border-transparent p-2 text-slate-300/80 hover:border-slate-800/60 hover:bg-slate-950/30 hover:text-slate-100"
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
      <div className="mt-6 px-2">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-700/60 to-transparent" />
      </div>

      <nav className="relative mt-5 flex flex-1 flex-col gap-2 px-1">
        {navigation.map((item) => (
          <NavLink
            key={item.key}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-3 rounded-2xl px-3 py-3.5 text-sm font-semibold transition',
                isActive
                  ? 'border border-blue-500/25 bg-blue-600/15 text-slate-50 shadow-[0_0_25px_rgba(59,130,246,0.18)]'
                  : 'border border-transparent text-slate-200/90 hover:border-slate-800/60 hover:bg-slate-950/25 hover:text-slate-100',
                isCollapsed && 'justify-center px-2',
              )
            }
          >
            {({ isActive }) => (
              <>
                <NavIcon
                  navKey={item.key}
                  className={cn(
                    isActive
                      ? 'text-blue-200 drop-shadow-[0_0_12px_rgba(59,130,246,0.22)]'
                      : 'group-hover:text-slate-200',
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
        <div className="px-2">
          <div className="h-px bg-gradient-to-r from-transparent via-slate-700/60 to-transparent" />
        </div>

        <div
          className={cn(
            'mt-5 rounded-2xl border border-slate-800/60 bg-slate-950/25 backdrop-blur-xl shadow-[0_0_25px_rgba(59,130,246,0.10)]',
            isCollapsed ? 'p-3' : 'p-4',
          )}
        >
          <div className={cn('flex items-center gap-3', isCollapsed && 'justify-center')}>
            <div className="grid size-11 place-items-center overflow-hidden rounded-full border border-slate-800/60 bg-slate-950/35 text-base font-semibold text-slate-100 shadow-[0_0_18px_rgba(59,130,246,0.15)]">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                (profile?.full_name?.slice(0, 1) ?? user?.email?.slice(0, 1) ?? 'U').toUpperCase()
              )}
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="truncate text-base font-semibold text-slate-100">
                  {profile?.full_name ?? user?.email?.split('@')[0] ?? 'Student'}
                </div>
                <div className="truncate text-sm text-slate-400">
                  {profile?.class ? `${profile.class} • ` : ''}
                  {user?.email ?? '—'}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-2 px-2">
          <Button
            type="button"
            variant="ghost"
            size="md"
            className={cn('flex w-full justify-between px-2', isCollapsed && 'justify-center')}
            aria-label="Theme (UI only)"
          >
            {!isCollapsed && <span>Theme</span>}
            <IconMoon size={20} className="text-slate-300" />
          </Button>
          <Button
            type="button"
            onClick={handleLogout}
            variant="ghost"
            size="md"
            className={cn('flex w-full justify-between px-2', isCollapsed && 'justify-center')}
            aria-label="Sign out"
          >
            {!isCollapsed && <span>Sign Out</span>}
            <IconLogout size={20} className="text-slate-300" />
          </Button>
        </div>
      </div>
    </aside>
  )
}


