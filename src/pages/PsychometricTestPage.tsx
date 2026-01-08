import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/PageHeader'
import { useUserProgress } from '../context/UserProgressContext'
import { useTheme } from '../context/ThemeContext'
import type { RiasecType } from '../constants/dashboard'
import { cn } from '../lib/cn'
import { riasecQuestions } from '../data/riasecQuestions.js'
import { fetchAllQuestions, type QuestionRow } from '../lib/questionsRepo'
import { calculateRiasecScore } from '../utils/calculateRiasecScore.js'
import { getRiasecDescription } from '../utils/getRiasecDescription.js'
import { generateGeneralCourseRecommendations } from '../utils/generateGeneralCourseRecommendations.js'
import { generateCareerPath } from '../utils/generateCareerPath.js'
import { useProfile } from '../context/ProfileContext'
import { useAuth } from '../context/AuthContext'
import { useRole } from '../context/RoleContext'
import {
  IconWrench,
  IconLightbulb,
  IconPalette,
  IconMessageHeart,
  IconBriefcase,
  IconClipboardCheck,
  IconQuestion,
  IconArrowRight,
} from '../components/icons'
import { DiscoverYourself } from '../components/DiscoverYourself'
import { riasecTypeInfo } from '../lib/discoverYourselfContent'
import { useLanguage } from '../context/LanguageContext'
import styles from './PsychometricTestPage.module.css'

// Page-specific translations (kept local to this page)
// Typed via `as const` so properties are concrete strings instead of `unknown`.
const translations = {
  en: {
    // Page headers
    pageTitle: 'Psychometric Test',
    pageSubtitle: 'Answer one statement at a time. Your responses are used to generate your guidance.',
    whatIsTest: 'What is this test?',
    whatIsTestDesc1: 'This assessment is designed to help you discover your unique personality traits and interests using the globally recognized RIASEC model. It provides insights into how you think, learn, and interact with the world around you.',
    whatIsTestDesc2: 'By answering these simple questions, you will receive a personalized profile that aligns with your natural strengths. There are no right or wrong answers — simply choose the options that best describe you.',
    whatIsTestPoints: [
      'Helps align learning paths and careers to your strengths.',
      'Takes only a few minutes to complete.',
    ],

    // Buttons
    startTest: 'Start Test',
    continueTest: 'Continue Test',
    exit: 'Exit',
    back: 'Back',
    next: 'Next',
    submitTest: 'Submit Test',
    saving: 'Saving…',
    loading: 'Loading...',
    retakeTest: 'Retake Test',
    viewRecommendations: 'View Recommendations',

    // Test status
    completed: 'Completed',
    notTaken: 'Not Taken',
    testCompleted: 'Test Completed',
    yourHollandCode: 'Your Holland Code:',

    // Questions
    question: 'Question',
    of: 'of',
    type: 'Type',
    yes: 'Yes',
    no: 'No',
    answered: 'Answered',
    tip: 'Tip: You can use Back to review and change answers before submitting.',

    // Errors
    pleaseAnswerAll: 'Please answer all questions before submitting.',
    pleaseSelectAnswer: 'Please select Yes or No before continuing.',
    retakeConfirm: 'Are you sure you want to retake the test? This will delete your current results and reset your career guidance.',
    failedToReset: 'Failed to reset psychometric result.',
    failedToSave: 'Failed to save result.',

    // RIASEC cards
    riasecCards: {
      R: {
        title: 'Realistic',
        description: '🛠️ Realistic (R) – Enjoy work involving technical, mechanical, or physical skills.',
      },
      I: {
        title: 'Investigative',
        description: '🧪 Investigative (I) – Enjoy analyzing, researching, and solving problems.',
      },
      A: {
        title: 'Artistic',
        description: '🎨 Artistic (A) – Tend towards creativity and self-expression.',
      },
      S: {
        title: 'Social',
        description: '🤝 Social (S) – Enjoy interacting and helping others.',
      },
      E: {
        title: 'Enterprising',
        description: '💼 Enterprising (E) – Oriented towards leadership and entrepreneurship.',
      },
      C: {
        title: 'Conventional',
        description: '🗂️ Conventional (C) – Enjoy structure and systematic work.',
      },
    },
    whatDoRiasecMean: 'What do RIASEC types mean?',
    riasecTypes: 'RIASEC Types',
  },
  my: {
    // Page headers
    pageTitle: 'Ujian Psikometrik',
    pageSubtitle: 'Jawab satu kenyataan pada satu masa. Respons anda digunakan untuk menjana panduan anda.',
    whatIsTest: 'Apakah ujian ini?',
    whatIsTestDesc1: 'Penilaian ini direka untuk membantu anda menemui ciri-ciri personaliti dan minat unik anda menggunakan model RIASEC yang diiktiraf di peringkat global. Ia memberikan pandangan tentang cara anda berfikir, belajar, dan berinteraksi dengan dunia di sekeliling anda.',
    whatIsTestDesc2: 'Dengan menjawab soalan-soalan mudah ini, anda akan menerima profil peribadi yang selaras dengan kekuatan semula jadi anda. Tiada jawapan betul atau salah — hanya pilih pilihan yang paling menggambarkan diri anda.',
    whatIsTestPoints: [
      'Membantu menyelaraskan laluan pembelajaran dan kerjaya dengan kekuatan anda.',
      'Hanya mengambil masa beberapa minit untuk diselesaikan.',
    ],

    // Buttons
    startTest: 'Mula Ujian',
    continueTest: 'Teruskan Ujian',
    exit: 'Keluar',
    back: 'Kembali',
    next: 'Seterusnya',
    submitTest: 'Hantar Ujian',
    saving: 'Menyimpan…',
    loading: 'Memuatkan...',
    retakeTest: 'Ambil Ujian Semula',
    viewRecommendations: 'Lihat Cadangan',

    // Test status
    completed: 'Selesai',
    notTaken: 'Belum Diambil',
    testCompleted: 'Ujian Selesai',
    yourHollandCode: 'Kod Holland Anda:',

    // Questions
    question: 'Soalan',
    of: 'daripada',
    type: 'Jenis',
    yes: 'Ya',
    no: 'Tidak',
    answered: 'Dijawab',
    tip: 'Petua: Anda boleh menggunakan Kembali untuk menyemak dan menukar jawapan sebelum menghantar.',

    // Errors
    pleaseAnswerAll: 'Sila jawab semua soalan sebelum menghantar.',
    pleaseSelectAnswer: 'Sila pilih Ya atau Tidak sebelum meneruskan.',
    retakeConfirm: 'Adakah anda pasti mahu mengambil ujian semula? Ini akan memadamkan keputusan semasa anda dan menetapkan semula panduan kerjaya anda.',
    failedToReset: 'Gagal menetapkan semula keputusan psikometrik.',
    failedToSave: 'Gagal menyimpan keputusan.',

    // RIASEC cards
    riasecCards: {
      R: {
        title: 'Realistik',
        description: '🛠️ Realistik (R) – Suka kerja yang melibatkan kemahiran teknikal, mekanikal, atau fizikal.',
      },
      I: {
        title: 'Investigatif',
        description: '🧪 Investigatif (I) – Gemar menganalisis, menyelidik, dan menyelesaikan masalah.',
      },
      A: {
        title: 'Artistik',
        description: '🎨 Artistik (A) – Cenderung kepada kreativiti dan ekspresi diri.',
      },
      S: {
        title: 'Sosial',
        description: '🤝 Sosial (S) – Suka berinteraksi dan membantu orang lain.',
      },
      E: {
        title: 'Enterprising',
        description: '💼 Enterprising (E) – Berorientasikan kepimpinan dan keusahawanan.',
      },
      C: {
        title: 'Konvensional',
        description: '🗂️ Konvensional (C) – Gemar struktur dan kerja sistematik.',
      },
    },
    whatDoRiasecMean: 'Apakah maksud jenis RIASEC?',
    riasecTypes: 'Jenis RIASEC',
  },
} as const

export function PsychometricTestPage() {
  const { progress, submitPsychometricTest, resetPsychometricTest, hydrationError, isSavingPsychometric } = useUserProgress()
  const { user } = useAuth()
  const { profile } = useProfile()
  const { hasPermission } = useRole()
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const resultsRef = useRef<HTMLDivElement | null>(null)
  const location = useLocation()

  // Use global language from context
  const { language } = useLanguage()
  const t = translations[language]

  // Questions state - load from database
  const [questions, setQuestions] = useState<QuestionRow[]>([])
  const [questionsLoading, setQuestionsLoading] = useState(true)

  // Load questions from database on mount
  useEffect(() => {
    async function loadQuestions() {
      try {
        const dbQuestions = await fetchAllQuestions()
        setQuestions(dbQuestions)
      } catch (error) {
        // Fallback to static questions if database is not available
        console.warn('Failed to load questions from database, using static questions:', error)
        setQuestions(
          riasecQuestions.map((q) => ({
            id: q.id,
            text: q.text,
            type: q.type as QuestionRow['type'],
            is_active: true,
          })),
        )
      } finally {
        setQuestionsLoading(false)
      }
    }
    loadQuestions()
  }, [])

  // Get translated questions - memoized for performance
  const translatedQuestions = useMemo(() => {
    // Use database questions if available, otherwise fallback to static
    const baseQuestions =
      questions.length > 0
        ? questions
        : riasecQuestions.map((q) => ({
            id: q.id,
            text: q.text,
            type: q.type as QuestionRow['type'],
          }))

    if (language === 'my') {
      // Malay translations for questions
      // Note: For now, we'll use English questions. You can add Malay translations to the database later
      return baseQuestions.map((q) => ({
        id: q.id,
        text: q.text, // In future, you can store translations in the database
        type: q.type,
      }))
    }
    return baseQuestions
  }, [language, questions])

  // Local answers for the questionnaire (questionId -> Likert value 1..5).
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitError, setSubmitError] = useState<string>('')
  const [hasStarted, setHasStarted] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [stepError, setStepError] = useState<string>('')
  const [showAllTraits, setShowAllTraits] = useState(false)
  const [showRiasecInfo, setShowRiasecInfo] = useState(false)

  const canSubmit = !progress.psychometricCompleted
  const isTakingTest = hasStarted && canSubmit

  // toggleLanguage is provided by LanguageContext

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

  // Check permission
  if (!hasPermission('take_psychometric_test')) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Access Restricted"
          subtitle="This feature is only available for students."
        />
        <Card title="Permission Denied">
          <div className={cn('space-y-3 text-sm', isLight ? 'text-slate-700' : 'text-slate-300')}>
            <p>Teachers cannot take the psychometric test.</p>
            <p className={cn('text-xs', isLight ? 'text-slate-600' : 'text-slate-400')}>
              Please contact an administrator if you believe this is an error.
            </p>
          </div>
        </Card>
      </div>
    )
  }

  function setAnswer(questionId: string, value: number) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  function handleStart() {
    if (progress.psychometricCompleted) return
    setHasStarted(true)
    setCurrentIndex((prev) => {
      // If user already answered some, resume at the first unanswered question.
      if (answeredCount === 0) return 0
      const firstUnanswered = translatedQuestions.findIndex((q) => !answers[String(q.id)])
      return firstUnanswered === -1 ? Math.min(translatedQuestions.length - 1, prev) : firstUnanswered
    })
    setSubmitError('')
    setStepError('')
  }

  function handleExitTest() {
    setHasStarted(false)
    setStepError('')
  }

  async function handleRetest() {
    const ok = window.confirm(t.retakeConfirm)
    if (!ok) return

    // Clear saved results + guidance so the user can submit again.
    try {
      await resetPsychometricTest()
    } catch (e) {
      const msg = e instanceof Error ? e.message : t.failedToReset
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

    if (answeredCount !== translatedQuestions.length) {
      setSubmitError(t.pleaseAnswerAll)
      return
    }

    setSubmitError('')

    // Pass questions to calculateRiasecScore
    const { percentages, topType, code } = calculateRiasecScore(answers, translatedQuestions)
    const top = topType as RiasecType
    // Generate general course recommendations and adapt to old format for storage
    const generalCourses = generateGeneralCourseRecommendations(top)
    const recommendations = generalCourses.map((course, idx) => ({
      subDomain: course.courseName,
      matchPercent: 90 - idx * 5, // Decreasing match percentage
      explanation: course.focusDescription,
      suggestedCourses: [], // Not used in new design
      starterProjects: [], // Not used in new design
      tools: course.toolsAndSkills,
    }))
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
      const msg = e instanceof Error ? e.message : t.failedToSave
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
    const q = translatedQuestions[currentIndex]
    const current = answers[String(q.id)]
    if (current === undefined || current === null) {
      setStepError(t.pleaseSelectAnswer)
      return
    }
    setStepError('')
    setCurrentIndex((i) => Math.min(translatedQuestions.length - 1, i + 1))
  }

  function handleBack() {
    setStepError('')
    setCurrentIndex((i) => Math.max(0, i - 1))
  }

  // Show loading state while questions are loading
  if (questionsLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title={t.pageTitle} subtitle={t.pageSubtitle} />
        <Card>
          <div className="py-8 text-center text-sm text-slate-400">Loading questions...</div>
        </Card>
      </div>
    )
  }

  // Focused questionnaire: one question at a time.
  if (isTakingTest) {
    const q = translatedQuestions[currentIndex]
    if (!q) {
      return (
        <div className="space-y-6">
          <PageHeader title={t.pageTitle} subtitle={t.pageSubtitle} />
          <Card>
            <div className="py-8 text-center text-sm text-rose-400">No questions available. Please contact an administrator.</div>
          </Card>
        </div>
      )
    }
    const current = answers[String(q.id)]
    const isLast = currentIndex === translatedQuestions.length - 1
    const progressPercent = Math.round(((currentIndex + 1) / translatedQuestions.length) * 100)

    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="flex items-start justify-between">
          <PageHeader
            title={String(t.pageTitle)}
            subtitle={t.pageSubtitle ? String(t.pageSubtitle) : undefined}
          />
        </div>

        <Card
          title={`${t.question} ${currentIndex + 1} ${t.of} ${translatedQuestions.length}`}
          right={
            <div className="flex items-center gap-2">
              <div className={cn("text-xs font-semibold", isLight ? "text-slate-500" : "text-slate-400")}>{progressPercent}%</div>
              <button
                type="button"
                onClick={handleExitTest}
                className={cn(
                  "rounded-xl border px-3 py-2 text-xs font-semibold transition-colors",
                  isLight
                    ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm"
                    : "border-slate-800/70 bg-slate-950/40 text-slate-200 hover:bg-slate-900/60"
                )}
              >
                {String(t.exit)}
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Progress bar - thinner and lighter in light mode */}
            <div className={cn(
              "w-full rounded-full",
              isLight ? "h-1 bg-slate-100" : "h-2 bg-slate-800/70"
            )}>
              <div
                className={cn(
                  "rounded-full",
                  isLight ? "h-1 bg-blue-400" : "h-2 bg-blue-500/60"
                )}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Question card - soft background in light mode */}
            <div className={cn(
              "rounded-2xl border px-4 py-4",
              isLight
                ? "border-slate-200 bg-white shadow-sm"
                : "border-slate-800/70 bg-slate-950/30"
            )}>
              <div className={cn(
                "text-xs font-semibold",
                isLight ? "text-slate-500" : "text-slate-400"
              )}>
                {t.type}: <span className={isLight ? "text-slate-700" : "text-slate-200"}>{q.type}</span>
              </div>
              <div className={cn(
                "mt-2 text-base font-semibold",
                isLight ? "text-slate-900" : "text-slate-100"
              )}>
                {q.text}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  { value: 1, label: String(t.yes) },
                  { value: 0, label: String(t.no) },
                ].map((option) => {
                  const selected = current === option.value
                  return (
                    <label
                      key={option.value}
                      className={cn(
                        "cursor-pointer rounded-xl border px-4 py-4 text-center text-sm font-semibold transition",
                        selected
                          ? isLight
                            ? option.value === 1
                              ? "border-blue-300 bg-blue-50 text-blue-700 shadow-sm"
                              : "border-slate-300 bg-slate-100 text-slate-700 shadow-sm"
                            : option.value === 1
                              ? "border-emerald-500/40 bg-emerald-600/20 text-emerald-100"
                              : "border-rose-500/40 bg-rose-600/20 text-rose-100"
                          : isLight
                            ? "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 shadow-sm"
                            : "border-slate-800/70 bg-slate-950/40 text-slate-200 hover:bg-slate-900/60"
                      )}
                    >
                      <input
                        type="radio"
                        name={String(q.id)}
                        value={option.value}
                        checked={selected}
                        onChange={() => {
                          setAnswer(String(q.id), option.value)
                          setStepError('')
                        }}
                        className="sr-only"
                      />
                      {option.label}
                    </label>
                  )
                })}
              </div>
            </div>

            {stepError && (
              <div
                className={cn(
                  'rounded-xl border px-4 py-3 text-sm font-medium',
                  isLight
                    ? 'border-rose-200 bg-rose-50 text-rose-700'
                    : 'border-rose-500/20 bg-rose-500/10 text-rose-200',
                )}
              >
                {stepError}
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentIndex === 0}
                className={cn(
                  "rounded-2xl border px-5 py-3 text-sm font-semibold transition-colors disabled:opacity-50",
                  isLight
                    ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm"
                    : "border-slate-800/70 bg-slate-950/40 text-slate-200 hover:bg-slate-900/60"
                )}
              >
                {t.back}
              </button>

              <div className={cn("text-xs", isLight ? "text-slate-500" : "text-slate-400")}>
                {String(t.answered)}{" "}
                <span className={cn("font-semibold", isLight ? "text-slate-800" : "text-slate-200")}>
                  {String(answeredCount)}
                </span>
                {" / "}
                {String(translatedQuestions.length)}
              </div>

              {isLast ? (
                <button
                  type="button"
                  onClick={() => void handleSubmit()}
                  disabled={isSavingPsychometric}
                  className={cn(
                    "rounded-2xl px-5 py-3 text-sm font-semibold transition-colors ring-1",
                    isLight
                      ? "bg-blue-500 text-white ring-blue-200 hover:bg-blue-600 shadow-sm"
                      : "bg-blue-600/20 text-blue-100 ring-blue-500/25 hover:bg-blue-600/25"
                  )}
                >
                  {isSavingPsychometric ? t.saving : t.submitTest}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className={cn(
                    "rounded-2xl px-5 py-3 text-sm font-semibold transition-colors ring-1",
                    isLight
                      ? "bg-blue-500 text-white ring-blue-200 hover:bg-blue-600 shadow-sm"
                      : "bg-blue-600/20 text-blue-100 ring-blue-500/25 hover:bg-blue-600/25"
                  )}
                >
                  {t.next}
                </button>
              )}
            </div>

            <div className={cn("text-xs", isLight ? "text-slate-500" : "text-slate-500")}>
              {t.tip}
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // Landing page design (when test not started or completed)
  if (!isTakingTest) {
    return (
      <div className="space-y-8">
        {/* Header with Language Toggle */}
        <div className="flex items-start justify-between">
          <h1 className={cn("text-4xl font-bold md:text-5xl", isLight ? "text-slate-900" : "text-slate-50")}>{t.pageTitle}</h1>
        </div>

        {/* What is this test section */}
        <div className="space-y-3">
          <h2 className={cn('text-xl font-bold', isLight ? 'text-slate-900' : 'text-slate-100')}>
            {t.whatIsTest}
          </h2>
          <div
            className={cn(
              'max-w-3xl',
              isLight ? 'text-slate-700' : 'text-slate-300',
            )}
          >
            <p className={styles.infoParagraph}>{t.whatIsTestDesc1}</p>
            <p className={cn(styles.infoParagraph, 'mt-3')}>{t.whatIsTestDesc2}</p>
            <ul className={cn(styles.infoList, 'mt-4 list-disc pl-5')}>
              {((t.whatIsTestPoints as unknown) as string[]).map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>
          
          {!progress.psychometricCompleted && (
            <div className="pt-4">
              <button
                type="button"
                onClick={handleStart}
                disabled={!canSubmit || isSavingPsychometric}
                className={cn(
                  "rounded-2xl px-8 py-4 text-base font-semibold ring-1 transition disabled:opacity-50 disabled:cursor-not-allowed",
                  isLight
                    ? "bg-blue-500 text-white ring-blue-200 shadow-md hover:bg-blue-600 hover:shadow-lg"
                    : "bg-blue-600/20 text-blue-100 ring-blue-500/25 shadow-[0_0_25px_rgba(59,130,246,0.18)] hover:bg-blue-600/25 hover:shadow-[0_0_35px_rgba(59,130,246,0.25)]"
                )}
              >
                {isSavingPsychometric ? t.loading : answeredCount > 0 ? t.continueTest : t.startTest}
              </button>
            </div>
          )}

          {progress.psychometricCompleted && (
            <div className="space-y-4 pt-4">
              <div className={cn(
                "rounded-2xl border px-6 py-4",
                isLight
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-emerald-500/20 bg-emerald-500/10"
              )}>
                <div className={cn(
                  "text-sm font-semibold",
                  isLight ? "text-emerald-900" : "text-emerald-200"
                )}>
                  {t.testCompleted}
                </div>
                <div className={cn(
                  "mt-2 text-sm",
                  isLight ? "text-slate-700" : "text-slate-200"
                )}>
                  {t.yourHollandCode} <span className={cn(
                    "font-semibold",
                    isLight ? "text-slate-900" : ""
                  )}>
                    {progress.psychometricResult}
                  </span>
                </div>
                <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => void handleRetest()}
                  className={cn(
                    "rounded-2xl border px-5 py-2.5 text-sm font-semibold transition-colors",
                    isLight
                      ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm"
                      : "border-slate-800/70 bg-slate-950/40 text-slate-200 hover:bg-slate-900/60"
                  )}
                >
                  {t.retakeTest}
                </button>
                  <Link
                    to="/course-recommendation"
                    className={cn(
                      "inline-flex items-center justify-center rounded-2xl px-5 py-2.5 text-sm font-semibold ring-1",
                      isLight
                        ? "bg-emerald-500 text-white ring-emerald-500/30 hover:bg-emerald-600"
                        : "bg-emerald-600/20 text-emerald-100 ring-emerald-500/25 hover:bg-emerald-600/25"
                    )}
                  >
                    {t.viewRecommendations}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Expandable RIASEC Info Section */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setShowRiasecInfo((v) => !v)}
            className={cn(
              "flex items-center gap-2 text-base font-semibold transition",
              isLight ? "text-slate-700 hover:text-slate-900" : "text-slate-100 hover:text-slate-50"
            )}
          >
            <IconQuestion size={20} className="text-slate-300" />
            <span>{t.whatDoRiasecMean}</span>
            <IconArrowRight
              size={18}
              className={cn(
                'ml-auto text-slate-400 transition-transform',
                showRiasecInfo && 'rotate-90',
              )}
            />
          </button>

          {showRiasecInfo && (
            <div className="space-y-6 pt-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                <span>{t.riasecTypes}</span>
                <IconArrowRight size={16} className="text-slate-400" />
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <RiasecCard
                  letter="R"
                  title={t.riasecCards.R.title}
                  description={t.riasecCards.R.description}
                  icon={<IconWrench size={32} />}
                  gradient="from-blue-600/20 to-blue-800/10"
                  borderColor="border-blue-500/25"
                  glowColor="rgba(59, 130, 246, 0.15)"
                />
                <RiasecCard
                  letter="I"
                  title={t.riasecCards.I.title}
                  description={t.riasecCards.I.description}
                  icon={<IconLightbulb size={32} />}
                  gradient="from-purple-600/20 to-purple-800/10"
                  borderColor="border-purple-500/25"
                  glowColor="rgba(168, 85, 247, 0.15)"
                />
                <RiasecCard
                  letter="A"
                  title={t.riasecCards.A.title}
                  description={t.riasecCards.A.description}
                  icon={<IconPalette size={32} />}
                  gradient="from-purple-600/20 to-purple-800/10"
                  borderColor="border-purple-500/25"
                  glowColor="rgba(168, 85, 247, 0.15)"
                />
                <RiasecCard
                  letter="S"
                  title={t.riasecCards.S.title}
                  description={t.riasecCards.S.description}
                  icon={<IconMessageHeart size={32} />}
                  gradient="from-orange-600/20 to-orange-800/10"
                  borderColor="border-orange-500/25"
                  glowColor="rgba(251, 146, 60, 0.15)"
                />
                <RiasecCard
                  letter="E"
                  title={t.riasecCards.E.title}
                  description={t.riasecCards.E.description}
                  icon={<IconBriefcase size={32} />}
                  gradient="from-orange-600/20 to-orange-800/10"
                  borderColor="border-orange-500/25"
                  glowColor="rgba(251, 146, 60, 0.15)"
                />
                <RiasecCard
                  letter="C"
                  title={t.riasecCards.C.title}
                  description={t.riasecCards.C.description}
                  icon={<IconClipboardCheck size={32} />}
                  gradient="from-blue-600/20 to-blue-800/10"
                  borderColor="border-blue-500/25"
                  glowColor="rgba(59, 130, 246, 0.15)"
                />
              </div>
            </div>
          )}
        </div>

        {/* Results section (if completed) */}
        {progress.psychometricCompleted && resultDescription && (
          <div id="results" ref={resultsRef} className="space-y-4 pt-8">
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

        {/* Error messages */}
        {submitError && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-200">
            {submitError}
          </div>
        )}
        {hydrationError && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-200">
            {hydrationError}
          </div>
        )}
      </div>
    )
  }
}


function InteractiveCareerPathGuidance(props: {
  name: string
  hollandCode: string
  report: NonNullable<ReturnType<typeof useUserProgress>['progress']['careerPathReport']>
  showAllTraits: boolean
  onToggleTraits: () => void
}) {
  const { name, hollandCode, report } = props
  const { theme } = useTheme()
  const isLight = theme === 'light'

  const primaryFit = report.primaryPath.riasec.toUpperCase() as keyof typeof riasecTypeInfo['en']
  useLanguage()

  return (
    <section className={cn(
      "relative overflow-hidden rounded-3xl border p-6 backdrop-blur-xl md:p-8",
      isLight
        ? "border-slate-200 bg-slate-50 shadow-lg"
        : "border-slate-700/60 bg-slate-950/12 shadow-[0_18px_60px_rgba(0,0,0,0.32)]"
    )}>
      {!isLight && (
        <>
          <div className="pointer-events-none absolute inset-0 opacity-70 [mask-image:radial-gradient(1200px_circle_at_25%_20%,black,transparent_70%)]">
            <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_15%,rgba(59,130,246,0.14),transparent_60%),radial-gradient(900px_circle_at_85%_70%,rgba(168,85,247,0.10),transparent_62%),linear-gradient(180deg,rgba(255,255,255,0.05),transparent_40%)]" />
          </div>
          <div className="pointer-events-none absolute inset-0 ring-1 ring-white/5" />
        </>
      )}

      <div className="relative space-y-6">
        {/* Greeting at top left */}
        <div className={cn(
          "text-base font-semibold",
          isLight ? "text-slate-700" : "text-slate-200/90"
        )}>
          Great job, <span className={cn(isLight ? "text-slate-900 font-bold" : "text-slate-50")}>{name}</span>! 🎉
        </div>

        {/* Main layout: RIASEC badge on left, Discover Yourself card on right */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
          {/* Left: RIASEC letter badge card */}
          <div className="flex-shrink-0">
            <RiasecLetterBadge
              letter={primaryFit}
              hollandCode={hollandCode}
            />
          </div>

          {/* Right: Discover Yourself card - full width on mobile, takes remaining space on desktop */}
          <div className="flex-1">
            <DiscoverYourself riasecCode={primaryFit} />
          </div>
        </div>
      </div>
    </section>
  )
}


/**
 * Prominent RIASEC letter badge component.
 * Acts as a visual identity anchor showing the user's dominant personality type.
 */
function RiasecLetterBadge(props: { letter: string; hollandCode: string }) {
  const { letter, hollandCode } = props
  const { theme } = useTheme()
  const { language } = useLanguage()
  const isLight = theme === 'light'
  const normalizedLetter = letter.toUpperCase() as keyof typeof riasecTypeInfo['en']
  const typeInfo = riasecTypeInfo[language][normalizedLetter]
  
  // Extract supporting letters (all letters except the primary)
  const supportingLetters = hollandCode
    .toUpperCase()
    .split('')
    .filter((l) => l !== normalizedLetter)
    .slice(0, 2) // Show up to 2 supporting letters

  // Color scheme based on RIASEC type - Light Mode (kept for reference)
  /* const colorSchemeLight = {
    R: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      glow: 'rgba(59, 130, 246, 0.1)',
    },
    I: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-900',
      glow: 'rgba(168, 85, 247, 0.1)',
    },
    A: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-900',
      glow: 'rgba(168, 85, 247, 0.1)',
    },
    S: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-900',
      glow: 'rgba(251, 146, 60, 0.1)',
    },
    E: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-900',
      glow: 'rgba(251, 146, 60, 0.1)',
    },
    C: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      glow: 'rgba(59, 130, 246, 0.1)',
    },
  }

  // Color scheme based on RIASEC type - Dark Mode (kept for reference)
  const colorSchemeDark = {
    R: {
      bg: 'bg-blue-600/20',
      border: 'border-blue-500/40',
      text: 'text-blue-100',
      glow: 'rgba(59, 130, 246, 0.25)',
    },
    I: {
      bg: 'bg-purple-600/20',
      border: 'border-purple-500/40',
      text: 'text-purple-100',
      glow: 'rgba(168, 85, 247, 0.25)',
    },
    A: {
      bg: 'bg-purple-600/20',
      border: 'border-purple-500/40',
      text: 'text-purple-100',
      glow: 'rgba(168, 85, 247, 0.25)',
    },
    S: {
      bg: 'bg-orange-600/20',
      border: 'border-orange-500/40',
      text: 'text-orange-100',
      glow: 'rgba(251, 146, 60, 0.25)',
    },
    E: {
      bg: 'bg-orange-600/20',
      border: 'border-orange-500/40',
      text: 'text-orange-100',
      glow: 'rgba(251, 146, 60, 0.25)',
    },
    C: {
      bg: 'bg-blue-600/20',
      border: 'border-blue-500/40',
      text: 'text-blue-100',
      glow: 'rgba(59, 130, 246, 0.25)',
    },
  } */


  return (
    <div className="flex-shrink-0">
      {/* Primary letter badge card - light blue background matching design */}
      <div
        className={cn(
          'relative flex flex-col items-center justify-center rounded-3xl border p-6 md:p-8',
          isLight 
            ? 'bg-blue-50 border-blue-200' 
            : 'bg-blue-950/20 border-blue-500/30'
        )}
      >
        {/* Large primary letter - dark blue */}
        <div className={cn(
          'mb-3 text-7xl font-bold md:text-8xl',
          isLight ? 'text-blue-900' : 'text-blue-100'
        )}>
          {normalizedLetter}
        </div>
        
        {/* Full name label - dark blue */}
        <div className={cn(
          'mb-2 text-lg font-semibold md:text-xl',
          isLight ? 'text-blue-900' : 'text-blue-100'
        )}>
          {typeInfo.name}
        </div>
        
        {/* Short description - dark gray */}
        <p className={cn(
          "max-w-[200px] text-center text-sm leading-relaxed",
          isLight ? "text-slate-700" : "text-slate-300/90"
        )}>
          {typeInfo.description}
        </p>

        {/* Supporting letters - shown smaller and secondary */}
        {supportingLetters.length > 0 && (
          <div className={cn(
            "mt-4 flex items-center gap-2 border-t pt-4 w-full",
            isLight ? "border-slate-300" : "border-slate-700/40"
          )}>
            <span className={cn(
              "text-xs font-medium",
              isLight ? "text-slate-600" : "text-slate-400"
            )}>
              Also:
            </span>
            <div className="flex gap-1.5">
              {supportingLetters.map((l, idx) => {
                const suppInfo = riasecTypeInfo[language][l as keyof typeof riasecTypeInfo['en']]
                return (
                  <div
                    key={idx}
                    className={cn(
                      "flex flex-col items-center rounded-lg border px-2.5 py-1.5",
                      isLight
                        ? "border-slate-300 bg-white"
                        : "border-slate-700/40 bg-slate-950/30"
                    )}
                  >
                    <span className={cn(
                      "text-sm font-bold",
                      isLight ? "text-slate-800" : "text-slate-300"
                    )}>
                      {l}
                    </span>
                    <span className={cn(
                      "text-[10px] font-medium",
                      isLight ? "text-slate-600" : "text-slate-400"
                    )}>
                      {suppInfo.name.slice(0, 4)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function RiasecCard(props: {
  letter: string
  title: string
  description: string
  icon: React.ReactNode
  gradient: string
  borderColor: string
  glowColor: string
}) {
  const { letter, title, description, icon, gradient, borderColor, glowColor } = props
  const { theme } = useTheme()
  const isLight = theme === 'light'

  // Light mode color schemes for each RIASEC type
  const lightColorSchemes: Record<string, { bg: string; border: string; letterColor: string; titleColor: string; descColor: string; iconColor: string }> = {
    R: { bg: 'bg-gradient-to-br from-blue-50 to-blue-100', border: 'border-blue-200', letterColor: 'text-blue-800', titleColor: 'text-blue-900', descColor: 'text-slate-700', iconColor: 'text-blue-600' },
    I: { bg: 'bg-gradient-to-br from-purple-50 to-purple-100', border: 'border-purple-200', letterColor: 'text-purple-800', titleColor: 'text-purple-900', descColor: 'text-slate-700', iconColor: 'text-purple-600' },
    A: { bg: 'bg-gradient-to-br from-pink-50 to-purple-100', border: 'border-purple-200', letterColor: 'text-purple-800', titleColor: 'text-purple-900', descColor: 'text-slate-700', iconColor: 'text-purple-600' },
    S: { bg: 'bg-gradient-to-br from-orange-50 to-amber-100', border: 'border-orange-200', letterColor: 'text-orange-800', titleColor: 'text-orange-900', descColor: 'text-slate-700', iconColor: 'text-orange-600' },
    E: { bg: 'bg-gradient-to-br from-amber-50 to-orange-100', border: 'border-orange-200', letterColor: 'text-orange-800', titleColor: 'text-orange-900', descColor: 'text-slate-700', iconColor: 'text-orange-600' },
    C: { bg: 'bg-gradient-to-br from-blue-50 to-slate-100', border: 'border-blue-200', letterColor: 'text-blue-800', titleColor: 'text-blue-900', descColor: 'text-slate-700', iconColor: 'text-blue-600' },
  }

  const lightScheme = lightColorSchemes[letter] || lightColorSchemes.R

  if (isLight) {
    return (
      <div
        className={cn(
          'group relative overflow-hidden rounded-2xl border p-6 shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer',
          lightScheme.bg,
          lightScheme.border,
        )}
      >
        <div className="relative">
          <div className={cn('mb-4 text-5xl font-bold transition-transform duration-300 group-hover:scale-105', lightScheme.letterColor)}>{letter}</div>
          <div className={cn('mb-3 flex items-center justify-center transition-transform duration-300 group-hover:scale-105', lightScheme.iconColor)}>{icon}</div>
          <div className={cn('text-xl font-semibold mb-2', lightScheme.titleColor)}>{title}</div>
          <div className={cn('text-sm leading-relaxed', lightScheme.descColor)}>{description}</div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border bg-gradient-to-b p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer',
        gradient,
        borderColor,
      )}
      style={{ boxShadow: `0 0 30px ${glowColor}` }}
    >
      {/* Starry background effect */}
      <div className="pointer-events-none absolute inset-0 opacity-30 transition-opacity duration-300 group-hover:opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.4)_1px,transparent_1px)] [background-size:20px_20px]" />
      </div>
      
      <div className="relative">
        <div className="mb-4 text-5xl font-bold text-slate-100 transition-transform duration-300 group-hover:scale-105">{letter}</div>
        <div className="mb-3 flex items-center justify-center text-slate-200 transition-transform duration-300 group-hover:scale-105">{icon}</div>
        <div className="text-xl font-semibold text-slate-100 mb-2">{title}</div>
        <div className="text-sm leading-relaxed text-slate-200">{description}</div>
      </div>
    </div>
  )
}


