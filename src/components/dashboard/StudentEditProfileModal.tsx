import { useEffect, useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'
import { uploadAvatar, upsertStudentProfile, type ProfileRow, type StudentProfileRow } from '../../lib/profileRepo'
import { cn } from '../../lib/cn'
import { IconX, IconUpload, IconUser, IconBook, IconMail, IconEdit } from '../icons'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'

type FormState = {
  full_name: string
  class: string
  email: string
  avatar_url: string
}

type StudentEditProfileModalProps = {
  open: boolean
  onClose: () => void
  initialProfile: ProfileRow | null
  userId: string
  userEmail: string
  onSaved: () => Promise<void> | void
  riasecLabel: string | null
  studentClass: string
}

export function StudentEditProfileModal(props: StudentEditProfileModalProps) {
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
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  
  const controls = useDragControls()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const avatarPreview = useMemo(() => {
    if (!avatarFile) return ''
    return URL.createObjectURL(avatarFile)
  }, [avatarFile])

  useEffect(() => {
    if (open) {
      setForm({
        full_name: initialProfile?.full_name ?? '',
        class: isStudentProfile(initialProfile) ? (initialProfile.class ?? '') : (studentClass ?? ''),
        email: initialProfile?.email ?? userEmail ?? '',
        avatar_url: initialProfile?.avatar_url ?? '',
      })
      setAvatarFile(null)
      setError('')
    }
  }, [open])

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    }
  }, [avatarPreview])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      setAvatarFile(null)
      return
    }

    // Client-side validation
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPG, PNG, GIF, WEBP).')
      setAvatarFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB.')
      setAvatarFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setError('')
    setAvatarFile(file)
  }

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
      await onSaved()
      onClose()
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  const avatarSrc = avatarPreview || form.avatar_url || undefined

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={cn('fixed inset-0 z-40 backdrop-blur-sm', isLight ? 'bg-black/30' : 'bg-black/60')}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: '-50%', x: '-50%' }}
            animate={{ opacity: 1, scale: 1, y: '-50%', x: '-50%' }}
            exit={{ opacity: 0, scale: 0.95, y: '-50%', x: '-50%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            drag
            dragListener={false}
            dragControls={controls}
            dragMomentum={false}
            dragElastic={0.05}
            className={cn(
              'fixed left-1/2 top-1/2 z-50 w-[90%] md:w-[75%] lg:w-[60%] max-w-[800px]',
              'max-h-[90vh] flex flex-col overflow-hidden rounded-2xl shadow-2xl',
              isLight ? 'border border-slate-200 bg-white' : 'border border-slate-800 bg-slate-950'
            )}
            style={{ resize: 'both', minWidth: '320px', minHeight: '400px' }} // CSS Resize
          >
            {/* Header (Draggable) */}
            <div 
              onPointerDown={(e) => controls.start(e)}
              className={cn(
                'flex cursor-grab active:cursor-grabbing items-center justify-between px-6 py-4 select-none',
                isLight ? 'border-b border-slate-100 bg-slate-50/50' : 'border-b border-slate-800 bg-slate-900/30'
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn('flex h-8 w-8 items-center justify-center rounded-full', isLight ? 'bg-blue-100 text-blue-600' : 'bg-blue-500/20 text-blue-400')}>
                   <IconEdit size={16} />
                </div>
                <div>
                  <h3 className={cn('text-lg font-bold', isLight ? 'text-slate-900' : 'text-slate-100')}>Edit Profile</h3>
                </div>
              </div>
              <button
                onClick={onClose}
                className={cn(
                  'rounded-full p-2 transition hover:scale-105',
                  isLight ? 'text-slate-400 hover:bg-slate-100 hover:text-slate-600' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                )}
              >
                <IconX size={20} />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
              
              {error && (
                <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">
                  {error}
                </div>
              )}

              {/* Top Section: Avatar & Name */}
              <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                {/* Avatar */}
                <div className="relative group shrink-0">
                  <Avatar
                    src={avatarSrc}
                    alt="Profile"
                    className="size-24 md:size-28 rounded-2xl shadow-lg ring-4 ring-white dark:ring-slate-800"
                    fallback={(form.full_name || 'S').slice(0, 1).toUpperCase()}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={saving}
                    className={cn(
                      'absolute -bottom-2 -right-2 flex size-9 items-center justify-center rounded-full shadow-md transition hover:scale-110',
                      isLight ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600',
                      saving && 'opacity-50 cursor-not-allowed'
                    )}
                    title="Upload new photo"
                  >
                    <IconUpload size={16} />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {/* Full Name Input */}
                <div className="w-full">
                   <label className={cn('mb-2 block text-sm font-semibold uppercase tracking-wider', isLight ? 'text-slate-500' : 'text-slate-400')}>
                      Full Name
                   </label>
                   <div className="relative">
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <IconUser size={18} />
                    </div>
                    <input
                      value={form.full_name}
                      onChange={(e) => setForm((prev) => ({ ...prev, full_name: e.target.value }))}
                      className={cn(
                        'w-full rounded-xl border pl-10 pr-4 py-3 text-base font-medium focus:outline-none focus:ring-2',
                        isLight 
                          ? 'border-slate-200 bg-slate-50 text-slate-900 focus:border-blue-500 focus:ring-blue-500/20' 
                          : 'border-slate-800 bg-slate-900/50 text-slate-100 focus:border-blue-500/50 focus:ring-blue-500/20'
                      )}
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className={cn('h-px w-full my-6', isLight ? 'bg-slate-100' : 'bg-slate-800')} />

              {/* Read-Only Details Section */}
              <div className="space-y-4">
                <h4 className={cn('text-sm font-bold uppercase tracking-wider', isLight ? 'text-slate-900' : 'text-slate-100')}>
                  Profile Details (Read-only)
                </h4>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                   {/* Class */}
                   <div className="space-y-1.5">
                      <label className={cn('text-xs font-semibold uppercase tracking-wide', isLight ? 'text-slate-400' : 'text-slate-500')}>
                        Class
                      </label>
                      <div className={cn(
                        'flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium opacity-100 cursor-not-allowed',
                        isLight ? 'border-slate-200 bg-slate-50 text-slate-600' : 'border-slate-800 bg-slate-900/50 text-slate-400'
                      )}>
                        <IconBook size={14} />
                        <span className="truncate">{studentClass || 'Not assigned'}</span>
                      </div>
                   </div>

                   {/* RIASEC */}
                   <div className="space-y-1.5">
                      <label className={cn('text-xs font-semibold uppercase tracking-wide', isLight ? 'text-slate-400' : 'text-slate-500')}>
                        RIASEC
                      </label>
                      <div className={cn(
                        'flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium opacity-100 cursor-not-allowed',
                        isLight ? 'border-slate-200 bg-slate-50 text-slate-600' : 'border-slate-800 bg-slate-900/50 text-slate-400'
                      )}>
                         <span className="font-bold text-blue-500 text-xs">#</span>
                        <span className="truncate">{riasecLabel || 'Not assessed'}</span>
                      </div>
                   </div>

                   {/* Email */}
                   <div className="space-y-1.5 sm:col-span-2">
                      <label className={cn('text-xs font-semibold uppercase tracking-wide', isLight ? 'text-slate-400' : 'text-slate-500')}>
                        Email
                      </label>
                      <div className={cn(
                        'flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium opacity-100 cursor-not-allowed',
                        isLight ? 'border-slate-200 bg-slate-50 text-slate-600' : 'border-slate-800 bg-slate-900/50 text-slate-400'
                      )}>
                        <IconMail size={14} />
                        <span className="truncate">{form.email}</span>
                      </div>
                   </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className={cn(
              'flex items-center justify-between gap-3 border-t px-6 py-4',
              isLight ? 'border-slate-100 bg-slate-50/50' : 'border-slate-800 bg-slate-900/30'
            )}>
               <Button variant="secondary" onClick={onClose} disabled={saving} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave} disabled={saving} className="w-full sm:w-auto min-w-[100px]">
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
            
            {/* Custom Resize Handle (Visual only, CSS handles resize logic) */}
            <div className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize bg-transparent" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
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

function isStudentProfile(p: ProfileRow | null): p is StudentProfileRow {
  return Boolean(p) && 'class' in (p as Record<string, unknown>)
}
