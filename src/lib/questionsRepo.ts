import { supabase } from './supabaseClient'

export type QuestionRow = {
  id: number
  text: string
  type: 'R' | 'I' | 'A' | 'S' | 'E' | 'C'
  created_at?: string
  updated_at?: string
  order_index?: number | null
  is_active?: boolean
}

export type QuestionInput = Omit<QuestionRow, 'id' | 'created_at' | 'updated_at'>

/**
 * Fetch all active psychometric questions, ordered by type and order_index
 */
export async function fetchAllQuestions(): Promise<QuestionRow[]> {
  if (!supabase) throw new Error('Supabase not configured')

  const { data, error } = await supabase
    .from('psychometric_questions')
    .select('*')
    .eq('is_active', true)
    .order('type', { ascending: true })
    .order('order_index', { ascending: true, nullsFirst: false })
    .order('id', { ascending: true })

  if (error) {
    const msg = error.message || 'Failed to fetch questions.'
    throw new Error(`${msg} (Check table "psychometric_questions" + RLS policies.)`)
  }

  return (data as QuestionRow[]) || []
}

/**
 * Fetch a single question by ID
 */
export async function fetchQuestion(id: number): Promise<QuestionRow | null> {
  if (!supabase) throw new Error('Supabase not configured')

  const { data, error } = await supabase
    .from('psychometric_questions')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    const msg = error.message || 'Failed to fetch question.'
    throw new Error(`${msg}`)
  }

  return data as QuestionRow | null
}

/**
 * Create a new question
 */
export async function createQuestion(question: QuestionInput): Promise<QuestionRow> {
  if (!supabase) throw new Error('Supabase not configured')

  // Get the next order_index for this type if not provided
  if (question.order_index === undefined || question.order_index === null) {
    const { data: existing } = await supabase
      .from('psychometric_questions')
      .select('order_index')
      .eq('type', question.type)
      .eq('is_active', true)
      .order('order_index', { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle()

    question.order_index = existing?.order_index ? existing.order_index + 1 : 1
  }

  const { data, error } = await supabase
    .from('psychometric_questions')
    .insert({
      text: question.text.trim(),
      type: question.type,
      order_index: question.order_index,
      is_active: question.is_active ?? true,
    })
    .select('*')
    .single()

  if (error) {
    const msg = error.message || 'Failed to create question.'
    const lower = msg.toLowerCase()
    const hint =
      lower.includes('row-level security') || lower.includes('permission denied')
        ? ' (RLS blocked write. Add INSERT/UPDATE policies for teachers on public.psychometric_questions.)'
        : lower.includes('relation') && lower.includes('does not exist')
          ? ' (Table missing. Create public.psychometric_questions table in Supabase SQL editor.)'
          : ''
    throw new Error(`${msg}${hint}`)
  }

  return data as QuestionRow
}

/**
 * Update an existing question
 */
export async function updateQuestion(id: number, updates: Partial<QuestionInput>): Promise<QuestionRow> {
  if (!supabase) throw new Error('Supabase not configured')

  const updateData: Partial<QuestionRow> = {
    updated_at: new Date().toISOString(),
  }

  if (updates.text !== undefined) {
    updateData.text = updates.text.trim()
  }
  if (updates.type !== undefined) {
    updateData.type = updates.type
  }
  if (updates.order_index !== undefined) {
    updateData.order_index = updates.order_index
  }
  if (updates.is_active !== undefined) {
    updateData.is_active = updates.is_active
  }

  const { data, error } = await supabase
    .from('psychometric_questions')
    .update(updateData)
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    const msg = error.message || 'Failed to update question.'
    throw new Error(`${msg}`)
  }

  return data as QuestionRow
}

/**
 * Delete a question (soft delete by setting is_active to false)
 */
export async function deleteQuestion(id: number): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured')

  const { error } = await supabase
    .from('psychometric_questions')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    const msg = error.message || 'Failed to delete question.'
    throw new Error(`${msg}`)
  }
}

/**
 * Hard delete a question (permanently remove from database)
 */
export async function hardDeleteQuestion(id: number): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured')

  const { error } = await supabase.from('psychometric_questions').delete().eq('id', id)

  if (error) {
    const msg = error.message || 'Failed to delete question.'
    throw new Error(`${msg}`)
  }
}
