export type CareerTraitKey =
  | 'realistic'
  | 'investigative'
  | 'artistic'
  | 'social'
  | 'enterprising'
  | 'conventional'

export type JourneyKey =
  | 'profile'
  | 'psychometric'
  | 'course'
  | 'roadmap'
  | 'minigame'

export type RiasecType = 'R' | 'I' | 'A' | 'S' | 'E' | 'C'

export type UserProgressState = {
  // Minimal shared state for user progress (dummy-only, frontend state).
  userName: string
  psychometricCompleted: boolean
  // Holland Code derived from RIASEC scoring (e.g., "IAC", "RIC")
  psychometricResult: string
  // RIASEC percentages shown in Psychometric Test trait breakdown.
  riasecPercentages: Record<RiasecType, number>
  roadmapProgress: number
  courseRecommendations: CourseRecommendation[]
  journey: Record<JourneyKey, boolean>
}

export type CourseSuggestion = {
  title: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  duration: string
  why: string
  outcomes: string[]
}

export type CourseRecommendation = {
  subDomain: string
  matchPercent: number
  explanation: string
  suggestedCourses: CourseSuggestion[]
  starterProjects: string[]
  tools: string[]
}

export const dashboardHeader = {
  title: 'Dashboard',
  subtitle: 'Your personalized career development hub',
} as const

export const careerSnapshotMeta: Array<{
  key: CareerTraitKey
  label: string
  barClass: string
}> = [
  { key: 'realistic', label: 'Realistic', barClass: 'bg-rose-400' },
  { key: 'investigative', label: 'Investigative', barClass: 'bg-sky-400' },
  { key: 'artistic', label: 'Artistic', barClass: 'bg-emerald-400' },
  { key: 'social', label: 'Social', barClass: 'bg-amber-300' },
  { key: 'enterprising', label: 'Enterprising', barClass: 'bg-violet-400' },
  { key: 'conventional', label: 'Conventional', barClass: 'bg-pink-400' },
]

export const journeyMeta: Array<{ key: JourneyKey; label: string }> = [
  { key: 'profile', label: 'Complete Profile' },
  { key: 'psychometric', label: 'Take Psychometric Test' },
  { key: 'course', label: 'Explore Course Recommendations' },
  { key: 'roadmap', label: 'Start Career Roadmap' },
  { key: 'minigame', label: 'Play Mini Game' },
]

export const initialCareerTraits: Record<CareerTraitKey, number> = {
  realistic: 75,
  investigative: 60,
  artistic: 45,
  social: 80,
  enterprising: 70,
  conventional: 90,
}

export const initialUserProgressState: UserProgressState = {
  userName: 'Hisyam',
  psychometricCompleted: false,
  psychometricResult: '',
  riasecPercentages: { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 },
  roadmapProgress: 70,
  courseRecommendations: [],
  journey: {
    profile: true,
    psychometric: false,
    course: false,
    roadmap: false,
    minigame: false,
  },
}


