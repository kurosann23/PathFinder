import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/PageHeader'

export function ProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        subtitle="Your personal details and career preferences (UI only)"
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Basic Information">
          <div className="space-y-2 text-sm text-slate-300">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">Full Name</span>
              <span className="font-medium text-slate-100">Hisyam</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">Email</span>
              <span className="font-medium text-slate-100">
                hisyam.ahmad0311@gmail.com
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">Program</span>
              <span className="font-medium text-slate-100">
                Computer Science (Dummy)
              </span>
            </div>
          </div>
        </Card>

        <Card title="Career Goals">
          <div className="space-y-3 text-sm text-slate-300">
            <div className="rounded-xl border border-slate-800/70 bg-slate-950/30 px-4 py-3">
              Aspiring role: <span className="font-semibold text-slate-100">Data Analyst</span>
            </div>
            <div className="rounded-xl border border-slate-800/70 bg-slate-950/30 px-4 py-3">
              Interests: <span className="font-semibold text-slate-100">AI, UX, Product</span>
            </div>
            <div className="rounded-xl border border-slate-800/70 bg-slate-950/30 px-4 py-3">
              Availability: <span className="font-semibold text-slate-100">Internship-ready</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}


