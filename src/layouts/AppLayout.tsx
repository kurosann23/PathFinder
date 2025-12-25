import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import { cn } from '../lib/cn'

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
          onClick={onMenuClick}
          className="rounded-lg border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-xs font-semibold text-slate-200"
        >
          Menu
        </button>
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
          'pointer-events-none fixed inset-0 opacity-60',
          'bg-[radial-gradient(600px_circle_at_20%_15%,rgba(59,130,246,0.25),transparent_45%),radial-gradient(700px_circle_at_80%_30%,rgba(168,85,247,0.20),transparent_55%),radial-gradient(500px_circle_at_70%_85%,rgba(34,211,238,0.10),transparent_55%)]',
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


