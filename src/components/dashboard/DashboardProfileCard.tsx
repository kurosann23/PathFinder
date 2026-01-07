import { useEffect, useMemo, useState } from 'react'
import { useProfile } from '../../context/ProfileContext'
import { useUserProgress } from '../../context/UserProgressContext'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { uploadAvatar, upsertStudentProfile, type ProfileRow, type StudentProfileRow } from '../../lib/profileRepo'
import { cn } from '../../lib/cn'
import { IconEdit, IconX } from '../icons'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'


type FormState = {
  full_name: string
  class: string
  email: string
  avatar_url: string
}

export function DashboardProfileCard() {
  const { profile, refresh } = useProfile()
  const { user } = useAuth()
  const { progress } = useUserProgress()
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const [isEditing, setIsEditing] = useState(false)

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

  const displayEmail = profile?.email || user?.email || '—'
  const displayClass = isStudentProfile(profile) ? (profile.class || 'No Class Assigned') : 'No Class Assigned'

  return (
    <div
      id="profile"
      className={cn(
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
          fallback={(profile?.full_name || user?.email || 'S').slice(0, 1).toUpperCase()}
          sizeClassName="size-32"
          className="text-3xl shadow-xl relative"
        />
      </div>

      <h2 className={cn(
        'mb-1 text-2xl font-bold tracking-tight',
        isLight ? 'text-slate-900' : 'text-slate-50'
      )}>
        {profile?.full_name || 'Student'}
      </h2>

      <p className={cn(
        'text-base font-medium',
        isLight ? 'text-slate-500' : 'text-slate-400'
      )}>
        {displayClass}
      </p>

      <p className={cn(
        'mt-1 mb-4 text-sm font-medium',
        isLight ? 'text-slate-500' : 'text-slate-500'
      )}>
        {displayEmail}
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

      <Button 
        type="button"
        variant="primary"
        className="inline-flex items-center gap-2"
        onClick={() => setIsEditing(true)}
      >
        <IconEdit className="size-4 transition-transform group-hover:scale-110" />
        <span>Edit Profile</span>
      </Button>

      <ProfileEditModal
        open={isEditing}
        onClose={() => setIsEditing(false)}
        initialProfile={profile}
        userId={user?.id ?? ''}
        userEmail={user?.email ?? ''}
        onSaved={refresh}
        riasecLabel={topCareerTypeLabel}
        studentClass={displayClass}
      />
    </div>
  )
}

function ProfileEditModal(props: {
  open: boolean
  onClose: () => void
  initialProfile: ProfileRow | null
  userId: string
  userEmail: string
  onSaved: () => Promise<void> | void
  riasecLabel: string | null
  studentClass: string
}) {
  const { open, onClose, initialProfile, userId, userEmail, onSaved, riasecLabel, studentClass } = props
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const [form, setForm] = useState<FormState>({
    full_name: initialProfile?.full_name ?? '',
    class: isStudentProfile(initialProfile) ? (initialProfile.class ?? '') : (studentClass ?? ''),
    email: initialProfile?.email ?? userEmail ?? '',
    avatar_url: initialProfile?.avatar_url ?? '',
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarRevision, setAvatarRevision] = useState(() => Date.now())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const avatarPreview = useMemo(() => {
    if (!avatarFile) return ''
    return URL.createObjectURL(avatarFile)
  }, [avatarFile])

  useEffect(() => {
    if (!open) return
    setForm({
      full_name: initialProfile?.full_name ?? '',
      class: isStudentProfile(initialProfile) ? (initialProfile.class ?? '') : (studentClass ?? ''),
      email: initialProfile?.email ?? userEmail ?? '',
      avatar_url: initialProfile?.avatar_url ?? '',
    })
    setAvatarFile(null)
    setAvatarRevision(Date.now())
    setError('')
  }, [open, initialProfile, userEmail, studentClass])

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    }
  }, [avatarPreview])

  if (!open) return null

  const handleSave = async () => {
    if (!userId) {
      setError('User not found. Please sign in again.')
      return
    }
    setSaving(true)
    setError('')
    try {
      let avatarUrl = form.avatar_url || initialProfile?.avatar_url || null
      if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile, userId)
      }

      const currentEmail = initialProfile?.email ?? userEmail ?? null
      const currentClass = isStudentProfile(initialProfile) ? (initialProfile.class ?? null) : (studentClass || null)

      await upsertStudentProfile({
        id: userId,
        full_name: form.full_name || null,
        class: currentClass,
        email: currentEmail,
        avatar_url: avatarUrl || null,
      })

      setAvatarFile(null)
      setAvatarRevision(Date.now())
      await onSaved()
      onClose()
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  const avatarSrc = avatarPreview || (form.avatar_url ? withCacheBust(form.avatar_url, avatarRevision) : undefined)

  return (
    <>
      {/* Backdrop (same pattern as Course Detail modal) */}
      <div
        className={cn('fixed inset-0 z-40 backdrop-blur-md', isLight ? 'bg-black/40' : 'bg-black/70')}
        onClick={onClose}
      />

      {/* Modal (same pattern as Course Detail modal) */}
      <div
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-[90%] max-w-[860px] -translate-x-1/2 -translate-y-1/2',
          'max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl',
          isLight ? 'border border-slate-200 bg-white' : 'border border-slate-800/70 bg-slate-950/95 backdrop-blur-xl',
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Edit Profile"
      >
        <div className="flex max-h-[85vh] flex-col">
          {/* Header */}
          <div className={cn('flex items-start justify-between gap-4 px-6 py-5', isLight ? 'border-b border-slate-200' : 'border-b border-slate-800/70')}>
            <div className="min-w-0">
              <h3 className={cn('text-2xl font-bold', isLight ? 'text-slate-900' : 'text-slate-50')}>Edit Profile</h3>
              <p className={cn('mt-2 text-base leading-relaxed', isLight ? 'text-slate-600' : 'text-slate-300')}>
                Update your name and photo. Class, email, and RIASEC stay read-only.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className={cn(
                'shrink-0 rounded-full p-2 transition',
                isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900' : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800/80 hover:text-slate-100',
              )}
              aria-label="Close"
            >
              <IconX size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {error && (
              <div
                className={cn(
                  'mb-5 rounded-2xl border px-4 py-3 text-base font-medium',
                  isLight ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-rose-500/40 bg-rose-500/10 text-rose-100',
                )}
              >
                {error}
              </div>
            )}

            <div className="space-y-7">
              {/* Avatar + upload */}
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
                <Avatar
                  src={avatarSrc}
                  alt="Profile avatar"
                  className="size-24 rounded-full border border-slate-200 bg-white"
                  fallback={(form.full_name || form.email || 'S').slice(0, 1).toUpperCase()}
                />
                <div className="min-w-0 flex-1 space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
                    disabled={saving}
                    className={cn(
                      'block w-full text-sm file:mr-3 file:rounded-xl file:border-0 file:px-5 file:py-3 file:text-sm file:font-semibold file:ring-1 disabled:opacity-60',
                      isLight
                        ? 'text-slate-700 file:bg-blue-600 file:text-white file:ring-blue-600/25 hover:file:bg-blue-700'
                        : 'text-slate-200 file:bg-blue-600/30 file:text-blue-50 file:ring-blue-500/40 hover:file:bg-blue-600/40',
                    )}
                  />
                  <p className={cn('text-sm', isLight ? 'text-slate-600' : 'text-slate-400')}>
                    JPG/PNG recommended. Max 2MB.
                  </p>
                </div>
              </div>

              {/* Editable */}
              <div className="space-y-3">
                <div className={cn('text-sm font-semibold', isLight ? 'text-slate-700' : 'text-slate-300')}>Full Name</div>
                <input
                  value={form.full_name}
                  onChange={(e) => setForm((prev) => ({ ...prev, full_name: e.target.value }))}
                  disabled={saving}
                  className={cn(
                    'w-full rounded-2xl border px-5 py-4 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60',
                    isLight ? 'border-slate-200 bg-white text-slate-900' : 'border-slate-700 bg-slate-900/50 text-slate-100',
                  )}
                  placeholder="Your full name"
                />
              </div>

              {/* Read-only */}
              <div className={cn('rounded-2xl border p-5', isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800/70 bg-slate-950/30')} data-testid="profile-readonly">
                <div className={cn('text-sm font-bold', isLight ? 'text-slate-800' : 'text-slate-200')}>Profile Details</div>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <ReadOnlyRow label="Class" value={studentClass} />
                  <ReadOnlyRow label="Email" value={form.email || userEmail} />
                  <ReadOnlyRow label="RIASEC" value={riasecLabel || '—'} />
                </div>
              </div>
            </div>
          </div>

          {/* Footer (sticky inside modal) */}
          <div className={cn('flex items-center justify-between gap-3 px-6 py-4', isLight ? 'border-t border-slate-200 bg-white' : 'border-t border-slate-800/70 bg-slate-950/70')}>
            <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="button" variant="primary" onClick={handleSave} disabled={saving || !userId}>
              {saving ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

function ReadOnlyRow(props: { label: string; value: string }) {
  const { label, value } = props
  return (
    <div className="flex flex-col rounded-xl border border-slate-800/10 bg-slate-50/60 px-4 py-3 text-left dark:border-slate-800/60 dark:bg-slate-900/40">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  )
}

function getErrorMessage(e: unknown) {
  if (e instanceof Error) return e.message
  if (typeof e === 'string') return e
  if (e && typeof e === 'object') {
    const maybe = e as { message?: unknown }
    if (typeof maybe.message === 'string') return maybe.message
  }
  return 'Something went wrong. Please try again.'
}

function withCacheBust(url: string, revision: number) {
  if (!url) return ''
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${revision}`
}

function isStudentProfile(p: ProfileRow | null): p is StudentProfileRow {
  return Boolean(p) && 'class' in (p as Record<string, unknown>)
}
