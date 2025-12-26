import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/PageHeader'
import { useUserProgress } from '../context/UserProgressContext'
import { cn } from '../lib/cn'
import { IconBook, IconCheck, IconPin, IconTarget } from '../components/icons'

export function CourseRecommendationPage() {
  const { progress } = useUserProgress()

  const isReady = progress.psychometricCompleted
  const recommendations = progress.courseRecommendations
  const top3 = useMemo(() => recommendations.slice(0, 3), [recommendations])

  const [selectedKey, setSelectedKey] = useState<string>('')
  const [tab, setTab] = useState<'overview' | 'courses' | 'tools' | 'projects'>('overview')
  const [openCourseTitle, setOpenCourseTitle] = useState<string>('')

  const selected = useMemo(() => {
    if (top3.length === 0) return null
    return top3.find((r) => r.subDomain === selectedKey) ?? top3[0]
  }, [top3, selectedKey])

  useEffect(() => {
    if (!selected) return
    setSelectedKey(selected.subDomain)
  }, [selected])

  useEffect(() => {
    // When user switches to a different recommendation, reset the details view.
    setTab('overview')
    setOpenCourseTitle('')
  }, [selectedKey])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Course Recommendation"
        subtitle="Pick a technology direction first, then explore a clear learning path (frontend-only, conceptual)."
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
            title="Your Profile (from Psychometric Test)"
            right={<span className="text-xs text-slate-400">RIASEC</span>}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-xl bg-blue-600/20 px-3 py-2 text-xs font-semibold text-blue-100 ring-1 ring-blue-500/25">
                  Holland Code: {progress.psychometricResult}
                </span>
                {progress.careerPathReport?.primaryPath && (
                  <span className="rounded-xl bg-slate-950/40 px-3 py-2 text-xs font-semibold text-slate-200 ring-1 ring-slate-800/70">
                    Career Path: {progress.careerPathReport.primaryPath.title}
                  </span>
                )}
              </div>
              <Link
                to="/psychometric-test"
                className="inline-flex items-center justify-center rounded-xl border border-slate-800/70 bg-slate-950/40 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-900/60"
              >
                Retake / Update my profile
              </Link>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 px-4 py-3">
                <div className="flex items-center gap-2">
                  <IconTarget size={16} className="text-emerald-200/90" />
                  <div className="text-xs font-semibold text-slate-200">Step 1</div>
                </div>
                <div className="mt-2 text-sm text-slate-300/90">Pick a top match on the left.</div>
              </div>
              <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 px-4 py-3">
                <div className="flex items-center gap-2">
                  <IconBook size={16} className="text-blue-200/90" />
                  <div className="text-xs font-semibold text-slate-200">Step 2</div>
                </div>
                <div className="mt-2 text-sm text-slate-300/90">Explore Courses / Tools / Projects tabs.</div>
              </div>
              <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 px-4 py-3">
                <div className="flex items-center gap-2">
                  <IconPin size={16} className="text-violet-200/90" />
                  <div className="text-xs font-semibold text-slate-200">Step 3</div>
                </div>
                <div className="mt-2 text-sm text-slate-300/90">Start with 1 project to prove your skills.</div>
              </div>
            </div>
          </Card>

          {top3.length === 0 ? (
            <Card title="No recommendations found">
              <div className="space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 px-4 py-3">
                  Please submit the Psychometric Test to generate your course recommendations.
                </div>
                <Link
                  to="/psychometric-test"
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-blue-600/20 px-4 py-3 text-sm font-semibold text-blue-100 ring-1 ring-blue-500/25 hover:bg-blue-600/25"
                >
                  Go to Psychometric Test
                </Link>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
              <Card
                title="Top Matches"
                right={<span className="text-xs text-slate-400">Pick one</span>}
                className="lg:col-span-2"
              >
                <div className="space-y-2">
                  {top3.map((rec, idx) => {
                    const active = selected?.subDomain === rec.subDomain
                    return (
                      <button
                        key={rec.subDomain}
                        type="button"
                        onClick={() => setSelectedKey(rec.subDomain)}
                        className={cn(
                          'group w-full rounded-2xl border px-4 py-3 text-left transition',
                          active
                            ? 'border-blue-500/35 bg-blue-600/15 ring-1 ring-blue-500/20'
                            : 'border-slate-800/70 bg-slate-950/30 hover:bg-slate-900/50',
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-slate-400">
                              Match #{idx + 1}
                            </div>
                            <div className={cn('mt-1 truncate text-sm font-semibold', active ? 'text-blue-100' : 'text-slate-100')}>
                              {rec.subDomain}
                            </div>
                            <div className="mt-1 line-clamp-2 text-xs text-slate-400">
                              {rec.explanation}
                            </div>
                          </div>
                          <div className={cn(
                            'shrink-0 rounded-xl px-3 py-2 text-xs font-semibold ring-1',
                            active
                              ? 'bg-blue-600/20 text-blue-100 ring-blue-500/25'
                              : 'bg-slate-950/40 text-slate-200 ring-slate-800/70',
                          )}>
                            {rec.matchPercent}%
                          </div>
                        </div>

                        <div className="mt-3 h-2 w-full rounded-full bg-slate-800/70">
                          <div
                            className={cn('h-2 rounded-full transition', active ? 'bg-blue-500/70' : 'bg-slate-200/40')}
                            style={{ width: `${Math.max(0, Math.min(100, rec.matchPercent))}%` }}
                          />
                        </div>
                      </button>
                    )
                  })}
                </div>
              </Card>

              <Card
                title={selected?.subDomain ?? 'Recommendation'}
                right={
                  <span className="rounded-xl bg-blue-600/20 px-3 py-2 text-xs font-semibold text-blue-100 ring-1 ring-blue-500/25">
                    {selected?.matchPercent ?? 0}%
                  </span>
                }
                className="lg:col-span-3"
              >
                {!selected ? null : (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 px-4 py-3 text-sm text-slate-300/90">
                      {selected.explanation}
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {([
                        { key: 'overview', label: 'Overview', icon: <IconTarget size={16} className="text-emerald-200/90" /> },
                        { key: 'courses', label: 'Courses', icon: <IconBook size={16} className="text-blue-200/90" /> },
                        { key: 'tools', label: 'Tools', icon: <IconPin size={16} className="text-violet-200/90" /> },
                        { key: 'projects', label: 'Projects', icon: <IconCheck size={16} className="text-amber-200/90" /> },
                      ] as const).map((t) => {
                        const active = tab === t.key
                        return (
                          <button
                            key={t.key}
                            type="button"
                            onClick={() => setTab(t.key)}
                            className={cn(
                              'flex items-center justify-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold transition',
                              active
                                ? 'border-blue-500/35 bg-blue-600/15 text-blue-100 ring-1 ring-blue-500/20'
                                : 'border-slate-800/70 bg-slate-950/30 text-slate-200 hover:bg-slate-900/50',
                            )}
                          >
                            {t.icon}
                            {t.label}
                          </button>
                        )
                      })}
                    </div>

                    {tab === 'overview' && (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 px-4 py-3">
                          <div className="text-xs font-semibold text-slate-400">Suggested courses</div>
                          <div className="mt-2 text-2xl font-semibold text-slate-100">
                            {selected.suggestedCourses?.length ?? 0}
                          </div>
                        </div>
                        <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 px-4 py-3">
                          <div className="text-xs font-semibold text-slate-400">Tools</div>
                          <div className="mt-2 text-2xl font-semibold text-slate-100">
                            {selected.tools?.length ?? 0}
                          </div>
                        </div>
                        <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 px-4 py-3">
                          <div className="text-xs font-semibold text-slate-400">Starter projects</div>
                          <div className="mt-2 text-2xl font-semibold text-slate-100">
                            {selected.starterProjects?.length ?? 0}
                          </div>
                        </div>
                      </div>
                    )}

                    {tab === 'courses' && (
                      <div className="space-y-3">
                        {(selected.suggestedCourses ?? []).map((c) => {
                          const open = openCourseTitle === c.title
                          return (
                            <button
                              key={c.title}
                              type="button"
                              onClick={() => setOpenCourseTitle(open ? '' : c.title)}
                              className="w-full rounded-2xl border border-slate-800/70 bg-slate-950/30 px-4 py-4 text-left hover:bg-slate-900/50"
                            >
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                  <div className="text-sm font-semibold text-slate-100">
                                    {c.title}
                                  </div>
                                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-400">
                                    <span className="rounded-xl bg-slate-950/40 px-3 py-1 ring-1 ring-slate-800/70">
                                      Level: <span className="font-semibold text-slate-200">{c.level}</span>
                                    </span>
                                    <span className="rounded-xl bg-slate-950/40 px-3 py-1 ring-1 ring-slate-800/70">
                                      Duration: <span className="font-semibold text-slate-200">{c.duration}</span>
                                    </span>
                                  </div>
                                </div>
                                <div className="shrink-0 rounded-xl bg-blue-600/15 px-3 py-2 text-xs font-semibold text-blue-100 ring-1 ring-blue-500/20">
                                  {open ? 'Hide details' : 'View details'}
                                </div>
                              </div>

                              {open && (
                                <div className="mt-3 space-y-3">
                                  <div className="rounded-2xl border border-slate-800/70 bg-slate-950/40 px-4 py-3 text-sm text-slate-300/90">
                                    {c.why}
                                  </div>
                                  {c.outcomes?.length > 0 && (
                                    <div className="rounded-2xl border border-slate-800/70 bg-slate-950/40 px-4 py-3">
                                      <div className="text-xs font-semibold text-slate-200">What you’ll be able to do</div>
                                      <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-300/90">
                                        {c.outcomes.map((o) => (
                                          <li key={o}>{o}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {tab === 'tools' && (
                      <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 px-4 py-4">
                        <div className="text-xs font-semibold text-slate-200">Tools you’ll likely use</div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {(selected.tools ?? []).map((t) => (
                            <span
                              key={t}
                              className="rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-1 text-xs font-semibold text-slate-200"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {tab === 'projects' && (
                      <div className="space-y-2">
                        {(selected.starterProjects ?? []).map((p) => (
                          <div
                            key={p}
                            className="flex items-start gap-3 rounded-2xl border border-slate-800/70 bg-slate-950/30 px-4 py-3"
                          >
                            <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl bg-emerald-600/15 ring-1 ring-emerald-500/20">
                              <IconCheck size={16} className="text-emerald-200/90" />
                            </span>
                            <div className="text-sm text-slate-200">{p}</div>
                          </div>
                        ))}
                        <div className="text-xs text-slate-500">
                          Tip: Choose just one project to start. Completing one is better than starting three.
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  )
}


