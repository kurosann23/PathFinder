import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireAuth } from './components/auth/RequireAuth'
import { RedirectIfAuth } from './components/auth/RedirectIfAuth'
import { AppLayout } from './layouts/AppLayout'
import { AuthLayout } from './layouts/AuthLayout'
import { CourseRecommendationPage } from './pages/CourseRecommendationPage'
import { DashboardPage } from './pages/DashboardPage'
import { LearningRoadmapPage } from './pages/LearningRoadmapPage'
import { LoginPage } from './pages/LoginPage'
import { MiniGamesPage } from './pages/MiniGamesPage'
import { ProfilePage } from './pages/ProfilePage'
import { PsychometricTestPage } from './pages/PsychometricTestPage'
import { SignUpPage } from './pages/SignUpPage'

export default function App() {
  return (
    <Routes>
      {/* Public auth routes (redirect away if already logged-in) */}
      <Route element={<RedirectIfAuth />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
        </Route>
      </Route>

      {/* Protected app routes */}
      <Route element={<RequireAuth />}>
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
      </Route>
    </Routes>
  )
}
