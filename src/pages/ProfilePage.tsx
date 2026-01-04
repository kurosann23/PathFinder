import { useEffect, useMemo, useRef, useState } from 'react'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/PageHeader'
import { isSupabaseConfigured } from '../lib/supabaseClient'
import { uploadAvatar, upsertProfile, type ProfileRow, type StudentProfileRow, type TeacherProfileRow } from '../lib/profileRepo'
import { cn } from '../lib/cn'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../context/ProfileContext'
import { useUserProgress } from '../context/UserProgressContext'
import { useRole } from '../context/RoleContext'
import { Button } from '../components/ui/Button'
import { IconBell, IconChevronDown, IconX, IconEdit, IconUser, IconMail, IconPhone } from '../components/icons'
import { Avatar } from '../components/ui/Avatar'

type FormState = {
  full_name: string
  class: string
  email: string
  avatar_url: string
  phone?: string
}

type Skill = {
  id: string
  label: string
  value: number
  icon:
    | 'ts'
    | 'react'
    | 'sql'
    | 'git'
    | 'html'
    | 'css'
    | 'js'
    | 'video'
    | 'figma'
    | 'python'
}

function safeParseStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v
    .filter((x) => typeof x === 'string')
    .map((s) => s.trim())
    .filter(Boolean)
}

function clamp100(n: number) {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(100, n))
}

function safeParseSkills(v: unknown): Skill[] {
  if (!Array.isArray(v)) return []
  const out: Skill[] = []
  const allowed = new Set<Skill['icon']>([
    'ts',
    'react',
    'sql',
    'git',
    'html',
    'css',
    'js',
    'video',
    'figma',
    'python',
  ])
  for (const it of v) {
    if (!it || typeof it !== 'object') continue
    const obj = it as any
    const id = typeof obj.id === 'string' ? obj.id : cryptoId()
    const label = typeof obj.label === 'string' ? obj.label : 'Skill'
    const value = clamp100(typeof obj.value === 'number' ? obj.value : Number(obj.value))
    const icon = (obj.icon as Skill['icon']) ?? 'ts'
    if (!allowed.has(icon)) continue
    out.push({ id, label, value, icon })
  }
  return out
}

function cryptoId() {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? (crypto as any).randomUUID()
    : `id_${Math.random().toString(16).slice(2)}`
}

// Type guard to check if profile is a student profile
function isStudentProfile(p: ProfileRow | null): p is StudentProfileRow {
  return p !== null && 'class' in p
}

// Type guard to check if profile is a teacher profile
function isTeacherProfile(p: ProfileRow | null): p is TeacherProfileRow {
  return p !== null && 'phone' in p && !('class' in p)
}

function toForm(p: ProfileRow | null): FormState {
  if (!p) {
    return {
      full_name: '',
      class: '',
      email: '',
      avatar_url: '',
      phone: '',
    }
  }
  
  if (isStudentProfile(p)) {
    return {
      full_name: p.full_name ?? '',
      class: p.class ?? '',
      email: p.email ?? '',
      avatar_url: p.avatar_url ?? '',
      phone: '',
    }
  } else {
    return {
      full_name: p.full_name ?? '',
      class: '',
      email: p.email ?? '',
      avatar_url: p.avatar_url ?? '',
      phone: p.phone ?? '',
    }
  }
}

function getErrorMessage(e: unknown) {
  if (e instanceof Error) return e.message
  if (typeof e === 'string') return e
  if (e && typeof e === 'object' && 'message' in e && typeof (e as any).message === 'string') {
    return (e as any).message
  }
  try {
    return JSON.stringify(e)
  } catch {
    return 'Unknown error'
  }
}

function TeacherProfileView(props: {
  profile: ProfileRow | null
  form: FormState
  setForm: (f: FormState | ((prev: FormState) => FormState)) => void
  user: { email?: string | null } | null
  saving: boolean
  error: string
  success: string
  showSkeleton: boolean
  avatarPreviewUrl: string
  avatarRevision: number
  avatarFile: File | null
  setAvatarFile: (f: File | null) => void
  setIsDirty: (d: boolean) => void
  handleSave: () => Promise<void>
  profileId: string
  isSupabaseConfigured: boolean
}) {
  const {
    profile,
    form,
    setForm,
    user,
    saving,
    error,
    success,
    showSkeleton,
    avatarPreviewUrl,
    avatarRevision,
    avatarFile,
    setAvatarFile,
    setIsDirty,
    handleSave,
    profileId,
    isSupabaseConfigured,
  } = props

  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const teacherName = profile?.full_name || user?.email?.split('@')[0] || 'Teacher'
  const teacherEmail = user?.email || profile?.email || ''
  const teacherPhone = form.phone || '+60 12 345 6789' // Default placeholder

  return (
    <div className="space-y-6 pb-24">
      {/* Page Header */}
      <PageHeader
        title="TEACHER PROFILE"
        subtitle="Manage your profile information and account settings."
      />

      {/* Error/Success Messages */}
      {error && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-200">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-100">
          {success}
        </div>
      )}

      {/* Primary Profile Summary Card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800/70 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-slate-950/50 p-8 backdrop-blur-xl">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-6 items-center">
          {/* Avatar Section */}
          <div className="relative">
            <Avatar
              src={avatarPreviewUrl || withCacheBust(form.avatar_url, avatarRevision)}
              alt="Profile avatar"
              fallback={(form.full_name || user?.email || 'T').slice(0, 1).toUpperCase()}
              sizeClassName="size-32"
              className="rounded-full border-4 border-slate-700/50 shadow-[0_0_30px_rgba(59,130,246,0.20)]"
              loading="eager"
            />
            {/* Info Badge */}
            <div className="absolute bottom-0 right-0 grid size-8 place-items-center rounded-full bg-blue-600 border-2 border-slate-950">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Name and Contact Info */}
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-100">{teacherName}</h1>
              <p className="mt-1 text-lg text-slate-400">Teacher</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-slate-300">
                <IconMail size={18} className="text-slate-400" />
                <span className="text-sm">{teacherEmail}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <IconPhone size={18} className="text-slate-400" />
                <span className="text-sm">{teacherPhone}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="primary"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2"
              >
                <IconEdit size={16} />
                Edit Profile
              </Button>
              <input
                type="file"
                accept="image/*"
                disabled={saving}
                onChange={(e) => {
                  setAvatarFile(e.target.files?.[0] ?? null)
                  setIsDirty(true)
                }}
                className="hidden"
                id="avatar-upload"
              />
              <label htmlFor="avatar-upload">
                <Button
                  type="button"
                  variant="secondary"
                  as="span"
                  className="cursor-pointer"
                >
                  Change Photo
                </Button>
              </label>
            </div>
          </div>

          {/* Mini Profile Widget (Top Right) */}
          <div className="hidden lg:block">
            <Card className="w-64">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={avatarPreviewUrl || withCacheBust(form.avatar_url, avatarRevision)}
                    alt="Profile avatar"
                    fallback={(form.full_name || user?.email || 'T').slice(0, 1).toUpperCase()}
                    sizeClassName="size-12"
                    className="rounded-full"
                    loading="eager"
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-100 truncate">{teacherName}</div>
                    <div className="text-xs text-slate-400">Teacher</div>
                  </div>
                </div>
                <div className="space-y-1 text-xs text-slate-400">
                  <div className="truncate">{teacherEmail}</div>
                  <div>{teacherPhone}</div>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="w-full"
                >
                  Edit Profile
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Profile Details Section */}
      <Card title="Profile Details">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <IconUser size={18} className="text-slate-400" />
                <div>
                  <div className="text-xs font-semibold text-slate-400">Full Name</div>
                  <div className="mt-1 text-sm text-slate-200">{form.full_name || teacherName}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <IconMail size={18} className="text-slate-400" />
                <div>
                  <div className="text-xs font-semibold text-slate-400">Email</div>
                  <div className="mt-1 text-sm text-slate-200">{teacherEmail}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <IconPhone size={18} className="text-slate-400" />
                <div>
                  <div className="text-xs font-semibold text-slate-400">Phone</div>
                  <div className="mt-1 text-sm text-slate-200">{teacherPhone}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-[18px] h-[18px] text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <div>
                  <div className="text-xs font-semibold text-slate-400">Role</div>
                  <div className="mt-1 text-sm text-slate-200">Teacher</div>
                </div>
              </div>
            </div>
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition"
              >
                Edit
              </button>
            )}
          </div>

          {isEditing && (
            <div className="mt-6 space-y-4 rounded-2xl border border-slate-800/70 bg-slate-950/40 p-6">
              <label className="block">
                <div className="text-xs font-semibold text-slate-400 mb-2">Full Name</div>
                <input
                  value={form.full_name}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, full_name: e.target.value }))
                    setIsDirty(true)
                  }}
                  disabled={saving || showSkeleton}
                  className="w-full rounded-2xl border border-slate-800/70 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                  placeholder="Your full name"
                />
              </label>
              <label className="block">
                <div className="text-xs font-semibold text-slate-400 mb-2">Phone Number</div>
                <input
                  value={form.phone || ''}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, phone: e.target.value }))
                    setIsDirty(true)
                  }}
                  disabled={saving || showSkeleton}
                  className="w-full rounded-2xl border border-slate-800/70 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                  placeholder="+60 12 345 6789"
                />
              </label>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="primary"
                  onClick={async () => {
                    await handleSave()
                    setIsEditing(false)
                  }}
                  disabled={saving || !isSupabaseConfigured || !profileId}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Manage Password Section */}
      <Card>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-100">Manage Password</h3>
            <p className="mt-1 text-sm text-slate-400">Change your account password</p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Button
                type="button"
                variant="primary"
                onClick={() => setShowPasswordModal(true)}
              >
                Change Password
              </Button>
            </div>
            <div className="hidden lg:block">
              {/* Security Illustration */}
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                    <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Password Change Modal (simplified - would need proper implementation) */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
          <Card className="w-full max-w-md">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-100">Change Password</h3>
              <p className="text-sm text-slate-400">This feature will be implemented with Supabase Auth.</p>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowPasswordModal(false)}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export function ProfilePage() {
  const { user } = useAuth()
  const { profile, loading: profileLoading, refresh } = useProfile()
  const { progress } = useUserProgress()
  const { role, isTeacher } = useRole()
  const profileId = useMemo(() => user?.id ?? '', [user?.id])
  const showSkeleton = profileLoading && !profile

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [isDirty, setIsDirty] = useState(false)
  const [aboutMe, setAboutMe] = useState<string>(() => 
    isStudentProfile(profile) ? (profile.about_me ?? '') : ''
  )
  const [interestTags, setInterestTags] = useState<string[]>(() => 
    safeParseStringArray(isStudentProfile(profile) ? profile.interests : null)
  )
  const [newTag, setNewTag] = useState('')
  const [hobbyTags, setHobbyTags] = useState<string[]>(() => 
    safeParseStringArray(isStudentProfile(profile) ? profile.hobbies : null)
  )
  const [isHobbyPickerOpen, setIsHobbyPickerOpen] = useState(false)
  const [isSkillPickerOpen, setIsSkillPickerOpen] = useState(false)
  const [avatarRevision, setAvatarRevision] = useState<number>(() => Date.now())

  const [form, setForm] = useState<FormState>(() => toForm(profile ?? null))
  const [skillsState, setSkillsState] = useState<Skill[]>(() => {
    const parsed = safeParseSkills(isStudentProfile(profile) ? profile.skills : null)
    return parsed.length > 0 ? parsed : defaultSkills()
  })

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const avatarPreviewUrl = useMemo(() => {
    if (!avatarFile) return ''
    return URL.createObjectURL(avatarFile)
  }, [avatarFile])

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl)
    }
  }, [avatarPreviewUrl])

  // Initialize local editable state from ProfileContext once (prevents "pop-in"),
  // but never overwrite while the user is typing (fixes "can't delete text" issues).
  const initializedForUserRef = useRef<string>('')
  useEffect(() => {
    if (!isSupabaseConfigured || !profileId) return

    // Reset initialization when user changes.
    if (initializedForUserRef.current && initializedForUserRef.current !== profileId) {
      initializedForUserRef.current = ''
    }

    // Prefill email early (helps reduce empty-feel even before profile loads).
    if (user?.email) {
      setForm((prev) => ({ ...prev, email: prev.email || user.email || '' }))
    }

    if (!profile) return
    if (saving) return
    if (initializedForUserRef.current === profileId) return

    initializedForUserRef.current = profileId
    setForm(toForm(profile))
    if (isStudentProfile(profile)) {
      setAboutMe(profile.about_me ?? '')
      setInterestTags(safeParseStringArray(profile.interests))
      setHobbyTags(safeParseStringArray(profile.hobbies))
      const parsed = safeParseSkills(profile.skills)
      setSkillsState(parsed.length > 0 ? parsed : defaultSkills())
    } else {
      setAboutMe('')
      setInterestTags([])
      setHobbyTags([])
      setSkillsState(defaultSkills())
    }
    setIsHobbyPickerOpen(false)
    setIsSkillPickerOpen(false)
    setAvatarRevision(Date.now())
    // Do not touch isDirty here.
  }, [profile, profileId, saving, user?.email])

  const stateRef = useRef({
    form,
    aboutMe,
    interestTags,
    hobbyTags,
    skillsState,
    profileId,
    userEmail: user?.email ?? '',
  })
  useEffect(() => {
    stateRef.current = {
      form,
      aboutMe,
      interestTags,
      hobbyTags,
      skillsState,
      profileId,
      userEmail: user?.email ?? '',
    }
  }, [aboutMe, form, hobbyTags, interestTags, profileId, skillsState, user?.email])

  const isDirtyRef = useRef(isDirty)
  useEffect(() => {
    isDirtyRef.current = isDirty
  }, [isDirty])

  async function saveDraft(opts?: { silent?: boolean }) {
    const { silent = true } = opts ?? {}
    if (!isSupabaseConfigured) return
    const snap = stateRef.current
    if (!snap.profileId) return

    // Draft save: no avatar upload. This is mainly to persist skills/tags/bio while editing.
    await upsertProfile({
      id: snap.profileId,
      full_name: snap.form.full_name || null,
      class: snap.form.class || null,
      email: (snap.userEmail ?? snap.form.email) || null,
      avatar_url: snap.form.avatar_url || null,
      about_me: snap.aboutMe || null,
      interests: snap.interestTags,
      hobbies: snap.hobbyTags,
      skills: snap.skillsState.map((s) => ({
        id: s.id,
        label: s.label,
        value: clamp100(s.value),
        icon: s.icon,
      })),
    })

    if (!silent) setSuccess('Saved.')
    setIsDirty(false)
  }

  // Auto-save skills (and related profile edits) so refresh/logout won't lose changes.
  useEffect(() => {
    if (!isSupabaseConfigured) return
    if (!profileId) return
    if (!isDirty) return
    if (saving) return
    if (showSkeleton) return

    const t = window.setTimeout(() => {
      void saveDraft({ silent: true }).catch(() => {
        // keep UI calm; user can still hit Save Changes
      })
    }, 1200)

    return () => window.clearTimeout(t)
    // Intentionally watch skillsState + isDirty; other fields are included in the draft snapshot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skillsState, isDirty, profileId, saving, showSkeleton])

  // Try to flush drafts when leaving the page (logout, refresh, navigate away).
  useEffect(() => {
    function onPageHide() {
      if (!isDirtyRef.current) return
      void saveDraft({ silent: true }).catch(() => {})
    }

    window.addEventListener('pagehide', onPageHide)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') onPageHide()
    })
    return () => {
      window.removeEventListener('pagehide', onPageHide)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSave() {
    setError('')
    setSuccess('')
    if (!isSupabaseConfigured) {
      setError('Supabase is not configured yet. Add env vars and restart the dev server.')
      return
    }

    setSaving(true)
    try {
      let avatarUrl = form.avatar_url
      if (avatarFile) {
        const uploaded = await uploadAvatar(avatarFile, profileId)
        // Store a versioned URL so the whole app refreshes the image (browser cache-safe).
        avatarUrl = withCacheBust(uploaded, Date.now())
      }

      await upsertProfile({
        id: profileId,
        full_name: form.full_name || null,
        class: form.class || null,
        email: (user?.email ?? form.email) || null,
        avatar_url: avatarUrl || null,
        about_me: aboutMe || null,
        interests: interestTags,
        hobbies: hobbyTags,
        skills: skillsState.map((s) => ({
          id: s.id,
          label: s.label,
          value: clamp100(s.value),
          icon: s.icon,
        })),
        phone: form.phone || null,
        role: role, // Pass role to upsertProfile
      })

      setForm((prev) => ({ ...prev, avatar_url: avatarUrl }))
      // Force image refresh even if the public URL path stays the same (browser cache).
      setAvatarRevision(Date.now())
      setAvatarFile(null)
      setIsDirty(false)
      setSuccess('Profile saved.')
      await refresh()
    } catch (e) {
      setError(getErrorMessage(e) || 'Failed to save profile.')
    } finally {
      setSaving(false)
    }
  }

  const suggestedHobbies = useMemo(
    () => [
      'Coding',
      'Gaming',
      'Reading',
      'Sports',
      'Music',
      'Drawing',
      'Photography',
      'Video Editing',
      'UI Design',
      'Robotics',
      'Volunteering',
      'Public Speaking',
      'Chess',
      'Running',
      'Cycling',
      'Badminton',
      'Cooking',
      'Travel',
      'Blogging',
      'Content Creation',
    ],
    [],
  )

  const suggestedSkills = useMemo(
    () =>
      [
        { label: 'HTML', icon: 'html', value: 60 },
        { label: 'CSS', icon: 'css', value: 55 },
        { label: 'JavaScript', icon: 'js', value: 55 },
        { label: 'TypeScript', icon: 'ts', value: 50 },
        { label: 'React', icon: 'react', value: 50 },
        { label: 'SQL', icon: 'sql', value: 45 },
        { label: 'Git', icon: 'git', value: 45 },
        { label: 'Python', icon: 'python', value: 40 },
        { label: 'Figma', icon: 'figma', value: 35 },
        { label: 'Video Editing', icon: 'video', value: 35 },
      ] as const,
    [],
  )

  // Teacher Profile UI
  if (isTeacher) {
    return <TeacherProfileView 
      profile={profile}
      form={form}
      setForm={setForm}
      user={user}
      saving={saving}
      error={error}
      success={success}
      showSkeleton={showSkeleton}
      avatarPreviewUrl={avatarPreviewUrl}
      avatarRevision={avatarRevision}
      avatarFile={avatarFile}
      setAvatarFile={setAvatarFile}
      setIsDirty={setIsDirty}
      handleSave={handleSave}
      profileId={profileId}
      isSupabaseConfigured={isSupabaseConfigured}
    />
  }

  // Student Profile UI (existing)
  return (
    <div className="space-y-6 pb-24">
      <PageHeader
        title="Profile"
        subtitle="Update your details and profile photo."
        right={
          <div className="flex items-center gap-2">
            <Button type="button" variant="icon" aria-label="Search (UI only)">
              <SearchIcon />
            </Button>
            <Button type="button" variant="icon" aria-label="Messages (UI only)">
              <MailIcon />
            </Button>
            <Button type="button" variant="icon" aria-label="Notifications (UI only)">
              <IconBell size={18} />
            </Button>
          </div>
        }
      />

      {!isSupabaseConfigured && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-5 py-4 text-sm text-amber-100">
          Supabase is not configured yet. Add your env vars in <span className="font-mono">.env.local</span> and restart the dev server.
        </div>
      )}

      {(success || error) && (
        <div className="grid grid-cols-1 gap-3">
          {success && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-100">
              {success}
            </div>
          )}
          {error && (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-100">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Layout: Two columns - Left (Photo, About, Achievements) and Right (Info, Skills, RIASEC) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* LEFT COLUMN */}
        <div className="space-y-4">
          {/* PROFILE PHOTO */}
          <Card title="PROFILE PHOTO">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Avatar
                  src={avatarPreviewUrl || withCacheBust(form.avatar_url, avatarRevision)}
                  alt="Profile avatar"
                  fallback={(form.full_name || user?.email || 'U').slice(0, 1).toUpperCase()}
                  sizeClassName="size-24"
                  className={cn('rounded-full border-2 border-slate-700/50', showSkeleton && 'opacity-80')}
                  loading="eager"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-slate-100">Upload photo</div>
                  <div className="mt-1 text-xs text-slate-400">
                    JPG/PNG recommended.
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="fit-photo"
                      className="h-4 w-4 rounded border-slate-700/50 bg-slate-950/40 text-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                    <label htmlFor="fit-photo" className="text-xs text-slate-300">
                      Fit the chosen
                    </label>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={saving}
                    onChange={(e) => {
                      setAvatarFile(e.target.files?.[0] ?? null)
                      setIsDirty(true)
                    }}
                    className="mt-3 block w-full text-xs text-slate-300 file:mr-3 file:rounded-xl file:border-0 file:bg-blue-600/20 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-blue-100 file:ring-1 file:ring-blue-500/25 hover:file:bg-blue-600/25 disabled:opacity-60"
                  />
                </div>
              </div>
              <div className="text-xs text-slate-500">
                Tip: Select and click <span className="font-semibold text-slate-300">Save Changes</span> (bottom-right).
              </div>
            </div>
          </Card>

          {/* ABOUT ME */}
          <Card title="ABOUT ME">
            <div className="space-y-4">
              <textarea
                value={aboutMe}
                onChange={(e) => {
                  setAboutMe(e.target.value)
                  setIsDirty(true)
                }}
                rows={4}
                placeholder="Helo"
                disabled={saving || showSkeleton}
                className="w-full resize-none rounded-2xl border border-slate-800/70 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
              />

              <div className="space-y-3">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-300/70">
                  TAGS
                </div>
                <div className="flex flex-wrap gap-2">
                  {interestTags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-800/60 bg-slate-950/18 px-3 py-1.5 text-xs font-semibold text-slate-200"
                    >
                      {t}
                      <IconChevronDown size={12} className="text-slate-400" />
                      <button
                        type="button"
                        onClick={() => {
                          setInterestTags((prev) => prev.filter((x) => x !== t))
                          setIsDirty(true)
                        }}
                        className="grid size-4 place-items-center rounded-full text-[10px] text-slate-400 hover:text-slate-200"
                        aria-label={`Remove tag ${t}`}
                        disabled={saving || showSkeleton}
                      >
                        <IconX size={10} />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key !== 'Enter') return
                      e.preventDefault()
                      const v = newTag.trim()
                      if (!v) return
                      setInterestTags((prev) => (prev.includes(v) ? prev : [...prev, v]))
                      setNewTag('')
                      setIsDirty(true)
                    }}
                    disabled={saving || showSkeleton}
                    placeholder="Add a tag…"
                    className="flex-1 rounded-2xl border border-slate-800/70 bg-slate-950/40 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={saving || showSkeleton || !newTag.trim()}
                    onClick={() => {
                      const v = newTag.trim()
                      if (!v) return
                      setInterestTags((prev) => (prev.includes(v) ? prev : [...prev, v]))
                      setNewTag('')
                      setIsDirty(true)
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-300/70">
                  HOBBIES
                </div>
                <div className="flex flex-wrap gap-2">
                  {hobbyTags.map((h) => (
                    <span
                      key={h}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-800/60 bg-slate-950/18 px-3 py-1.5 text-xs font-semibold text-slate-200"
                    >
                      <HobbyIcon label={h} />
                      <span className="truncate">{h}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setHobbyTags((prev) => prev.filter((x) => x !== h))
                          setIsDirty(true)
                        }}
                        className="grid size-4 place-items-center rounded-full text-[10px] text-slate-400 hover:text-slate-200"
                        aria-label={`Remove hobby ${h}`}
                        disabled={saving || showSkeleton}
                      >
                        <IconX size={10} />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={saving || showSkeleton}
                    onClick={() => setIsHobbyPickerOpen((v) => !v)}
                  >
                    {isHobbyPickerOpen ? 'Close' : 'Add Hobby'}
                  </Button>
                  <div className="text-xs text-slate-500">
                    {hobbyTags.length} selected
                  </div>
                </div>

                {isHobbyPickerOpen && (
                  <div className="mt-3 rounded-2xl border border-slate-800/60 bg-slate-950/20 p-3">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-300/70">
                      Suggested hobbies
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {suggestedHobbies.map((h) => {
                        const active = hobbyTags.includes(h)
                        return (
                          <button
                            key={h}
                            type="button"
                            disabled={saving || showSkeleton}
                            onClick={() => {
                              setHobbyTags((prev) => (prev.includes(h) ? prev : [...prev, h]))
                              setIsDirty(true)
                            }}
                            className={cn(
                              'flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-xs font-semibold transition',
                              active
                                ? 'border-blue-500/25 bg-blue-600/10 text-blue-100 shadow-[0_0_18px_rgba(59,130,246,0.14)]'
                                : 'border-slate-800/60 bg-slate-950/20 text-slate-200 hover:bg-slate-950/30',
                              (saving || showSkeleton) && 'opacity-60',
                            )}
                            aria-pressed={active}
                          >
                            <HobbyIcon label={h} />
                            <span className="truncate">{h}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* MY ACHIEVEMENTS */}
          <Card title="MY ACHIEVEMENTS">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
              <AchievementTile
                title="Code Coder"
                level="Level 1"
                chip="+3,90"
                variant="blue"
                icon={<CodeBadgeIcon />}
              />
              <AchievementTile
                title="React Rookie"
                level="Level 2"
                chip="→7/20"
                variant="cyan"
                icon={<ReactBadgeIcon />}
              />
              <AchievementTile
                title="Database Dabbler"
                level="Level 1"
                chip="5/5"
                variant="violet"
                icon={<DbBadgeIcon />}
              />
              <AchievementTile
                title="Unlock more achissements"
                level=""
                chip=""
                variant="locked"
                icon={<LockBadgeIcon />}
              />
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-4">
          {/* STUDENT INFORMATION */}
          <Card title="STUDENT INFORMATION">
            <div className="space-y-4">
              <label className="block">
                <div className="text-xs font-semibold text-slate-400">Full Name</div>
                <input
                  value={form.full_name}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, full_name: e.target.value }))
                    setIsDirty(true)
                  }}
                  disabled={saving || showSkeleton}
                  className="mt-2 w-full rounded-2xl border border-slate-800/70 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                  placeholder="Your full name"
                />
              </label>

              <label className="block">
                <div className="text-xs font-semibold text-slate-400">Email</div>
                <input
                  value={user?.email ?? form.email}
                  disabled
                  className="mt-2 w-full rounded-2xl border border-slate-800/70 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 opacity-80"
                />
              </label>

              <div className="text-xs text-slate-500">
                {showSkeleton ? 'Loading…' : 'Tip: Keep your name and class updated for reports and guidance.'}
              </div>
            </div>
          </Card>

          {/* MY SKILLS */}
          <Card title="MY SKILLS">
            <div className="space-y-3">
              {skillsState.map((s) => (
                <SkillRow
                  key={s.id}
                  skill={s}
                  onChange={(next: Skill) =>
                    (setSkillsState((prev) => prev.map((p) => (p.id === s.id ? next : p))), setIsDirty(true))
                  }
                  onRemove={() => {
                    setSkillsState((prev) => prev.filter((p) => p.id !== s.id))
                    setIsDirty(true)
                  }}
                />
              ))}

              <div className="flex items-center justify-start gap-3 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsSkillPickerOpen((v) => !v)}
                  disabled={saving || showSkeleton}
                >
                  {isSkillPickerOpen ? 'Close' : 'Add Skill'}
                </Button>
              </div>

              {isSkillPickerOpen && (
                <div className="rounded-2xl border border-slate-800/60 bg-slate-950/20 p-3">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-300/70">
                    Suggested skills
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {suggestedSkills.map((sugg) => {
                      const exists = skillsState.some(
                        (s) => s.label.trim().toLowerCase() === sugg.label.toLowerCase(),
                      )
                      return (
                        <button
                          key={sugg.label}
                          type="button"
                          disabled={saving || showSkeleton}
                          onClick={() => {
                            if (exists) return
                            setSkillsState((prev) => [
                              ...prev,
                              {
                                id: cryptoId(),
                                label: sugg.label,
                                value: sugg.value,
                                icon: sugg.icon as Skill['icon'],
                              },
                            ])
                            setIsDirty(true)
                          }}
                          className={cn(
                            'flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-xs font-semibold transition',
                            exists
                              ? 'border-blue-500/25 bg-blue-600/10 text-blue-100 shadow-[0_0_18px_rgba(59,130,246,0.14)]'
                              : 'border-slate-800/60 bg-slate-950/20 text-slate-200 hover:bg-slate-950/30',
                            (saving || showSkeleton) && 'opacity-60',
                          )}
                          aria-pressed={exists}
                        >
                          <SkillIcon kind={sugg.icon as Skill['icon']} />
                          <span className="truncate">{sugg.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </Card>

        </div>
      </div>

      {/* Single save button (bottom-right) */}
      <div className="fixed bottom-6 right-6 z-30">
        <Button
          type="button"
          onClick={handleSave}
          disabled={saving || showSkeleton || !isSupabaseConfigured || !profileId}
          size="lg"
          variant="primary"
          className={cn('px-6', (saving || !isSupabaseConfigured || !profileId) && 'opacity-60')}
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M21 21l-4.3-4.3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 7.5 12 12l5.5-4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function HobbyIcon(props: { label: string }) {
  const { label } = props
  if (label.toLowerCase().includes('coding')) {
    return <span className="font-mono text-[13px] text-blue-200">{'</>'}</span>
  }
  if (label.toLowerCase().includes('gaming')) {
    return <span className="text-[13px] text-blue-200">🎮</span>
  }
  return <span className="text-[13px] text-blue-200">📖</span>
}

type SkillRowProps = {
  skill: Skill
  onChange: (next: Skill) => void
  onRemove: () => void
}

function SkillRow(props: SkillRowProps) {
  const { skill } = props
  const clamped = clamp100(skill.value)
  const options: Array<{ icon: Skill['icon']; label: string }> = [
    { icon: 'html', label: 'HTML' },
    { icon: 'css', label: 'CSS' },
    { icon: 'js', label: 'JavaScript' },
    { icon: 'ts', label: 'TypeScript' },
    { icon: 'react', label: 'React' },
    { icon: 'sql', label: 'SQL' },
    { icon: 'git', label: 'Git' },
    { icon: 'python', label: 'Python' },
    { icon: 'figma', label: 'Figma' },
    { icon: 'video', label: 'Video Editing' },
  ]

  const labelForIcon = (icon: Skill['icon']) =>
    options.find((o) => o.icon === icon)?.label ?? skill.label

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-800/60 bg-slate-950/18 px-4 py-3">
      <div className="grid size-10 place-items-center rounded-lg border border-slate-800/60 bg-slate-950/25">
        <SkillIcon kind={skill.icon} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <select
            value={skill.icon}
            onChange={(e) => {
              const icon = e.target.value as Skill['icon']
              props.onChange({ ...skill, icon, label: labelForIcon(icon) })
            }}
            className="min-w-0 flex-1 rounded-lg border border-slate-800/60 bg-slate-950/25 px-3 py-2 text-sm font-semibold text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxMiAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMgNEw2IDdMOSA0IiBzdHJva2U9IiM5NDEwM0Y0IiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjwvc3ZnPg==')] bg-no-repeat bg-right pr-8"
            aria-label="Skill"
          >
            {options.map((o) => (
              <option key={o.icon} value={o.icon}>
                {o.label}
              </option>
            ))}
          </select>
          <Button type="button" variant="ghost" onClick={props.onRemove} aria-label="Remove skill" className="text-xs">
            Remove
          </Button>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-slate-950/40 ring-1 ring-slate-800/60">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
            style={{ width: `${clamped}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function defaultSkills(): Skill[] {
  return [
    { id: cryptoId(), label: 'HTML', value: 60, icon: 'html' },
    { id: cryptoId(), label: 'CSS', value: 55, icon: 'css' },
    { id: cryptoId(), label: 'JavaScript', value: 55, icon: 'js' },
    { id: cryptoId(), label: 'TypeScript', value: 50, icon: 'ts' },
    { id: cryptoId(), label: 'React', value: 50, icon: 'react' },
    { id: cryptoId(), label: 'SQL', value: 45, icon: 'sql' },
  ]
}

function SkillIcon(props: { kind: Skill['icon'] }) {
  const { kind } = props
  if (kind === 'html') return <span className="text-xs font-bold tracking-wide text-blue-100">{'<HTML>'}</span>
  if (kind === 'css') return <span className="text-xs font-bold tracking-wide text-blue-100">{'<CSS>'}</span>
  if (kind === 'js') return <span className="text-xs font-bold tracking-wide text-blue-100">{'<JS>'}</span>
  if (kind === 'ts') return <span className="text-xs font-bold tracking-wide text-slate-100">{'<TS>'}</span>
  if (kind === 'react') return <span className="text-lg text-blue-200">⚛</span>
  if (kind === 'sql') return <span className="text-lg text-blue-200">🛢</span>
  if (kind === 'git') return <span className="text-lg text-blue-200">◆</span>
  if (kind === 'python') return <span className="text-xs font-bold tracking-wide text-blue-100">{'<PY>'}</span>
  if (kind === 'figma') return <span className="text-xs font-bold tracking-wide text-blue-100">{'<UI>'}</span>
  if (kind === 'video') return <span className="text-xs font-bold tracking-wide text-blue-100">{'<VID>'}</span>
  return <span className="text-lg text-blue-200">◆</span>
}

function AchievementTile(props: {
  title: string
  level: string
  chip: string
  variant: 'blue' | 'cyan' | 'violet' | 'locked'
  icon: React.ReactNode
}) {
  const { title, level, chip, variant, icon } = props
  const frame =
    variant === 'blue'
      ? 'border-blue-500/25 bg-blue-600/8'
      : variant === 'cyan'
        ? 'border-cyan-400/20 bg-cyan-400/8'
        : variant === 'violet'
          ? 'border-violet-400/20 bg-violet-400/8'
          : 'border-slate-800/60 bg-slate-950/18'

  const glow =
    variant === 'blue'
      ? 'shadow-[0_0_26px_rgba(59,130,246,0.20)]'
      : variant === 'cyan'
        ? 'shadow-[0_0_26px_rgba(34,211,238,0.16)]'
        : variant === 'violet'
          ? 'shadow-[0_0_26px_rgba(167,139,250,0.16)]'
          : ''

  return (
    <div className={cn('rounded-2xl border p-4', frame, glow)}>
      <div className="flex justify-center">
        <div className="grid size-16 place-items-center">{icon}</div>
      </div>
      <div className="mt-2 text-center">
        <div className="text-sm font-semibold text-slate-100">{title}</div>
        <div className="mt-1 text-xs font-medium text-slate-400">{level}</div>
      </div>

      {chip ? (
        <div className="mt-3 flex justify-center">
          <span className="rounded-xl border border-slate-800/60 bg-slate-950/25 px-3 py-1 text-xs font-semibold text-slate-200">
            {chip}
          </span>
        </div>
      ) : null}
    </div>
  )
}

function CodeBadgeIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path
        d="M32 6l20 10v20c0 14-9 22-20 22S12 50 12 36V16L32 6Z"
        stroke="rgba(96,165,250,0.95)"
        strokeWidth="2"
      />
      <path
        d="M26 28l-6 4 6 4M38 28l6 4-6 4M34 25l-4 14"
        stroke="rgba(226,232,240,0.95)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ReactBadgeIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path
        d="M32 6l20 10v20c0 14-9 22-20 22S12 50 12 36V16L32 6Z"
        stroke="rgba(34,211,238,0.95)"
        strokeWidth="2"
      />
      <circle cx="32" cy="34" r="4" fill="rgba(226,232,240,0.92)" />
      <path
        d="M20 34c4-6 20-6 24 0-4 6-20 6-24 0Z"
        stroke="rgba(226,232,240,0.9)"
        strokeWidth="2"
      />
      <path
        d="M24 26c7-2 17 10 16 16-7 2-17-10-16-16Z"
        stroke="rgba(226,232,240,0.6)"
        strokeWidth="2"
      />
      <path
        d="M40 26c-7-2-17 10-16 16 7 2 17-10 16-16Z"
        stroke="rgba(226,232,240,0.6)"
        strokeWidth="2"
      />
    </svg>
  )
}

function DbBadgeIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path
        d="M32 6l20 10v20c0 14-9 22-20 22S12 50 12 36V16L32 6Z"
        stroke="rgba(167,139,250,0.95)"
        strokeWidth="2"
      />
      <path
        d="M22 28c0-3 7-5 10-5s10 2 10 5-7 5-10 5-10-2-10-5Z"
        stroke="rgba(226,232,240,0.92)"
        strokeWidth="2"
      />
      <path
        d="M22 28v12c0 3 7 5 10 5s10-2 10-5V28"
        stroke="rgba(226,232,240,0.7)"
        strokeWidth="2"
      />
    </svg>
  )
}

function LockBadgeIcon() {
  return (
    <div className="grid size-16 place-items-center rounded-2xl border border-slate-800/60 bg-slate-950/25 text-slate-300/70">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M7.5 11V8.8a4.5 4.5 0 0 1 9 0V11"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M7 11h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

function withCacheBust(url: string, revision: number) {
  if (!url) return ''
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${revision}`
}


