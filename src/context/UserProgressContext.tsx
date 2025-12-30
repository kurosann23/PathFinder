import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  initialUserProgressState,
  journeyMeta,
  type CareerPathReport,
  type CourseRecommendation,
  type RiasecType,
  type UserProgressState,
} from '../constants/dashboard'
import { generateTechRecommendations } from '../utils/generateTechRecommendations.js'
import { useAuth } from './AuthContext'
import {
  deletePsychometricResult,
  fetchPsychometricResult,
  upsertPsychometricResult,
} from '../lib/psychometricRepo'

type UserProgressContextValue = {
  // Stores the minimal user progress (dummy-only, frontend state).
  progress: UserProgressState
  isHydrating: boolean
  hydrationError: string
  isSavingPsychometric: boolean
  // Minimal actions for UI demos.
  setUserName: (name: string) => void
  submitPsychometricTest: (payload: {
    code: string
    topType: RiasecType
    percentages: Record<RiasecType, number>
    recommendations: CourseRecommendation[]
    careerPathReport: CareerPathReport
  }) => Promise<void>
  resetPsychometricTest: () => Promise<void>
  simulateProgress: () => void
  resetDemo: () => void
}

const UserProgressContext = createContext<UserProgressContextValue | null>(null)

function cloneInitial(): UserProgressState {
  return {
    ...initialUserProgressState,
    courseRecommendations: [...initialUserProgressState.courseRecommendations],
    riasecPercentages: { ...initialUserProgressState.riasecPercentages },
    journey: { ...initialUserProgressState.journey },
  }
}

export function UserProgressProvider(props: { children: ReactNode }) {
  const [progress, setProgress] = useState<UserProgressState>(() => cloneInitial())
  const [isHydrating, setIsHydrating] = useState(false)
  const [hydrationError, setHydrationError] = useState('')
  const [isSavingPsychometric, setIsSavingPsychometric] = useState(false)
  const { user, isReady } = useAuth()

  useEffect(() => {
    if (!isReady) return

    // Reset state on sign-out.
    if (!user) {
      setHydrationError('')
      setIsHydrating(false)
      setIsSavingPsychometric(false)
      setProgress(cloneInitial())
      return
    }

    let cancelled = false

    async function hydrate() {
      setIsHydrating(true)
      setHydrationError('')
      try {
        const row = await fetchPsychometricResult(user.id)
        if (cancelled) return

        if (!row) {
          setIsHydrating(false)
          return
        }

        setProgress((prev) => ({
          ...prev,
          psychometricCompleted: true,
          psychometricResult: row.code ?? prev.psychometricResult,
          riasecPercentages: {
            R: row.riasec_percentages?.R ?? prev.riasecPercentages.R,
            I: row.riasec_percentages?.I ?? prev.riasecPercentages.I,
            A: row.riasec_percentages?.A ?? prev.riasecPercentages.A,
            S: row.riasec_percentages?.S ?? prev.riasecPercentages.S,
            E: row.riasec_percentages?.E ?? prev.riasecPercentages.E,
            C: row.riasec_percentages?.C ?? prev.riasecPercentages.C,
          },
          careerPathReport: (row.career_path_report as CareerPathReport | null) ?? null,
          courseRecommendations: (row.course_recommendations as CourseRecommendation[] | null) ?? [],
          journey: { ...prev.journey, psychometric: true },
        }))
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to load psychometric result.'
        if (!cancelled) setHydrationError(msg)
      } finally {
        if (!cancelled) setIsHydrating(false)
      }
    }

    void hydrate()
    return () => {
      cancelled = true
    }
  }, [isReady, user?.id])

  const value = useMemo<UserProgressContextValue>(() => {
    function setUserName(name: string) {
      setProgress((prev) => ({ ...prev, userName: name }))
    }

    async function submitPsychometricTest(payload: {
      code: string
      topType: RiasecType
      percentages: Record<RiasecType, number>
      recommendations: CourseRecommendation[]
      careerPathReport: CareerPathReport
    }) {
      if (!user) throw new Error('Not signed in. Please log in again.')

      // Prevent double-submit unless user explicitly resets/retests.
      if (progress.psychometricCompleted) return

      setIsSavingPsychometric(true)
      try {
        await upsertPsychometricResult({
          userId: user.id,
          code: payload.code,
          riasecPercentages: payload.percentages,
          careerPathReport: payload.careerPathReport,
          courseRecommendations:
            payload.recommendations.length > 0
              ? payload.recommendations
              : generateTechRecommendations(payload.topType),
        })

        setProgress((prev) => ({
          ...prev,
          psychometricCompleted: true,
          psychometricResult: payload.code,
          riasecPercentages: { ...payload.percentages },
          careerPathReport: payload.careerPathReport,
          courseRecommendations:
            payload.recommendations.length > 0
              ? payload.recommendations
              : generateTechRecommendations(payload.topType),
          journey: { ...prev.journey, psychometric: true },
        }))
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to save psychometric result.'
        throw new Error(msg)
      } finally {
        setIsSavingPsychometric(false)
      }
    }

    async function resetPsychometricTest() {
      if (!user) {
        // Local-only reset if user is missing (shouldn't happen in protected routes).
        setProgress((prev) => ({
          ...prev,
          psychometricCompleted: false,
          psychometricResult: '',
          riasecPercentages: { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 },
          careerPathReport: null,
          courseRecommendations: [],
          journey: { ...prev.journey, psychometric: false, course: false },
        }))
        return
      }

      await deletePsychometricResult(user.id)
      setProgress((prev) => ({
        ...prev,
        psychometricCompleted: false,
        psychometricResult: '',
        riasecPercentages: { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 },
        careerPathReport: null,
        courseRecommendations: [],
        journey: { ...prev.journey, psychometric: false, course: false },
      }))
    }

    function simulateProgress() {
      setProgress((prev) => {
        const nextProgress = Math.min(100, prev.roadmapProgress + 10)

        // Mark the next incomplete journey item as done (simple demo behavior).
        const nextJourneyKey = journeyMeta.find((j) => !prev.journey[j.key])?.key
        const nextJourney = nextJourneyKey
          ? { ...prev.journey, [nextJourneyKey]: true }
          : prev.journey

        return { ...prev, roadmapProgress: nextProgress, journey: nextJourney }
      })
    }

    function resetDemo() {
      setProgress(cloneInitial())
    }

    return {
      progress,
      isHydrating,
      hydrationError,
      isSavingPsychometric,
      setUserName,
      submitPsychometricTest,
      resetPsychometricTest,
      simulateProgress,
      resetDemo,
    }
  }, [hydrationError, isHydrating, isSavingPsychometric, progress, user])

  return (
    <UserProgressContext.Provider value={value}>
      {props.children}
    </UserProgressContext.Provider>
  )
}

export function useUserProgress() {
  const ctx = useContext(UserProgressContext)
  if (!ctx) {
    throw new Error('useUserProgress must be used within a UserProgressProvider')
  }
  return ctx
}


