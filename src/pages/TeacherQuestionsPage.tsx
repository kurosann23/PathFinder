import { useEffect, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { Card } from '../components/ui/Card'
import { IconPlus, IconEdit, IconTrash, IconX } from '../components/icons'
import {
  fetchAllQuestions,
  createQuestion,
  updateQuestion,
  hardDeleteQuestion,
  type QuestionRow,
} from '../lib/questionsRepo'

export function TeacherQuestionsPage() {
  const [questions, setQuestions] = useState<QuestionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({ text: '', type: 'R' as 'R' | 'I' | 'A' | 'S' | 'E' | 'C' })
  const [saving, setSaving] = useState(false)

  // Load questions from database
  useEffect(() => {
    loadQuestions()
  }, [])

  async function loadQuestions() {
    setLoading(true)
    setError('')
    try {
      const data = await fetchAllQuestions()
      setQuestions(data)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load questions.'
      setError(msg)
      console.error('Error loading questions:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd() {
    if (!formData.text.trim()) return
    setSaving(true)
    setError('')
    try {
      await createQuestion({
        text: formData.text,
        type: formData.type,
        is_active: true,
      })
      setFormData({ text: '', type: 'R' })
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
      setFormData({ text: question.text, type: question.type })
      setEditingId(id)
      setShowAddForm(true)
    }
  }

  async function handleUpdate() {
    if (!formData.text.trim() || editingId === null) return
    setSaving(true)
    setError('')
    try {
      await updateQuestion(editingId, {
        text: formData.text,
        type: formData.type,
      })
      setEditingId(null)
      setFormData({ text: '', type: 'R' })
      setShowAddForm(false)
      await loadQuestions() // Reload to get updated data
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update question.'
      setError(msg)
    } finally {
      setSaving(false)
    }
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
    setFormData({ text: '', type: 'R' })
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
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600/20 px-4 py-2.5 text-sm font-semibold text-blue-100 ring-1 ring-blue-500/25 hover:bg-blue-600/25 disabled:opacity-50"
        >
          <IconPlus size={18} />
          Add Question
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-200">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <div className="py-8 text-center text-sm text-slate-400">Loading questions...</div>
        </Card>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-100">
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
                <label className="mb-1 block text-sm font-medium text-slate-300">RIASEC Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'R' | 'I' | 'A' | 'S' | 'E' | 'C' })}
                  className="w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-4 py-2.5 text-sm text-slate-200"
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
                <label className="mb-1 block text-sm font-medium text-slate-300">Question Text</label>
                <textarea
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-4 py-2.5 text-sm text-slate-200"
                  placeholder="Enter question text..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={editingId ? handleUpdate : handleAdd}
                  disabled={saving || !formData.text.trim()}
                  className="flex-1 rounded-xl bg-blue-600/20 px-4 py-2.5 text-sm font-semibold text-blue-100 ring-1 ring-blue-500/25 hover:bg-blue-600/25 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingId ? 'Update' : 'Add'} Question
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-xl border border-slate-800/70 bg-slate-950/40 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-900/60"
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
              <h3 className="text-lg font-semibold text-slate-100">
                {typeLabels[type]} ({type}) - {questionsByType[type].length} questions
              </h3>
            </div>
            <div className="space-y-2">
              {questionsByType[type].map((question) => (
                <div
                  key={question.id}
                  className="flex items-start justify-between rounded-xl border border-slate-800/70 bg-slate-950/30 p-4"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-200">{question.text}</div>
                    <div className="mt-1 text-xs text-slate-400">ID: {question.id}</div>
                  </div>
                  <div className="ml-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(question.id)}
                      className="rounded-lg p-2 text-blue-400 hover:bg-blue-600/20"
                    >
                      <IconEdit size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(question.id)}
                      className="rounded-lg p-2 text-rose-400 hover:bg-rose-600/20"
                    >
                      <IconTrash size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
