import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

type AuthContextValue = {
  isReady: boolean
  session: Session | null
  user: User | null
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider(props: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false)
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    let unsub: (() => void) | null = null

    async function init() {
      if (!isSupabaseConfigured || !supabase) {
        setIsReady(true)
        setSession(null)
        return
      }

      const { data, error } = await supabase.auth.getSession()
      if (!error) setSession(data.session ?? null)
      setIsReady(true)

      const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        setSession(nextSession)
      })
      unsub = () => sub.subscription.unsubscribe()
    }

    void init()
    return () => {
      unsub?.()
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => {
    async function signOut() {
      if (!supabase) return
      await supabase.auth.signOut()
    }

    return {
      isReady,
      session,
      user: session?.user ?? null,
      signOut,
    }
  }, [isReady, session])

  return <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}


