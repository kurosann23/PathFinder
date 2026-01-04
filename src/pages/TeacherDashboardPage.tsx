import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { Card } from '../components/ui/Card'
import { IconBook, IconSettings, IconClipboard } from '../components/icons'

export function TeacherDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Teacher Dashboard"
        subtitle="Manage psychometric test questions, courses, and learning paths."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Manage Psychometric Questions */}
        <Card>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-600/20 p-3 ring-1 ring-blue-500/25">
                <IconClipboard size={24} className="text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-100">Psychometric Questions</h3>
            </div>
            <p className="text-sm text-slate-300/90">
              Create, edit, and manage psychometric test questions. Organize questions by RIASEC type and difficulty.
            </p>
            <Link
              to="/teacher/questions"
              className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600/20 px-4 py-2.5 text-sm font-semibold text-blue-100 ring-1 ring-blue-500/25 hover:bg-blue-600/25"
            >
              Manage Questions
            </Link>
          </div>
        </Card>

        {/* Manage Courses */}
        <Card>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-purple-600/20 p-3 ring-1 ring-purple-500/25">
                <IconBook size={24} className="text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-100">Courses & Learning Paths</h3>
            </div>
            <p className="text-sm text-slate-300/90">
              Manage course recommendations and learning paths. Update course descriptions, tools, and example job roles.
            </p>
            <Link
              to="/teacher/courses"
              className="inline-flex w-full items-center justify-center rounded-xl bg-purple-600/20 px-4 py-2.5 text-sm font-semibold text-purple-100 ring-1 ring-purple-500/25 hover:bg-purple-600/25"
            >
              Manage Courses
            </Link>
          </div>
        </Card>

        {/* System Settings (Placeholder) */}
        <Card>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-slate-600/20 p-3 ring-1 ring-slate-500/25">
                <IconSettings size={24} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-100">Settings</h3>
            </div>
            <p className="text-sm text-slate-300/90">
              Configure system settings and preferences. (Coming soon)
            </p>
            <button
              disabled
              className="inline-flex w-full items-center justify-center rounded-xl bg-slate-600/20 px-4 py-2.5 text-sm font-semibold text-slate-400 ring-1 ring-slate-500/25 opacity-50 cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>
        </Card>
      </div>

      {/* Quick Stats Section */}
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-400">Total Questions</div>
            <div className="text-2xl font-bold text-slate-100">24</div>
            <div className="text-xs text-slate-500">Across all RIASEC types</div>
          </div>
        </Card>
        <Card>
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-400">Active Courses</div>
            <div className="text-2xl font-bold text-slate-100">18</div>
            <div className="text-xs text-slate-500">6 RIASEC types × 3 courses</div>
          </div>
        </Card>
        <Card>
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-400">System Status</div>
            <div className="text-2xl font-bold text-emerald-400">Active</div>
            <div className="text-xs text-slate-500">All systems operational</div>
          </div>
        </Card>
      </div>
    </div>
  )
}
