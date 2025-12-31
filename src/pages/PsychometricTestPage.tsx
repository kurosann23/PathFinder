import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { ProgressBar } from '../components/ui/ProgressBar'
import { PageHeader } from '../components/PageHeader'
import { useUserProgress } from '../context/UserProgressContext'
import type { RiasecType } from '../constants/dashboard'
import { cn } from '../lib/cn'
import { IconBook, IconPin, IconTarget } from '../components/icons'
import { riasecQuestions } from '../data/riasecQuestions.js'
import { calculateRiasecScore } from '../utils/calculateRiasecScore.js'
import { getRiasecDescription } from '../utils/getRiasecDescription.js'
import { generateTechRecommendations } from '../utils/generateTechRecommendations.js'
import { generateCareerPath } from '../utils/generateCareerPath.js'

function AnimatedRadar() {
  return (
    <div className="relative size-10">
      <div className="absolute inset-0 rounded-full bg-blue-500/10 ring-1 ring-blue-500/25" />
      <div className="absolute inset-2 rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20" />
      <div className="absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-100" />
      <div className="absolute inset-0 animate-[spin_3.5s_linear_infinite]">
        <div className="absolute left-1/2 top-0 size-2 -translate-x-1/2 rounded-full bg-blue-300/90 shadow-[0_0_18px_rgba(147,197,253,0.6)]" />
      </div>
      <div className="absolute inset-0 rounded-full bg-blue-500/5 animate-pulse" />
    </div>
  )
}

function TabIcon(props: { tab: 'who' | 'learn' | 'become'; active: boolean }) {
  const { tab, active } = props
  const cls = cn(active ? 'text-blue-200' : 'text-slate-300')
  switch (tab) {
    case 'who':
      return <IconTarget size={18} className={cls} />
    case 'learn':
      return <IconBook size={18} className={cls} />
    case 'become':
      return <IconPin size={18} className={cls} />
  }
}

export function PsychometricTestPage() {
  const { progress, submitPsychometricTest, resetPsychometricTest, isHydrating, hydrationError, isSavingPsychometric } = useUserProgress()
  const resultsRef = useRef<HTMLDivElement | null>(null)
  const location = useLocation()

  // Local answers for the questionnaire (questionId -> Likert value 1..5).
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitError, setSubmitError] = useState<string>('')
  const [hasStarted, setHasStarted] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [stepError, setStepError] = useState<string>('')
  const [careerTab, setCareerTab] = useState<'who' | 'learn' | 'become'>('who')
  const [supportFocus, setSupportFocus] = useState<RiasecType | null>(null)
  const [copied, setCopied] = useState(false)

  const statusLabel = progress.psychometricCompleted ? 'Completed' : 'Not Taken'
  const statusClass = progress.psychometricCompleted
    ? 'text-emerald-200'
    : 'text-slate-300'
  const canSubmit = !progress.psychometricCompleted
  const isTakingTest = hasStarted && canSubmit

  const answeredCount = useMemo(
    () => Object.keys(answers).length,
    [answers],
  )

  const resultDescription = useMemo(() => {
    if (!progress.psychometricCompleted) return null
    const topType = (progress.psychometricResult?.[0] ?? 'I') as
      | 'R'
      | 'I'
      | 'A'
      | 'S'
      | 'E'
      | 'C'
    return getRiasecDescription(topType)
  }, [progress.psychometricCompleted, progress.psychometricResult])

  // If navigated from Dashboard "View Full Report", auto-scroll to results section.
  useEffect(() => {
    if (location.hash !== '#results') return
    if (!progress.psychometricCompleted) return
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [location.hash, progress.psychometricCompleted])

  function setAnswer(questionId: string, value: number) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  function handleStart() {
    if (progress.psychometricCompleted) return
    setHasStarted(true)
    setCurrentIndex((prev) => {
      // If user already answered some, resume at the first unanswered question.
      if (answeredCount === 0) return 0
      const firstUnanswered = riasecQuestions.findIndex((q) => !answers[String(q.id)])
      return firstUnanswered === -1 ? Math.min(riasecQuestions.length - 1, prev) : firstUnanswered
    })
    setSubmitError('')
    setStepError('')
  }

  function handleExitTest() {
    setHasStarted(false)
    setStepError('')
  }

  async function handleRetest() {
    const ok = window.confirm(
      'Are you sure you want to retake the test? This will delete your current results and reset your career guidance.',
    )
    if (!ok) return

    // Clear saved results + guidance so the user can submit again.
    try {
      await resetPsychometricTest()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to reset psychometric result.'
      setSubmitError(msg)
      return
    }

    // Reset local questionnaire state and immediately start the questionnaire.
    setAnswers({})
    setSubmitError('')
    setStepError('')
    setCurrentIndex(0)
    setHasStarted(true)

    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  async function handleCopySummary() {
    const report = progress.careerPathReport
    if (!report) return

    const text = [
      'PathFinder — Career Path Guidance (Conceptual)',
      `Holland Code: ${progress.psychometricResult}`,
      `Primary Path: ${report.primaryPath.title} (${report.primaryPath.riasec})`,
      report.rationale.summary,
      '',
      'Learning focus:',
      ...report.primaryPath.learningFocus.map((x) => `- ${x}`),
      '',
      'Possible roles (examples):',
      ...report.primaryPath.possibleRoles.map((r) => `- ${r}`),
    ].join('\n')

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch {
      // Non-blocking: clipboard may be unavailable in some environments.
      setCopied(false)
    }
  }

  async function handleSubmit() {
    if (!canSubmit) return

    if (answeredCount !== riasecQuestions.length) {
      setSubmitError('Please answer all questions before submitting.')
      return
    }

    setSubmitError('')

    const { percentages, topType, code } = calculateRiasecScore(answers)
    const top = topType as RiasecType
    const recommendations = generateTechRecommendations(top)
    const topTypes = code.split('').filter(Boolean) as RiasecType[]
    const careerPathReport = generateCareerPath(topTypes)

    try {
      await submitPsychometricTest({
        code,
        topType: top,
        percentages,
        recommendations,
        careerPathReport,
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to save result.'
      setSubmitError(msg)
      return
    }

    setHasStarted(false)
    setStepError('')
    setCareerTab('who')
    setSupportFocus(null)

    // Bring the user's attention to the outcome immediately after submission.
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  function handleNext() {
    const q = riasecQuestions[currentIndex]
    const current = answers[String(q.id)]
    if (!current) {
      setStepError('Please select a rating (1–5) before continuing.')
      return
    }
    setStepError('')
    setCurrentIndex((i) => Math.min(riasecQuestions.length - 1, i + 1))
  }

  function handleBack() {
    setStepError('')
    setCurrentIndex((i) => Math.max(0, i - 1))
  }

  // Focused questionnaire: one question at a time.
  if (isTakingTest) {
    const q = riasecQuestions[currentIndex]
    const current = answers[String(q.id)]
    const isLast = currentIndex === riasecQuestions.length - 1
    const progressPercent = Math.round(((currentIndex + 1) / riasecQuestions.length) * 100)

    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <PageHeader
          title="Psychometric Test"
          subtitle="Answer one statement at a time. Your responses are used to generate your guidance."
        />

        <Card
          title={`Question ${currentIndex + 1} of ${riasecQuestions.length}`}
          right={
            <div className="flex items-center gap-2">
              <div className="text-xs font-semibold text-slate-400">{progressPercent}%</div>
              <button
                type="button"
                onClick={handleExitTest}
                className="rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-900/60"
              >
                Exit
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="h-2 w-full rounded-full bg-slate-800/70">
              <div
                className="h-2 rounded-full bg-blue-500/60"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 px-4 py-4">
              <div className="text-xs font-semibold text-slate-400">
                Type: <span className="text-slate-200">{q.type}</span>
              </div>
              <div className="mt-2 text-base font-semibold text-slate-100">
                {q.text}
              </div>
              <div className="mt-4 grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((v) => {
                  const selected = current === v
                  return (
                    <label
                      key={v}
                      className={`cursor-pointer rounded-xl border px-2 py-3 text-center text-sm font-semibold transition ${
                        selected
                          ? 'border-blue-500/40 bg-blue-600/20 text-blue-100'
                          : 'border-slate-800/70 bg-slate-950/40 text-slate-200 hover:bg-slate-900/60'
                      }`}
                    >
                      <input
                        type="radio"
                        name={String(q.id)}
                        value={v}
                        checked={selected}
                        onChange={() => {
                          setAnswer(String(q.id), v)
                          setStepError('')
                        }}
                        className="sr-only"
                      />
                      {v}
                    </label>
                  )
                })}
              </div>
              <div className="mt-2 flex justify-between text-xs text-slate-500">
                <span>Strongly Disagree</span>
                <span>Strongly Agree</span>
              </div>
            </div>

            {stepError && (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-200">
                {stepError}
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentIndex === 0}
                className="rounded-2xl border border-slate-800/70 bg-slate-950/40 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-900/60 disabled:opacity-50"
              >
                Back
              </button>

              <div className="text-xs text-slate-400">
                Answered:{' '}
                <span className="font-semibold text-slate-200">{answeredCount}</span> /{' '}
                {riasecQuestions.length}
              </div>

              {isLast ? (
                <button
                  type="button"
                  onClick={() => void handleSubmit()}
                  disabled={isSavingPsychometric}
                  className="rounded-2xl bg-blue-600/20 px-5 py-3 text-sm font-semibold text-blue-100 ring-1 ring-blue-500/25 hover:bg-blue-600/25"
                >
                  {isSavingPsychometric ? 'Saving…' : 'Submit Test'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="rounded-2xl bg-blue-600/20 px-5 py-3 text-sm font-semibold text-blue-100 ring-1 ring-blue-500/25 hover:bg-blue-600/25"
                >
                  Next
                </button>
              )}
            </div>

            <div className="text-xs text-slate-500">
              Tip: You can use Back to review and change answers before submitting.
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Psychometric Test"
        subtitle="RIASEC (Holland Code) questionnaire"
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Test Status">
          <div className="space-y-3">
            {isHydrating && (
              <div className="rounded-xl border border-slate-800/70 bg-slate-950/30 px-4 py-3 text-sm text-slate-300">
                Loading your saved results…
              </div>
            )}
            {hydrationError && (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-200">
                {hydrationError}
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-400">Result</div>
              <div className={`text-sm font-semibold ${statusClass}`}>
                {statusLabel}
              </div>
            </div>
            <div className="rounded-xl border border-slate-800/70 bg-slate-950/30 px-4 py-3 text-sm text-slate-300">
              Holland Code (RIASEC):{' '}
              <span className="font-semibold text-slate-100">
                {progress.psychometricCompleted ? progress.psychometricResult : '—'}
              </span>
            </div>
            {!progress.psychometricCompleted && (
              <button
                type="button"
                onClick={handleStart}
                disabled={!canSubmit}
                className="w-full rounded-2xl bg-blue-600/20 px-4 py-3 text-sm font-semibold text-blue-100 ring-1 ring-blue-500/25 hover:bg-blue-600/25 disabled:opacity-50"
              >
                {answeredCount > 0 ? 'Continue Test' : 'Start Test'}
              </button>
            )}
            {progress.psychometricCompleted && (
              <button
                type="button"
                onClick={() => void handleRetest()}
                className="w-full rounded-2xl border border-slate-800/70 bg-slate-950/40 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-900/60"
              >
                Retake Test (Change My Career Path)
              </button>
            )}
            <div className="text-xs text-slate-400">
              Progress: <span className="font-semibold text-slate-200">{answeredCount}</span> /{' '}
              {riasecQuestions.length} answered
            </div>
            {submitError && (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs font-medium text-rose-200">
                {submitError}
              </div>
            )}

            {progress.psychometricCompleted && (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                <div className="text-xs font-semibold text-emerald-200">
                  Next step
                </div>
                <div className="mt-1 text-sm text-slate-200">
                  View detailed course suggestions for your profile.
                </div>
                <div className="mt-3">
                  <Link
                    to="/course-recommendation"
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600/20 px-4 py-3 text-sm font-semibold text-emerald-100 ring-1 ring-emerald-500/25 hover:bg-emerald-600/25"
                  >
                    Go to Course Recommendations
                  </Link>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card title="Trait Breakdown">
          <div className="space-y-4">
            <ProgressBar label="Realistic" value={progress.riasecPercentages.R} barClass="bg-rose-400" />
            <ProgressBar label="Investigative" value={progress.riasecPercentages.I} barClass="bg-sky-400" />
            <ProgressBar label="Artistic" value={progress.riasecPercentages.A} barClass="bg-emerald-400" />
            <ProgressBar label="Social" value={progress.riasecPercentages.S} barClass="bg-amber-300" />
            <ProgressBar label="Enterprising" value={progress.riasecPercentages.E} barClass="bg-violet-400" />
            <ProgressBar label="Conventional" value={progress.riasecPercentages.C} barClass="bg-pink-400" />
          </div>
        </Card>
      </div>

      <Card title="RIASEC Questions (24)">
        <div className="space-y-4">
          <div className="text-sm text-slate-300/90">
            Rate how much you agree with each statement.
            <span className="text-slate-400">
              {' '}
              (1 = Strongly Disagree, 5 = Strongly Agree)
            </span>
          </div>

          {!progress.psychometricCompleted ? (
            <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 px-5 py-5">
              <div className="text-sm font-semibold text-slate-100">
                Start the test when you are ready.
              </div>
              <div className="mt-2 text-sm text-slate-300/90">
                The test runs one question at a time so you can focus.
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleStart}
                  disabled={!canSubmit}
                  className="rounded-2xl bg-blue-600/20 px-5 py-3 text-sm font-semibold text-blue-100 ring-1 ring-blue-500/25 hover:bg-blue-600/25 disabled:opacity-50"
                >
                  {answeredCount > 0 ? 'Continue Test' : 'Start Test'}
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 px-5 py-5 text-sm text-slate-300/90">
              The test has been completed. Scroll down to view your results and guidance.
            </div>
          )}

        </div>
      </Card>

      {progress.psychometricCompleted && resultDescription && (
        <div id="results" ref={resultsRef} className="space-y-4">
          {progress.careerPathReport && (
            <Card
              title="Career Path Guidance"
              right={
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-900/60"
                  >
                    {copied ? 'Copied' : 'Copy summary'}
                  </button>
                  <Link
                    to="/course-recommendation"
                    className="rounded-xl bg-emerald-600/20 px-3 py-2 text-xs font-semibold text-emerald-100 ring-1 ring-emerald-500/25 hover:bg-emerald-600/25"
                  >
                    Explore courses
                  </Link>
                </div>
              }
            >
              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-950/30 px-5 py-4">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(500px_circle_at_15%_10%,rgba(59,130,246,0.20),transparent_55%),radial-gradient(500px_circle_at_85%_80%,rgba(16,185,129,0.12),transparent_55%)]" />
                  <div className="relative">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-400">Your guidance report (conceptual)</div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-xl bg-blue-600/20 px-3 py-1 text-xs font-semibold text-blue-100 ring-1 ring-blue-500/25">
                            Holland Code: {progress.psychometricResult}
                          </span>
                          <span className="rounded-xl bg-slate-950/40 px-3 py-1 text-xs font-semibold text-slate-200 ring-1 ring-slate-800/70">
                            Primary: {progress.careerPathReport.primaryPath.riasec}
                          </span>
                        </div>
                        <div className="mt-3 text-lg font-semibold text-slate-100">
                          {progress.careerPathReport.primaryPath.title}
                        </div>
                        <div className="mt-1 text-sm text-slate-300/90">
                          {progress.careerPathReport.primaryPath.description}
                        </div>
                      </div>
                      <div className="shrink-0">
                        <div className="flex items-center gap-3 rounded-2xl border border-slate-800/70 bg-slate-950/40 px-3 py-3">
                          <AnimatedRadar />
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-slate-300">
                              Motivation tip
                            </div>
                            <div className="mt-1 text-xs text-slate-400">
                              Pick one role below and explore courses for it.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {progress.careerPathReport.supportingPaths.length > 0 && (
                      <div className="mt-4">
                        <div className="text-xs font-semibold text-slate-400">Supporting interests (click to view)</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {progress.careerPathReport.supportingPaths.map((p) => {
                            const active = supportFocus === p.riasec
                            return (
                              <button
                                key={p.riasec}
                                type="button"
                                onClick={() => setSupportFocus((prev) => (prev === p.riasec ? null : p.riasec))}
                                className={`rounded-xl border px-3 py-1 text-xs font-semibold transition ${
                                  active
                                    ? 'border-blue-500/35 bg-blue-600/20 text-blue-100'
                                    : 'border-slate-800/70 bg-slate-950/40 text-slate-200 hover:bg-slate-900/60'
                                }`}
                              >
                                {p.riasec} • {p.title}
                              </button>
                            )
                          })}
                        </div>

                        {supportFocus && (
                          <div className="mt-3 rounded-2xl border border-slate-800/70 bg-slate-950/40 px-4 py-3">
                            {(() => {
                              const p = progress.careerPathReport.supportingPaths.find((x) => x.riasec === supportFocus)
                              const idx = progress.careerPathReport.supportingPaths.findIndex((x) => x.riasec === supportFocus)
                              const why = progress.careerPathReport.rationale.supportingWhy[idx] ?? ''
                              if (!p) return null
                              return (
                                <div className="space-y-1">
                                  <div className="text-xs font-semibold text-slate-400">How it supports you</div>
                                  <div className="text-sm font-semibold text-slate-100">
                                    {p.title}
                                  </div>
                                  <div className="text-sm text-slate-300/90">{why}</div>
                                </div>
                              )
                            })()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                  {([
                    { key: 'who', label: 'Who I am', hint: 'Your best-fit direction' },
                    { key: 'learn', label: 'What I’ll learn', hint: 'General learning focus' },
                    { key: 'become', label: 'What I may become', hint: 'Example future roles' },
                  ] as const).map((t) => {
                    const active = careerTab === t.key
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setCareerTab(t.key)}
                        className={cn(
                          'rounded-2xl border px-4 py-3 text-left transition',
                          active
                            ? 'border-blue-500/35 bg-blue-600/15 ring-1 ring-blue-500/20'
                            : 'border-slate-800/70 bg-slate-950/30 hover:bg-slate-900/50',
                        )}
                      >
                        <div className="text-xs font-semibold text-slate-400">{t.hint}</div>
                        <div className="mt-2 flex items-center gap-2">
                          <span
                            className={cn(
                              'grid size-8 place-items-center rounded-xl ring-1 transition',
                              active
                                ? 'bg-blue-600/20 text-blue-100 ring-blue-500/25'
                                : 'bg-slate-950/40 text-slate-200 ring-slate-800/70',
                            )}
                          >
                            <TabIcon tab={t.key} active={active} />
                          </span>
                          <div className={cn('text-sm font-semibold', active ? 'text-blue-100' : 'text-slate-100')}>
                            {t.label}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>

                <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 px-5 py-4">
                  {careerTab === 'who' && (
                    <div className="space-y-3">
                      <div className="text-xs font-semibold text-slate-400">Why this path fits you</div>
                      <div className="text-sm text-slate-200">
                        {progress.careerPathReport.rationale.summary}
                      </div>
                      <div className="rounded-2xl border border-slate-800/70 bg-slate-950/40 px-4 py-3">
                        <div className="text-xs font-semibold text-slate-400">In simple terms</div>
                        <div className="mt-1 text-sm text-slate-300/90">
                          {progress.careerPathReport.rationale.primaryWhy}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-xs text-slate-400">
                          Next: learn what you’ll focus on and what roles you can aim for.
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setCareerTab('learn')}
                            className="rounded-xl bg-blue-600/20 px-4 py-2 text-xs font-semibold text-blue-100 ring-1 ring-blue-500/25 hover:bg-blue-600/25"
                          >
                            Continue
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {careerTab === 'learn' && (
                    <div className="space-y-3">
                      <div className="text-xs font-semibold text-slate-400">Key learning focus</div>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {progress.careerPathReport.primaryPath.learningFocus.map((x) => (
                          <div
                            key={x}
                            className="group relative overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-950/40 px-4 py-3 text-sm text-slate-200"
                          >
                            <div className="pointer-events-none absolute -inset-10 opacity-0 transition group-hover:opacity-100 bg-[radial-gradient(250px_circle_at_30%_30%,rgba(59,130,246,0.15),transparent_60%)]" />
                            <div className="relative flex items-start gap-3">
                              <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-xl bg-blue-600/15 ring-1 ring-blue-500/20">
                                <IconBook size={16} className="text-blue-200/90" />
                              </span>
                              <span className="leading-snug">{x}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <button
                          type="button"
                          onClick={() => setCareerTab('who')}
                          className="rounded-xl border border-slate-800/70 bg-slate-950/40 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-900/60"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={() => setCareerTab('become')}
                          className="rounded-xl bg-blue-600/20 px-4 py-2 text-xs font-semibold text-blue-100 ring-1 ring-blue-500/25 hover:bg-blue-600/25"
                        >
                          Continue
                        </button>
                      </div>
                    </div>
                  )}

                  {careerTab === 'become' && (
                    <div className="space-y-3">
                      <div className="text-xs font-semibold text-slate-400">Example roles (future outcomes)</div>
                      <div className="flex flex-wrap gap-2">
                        {progress.careerPathReport.primaryPath.possibleRoles.map((r) => (
                          <span
                            key={r}
                            className="group inline-flex items-center gap-2 rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:bg-slate-900/60"
                          >
                            <span className="relative grid size-5 place-items-center rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/15">
                              <span className="absolute inset-0 rounded-lg bg-emerald-500/10 opacity-0 group-hover:opacity-100 animate-pulse" />
                              <IconPin size={14} className="relative text-emerald-200/90" />
                            </span>
                            {r}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-slate-500">
                        These are examples, not guarantees — your interests and skills will refine the best fit.
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <button
                          type="button"
                          onClick={() => setCareerTab('learn')}
                          className="rounded-xl border border-slate-800/70 bg-slate-950/40 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-900/60"
                        >
                          Back
                        </button>
                        <Link
                          to="/course-recommendation"
                          className="rounded-xl bg-emerald-600/20 px-4 py-2 text-xs font-semibold text-emerald-100 ring-1 ring-emerald-500/25 hover:bg-emerald-600/25"
                        >
                          See recommended course suggestions
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

        </div>
      )}
    </div>
  )
}


