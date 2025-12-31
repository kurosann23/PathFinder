import { useEffect, useMemo, useState } from 'react'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/PageHeader'
import { isSupabaseConfigured } from '../lib/supabaseClient'
import { fetchProfile, uploadAvatar, upsertProfile, type ProfileRow } from '../lib/profileRepo'
import { cn } from '../lib/cn'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../context/ProfileContext'
import { Button } from '../components/ui/Button'
import { IconBell } from '../components/icons'

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
  icon: 'ts' | 'react' | 'sql' | 'git'
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
  const { refresh } = useProfile()
  const profileId = useMemo(() => user?.id ?? '', [user?.id])

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [aboutMe, setAboutMe] = useState(
    "I'm a computer science student interested in web development and database management. I enjoy working on personal projects and learning new things.",
  )

  const [form, setForm] = useState<FormState>(() => ({
    full_name: '',
    class: '',
    email: '',
    avatar_url: '',
  }))

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

  useEffect(() => {
    async function load() {
      setError('')
      setSuccess('')
      if (!isSupabaseConfigured) return
      if (!profileId) return
      setLoading(true)
      try {
        const p = await fetchProfile(profileId)
        if (p) {
          setForm(toForm(p))
        } else {
          // First time: prefill email from auth user
          setForm((prev) => ({ ...prev, email: user?.email ?? prev.email }))
        }
      } catch (e) {
        setError(getErrorMessage(e) || 'Failed to load profile.')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [profileId, user?.email])

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
        avatarUrl = await uploadAvatar(avatarFile, profileId)
      }

      await upsertProfile({
        id: profileId,
        full_name: form.full_name || null,
        class: form.class || null,
        email: (user?.email ?? form.email) || null,
        avatar_url: avatarUrl || null,
      })

      setForm((prev) => ({ ...prev, avatar_url: avatarUrl }))
      setAvatarFile(null)
      setSuccess('Profile saved.')
      await refresh()
    } catch (e) {
      setError(getErrorMessage(e) || 'Failed to save profile.')
    } finally {
      setSaving(false)
    }
  }

  const skills: Skill[] = useMemo(
    () => [
      { id: 'ts', label: 'TypeScript', value: 75, icon: 'ts' },
      { id: 'react', label: 'React', value: 65, icon: 'react' },
      { id: 'sql', label: 'SQL', value: 60, icon: 'sql' },
      { id: 'git', label: 'Git', value: 55, icon: 'git' },
    ],
    [],
  )

  const interests = useMemo(() => ['web development', 'TypeScript', 'Supabase'], [])
  const hobbies = useMemo(() => ['Coding', 'Gaming', 'Reading'], [])

  const displayName = (form.full_name || user?.email || 'Student').split('@')[0]

  return (
    <div className="space-y-6">
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

            <div className="ml-1 grid size-10 place-items-center overflow-hidden rounded-full border border-slate-800/60 bg-slate-950/35 text-sm font-semibold text-slate-100">
              {form.avatar_url ? (
                <img src={form.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                displayName.slice(0, 1).toUpperCase()
              )}
            </div>
          </div>
        }
      />

      {!isSupabaseConfigured && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-5 py-4 text-sm text-amber-100">
          Supabase is not configured yet. Add your env vars in <span className="font-mono">.env.local</span> and restart the dev server.
        </div>
      )}

      {/* Layout: left column (photo + about), right wide column (info + skills + achievements) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card title="Profile Photo" className="lg:col-span-1">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="grid size-20 place-items-center overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-950/40">
                {avatarPreviewUrl || form.avatar_url ? (
                  <img
                    src={avatarPreviewUrl || form.avatar_url}
                    alt="Profile avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-semibold text-slate-200">
                    {(form.full_name || user?.email || 'U').slice(0, 1).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-100">Upload photo</div>
                <div className="mt-1 text-xs text-slate-400">
                  JPG/PNG recommended.
                </div>
              </div>
            </div>

            <input
              type="file"
              accept="image/*"
              disabled={saving}
              onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
              className="block w-full text-xs text-slate-300 file:mr-3 file:rounded-xl file:border-0 file:bg-blue-600/20 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-blue-100 file:ring-1 file:ring-blue-500/25 hover:file:bg-blue-600/25 disabled:opacity-60"
            />

            <Button
              type="button"
              onClick={handleSave}
              disabled={saving}
              variant="primary"
              fullWidth
              className={cn(saving && 'opacity-60')}
            >
              {saving ? 'Saving…' : 'Save'}
            </Button>

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
        </Card>

        <Card title="Student Information" className="lg:col-span-2">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block">
                <div className="text-xs font-semibold text-slate-400">Full Name</div>
                <input
                  value={form.full_name}
                  onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
                  disabled={saving}
                  className="mt-2 w-full rounded-2xl border border-slate-800/70 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                  placeholder="Your full name"
                />
              </label>

              <label className="block">
                <div className="text-xs font-semibold text-slate-400">Class</div>
                <input
                  value={form.class}
                  onChange={(e) => setForm((p) => ({ ...p, class: e.target.value }))}
                  disabled={saving}
                  className="mt-2 w-full rounded-2xl border border-slate-800/70 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                  placeholder="e.g., DIT 5A"
                />
              </label>
            </div>

            <label className="block">
              <div className="text-xs font-semibold text-slate-400">Email</div>
              <input
                value={user?.email ?? form.email}
                disabled
                className="mt-2 w-full rounded-2xl border border-slate-800/70 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 opacity-80"
              />
            </label>

            <div className="text-xs text-slate-500">
              {loading ? 'Loading…' : 'Tip: Keep your name and class updated for reports and guidance.'}
            </div>
          </div>
        </Card>

        <Card title="About Me" className="lg:col-span-1">
          <div className="space-y-4">
            <textarea
              value={aboutMe}
              onChange={(e) => setAboutMe(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-2xl border border-slate-800/70 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />

            <div className="flex flex-wrap gap-2">
              {interests.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-slate-800/60 bg-slate-950/18 px-3 py-1 text-xs font-semibold text-slate-200"
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="rounded-2xl border border-slate-800/60 bg-slate-950/18 p-4">
              <div className="text-sm font-semibold text-slate-100">Hobbies</div>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {hobbies.map((h) => (
                  <div
                    key={h}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-slate-800/60 bg-slate-950/20 px-3 py-3 text-xs font-semibold text-slate-200"
                  >
                    <HobbyIcon label={h} />
                    <span className="truncate">{h}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-1">
              <Button type="button" variant="secondary" className="mx-auto flex px-10">
                Save
              </Button>
            </div>
          </div>
        </Card>

        <Card title="My Skills" className="lg:col-span-2">
          <div className="space-y-3">
            {skills.map((s) => (
              <SkillRow key={s.id} skill={s} />
            ))}
          </div>
        </Card>

        <Card title="My Achievements" className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <AchievementTile
              title="Code Coder"
              level="Level 5"
              chip="+3 XP"
              variant="blue"
              icon={<CodeBadgeIcon />}
            />
            <AchievementTile
              title="React Rookie"
              level="Level 3"
              chip="+1 XP"
              variant="cyan"
              icon={<ReactBadgeIcon />}
            />
            <AchievementTile
              title="Database Dabbler"
              level="Level 2"
              chip="5/5"
              variant="violet"
              icon={<DbBadgeIcon />}
            />
            <AchievementTile
              title="Unlock more"
              level="achievements"
              chip=""
              variant="locked"
              icon={<LockBadgeIcon />}
            />
          </div>
        </Card>
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

function SkillRow(props: { skill: Skill }) {
  const { skill } = props
  const clamped = Math.max(0, Math.min(100, skill.value))
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-800/60 bg-slate-950/18 px-4 py-3">
      <div className="grid size-11 place-items-center rounded-2xl border border-slate-800/60 bg-slate-950/25">
        <SkillIcon kind={skill.icon} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <div className="truncate text-sm font-semibold text-slate-100">{skill.label}</div>
          <div className="text-sm font-semibold tabular-nums text-slate-200">{clamped}%</div>
        </div>
        <div className="mt-2 h-2.5 w-full rounded-full bg-slate-950/40 ring-1 ring-slate-800/60">
          <div
            className="h-2.5 rounded-full bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 shadow-[0_0_18px_rgba(59,130,246,0.22)]"
            style={{ width: `${clamped}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function SkillIcon(props: { kind: Skill['icon'] }) {
  const { kind } = props
  if (kind === 'ts') return <span className="text-xs font-bold tracking-wide text-slate-100">{'<TS>'}</span>
  if (kind === 'react') return <span className="text-lg text-blue-200">⚛</span>
  if (kind === 'sql') return <span className="text-lg text-blue-200">🛢</span>
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


