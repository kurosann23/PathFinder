import { useState, useRef, useEffect, useMemo } from 'react'
import { Avatar } from '../ui/Avatar'
import { cn } from '../../lib/cn'
import { useTheme } from '../../context/ThemeContext'
import { useProfile } from '../../context/ProfileContext'
import { useAuth } from '../../context/AuthContext'
import { useUserProgress } from '../../context/UserProgressContext'
import { uploadAvatar, upsertProfile } from '../../lib/profileRepo'
import { IconEdit, IconUser } from '../icons'
import { careerSnapshotMeta } from '../../constants/dashboard'

type ProfileAvatarDropdownProps = {
  size?: 'large' | 'small'
  className?: string
}

// Map RIASEC codes to personality labels (using same labels as dashboard)
function getPersonalityLabel(code: string | null | undefined): string {
  if (!code) return '—'
  const firstLetter = code.charAt(0).toUpperCase()
  // Map RIASEC code to careerSnapshotMeta key, then get label
  const codeToKeyMap: Record<string, string> = {
    R: 'realistic',
    I: 'investigative',
    A: 'artistic',
    S: 'social',
    E: 'enterprising',
    C: 'conventional',
  }
  const key = codeToKeyMap[firstLetter]
  if (!key) return '—'
  const meta = careerSnapshotMeta.find(m => m.key === key)
  return meta?.label || '—'
}

export function ProfileAvatarDropdown({ size = 'large', className }: ProfileAvatarDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showEditName, setShowEditName] = useState(false)
  const [newName, setNewName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarRevision, setAvatarRevision] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { profile, refresh } = useProfile()
  const { user } = useAuth()
  const { progress } = useUserProgress()
  const { theme } = useTheme()
  const isLight = theme === 'light'

  // Get personality label from RIASEC result
  const personalityLabel = useMemo(() => {
    if (progress.psychometricCompleted && progress.psychometricResult) {
      return getPersonalityLabel(progress.psychometricResult)
    }
    // Fallback: calculate from percentages if result code not available
    if (progress.psychometricCompleted && progress.riasecPercentages) {
      const sorted = Object.entries(progress.riasecPercentages)
        .sort(([, a], [, b]) => (b || 0) - (a || 0))
      if (sorted.length > 0 && sorted[0][1] > 0) {
        return getPersonalityLabel(sorted[0][0])
      }
    }
    return '—'
  }, [progress.psychometricCompleted, progress.psychometricResult, progress.riasecPercentages])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Initialize name when opening edit modal
  useEffect(() => {
    if (showEditName) {
      setNewName(profile?.full_name || '')
    }
  }, [showEditName, profile?.full_name])

  const handleEditName = () => {
    setShowEditName(true)
    setIsOpen(false)
  }

  const handleEditPicture = () => {
    fileInputRef.current?.click()
    setIsOpen(false)
  }

  const handleSaveName = async () => {
    if (!user?.id || !newName.trim()) return
    
    setIsSaving(true)
    try {
      await upsertProfile({
        id: user.id,
        full_name: newName.trim(),
        email: profile?.email || user.email || '',
        avatar_url: profile?.avatar_url || null,
        class: (profile as any)?.class || null,
      })
      await refresh()
      setShowEditName(false)
    } catch (error) {
      console.error('Failed to update name:', error)
      alert('Failed to update name. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.id) return

    // Show preview immediately
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    setIsSaving(true)
    try {
      const avatarUrl = await uploadAvatar(file, user.id)
      await upsertProfile({
        id: user.id,
        full_name: profile?.full_name || '',
        email: profile?.email || user.email || '',
        avatar_url: avatarUrl,
        class: (profile as any)?.class || null,
      })
      setAvatarRevision((prev) => prev + 1)
      await refresh()
      setAvatarPreview(null)
    } catch (error) {
      console.error('Failed to upload avatar:', error)
      alert('Failed to upload avatar. Please try again.')
      setAvatarPreview(null)
    } finally {
      setIsSaving(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const avatarUrl = avatarPreview || (profile?.avatar_url ? `${profile.avatar_url}?v=${avatarRevision}` : null)
  const fallback = (profile?.full_name?.slice(0, 1) ?? user?.email?.slice(0, 1) ?? 'U').toUpperCase()
  // Vertical layout: medium avatar size for vertical card
  const avatarSize = size === 'large' ? 'size-20' : 'size-12' // ~80px for large, ~48px for small
  const studentProfile = profile as any
  const studentClass = studentProfile?.class || null

  return (
    <>
      <div className={cn('relative flex flex-col items-center w-full', className)} ref={dropdownRef}>
        {/* Avatar - Top */}
        <Avatar
          src={avatarUrl}
          alt="Profile avatar"
          fallback={fallback}
          sizeClassName={avatarSize}
          className="rounded-2xl"
          loading="eager"
        />

        {/* User Name */}
        <div className={cn(
          'mt-3 text-center',
          isLight ? 'text-slate-900' : 'text-slate-50'
        )}>
          <div className={cn(
            'text-base font-semibold',
            isLight ? 'text-slate-900' : 'text-slate-50'
          )}>
            {profile?.full_name ?? 'Student'}
          </div>

          {/* Class */}
          {studentClass && (
            <div className={cn(
              'mt-1 text-xs',
              isLight ? 'text-slate-500' : 'text-slate-400'
            )}>
              {studentClass}
            </div>
          )}
        </div>

        {/* Personality Badge */}
        <div className="mt-2.5">
          <span className={cn(
            'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
            isLight 
              ? 'bg-blue-100 text-blue-800 border border-blue-200/60' 
              : 'text-slate-300/80'
          )}>
            {personalityLabel}
          </span>
        </div>

        {/* Edit Profile Link */}
        <div className="relative mt-2.5">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              'flex items-center gap-1 text-xs font-semibold transition cursor-pointer',
              isLight
                ? 'text-blue-600 hover:text-blue-700 hover:underline'
                : 'text-blue-400 hover:text-blue-300 hover:underline'
            )}
          >
            <IconEdit size={12} />
            Edit Profile
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className={cn(
              'absolute top-full left-1/2 -translate-x-1/2 mt-1 z-50 min-w-[180px] rounded-xl border shadow-lg',
              isLight
                ? 'bg-white border-slate-200 shadow-md'
                : 'bg-slate-900 border-slate-700 shadow-xl'
            )}>
            <div className="p-1">
              <button
                type="button"
                onClick={handleEditName}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition',
                  isLight
                    ? 'text-slate-700 hover:bg-slate-100'
                    : 'text-slate-200 hover:bg-slate-800'
                )}
              >
                <IconEdit size={16} />
                Edit Name
              </button>
              <button
                type="button"
                onClick={handleEditPicture}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition',
                  isLight
                    ? 'text-slate-700 hover:bg-slate-100'
                    : 'text-slate-200 hover:bg-slate-800'
                )}
              >
                <IconUser size={16} />
                Edit Profile Picture
              </button>
            </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={isSaving}
      />

      {/* Edit Name Modal */}
      {showEditName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className={cn(
            'relative rounded-2xl border p-6 w-full max-w-md mx-4',
            isLight
              ? 'bg-white border-slate-200 shadow-xl'
              : 'bg-slate-900 border-slate-700 shadow-2xl'
          )}>
            <h3 className={cn(
              'text-lg font-semibold mb-4',
              isLight ? 'text-slate-900' : 'text-slate-100'
            )}>
              Edit Name
            </h3>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter your name"
              disabled={isSaving}
              className={cn(
                'w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60',
                isLight
                  ? 'border-slate-200 bg-white text-slate-900'
                  : 'border-slate-700 bg-slate-800 text-slate-100'
              )}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isSaving && newName.trim()) {
                  handleSaveName()
                }
                if (e.key === 'Escape') {
                  setShowEditName(false)
                }
              }}
              autoFocus
            />
            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setShowEditName(false)}
                disabled={isSaving}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-60',
                  isLight
                    ? 'text-slate-700 hover:bg-slate-100'
                    : 'text-slate-300 hover:bg-slate-800'
                )}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveName}
                disabled={isSaving || !newName.trim()}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-semibold text-white transition disabled:opacity-60',
                  'bg-blue-500 hover:bg-blue-600'
                )}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
