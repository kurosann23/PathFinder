import { supabase } from './supabaseClient'
import type { CareerPathReport, CourseRecommendation, RiasecType } from '../constants/dashboard'

export type PsychometricResultRow = {
  user_id: string
  code: string
  riasec_percentages: Record<RiasecType, number>
  career_path_report: CareerPathReport | null
  course_recommendations: CourseRecommendation[] | null
  updated_at: string | null
}

function formatSupabaseHint(message: string) {
  const lower = message.toLowerCase()
  if (lower.includes('row-level security') || lower.includes('permission denied')) {
    return ' (RLS blocked access. Add SELECT/INSERT/UPDATE policies for public.psychometric_results as per your schema.)'
  }
  if (lower.includes('relation') && lower.includes('does not exist')) {
    return ' (Table missing. Create public.psychometric_results in Supabase SQL editor.)'
  }
  return ''
}

export async function fetchPsychometricResult(userId: string) {
  if (!supabase) throw new Error('Supabase not configured')

  const { data, error } = await supabase
    .from('psychometric_results')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    const msg = error.message || 'Failed to fetch psychometric result.'
    throw new Error(`${msg}${formatSupabaseHint(msg)}`)
  }

  return (data as PsychometricResultRow | null) ?? null
}

export async function upsertPsychometricResult(input: {
  userId: string
  code: string
  riasecPercentages: Record<RiasecType, number>
  careerPathReport: CareerPathReport | null
  courseRecommendations: CourseRecommendation[] | null
}) {
  if (!supabase) throw new Error('Supabase not configured')

  const { data, error } = await supabase
    .from('psychometric_results')
    .upsert(
      {
        user_id: input.userId,
        code: input.code,
        riasec_percentages: input.riasecPercentages,
        career_path_report: input.careerPathReport,
        course_recommendations: input.courseRecommendations,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )
    .select('*')
    .single()

  if (error) {
    const msg = error.message || 'Failed to save psychometric result.'
    throw new Error(`${msg}${formatSupabaseHint(msg)}`)
  }

  return data as PsychometricResultRow
}

export async function deletePsychometricResult(userId: string) {
  if (!supabase) throw new Error('Supabase not configured')

  const { error } = await supabase
    .from('psychometric_results')
    .delete()
    .eq('user_id', userId)

  if (error) {
    const msg = error.message || 'Failed to delete psychometric result.'
    throw new Error(`${msg}${formatSupabaseHint(msg)}`)
  }
}


