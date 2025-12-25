import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { ProgressBar } from '../components/ui/ProgressBar'
import { PageHeader } from '../components/PageHeader'
import { useUserProgress } from '../context/UserProgressContext'
import type { RiasecType } from '../constants/dashboard'
import { riasecQuestions } from '../data/riasecQuestions.js'
import { calculateRiasecScore } from '../utils/calculateRiasecScore.js'
import { getRiasecDescription } from '../utils/getRiasecDescription.js'
import { generateTechRecommendations } from '../utils/generateTechRecommendations.js'

export function PsychometricTestPage() {
  const { progress, submitPsychometricTest } = useUserProgress()
  const resultsRef = useRef<HTMLDivElement | null>(null)

  // Local answers for the questionnaire (questionId -> Likert value 1..5).
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitError, setSubmitError] = useState<string>('')
  const [hasStarted, setHasStarted] = useState(false)

  const statusLabel = progress.psychometricCompleted ? 'Completed' : 'Not Taken'
  const statusClass = progress.psychometricCompleted
    ? 'text-emerald-200'
    : 'text-slate-300'
  const canSubmit = !progress.psychometricCompleted

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

  function setAnswer(questionId: string, value: number) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  function handleStart() {
    if (progress.psychometricCompleted) return
    setHasStarted(true)
    setSubmitError('')
  }

  function handleSubmit() {
    if (!canSubmit) return

    if (answeredCount !== riasecQuestions.length) {
      setSubmitError('Please answer all questions before submitting.')
      return
    }

    setSubmitError('')

    const { percentages, topType, code } = calculateRiasecScore(answers)
    const top = topType as RiasecType
    const recommendations = generateTechRecommendations(top)

    submitPsychometricTest({
      code,
      topType: top,
      percentages,
      recommendations,
    })

    // Bring the user's attention to the outcome immediately after submission.
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Psychometric Test"
        subtitle="RIASEC (Holland Code) questionnaire — prototype (frontend-only)"
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Test Status">
          <div className="space-y-3">
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
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full rounded-2xl bg-blue-600/20 px-4 py-3 text-sm font-semibold text-blue-100 ring-1 ring-blue-500/25 hover:bg-blue-600/25"
            >
              {canSubmit ? 'Submit Test' : 'Test Submitted'}
            </button>
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

          {!hasStarted ? (
            <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 px-5 py-5">
              <div className="text-sm font-semibold text-slate-100">
                Start the test when you are ready.
              </div>
              <div className="mt-2 text-sm text-slate-300/90">
                You will answer 24 statements using a 1–5 scale. This prototype
                runs fully on the frontend (no database).
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleStart}
                  disabled={!canSubmit}
                  className="rounded-2xl bg-blue-600/20 px-5 py-3 text-sm font-semibold text-blue-100 ring-1 ring-blue-500/25 hover:bg-blue-600/25 disabled:opacity-50"
                >
                  {canSubmit ? 'Start Test' : 'Test Completed'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {riasecQuestions.map((q, idx) => {
                  const current = answers[String(q.id)]
                  return (
                    <div
                      key={String(q.id)}
                      className="rounded-2xl border border-slate-800/70 bg-slate-950/30 px-4 py-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-400">
                            Q{idx + 1} • {q.type}
                          </div>
                          <div className="mt-1 text-sm font-semibold text-slate-100">
                            {q.text}
                          </div>
                        </div>
                        <div className="shrink-0 rounded-xl bg-slate-900/50 px-3 py-2 text-xs font-semibold text-slate-200 ring-1 ring-slate-800/70">
                          {current ? `Selected: ${current}` : 'Not Answered'}
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-5 gap-2">
                        {[1, 2, 3, 4, 5].map((v) => {
                          const selected = current === v
                          return (
                            <label
                              key={v}
                              className={`cursor-pointer rounded-xl border px-2 py-2 text-center text-xs font-semibold transition ${
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
                                onChange={() => setAnswer(String(q.id), v)}
                                className="sr-only"
                              />
                              {v}
                            </label>
                          )
                        })}
                      </div>

                      <div className="mt-2 flex justify-between text-[11px] text-slate-500">
                        <span>Strongly Disagree</span>
                        <span>Strongly Agree</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-slate-400">
                  Please answer all questions before submitting.
                </div>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="rounded-2xl bg-blue-600/20 px-5 py-3 text-sm font-semibold text-blue-100 ring-1 ring-blue-500/25 hover:bg-blue-600/25 disabled:opacity-50"
                >
                  {canSubmit ? 'Submit Test' : 'Test Submitted'}
                </button>
              </div>
            </>
          )}

        </div>
      </Card>

      {progress.psychometricCompleted && resultDescription && (
        <div ref={resultsRef} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card title="Personality Description">
            <div className="space-y-2">
              <div className="text-sm font-semibold text-slate-100">
                {resultDescription.title}
              </div>
              <p className="text-sm text-slate-300/90">{resultDescription.text}</p>
            </div>
          </Card>

          <Card title="Technology Recommendations (Preview)">
            <div className="space-y-3">
              {progress.courseRecommendations.slice(0, 3).map((rec) => (
                <div
                  key={rec.subDomain}
                  className="rounded-2xl border border-slate-800/70 bg-slate-950/30 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-100">
                        {rec.subDomain}
                      </div>
                      <p className="mt-2 text-sm text-slate-300/90">
                        {rec.explanation}
                      </p>
                      {rec.suggestedCourses?.length > 0 && (
                        <div className="mt-3 text-xs text-slate-400">
                          Suggested courses:{' '}
                          <span className="text-slate-200">
                            {rec.suggestedCourses.slice(0, 2).map((c) => c.title).join(' • ')}
                            {rec.suggestedCourses.length > 2 ? ' • …' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 rounded-xl bg-blue-600/20 px-3 py-2 text-xs font-semibold text-blue-100 ring-1 ring-blue-500/25">
                      {rec.matchPercent}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}


