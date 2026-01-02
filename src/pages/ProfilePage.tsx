import { useEffect, useMemo, useRef, useState } from 'react'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/PageHeader'
import { isSupabaseConfigured } from '../lib/supabaseClient'
import { uploadAvatar, upsertProfile, type ProfileRow } from '../lib/profileRepo'
import { cn } from '../lib/cn'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../context/ProfileContext'
import { useUserProgress } from '../context/UserProgressContext'
import { Button } from '../components/ui/Button'
import { IconBell, IconChevronDown, IconX } from '../components/icons'
import { Avatar } from '../components/ui/Avatar'

type FormState = {
  full_name: string
  class: string
  email: string
  avatar_url: string
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

function toForm(p: ProfileRow | null): FormState {
  return {
    full_name: p?.full_name ?? '',
    class: p?.class ?? '',
    email: p?.email ?? '',
    avatar_url: p?.avatar_url ?? '',
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

export function ProfilePage() {
  const { user } = useAuth()
  const { profile, loading: profileLoading, refresh } = useProfile()
  const { progress } = useUserProgress()
  const profileId = useMemo(() => user?.id ?? '', [user?.id])
  const showSkeleton = profileLoading && !profile

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [isDirty, setIsDirty] = useState(false)
  const [aboutMe, setAboutMe] = useState<string>(() => profile?.about_me ?? '')
  const [interestTags, setInterestTags] = useState<string[]>(() => safeParseStringArray(profile?.interests))
  const [newTag, setNewTag] = useState('')
  const [hobbyTags, setHobbyTags] = useState<string[]>(() => safeParseStringArray(profile?.hobbies))
  const [isHobbyPickerOpen, setIsHobbyPickerOpen] = useState(false)
  const [isSkillPickerOpen, setIsSkillPickerOpen] = useState(false)
  const [avatarRevision, setAvatarRevision] = useState<number>(() => Date.now())

  const [form, setForm] = useState<FormState>(() => toForm(profile ?? null))
  const [skillsState, setSkillsState] = useState<Skill[]>(() => {
    const parsed = safeParseSkills(profile?.skills)
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
    setAboutMe(profile.about_me ?? '')
    setInterestTags(safeParseStringArray(profile.interests))
    setHobbyTags(safeParseStringArray(profile.hobbies))
    setIsHobbyPickerOpen(false)
    setIsSkillPickerOpen(false)
    const parsed = safeParseSkills(profile.skills)
    setSkillsState(parsed.length > 0 ? parsed : defaultSkills())
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


