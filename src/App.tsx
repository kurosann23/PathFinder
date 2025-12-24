import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { CourseRecommendationPage } from './pages/CourseRecommendationPage'
import { DashboardPage } from './pages/DashboardPage'
import { LearningRoadmapPage } from './pages/LearningRoadmapPage'
import { MiniGamesPage } from './pages/MiniGamesPage'
import { ProfilePage } from './pages/ProfilePage'
import { PsychometricTestPage } from './pages/PsychometricTestPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/psychometric-test" element={<PsychometricTestPage />} />
        <Route path="/course-recommendation" element={<CourseRecommendationPage />} />
        <Route path="/learning-roadmap" element={<LearningRoadmapPage />} />
        <Route path="/mini-games" element={<MiniGamesPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}
