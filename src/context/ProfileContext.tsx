import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { fetchProfile, type ProfileRow } from '../lib/profileRepo'
import { useAuth } from './AuthContext'
import { isSupabaseConfigured } from '../lib/supabaseClient'

type ProfileContextValue = {
  profile: ProfileRow | null
  loading: boolean
  refresh: () => Promise<void>
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

export function ProfileProvider(props: { children: ReactNode }) {
  const { user } = useAuth()
  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [loading, setLoading] = useState(false)

  async function refresh() {
    if (!isSupabaseConfigured || !user?.id) {
      setProfile(null)
      return
    }
    setLoading(true)
    try {
      const p = await fetchProfile(user.id)
      setProfile(p)
      // Preload avatar to avoid "late pop-in" in sidebar/dashboard/timeline.
      if (p?.avatar_url) {
        const img = new Image()
        img.src = p.avatar_url
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isSupabaseConfigured])

  const value = useMemo<ProfileContextValue>(() => ({ profile, loading, refresh }), [profile, loading])
  return <ProfileContext.Provider value={value}>{props.children}</ProfileContext.Provider>
}

export function useProfile() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile must be used within a ProfileProvider')
  return ctx
}


