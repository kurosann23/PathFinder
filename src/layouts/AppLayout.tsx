import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import { cn } from '../lib/cn'
import { Button } from '../components/ui/Button'

function MobileTopbar(props: { onMenuClick: () => void }) {
  const location = useLocation()
  const { onMenuClick } = props
  const title =
    location.pathname
      .replace('/', '')
      .split('-')
      .map((s) => (s ? s[0].toUpperCase() + s.slice(1) : s))
      .join(' ') || 'Dashboard'

  return (
    <div className="sticky top-0 z-20 border-b border-slate-800/60 bg-slate-950/45 backdrop-blur-xl md:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-xl border border-slate-800/60 bg-slate-950/30 shadow-[0_0_25px_rgba(59,130,246,0.18)]">
            <span className="text-xs font-bold tracking-wide text-slate-100">
              PF
            </span>
          </div>
          <div className="text-sm font-semibold text-slate-100">{title}</div>
        </div>
        <Button
          type="button"
          onClick={onMenuClick}
          size="sm"
          variant="secondary"
        >
          Menu
        </Button>
      </div>
    </div>
  )
}

export function AppLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false)
  const location = useLocation()

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
    <div className="min-h-screen bg-slate-950">
      <div
        className={cn(
          // Subtle, minimal gradient only (no textures / no multi-color accents)
          'pointer-events-none fixed inset-0 opacity-70',
          'bg-[radial-gradient(900px_circle_at_20%_12%,rgba(59,130,246,0.22),transparent_60%),radial-gradient(900px_circle_at_80%_35%,rgba(59,130,246,0.14),transparent_65%)]',
        )}
      />

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


