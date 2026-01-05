import { supabase } from './supabaseClient'

import type { UserRole } from '../constants/roles'

// Student Profile Type
export type StudentProfileRow = {
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
}

// Teacher Profile Type
export type TeacherProfileRow = {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  created_at: string | null
  avatar_url: string | null
}

// Role-only profile for role checks
export type RoleProfileRow = {
  id: string
  role: UserRole
  created_at: string | null
}

// Union type for backward compatibility
export type ProfileRow = StudentProfileRow | TeacherProfileRow

function getAvatarBucketName() {
  // Default matches our docs, but you can override to your existing bucket name (e.g. "media").
  return (import.meta.env.VITE_SUPABASE_AVATAR_BUCKET as string | undefined) ?? 'avatars'
}

// Fetch user role - check profile tables directly (database as source of truth)
// First check teacher_profiles, then profiles (students)
// All users have profiles, so this always returns a role
export async function fetchUserRole(id: string): Promise<UserRole> {
  if (!supabase) throw new Error('Supabase not configured')

  // First, check teacher_profiles table
  try {
    const { data: teacherProfile, error: teacherError } = await supabase
      .from('teacher_profiles')
      .select('id')
      .eq('id', id)
      .maybeSingle()

    if (!teacherError && teacherProfile) {
      return 'teacher'
    }
  } catch (error) {
    console.warn('Failed to check teacher_profiles:', error)
  }

  // If not a teacher, check profiles table (students)
  try {
    const { data: studentProfile, error: studentError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', id)
      .maybeSingle()

    if (!studentError && studentProfile) {
      return 'student'
    }
  } catch (error) {
    console.warn('Failed to check profiles:', error)
  }

  // Default to student if profile not found (should not happen, but safety fallback)
  // All signups create student profiles in profiles table, teachers are manually added to teacher_profiles
  return 'student'
}

// Fetch student profile from profiles table
export async function fetchStudentProfile(id: string): Promise<StudentProfileRow | null> {
  if (!supabase) throw new Error('Supabase not configured')

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    // If table doesn't exist or RLS blocks, return null instead of throwing
    // This allows the app to continue and create the profile later
    if (error.message?.includes('does not exist') || error.message?.includes('permission denied')) {
      console.warn('Student profile not found or access denied:', error.message)
      return null
    }
    const msg = error.message || 'Failed to fetch student profile.'
    throw new Error(`${msg} (Check table "profiles" + RLS select policy.)`)
  }
  return data as StudentProfileRow | null
}

// Fetch teacher profile
export async function fetchTeacherProfile(id: string): Promise<TeacherProfileRow | null> {
  if (!supabase) throw new Error('Supabase not configured')

  const { data, error } = await supabase
    .from('teacher_profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    // If table doesn't exist or RLS blocks, return null instead of throwing
    // This allows the app to continue and create the profile later
    if (error.message?.includes('does not exist') || error.message?.includes('permission denied')) {
      console.warn('Teacher profile not found or access denied:', error.message)
      return null
    }
    const msg = error.message || 'Failed to fetch teacher profile.'
    throw new Error(`${msg} (Check table "teacher_profiles" + RLS select policy.)`)
  }
  return data as TeacherProfileRow | null
}

// Unified fetch profile - determines role and fetches appropriate profile
export async function fetchProfile(id: string): Promise<ProfileRow | null> {
  if (!supabase) throw new Error('Supabase not configured')

  // First, get the user's role by checking teacher_profiles, then profiles
  const role = await fetchUserRole(id)

  // Fetch the appropriate profile based on role
  if (role === 'teacher') {
    const teacherProfile = await fetchTeacherProfile(id)
    // If teacher profile doesn't exist, return null (will be created on first save)
    return teacherProfile
  } else {
    // Student profile is in profiles table
    const studentProfile = await fetchStudentProfile(id)
    // If student profile doesn't exist, return null (will be created on first save)
    return studentProfile
  }
}

// Upsert student profile to profiles table
export async function upsertStudentProfile(profile: Omit<StudentProfileRow, 'created_at'>) {
  if (!supabase) throw new Error('Supabase not configured')

  const { data, error } = await supabase
    .from('profiles')
    .upsert({ ...profile }, { onConflict: 'id' })
    .select('*')
    .maybeSingle()

  if (error) {
    const msg = error.message || 'Failed to save student profile.'
    const lower = msg.toLowerCase()
    const hint =
      lower.includes('row-level security') || lower.includes('permission denied')
        ? ' (RLS blocked write. Add INSERT/UPDATE policies for public.profiles.)'
        : lower.includes('column') && lower.includes('does not exist')
          ? ' (Missing columns. Check profiles table schema.)'
        : lower.includes('relation') && lower.includes('does not exist')
          ? ' (Table missing. Create profiles table.)'
          : ''
    throw new Error(`${msg}${hint}`)
  }
  return data as StudentProfileRow
}

// Upsert teacher profile
export async function upsertTeacherProfile(profile: Omit<TeacherProfileRow, 'created_at'>) {
  if (!supabase) throw new Error('Supabase not configured')

  const { data, error } = await supabase
    .from('teacher_profiles')
    .upsert({ ...profile }, { onConflict: 'id' })
    .select('*')
    .maybeSingle()

  if (error) {
    const msg = error.message || 'Failed to save teacher profile.'
    const lower = msg.toLowerCase()
    const hint =
      lower.includes('row-level security') || lower.includes('permission denied')
        ? ' (RLS blocked write. Add INSERT/UPDATE policies for public.teacher_profiles as in migration.)'
        : lower.includes('column') && lower.includes('does not exist')
          ? ' (Missing columns. Check teacher_profiles table schema in migration.)'
        : lower.includes('relation') && lower.includes('does not exist')
          ? ' (Table missing. Run create_separate_profiles.sql migration.)'
          : ''
    throw new Error(`${msg}${hint}`)
  }
  return data as TeacherProfileRow
}

// Unified upsert profile - determines role and saves to appropriate table
export async function upsertProfile(profile: Omit<ProfileRow, 'created_at'> & { role?: UserRole }) {
  if (!supabase) throw new Error('Supabase not configured')

  // Determine role - either from profile.role or fetch it
  let role = profile.role
  if (!role) {
    role = await fetchUserRole(profile.id) || 'student' // Default to student
  }

  // Note: To update role in auth.users.raw_user_meta_data.role, use Supabase Admin API
  // This requires service role key and should be done server-side or via database trigger

  // Save to appropriate profile table
  if (role === 'teacher') {
    // For teacher profile, extract phone from the profile object
    const profileWithPhone = profile as TeacherProfileRow & { phone?: string | null }
    const teacherProfile: Omit<TeacherProfileRow, 'created_at'> = {
      id: profile.id,
      full_name: profile.full_name,
      email: profile.email,
      phone: profileWithPhone.phone ?? null,
      avatar_url: profile.avatar_url,
    }
    return await upsertTeacherProfile(teacherProfile)
  } else {
    // For student profile, extract all student-specific fields
    const profileWithStudentFields = profile as StudentProfileRow & { 
      about_me?: string | null
      skills?: unknown[] | null
      interests?: string[] | null
      hobbies?: string[] | null
      class?: string | null
    }
    const studentProfile: Omit<StudentProfileRow, 'created_at'> & { role?: UserRole } = {
      id: profile.id,
      full_name: profile.full_name,
      class: profileWithStudentFields.class ?? null,
      email: profile.email,
      avatar_url: profile.avatar_url,
      about_me: profileWithStudentFields.about_me ?? null,
      skills: profileWithStudentFields.skills ?? null,
      interests: profileWithStudentFields.interests ?? null,
      hobbies: profileWithStudentFields.hobbies ?? null,
      role: role, // Include role field for profiles table
    }
    // Upsert student profile with all fields including role
    // This ensures role is set without overwriting other data
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ ...studentProfile }, { onConflict: 'id' })
      .select('*')
      .maybeSingle()

    if (error) {
      const msg = error.message || 'Failed to save student profile.'
      const lower = msg.toLowerCase()
      const hint =
        lower.includes('row-level security') || lower.includes('permission denied')
          ? ' (RLS blocked write. Add INSERT/UPDATE policies for public.profiles.)'
          : lower.includes('column') && lower.includes('does not exist')
            ? ' (Missing columns. Check profiles table schema.)'
          : lower.includes('relation') && lower.includes('does not exist')
            ? ' (Table missing. Create profiles table.)'
            : ''
      throw new Error(`${msg}${hint}`)
    }
    return data as StudentProfileRow
  }
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

// ============================================
// Teacher-only functions for Student Overview
// ============================================

/**
 * Get all unique classes from student profiles (for teachers)
 * Requires RLS policy allowing teachers to read student profiles
 */
export async function fetchAllClasses(): Promise<string[]> {
  if (!supabase) throw new Error('Supabase not configured')

  const { data, error } = await supabase
    .from('profiles')
    .select('class')
    .not('class', 'is', null)
    .neq('class', '')

  if (error) {
    const msg = error.message || 'Failed to fetch classes.'
    throw new Error(`${msg} (Check RLS policies for teachers to read student profiles.)`)
  }

  // Extract unique classes and sort them
  const classes = Array.from(new Set((data || []).map((row) => row.class).filter(Boolean))) as string[]
  return classes.sort()
}

/**
 * Get all students in a specific class (for teachers)
 * Requires RLS policy allowing teachers to read student profiles
 */
export async function fetchStudentsByClass(className: string): Promise<StudentProfileRow[]> {
  if (!supabase) throw new Error('Supabase not configured')

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('class', className)
    .order('full_name', { ascending: true, nullsFirst: false })

  if (error) {
    const msg = error.message || 'Failed to fetch students.'
    throw new Error(`${msg} (Check RLS policies for teachers to read student profiles.)`)
  }

  return (data as StudentProfileRow[]) || []
}

/**
 * Get RIASEC results for multiple students (for teachers)
 * Returns a map of userId -> dominant RIASEC code (1-2 letters)
 */
export async function fetchRiasecResultsForStudents(
  userIds: string[],
): Promise<Record<string, { code: string; dominantCode: string }>> {
  if (!supabase) throw new Error('Supabase not configured')

  if (userIds.length === 0) return {}

  const { data, error } = await supabase
    .from('psychometric_results')
    .select('user_id, code')
    .in('user_id', userIds)

  if (error) {
    const msg = error.message || 'Failed to fetch RIASEC results.'
    throw new Error(`${msg} (Check RLS policies for teachers to read psychometric_results.)`)
  }

  const results: Record<string, { code: string; dominantCode: string }> = {}

  for (const row of data || []) {
    const code = row.code || ''
    // Extract dominant code: first 1-2 letters
    // If code is "ISA", show "I" (1 code) or "I-S" (2 codes)
    // Always show at least the first letter, optionally show second if available
    let dominantCode = ''
    if (code.length >= 2) {
      // Show first 2 codes joined with hyphen: "I-S"
      dominantCode = code.slice(0, 2).split('').join('-')
    } else if (code.length === 1) {
      // Show single code: "I"
      dominantCode = code
    }
    
    results[row.user_id] = {
      code,
      dominantCode,
    }
  }

  return results
}


