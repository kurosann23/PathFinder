import { supabase } from './supabaseClient'

import type { UserRole } from '../constants/roles'

export type ProfileRow = {
  // Auth user id (uuid string)
  id: string
  full_name: string | null
  class: string | null
  email: string | null
  created_at: string | null
  avatar_url: string | null
  about_me?: string | null
  skills?: unknown[] | null
  interests?: string[] | null
  hobbies?: string[] | null
  role?: UserRole | null
}

function getAvatarBucketName() {
  // Default matches our docs, but you can override to your existing bucket name (e.g. "media").
  return (import.meta.env.VITE_SUPABASE_AVATAR_BUCKET as string | undefined) ?? 'avatars'
}

export async function fetchProfile(id: string) {
  if (!supabase) throw new Error('Supabase not configured')

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    const msg = error.message || 'Failed to fetch profile.'
    throw new Error(`${msg} (Check table "profiles" + RLS select policy.)`)
  }
  return data as ProfileRow | null
}

export async function upsertProfile(profile: Omit<ProfileRow, 'created_at'>) {
  if (!supabase) throw new Error('Supabase not configured')

  const { data, error } = await supabase
    .from('profiles')
    .upsert({ ...profile }, { onConflict: 'id' })
    .select('*')
    .single()

  if (error) {
    const msg = error.message || 'Failed to save profile.'
    const lower = msg.toLowerCase()
    const hint =
      lower.includes('row-level security') || lower.includes('permission denied')
        ? ' (RLS blocked write. Add INSERT/UPDATE policies for public.profiles as in README.)'
        : lower.includes('column') && lower.includes('does not exist')
          ? ' (Missing columns. Add about_me (text), skills (jsonb), interests (jsonb), and hobbies (jsonb) to public.profiles as in README.)'
        : lower.includes('relation') && lower.includes('does not exist')
          ? ' (Table missing. Create public.profiles table in Supabase SQL editor.)'
          : ''
    throw new Error(`${msg}${hint}`)
  }
  return data as ProfileRow
}

export async function uploadAvatar(file: File, profileId: string) {
  if (!supabase) throw new Error('Supabase not configured')

  const bucket = getAvatarBucketName()
  const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
  const path = `${profileId}/avatar.${ext}`

  const { error: uploadErr } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true, cacheControl: '3600' })

  if (uploadErr) {
    // Provide a clearer error for the most common setup issue.
    const msg = uploadErr.message || 'Failed to upload avatar.'
    const lower = msg.toLowerCase()
    const hint =
      lower.includes('bucket') || lower.includes('not found')
        ? ` (Check your Storage bucket name. Current: "${bucket}". Set VITE_SUPABASE_AVATAR_BUCKET in .env.local.)`
        : lower.includes('row-level security') || lower.includes('permission denied')
          ? ` (Storage RLS blocked upload. Add Storage INSERT/UPDATE policies for bucket "${bucket}".)`
          : ''
    throw new Error(`${msg}${hint}`)
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}


