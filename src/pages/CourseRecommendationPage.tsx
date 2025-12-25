import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/PageHeader'
import { useUserProgress } from '../context/UserProgressContext'
import { Link } from 'react-router-dom'

export function CourseRecommendationPage() {
  const { progress } = useUserProgress()

  const isReady = progress.psychometricCompleted
  const recommendations = progress.courseRecommendations

  return (
    <div className="space-y-6">
      <PageHeader
        title="Course Recommendation"
        subtitle="Detailed technology course suggestions based on your RIASEC profile (frontend-only)"
      />

      {!isReady ? (
        <Card title="Complete the Psychometric Test first">
          <div className="space-y-3 text-sm text-slate-300">
            <p>
              Complete the <span className="font-semibold text-slate-100">Psychometric Test</span>{' '}
              to generate your personalized recommendations.
            </p>
            <p className="text-xs text-slate-400">
              This is frontend-only (dummy data). No database or authentication is used.
            </p>
            <div className="pt-2">
              <Link
                to="/psychometric-test"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-blue-600/20 px-4 py-3 text-sm font-semibold text-blue-100 ring-1 ring-blue-500/25 hover:bg-blue-600/25"
              >
                Go to Psychometric Test
              </Link>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card
            title="Your Profile Summary"
            right={<span className="text-xs text-slate-400">RIASEC</span>}
          >
            <div className="space-y-2 text-sm text-slate-300">
              <div className="rounded-xl border border-slate-800/70 bg-slate-950/30 px-4 py-3">
                Holland Code:{' '}
                <span className="font-semibold text-slate-100">{progress.psychometricResult}</span>
              </div>
              <div className="text-xs text-slate-400">
                Tip: Start with the highest match recommendation, then explore the next two to compare learning styles.
              </div>
            </div>
          </Card>

          <Card
            title="Technology Course Suggestions"
            right={<span className="text-xs text-slate-400">Top 3</span>}
          >
            <div className="space-y-4">
              {recommendations.length === 0 ? (
                <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 px-4 py-3 text-sm text-slate-300">
                  No recommendations yet. Submit the Psychometric Test to generate them.
                </div>
              ) : (
                recommendations.slice(0, 3).map((rec) => (
                  <div
                    key={rec.subDomain}
                    className="rounded-2xl border border-slate-800/70 bg-slate-950/30 px-4 py-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-100">
                          {rec.subDomain}
                        </div>
                        <div className="mt-1 text-xs text-slate-400">
                          Matched from your Holland Code:{' '}
                          <span className="font-semibold text-slate-200">{progress.psychometricResult}</span>
                        </div>
                      </div>
                      <div className="shrink-0 rounded-xl bg-blue-600/20 px-3 py-2 text-xs font-semibold text-blue-100 ring-1 ring-blue-500/25">
                        {rec.matchPercent}%
                      </div>
                    </div>

                    <p className="mt-3 text-sm text-slate-300/90">{rec.explanation}</p>

                    {rec.tools?.length > 0 && (
                      <div className="mt-4">
                        <div className="text-xs font-semibold text-slate-200">Tools you’ll likely use</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {rec.tools.map((t) => (
                            <span
                              key={t}
                              className="rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-1 text-xs font-medium text-slate-200"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {rec.suggestedCourses?.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <div className="text-xs font-semibold text-slate-200">Suggested learning path</div>
                        <div className="space-y-3">
                          {rec.suggestedCourses.map((c) => (
                            <div
                              key={c.title}
                              className="rounded-2xl border border-slate-800/70 bg-slate-950/40 px-4 py-3"
                            >
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                  <div className="text-sm font-semibold text-slate-100">
                                    {c.title}
                                  </div>
                                  <div className="mt-1 text-xs text-slate-400">
                                    Level:{' '}
                                    <span className="font-semibold text-slate-200">{c.level}</span>
                                    {' • '}
                                    Duration:{' '}
                                    <span className="font-semibold text-slate-200">{c.duration}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-2 text-sm text-slate-300/90">{c.why}</div>
                              {c.outcomes?.length > 0 && (
                                <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-slate-300/90">
                                  {c.outcomes.map((o) => (
                                    <li key={o}>{o}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {rec.starterProjects?.length > 0 && (
                      <div className="mt-4">
                        <div className="text-xs font-semibold text-slate-200">Starter projects (to prove your skills)</div>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-300/90">
                          {rec.starterProjects.map((p) => (
                            <li key={p}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}


