import {
  createContext,
  useContext,
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

type UserProgressContextValue = {
  // Stores the minimal user progress (dummy-only, frontend state).
  progress: UserProgressState
  // Minimal actions for UI demos.
  setUserName: (name: string) => void
  submitPsychometricTest: (payload: {
    code: string
    topType: RiasecType
    percentages: Record<RiasecType, number>
    recommendations: CourseRecommendation[]
    careerPathReport: CareerPathReport
  }) => void
  resetPsychometricTest: () => void
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

  const value = useMemo<UserProgressContextValue>(() => {
    function setUserName(name: string) {
      setProgress((prev) => ({ ...prev, userName: name }))
    }

    function submitPsychometricTest(payload: {
      code: string
      topType: RiasecType
      percentages: Record<RiasecType, number>
      recommendations: CourseRecommendation[]
      careerPathReport: CareerPathReport
    }) {
      setProgress((prev) => {
        // Beginner-friendly rule: once submitted, keep it completed (reset via Reset Demo).
        if (prev.psychometricCompleted) return prev

        return {
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
        }
      })
    }

    function resetPsychometricTest() {
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
      setUserName,
      submitPsychometricTest,
      resetPsychometricTest,
      simulateProgress,
      resetDemo,
    }
  }, [progress])

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


