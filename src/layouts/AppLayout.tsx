import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import { cn } from '../lib/cn'
import { Button } from '../components/ui/Button'
import { ThemeToggle } from '../components/ThemeToggle'
import { useTheme } from '../context/ThemeContext'
import { THEME_STORAGE_KEY } from '../context/ThemeContext'
import { useTranslation } from '../context/LanguageContext'

function MobileTopbar(props: { onMenuClick: () => void }) {
  const location = useLocation()
  const { onMenuClick } = props
  const { t } = useTranslation()
  const title =
    location.pathname
      .replace('/', '')
      .split('-')
      .map((s) => (s ? s[0].toUpperCase() + s.slice(1) : s))
      .join(' ') || 'Dashboard'

  return (
    <div className="sticky top-0 z-20 border-b border-slate-800/60 bg-slate-950/45 backdrop-blur-xl light-mode:border-slate-300/60 light-mode:bg-white/95 light-mode:shadow-sm md:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-xl border border-slate-800/60 bg-slate-950/30 shadow-[0_0_25px_rgba(59,130,246,0.18)] light-mode:border-slate-300/60 light-mode:bg-blue-50 light-mode:shadow-md">
            <span className="text-xs font-bold tracking-wide text-slate-100 light-mode:text-blue-700">
              PF
            </span>
          </div>
          <div className="text-sm font-semibold text-slate-100 light-mode:text-slate-900">{title}</div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle variant="button" showLabel={false} className="!px-2.5 !py-2" />
          <Button
            type="button"
            onClick={onMenuClick}
            size="sm"
            variant="secondary"
          >
            {t('common.menu')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function AppLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false)
  const location = useLocation()
  const { theme } = useTheme()
  const isLight = theme === 'light'

  // Persist theme only for authenticated routes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    }
  }, [theme])

  // Close the mobile sidebar when navigating to a new route.
  useEffect(() => {
    setIsMobileSidebarOpen(false)
  }, [location.pathname])

  // Prevent background scroll while the mobile sidebar is open.
  useEffect(() => {
    if (!isMobileSidebarOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [isMobileSidebarOpen])

  return (
    <div className={cn('min-h-screen', isLight ? 'bg-white' : 'bg-[#060817]')}>
      {/* Base gradient - only in dark mode */}
      {!isLight && (
        <>
          <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-[#060817] via-[#070A18] to-[#090B1C]" />

          {/* Nebula glow layers (blue/purple like the reference) */}
          <div className="pointer-events-none fixed inset-0 opacity-80 bg-[radial-gradient(900px_circle_at_18%_20%,rgba(59,130,246,0.22),transparent_62%),radial-gradient(950px_circle_at_55%_115%,rgba(168,85,247,0.18),transparent_60%),radial-gradient(800px_circle_at_85%_30%,rgba(56,189,248,0.12),transparent_62%)]" />

          {/* Starfield (very subtle dots) */}
          <div className="pointer-events-none fixed inset-0 opacity-[0.10] bg-[radial-gradient(rgba(255,255,255,0.9)_1px,transparent_1px)] [background-size:120px_120px]" />
          <div className="pointer-events-none fixed inset-0 opacity-[0.07] bg-[radial-gradient(rgba(255,255,255,0.9)_1px,transparent_1px)] [background-size:220px_220px] [background-position:40px_80px]" />
          {/* Slightly denser cluster near top-left (masked) */}
          <div className="pointer-events-none fixed inset-0 opacity-[0.08] [mask-image:radial-gradient(520px_circle_at_18%_18%,black,transparent_70%)] bg-[radial-gradient(rgba(255,255,255,0.9)_1px,transparent_1px)] [background-size:90px_90px]" />

          {/* Soft vignette to keep edges darker */}
          <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(1200px_circle_at_50%_40%,transparent_55%,rgba(0,0,0,0.55))]" />

          {/* Bottom arc / swirl highlight behind timeline (very subtle) */}
          <div className="pointer-events-none fixed inset-x-0 bottom-0 h-[55vh] opacity-70 [mask-image:radial-gradient(900px_circle_at_50%_95%,black,transparent_65%)] bg-[radial-gradient(900px_circle_at_50%_100%,rgba(168,85,247,0.22),transparent_60%),radial-gradient(900px_circle_at_50%_100%,rgba(59,130,246,0.16),transparent_65%)]" />
          <div className="pointer-events-none fixed inset-x-0 bottom-0 h-[55vh] opacity-[0.55] bg-[conic-gradient(from_200deg_at_50%_96%,transparent,rgba(59,130,246,0.22),transparent_35%,transparent)] [mask-image:radial-gradient(820px_circle_at_50%_95%,black,transparent_70%)]" />
        </>
      )}

      <div className="relative w-full">
        <MobileTopbar onMenuClick={() => setIsMobileSidebarOpen(true)} />

        {/* Mobile sidebar drawer */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <button
              type="button"
              aria-label="Close sidebar"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <div className="absolute inset-y-0 left-0 w-72">
              <Sidebar variant="mobile" onMenuClick={() => setIsMobileSidebarOpen(false)} />
            </div>
          </div>
        )}

        <div className="md:flex">
          <div
            className={cn(
              'md:fixed md:inset-y-0 md:left-0',
              isDesktopSidebarCollapsed ? 'md:w-20' : 'md:w-72',
            )}
          >
            <Sidebar
              variant="desktop"
              collapsed={isDesktopSidebarCollapsed}
              onToggleCollapse={() => setIsDesktopSidebarCollapsed((v) => !v)}
            />
          </div>

          <main
            className={cn(
              'min-h-screen w-full px-4 py-6 md:px-10 md:py-8',
              isDesktopSidebarCollapsed ? 'md:ml-20' : 'md:ml-72',
            )}
          >
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}


