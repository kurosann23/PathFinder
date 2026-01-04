import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireAuth } from './components/auth/RequireAuth'
import { RequirePermission } from './components/auth/RequirePermission'
import { RequireRole } from './components/auth/RequireRole'
import { RequireStudent } from './components/auth/RequireStudent'
import { RedirectIfAuth } from './components/auth/RedirectIfAuth'
import { RoleBasedRedirect } from './components/auth/RoleBasedRedirect'
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
import { TeacherCoursesPage } from './pages/TeacherCoursesPage'
import { TeacherDashboardPage } from './pages/TeacherDashboardPage'
import { TeacherQuestionsPage } from './pages/TeacherQuestionsPage'

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
          <Route index element={<RoleBasedRedirect />} />
          
          {/* Student-only routes - block teachers from accessing */}
          <Route element={<RequireStudent />}>
            <Route element={<RequirePermission permission="view_dashboard" />}>
              <Route path="/dashboard" element={<DashboardPage />} />
            </Route>
            <Route path="/profile" element={<ProfilePage />} />
            <Route element={<RequirePermission permission="take_psychometric_test" />}>
              <Route path="/psychometric-test" element={<PsychometricTestPage />} />
            </Route>
            <Route element={<RequirePermission permission="view_course_recommendations" />}>
              <Route path="/course-recommendation" element={<CourseRecommendationPage />} />
            </Route>
            <Route element={<RequirePermission permission="view_learning_roadmap" />}>
              <Route path="/learning-roadmap" element={<LearningRoadmapPage />} />
            </Route>
            <Route element={<RequirePermission permission="play_mini_games" />}>
              <Route path="/mini-games" element={<MiniGamesPage />} />
            </Route>
          </Route>

          {/* Teacher-only routes - block students from accessing */}
          <Route element={<RequireRole allowedRoles={['teacher']} />}>
            <Route path="/teacher/dashboard" element={<TeacherDashboardPage />} />
            <Route path="/teacher/questions" element={<TeacherQuestionsPage />} />
            <Route path="/teacher/courses" element={<TeacherCoursesPage />} />
          </Route>

          <Route path="*" element={<RoleBasedRedirect />} />
        </Route>
      </Route>
    </Routes>
  )
}
