import { useEffect, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { Card } from '../components/ui/Card'
import { IconPlus, IconEdit, IconTrash, IconX, IconChevronUp, IconChevronDown } from '../components/icons'
import { cn } from '../lib/cn'
import { useTheme } from '../context/ThemeContext'
import {
  fetchCoursesByTypeForTeachers,
  createCourse,
  updateCourse,
  hardDeleteCourse,
  courseRowToUI,
  uiToCourseInput,
  uploadCourseImage,
  type CourseRow,
} from '../lib/coursesRepo'
import { supabase } from '../lib/supabaseClient'
import { generateMockAIContent, ENABLE_AI_ASSIST } from '../utils/mockAIAssist'

type UICourse = {
  courseName: string
  focusDescription: string
  whatYouLearn: string[]
  toolsAndSkills: string[]
  exampleJobRoles: Array<{ title: string; description: string }>
}

export function TeacherCoursesPage() {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const [selectedRiasecType, setSelectedRiasecType] = useState<'R' | 'I' | 'A' | 'S' | 'E' | 'C'>('R')
  const [courses, setCourses] = useState<CourseRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<UICourse>({
    courseName: '',
    focusDescription: '',
    whatYouLearn: [],
    toolsAndSkills: [],
    exampleJobRoles: [],
  })
  const [formRiasecType, setFormRiasecType] = useState<'R' | 'I' | 'A' | 'S' | 'E' | 'C' | null>(null)
  const [newLearnItem, setNewLearnItem] = useState('')
  const [newToolItem, setNewToolItem] = useState('')
  const [newJobTitle, setNewJobTitle] = useState('')
  const [newJobDescription, setNewJobDescription] = useState('')
  const [newJobImageFile, setNewJobImageFile] = useState<File | null>(null)
  const [newJobImagePreview, setNewJobImagePreview] = useState<string | null>(null)
  const [jobRoleImageFiles, setJobRoleImageFiles] = useState<Map<number, File>>(new Map())
  const [courseImageFile, setCourseImageFile] = useState<File | null>(null)
  const [courseImagePreview, setCourseImagePreview] = useState<string | null>(null)
  const [courseImageUrl, setCourseImageUrl] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)

  const riasecTypes: Array<{ value: 'R' | 'I' | 'A' | 'S' | 'E' | 'C'; label: string }> = [
    { value: 'R', label: 'Realistic' },
    { value: 'I', label: 'Investigative' },
    { value: 'A', label: 'Artistic' },
    { value: 'S', label: 'Social' },
    { value: 'E', label: 'Enterprising' },
    { value: 'C', label: 'Conventional' },
  ]

  // Load courses from database when RIASEC type changes
  useEffect(() => {
    loadCourses()
  }, [selectedRiasecType])

  async function loadCourses() {
    setLoading(true)
    setError('')
    try {
      const data = await fetchCoursesByTypeForTeachers(selectedRiasecType)
      setCourses(data)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load courses.'
      setError(msg)
      console.error('Error loading courses:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRiasecTypeChange = (type: 'R' | 'I' | 'A' | 'S' | 'E' | 'C') => {
    setSelectedRiasecType(type)
    setEditingId(null)
    setShowAddForm(false)
    // loadCourses will be triggered by useEffect
  }

  async function handleAdd(isActive: boolean) {
    if (!formData.courseName?.trim() || !formData.focusDescription?.trim() || !formRiasecType) return
    setSaving(true)
    setError('')
    try {
      let imageUrl = courseImageUrl
      
      // Upload image if a new file was selected
      if (courseImageFile) {
        setUploadingImage(true)
        try {
          imageUrl = await uploadCourseImage(courseImageFile)
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Failed to upload image.'
          setError(msg)
          setUploadingImage(false)
          setSaving(false)
          return
        } finally {
          setUploadingImage(false)
        }
      }

      // Upload job role images that have files
      const jobRolesWithImages = await Promise.all(
        formData.exampleJobRoles.map(async (role, idx) => {
          const imageFile = jobRoleImageFiles.get(idx)
          if (imageFile) {
            // Create course first to get ID, then upload images
            // For now, we'll upload after course creation
            return role
          }
          return role
        })
      )

      const courseInput = uiToCourseInput(formRiasecType, { ...formData, courseImageUrl: imageUrl })
      courseInput.is_active = isActive
      const createdCourse = await createCourse(courseInput)
      
      // Upload job role images after course is created
      const finalJobRoles = await Promise.all(
        formData.exampleJobRoles.map(async (role, idx) => {
          const imageFile = jobRoleImageFiles.get(idx)
          if (imageFile) {
            try {
              const uploadedUrl = await uploadJobRoleImage(imageFile, createdCourse.id, idx)
              return { ...role, image_url: uploadedUrl }
            } catch (err) {
              console.error(`Failed to upload image for job role ${idx}:`, err)
              return role
            }
          }
          return role
        })
      )
      
      // Update course with final job role URLs
      if (jobRoleImageFiles.size > 0) {
        await updateCourse(createdCourse.id, {
          ...courseInput,
          example_job_roles: finalJobRoles,
        })
      }
      setFormData({
        courseName: '',
        focusDescription: '',
        whatYouLearn: [],
        toolsAndSkills: [],
        exampleJobRoles: [],
      })
      setFormRiasecType(null)
      setCourseImageUrl(null)
      setCourseImagePreview(null)
      setCourseImageFile(null)
      setShowAddForm(false)
      // Switch to the RIASEC type of the newly created course
      setSelectedRiasecType(formRiasecType)
      await loadCourses() // Reload to get the new course with ID
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create course.'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  function handleEdit(id: number) {
    const course = courses.find((c) => c.id === id)
    if (course) {
      const uiCourse = courseRowToUI(course)
      setFormData(uiCourse)
      setFormRiasecType(course.riasec_type)
      setCourseImageUrl(course.course_image_url || null)
      setCourseImagePreview(course.course_image_url || null)
      setCourseImageFile(null)
      setEditingId(id)
      setShowAddForm(true)
    }
  }

  async function handleUpdate(isActive: boolean) {
    if (!formData.courseName?.trim() || !formData.focusDescription?.trim() || editingId === null) return
    setSaving(true)
    setError('')
    try {
      let imageUrl = courseImageUrl
      
      // Upload image if a new file was selected
      if (courseImageFile) {
        setUploadingImage(true)
        try {
          imageUrl = await uploadCourseImage(courseImageFile, editingId)
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Failed to upload image.'
          setError(msg)
          setUploadingImage(false)
          setSaving(false)
          return
        } finally {
          setUploadingImage(false)
        }
      }

      // Upload job role images that have files
      const finalJobRoles = await Promise.all(
        formData.exampleJobRoles.map(async (role, idx) => {
          const imageFile = jobRoleImageFiles.get(idx)
          if (imageFile) {
            try {
              const uploadedUrl = await uploadJobRoleImage(imageFile, editingId, idx)
              return { ...role, image_url: uploadedUrl }
            } catch (err) {
              console.error(`Failed to upload image for job role ${idx}:`, err)
              return role
            }
          }
          // If role has a data URL (from preview), keep it as is (it's already uploaded or existing)
          return role
        })
      )

      const courseInput = uiToCourseInput(selectedRiasecType, { 
        ...formData, 
        courseImageUrl: imageUrl,
        exampleJobRoles: finalJobRoles,
      })
      courseInput.is_active = isActive
      await updateCourse(editingId, courseInput)
      setEditingId(null)
      setFormData({
        courseName: '',
        focusDescription: '',
        whatYouLearn: [],
        toolsAndSkills: [],
        exampleJobRoles: [],
      })
      setCourseImageUrl(null)
      setCourseImagePreview(null)
      setCourseImageFile(null)
      setNewJobImageFile(null)
      setNewJobImagePreview(null)
      setJobRoleImageFiles(new Map())
      setShowAddForm(false)
      await loadCourses() // Reload to get updated data
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update course.'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Are you sure you want to permanently delete this course? This action cannot be undone.')) return
    setError('')
    try {
      await hardDeleteCourse(id)
      await loadCourses() // Reload to reflect deletion
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete course.'
      setError(msg)
    }
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setEditingId(null)
    setFormData({
      courseName: '',
      focusDescription: '',
      whatYouLearn: [],
      toolsAndSkills: [],
      exampleJobRoles: [],
    })
    setFormRiasecType(null)
    setCourseImageUrl(null)
    setCourseImagePreview(null)
    setCourseImageFile(null)
    setNewLearnItem('')
    setNewToolItem('')
    setNewJobTitle('')
    setNewJobDescription('')
    setNewJobImageFile(null)
    setNewJobImagePreview(null)
    setJobRoleImageFiles(new Map())
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setCourseImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setCourseImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  function handleRemoveImage() {
    setCourseImageFile(null)
    setCourseImagePreview(null)
    setCourseImageUrl(null)
  }

  const addLearnItem = () => {
    if (newLearnItem.trim()) {
      setFormData({
        ...formData,
        whatYouLearn: [...formData.whatYouLearn, newLearnItem.trim()],
      })
      setNewLearnItem('')
    }
  }

  const removeLearnItem = (index: number) => {
    setFormData({
      ...formData,
      whatYouLearn: formData.whatYouLearn.filter((_, i) => i !== index),
    })
  }

  const moveLearnItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === formData.whatYouLearn.length - 1) return

    const newItems = [...formData.whatYouLearn]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    ;[newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]]

    setFormData({
      ...formData,
      whatYouLearn: newItems,
    })
  }

  const addToolItem = () => {
    if (newToolItem.trim()) {
      setFormData({
        ...formData,
        toolsAndSkills: [...formData.toolsAndSkills, newToolItem.trim()],
      })
      setNewToolItem('')
    }
  }

  const removeToolItem = (index: number) => {
    setFormData({
      ...formData,
      toolsAndSkills: formData.toolsAndSkills.filter((_, i) => i !== index),
    })
  }

  const moveToolItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === formData.toolsAndSkills.length - 1) return

    const newItems = [...formData.toolsAndSkills]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    ;[newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]]

    setFormData({
      ...formData,
      toolsAndSkills: newItems,
    })
  }

  async function uploadJobRoleImage(file: File, courseId: number, jobIndex: number): Promise<string> {
    if (!supabase) throw new Error('Supabase not configured')
    
    const bucket = 'courses'
    const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
    const fileName = `course-${courseId}-job-${jobIndex}-${Date.now()}.${ext}`
    const path = fileName

    const { error: uploadErr } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true, cacheControl: '3600' })

    if (uploadErr) {
      const msg = uploadErr.message || 'Failed to upload job role image.'
      throw new Error(`${msg} (Check Storage bucket "courses" exists and has proper RLS policies.)`)
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  }

  const addJobRole = () => {
    if (newJobTitle.trim() && newJobDescription.trim()) {
      const newIndex = formData.exampleJobRoles.length
      
      // Store image file if provided
      if (newJobImageFile) {
        const newMap = new Map(jobRoleImageFiles)
        newMap.set(newIndex, newJobImageFile)
        setJobRoleImageFiles(newMap)
      }
      
      setFormData({
        ...formData,
        exampleJobRoles: [
          ...formData.exampleJobRoles,
          { 
            title: newJobTitle.trim(), 
            description: newJobDescription.trim(),
            image_url: newJobImagePreview || null, // Preview URL for display
          },
        ],
      })
      setNewJobTitle('')
      setNewJobDescription('')
      setNewJobImageFile(null)
      setNewJobImagePreview(null)
    }
  }

  function handleJobImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setNewJobImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewJobImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  function handleRemoveNewJobImage() {
    setNewJobImageFile(null)
    setNewJobImagePreview(null)
  }

  function handleJobImageChangeExisting(e: React.ChangeEvent<HTMLInputElement>, index: number) {
    const file = e.target.files?.[0]
    if (file) {
      // Store the file for upload on save
      const newMap = new Map(jobRoleImageFiles)
      newMap.set(index, file)
      setJobRoleImageFiles(newMap)
      
      // Show preview
      const reader = new FileReader()
      reader.onloadend = () => {
        const updatedRoles = [...formData.exampleJobRoles]
        updatedRoles[index] = {
          ...updatedRoles[index],
          image_url: reader.result as string, // Preview URL
        }
        setFormData({
          ...formData,
          exampleJobRoles: updatedRoles,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  function handleRemoveJobRoleImage(index: number) {
    // Remove file from map
    const newMap = new Map(jobRoleImageFiles)
    newMap.delete(index)
    setJobRoleImageFiles(newMap)
    
    // Remove preview from role
    const updatedRoles = [...formData.exampleJobRoles]
    updatedRoles[index] = {
      ...updatedRoles[index],
      image_url: null,
    }
    setFormData({
      ...formData,
      exampleJobRoles: updatedRoles,
    })
  }

  const removeJobRole = (index: number) => {
    setFormData({
      ...formData,
      exampleJobRoles: formData.exampleJobRoles.filter((_, i) => i !== index),
    })
  }

  const moveJobRole = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === formData.exampleJobRoles.length - 1) return

    const newItems = [...formData.exampleJobRoles]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    ;[newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]]

    setFormData({
      ...formData,
      exampleJobRoles: newItems,
    })
  }

  async function handleAIGenerate() {
    if (!formRiasecType || !formData.courseName.trim()) return

    setIsGeneratingAI(true)
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    const generated = generateMockAIContent(formData.courseName, formRiasecType)

    setFormData(prev => ({
      ...prev,
      focusDescription: generated.focusDescription,
      whatYouLearn: generated.learningOutcomes,
      toolsAndSkills: generated.toolsAndSkills,
      exampleJobRoles: generated.exampleJobRoles.map(role => ({
        title: role,
        description: 'Suggested role based on course focus.'
      }))
    }))

    setIsGeneratingAI(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Courses & Learning Paths"
        subtitle="Create and edit course recommendations for each RIASEC type. Changes are saved to the database."
      />

      {/* Error Message */}
      {error && (
        <div className={cn(
          'rounded-xl border px-4 py-3 text-base font-medium',
          isLight 
            ? 'border-rose-300 bg-rose-50 text-rose-800' 
            : 'border-rose-500/20 bg-rose-500/10 text-rose-200'
        )}>
          {error}
        </div>
      )}

      {/* RIASEC Type Selector */}
      <Card>
        <div className="space-y-3">
          <label className={cn('block text-base font-medium', isLight ? 'text-slate-700' : 'text-slate-300')}>Select RIASEC Type</label>
          <div className="flex flex-wrap gap-2">
            {riasecTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => handleRiasecTypeChange(type.value)}
                disabled={loading}
                className={cn(
                  'rounded-xl px-4 py-2 text-base font-semibold transition',
                  selectedRiasecType === type.value
                    ? isLight
                      ? 'bg-blue-100 text-blue-900 ring-1 ring-blue-300'
                      : 'bg-blue-600/20 text-blue-100 ring-1 ring-blue-500/25'
                    : isLight
                      ? 'bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50'
                      : 'bg-slate-950/40 text-slate-300 ring-1 ring-slate-800/70 hover:bg-slate-900/60',
                  loading && 'opacity-50 cursor-not-allowed',
                )}
              >
                {type.label} ({type.value})
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card>
          <div className={cn('py-8 text-center text-base', isLight ? 'text-slate-600' : 'text-slate-400')}>Loading courses...</div>
        </Card>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card>
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800/70 pb-4">
              <div>
                <h3 className={cn('text-2xl font-semibold', isLight ? 'text-slate-900' : 'text-slate-100')}>
                  {editingId !== null ? 'Edit Course' : 'Add New Course'}
                </h3>
                <p className={cn('mt-1 text-base', isLight ? 'text-slate-600' : 'text-slate-400')}>
                  {editingId !== null ? 'Update course information below' : 'Fill in the course details below'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 transition"
              >
                <IconX size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Basic Info */}
              <div className="space-y-6">
                {/* RIASEC Type - Only show when adding new course */}
                {editingId === null && (
                  <div>
                    <label className={cn('mb-2 block text-base font-semibold', isLight ? 'text-slate-700' : 'text-slate-200')}>
                      RIASEC Type <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={formRiasecType || ''}
                      onChange={(e) => setFormRiasecType(e.target.value as 'R' | 'I' | 'A' | 'S' | 'E' | 'C')}
                      className={cn(
                        'w-full rounded-xl border px-4 py-3 text-base focus:ring-2 transition',
                        isLight
                          ? 'border-slate-300 bg-white text-slate-900 focus:ring-blue-500/30 focus:border-blue-500'
                          : 'border-slate-800/70 bg-slate-950/40 text-slate-200 focus:ring-blue-500/50 focus:border-blue-500/50'
                      )}
                    >
                      <option value="">Select RIASEC type...</option>
                      {riasecTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label} ({type.value})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Course Name */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={cn('block text-base font-semibold', isLight ? 'text-slate-700' : 'text-slate-200')}>
                      Course Name <span className="text-rose-400">*</span>
                    </label>
                    {ENABLE_AI_ASSIST && (
                      <button
                        type="button"
                        onClick={handleAIGenerate}
                        disabled={isGeneratingAI || !formData.courseName.trim() || !formRiasecType}
                        className={cn(
                          'flex items-center gap-2 rounded-lg px-3 py-1 text-sm font-semibold transition',
                          isLight
                            ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 disabled:bg-slate-100 disabled:text-slate-400'
                            : 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 disabled:bg-slate-800/50 disabled:text-slate-600'
                        )}
                      >
                        {isGeneratingAI ? (
                          <>
                            <span className="animate-spin">⏳</span> AI Generating...
                          </>
                        ) : (
                          <>
                            🤖 AI Generate
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={formData.courseName}
                    onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                    className={cn(
                      'w-full rounded-xl border px-4 py-3 text-base focus:ring-2 transition',
                      isLight
                        ? 'border-slate-300 bg-white text-slate-900 focus:ring-blue-500/30 focus:border-blue-500'
                        : 'border-slate-800/70 bg-slate-950/40 text-slate-200 focus:ring-blue-500/50 focus:border-blue-500/50'
                    )}
                    placeholder="e.g., Data Science & Analytics"
                  />
                  {ENABLE_AI_ASSIST && (
                    <p className={cn('mt-2 text-sm', isLight ? 'text-slate-500' : 'text-slate-500')}>
                      AI Assist helps draft content for writing inspiration. Please review and edit before saving.
                    </p>
                  )}
                </div>

                {/* Course Image */}
                <div>
                  <label className={cn('mb-2 block text-base font-semibold', isLight ? 'text-slate-700' : 'text-slate-200')}>
                    Course Image (Optional)
                  </label>
                  {courseImagePreview || courseImageUrl ? (
                    <div className="relative">
                      <img
                        src={courseImagePreview || courseImageUrl || ''}
                        alt="Course preview"
                        className={cn(
                          'h-48 w-full rounded-xl border object-cover',
                          isLight ? 'border-slate-300' : 'border-slate-800/70'
                        )}
                      />
                      <div className="absolute right-2 top-2 flex gap-2">
                        <label className={cn(
                          'cursor-pointer rounded-lg p-2 transition disabled:opacity-50',
                          isLight
                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            : 'bg-blue-600/20 text-blue-200 hover:bg-blue-600/30'
                        )}>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            disabled={uploadingImage || saving}
                            className="hidden"
                          />
                          <IconEdit size={16} />
                        </label>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          disabled={uploadingImage || saving}
                          className={cn(
                            'rounded-lg p-2 transition disabled:opacity-50',
                            isLight
                              ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                              : 'bg-rose-600/20 text-rose-200 hover:bg-rose-600/30'
                          )}
                        >
                          <IconX size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className={cn(
                      'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition',
                      isLight
                        ? 'border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100'
                        : 'border-slate-800/70 bg-slate-950/40 hover:border-slate-700/70 hover:bg-slate-950/60'
                    )}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={uploadingImage || saving}
                        className="hidden"
                      />
                      <div className="text-center">
                        <div className={cn('mb-2 text-base', isLight ? 'text-slate-600' : 'text-slate-400')}>Click to upload image</div>
                        <div className={cn('text-sm', isLight ? 'text-slate-500' : 'text-slate-500')}>PNG, JPG up to 5MB</div>
                      </div>
                    </label>
                  )}
                </div>

                {/* Focus Description */}
                <div>
                    <label className={cn('mb-2 block text-base font-semibold', isLight ? 'text-slate-700' : 'text-slate-200')}>
                      Focus Description <span className="text-rose-400">*</span>
                    </label>
                  <textarea
                    value={formData.focusDescription}
                    onChange={(e) => setFormData({ ...formData, focusDescription: e.target.value })}
                    rows={5}
                    className={cn(
                      'w-full rounded-xl border px-4 py-3 text-base focus:ring-2 transition resize-none',
                      isLight
                        ? 'border-slate-300 bg-white text-slate-900 focus:ring-blue-500/30 focus:border-blue-500'
                        : 'border-slate-800/70 bg-slate-950/40 text-slate-200 focus:ring-blue-500/50 focus:border-blue-500/50'
                    )}
                    placeholder="Describe what this course focuses on..."
                  />
                </div>
              </div>

              {/* Right Column - Lists */}
              <div className="space-y-6">
                {/* What You'll Learn */}
                <div
                  className={cn(
                    'rounded-xl border p-4',
                    isLight ? 'border-slate-200 bg-white' : 'border-slate-800/70 bg-slate-950/30',
                  )}
                >
                  <label className={cn('mb-3 block text-lg font-semibold', isLight ? 'text-slate-800' : 'text-slate-200')}>
                    What You'll Learn ({formData.whatYouLearn.length})
                  </label>
                  <div className="mb-3 flex gap-2">
                    <input
                      type="text"
                      value={newLearnItem}
                      onChange={(e) => setNewLearnItem(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addLearnItem()}
                      className={cn(
                        'flex-1 rounded-lg border px-3 py-2 text-base focus:ring-2 transition',
                        isLight
                          ? 'border-slate-300 bg-white text-slate-900 focus:ring-blue-500/30 focus:border-blue-500'
                          : 'border-slate-800/70 bg-slate-950/40 text-slate-200 focus:ring-blue-500/50 focus:border-blue-500/50',
                      )}
                      placeholder="Add learning outcome..."
                    />
                    <button
                      type="button"
                      onClick={addLearnItem}
                      className={cn(
                        'rounded-lg px-4 py-2 text-base font-semibold ring-1 transition',
                        isLight
                          ? 'bg-blue-100 text-blue-900 ring-blue-300 hover:bg-blue-200'
                          : 'bg-blue-600/20 text-blue-100 ring-blue-500/25 hover:bg-blue-600/25',
                      )}
                    >
                      Add
                    </button>
                  </div>
                  {formData.whatYouLearn.length > 0 && (
                    <div className="space-y-2">
                      {formData.whatYouLearn.map((item, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            'group flex items-center gap-2 rounded-lg border p-3 transition',
                            isLight
                              ? 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                              : 'border-slate-800/70 bg-slate-950/40 hover:bg-slate-900/40',
                          )}
                        >
                          <div className="flex shrink-0 items-center gap-1">
                            <span
                              className={cn(
                                'flex h-7 w-7 items-center justify-center rounded text-sm font-semibold',
                                isLight ? 'bg-blue-100 text-blue-800' : 'bg-blue-600/20 text-blue-200',
                              )}
                            >
                              {idx + 1}
                            </span>
                            <div className="flex flex-col">
                              <button
                                type="button"
                                onClick={() => moveLearnItem(idx, 'up')}
                                disabled={idx === 0}
                                className={cn(
                                  'p-0.5 text-slate-400 hover:text-slate-200 transition',
                                  idx === 0 && 'opacity-30 cursor-not-allowed',
                                )}
                              >
                                <IconChevronUp size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveLearnItem(idx, 'down')}
                                disabled={idx === formData.whatYouLearn.length - 1}
                                className={cn(
                                  'p-0.5 text-slate-400 hover:text-slate-200 transition',
                                  idx === formData.whatYouLearn.length - 1 && 'opacity-30 cursor-not-allowed',
                                )}
                              >
                                <IconChevronDown size={12} />
                              </button>
                            </div>
                          </div>
                          <span
                            className={cn(
                              'flex-1 text-base',
                              isLight ? 'text-slate-800' : 'text-slate-300',
                            )}
                          >
                            {item}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeLearnItem(idx)}
                            className="shrink-0 rounded p-1 text-slate-400 hover:bg-rose-600/20 hover:text-rose-400 transition opacity-0 group-hover:opacity-100"
                          >
                            <IconX size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tools & Skills */}
                <div
                  className={cn(
                    'rounded-xl border p-4',
                    isLight ? 'border-slate-200 bg-white' : 'border-slate-800/70 bg-slate-950/30',
                  )}
                >
                  <label
                    className={cn(
                      'mb-3 block text-lg font-semibold',
                      isLight ? 'text-slate-800' : 'text-slate-200',
                    )}
                  >
                    Tools & Skills ({formData.toolsAndSkills.length})
                  </label>
                  <div className="mb-3 flex gap-2">
                    <input
                      type="text"
                      value={newToolItem}
                      onChange={(e) => setNewToolItem(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addToolItem()}
                      className={cn(
                        'flex-1 rounded-lg border px-3 py-2 text-base focus:ring-2 transition',
                        isLight
                          ? 'border-slate-300 bg-white text-slate-900 focus:ring-blue-500/30 focus:border-blue-500'
                          : 'border-slate-800/70 bg-slate-950/40 text-slate-200 focus:ring-blue-500/50 focus:border-blue-500/50',
                      )}
                      placeholder="Add tool or skill..."
                    />
                    <button
                      type="button"
                      onClick={addToolItem}
                      className={cn(
                        'rounded-lg px-4 py-2 text-base font-semibold ring-1 transition',
                        isLight
                          ? 'bg-blue-100 text-blue-900 ring-blue-300 hover:bg-blue-200'
                          : 'bg-blue-600/20 text-blue-100 ring-blue-500/25 hover:bg-blue-600/25',
                      )}
                    >
                      Add
                    </button>
                  </div>
                  {formData.toolsAndSkills.length > 0 && (
                    <div className="space-y-2">
                      {formData.toolsAndSkills.map((tool, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            'group flex items-center gap-2 rounded-lg border p-3 transition',
                            isLight
                              ? 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                              : 'border-slate-800/70 bg-slate-950/40 hover:bg-slate-900/40',
                          )}
                        >
                          <div className="flex shrink-0 items-center gap-1">
                            <span
                              className={cn(
                                'flex h-7 w-7 items-center justify-center rounded text-sm font-semibold',
                                isLight ? 'bg-purple-100 text-purple-800' : 'bg-purple-600/20 text-purple-200',
                              )}
                            >
                              {idx + 1}
                            </span>
                            <div className="flex flex-col">
                              <button
                                type="button"
                                onClick={() => moveToolItem(idx, 'up')}
                                disabled={idx === 0}
                                className={cn(
                                  'p-0.5 text-slate-400 hover:text-slate-200 transition',
                                  idx === 0 && 'opacity-30 cursor-not-allowed',
                                )}
                              >
                                <IconChevronUp size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveToolItem(idx, 'down')}
                                disabled={idx === formData.toolsAndSkills.length - 1}
                                className={cn(
                                  'p-0.5 text-slate-400 hover:text-slate-200 transition',
                                  idx === formData.toolsAndSkills.length - 1 && 'opacity-30 cursor-not-allowed',
                                )}
                              >
                                <IconChevronDown size={12} />
                              </button>
                            </div>
                          </div>
                          <span
                            className={cn(
                              'flex-1 text-base',
                              isLight ? 'text-slate-800' : 'text-slate-300',
                            )}
                          >
                            {tool}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeToolItem(idx)}
                            className="shrink-0 rounded p-1 text-slate-400 hover:bg-rose-600/20 hover:text-rose-400 transition opacity-0 group-hover:opacity-100"
                          >
                            <IconX size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Example Job Roles - Full Width */}
            <div
              className={cn(
                'rounded-xl border p-4',
                isLight ? 'border-slate-200 bg-white' : 'border-slate-800/70 bg-slate-950/30',
              )}
            >
              <label
                className={cn(
                  'mb-3 block text-lg font-semibold',
                  isLight ? 'text-slate-800' : 'text-slate-200',
                )}
              >
                Example Job Roles ({formData.exampleJobRoles.length})
              </label>
              <div className="mb-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={newJobTitle}
                    onChange={(e) => setNewJobTitle(e.target.value)}
                    className={cn(
                      'rounded-lg border px-3 py-2 text-base focus:ring-2 transition',
                      isLight
                        ? 'border-slate-300 bg-white text-slate-900 focus:ring-blue-500/30 focus:border-blue-500'
                        : 'border-slate-800/70 bg-slate-950/40 text-slate-200 focus:ring-blue-500/50 focus:border-blue-500/50',
                    )}
                    placeholder="Job title..."
                  />
                  <textarea
                    value={newJobDescription}
                    onChange={(e) => setNewJobDescription(e.target.value)}
                    rows={2}
                    className={cn(
                      'rounded-lg border px-3 py-2 text-base focus:ring-2 transition resize-none',
                      isLight
                        ? 'border-slate-300 bg-white text-slate-900 focus:ring-blue-500/30 focus:border-blue-500'
                        : 'border-slate-800/70 bg-slate-950/40 text-slate-200 focus:ring-blue-500/50 focus:border-blue-500/50',
                    )}
                    placeholder="Job description..."
                  />
                </div>
                {/* Job Role Image Upload */}
                <div>
                  <label
                    className={cn(
                      'mb-2 block text-base font-medium',
                      isLight ? 'text-slate-700' : 'text-slate-400',
                    )}
                  >
                    Job Image (Optional)
                  </label>
                  {newJobImagePreview ? (
                    <div className="relative">
                      <img
                        src={newJobImagePreview}
                        alt="Job preview"
                        className={cn(
                          'h-32 w-full rounded-lg border object-cover',
                          isLight ? 'border-slate-300' : 'border-slate-800/70'
                        )}
                      />
                      <div className="absolute right-2 top-2 flex gap-2">
                        <label className={cn(
                          'cursor-pointer rounded-lg p-1.5 transition disabled:opacity-50',
                          isLight
                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            : 'bg-blue-600/20 text-blue-200 hover:bg-blue-600/30'
                        )}>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleJobImageChange}
                            disabled={uploadingImage || saving}
                            className="hidden"
                          />
                          <IconEdit size={14} />
                        </label>
                        <button
                          type="button"
                          onClick={handleRemoveNewJobImage}
                          disabled={uploadingImage || saving}
                          className={cn(
                            'rounded-lg p-1.5 transition disabled:opacity-50',
                            isLight
                              ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                              : 'bg-rose-600/20 text-rose-200 hover:bg-rose-600/30'
                          )}
                        >
                          <IconX size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className={cn(
                      'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-3 transition',
                      isLight
                        ? 'border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100'
                        : 'border-slate-800/70 bg-slate-950/40 hover:border-slate-700/70 hover:bg-slate-950/60'
                    )}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleJobImageChange}
                        disabled={uploadingImage || saving}
                        className="hidden"
                      />
                      <div className="text-center">
                        <div className={cn('text-base', isLight ? 'text-slate-600' : 'text-slate-400')}>
                          Click to upload job image
                        </div>
                      </div>
                    </label>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={addJobRole}
                disabled={!newJobTitle.trim() || !newJobDescription.trim()}
                className={cn(
                  'mb-4 w-full rounded-lg px-4 py-2 text-base font-semibold ring-1 transition disabled:opacity-50 disabled:cursor-not-allowed',
                  isLight
                    ? 'bg-blue-100 text-blue-900 ring-blue-300 hover:bg-blue-200'
                    : 'bg-blue-600/20 text-blue-100 ring-blue-500/25 hover:bg-blue-600/25',
                )}
              >
                Add Job Role
              </button>
              {formData.exampleJobRoles.length > 0 && (
                <div className="space-y-2">
                  {formData.exampleJobRoles.map((role, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        'group flex items-start gap-3 rounded-lg border p-4 transition',
                        isLight
                          ? 'border-slate-200 bg-white hover:bg-slate-50'
                          : 'border-slate-800/70 bg-slate-950/40 hover:bg-slate-900/40'
                      )}
                    >
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded bg-emerald-600/20 text-xs font-semibold text-emerald-200">
                          {idx + 1}
                        </span>
                        <div className="flex flex-col">
                          <button
                            type="button"
                            onClick={() => moveJobRole(idx, 'up')}
                            disabled={idx === 0}
                            className={cn(
                              'p-0.5 text-slate-400 hover:text-slate-200 transition',
                              idx === 0 && 'opacity-30 cursor-not-allowed',
                            )}
                          >
                            <IconChevronUp size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveJobRole(idx, 'down')}
                            disabled={idx === formData.exampleJobRoles.length - 1}
                            className={cn(
                              'p-0.5 text-slate-400 hover:text-slate-200 transition',
                              idx === formData.exampleJobRoles.length - 1 && 'opacity-30 cursor-not-allowed',
                            )}
                          >
                            <IconChevronDown size={12} />
                          </button>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3">
                          {role.image_url && (
                            <img
                              src={role.image_url}
                              alt={role.title}
                              className={cn(
                                'h-16 w-16 shrink-0 rounded-lg border object-cover',
                                isLight ? 'border-slate-300' : 'border-slate-800/70'
                              )}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className={cn('font-semibold', isLight ? 'text-slate-900' : 'text-slate-200')}>{role.title}</div>
                            <div className={cn('mt-1 text-base', isLight ? 'text-slate-700' : 'text-slate-300')}>{role.description}</div>
                          </div>
                        </div>
                        {/* Image Upload/Edit for Existing Job Role */}
                        <div className="mt-2 flex gap-2">
                          {role.image_url ? (
                            <>
                              <label className={cn(
                                'cursor-pointer rounded px-2 py-1 text-sm font-medium transition disabled:opacity-50',
                                isLight
                                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                  : 'bg-blue-600/20 text-blue-200 hover:bg-blue-600/30'
                              )}>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleJobImageChangeExisting(e, idx)}
                                  disabled={uploadingImage || saving}
                                  className="hidden"
                                />
                                Change
                              </label>
                              <button
                                type="button"
                                onClick={() => handleRemoveJobRoleImage(idx)}
                                disabled={uploadingImage || saving}
                                className={cn(
                                  'rounded px-2 py-1 text-sm font-medium transition disabled:opacity-50',
                                  isLight
                                    ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                                    : 'bg-rose-600/20 text-rose-200 hover:bg-rose-600/30'
                                )}
                              >
                                Remove
                              </button>
                            </>
                          ) : (
                            <label className={cn(
                              'cursor-pointer rounded px-2 py-1 text-sm font-medium transition',
                              isLight
                                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                : 'bg-blue-600/20 text-blue-200 hover:bg-blue-600/30'
                            )}>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleJobImageChangeExisting(e, idx)}
                                disabled={uploadingImage || saving}
                                className="hidden"
                              />
                              Add image
                            </label>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeJobRole(idx)}
                        className="shrink-0 rounded p-1 text-slate-400 hover:bg-rose-600/20 hover:text-rose-400 transition opacity-0 group-hover:opacity-100"
                      >
                        <IconX size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-800/70 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className={cn(
                  'rounded-xl border px-6 py-2.5 text-base font-semibold transition',
                  isLight
                    ? 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    : 'border-slate-800/70 bg-slate-950/40 text-slate-200 hover:bg-slate-900/60'
                )}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => editingId !== null ? handleUpdate(true) : handleAdd(true)}
                disabled={saving || !formData.courseName.trim() || !formData.focusDescription.trim() || (editingId === null && !formRiasecType)}
                className={cn(
                  'rounded-xl px-6 py-2.5 text-base font-semibold ring-1 transition disabled:opacity-50 disabled:cursor-not-allowed',
                  isLight
                    ? 'bg-blue-600 text-white ring-blue-700 hover:bg-blue-700 shadow-md'
                    : 'bg-purple-600/20 text-purple-100 ring-purple-500/25 hover:bg-purple-600/25'
                )}
              >
                {saving ? 'Saving...' : editingId !== null ? 'Update as Active' : 'Save as Active'}
              </button>
              <button
                type="button"
                onClick={() => editingId !== null ? handleUpdate(false) : handleAdd(false)}
                disabled={saving || !formData.courseName.trim() || !formData.focusDescription.trim() || (editingId === null && !formRiasecType)}
                className={cn(
                  'rounded-xl px-6 py-2.5 text-base font-semibold ring-1 transition disabled:opacity-50 disabled:cursor-not-allowed',
                  isLight
                    ? 'bg-amber-500 text-white ring-amber-600 hover:bg-amber-600 shadow-md'
                    : 'bg-amber-600/20 text-amber-100 ring-amber-500/25 hover:bg-amber-600/25'
                )}
              >
                {saving ? 'Saving...' : editingId !== null ? 'Update as Draft' : 'Save as Draft'}
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Courses List - hidden while adding or editing a course */}
      {!loading && !showAddForm && editingId === null && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3
              className={cn(
                'text-base font-semibold',
                isLight ? 'text-slate-800' : 'text-slate-300',
              )}
            >
              {riasecTypes.find((t) => t.value === selectedRiasecType)?.label} Courses ({courses.length})
            </h3>
            <button
              type="button"
              onClick={() => {
                setFormRiasecType(selectedRiasecType)
                setShowAddForm(true)
              }}
              disabled={saving}
              className={cn(
                'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-base font-semibold ring-1 transition disabled:opacity-50',
                isLight
                  ? 'bg-blue-600 text-white ring-blue-700 hover:bg-blue-700 shadow-md'
                  : 'bg-purple-600/20 text-purple-100 ring-purple-500/25 hover:bg-purple-600/25'
              )}
            >
              <IconPlus size={18} />
              Add Course
            </button>
          </div>
          {courses.length === 0 ? (
            <Card>
              <div className="py-8 text-center text-sm text-slate-400">
                No courses found for {riasecTypes.find((t) => t.value === selectedRiasecType)?.label}. Add your first course above.
              </div>
            </Card>
          ) : (
            courses.map((course) => {
              const uiCourse = courseRowToUI(course)
              return (
                <Card key={course.id}>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3
                            className={cn(
                              'text-xl font-semibold',
                              isLight ? 'text-slate-900' : 'text-slate-100',
                            )}
                          >
                            {uiCourse.courseName}
                          </h3>
                          <span
                            className={cn(
                              'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
                              course.is_active
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-amber-500/20 text-amber-400',
                            )}
                          >
                            {course.is_active ? 'Active' : 'Draft'}
                          </span>
                        </div>
                        <p
                          className={cn(
                            'mt-2 text-base leading-relaxed',
                            isLight ? 'text-slate-700' : 'text-slate-300/90',
                          )}
                        >
                          {uiCourse.focusDescription}
                        </p>
                      </div>
                      <div className="ml-4 flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(course.id)}
                          className="rounded-lg p-2 text-blue-400 hover:bg-blue-600/20"
                        >
                          <IconEdit size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(course.id)}
                          className="rounded-lg p-2 text-rose-400 hover:bg-rose-600/20"
                        >
                          <IconTrash size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <div
                          className={cn(
                            'mb-2 text-sm font-semibold uppercase tracking-wide',
                            isLight ? 'text-slate-600' : 'text-slate-400',
                          )}
                        >
                          Learning Outcomes ({uiCourse.whatYouLearn.length})
                        </div>
                        <ul className="space-y-1">
                          {uiCourse.whatYouLearn.slice(0, 3).map((item, idx) => (
                            <li
                              key={idx}
                              className={cn(
                                'text-base leading-relaxed',
                                isLight ? 'text-slate-700' : 'text-slate-300',
                              )}
                            >
                              • {item}
                            </li>
                          ))}
                          {uiCourse.whatYouLearn.length > 3 && (
                            <li
                              className={cn(
                                'text-sm',
                                isLight ? 'text-slate-500' : 'text-slate-500',
                              )}
                            >
                              +{uiCourse.whatYouLearn.length - 3} more
                            </li>
                          )}
                        </ul>
                      </div>
                      <div>
                        <div
                          className={cn(
                            'mb-2 text-sm font-semibold uppercase tracking-wide',
                            isLight ? 'text-slate-600' : 'text-slate-400',
                          )}
                        >
                          Tools & Skills ({uiCourse.toolsAndSkills.length})
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {uiCourse.toolsAndSkills.slice(0, 4).map((tool, idx) => (
                            <span
                              key={idx}
                              className={cn(
                                'rounded-lg border px-2 py-1 text-sm',
                                isLight
                                  ? 'border-slate-300 bg-slate-50 text-slate-800'
                                  : 'border-slate-800/70 bg-slate-950/40 text-slate-300',
                              )}
                            >
                              {tool}
                            </span>
                          ))}
                          {uiCourse.toolsAndSkills.length > 4 && (
                            <span
                              className={cn(
                                'text-sm',
                                isLight ? 'text-slate-500' : 'text-slate-500',
                              )}
                            >
                              +{uiCourse.toolsAndSkills.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div
                        className={cn(
                          'mb-2 text-sm font-semibold uppercase tracking-wide',
                          isLight ? 'text-slate-600' : 'text-slate-400',
                        )}
                      >
                        Example Job Roles ({uiCourse.exampleJobRoles.length})
                      </div>
                      <div className="space-y-1">
                        {uiCourse.exampleJobRoles.map((role, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              'text-base leading-relaxed',
                              isLight ? 'text-slate-700' : 'text-slate-300',
                            )}
                          >
                            <span className="font-semibold">{role.title}:</span> {role.description}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
