import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/PageHeader'
import { cn } from '../lib/cn'
import { Button } from '../components/ui/Button'
import { useTheme } from '../context/ThemeContext'
import {
  IconBook,
  IconCheck,
  IconClipboard,
  IconGamepad,
  IconMap,
  IconTarget,
  IconUser,
} from '../components/icons'

type GameKey = 'breathing' | 'career-quiz' | 'skill-puzzle' | 'roadmap-runner' | 'interview-sim'

const games: Array<{
  key: GameKey
  name: string
  xp: number
  difficulty: string
  status: 'playable'
  description: string
}> = [
  {
    key: 'breathing',
    name: 'Focus / Breathing',
    xp: 30,
    difficulty: 'Very Safe',
    status: 'playable',
    description: 'A calm 30-second breathing exercise to reset focus.',
  },
  {
    key: 'career-quiz',
    name: 'Career Quiz Sprint',
    xp: 120,
    difficulty: 'Easy',
    status: 'playable',
    description: 'Fast MCQ quiz: RIASEC + tech direction basics (60s).',
  },
  {
    key: 'skill-puzzle',
    name: 'Skill Match Puzzle',
    xp: 180,
    difficulty: 'Medium',
    status: 'playable',
    description: 'Match roles to skills (tap-to-pair).',
  },
  {
    key: 'roadmap-runner',
    name: 'Roadmap Runner',
    xp: 250,
    difficulty: 'Medium',
    status: 'playable',
    description: 'Quick decisions to keep your learning momentum (30s).',
  },
  {
    key: 'interview-sim',
    name: 'Interview Simulator',
    xp: 300,
    difficulty: 'Hard',
    status: 'playable',
    description: 'Practice prompts with structured tips (no grading).',
  },
]

function msToSeconds(ms: number) {
  return Math.max(0, Math.ceil(ms / 1000))
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n))
}

function GameShell(props: {
  title: string
  subtitle: string
  onExit: () => void
  children: ReactNode
}) {
  const { title, subtitle, onExit, children } = props
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <PageHeader title={title} subtitle={subtitle} />
      <Card
        title="Game Mode"
        right={
          <Button
            type="button"
            onClick={onExit}
            size="sm"
            variant="secondary"
          >
            Exit
          </Button>
        }
      >
        {children}
      </Card>
    </div>
  )
}

export function MiniGamesPage() {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const [activeGame, setActiveGame] = useState<GameKey | null>(null)

  // Breathing game state (30s total).
  const totalMs = 30_000
  const [running, setRunning] = useState(false)
  const [remainingMs, setRemainingMs] = useState(totalMs)
  const [finished, setFinished] = useState(false)

  const startedAtRef = useRef<number | null>(null)
  const remainingAtStartRef = useRef<number>(totalMs)

  const phase = useMemo(() => {
    // 8s loop: inhale 4s, exhale 4s (based on elapsed inside the 30s session).
    const elapsed = totalMs - remainingMs
    const loop = elapsed % 8000
    return loop < 4000 ? 'Inhale' : 'Exhale'
  }, [remainingMs])

  const progress = useMemo(() => {
    return clamp01((totalMs - remainingMs) / totalMs)
  }, [remainingMs])

  useEffect(() => {
    if (!running) return
    if (startedAtRef.current == null) startedAtRef.current = Date.now()

    const id = window.setInterval(() => {
      const startedAt = startedAtRef.current ?? Date.now()
      const elapsed = Date.now() - startedAt
      const nextRemaining = Math.max(0, remainingAtStartRef.current - elapsed)

      setRemainingMs(nextRemaining)
      if (nextRemaining <= 0) {
        setRunning(false)
        setFinished(true)
      }
    }, 100)

    return () => window.clearInterval(id)
  }, [running])

  function resetBreathing() {
    setRunning(false)
    setFinished(false)
    setRemainingMs(totalMs)
    startedAtRef.current = null
    remainingAtStartRef.current = totalMs
  }

  function startBreathing() {
    setFinished(false)
    setRunning(true)
    startedAtRef.current = Date.now()
    remainingAtStartRef.current = remainingMs
  }

  function pauseBreathing() {
    // Freeze remainingMs at current state.
    setRunning(false)
    startedAtRef.current = null
    remainingAtStartRef.current = remainingMs
  }

  function openGame(key: GameKey) {
    setActiveGame(key)
    if (key === 'breathing') {
      resetBreathing()
      // Start immediately for "game mode" feel.
      requestAnimationFrame(() => startBreathing())
    }
    if (key === 'career-quiz') {
      resetQuiz()
      requestAnimationFrame(() => startQuiz())
    }
    if (key === 'skill-puzzle') {
      resetMatch()
    }
    if (key === 'roadmap-runner') {
      resetRunner()
      requestAnimationFrame(() => startRunner())
    }
    if (key === 'interview-sim') {
      resetInterview()
    }
  }

  function exitGameMode() {
    setActiveGame(null)
    resetBreathing()
    resetQuiz()
    resetMatch()
    resetRunner()
    resetInterview()
  }

  // -----------------------------
  // Career Quiz Sprint (MCQ, 60s)
  // -----------------------------
  const quizTotalMs = 60_000
  const quizQuestions = useMemo(
    () => [
      {
        q: 'RIASEC stands for interest types. What does "I" mean?',
        choices: ['Investigative', 'Interactive', 'Influential', 'Industrial'],
        correct: 0,
        tip: 'Investigative = analytical, curious, problem-solving.',
      },
      {
        q: 'Which type typically prefers structure and organized systems?',
        choices: ['A (Artistic)', 'C (Conventional)', 'S (Social)', 'E (Enterprising)'],
        correct: 1,
        tip: 'Conventional = structured, detail-focused, organized.',
      },
      {
        q: 'What is the purpose of PathFinder (this FYP)?',
        choices: ['Teach full modules', 'Grade students', 'Give guidance and direction', 'Replace lecturers'],
        correct: 2,
        tip: 'Guidance system, not an LMS.',
      },
      {
        q: 'Which path best fits UI/UX and creative digital products?',
        choices: ['Hands‑On Technology Path', 'Creative Technology Path', 'Structured Systems Path', 'Cybersecurity Ops Path'],
        correct: 1,
        tip: 'Artistic traits map well to UI/UX and frontend creation.',
      },
      {
        q: 'A good starter project should be…',
        choices: ['Very large and complex', 'Chosen randomly', 'Small and finishable', 'Only theory'],
        correct: 2,
        tip: 'Finishing one small project builds confidence and evidence.',
      },
      {
        q: 'Which is most aligned with Investigative (I)?',
        choices: ['Data analysis', 'Leading sales teams', 'Event organizing', 'Filing paperwork'],
        correct: 0,
        tip: 'Investigative aligns with analysis, data, and reasoning.',
      },
    ],
    [],
  )

  const [quizIndex, setQuizIndex] = useState(0)
  const [quizSelected, setQuizSelected] = useState<number | null>(null)
  const [quizScore, setQuizScore] = useState(0)
  const [quizRunning, setQuizRunning] = useState(false)
  const [quizRemainingMs, setQuizRemainingMs] = useState(quizTotalMs)
  const [quizFinished, setQuizFinished] = useState(false)
  const quizStartedAtRef = useRef<number | null>(null)
  const quizRemainingAtStartRef = useRef<number>(quizTotalMs)

  useEffect(() => {
    if (!quizRunning) return
    if (quizStartedAtRef.current == null) quizStartedAtRef.current = Date.now()

    const id = window.setInterval(() => {
      const startedAt = quizStartedAtRef.current ?? Date.now()
      const elapsed = Date.now() - startedAt
      const nextRemaining = Math.max(0, quizRemainingAtStartRef.current - elapsed)
      setQuizRemainingMs(nextRemaining)
      if (nextRemaining <= 0) {
        setQuizRunning(false)
        setQuizFinished(true)
      }
    }, 120)

    return () => window.clearInterval(id)
  }, [quizRunning])

  function resetQuiz() {
    setQuizIndex(0)
    setQuizSelected(null)
    setQuizScore(0)
    setQuizRunning(false)
    setQuizRemainingMs(quizTotalMs)
    setQuizFinished(false)
    quizStartedAtRef.current = null
    quizRemainingAtStartRef.current = quizTotalMs
  }

  function startQuiz() {
    setQuizFinished(false)
    setQuizRunning(true)
    quizStartedAtRef.current = Date.now()
    quizRemainingAtStartRef.current = quizRemainingMs
  }

  function submitQuizAnswer() {
    if (quizFinished) return
    const q = quizQuestions[quizIndex]
    if (!q) return
    if (quizSelected == null) return
    if (quizSelected === q.correct) setQuizScore((s) => s + 1)
    setQuizSelected(null)

    const nextIdx = quizIndex + 1
    if (nextIdx >= quizQuestions.length) {
      setQuizRunning(false)
      setQuizFinished(true)
      return
    }
    setQuizIndex(nextIdx)
  }

  // -----------------------------
  // Skill Match Puzzle (tap-to-pair)
  // -----------------------------
  const matchPairs = useMemo(
    () => [
      { role: 'Data Analyst', skill: 'SQL & data interpretation' },
      { role: 'Frontend Developer', skill: 'UI components & responsive layout' },
      { role: 'Cybersecurity (Ops)', skill: 'Monitoring & incident basics' },
      { role: 'Product Associate', skill: 'Prioritization & stakeholder communication' },
    ],
    [],
  )

  const roles = useMemo(() => matchPairs.map((p) => p.role), [matchPairs])
  const skills = useMemo(() => matchPairs.map((p) => p.skill), [matchPairs])
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [selectedSkill, setSelectedSkill] = useState<string>('')
  const [matched, setMatched] = useState<Record<string, string>>({})
  const [matchMessage, setMatchMessage] = useState<string>('')

  function resetMatch() {
    setSelectedRole('')
    setSelectedSkill('')
    setMatched({})
    setMatchMessage('')
  }

  function tryMatch(nextRole: string, nextSkill: string) {
    if (!nextRole || !nextSkill) return
    const correct = matchPairs.find((p) => p.role === nextRole)?.skill === nextSkill
    if (!correct) {
      setMatchMessage('Not a match — try again.')
      return
    }
    setMatchMessage('Matched!')
    setMatched((prev) => ({ ...prev, [nextRole]: nextSkill }))
    setSelectedRole('')
    setSelectedSkill('')
  }

  // -----------------------------
  // Roadmap Runner (30s decisions)
  // -----------------------------
  const runnerTotalMs = 30_000
  const runnerPrompts = useMemo(
    () => [
      { text: 'You feel stuck. What do you do?', a: 'Do a small task (10 min)', b: 'Give up today', correct: 'a' as const },
      { text: 'You found a new track. What next?', a: 'Compare top 3 then choose 1', b: 'Switch every day', correct: 'a' as const },
      { text: 'Your project feels big.', a: 'Break into 3 tiny steps', b: 'Wait for motivation', correct: 'a' as const },
      { text: 'You made mistakes in code.', a: 'Debug and learn', b: 'Assume you are not suited', correct: 'a' as const },
      { text: 'You’re tired.', a: 'Take a short break (breathing)', b: 'Quit completely', correct: 'a' as const },
    ],
    [],
  )

  const [runnerRunning, setRunnerRunning] = useState(false)
  const [runnerRemainingMs, setRunnerRemainingMs] = useState(runnerTotalMs)
  const [runnerFinished, setRunnerFinished] = useState(false)
  const [runnerIndex, setRunnerIndex] = useState(0)
  const [runnerStreak, setRunnerStreak] = useState(0)
  const runnerStartedAtRef = useRef<number | null>(null)
  const runnerRemainingAtStartRef = useRef<number>(runnerTotalMs)

  useEffect(() => {
    if (!runnerRunning) return
    if (runnerStartedAtRef.current == null) runnerStartedAtRef.current = Date.now()

    const id = window.setInterval(() => {
      const startedAt = runnerStartedAtRef.current ?? Date.now()
      const elapsed = Date.now() - startedAt
      const nextRemaining = Math.max(0, runnerRemainingAtStartRef.current - elapsed)
      setRunnerRemainingMs(nextRemaining)
      if (nextRemaining <= 0) {
        setRunnerRunning(false)
        setRunnerFinished(true)
      }
    }, 120)

    return () => window.clearInterval(id)
  }, [runnerRunning])

  function resetRunner() {
    setRunnerRunning(false)
    setRunnerRemainingMs(runnerTotalMs)
    setRunnerFinished(false)
    setRunnerIndex(0)
    setRunnerStreak(0)
    runnerStartedAtRef.current = null
    runnerRemainingAtStartRef.current = runnerTotalMs
  }

  function startRunner() {
    setRunnerFinished(false)
    setRunnerRunning(true)
    runnerStartedAtRef.current = Date.now()
    runnerRemainingAtStartRef.current = runnerRemainingMs
  }

  function pauseRunner() {
    setRunnerRunning(false)
    runnerStartedAtRef.current = null
    runnerRemainingAtStartRef.current = runnerRemainingMs
  }

  function answerRunner(choice: 'a' | 'b') {
    if (!runnerRunning || runnerFinished) return
    const prompt = runnerPrompts[runnerIndex]
    if (!prompt) return
    setRunnerStreak((s) => (choice === prompt.correct ? s + 1 : 0))
    setRunnerIndex((i) => (i + 1) % runnerPrompts.length)
  }

  // -----------------------------
  // Interview Simulator (guided prompts)
  // -----------------------------
  const interviewPrompts = useMemo(
    () => [
      {
        q: 'Tell me about yourself (for a tech role).',
        tip: 'Use: Present (who you are) → Past (what you did) → Future (what you want). Keep it 60–90 seconds.',
      },
      {
        q: 'Why do you want to learn this technology track?',
        tip: 'Connect your RIASEC/Career Path to motivation, then mention one project you want to build.',
      },
      {
        q: 'Describe a time you solved a problem.',
        tip: 'Use STAR: Situation → Task → Action → Result. Keep it simple and honest.',
      },
      {
        q: 'What will you do if you get stuck while learning?',
        tip: 'Mention steps: search, read docs, break into parts, ask for help, then document what you learned.',
      },
    ],
    [],
  )

  const [interviewIndex, setInterviewIndex] = useState(0)
  const [interviewNotes, setInterviewNotes] = useState('')
  const [interviewSaved, setInterviewSaved] = useState(false)

  function resetInterview() {
    setInterviewIndex(0)
    setInterviewNotes('')
    setInterviewSaved(false)
  }

  function nextInterview() {
    setInterviewSaved(false)
    setInterviewIndex((i) => (i + 1) % interviewPrompts.length)
  }

  // Dedicated Game Mode UI
  if (activeGame === 'breathing') {
    const secondsLeft = msToSeconds(remainingMs)

    return (
      <div className="mx-auto max-w-3xl space-y-4">
        {/* Local styles for breathing animation (no external libs). */}
        <style>{`
          @keyframes pf-breathe {
            0%   { transform: scale(0.78); }
            50%  { transform: scale(1.00); }
            100% { transform: scale(0.78); }
          }
          @keyframes pf-glow {
            0%, 100% { opacity: 0.55; }
            50%      { opacity: 0.95; }
          }
        `}</style>

        <PageHeader
          title="Focus / Breathing (Game Mode)"
          subtitle="Follow the circle. Inhale as it expands, exhale as it contracts. 30 seconds."
        />

        <Card
          title="Breathing Session"
          right={
            <button
              type="button"
              onClick={exitGameMode}
              className={cn(
                "rounded-xl border px-3 py-2 text-xs font-semibold transition",
                isLight
                  ? "border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200"
                  : "border-slate-800/70 bg-slate-950/40 text-slate-200 hover:bg-slate-900/60"
              )}
            >
              Exit
            </button>
          }
        >
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <span className="grid size-9 place-items-center rounded-xl bg-blue-600/15 text-blue-100 ring-1 ring-blue-500/20">
                  <IconTarget size={18} className="text-blue-200" />
                </span>
                <div>
                  <div className={cn(
                    "text-xs font-semibold",
                    isLight ? "text-slate-600" : "text-slate-400"
                  )}>
                    Current phase
                  </div>
                  <div className={cn(
                    "text-sm font-semibold",
                    isLight ? "text-slate-900" : "text-slate-100"
                  )}>
                    {finished ? 'Complete' : phase}
                  </div>
                </div>
              </div>

              <div className={cn(
                "rounded-2xl border px-4 py-2 text-sm font-semibold",
                isLight
                  ? "border-slate-200 bg-slate-50 text-slate-900"
                  : "border-slate-800/70 bg-slate-950/30 text-slate-100"
              )}>
                {secondsLeft}s
              </div>
            </div>

            {/* Progress bar */}
            <div className={cn(
              "h-2 w-full rounded-full",
              isLight ? "bg-slate-200" : "bg-slate-800/70"
            )}>
              <div
                className="h-2 rounded-full bg-emerald-400/60"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>

            {/* Animated breathing circle */}
            <div className="grid place-items-center py-6">
              <div className="relative">
                <div
                  className={cn(
                    'grid size-56 place-items-center rounded-full',
                    'bg-[radial-gradient(circle_at_30%_25%,rgba(59,130,246,0.28),rgba(2,6,23,0.25)_55%,rgba(2,6,23,0.05)_75%)]',
                    'ring-1 ring-slate-800/70',
                  )}
                  style={{
                    animation: finished ? 'none' : 'pf-breathe 8s ease-in-out infinite',
                  }}
                >
                  <div
                    className="absolute inset-0 rounded-full bg-blue-500/10"
                    style={{
                      animation: finished ? 'none' : 'pf-glow 4s ease-in-out infinite',
                    }}
                  />
                  <div className="relative text-center">
                    <div className={cn(
                      "text-xs font-semibold",
                      isLight ? "text-slate-700" : "text-slate-300"
                    )}>
                      Breathe
                    </div>
                    <div className={cn(
                      "mt-2 text-2xl font-semibold",
                      isLight ? "text-slate-900" : "text-slate-100"
                    )}>
                      {finished ? 'Well done' : phase}
                    </div>
                    <div className={cn(
                      "mt-2 text-sm",
                      isLight ? "text-slate-700" : "text-slate-300/90"
                    )}>
                      {finished ? 'You completed 30 seconds.' : 'Follow the rhythm.'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={resetBreathing}
                className={cn(
                  "rounded-2xl border px-5 py-3 text-sm font-semibold transition",
                  isLight
                    ? "border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200"
                    : "border-slate-800/70 bg-slate-950/40 text-slate-200 hover:bg-slate-900/60"
                )}
              >
                Restart
              </button>

              {!finished ? (
                running ? (
                  <button
                    type="button"
                    onClick={pauseBreathing}
                    className="rounded-2xl bg-blue-600/20 px-5 py-3 text-sm font-semibold text-blue-100 ring-1 ring-blue-500/25 hover:bg-blue-600/25"
                  >
                    Pause
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startBreathing}
                    className="rounded-2xl bg-blue-600/20 px-5 py-3 text-sm font-semibold text-blue-100 ring-1 ring-blue-500/25 hover:bg-blue-600/25"
                  >
                    {remainingMs < totalMs ? 'Resume' : 'Start'}
                  </button>
                )
              ) : (
                <button
                  type="button"
                  onClick={exitGameMode}
                  className="rounded-2xl bg-emerald-600/20 px-5 py-3 text-sm font-semibold text-emerald-100 ring-1 ring-emerald-500/25 hover:bg-emerald-600/25"
                >
                  Exit Game Mode
                </button>
              )}
            </div>

            <div className={cn(
              "rounded-2xl border px-4 py-3 text-xs",
              isLight
                ? "border-slate-200 bg-slate-50 text-slate-600"
                : "border-slate-800/70 bg-slate-950/30 text-slate-400"
            )}>
              Safety note: This is a simple breathing timer (no medical claims). Stop anytime if you feel uncomfortable.
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (activeGame === 'career-quiz') {
    const q = quizQuestions[quizIndex]
    const secondsLeft = msToSeconds(quizRemainingMs)
    const quizProgress = clamp01((quizTotalMs - quizRemainingMs) / quizTotalMs)

    return (
      <GameShell
        title="Career Quiz Sprint (Game Mode)"
        subtitle="Answer fast. Learn key terms. 60 seconds."
        onExit={exitGameMode}
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-xl bg-blue-600/15 text-blue-100 ring-1 ring-blue-500/20">
                <IconBook size={18} className="text-blue-200" />
              </span>
              <div>
                <div className={cn(
                  "text-xs font-semibold",
                  isLight ? "text-slate-600" : "text-slate-400"
                )}>
                  Score
                </div>
                <div className={cn(
                  "text-sm font-semibold",
                  isLight ? "text-slate-900" : "text-slate-100"
                )}>
                  {quizScore} / {quizQuestions.length}
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 px-4 py-2 text-sm font-semibold text-slate-100">
              {secondsLeft}s
            </div>
          </div>

          <div className="h-2 w-full rounded-full bg-slate-800/70">
            <div className="h-2 rounded-full bg-blue-500/60" style={{ width: `${Math.round(quizProgress * 100)}%` }} />
          </div>

          <div className={cn(
            "rounded-2xl border px-4 py-4",
            isLight ? "border-slate-200 bg-white" : "border-slate-800/70 bg-slate-950/30"
          )}>
            <div className={cn(
              "text-xs font-semibold",
              isLight ? "text-slate-600" : "text-slate-400"
            )}>
              Question {Math.min(quizIndex + 1, quizQuestions.length)} / {quizQuestions.length}
            </div>
            <div className={cn(
              "mt-2 text-base font-semibold",
              isLight ? "text-slate-900" : "text-slate-100"
            )}>
              {q?.q}
            </div>
            <div className="mt-4 grid grid-cols-1 gap-2">
              {(q?.choices ?? []).map((c, idx) => {
                const selected = quizSelected === idx
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setQuizSelected(idx)}
                    disabled={quizFinished}
                    className={cn(
                      'rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition',
                      selected
                        ? isLight
                          ? 'border-blue-400 bg-blue-100 text-blue-900'
                          : 'border-blue-500/35 bg-blue-600/15 text-blue-100'
                        : isLight
                          ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          : 'border-slate-800/70 bg-slate-950/40 text-slate-200 hover:bg-slate-900/60',
                      quizFinished && 'opacity-60',
                    )}
                  >
                    {c}
                  </button>
                )
              })}
            </div>
            {q?.tip && <div className={cn(
              "mt-3 text-xs",
              isLight ? "text-slate-600" : "text-slate-400"
            )}>
              Tip: {q.tip}
            </div>}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={resetQuiz}
              className="rounded-2xl border border-slate-800/70 bg-slate-950/40 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-900/60"
            >
              Restart
            </button>

            {quizFinished ? (
              <button
                type="button"
                onClick={exitGameMode}
                className="rounded-2xl bg-emerald-600/20 px-5 py-3 text-sm font-semibold text-emerald-100 ring-1 ring-emerald-500/25 hover:bg-emerald-600/25"
              >
                Exit Game Mode
              </button>
            ) : (
              <button
                type="button"
                onClick={submitQuizAnswer}
                disabled={quizSelected == null}
                className="rounded-2xl bg-blue-600/20 px-5 py-3 text-sm font-semibold text-blue-100 ring-1 ring-blue-500/25 hover:bg-blue-600/25 disabled:opacity-50"
              >
                {quizSelected == null ? 'Select an answer' : 'Next'}
              </button>
            )}
          </div>

          <div className="text-xs text-slate-500">
            This quiz is guidance-only (no grading). It’s just to reinforce key ideas.
          </div>
        </div>
      </GameShell>
    )
  }

  if (activeGame === 'skill-puzzle') {
    const total = roles.length
    const doneCount = Object.keys(matched).length
    const completed = doneCount === total

    return (
      <GameShell
        title="Skill Match Puzzle (Game Mode)"
        subtitle="Tap one role and one skill to match them (conceptual)."
        onExit={exitGameMode}
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-xl bg-violet-600/15 text-violet-100 ring-1 ring-violet-500/20">
                <IconMap size={18} className="text-violet-200" />
              </span>
              <div>
                <div className={cn(
                  "text-xs font-semibold",
                  isLight ? "text-slate-600" : "text-slate-400"
                )}>
                  Progress
                </div>
                <div className={cn(
                  "text-sm font-semibold",
                  isLight ? "text-slate-900" : "text-slate-100"
                )}>
                  {doneCount} / {total} matched
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={resetMatch}
              className="rounded-2xl border border-slate-800/70 bg-slate-950/40 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-900/60"
            >
              Restart
            </button>
          </div>

          {matchMessage && (
            <div
              className={cn(
                'rounded-2xl border px-4 py-3 text-sm font-semibold',
                matchMessage === 'Matched!'
                  ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100'
                  : 'border-rose-500/20 bg-rose-500/10 text-rose-100',
              )}
            >
              {matchMessage}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className={cn(
              "rounded-2xl border px-4 py-4",
              isLight ? "border-slate-200 bg-white" : "border-slate-800/70 bg-slate-950/30"
            )}>
              <div className={cn(
                "text-xs font-semibold",
                isLight ? "text-slate-600" : "text-slate-400"
              )}>
                Roles
              </div>
              <div className="mt-3 space-y-2">
                {roles.map((r) => {
                  const isDone = Boolean(matched[r])
                  const selected = selectedRole === r
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        if (isDone) return
                        setSelectedRole(r)
                        setMatchMessage('')
                        tryMatch(r, selectedSkill)
                      }}
                      className={cn(
                        'w-full rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition',
                        isDone
                          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100'
                          : selected
                            ? 'border-blue-500/35 bg-blue-600/15 text-blue-100'
                            : 'border-slate-800/70 bg-slate-950/40 text-slate-200 hover:bg-slate-900/60',
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span>{r}</span>
                        {isDone && <IconCheck size={16} className="text-emerald-200" />}
                      </div>
                      {isDone && <div className="mt-2 text-xs text-emerald-200/90">Matched to: {matched[r]}</div>}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className={cn(
              "rounded-2xl border px-4 py-4",
              isLight ? "border-slate-200 bg-white" : "border-slate-800/70 bg-slate-950/30"
            )}>
              <div className={cn(
                "text-xs font-semibold",
                isLight ? "text-slate-600" : "text-slate-400"
              )}>
                Skills
              </div>
              <div className="mt-3 space-y-2">
                {skills.map((s) => {
                  const used = Object.values(matched).includes(s)
                  const selected = selectedSkill === s
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        if (used) return
                        setSelectedSkill(s)
                        setMatchMessage('')
                        tryMatch(selectedRole, s)
                      }}
                      className={cn(
                        'w-full rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition',
                        used
                          ? isLight
                            ? 'border-emerald-300 bg-emerald-100 text-emerald-900'
                            : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100'
                          : selected
                            ? isLight
                              ? 'border-blue-400 bg-blue-100 text-blue-900'
                              : 'border-blue-500/35 bg-blue-600/15 text-blue-100'
                            : isLight
                              ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                              : 'border-slate-800/70 bg-slate-950/40 text-slate-200 hover:bg-slate-900/60',
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span>{s}</span>
                        {used && <IconCheck size={16} className="text-emerald-200" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {completed && (
            <div className={cn(
              "rounded-2xl border px-4 py-3 text-sm font-semibold",
              isLight
                ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                : "border-emerald-500/20 bg-emerald-500/10 text-emerald-100"
            )}>
              Completed! You matched all roles and skills.
            </div>
          )}
        </div>
      </GameShell>
    )
  }

  if (activeGame === 'roadmap-runner') {
    const secondsLeft = msToSeconds(runnerRemainingMs)
    const runnerProgress = clamp01((runnerTotalMs - runnerRemainingMs) / runnerTotalMs)
    const prompt = runnerPrompts[runnerIndex]

    return (
      <GameShell
        title="Roadmap Runner (Game Mode)"
        subtitle="Make quick choices that keep your learning momentum. 30 seconds."
        onExit={exitGameMode}
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-xl bg-orange-600/15 text-orange-100 ring-1 ring-orange-500/20">
                <IconGamepad size={18} className="text-orange-200" />
              </span>
              <div>
                <div className={cn(
                  "text-xs font-semibold",
                  isLight ? "text-slate-600" : "text-slate-400"
                )}>
                  Streak
                </div>
                <div className={cn(
                  "text-sm font-semibold",
                  isLight ? "text-slate-900" : "text-slate-100"
                )}>
                  {runnerStreak}
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 px-4 py-2 text-sm font-semibold text-slate-100">
              {secondsLeft}s
            </div>
          </div>

          <div className="h-2 w-full rounded-full bg-slate-800/70">
            <div className="h-2 rounded-full bg-orange-400/60" style={{ width: `${Math.round(runnerProgress * 100)}%` }} />
          </div>

          <div className={cn(
            "rounded-2xl border px-4 py-4",
            isLight ? "border-slate-200 bg-white" : "border-slate-800/70 bg-slate-950/30"
          )}>
            <div className={cn(
              "text-xs font-semibold",
              isLight ? "text-slate-600" : "text-slate-400"
            )}>
              Situation
            </div>
            <div className={cn(
              "mt-2 text-base font-semibold",
              isLight ? "text-slate-900" : "text-slate-100"
            )}>
              {prompt?.text}
            </div>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => answerRunner('a')}
                disabled={!runnerRunning || runnerFinished}
                className={cn(
                  "rounded-2xl px-4 py-3 text-sm font-semibold ring-1 disabled:opacity-50",
                  isLight
                    ? "bg-blue-500 text-white ring-blue-500/30 hover:bg-blue-600"
                    : "bg-blue-600/20 text-blue-100 ring-blue-500/25 hover:bg-blue-600/25"
                )}
              >
                {prompt?.a}
              </button>
              <button
                type="button"
                onClick={() => answerRunner('b')}
                disabled={!runnerRunning || runnerFinished}
                className={cn(
                  "rounded-2xl border px-4 py-3 text-sm font-semibold transition disabled:opacity-50",
                  isLight
                    ? "border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200"
                    : "border-slate-800/70 bg-slate-950/40 text-slate-200 hover:bg-slate-900/60"
                )}
              >
                {prompt?.b}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={resetRunner}
              className="rounded-2xl border border-slate-800/70 bg-slate-950/40 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-900/60"
            >
              Restart
            </button>

            {runnerFinished ? (
              <button
                type="button"
                onClick={exitGameMode}
                className="rounded-2xl bg-emerald-600/20 px-5 py-3 text-sm font-semibold text-emerald-100 ring-1 ring-emerald-500/25 hover:bg-emerald-600/25"
              >
                Exit Game Mode
              </button>
            ) : runnerRunning ? (
              <button
                type="button"
                onClick={pauseRunner}
                className="rounded-2xl bg-orange-600/20 px-5 py-3 text-sm font-semibold text-orange-100 ring-1 ring-orange-500/25 hover:bg-orange-600/25"
              >
                Pause
              </button>
            ) : (
              <button
                type="button"
                onClick={startRunner}
                className="rounded-2xl bg-orange-600/20 px-5 py-3 text-sm font-semibold text-orange-100 ring-1 ring-orange-500/25 hover:bg-orange-600/25"
              >
                Resume
              </button>
            )}
          </div>

          <div className={cn(
            "text-xs",
            isLight ? "text-slate-600" : "text-slate-500"
          )}>
            This is a motivation game (not grading). The "best" choice is the one that keeps you consistent.
          </div>
        </div>
      </GameShell>
    )
  }

  if (activeGame === 'interview-sim') {
    const p = interviewPrompts[interviewIndex]
    return (
      <GameShell
        title="Interview Simulator (Game Mode)"
        subtitle="Practice answers with structure. No grading — just guidance."
        onExit={exitGameMode}
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-xl bg-slate-950/40 text-slate-100 ring-1 ring-slate-800/70">
                <IconUser size={18} className="text-slate-200" />
              </span>
              <div>
                <div className={cn(
                  "text-xs font-semibold",
                  isLight ? "text-slate-600" : "text-slate-400"
                )}>
                  Prompt
                </div>
                <div className={cn(
                  "text-sm font-semibold",
                  isLight ? "text-slate-900" : "text-slate-100"
                )}>
                  {interviewIndex + 1} / {interviewPrompts.length}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={resetInterview}
              className="rounded-2xl border border-slate-800/70 bg-slate-950/40 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-900/60"
            >
              Restart
            </button>
          </div>

          <div className={cn(
            "rounded-2xl border px-4 py-4",
            isLight ? "border-slate-200 bg-white" : "border-slate-800/70 bg-slate-950/30"
          )}>
            <div className={cn(
              "text-xs font-semibold",
              isLight ? "text-slate-600" : "text-slate-400"
            )}>
              Question
            </div>
            <div className={cn(
              "mt-2 text-base font-semibold",
              isLight ? "text-slate-900" : "text-slate-100"
            )}>
              {p?.q}
            </div>
            <div className={cn(
              "mt-3 rounded-2xl border px-4 py-3 text-sm",
              isLight
                ? "border-slate-200 bg-slate-50 text-slate-700"
                : "border-slate-800/70 bg-slate-950/40 text-slate-300/90"
            )}>
              <div className={cn(
                "flex items-center gap-2 text-xs font-semibold",
                isLight ? "text-slate-700" : "text-slate-300"
              )}>
                <IconClipboard size={16} className={isLight ? "text-slate-700" : "text-slate-300"} />
                Tip
              </div>
              <div className="mt-2">{p?.tip}</div>
            </div>
          </div>

          <div className={cn(
            "rounded-2xl border px-4 py-4",
            isLight ? "border-slate-200 bg-white" : "border-slate-800/70 bg-slate-950/30"
          )}>
            <div className={cn(
              "text-xs font-semibold",
              isLight ? "text-slate-600" : "text-slate-400"
            )}>
              Your practice answer (optional)
            </div>
            <textarea
              value={interviewNotes}
              onChange={(e) => {
                setInterviewNotes(e.target.value)
                setInterviewSaved(false)
              }}
              rows={6}
              className={cn(
                "mt-3 w-full resize-none rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                isLight
                  ? "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-500"
                  : "border-slate-800/70 bg-slate-950/40 text-slate-200 placeholder:text-slate-500"
              )}
              placeholder="Write a short answer here. This stays in frontend state (no database)."
            />
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => {
                  setInterviewSaved(true)
                  window.setTimeout(() => setInterviewSaved(false), 1200)
                }}
                className="rounded-2xl bg-blue-600/20 px-5 py-3 text-sm font-semibold text-blue-100 ring-1 ring-blue-500/25 hover:bg-blue-600/25"
              >
                {interviewSaved ? 'Saved' : 'Save'}
              </button>
              <button
                type="button"
                onClick={nextInterview}
                className={cn(
                  "rounded-2xl border px-5 py-3 text-sm font-semibold transition",
                  isLight
                    ? "border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200"
                    : "border-slate-800/70 bg-slate-950/40 text-slate-200 hover:bg-slate-900/60"
                )}
              >
                Next prompt
              </button>
            </div>
          </div>

          <div className={cn(
            "text-xs",
            isLight ? "text-slate-600" : "text-slate-500"
          )}>
            Guidance note: this simulator does not grade you. It helps you structure answers clearly.
          </div>
        </div>
      </GameShell>
    )
  }

  // Normal Mini Games selection view
  return (
    <div className="space-y-6">
      <PageHeader
        title="Mini Games"
        subtitle="Light activities for engagement and motivation (frontend-only)"
      />

      <Card title="Available Games" right={<span className={cn("text-xs", isLight ? "text-slate-600" : "text-slate-400")}>Prototype</span>}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {games.map((g) => (
            <div
              key={g.key}
              className={cn(
                "rounded-2xl border p-4",
                isLight ? "border-slate-200 bg-white" : "border-slate-800/70 bg-slate-950/30"
              )}
            >
              <div className={cn(
                "text-sm font-semibold",
                isLight ? "text-slate-900" : "text-slate-100"
              )}>
                {g.name}
              </div>
              <div className={cn(
                "mt-1 text-xs",
                isLight ? "text-slate-600" : "text-slate-400"
              )}>
                {g.description}
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "rounded-xl px-3 py-2 text-xs font-semibold ring-1",
                    isLight
                      ? "bg-orange-100 text-orange-900 ring-orange-300"
                      : "bg-orange-500/10 text-orange-200 ring-orange-500/25"
                  )}>
                    {g.xp} XP
                  </div>
                  <div className={cn(
                    "text-xs font-semibold",
                    isLight ? "text-slate-600" : "text-slate-400"
                  )}>
                    {g.difficulty}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openGame(g.key)}
                  className={cn(
                    'rounded-xl px-3 py-2 text-xs font-semibold ring-1 transition',
                    isLight
                      ? 'bg-blue-500 text-white ring-blue-500/30 hover:bg-blue-600'
                      : 'bg-blue-600/20 text-blue-100 ring-blue-500/25 hover:bg-blue-600/25',
                  )}
                >
                  Play
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}


