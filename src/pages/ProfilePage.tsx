import { useEffect, useMemo, useState } from 'react'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/PageHeader'
import { isSupabaseConfigured } from '../lib/supabaseClient'
import { fetchProfile, uploadAvatar, upsertProfile, type ProfileRow } from '../lib/profileRepo'
import { cn } from '../lib/cn'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../context/ProfileContext'

type FormState = {
  full_name: string
  class: string
  email: string
  avatar_url: string
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        subtitle="Update your details and profile photo."
      />

      {!isSupabaseConfigured && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-5 py-4 text-sm text-amber-100">
          Supabase is not configured yet. Add your env vars in <span className="font-mono">.env.local</span> and restart the dev server.
        </div>
      )}

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

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className={cn(
                'w-full rounded-2xl bg-blue-600/20 px-5 py-3 text-sm font-semibold text-blue-100 ring-1 ring-blue-500/25 hover:bg-blue-600/25',
                saving && 'opacity-60',
              )}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>

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
      </div>
    </div>
  )
}


