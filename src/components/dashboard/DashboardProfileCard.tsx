import { Link } from 'react-router-dom'
import { useProfile } from '../../context/ProfileContext'
import { useUserProgress } from '../../context/UserProgressContext'
import { useTheme } from '../../context/ThemeContext'
import { cn } from '../../lib/cn'
import { IconEdit } from '../icons'
import { Avatar } from '../ui/Avatar'
import { careerSnapshotMeta } from '../../constants/dashboard'
import { useMemo } from 'react'

export function DashboardProfileCard() {
  const { profile } = useProfile()
  const { progress } = useUserProgress()
  const { theme } = useTheme()
  const isLight = theme === 'light'

  const topCareerTypeLabel = useMemo(() => {
    if (!progress.psychometricCompleted) return null
    
    // Find highest value
    const traits = progress.riasecPercentages
    let topKey = ''
    let topValue = -1
    
    Object.entries(traits).forEach(([key, value]) => {
      if (value > topValue) {
        topValue = value
        topKey = key
      }
    })

    // Map R,I,A,S,E,C to full label
    const map: Record<string, string> = {
      R: 'Realistic',
      I: 'Investigative',
      A: 'Artistic',
      S: 'Social',
      E: 'Enterprising',
      C: 'Conventional'
    }

    return map[topKey] || null
  }, [progress])

  return (
    <div className={cn(
      'flex h-full flex-col items-center justify-center rounded-2xl border p-8 text-center backdrop-blur-xl transition-all',
      isLight 
        ? 'border-blue-100/60 bg-white shadow-lg' 
        : 'border-slate-800/60 bg-slate-950/16 shadow-[0_0_55px_rgba(59,130,246,0.10)]'
    )}>
      <div className="mb-6 relative group">
        <div className={cn(
            "absolute -inset-1 rounded-full blur opacity-25 transition duration-500 group-hover:opacity-50",
            isLight ? "bg-blue-400" : "bg-blue-600"
        )}></div>
        <Avatar 
          src={profile?.avatar_url} 
          alt={profile?.full_name || 'Student'} 
          className="size-32 text-3xl shadow-xl relative" 
        />
      </div>

      <h2 className={cn(
        'mb-2 text-2xl font-bold tracking-tight',
        isLight ? 'text-slate-900' : 'text-slate-50'
      )}>
        {profile?.full_name || 'Student'}
      </h2>

      <p className={cn(
        'mb-6 text-base font-medium',
        isLight ? 'text-slate-500' : 'text-slate-400'
      )}>
        {profile?.class || 'No Class Assigned'}
      </p>

      {topCareerTypeLabel && (
        <div className={cn(
          'mb-8 inline-flex items-center rounded-full px-6 py-2 text-sm font-bold tracking-wide shadow-sm',
          isLight 
            ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-700/10' 
            : 'bg-blue-500/10 text-blue-200 ring-1 ring-blue-500/20'
        )}>
          {topCareerTypeLabel}
        </div>
      )}

      <Link 
        to="/profile" 
        className={cn(
          'group inline-flex items-center gap-2 text-sm font-semibold transition-colors',
          isLight ? 'text-blue-600 hover:text-blue-700' : 'text-blue-400 hover:text-blue-300'
        )}
      >
        <IconEdit className="size-4 transition-transform group-hover:scale-110" />
        <span>Edit Profile</span>
      </Link>
    </div>
  )
}
