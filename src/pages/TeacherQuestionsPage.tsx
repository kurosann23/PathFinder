import { useEffect, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { Card } from '../components/ui/Card'
import { IconPlus, IconEdit, IconTrash, IconX } from '../components/icons'
import {
  fetchAllQuestionsForTeachers,
  createQuestion,
  updateQuestion,
  hardDeleteQuestion,
  type QuestionRow,
} from '../lib/questionsRepo'
import { cn } from '../lib/cn'
import { useTheme } from '../context/ThemeContext'

export function TeacherQuestionsPage() {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const [questions, setQuestions] = useState<QuestionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingFormData, setEditingFormData] = useState<{
    text: string
    type: 'R' | 'I' | 'A' | 'S' | 'E' | 'C'
    is_active: boolean
  } | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({ 
    text: '', 
    type: 'R' as 'R' | 'I' | 'A' | 'S' | 'E' | 'C',
    is_active: true 
  })
  const [saving, setSaving] = useState(false)

  // Load questions from database
  useEffect(() => {
    loadQuestions()
  }, [])

  async function loadQuestions() {
    setLoading(true)
    setError('')
    try {
      const data = await fetchAllQuestionsForTeachers()
      setQuestions(data)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load questions.'
      setError(msg)
      console.error('Error loading questions:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd(isActive: boolean) {
    if (!formData.text.trim()) return
    setSaving(true)
    setError('')
    try {
      await createQuestion({
        text: formData.text,
        type: formData.type,
        is_active: isActive,
      })
      setFormData({ text: '', type: 'R', is_active: true })
      setShowAddForm(false)
      await loadQuestions() // Reload to get the new question with ID
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create question.'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  function handleEdit(id: number) {
    const question = questions.find((q) => q.id === id)
    if (question) {
      setEditingFormData({ 
        text: question.text, 
        type: question.type,
        is_active: question.is_active ?? true 
      })
      setEditingId(id)
    }
  }

  async function handleUpdate(isActive: boolean) {
    if (!editingFormData || !editingFormData.text.trim() || editingId === null) return
    setSaving(true)
    setError('')
    try {
      await updateQuestion(editingId, {
        text: editingFormData.text,
        type: editingFormData.type,
        is_active: isActive,
      })
      setEditingId(null)
      setEditingFormData(null)
      await loadQuestions() // Reload to get updated data
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update question.'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  function handleCancelEdit() {
    setEditingId(null)
    setEditingFormData(null)
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Are you sure you want to permanently delete this question? This action cannot be undone.')) return
    setError('')
    try {
      await hardDeleteQuestion(id)
      await loadQuestions() // Reload to reflect deletion
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete question.'
      setError(msg)
    }
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setEditingId(null)
    setFormData({ text: '', type: 'R', is_active: true })
  }

  const questionsByType = {
    R: questions.filter((q) => q.type === 'R'),
    I: questions.filter((q) => q.type === 'I'),
    A: questions.filter((q) => q.type === 'A'),
    S: questions.filter((q) => q.type === 'S'),
    E: questions.filter((q) => q.type === 'E'),
    C: questions.filter((q) => q.type === 'C'),
  }

  const typeLabels = {
    R: 'Realistic',
    I: 'Investigative',
    A: 'Artistic',
    S: 'Social',
    E: 'Enterprising',
    C: 'Conventional',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Manage Psychometric Questions"
          subtitle="Create, edit, and organize questions by RIASEC type. Changes are saved to the database."
        />
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          disabled={saving}
          className={cn(
            'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-base font-semibold ring-1 transition disabled:opacity-50',
            isLight
              ? 'bg-blue-600 text-white ring-blue-700 hover:bg-blue-700 shadow-md'
              : 'bg-blue-600/20 text-blue-100 ring-blue-500/25 hover:bg-blue-600/25'
          )}
        >
          <IconPlus size={18} />
          Add Question
        </button>
      </div>

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

      {/* Loading State */}
      {loading && (
        <Card>
          <div className={cn('py-8 text-center text-base', isLight ? 'text-slate-600' : 'text-slate-400')}>Loading questions...</div>
        </Card>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className={cn('text-xl font-semibold', isLight ? 'text-slate-900' : 'text-slate-100')}>
                {editingId ? 'Edit Question' : 'Add New Question'}
              </h3>
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-200"
              >
                <IconX size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className={cn('mb-1 block text-base font-medium', isLight ? 'text-slate-700' : 'text-slate-300')}>RIASEC Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'R' | 'I' | 'A' | 'S' | 'E' | 'C' })}
                  className={cn(
                    'w-full rounded-xl border px-4 py-2.5 text-base',
                    isLight
                      ? 'border-slate-300 bg-white text-slate-900'
                      : 'border-slate-800/70 bg-slate-950/40 text-slate-200'
                  )}
                >
                  <option value="R">Realistic (R)</option>
                  <option value="I">Investigative (I)</option>
                  <option value="A">Artistic (A)</option>
                  <option value="S">Social (S)</option>
                  <option value="E">Enterprising (E)</option>
                  <option value="C">Conventional (C)</option>
                </select>
              </div>
              <div>
                <label className={cn('mb-1 block text-base font-medium', isLight ? 'text-slate-700' : 'text-slate-300')}>Question Text</label>
                <textarea
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  rows={3}
                  className={cn(
                    'w-full rounded-xl border px-4 py-2.5 text-base',
                    isLight
                      ? 'border-slate-300 bg-white text-slate-900'
                      : 'border-slate-800/70 bg-slate-950/40 text-slate-200'
                  )}
                  placeholder="Enter question text..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => editingId ? handleUpdate(true) : handleAdd(true)}
                  disabled={saving || !formData.text.trim()}
                  className={cn(
                    'flex-1 rounded-xl px-4 py-2.5 text-base font-semibold ring-1 transition disabled:opacity-50',
                    isLight
                      ? 'bg-blue-600 text-white ring-blue-700 hover:bg-blue-700 shadow-md'
                      : 'bg-blue-600/20 text-blue-100 ring-blue-500/25 hover:bg-blue-600/25'
                  )}
                >
                  {saving ? 'Saving...' : editingId ? 'Update as Active' : 'Save as Active'}
                </button>
                <button
                  type="button"
                  onClick={() => editingId ? handleUpdate(false) : handleAdd(false)}
                  disabled={saving || !formData.text.trim()}
                  className={cn(
                    'flex-1 rounded-xl px-4 py-2.5 text-base font-semibold ring-1 transition disabled:opacity-50',
                    isLight
                      ? 'bg-amber-500 text-white ring-amber-600 hover:bg-amber-600 shadow-md'
                      : 'bg-amber-600/20 text-amber-100 ring-amber-500/25 hover:bg-amber-600/25'
                  )}
                >
                  {saving ? 'Saving...' : editingId ? 'Update as Draft' : 'Save as Draft'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className={cn(
                    'rounded-xl border px-4 py-2.5 text-base font-semibold transition',
                    isLight
                      ? 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                      : 'border-slate-800/70 bg-slate-950/40 text-slate-200 hover:bg-slate-900/60'
                  )}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Questions by Type */}
      {!loading && (['R', 'I', 'A', 'S', 'E', 'C'] as const).map((type) => (
        <Card key={type}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className={cn('text-xl font-semibold', isLight ? 'text-slate-900' : 'text-slate-100')}>
                {typeLabels[type]} ({type}) - {questionsByType[type].length} questions
              </h3>
            </div>
            <div className="space-y-2">
              {questionsByType[type].map((question) => {
                const isEditing = editingId === question.id
                
                if (isEditing && editingFormData) {
                  // Inline edit form
                  return (
                    <div
                      key={question.id}
                      className={cn(
                        'rounded-xl border p-4',
                        isLight
                          ? 'border-blue-300 bg-white shadow-md'
                          : 'border-blue-500/30 bg-slate-950/40'
                      )}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className={cn('text-base font-semibold', isLight ? 'text-blue-700' : 'text-blue-400')}>Editing Question</h4>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="rounded-lg p-1 text-slate-400 hover:text-slate-200"
                          >
                            <IconX size={16} />
                          </button>
                        </div>
                        <div>
                          <label className={cn('mb-1 block text-sm font-medium', isLight ? 'text-slate-700' : 'text-slate-300')}>RIASEC Type</label>
                          <select
                            value={editingFormData.type}
                            onChange={(e) => setEditingFormData({ 
                              ...editingFormData, 
                              type: e.target.value as 'R' | 'I' | 'A' | 'S' | 'E' | 'C' 
                            })}
                            disabled={saving}
                            className="w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm text-slate-200"
                          >
                            <option value="R">Realistic (R)</option>
                            <option value="I">Investigative (I)</option>
                            <option value="A">Artistic (A)</option>
                            <option value="S">Social (S)</option>
                            <option value="E">Enterprising (E)</option>
                            <option value="C">Conventional (C)</option>
                          </select>
                        </div>
                        <div>
                          <label className={cn('mb-1 block text-sm font-medium', isLight ? 'text-slate-700' : 'text-slate-300')}>Question Text</label>
                          <textarea
                            value={editingFormData.text}
                            onChange={(e) => setEditingFormData({ ...editingFormData, text: e.target.value })}
                            rows={3}
                            disabled={saving}
                            className="w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm text-slate-200"
                            placeholder="Enter question text..."
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdate(true)}
                            disabled={saving || !editingFormData.text.trim()}
                            className={cn(
                              'flex-1 rounded-xl px-3 py-2 text-sm font-semibold ring-1 transition disabled:opacity-50',
                              isLight
                                ? 'bg-blue-600 text-white ring-blue-700 hover:bg-blue-700 shadow-md'
                                : 'bg-blue-600/20 text-blue-100 ring-blue-500/25 hover:bg-blue-600/25'
                            )}
                          >
                            {saving ? 'Saving...' : 'Update as Active'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdate(false)}
                            disabled={saving || !editingFormData.text.trim()}
                            className={cn(
                              'flex-1 rounded-xl px-3 py-2 text-sm font-semibold ring-1 transition disabled:opacity-50',
                              isLight
                                ? 'bg-amber-500 text-white ring-amber-600 hover:bg-amber-600 shadow-md'
                                : 'bg-amber-600/20 text-amber-100 ring-amber-500/25 hover:bg-amber-600/25'
                            )}
                          >
                            {saving ? 'Saving...' : 'Update as Draft'}
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            disabled={saving}
                            className={cn(
                              'rounded-xl border px-3 py-2 text-sm font-semibold transition disabled:opacity-50',
                              isLight
                                ? 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                                : 'border-slate-800/70 bg-slate-950/40 text-slate-200 hover:bg-slate-900/60'
                            )}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                }
                
                // Regular question card
                return (
                  <div
                    key={question.id}
                    className={cn(
                      'flex items-start justify-between rounded-xl border p-4',
                      isLight
                        ? 'border-slate-200 bg-white shadow-md'
                        : 'border-slate-800/70 bg-slate-950/30'
                    )}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={cn('text-base font-medium leading-relaxed', isLight ? 'text-[#0f172a]' : 'text-slate-200')}>{question.text}</div>
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2.5 py-1 text-sm font-semibold',
                            question.is_active
                              ? isLight
                                ? 'bg-emerald-100 border border-emerald-300 text-emerald-800'
                                : 'bg-emerald-500/20 text-emerald-400'
                              : isLight
                                ? 'bg-amber-100 border border-amber-300 text-amber-800'
                                : 'bg-amber-500/20 text-amber-400',
                          )}
                        >
                          {question.is_active ? 'Active' : 'Draft'}
                        </span>
                      </div>
                      <div className={cn('mt-1 text-sm', isLight ? 'text-slate-500' : 'text-slate-400')}>ID: {question.id}</div>
                    </div>
                    <div className="ml-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(question.id)}
                        disabled={editingId !== null}
                        className={cn(
                          "rounded-lg p-2 text-blue-400 hover:bg-blue-600/20",
                          editingId !== null && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <IconEdit size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(question.id)}
                        disabled={editingId !== null}
                        className={cn(
                          "rounded-lg p-2 text-rose-400 hover:bg-rose-600/20",
                          editingId !== null && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <IconTrash size={16} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
