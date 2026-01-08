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
  markCourseViewed: () => void
  markAppointmentCompleted: () => void
  markProfileCompleted: () => void
}

const UserProgressContext = createContext<UserProgressContextValue | null>(null)

function cloneInitial(): UserProgressState {
  // Start with completely fresh state - no localStorage checks
  // localStorage will be restored per-user in the hydration effect
  return {
    ...initialUserProgressState,
    courseRecommendations: [...initialUserProgressState.courseRecommendations],
    riasecPercentages: { ...initialUserProgressState.riasecPercentages },
    journey: { 
      ...initialUserProgressState.journey,
    },
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

    const userId = user.id
    let cancelled = false

    async function hydrate() {
      setIsHydrating(true)
      setHydrationError('')
      try {
        // Check for user-specific localStorage values (restore session progress)
        const courseViewedKey = `pathfinder_course_viewed_${userId}`
        const appointmentCompletedKey = `pathfinder_appointment_completed_${userId}`
        const courseViewed = typeof window !== 'undefined' ? Boolean(localStorage.getItem(courseViewedKey)) : false
        const appointmentCompleted = typeof window !== 'undefined' ? Boolean(localStorage.getItem(appointmentCompletedKey)) : false

        // Check if profile exists (import fetchProfile to check)
        const { fetchProfile } = await import('../lib/profileRepo')
        let profileExists = false
        try {
          const profile = await fetchProfile(userId)
          profileExists = !!profile && !!profile.full_name && !!profile.avatar_url // Profile is complete only with avatar uploaded
        } catch {
          // Profile doesn't exist yet - that's fine for new users
          profileExists = false
        }

        const row = await fetchPsychometricResult(userId)
        if (cancelled) return

        // Update progress with all loaded data
        setProgress((prev) => ({
          ...prev,
          // Mark profile as completed if it exists
          journey: {
            ...prev.journey,
            profile: profileExists,
            // Restore localStorage values for this user
            course: courseViewed,
            appointment: appointmentCompleted,
            // Mark psychometric as completed if we have results
            psychometric: !!row,
          },
          // Load psychometric data if available
          ...(row ? {
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
          } : {}),
        }))
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to load user progress.'
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
          journey: { ...prev.journey, psychometric: false, course: false, appointment: false },
        }))
        return
      }

      await deletePsychometricResult(user.id)
      const courseViewedKey = `pathfinder_course_viewed_${user.id}`
      const appointmentCompletedKey = `pathfinder_appointment_completed_${user.id}`
      localStorage.removeItem(courseViewedKey)
      localStorage.removeItem(appointmentCompletedKey)
      setProgress((prev) => ({
        ...prev,
        psychometricCompleted: false,
        psychometricResult: '',
        riasecPercentages: { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 },
        careerPathReport: null,
        courseRecommendations: [],
        journey: { ...prev.journey, psychometric: false, course: false, appointment: false },
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

    function markCourseViewed() {
      if (!user) return
      const key = `pathfinder_course_viewed_${user.id}`
      localStorage.setItem(key, 'true')
      setProgress((prev) => ({
        ...prev,
        journey: { ...prev.journey, course: true },
      }))
    }

    function markAppointmentCompleted() {
      if (!user) return
      const key = `pathfinder_appointment_completed_${user.id}`
      localStorage.setItem(key, 'true')
      setProgress((prev) => ({
        ...prev,
        journey: { ...prev.journey, appointment: true },
      }))
    }

    function markProfileCompleted() {
      setProgress((prev) => ({
        ...prev,
        journey: { ...prev.journey, profile: true },
      }))
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
      markCourseViewed,
      markAppointmentCompleted,
      markProfileCompleted,
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


