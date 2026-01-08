import { supabase } from './supabaseClient'

export type JobRole = {
  title: string
  description: string
  image_url?: string | null
}

export type CourseRow = {
  id: number
  riasec_type: 'R' | 'I' | 'A' | 'S' | 'E' | 'C'
  course_name: string
  focus_description: string
  what_you_learn: string[]
  tools_and_skills: string[]
  example_job_roles: JobRole[]
  course_image_url?: string | null
  order_index?: number | null
  is_active?: boolean
  created_at?: string
  updated_at?: string
  work_projects?: string
  work_labs?: string
  work_collaboration?: string
}

export type CourseInput = Omit<CourseRow, 'id' | 'created_at' | 'updated_at'>

/**
 * Fetch all active courses for a specific RIASEC type
 */
export async function fetchCoursesByType(riasecType: 'R' | 'I' | 'A' | 'S' | 'E' | 'C'): Promise<CourseRow[]> {
  if (!supabase) throw new Error('Supabase not configured')

  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('riasec_type', riasecType)
    .eq('is_active', true)
    .order('order_index', { ascending: true, nullsFirst: false })
    .order('id', { ascending: true })

  if (error) {
    const msg = error.message || 'Failed to fetch courses.'
    throw new Error(`${msg} (Check table "courses" + RLS policies.)`)
  }

  return (data as CourseRow[]) || []
}

/**
 * Fetch all courses (including inactive/drafts) for a specific RIASEC type - for teachers
 */
export async function fetchCoursesByTypeForTeachers(riasecType: 'R' | 'I' | 'A' | 'S' | 'E' | 'C'): Promise<CourseRow[]> {
  if (!supabase) throw new Error('Supabase not configured')

  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('riasec_type', riasecType)
    .order('order_index', { ascending: true, nullsFirst: false })
    .order('id', { ascending: true })

  if (error) {
    const msg = error.message || 'Failed to fetch courses.'
    throw new Error(`${msg} (Check table "courses" + RLS policies.)`)
  }

  return (data as CourseRow[]) || []
}

/**
 * Fetch all active courses (all RIASEC types)
 */
export async function fetchAllCourses(): Promise<CourseRow[]> {
  if (!supabase) throw new Error('Supabase not configured')

  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('is_active', true)
    .order('riasec_type', { ascending: true })
    .order('order_index', { ascending: true, nullsFirst: false })
    .order('id', { ascending: true })

  if (error) {
    const msg = error.message || 'Failed to fetch courses.'
    throw new Error(`${msg} (Check table "courses" + RLS policies.)`)
  }

  return (data as CourseRow[]) || []
}

/**
 * Fetch all courses (including inactive) for teachers
 */
export async function fetchAllCoursesForTeachers(): Promise<CourseRow[]> {
  if (!supabase) throw new Error('Supabase not configured')

  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('riasec_type', { ascending: true })
    .order('order_index', { ascending: true, nullsFirst: false })
    .order('id', { ascending: true })

  if (error) {
    const msg = error.message || 'Failed to fetch courses.'
    throw new Error(`${msg} (Check table "courses" + RLS policies.)`)
  }

  return (data as CourseRow[]) || []
}

/**
 * Fetch a single course by ID
 */
export async function fetchCourse(id: number): Promise<CourseRow | null> {
  if (!supabase) throw new Error('Supabase not configured')

  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    const msg = error.message || 'Failed to fetch course.'
    throw new Error(`${msg}`)
  }

  return data as CourseRow | null
}

/**
 * Create a new course
 */
export async function createCourse(course: CourseInput): Promise<CourseRow> {
  if (!supabase) throw new Error('Supabase not configured')

  // Get the next order_index for this RIASEC type if not provided
  if (course.order_index === undefined || course.order_index === null) {
    const { data: existing } = await supabase
      .from('courses')
      .select('order_index')
      .eq('riasec_type', course.riasec_type)
      .eq('is_active', true)
      .order('order_index', { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle()

    course.order_index = existing?.order_index ? existing.order_index + 1 : 1
  }

  const { data, error } = await supabase
    .from('courses')
    .insert({
      riasec_type: course.riasec_type,
      course_name: course.course_name.trim(),
      focus_description: course.focus_description.trim(),
      what_you_learn: course.what_you_learn || [],
      tools_and_skills: course.tools_and_skills || [],
      example_job_roles: course.example_job_roles || [],
      course_image_url: course.course_image_url || null,
      order_index: course.order_index,
      is_active: course.is_active ?? true,
      work_projects: course.work_projects,
      work_labs: course.work_labs,
      work_collaboration: course.work_collaboration,
    })
    .select('*')
    .single()

  if (error) {
    const msg = error.message || 'Failed to create course.'
    const lower = msg.toLowerCase()
    let hint = ''
    if (lower.includes('row-level security') || lower.includes('permission denied')) {
      hint = ' (RLS blocked write. Add INSERT/UPDATE policies for teachers on public.courses.)'
    } else if (lower.includes('relation') && lower.includes('does not exist')) {
      hint = ' (Table missing. Create public.courses table in Supabase SQL editor.)'
    } else if (lower.includes('column') && (lower.includes('does not exist') || lower.includes('not found'))) {
      hint = ' (Column missing or has different name. Check database schema - column might need to be added or renamed.)'
    }
    throw new Error(`${msg}${hint}`)
  }

  return data as CourseRow
}

/**
 * Update an existing course
 */
export async function updateCourse(id: number, updates: Partial<CourseInput>): Promise<CourseRow> {
  if (!supabase) throw new Error('Supabase not configured')

  const updateData: Partial<CourseRow> = {
    updated_at: new Date().toISOString(),
  }

  if (updates.riasec_type !== undefined) {
    updateData.riasec_type = updates.riasec_type
  }
  if (updates.course_name !== undefined) {
    updateData.course_name = updates.course_name.trim()
  }
  if (updates.focus_description !== undefined) {
    updateData.focus_description = updates.focus_description.trim()
  }
  if (updates.what_you_learn !== undefined) {
    updateData.what_you_learn = updates.what_you_learn
  }
  if (updates.tools_and_skills !== undefined) {
    updateData.tools_and_skills = updates.tools_and_skills
  }
  if (updates.example_job_roles !== undefined) {
    updateData.example_job_roles = updates.example_job_roles
  }
  if (updates.course_image_url !== undefined) {
    updateData.course_image_url = updates.course_image_url
  }
  if (updates.order_index !== undefined) {
    updateData.order_index = updates.order_index
  }
  if (updates.is_active !== undefined) {
    updateData.is_active = updates.is_active
  }
  if (updates.work_projects !== undefined) {
    updateData.work_projects = updates.work_projects
  }
  if (updates.work_labs !== undefined) {
    updateData.work_labs = updates.work_labs
  }
  if (updates.work_collaboration !== undefined) {
    updateData.work_collaboration = updates.work_collaboration
  }

  const { data, error } = await supabase
    .from('courses')
    .update(updateData)
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    const msg = error.message || 'Failed to update course.'
    throw new Error(`${msg}`)
  }

  return data as CourseRow
}

/**
 * Delete a course (soft delete by setting is_active to false)
 */
export async function deleteCourse(id: number): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured')

  const { error } = await supabase
    .from('courses')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    const msg = error.message || 'Failed to delete course.'
    throw new Error(`${msg}`)
  }
}

/**
 * Hard delete a course (permanently remove from database)
 */
export async function hardDeleteCourse(id: number): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured')

  const { error } = await supabase.from('courses').delete().eq('id', id)

  if (error) {
    const msg = error.message || 'Failed to delete course.'
    throw new Error(`${msg}`)
  }
}

/**
 * Convert CourseRow to the format expected by the UI
 */
export function courseRowToUI(course: CourseRow): {
  courseName: string
  focusDescription: string
  whatYouLearn: string[]
  toolsAndSkills: string[]
  exampleJobRoles: JobRole[]
  courseImageUrl?: string | null
  workProjects?: string
  workLabs?: string
  workCollaboration?: string
} {
  return {
    courseName: course.course_name,
    focusDescription: course.focus_description,
    whatYouLearn: course.what_you_learn,
    toolsAndSkills: course.tools_and_skills,
    exampleJobRoles: course.example_job_roles,
    courseImageUrl: course.course_image_url,
    workProjects: course.work_projects,
    workLabs: course.work_labs,
    workCollaboration: course.work_collaboration,
  }
}

/**
 * Convert UI format to CourseInput
 */
export function uiToCourseInput(
  riasecType: 'R' | 'I' | 'A' | 'S' | 'E' | 'C',
  uiCourse: {
    courseName: string
    focusDescription: string
    whatYouLearn: string[]
    toolsAndSkills: string[]
    exampleJobRoles: JobRole[]
    courseImageUrl?: string | null
    workProjects?: string
    workLabs?: string
    workCollaboration?: string
  },
): CourseInput {
  return {
    riasec_type: riasecType,
    course_name: uiCourse.courseName,
    focus_description: uiCourse.focusDescription,
    what_you_learn: uiCourse.whatYouLearn,
    tools_and_skills: uiCourse.toolsAndSkills,
    example_job_roles: uiCourse.exampleJobRoles,
    course_image_url: uiCourse.courseImageUrl || null,
    is_active: true,
    work_projects: uiCourse.workProjects,
    work_labs: uiCourse.workLabs,
    work_collaboration: uiCourse.workCollaboration,
  }
}

/**
 * Upload a course image to Supabase Storage
 * @param file - The image file to upload
 * @param courseId - Optional course ID for updating existing course images
 * @returns The public URL of the uploaded image
 */
export async function uploadCourseImage(file: File, courseId?: number): Promise<string> {
  if (!supabase) throw new Error('Supabase not configured')

  const bucket = 'courses'
  const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
  const fileName = courseId 
    ? `course-${courseId}-${Date.now()}.${ext}`
    : `course-${Date.now()}.${ext}`
  const path = fileName

  const { error: uploadErr } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true, cacheControl: '3600' })

  if (uploadErr) {
    const msg = uploadErr.message || 'Failed to upload course image.'
    const lower = msg.toLowerCase()
    const hint =
      lower.includes('bucket') || lower.includes('not found')
        ? ` (Check your Storage bucket name. Current: "${bucket}". Ensure the "courses" bucket exists in Supabase Storage.)`
        : lower.includes('row-level security') || lower.includes('permission denied')
          ? ` (Storage RLS blocked upload. Add Storage INSERT/UPDATE policies for bucket "${bucket}".)`
          : ''
    throw new Error(`${msg}${hint}`)
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}
