import { useEffect, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { Card } from '../components/ui/Card'
import { IconPlus, IconEdit, IconTrash, IconX, IconChevronUp, IconChevronDown } from '../components/icons'
import { cn } from '../lib/cn'
import {
  fetchCoursesByTypeForTeachers,
  createCourse,
  updateCourse,
  hardDeleteCourse,
  courseRowToUI,
  uiToCourseInput,
  type CourseRow,
} from '../lib/coursesRepo'

type UICourse = {
  courseName: string
  focusDescription: string
  whatYouLearn: string[]
  toolsAndSkills: string[]
  exampleJobRoles: Array<{ title: string; description: string }>
}

export function TeacherCoursesPage() {
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
  const [newLearnItem, setNewLearnItem] = useState('')
  const [newToolItem, setNewToolItem] = useState('')
  const [newJobTitle, setNewJobTitle] = useState('')
  const [newJobDescription, setNewJobDescription] = useState('')

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
    if (!formData.courseName?.trim() || !formData.focusDescription?.trim()) return
    setSaving(true)
    setError('')
    try {
      const courseInput = uiToCourseInput(selectedRiasecType, formData)
      courseInput.is_active = isActive
      await createCourse(courseInput)
      setFormData({
        courseName: '',
        focusDescription: '',
        whatYouLearn: [],
        toolsAndSkills: [],
        exampleJobRoles: [],
      })
      setShowAddForm(false)
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
      setEditingId(id)
      setShowAddForm(true)
    }
  }

  async function handleUpdate(isActive: boolean) {
    if (!formData.courseName?.trim() || !formData.focusDescription?.trim() || editingId === null) return
    setSaving(true)
    setError('')
    try {
      const courseInput = uiToCourseInput(selectedRiasecType, formData)
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
    setNewLearnItem('')
    setNewToolItem('')
    setNewJobTitle('')
    setNewJobDescription('')
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

  const addJobRole = () => {
    if (newJobTitle.trim() && newJobDescription.trim()) {
      setFormData({
        ...formData,
        exampleJobRoles: [
          ...formData.exampleJobRoles,
          { title: newJobTitle.trim(), description: newJobDescription.trim() },
        ],
      })
      setNewJobTitle('')
      setNewJobDescription('')
    }
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Manage Courses & Learning Paths"
          subtitle="Create and edit course recommendations for each RIASEC type. Changes are saved to the database."
        />
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-purple-600/20 px-4 py-2.5 text-sm font-semibold text-purple-100 ring-1 ring-purple-500/25 hover:bg-purple-600/25 disabled:opacity-50"
        >
          <IconPlus size={18} />
          Add Course
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-200">
          {error}
        </div>
      )}

      {/* RIASEC Type Selector */}
      <Card>
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-300">Select RIASEC Type</label>
          <div className="flex flex-wrap gap-2">
            {riasecTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => handleRiasecTypeChange(type.value)}
                disabled={loading}
                className={cn(
                  'rounded-xl px-4 py-2 text-sm font-semibold transition',
                  selectedRiasecType === type.value
                    ? 'bg-blue-600/20 text-blue-100 ring-1 ring-blue-500/25'
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
          <div className="py-8 text-center text-sm text-slate-400">Loading courses...</div>
        </Card>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card>
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800/70 pb-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-100">
                  {editingId !== null ? 'Edit Course' : 'Add New Course'}
                </h3>
                <p className="mt-1 text-xs text-slate-400">
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
                {/* Course Name */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    Course Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.courseName}
                    onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                    className="w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-4 py-3 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
                    placeholder="e.g., Data Science & Analytics"
                  />
                </div>

                {/* Focus Description */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    Focus Description <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    value={formData.focusDescription}
                    onChange={(e) => setFormData({ ...formData, focusDescription: e.target.value })}
                    rows={5}
                    className="w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-4 py-3 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition resize-none"
                    placeholder="Describe what this course focuses on..."
                  />
                </div>
              </div>

              {/* Right Column - Lists */}
              <div className="space-y-6">
                {/* What You'll Learn */}
                <div className="rounded-xl border border-slate-800/70 bg-slate-950/30 p-4">
                  <label className="mb-3 block text-sm font-semibold text-slate-200">
                    What You'll Learn ({formData.whatYouLearn.length})
                  </label>
                  <div className="mb-3 flex gap-2">
                    <input
                      type="text"
                      value={newLearnItem}
                      onChange={(e) => setNewLearnItem(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addLearnItem()}
                      className="flex-1 rounded-lg border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
                      placeholder="Add learning outcome..."
                    />
                    <button
                      type="button"
                      onClick={addLearnItem}
                      className="rounded-lg bg-blue-600/20 px-4 py-2 text-sm font-semibold text-blue-100 ring-1 ring-blue-500/25 hover:bg-blue-600/25 transition"
                    >
                      Add
                    </button>
                  </div>
                  {formData.whatYouLearn.length > 0 && (
                    <div className="space-y-2">
                      {formData.whatYouLearn.map((item, idx) => (
                        <div
                          key={idx}
                          className="group flex items-center gap-2 rounded-lg border border-slate-800/70 bg-slate-950/40 p-3 hover:bg-slate-900/40 transition"
                        >
                          <div className="flex shrink-0 items-center gap-1">
                            <span className="flex h-6 w-6 items-center justify-center rounded bg-blue-600/20 text-xs font-semibold text-blue-200">
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
                          <span className="flex-1 text-sm text-slate-300">{item}</span>
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
                <div className="rounded-xl border border-slate-800/70 bg-slate-950/30 p-4">
                  <label className="mb-3 block text-sm font-semibold text-slate-200">
                    Tools & Skills ({formData.toolsAndSkills.length})
                  </label>
                  <div className="mb-3 flex gap-2">
                    <input
                      type="text"
                      value={newToolItem}
                      onChange={(e) => setNewToolItem(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addToolItem()}
                      className="flex-1 rounded-lg border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
                      placeholder="Add tool or skill..."
                    />
                    <button
                      type="button"
                      onClick={addToolItem}
                      className="rounded-lg bg-blue-600/20 px-4 py-2 text-sm font-semibold text-blue-100 ring-1 ring-blue-500/25 hover:bg-blue-600/25 transition"
                    >
                      Add
                    </button>
                  </div>
                  {formData.toolsAndSkills.length > 0 && (
                    <div className="space-y-2">
                      {formData.toolsAndSkills.map((tool, idx) => (
                        <div
                          key={idx}
                          className="group flex items-center gap-2 rounded-lg border border-slate-800/70 bg-slate-950/40 p-3 hover:bg-slate-900/40 transition"
                        >
                          <div className="flex shrink-0 items-center gap-1">
                            <span className="flex h-6 w-6 items-center justify-center rounded bg-purple-600/20 text-xs font-semibold text-purple-200">
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
                          <span className="flex-1 text-sm text-slate-300">{tool}</span>
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
            <div className="rounded-xl border border-slate-800/70 bg-slate-950/30 p-4">
              <label className="mb-3 block text-sm font-semibold text-slate-200">
                Example Job Roles ({formData.exampleJobRoles.length})
              </label>
              <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newJobTitle}
                  onChange={(e) => setNewJobTitle(e.target.value)}
                  className="rounded-lg border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
                  placeholder="Job title..."
                />
                <textarea
                  value={newJobDescription}
                  onChange={(e) => setNewJobDescription(e.target.value)}
                  rows={2}
                  className="rounded-lg border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition resize-none"
                  placeholder="Job description..."
                />
              </div>
              <button
                type="button"
                onClick={addJobRole}
                disabled={!newJobTitle.trim() || !newJobDescription.trim()}
                className="mb-4 w-full rounded-lg bg-blue-600/20 px-4 py-2 text-sm font-semibold text-blue-100 ring-1 ring-blue-500/25 hover:bg-blue-600/25 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Job Role
              </button>
              {formData.exampleJobRoles.length > 0 && (
                <div className="space-y-2">
                  {formData.exampleJobRoles.map((role, idx) => (
                    <div
                      key={idx}
                      className="group flex items-start gap-3 rounded-lg border border-slate-800/70 bg-slate-950/40 p-4 hover:bg-slate-900/40 transition"
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
                        <div className="font-semibold text-slate-200">{role.title}</div>
                        <div className="mt-1 text-sm text-slate-300">{role.description}</div>
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
                className="rounded-xl border border-slate-800/70 bg-slate-950/40 px-6 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-900/60 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => editingId !== null ? handleUpdate(true) : handleAdd(true)}
                disabled={saving || !formData.courseName.trim() || !formData.focusDescription.trim()}
                className="rounded-xl bg-purple-600/20 px-6 py-2.5 text-sm font-semibold text-purple-100 ring-1 ring-purple-500/25 hover:bg-purple-600/25 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {saving ? 'Saving...' : editingId !== null ? 'Update as Active' : 'Save as Active'}
              </button>
              <button
                type="button"
                onClick={() => editingId !== null ? handleUpdate(false) : handleAdd(false)}
                disabled={saving || !formData.courseName.trim() || !formData.focusDescription.trim()}
                className="rounded-xl bg-amber-600/20 px-6 py-2.5 text-sm font-semibold text-amber-100 ring-1 ring-amber-500/25 hover:bg-amber-600/25 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {saving ? 'Saving...' : editingId !== null ? 'Update as Draft' : 'Save as Draft'}
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Courses List */}
      {!loading && (
        <div className="space-y-4">
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
                          <h3 className="text-lg font-semibold text-slate-100">{uiCourse.courseName}</h3>
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
                        <p className="mt-2 text-sm text-slate-300/90">{uiCourse.focusDescription}</p>
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
                        <div className="mb-2 text-xs font-semibold text-slate-400">
                          Learning Outcomes ({uiCourse.whatYouLearn.length})
                        </div>
                        <ul className="space-y-1">
                          {uiCourse.whatYouLearn.slice(0, 3).map((item, idx) => (
                            <li key={idx} className="text-sm text-slate-300">
                              • {item}
                            </li>
                          ))}
                          {uiCourse.whatYouLearn.length > 3 && (
                            <li className="text-xs text-slate-500">+{uiCourse.whatYouLearn.length - 3} more</li>
                          )}
                        </ul>
                      </div>
                      <div>
                        <div className="mb-2 text-xs font-semibold text-slate-400">
                          Tools & Skills ({uiCourse.toolsAndSkills.length})
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {uiCourse.toolsAndSkills.slice(0, 4).map((tool, idx) => (
                            <span
                              key={idx}
                              className="rounded-lg border border-slate-800/70 bg-slate-950/40 px-2 py-1 text-xs text-slate-300"
                            >
                              {tool}
                            </span>
                          ))}
                          {uiCourse.toolsAndSkills.length > 4 && (
                            <span className="text-xs text-slate-500">+{uiCourse.toolsAndSkills.length - 4} more</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="mb-2 text-xs font-semibold text-slate-400">
                        Example Job Roles ({uiCourse.exampleJobRoles.length})
                      </div>
                      <div className="space-y-1">
                        {uiCourse.exampleJobRoles.map((role, idx) => (
                          <div key={idx} className="text-sm text-slate-300">
                            <span className="font-medium">{role.title}:</span> {role.description}
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
