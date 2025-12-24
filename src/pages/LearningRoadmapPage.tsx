import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/PageHeader'
import { ProgressBar } from '../components/ui/ProgressBar'

const roadmap = [
  { title: 'Foundation', items: ['Complete Profile', 'Psychometric Test'], progress: 100 },
  { title: 'Explore', items: ['Shortlist Courses', 'Pick a Career Track'], progress: 60 },
  { title: 'Build', items: ['Start Roadmap', 'Mini Projects'], progress: 35 },
  { title: 'Prepare', items: ['Resume', 'Mock Interview'], progress: 10 },
]

export function LearningRoadmapPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Learning Roadmap"
        subtitle="Your step-by-step plan toward career readiness (dummy data)"
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Roadmap Progress">
          <div className="space-y-4">
            <ProgressBar label="Overall" value={70} barClass="bg-violet-400" />
            <div className="text-sm text-slate-400">
              Tip: Keep small weekly goals and track your momentum.
            </div>
          </div>
        </Card>

        <Card title="Milestones">
          <div className="space-y-3">
            {roadmap.map((r) => (
              <div
                key={r.title}
                className="rounded-2xl border border-slate-800/70 bg-slate-950/30 px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-slate-100">
                    {r.title}
                  </div>
                  <div className="text-xs font-semibold text-slate-400">
                    {r.progress}%
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <ProgressBar
                    label="Progress"
                    value={r.progress}
                    barClass="bg-slate-200"
                  />
                  <div className="text-xs text-slate-400">
                    {r.items.join(' • ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}


