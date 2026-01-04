import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { ProgressBar } from '../components/ui/ProgressBar'
import { PageHeader } from '../components/PageHeader'
import { useUserProgress } from '../context/UserProgressContext'
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
  IconChevronDown,
} from '../components/icons'

// Translation object
const translations = {
  en: {
    // Page headers
    pageTitle: 'Psychometric Test',
    pageSubtitle: 'Answer one statement at a time. Your responses are used to generate your guidance.',
    whatIsTest: 'What is this test?',
    whatIsTestDesc: 'This psychometric test helps you understand your interests and how they relate to different technology pathways. There are no right or wrong answers — just choose what feels most like you.',
    
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
    
    // RIASEC section
    whatDoRiasecMean: 'What do RIASEC types mean?',
    riasecTypes: 'RIASEC Types',
    
    // RIASEC Cards
    riasecCards: {
      R: {
        title: 'Realistic',
        description: '🛠️ Realistic (R) – Enjoy work involving technical, mechanical, or physical skills, such as engineers, technicians, and athletes.',
      },
      I: {
        title: 'Investigative',
        description: '🧪 Investigative (I) – Enjoy analyzing, researching, and solving problems, suitable for fields like science, research, and technology.',
      },
      A: {
        title: 'Artistic',
        description: '🎨 Artistic (A) – Tend towards creativity and self-expression in arts, music, writing, or design.',
      },
      S: {
        title: 'Social',
        description: '🤝 Social (S) – Enjoy interacting and helping others, suitable for fields like education, counseling, and medicine.',
      },
      E: {
        title: 'Enterprising',
        description: '💼 Enterprising (E) – Oriented towards leadership, business, and entrepreneurship, suitable for fields like management and marketing.',
      },
      C: {
        title: 'Conventional',
        description: '🗂️ Conventional (C) – Enjoy structure, rules, and systematic work like accounting, administration, and data.',
      },
    },
  },
  ms: {
    // Page headers
    pageTitle: 'Ujian Psikometrik',
    pageSubtitle: 'Jawab satu kenyataan pada satu masa. Respons anda digunakan untuk menjana panduan anda.',
    whatIsTest: 'Apakah ujian ini?',
    whatIsTestDesc: 'Ujian psikometrik ini membantu anda memahami minat anda dan bagaimana ia berkaitan dengan laluan teknologi yang berbeza. Tiada jawapan betul atau salah — pilih apa yang paling menggambarkan anda.',
    
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
    
    // RIASEC section
    whatDoRiasecMean: 'Apakah maksud jenis RIASEC?',
    riasecTypes: 'Jenis RIASEC',
    
    // RIASEC Cards
    riasecCards: {
      R: {
        title: 'Realistik',
        description: '🛠️ Realistik (R) – Suka kerja yang melibatkan kemahiran teknikal, mekanikal, atau fizikal, seperti jurutera, tukang, dan atlet.',
      },
      I: {
        title: 'Investigatif',
        description: '🧪 Investigatif (I) – Gemar menganalisis, menyelidik, dan menyelesaikan masalah, sesuai untuk bidang sains, penyelidikan, dan teknologi.',
      },
      A: {
        title: 'Artistik',
        description: '🎨 Artistik (A) – Cenderung kepada kreativiti dan ekspresi diri dalam seni, muzik, penulisan, atau reka bentuk.',
      },
      S: {
        title: 'Sosial',
        description: '🤝 Sosial (S) – Suka berinteraksi dan membantu orang lain, sesuai untuk bidang seperti pendidikan, kaunseling, dan perubatan.',
      },
      E: {
        title: 'Enterprising',
        description: '💼 Enterprising (E) – Berorientasikan kepimpinan, perniagaan, dan keusahawanan, sesuai untuk bidang pengurusan dan pemasaran.',
      },
      C: {
        title: 'Konvensional',
        description: '🗂️ Konvensional (C) – Gemar struktur, peraturan, dan kerja yang sistematik seperti akaun, pentadbiran, dan data.',
      },
    },
  },
}

type Language = 'en' | 'ms'

export function PsychometricTestPage() {
  const { progress, submitPsychometricTest, resetPsychometricTest, isHydrating, hydrationError, isSavingPsychometric } = useUserProgress()
  const { user } = useAuth()
  const { profile } = useProfile()
  const { hasPermission } = useRole()
  const resultsRef = useRef<HTMLDivElement | null>(null)
  const location = useLocation()

  // Check permission
  if (!hasPermission('take_psychometric_test')) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Access Restricted"
          subtitle="This feature is only available for students."
        />
        <Card title="Permission Denied">
          <div className="space-y-3 text-sm text-slate-300">
            <p>Teachers cannot take the psychometric test.</p>
            <p className="text-xs text-slate-400">Please contact an administrator if you believe this is an error.</p>
          </div>
        </Card>
      </div>
    )
  }

  // Language state
  const [language, setLanguage] = useState<Language>('en')
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
        setQuestions(riasecQuestions.map((q) => ({ id: q.id, text: q.text, type: q.type, is_active: true })))
      } finally {
        setQuestionsLoading(false)
      }
    }
    loadQuestions()
  }, [])

  // Get translated questions - memoized for performance
  const translatedQuestions = useMemo(() => {
    // Use database questions if available, otherwise fallback to static
    const baseQuestions = questions.length > 0 ? questions : riasecQuestions.map((q) => ({ id: q.id, text: q.text, type: q.type }))

    if (language === 'ms') {
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

  const statusLabel = progress.psychometricCompleted ? t.completed : t.notTaken
  const statusClass = progress.psychometricCompleted
    ? 'text-emerald-200'
    : 'text-slate-300'
  const canSubmit = !progress.psychometricCompleted
  const isTakingTest = hasStarted && canSubmit

  // Toggle language function
  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'ms' : 'en'))
  }

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
            title={t.pageTitle}
            subtitle={t.pageSubtitle}
          />
          <button
            type="button"
            onClick={toggleLanguage}
            className="rounded-xl border border-slate-800/70 bg-slate-950/40 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-900/60 transition-colors"
          >
            {language === 'en' ? '🇲🇾 BM' : '🇬🇧 EN'}
          </button>
        </div>

        <Card
          title={`${t.question} ${currentIndex + 1} ${t.of} ${translatedQuestions.length}`}
          right={
            <div className="flex items-center gap-2">
              <div className="text-xs font-semibold text-slate-400">{progressPercent}%</div>
              <button
                type="button"
                onClick={handleExitTest}
                className="rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-900/60"
              >
                {t.exit}
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
                {t.type}: <span className="text-slate-200">{q.type}</span>
              </div>
              <div className="mt-2 text-base font-semibold text-slate-100">
                {q.text}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  { value: 1, label: t.yes },
                  { value: 0, label: t.no },
                ].map((option) => {
                  const selected = current === option.value
                  return (
                    <label
                      key={option.value}
                      className={`cursor-pointer rounded-xl border px-4 py-4 text-center text-sm font-semibold transition ${
                        selected
                          ? option.value === 1
                            ? 'border-emerald-500/40 bg-emerald-600/20 text-emerald-100'
                            : 'border-rose-500/40 bg-rose-600/20 text-rose-100'
                          : 'border-slate-800/70 bg-slate-950/40 text-slate-200 hover:bg-slate-900/60'
                      }`}
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
                {t.back}
              </button>

              <div className="text-xs text-slate-400">
                {t.answered}:{' '}
                <span className="font-semibold text-slate-200">{answeredCount}</span> /{' '}
                {translatedQuestions.length}
              </div>

              {isLast ? (
                <button
                  type="button"
                  onClick={() => void handleSubmit()}
                  disabled={isSavingPsychometric}
                  className="rounded-2xl bg-blue-600/20 px-5 py-3 text-sm font-semibold text-blue-100 ring-1 ring-blue-500/25 hover:bg-blue-600/25"
                >
                  {isSavingPsychometric ? t.saving : t.submitTest}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="rounded-2xl bg-blue-600/20 px-5 py-3 text-sm font-semibold text-blue-100 ring-1 ring-blue-500/25 hover:bg-blue-600/25"
                >
                  {t.next}
                </button>
              )}
            </div>

            <div className="text-xs text-slate-500">
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
          <h1 className="text-4xl font-bold text-slate-50 md:text-5xl">{t.pageTitle}</h1>
          <button
            type="button"
            onClick={toggleLanguage}
            className="rounded-xl border border-slate-800/70 bg-slate-950/40 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-900/60 transition-colors"
          >
            {language === 'en' ? '🇲🇾 BM' : '🇬🇧 EN'}
          </button>
        </div>

        {/* What is this test section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-100">{t.whatIsTest}</h2>
          <p className="max-w-3xl text-base leading-relaxed text-slate-300/90">
            {t.whatIsTestDesc}
          </p>
          
          {!progress.psychometricCompleted && (
            <div className="pt-4">
              <button
                type="button"
                onClick={handleStart}
                disabled={!canSubmit || isSavingPsychometric}
                className="rounded-2xl bg-blue-600/20 px-8 py-4 text-base font-semibold text-blue-100 ring-1 ring-blue-500/25 shadow-[0_0_25px_rgba(59,130,246,0.18)] transition hover:bg-blue-600/25 hover:shadow-[0_0_35px_rgba(59,130,246,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingPsychometric ? t.loading : answeredCount > 0 ? t.continueTest : t.startTest}
              </button>
            </div>
          )}

          {progress.psychometricCompleted && (
            <div className="space-y-4 pt-4">
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-6 py-4">
                <div className="text-sm font-semibold text-emerald-200">
                  {t.testCompleted}
                </div>
                <div className="mt-2 text-sm text-slate-200">
                  {t.yourHollandCode} <span className="font-semibold">{progress.psychometricResult}</span>
                </div>
                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => void handleRetest()}
                    className="rounded-2xl border border-slate-800/70 bg-slate-950/40 px-5 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-900/60"
                  >
                    {t.retakeTest}
                  </button>
                  <Link
                    to="/course-recommendation"
                    className="inline-flex items-center justify-center rounded-2xl bg-emerald-600/20 px-5 py-2.5 text-sm font-semibold text-emerald-100 ring-1 ring-emerald-500/25 hover:bg-emerald-600/25"
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
            className="flex items-center gap-2 text-base font-semibold text-slate-100 transition hover:text-slate-50"
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

/**
 * Generate an identity-based heading from RIASEC type.
 * Focuses on who the user is rather than what path they follow.
 */
function getIdentityHeading(riasecType: string): string {
  const identityMap: Record<string, string> = {
    R: 'Practical, Hands-On Problem Solver',
    I: 'Curious, Analytical Thinker',
    A: 'Creative, Design-Oriented Innovator',
    S: 'People-Centered, Empathetic Collaborator',
    E: 'Leadership-Focused, Initiative-Taking Influencer',
    C: 'Structured, Detail-Oriented Organizer',
  }
  return identityMap[riasecType] || 'Technology-Focused Learner'
}

/**
 * Get RIASEC type full name and short description.
 */
function getRiasecTypeInfo(riasecType: string): { name: string; description: string } {
  const infoMap: Record<string, { name: string; description: string }> = {
    R: {
      name: 'Realistic',
      description: 'You prefer practical, hands-on work and enjoy learning through real-world tasks.',
    },
    I: {
      name: 'Investigative',
      description: 'You are curious, analytical, and motivated by understanding how things work.',
    },
    A: {
      name: 'Artistic',
      description: 'You prefer creative expression and open-ended tasks where design and originality matter.',
    },
    S: {
      name: 'Social',
      description: 'You are people-oriented and gain satisfaction from helping, teaching, and collaborating.',
    },
    E: {
      name: 'Enterprising',
      description: 'You prefer leading, initiating, and influencing outcomes.',
    },
    C: {
      name: 'Conventional',
      description: 'You prefer structure, organization, and working with details and systems.',
    },
  }
  return infoMap[riasecType] || infoMap.I
}

/**
 * Generate meaningful, student-friendly insights about how a person thinks, learns, and works.
 * Uses bullet points for easy scanning and quick understanding.
 */
function getPersonalInsights(riasecType: string): {
  howYouThink: { title: string; bullets: string[] }
  howYouLearnBest: { title: string; bullets: string[] }
  whatYoureGoodAt: { title: string; bullets: string[] }
  whyThisMatters: { title: string; bullets: string[] }
} {
  const insights: Record<string, ReturnType<typeof getPersonalInsights>> = {
    R: {
      howYouThink: {
        title: 'How You Think',
        bullets: [
          'You ask "How can I fix this?" or "What tools do I need?"',
          'You prefer seeing concrete results and real-world understanding',
          'When something breaks, your first instinct is to roll up your sleeves and figure it out hands-on',
          'You think in terms of practical solutions and tangible outcomes',
        ],
      },
      howYouLearnBest: {
        title: 'How You Learn Best',
        bullets: [
          'You learn by doing, not just reading or watching',
          'Building, taking apart, and reassembling helps you understand deeply',
          'You thrive when experimenting with real systems, tools, and devices',
          'Step-by-step tutorials work well, but you really get it when you try it yourself',
        ],
      },
      whatYoureGoodAt: {
        title: "What You're Naturally Good At",
        bullets: [
          'Practical problem-solving and working with your hands',
          'Understanding how systems connect and work together',
          'Troubleshooting—spotting what\'s wrong by observing behavior',
          'Following technical procedures and maintaining organized systems',
        ],
      },
      whyThisMatters: {
        title: 'Why This Matters in Technology',
        bullets: [
          'Technology needs people who can actually make things work',
          'Your hands-on approach is great for setting up systems and fixing bugs',
          'You understand how hardware and software connect in real systems',
          'Your ability to see the whole system helps build reliable, working solutions',
        ],
      },
    },
    I: {
      howYouThink: {
        title: 'How You Think',
        bullets: [
          'You ask "Why does this work?" and "What if I try this?"',
          'You enjoy breaking down complex challenges into smaller pieces',
          'You\'re naturally curious about how things work under the hood',
          'You love the puzzle-solving aspect of technology',
        ],
      },
      howYouLearnBest: {
        title: 'How You Learn Best',
        bullets: [
          'You learn by exploring, experimenting, and understanding principles',
          'Reading documentation and studying algorithms builds deep understanding',
          'You prefer structured learning that builds on concepts',
          'You enjoy challenging yourself with increasingly complex problems',
        ],
      },
      whatYoureGoodAt: {
        title: "What You're Naturally Good At",
        bullets: [
          'Logical reasoning, pattern recognition, and systematic problem-solving',
          'Seeing connections between different concepts',
          'Analyzing data and understanding algorithms',
          'Thinking through the implications of different solutions',
        ],
      },
      whyThisMatters: {
        title: 'Why This Matters in Technology',
        bullets: [
          'Technology is built on logic, data, and systematic thinking',
          'Your analytical mind helps write better code and design efficient systems',
          'You solve problems that others find overwhelming',
          'Your curiosity drives you to understand not just what works, but why it works',
        ],
      },
    },
    A: {
      howYouThink: {
        title: 'How You Think',
        bullets: [
          'You ask "How can I make this beautiful?" or "What would feel right to use?"',
          'You think in terms of experiences, aesthetics, and user feelings',
          'You enjoy exploring different creative possibilities',
          'You aren\'t satisfied until something looks and feels polished',
        ],
      },
      howYouLearnBest: {
        title: 'How You Learn Best',
        bullets: [
          'You learn by experimenting creatively and seeing visual results',
          'Working on projects that express your ideas helps you understand deeply',
          'You prefer open-ended learning where you can explore different approaches',
          'Seeing your work come to life motivates you',
        ],
      },
      whatYoureGoodAt: {
        title: "What You're Naturally Good At",
        bullets: [
          'Visual thinking and creative problem-solving',
          'Understanding what makes experiences enjoyable',
          'Natural eye for design, color, and layout',
          'Imagining how users will interact and creating intuitive interfaces',
        ],
      },
      whyThisMatters: {
        title: 'Why This Matters in Technology',
        bullets: [
          'Technology needs to be usable and enjoyable, not just functional',
          'Your creative thinking makes technology accessible and appealing',
          'You bridge the gap between technical capability and human experience',
          'Your ability to think about look and feel creates technology people want to use',
        ],
      },
    },
    S: {
      howYouThink: {
        title: 'How You Think',
        bullets: [
          'You ask "How will this help people?" and "What do users actually need?"',
          'You think about the human side of technology',
          'You naturally consider how others will experience and use what you create',
          'You focus on making technology more helpful for real people',
        ],
      },
      howYouLearnBest: {
        title: 'How You Learn Best',
        bullets: [
          'You learn by connecting knowledge to real-world applications',
          'Working on projects that solve actual problems keeps you motivated',
          'You learn well through collaboration and teaching others',
          'Understanding the "why" behind technology helps you learn the "how"',
        ],
      },
      whatYoureGoodAt: {
        title: "What You're Naturally Good At",
        bullets: [
          'Understanding people\'s needs and communicating clearly',
          'Translating between technical and non-technical language',
          'Explaining complex concepts in simple terms',
          'Effective collaboration and support through your people skills',
        ],
      },
      whyThisMatters: {
        title: 'Why This Matters in Technology',
        bullets: [
          'Technology exists to serve people, and you understand that connection',
          'Your ability to understand user needs creates technology that solves real problems',
          'You bridge the gap between technical teams and end users',
          'Your communication skills help teams work together effectively',
        ],
      },
    },
    E: {
      howYouThink: {
        title: 'How You Think',
        bullets: [
          'You ask "What should we build?" and "How can we make this successful?"',
          'You think strategically about goals, priorities, and outcomes',
          'You consider the bigger picture—not just how something works, but its value',
          'You naturally think about how things fit into larger plans',
        ],
      },
      howYouLearnBest: {
        title: 'How You Learn Best',
        bullets: [
          'You learn by seeing how knowledge connects to real-world goals',
          'Projects with clear objectives and measurable results keep you motivated',
          'You prefer learning that helps you make decisions and take action',
          'Understanding the "why" and "what\'s next" helps you learn technical details',
        ],
      },
      whatYoureGoodAt: {
        title: "What You're Naturally Good At",
        bullets: [
          'Seeing the big picture and making strategic decisions',
          'Organizing people and resources toward goals',
          'Planning, prioritizing, and communicating what needs to happen',
          'Translating between business needs and technical possibilities',
        ],
      },
      whyThisMatters: {
        title: 'Why This Matters in Technology',
        bullets: [
          'Technology projects need direction and someone who connects work to goals',
          'Your strategic thinking helps teams focus on what matters most',
          'You understand what users and businesses need and translate to technical requirements',
          'Your ability to lead and coordinate makes technology projects successful',
        ],
      },
    },
    C: {
      howYouThink: {
        title: 'How You Think',
        bullets: [
          'You ask "What\'s the right process?" and "How can we make this consistent?"',
          'You think systematically about organization and accuracy',
          'You naturally notice details and patterns others might miss',
          'You value doing things correctly and consistently',
        ],
      },
      howYouLearnBest: {
        title: 'How You Learn Best',
        bullets: [
          'You learn when information is well-organized and structured',
          'Step-by-step processes and clear documentation help you build understanding',
          'You prefer learning that follows logical sequences',
          'Practice and repetition help you master skills',
        ],
      },
      whatYoureGoodAt: {
        title: "What You're Naturally Good At",
        bullets: [
          'Organizing information and maintaining accuracy',
          'Following systematic processes and spotting inconsistencies',
          'Creating and maintaining clear documentation',
          'Ensuring quality through your systematic approach',
        ],
      },
      whyThisMatters: {
        title: 'Why This Matters in Technology',
        bullets: [
          'Technology relies on precision, organization, and systematic thinking',
          'Your attention to detail helps catch bugs and maintain data quality',
          'Your ability to organize information is valuable in testing and documentation',
          'Technology needs people who ensure everything works correctly and consistently',
        ],
      },
    },
  }

  return insights[riasecType] || insights.I
}

/**
 * Card-style expandable section matching the reference design.
 * Features icon, title, bullet points, and smooth expand/collapse animation.
 * Makes content discovery interactive and engaging.
 */
function CardExpandableSection(props: {
  title: string
  icon: string
  bullets: string[]
  isExpanded: boolean
  onToggle: () => void
  children: React.ReactNode
  tint: 'yellow' | 'gold' | 'cyan'
}) {
  const { title, icon, bullets, isExpanded, onToggle, children, tint } = props

  const iconBgClass =
    tint === 'yellow'
      ? 'bg-yellow-500/20 border-yellow-500/30'
      : tint === 'gold'
        ? 'bg-amber-500/20 border-amber-500/30'
        : 'bg-cyan-500/20 border-cyan-500/30'

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-700/60 bg-slate-950/18 shadow-[0_12px_44px_rgba(0,0,0,0.26)] ring-1 ring-white/5 transition-all duration-300 hover:shadow-[0_16px_48px_rgba(0,0,0,0.32)]">
      {/* Card header - always visible */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left transition-colors hover:bg-slate-950/25"
        aria-expanded={isExpanded}
      >
        <div className="p-6">
          {/* Icon */}
          <div className={cn('mb-4 grid size-16 place-items-center rounded-2xl border', iconBgClass)}>
            <span className="text-3xl">{icon}</span>
          </div>

          {/* Title */}
          <h2 className="mb-4 text-2xl font-bold text-slate-50">{title}</h2>

          {/* Bullet points */}
          <ul className="space-y-2">
            {bullets.map((bullet, idx) => (
              <li key={idx} className="flex items-center gap-2 text-base text-slate-300/80">
                <span className="size-1.5 rounded-full bg-slate-300/60" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>

          {/* Expand indicator */}
          <div className="mt-6 flex items-center justify-between">
            <span className="inline-flex items-center gap-2 rounded-2xl border border-slate-800/60 bg-slate-950/20 px-5 py-3 text-sm font-semibold text-slate-200 ring-1 ring-slate-800/40">
              <span className="grid size-7 place-items-center rounded-xl border border-white/10 bg-white/5 text-xs">
                ⌁
              </span>
              {isExpanded ? 'Show Less' : 'Explore More'}
              <IconChevronDown
                size={16}
                className={cn(
                  'ml-1 text-slate-400 transition-transform duration-300',
                  isExpanded && 'rotate-180',
                )}
              />
            </span>
          </div>
        </div>
      </button>

      {/* Expandable content - smooth animation */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-500 ease-in-out',
          isExpanded ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <div className="border-t border-slate-700/60 bg-slate-950/12 px-6 pb-6 pt-6">{children}</div>
      </div>
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

  // Progressive disclosure: Use local state to control expand/collapse of each section
  // This reduces cognitive overload by revealing information on demand
  const [expandedSections, setExpandedSections] = useState({
    whoYouAre: false,
    whereYouCouldGo: false,
    whatYoullBuild: false,
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const heroTitle = report.primaryPath.title
  const heroDesc = report.primaryPath.description
  const primaryFit = report.primaryPath.riasec
  const identityHeading = getIdentityHeading(primaryFit)

  // Prepare content for expandable sections
  const roles = report.primaryPath.possibleRoles.slice(0, 3)
  const learningFocus = report.primaryPath.learningFocus

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-700/60 bg-slate-950/12 p-6 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.32)] md:p-8">
      <div className="pointer-events-none absolute inset-0 opacity-70 [mask-image:radial-gradient(1200px_circle_at_25%_20%,black,transparent_70%)]">
        <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_15%,rgba(59,130,246,0.14),transparent_60%),radial-gradient(900px_circle_at_85%_70%,rgba(168,85,247,0.10),transparent_62%),linear-gradient(180deg,rgba(255,255,255,0.05),transparent_40%)]" />
      </div>
      <div className="pointer-events-none absolute inset-0 ring-1 ring-white/5" />

      <div className="relative space-y-6">
        {/* Header: Identity-first approach - emphasizes who the user is */}
        <div className="space-y-4">
          <div className="text-sm font-semibold text-slate-200/90">
            Great job, <span className="text-slate-50">{name}</span>! 🎉
          </div>

          {/* Primary heading with prominent RIASEC letter badge */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
            {/* Prominent RIASEC letter badge - visual identity anchor */}
            <RiasecLetterBadge
              letter={primaryFit}
              hollandCode={hollandCode}
            />

            {/* Identity heading and description */}
            <div className="flex-1 space-y-3">
              <h1 className="text-3xl font-bold tracking-tight text-slate-50 md:text-4xl lg:text-5xl">
                You are a {identityHeading}
              </h1>
              {/* Secondary label: Technology path (reduced emphasis) */}
              <div className="text-base font-medium text-slate-300/80 md:text-lg">
                {heroTitle}
              </div>
              {/* Explanation text: Readable and prominent - larger font for better readability */}
              <p className="max-w-3xl text-base leading-relaxed text-slate-300/90 md:text-lg">
                {heroDesc}
              </p>
            </div>
          </div>

          {/* Metadata badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-slate-800/60 bg-slate-950/25 px-3 py-1 text-xs font-semibold text-slate-200">
              Holland Code: <span className="text-slate-50">{hollandCode}</span>
            </span>
          </div>
        </div>

        {/* Expandable sections: Card-style design matching the reference image */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Section 1: Discover Yourself */}
          <CardExpandableSection
            title="Discover Yourself"
            icon="💡"
            bullets={['Learn what makes you unique', 'Understand your strengths']}
            isExpanded={expandedSections.whoYouAre}
            onToggle={() => toggleSection('whoYouAre')}
            tint="yellow"
          >
            <div className="space-y-6">
              {/* Interpreted strength sections - meaningful, student-friendly insights in bullet format */}
              {(() => {
                const insights = getPersonalInsights(primaryFit)
                return (
                  <>
                    {/* How You Think */}
                    <div className="rounded-xl border border-slate-700/60 bg-slate-950/18 p-5 shadow-[0_8px_24px_rgba(0,0,0,0.20)] ring-1 ring-white/5">
                      <h3 className="mb-4 text-lg font-semibold text-slate-100">{insights.howYouThink.title}</h3>
                      <ul className="space-y-2.5">
                        {insights.howYouThink.bullets.map((bullet, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-base leading-relaxed text-slate-300/90">
                            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-slate-300/60" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* How You Learn Best */}
                    <div className="rounded-xl border border-slate-700/60 bg-slate-950/18 p-5 shadow-[0_8px_24px_rgba(0,0,0,0.20)] ring-1 ring-white/5">
                      <h3 className="mb-4 text-lg font-semibold text-slate-100">{insights.howYouLearnBest.title}</h3>
                      <ul className="space-y-2.5">
                        {insights.howYouLearnBest.bullets.map((bullet, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-base leading-relaxed text-slate-300/90">
                            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-slate-300/60" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* What You're Naturally Good At */}
                    <div className="rounded-xl border border-slate-700/60 bg-slate-950/18 p-5 shadow-[0_8px_24px_rgba(0,0,0,0.20)] ring-1 ring-white/5">
                      <h3 className="mb-4 text-lg font-semibold text-slate-100">{insights.whatYoureGoodAt.title}</h3>
                      <ul className="space-y-2.5">
                        {insights.whatYoureGoodAt.bullets.map((bullet, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-base leading-relaxed text-slate-300/90">
                            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-slate-300/60" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Why This Matters in Technology */}
                    <div className="rounded-xl border border-blue-500/25 bg-blue-600/10 p-5 shadow-[0_8px_24px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/20">
                      <h3 className="mb-4 text-lg font-semibold text-blue-100">{insights.whyThisMatters.title}</h3>
                      <ul className="space-y-2.5">
                        {insights.whyThisMatters.bullets.map((bullet, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-base leading-relaxed text-blue-50/90">
                            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-blue-200/60" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )
              })()}
            </div>
          </CardExpandableSection>

          {/* Section 2: Explore Opportunities */}
          <CardExpandableSection
            title="Explore Opportunities"
            icon="🧭"
            bullets={['Browse suggested careers', "See each role's key tasks"]}
            isExpanded={expandedSections.whereYouCouldGo}
            onToggle={() => toggleSection('whereYouCouldGo')}
            tint="gold"
          >
            <div className="space-y-4">
              {roles.map((role) => (
                <div
                  key={role}
                  className="rounded-xl border border-slate-700/60 bg-slate-950/18 p-5 shadow-[0_8px_24px_rgba(0,0,0,0.20)] ring-1 ring-white/5"
                >
                  <h3 className="text-lg font-semibold text-slate-100">{role}</h3>
                  <p className="mt-3 text-base leading-relaxed text-slate-300/90">
                    {getCareerExplanation(role)}
                  </p>
                </div>
              ))}
              {report.primaryPath.possibleRoles.length > roles.length && (
                <div className="text-center text-base text-slate-400">
                  And {report.primaryPath.possibleRoles.length - roles.length} more roles to explore!
                </div>
              )}
            </div>
          </CardExpandableSection>

          {/* Section 3: Build Skill Set */}
          <CardExpandableSection
            title="Build Skill Set"
            icon="💻"
            bullets={['Get course recommendations', 'Follow a guided roadmap']}
            isExpanded={expandedSections.whatYoullBuild}
            onToggle={() => toggleSection('whatYoullBuild')}
            tint="cyan"
          >
            <div className="space-y-5">
              {/* Core skill areas */}
              <div>
                <h3 className="mb-4 text-base font-semibold text-slate-200">Core Skill Areas</h3>
                <div className="space-y-3">
                  {learningFocus.map((focus, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 rounded-lg border border-slate-800/60 bg-slate-950/18 px-4 py-3"
                    >
                      <span className="mt-1 text-lg text-slate-400">•</span>
                      <span className="text-base leading-relaxed text-slate-300/90">{focus}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technology focus areas */}
              <div>
                <h3 className="mb-3 text-base font-semibold text-slate-200">Technology Focus</h3>
                <p className="text-base leading-relaxed text-slate-300/90">
                  Your learning will center around <span className="font-semibold text-slate-200">{heroTitle.toLowerCase()}</span>, focusing on practical application
                  and real-world problem solving in technology contexts.
                </p>
              </div>
            </div>
          </CardExpandableSection>
        </div>
      </div>
    </section>
  )
}

/**
 * Get simple 1-2 sentence explanation of what a career role does.
 * Provides concise, student-friendly introductions to each technology career.
 */
function getCareerExplanation(role: string): string {
  const r = role.toLowerCase()

  // Realistic (R) careers
  if (r.includes('it support') || r.includes('helpdesk')) {
    return 'Help people solve technology problems by troubleshooting issues and guiding them through solutions. You work directly with users to make technology work for them.'
  }
  if (r.includes('network technician')) {
    return 'Set up and maintain computer networks that connect devices and systems. You ensure data flows smoothly between computers and servers.'
  }
  if (r.includes('systems technician')) {
    return 'Install, configure, and maintain computer systems and servers. You keep hardware and software working together properly for organizations.'
  }
  if (r.includes('cybersecurity operations') || r.includes('cybersecurity')) {
    return 'Protect computer systems from threats by monitoring security and responding to incidents. You help keep digital information safe from attacks.'
  }
  if (r.includes('iot') || r.includes('hardware support')) {
    return 'Work with smart devices and connected hardware, setting them up and troubleshooting problems. You bridge physical devices with digital systems.'
  }

  // Investigative (I) careers
  if (r.includes('software developer') || r.includes('software engineer')) {
    return 'Write code to create applications and software that solve problems. You build programs that people use on computers, phones, and websites.'
  }
  if (r.includes('data analyst')) {
    return 'Examine data to find patterns and help make decisions. You work with numbers to discover insights that help businesses understand what\'s happening.'
  }
  if (r.includes('backend') || r.includes('api developer')) {
    return 'Build the behind-the-scenes parts of applications that handle data and server operations. You create the foundation that makes websites and apps work.'
  }
  if (r.includes('ai') || r.includes('ml') || r.includes('machine learning')) {
    return 'Work with artificial intelligence systems that learn from data. You help train and improve AI models that recognize patterns and automate tasks.'
  }
  if (r.includes('qa') || r.includes('quality assurance') || r.includes('automation')) {
    return 'Test software to find bugs and ensure everything works correctly. You check that applications meet quality standards before users see them.'
  }

  // Artistic (A) careers
  if (r.includes('ui/ux designer') || r.includes('ux designer') || r.includes('ui designer')) {
    return 'Design how websites and apps look and feel to users. You create layouts and plan interactions to make technology easy and enjoyable to use.'
  }
  if (r.includes('frontend developer')) {
    return 'Build the visual parts of websites and apps that users see and interact with. You write code to create beautiful, responsive interfaces.'
  }
  if (r.includes('web designer')) {
    return 'Create the visual design and layout of websites. You combine creativity with technical skills to make websites that look great and are easy to navigate.'
  }
  if (r.includes('game') || r.includes('interactive media')) {
    return 'Create video games and interactive digital experiences. You combine programming, design, and storytelling to build engaging experiences.'
  }
  if (r.includes('product design')) {
    return 'Design digital products from concept to final interface. You research user needs and create solutions that balance experience with business goals.'
  }

  // Social (S) careers
  if (r.includes('customer success')) {
    return 'Help customers get value from technology products through support and training. You ensure users succeed with the tools they use.'
  }
  if (r.includes('technical support engineer')) {
    return 'Solve complex technical problems for customers by diagnosing issues and providing solutions. You combine technical knowledge with communication skills.'
  }
  if (r.includes('edtech') || r.includes('education technology')) {
    return 'Help educators and students use technology effectively for learning. You support educational software and ensure technology enhances learning.'
  }
  if (r.includes('ux research') || r.includes('user research')) {
    return 'Study how people use technology to understand their needs and behaviors. You gather insights that help design better products for users.'
  }

  // Enterprising (E) careers
  if (r.includes('product management') || r.includes('product manager')) {
    return 'Guide technology product development by defining what to build and coordinating teams. You connect user needs with technical possibilities.'
  }
  if (r.includes('project coordinator') || r.includes('project manager')) {
    return 'Organize and manage technology projects to ensure they stay on track and meet goals. You coordinate teams and solve problems that arise.'
  }
  if (r.includes('business analyst')) {
    return 'Analyze business needs and translate them into technical requirements. You bridge the gap between business goals and technology solutions.'
  }
  if (r.includes('startup') || r.includes('entrepreneurship')) {
    return 'Build and grow technology businesses from the ground up. You identify opportunities and lead teams to bring innovative solutions to market.'
  }
  if (r.includes('scrum') || r.includes('agile coordinator')) {
    return 'Facilitate agile development processes by organizing sprints and managing backlogs. You help teams deliver value quickly and consistently.'
  }

  // Conventional (C) careers
  if (r.includes('database') || r.includes('dba')) {
    return 'Organize and maintain databases that store information. You ensure data is structured correctly and protected from loss or corruption.'
  }
  if (r.includes('qa tester') || r.includes('qa analyst')) {
    return 'Test software systematically to find defects and ensure quality. You verify that software works correctly before release.'
  }
  if (r.includes('systems coordinator') || r.includes('operations coordinator')) {
    return 'Organize and maintain technology systems and processes. You ensure procedures are followed and systems operate smoothly.'
  }
  if (r.includes('information systems')) {
    return 'Manage information technology systems for organizations. You ensure systems are properly configured and aligned with business processes.'
  }
  if (r.includes('technical documentation') || r.includes('documentation assistant')) {
    return 'Create and maintain clear documentation for technology systems and software. You write guides that help others understand and use technology.'
  }

  // Default fallback
  return 'Work in technology to solve problems and create solutions. This role combines technical skills with practical application.'
}

/**
 * Prominent RIASEC letter badge component.
 * Acts as a visual identity anchor showing the user's dominant personality type.
 */
function RiasecLetterBadge(props: { letter: string; hollandCode: string }) {
  const { letter, hollandCode } = props
  const typeInfo = getRiasecTypeInfo(letter)
  
  // Extract supporting letters (all letters except the primary)
  const supportingLetters = hollandCode
    .split('')
    .filter((l) => l !== letter)
    .slice(0, 2) // Show up to 2 supporting letters

  // Color scheme based on RIASEC type
  const colorScheme = {
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
  }

  const colors = colorScheme[letter as keyof typeof colorScheme] || colorScheme.I

  return (
    <div className="flex-shrink-0">
      {/* Primary letter badge - large and prominent */}
      <div
        className={cn(
          'relative flex flex-col items-center justify-center rounded-3xl border p-8 shadow-lg backdrop-blur-sm',
          colors.bg,
          colors.border,
        )}
        style={{ boxShadow: `0 0 40px ${colors.glow}` }}
      >
        {/* Large primary letter */}
        <div className={cn('mb-3 text-7xl font-bold md:text-8xl', colors.text)}>
          {letter}
        </div>
        
        {/* Full name label */}
        <div className={cn('mb-2 text-lg font-semibold md:text-xl', colors.text)}>
          {typeInfo.name}
        </div>
        
        {/* Short description */}
        <p className="max-w-[200px] text-center text-sm leading-relaxed text-slate-300/90">
          {typeInfo.description}
        </p>

        {/* Supporting letters - shown smaller and secondary */}
        {supportingLetters.length > 0 && (
          <div className="mt-4 flex items-center gap-2 border-t border-slate-700/40 pt-4">
            <span className="text-xs font-medium text-slate-400">Also:</span>
            <div className="flex gap-1.5">
              {supportingLetters.map((l, idx) => {
                const suppInfo = getRiasecTypeInfo(l)
                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center rounded-lg border border-slate-700/40 bg-slate-950/30 px-2.5 py-1.5"
                  >
                    <span className="text-sm font-bold text-slate-300">{l}</span>
                    <span className="text-[10px] font-medium text-slate-400">{suppInfo.name.slice(0, 4)}</span>
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
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border bg-gradient-to-b p-8 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer',
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
        <div className="mb-5 text-6xl font-bold text-slate-100 transition-transform duration-300 group-hover:scale-110">{letter}</div>
        <div className="mb-4 flex items-center justify-center text-slate-200 transition-transform duration-300 group-hover:scale-110">{icon}</div>
        <div className="text-2xl font-semibold text-slate-100 mb-3">{title}</div>
        <div className="text-base leading-relaxed text-slate-300/90 group-hover:text-slate-200 transition-colors duration-300">{description}</div>
      </div>
    </div>
  )
}


