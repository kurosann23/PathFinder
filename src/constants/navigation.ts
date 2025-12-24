export type NavKey =
  | 'dashboard'
  | 'profile'
  | 'psychometric'
  | 'course'
  | 'roadmap'
  | 'games'

export const navigation: Array<{
  key: NavKey
  label: string
  to: string
}> = [
  { key: 'dashboard', label: 'Dashboard', to: '/dashboard' },
  { key: 'profile', label: 'Profile', to: '/profile' },
  { key: 'psychometric', label: 'Psychometric Test', to: '/psychometric-test' },
  { key: 'course', label: 'Course Recommendation', to: '/course-recommendation' },
  { key: 'roadmap', label: 'Learning Roadmap', to: '/learning-roadmap' },
  { key: 'games', label: 'Mini Games', to: '/mini-games' },
] as const


