import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { ProgressBar } from '../components/ui/ProgressBar'
import { PageHeader } from '../components/PageHeader'
import { useUserProgress } from '../context/UserProgressContext'
import type { RiasecType } from '../constants/dashboard'
import { cn } from '../lib/cn'
import { riasecQuestions } from '../data/riasecQuestions.js'
import { calculateRiasecScore } from '../utils/calculateRiasecScore.js'
import { getRiasecDescription } from '../utils/getRiasecDescription.js'
import { generateTechRecommendations } from '../utils/generateTechRecommendations.js'
import { generateCareerPath } from '../utils/generateCareerPath.js'
import { useProfile } from '../context/ProfileContext'
import { useAuth } from '../context/AuthContext'

export function PsychometricTestPage() {
  const { progress, submitPsychometricTest, resetPsychometricTest, isHydrating, hydrationError, isSavingPsychometric } = useUserProgress()
  const { user } = useAuth()
  const { profile } = useProfile()
  const resultsRef = useRef<HTMLDivElement | null>(null)
  const location = useLocation()

  // Local answers for the questionnaire (questionId -> Likert value 1..5).
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitError, setSubmitError] = useState<string>('')
  const [hasStarted, setHasStarted] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [stepError, setStepError] = useState<string>('')
  const [showAllTraits, setShowAllTraits] = useState(false)

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
    setShowAllTraits(false)

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
            <InteractiveCareerPathGuidance
              name={profile?.full_name ?? user?.email?.split('@')[0] ?? 'Student'}
              hollandCode={progress.psychometricResult}
              report={progress.careerPathReport}
              showAllTraits={showAllTraits}
              onToggleTraits={() => setShowAllTraits((v) => !v)}
            />
          )}

        </div>
      )}
    </div>
  )
}

function InteractiveCareerPathGuidance(props: {
  name: string
  hollandCode: string
  report: NonNullable<ReturnType<typeof useUserProgress>['progress']['careerPathReport']>
  showAllTraits: boolean
  onToggleTraits: () => void
}) {
  const { name, hollandCode, report, showAllTraits, onToggleTraits } = props

  const heroTitle = report.primaryPath.title
  const heroDesc = report.primaryPath.description
  const primaryFit = report.primaryPath.riasec

  const traitRows = [
    { label: report.primaryPath.title, icon: '🎨' },
    ...report.supportingPaths.slice(0, 1).map((p) => ({ label: p.title, icon: '🛠️' })),
  ]

  const moreTraits = report.supportingPaths.slice(1).map((p) => p.title)
  const roles = report.primaryPath.possibleRoles.slice(0, 2)

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-700/60 bg-slate-950/12 p-6 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.32)]">
      <div className="pointer-events-none absolute inset-0 opacity-70 [mask-image:radial-gradient(1200px_circle_at_25%_20%,black,transparent_70%)]">
        <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_15%,rgba(59,130,246,0.14),transparent_60%),radial-gradient(900px_circle_at_85%_70%,rgba(168,85,247,0.10),transparent_62%),linear-gradient(180deg,rgba(255,255,255,0.05),transparent_40%)]" />
      </div>
      <div className="pointer-events-none absolute inset-0 ring-1 ring-white/5" />

      <div className="relative space-y-3">
        <div className="text-sm font-semibold text-slate-200/90">
          Great job, <span className="text-slate-50">{name}</span>! Based on your results, follow the{' '}
          <span className="text-slate-50">{heroTitle}</span> 🎉
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-slate-800/60 bg-slate-950/25 px-3 py-1 text-xs font-semibold text-slate-200">
            Holland Code: <span className="text-slate-50">{hollandCode}</span>
          </span>
          <span className="rounded-full border border-slate-800/60 bg-slate-950/25 px-3 py-1 text-xs font-semibold text-slate-200">
            Primary Fit: <span className="text-slate-50">{primaryFit}</span>
          </span>
        </div>

        <div className="pt-2">
          <div className="text-4xl font-semibold tracking-tight text-slate-50 md:text-5xl">
            Your <span className="text-slate-50">{heroTitle}</span>
          </div>
          <div className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300/85">
            {heroDesc}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ActionCard
          title="Discover Yourself"
          bullets={['Learn what makes you unique', 'Understand your strengths']}
          ctaLabel="Self Discovery"
          to="#who"
          tint="blue"
          icon={<CardIcon kind="discover" />}
        />
        <ActionCard
          title="Explore Opportunities"
          bullets={['Browse suggested careers', "See each role's key tasks"]}
          ctaLabel="See Careers"
          to="#careers"
          tint="emerald"
          icon={<CardIcon kind="careers" />}
        />
        <ActionCard
          title="Build Skill Set"
          bullets={['Get course recommendations', 'Follow a guided roadmap']}
          ctaLabel="Start Learning"
          to="/learning-roadmap"
          tint="cyan"
          icon={<CardIcon kind="learn" />}
        />
      </div>

      <div className="relative mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[1.25fr_1fr] lg:items-start">
        {/* Connector like the screenshot (desktop only) */}
        <div className="pointer-events-none absolute left-[55%] top-12 hidden w-[340px] -translate-x-1/2 lg:block">
          <svg viewBox="0 0 340 220" fill="none" aria-hidden="true">
            <path
              d="M40 30C120 30 120 110 200 110C270 110 270 190 330 190"
              stroke="rgba(148,163,184,0.28)"
              strokeWidth="2"
            />
            <path
              d="M40 30C120 30 120 110 200 110C270 110 270 190 330 190"
              stroke="rgba(59,130,246,0.30)"
              strokeWidth="2"
              strokeDasharray="6 10"
            />
            <path d="M322 184l10 6-10 6" stroke="rgba(226,232,240,0.7)" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        <div id="who" className="space-y-3">
          <div className="text-2xl font-semibold tracking-tight text-slate-50">Who You Are</div>
          <div className="rounded-2xl border border-slate-700/60 bg-slate-950/18 p-5 shadow-[0_12px_44px_rgba(0,0,0,0.28)] ring-1 ring-white/5">
            <div className="space-y-2">
              {traitRows.map((t) => (
                <div
                  key={t.label}
                  className="flex items-center gap-3 rounded-2xl border border-slate-700/60 bg-slate-950/22 px-4 py-3 text-sm font-semibold text-slate-100 ring-1 ring-white/5"
                >
                  <span className="grid size-9 place-items-center rounded-2xl border border-slate-800/60 bg-slate-950/25 text-base">
                    {t.icon}
                  </span>
                  <span className="truncate">{t.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 text-sm leading-relaxed text-slate-300/80">{report.rationale.primaryWhy}</div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-blue-500/25 bg-blue-600/10 px-3 py-1 text-xs font-semibold text-blue-100">
                {primaryFit}
              </span>
              {report.primaryPath.learningFocus.slice(0, 1).map((x) => (
                <span
                  key={x}
                  className="rounded-full border border-slate-800/60 bg-slate-950/18 px-3 py-1 text-xs font-semibold text-slate-200"
                >
                  {x}
                </span>
              ))}
              {moreTraits.length > 0 && (
                <button
                  type="button"
                  onClick={onToggleTraits}
                  className="rounded-full border border-slate-800/60 bg-slate-950/18 px-3 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-950/28"
                >
                  {showAllTraits ? 'Hide traits' : `+ ${moreTraits.length} More Traits`}
                </button>
              )}
            </div>

            {showAllTraits && moreTraits.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {moreTraits.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-slate-800/60 bg-slate-950/18 px-3 py-1 text-xs font-semibold text-slate-200"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div id="careers" className="space-y-3">
          <div className="text-2xl font-semibold tracking-tight text-slate-50">Where You Could Go</div>
          <div className="grid grid-cols-1 gap-3">
            {roles.map((r) => (
              <CareerCard
                key={r}
                title={r}
                description={getRoleDescription(r, heroTitle)}
                tags={[heroTitle, `${primaryFit} fit`]}
                buttonLabel={getRoleButtonLabel(r)}
              />
            ))}
            <div className="text-center text-sm text-slate-400">And more careers to explore!</div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ActionCard(props: {
  title: string
  bullets: string[]
  ctaLabel: string
  to: string
  tint: 'blue' | 'emerald' | 'cyan'
  icon: React.ReactNode
}) {
  const { title, bullets, ctaLabel, to, tint, icon } = props
  const tintCls =
    tint === 'blue'
      ? 'from-blue-500/18 to-blue-500/2'
      : tint === 'emerald'
        ? 'from-emerald-500/18 to-emerald-500/2'
        : 'from-cyan-500/18 to-cyan-500/2'

  const btnCls =
    tint === 'blue'
      ? 'bg-blue-600/18 text-blue-100 ring-blue-500/20 hover:bg-blue-600/22'
      : tint === 'emerald'
        ? 'bg-emerald-600/18 text-emerald-100 ring-emerald-500/20 hover:bg-emerald-600/22'
        : 'bg-cyan-600/18 text-cyan-100 ring-cyan-500/20 hover:bg-cyan-600/22'

  const content = (
    <div className="relative overflow-hidden rounded-3xl border border-slate-700/60 bg-slate-950/18 p-5 shadow-[0_12px_44px_rgba(0,0,0,0.26)] ring-1 ring-white/5">
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${tintCls}`} />
      <div className="relative">
        <div className="mb-3 flex justify-center">{icon}</div>
        <div className="text-center text-xl font-semibold text-slate-50">{title}</div>
        <ul className="mt-3 space-y-2 text-sm text-slate-300/80">
          {bullets.map((b) => (
            <li key={b} className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-slate-300/60" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex justify-center">
          <span className={cn('inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold ring-1', btnCls)}>
            <span className="grid size-7 place-items-center rounded-xl border border-white/10 bg-white/5">⌁</span>
            {ctaLabel} <span aria-hidden="true">›</span>
          </span>
        </div>
      </div>
    </div>
  )

  if (to.startsWith('#')) {
    return (
      <button
        type="button"
        onClick={() => {
          const el = document.querySelector(to)
          el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }}
        className="text-left"
      >
        {content}
      </button>
    )
  }

  return (
    <Link to={to} className="block">
      {content}
    </Link>
  )
}

function CareerCard(props: { title: string; description: string; tags: string[]; buttonLabel: string }) {
  const { title, description, tags, buttonLabel } = props
  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-950/18 p-5 shadow-[0_12px_44px_rgba(0,0,0,0.26)] ring-1 ring-white/5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-base font-semibold text-slate-100">{title}</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.slice(0, 2).map((t) => (
              <span
                key={t}
                className="rounded-full border border-slate-800/60 bg-slate-950/18 px-3 py-1 text-xs font-semibold text-slate-200"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 text-sm leading-relaxed text-slate-300/80">{description}</div>
      <div className="mt-4">
        <Link
          to="/course-recommendation"
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-800/60 bg-slate-950/20 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-950/30"
        >
          {buttonLabel} <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  )
}

function CardIcon(props: { kind: 'discover' | 'careers' | 'learn' }) {
  const { kind } = props
  const border =
    kind === 'discover'
      ? 'border-blue-500/25 shadow-[0_0_30px_rgba(59,130,246,0.15)]'
      : kind === 'careers'
        ? 'border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.12)]'
        : 'border-cyan-500/20 shadow-[0_0_30px_rgba(34,211,238,0.12)]'

  const icon =
    kind === 'discover'
      ? '💡'
      : kind === 'careers'
        ? '🧭'
        : '💻'

  return (
    <div className={cn('grid size-14 place-items-center rounded-2xl border bg-slate-950/20 text-xl', border)}>
      {icon}
    </div>
  )
}

function getRoleDescription(role: string, pathTitle: string) {
  const r = role.toLowerCase()
  if (r.includes('ui') || r.includes('ux') || r.includes('designer')) {
    return 'Design user interfaces and improve digital experiences.'
  }
  if (r.includes('app') || r.includes('mobile')) {
    return 'Build mobile or web applications with coding languages.'
  }
  if (r.includes('frontend')) {
    return 'Build responsive interfaces and polished web experiences.'
  }
  if (r.includes('game')) {
    return 'Create interactive experiences and game systems.'
  }
  return `Explore careers related to ${pathTitle} and see what you can work towards.`
}

function getRoleButtonLabel(role: string) {
  const r = role.toLowerCase()
  if (r.includes('ui') || r.includes('ux') || r.includes('designer')) return 'Learn About UI/UX'
  if (r.includes('app') || r.includes('mobile')) return 'Learn About App Dev'
  if (r.includes('frontend')) return 'Learn About Frontend'
  if (r.includes('game')) return 'Learn About Game Dev'
  return `Learn About ${role.split(' ')[0]}`
}


