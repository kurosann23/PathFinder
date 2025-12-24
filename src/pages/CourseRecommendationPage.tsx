import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/PageHeader'
import { useUserProgress } from '../context/UserProgressContext'

export function CourseRecommendationPage() {
  const { progress } = useUserProgress()

  const isReady = progress.psychometricCompleted
  const recommendations = progress.courseRecommendations

  return (
    <div className="space-y-6">
      <PageHeader
        title="Course Recommendation"
        subtitle="Top 3 technology sub-domain recommendations (dummy, rule-based)"
      />

      {!isReady ? (
        <Card title="Recommendations Unavailable">
          <div className="space-y-2 text-sm text-slate-300">
            <p>
              Complete the <span className="font-semibold text-slate-100">Psychometric Test</span>{' '}
              to generate your personalized recommendations.
            </p>
            <p className="text-xs text-slate-400">
              This is frontend-only (dummy data). No database or authentication is used.
            </p>
          </div>
        </Card>
      ) : (
        <Card
          title="Top Recommendations"
          right={<span className="text-xs text-slate-400">Top 3</span>}
        >
          <div className="space-y-3">
            {recommendations.length === 0 ? (
              <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 px-4 py-3 text-sm text-slate-300">
                No recommendations yet. Submit the Psychometric Test to generate them.
              </div>
            ) : (
              recommendations.slice(0, 3).map((rec) => (
                <div
                  key={rec.subDomain}
                  className="rounded-2xl border border-slate-800/70 bg-slate-950/30 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-100">
                        {rec.subDomain}
                      </div>
                      <div className="mt-1 text-xs text-slate-400">
                        Based on your psychometric result: <span className="font-semibold text-slate-200">{progress.psychometricResult}</span>
                      </div>
                    </div>
                    <div className="shrink-0 rounded-xl bg-blue-600/20 px-3 py-2 text-xs font-semibold text-blue-100 ring-1 ring-blue-500/25">
                      {rec.matchPercent}%
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-300/90">
                    {rec.explanation}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  )
}


