import { NavLink, useNavigate } from 'react-router-dom'
import { studentNavigation, teacherNavigation, type NavKey } from '../constants/navigation'
import { cn } from '../lib/cn'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../context/ProfileContext'
import { useRole } from '../context/RoleContext'
import { useTheme } from '../context/ThemeContext'
import { Button } from './ui/Button'
import { Avatar } from './ui/Avatar'
import { ThemeToggle } from './ThemeToggle'
import { LanguageToggle } from './LanguageToggle'
import { useTranslation } from '../context/LanguageContext'
import {
  IconBook,
  IconClipboard,
  IconGamepad,
  IconHome,
  IconLogout,
  IconMap,
  IconUser,
} from './icons'

function NavIcon(props: { navKey: NavKey; className?: string; isActive?: boolean; isLight?: boolean }) {
  const { navKey, className, isActive, isLight } = props
  const common = { 
    className: cn(
      isLight 
        ? isActive ? 'text-blue-700' : 'text-slate-700' 
        : 'text-slate-400',
      className
    ), 
    size: 20 
  }

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
    case 'teacher':
      return <IconHome {...common} />
    case 'teacher-questions':
      return <IconClipboard {...common} />
    case 'teacher-courses':
      return <IconBook {...common} />
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
  const { profile, loading: profileLoading } = useProfile()
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const { t } = useTranslation()
  
  // Get role - hook must be called unconditionally
  // RoleProvider wraps the app, so this should always be available
  const { isTeacher } = useRole()
  
  // Wait for profile to load before showing navigation to avoid showing wrong role's nav
  // This prevents the flash of student navigation when a teacher logs in
  const navigation = profileLoading ? [] : (isTeacher ? teacherNavigation : studentNavigation)

  function getLabel(key: NavKey) {
    switch (key) {
      case 'dashboard':
        return t('nav.dashboard')
      case 'profile':
        return t('nav.profile')
      case 'psychometric':
        return t('nav.psychometricTest')
      case 'course':
        return t('nav.courseRecommendation')
      case 'roadmap':
        return t('nav.learningRoadmap')
      case 'appointment':
        return t('nav.appointments')
      case 'teacher':
        return t('nav.teacherDashboard')
      case 'teacher-students':
        return t('nav.studentOverview')
      case 'teacher-questions':
        return t('nav.manageQuestions')
      case 'teacher-courses':
        return t('nav.manageCourses')
      case 'teacher-appointments':
        return t('nav.teacherAppointments')
      default:
        return t('nav.dashboard')
    }
  }

  async function handleLogout() {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <aside
      className={cn(
        // Neon-glass HUD sidebar (dark mode)
        'relative h-screen flex-col border-r px-4 py-6 backdrop-blur-xl',
        isLight
          ? 'border-slate-200 bg-slate-50 shadow-lg'
          : 'border-slate-800/50 bg-slate-950/45 shadow-[0_18px_60px_rgba(0,0,0,0.40)]',
        isCollapsed ? 'w-20' : 'w-72',
        isMobile ? 'flex md:hidden' : 'hidden md:flex',
      )}
    >
      {!isLight && (
        <div className="pointer-events-none absolute inset-0 opacity-70 [mask-image:radial-gradient(900px_circle_at_20%_10%,black,transparent_70%)]">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent_35%),radial-gradient(700px_circle_at_15%_15%,rgba(59,130,246,0.16),transparent_62%),radial-gradient(800px_circle_at_90%_80%,rgba(168,85,247,0.12),transparent_68%)]" />
        </div>
      )}

      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className={cn(
            'grid size-11 place-items-center rounded-2xl border shadow-lg',
            isLight
              ? 'border-blue-200 bg-blue-50'
              : 'border-slate-800/60 bg-slate-950/35 shadow-[0_0_30px_rgba(59,130,246,0.18)]'
          )}>
            <span className={cn(
              'text-base font-bold tracking-wide',
              isLight ? 'text-blue-700' : 'text-slate-100'
            )}>
              P
            </span>
          </div>
          {!isCollapsed && (
            <div className="leading-tight">
              <div className={cn(
                'text-base font-semibold tracking-tight',
                isLight ? 'text-slate-900' : 'text-slate-100'
              )}>
                PathFinder
              </div>
              <div className={cn(
                'text-xs font-medium uppercase tracking-[0.16em]',
                isLight ? 'text-slate-600' : 'text-slate-400/90'
              )}>
                {profileLoading ? t('common.loading') : (isTeacher ? t('nav.teacherDashboard') : t('nav.dashboard'))}
              </div>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={isMobile ? onMenuClick : onToggleCollapse}
          className={cn(
            'rounded-xl border p-2 transition-colors',
            isLight
              ? 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900'
              : 'border-transparent text-slate-300/80 hover:border-slate-800/60 hover:bg-slate-950/30 hover:text-slate-100'
          )}
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
        <div className={cn(
          'h-px bg-gradient-to-r',
          isLight
            ? 'from-transparent via-slate-200 to-transparent'
            : 'from-transparent via-slate-700/60 to-transparent'
        )} />
      </div>

      <nav className={cn('relative mt-5 flex flex-1 flex-col px-1', isLight ? 'gap-3' : 'gap-2')}>
        {profileLoading ? (
          // Show loading skeleton while profile loads to prevent wrong navigation from showing
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={cn(
                  'h-12 rounded-2xl bg-slate-900/30 animate-pulse',
                  isCollapsed && 'h-10',
                )}
              />
            ))}
          </div>
        ) : (
          navigation.map((item) => (
            <NavLink
              key={item.key}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-3 rounded-xl px-3 text-base font-medium transition',
                  isLight
                    ? isActive
                      ? 'border-2 border-blue-300 bg-blue-50 py-3.5 text-blue-700 shadow-sm'
                      : 'border border-transparent py-3.5 text-slate-700 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                    : isActive
                      ? 'border border-blue-500/25 bg-blue-600/15 py-3.5 text-slate-50 shadow-[0_0_25px_rgba(59,130,246,0.18)]'
                      : 'border border-transparent py-3.5 text-slate-200/90 hover:border-slate-800/60 hover:bg-slate-950/25 hover:text-slate-100',
                  isCollapsed && 'justify-center px-2',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <NavIcon
                    navKey={item.key}
                    isActive={isActive}
                    isLight={isLight}
                    className={cn(
                      !isLight && isActive && 'text-blue-200 drop-shadow-[0_0_12px_rgba(59,130,246,0.22)]',
                      !isLight && !isActive && 'group-hover:text-slate-200',
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
                      {getLabel(item.key)}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))
        )}
      </nav>

      <div className="mt-auto px-1">
        <div className="px-2">
          <div className={cn(
            'h-px bg-gradient-to-r',
            isLight
              ? 'from-transparent via-slate-200 to-transparent'
              : 'from-transparent via-slate-700/60 to-transparent'
          )} />
        </div>

        <div
          className={cn(
            'mt-5 rounded-2xl border backdrop-blur-xl',
            isLight
              ? 'border-slate-200 bg-white p-4 shadow-md'
              : 'border-slate-800/60 bg-slate-950/25 shadow-[0_0_25px_rgba(59,130,246,0.10)]',
            isCollapsed && 'p-3',
          )}
        >
          <div className={cn('flex items-center gap-3', isCollapsed && 'justify-center')}>
            <Avatar
              src={profile?.avatar_url}
              alt="Avatar"
              fallback={(profile?.full_name?.slice(0, 1) ?? user?.email?.slice(0, 1) ?? 'U').toUpperCase()}
              sizeClassName="size-11"
              className={cn(
                isLight
                  ? 'border-blue-200 bg-blue-50 shadow-sm'
                  : 'shadow-[0_0_18px_rgba(59,130,246,0.15)]'
              )}
              loading="eager"
            />
            {!isCollapsed && (
              <div className="min-w-0">
                <div className={cn(
                  'truncate text-base font-semibold',
                  isLight ? 'text-slate-900' : 'text-slate-100'
                )}>
                  {profile?.full_name ?? user?.email?.split('@')[0] ?? 'Student'}
                </div>
                <div className={cn(
                  'truncate text-base',
                  isLight ? 'text-slate-600' : 'text-slate-400'
                )}>
                  {profile?.class ? `${profile.class} • ` : ''}
                  {user?.email ?? '—'}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-2 px-2">
          <ThemeToggle variant="sidebar" showLabel={!isCollapsed} className={cn(isCollapsed && 'justify-center')} />
          <LanguageToggle variant="sidebar" showLabel={!isCollapsed} className={cn(isCollapsed && 'justify-center')} />
          <Button
            type="button"
            onClick={handleLogout}
            variant="ghost"
            size="md"
            className={cn(
              'flex w-full justify-between px-2',
              isCollapsed && 'justify-center',
              isLight && 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            )}
            aria-label="Sign out"
          >
            {!isCollapsed && <span>{t('common.signOut')}</span>}
            <IconLogout size={20} className={cn(isLight ? 'text-slate-600' : 'text-slate-300')} />
          </Button>
        </div>
      </div>
    </aside>
  )
}
