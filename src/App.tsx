import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireAuth } from './components/auth/RequireAuth'
import { RequirePermission } from './components/auth/RequirePermission'
import { RequireRole } from './components/auth/RequireRole'
import { RequireStudent } from './components/auth/RequireStudent'
import { RedirectIfAuth } from './components/auth/RedirectIfAuth'
import { RoleBasedRedirect } from './components/auth/RoleBasedRedirect'
import { AppLayout } from './layouts/AppLayout'
import { CourseRecommendationPage } from './pages/CourseRecommendationPage'
import { DashboardPage } from './pages/DashboardPage'
import { LearningRoadmapPage } from './pages/LearningRoadmapPage'
import { AuthPage } from './pages/AuthPage'
import { ProfilePage } from './pages/ProfilePage'
import { PsychometricTestPage } from './pages/PsychometricTestPage'
import { TeacherCoursesPage } from './pages/TeacherCoursesPage'
import { TeacherDashboardPage } from './pages/TeacherDashboardPage'
import { TeacherQuestionsPage } from './pages/TeacherQuestionsPage'
import { TeacherStudentOverviewPage } from './pages/TeacherStudentOverviewPage'
import { TeacherAppointmentsPage } from './pages/TeacherAppointmentsPage'
import { StudentAppointmentPage } from './pages/StudentAppointmentPage'

export default function App() {
  return (
    <Routes>
      {/* Public auth routes (redirect away if already logged-in) */}
      <Route element={<RedirectIfAuth />}>
        <Route path="/login" element={<AuthPage initialMode="login" />} />
        <Route path="/signup" element={<AuthPage initialMode="signup" />} />
      </Route>

          {/* Protected app routes */}
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route index element={<RoleBasedRedirect />} />
          
          {/* Profile route - accessible by both students and teachers */}
          <Route path="/profile" element={<ProfilePage />} />

          {/* Student-only routes - block teachers from accessing */}
          <Route element={<RequireStudent />}>
            <Route element={<RequirePermission permission="view_dashboard" />}>
              <Route path="/dashboard" element={<DashboardPage />} />
            </Route>
            <Route element={<RequirePermission permission="take_psychometric_test" />}>
              <Route path="/psychometric-test" element={<PsychometricTestPage />} />
            </Route>
            <Route element={<RequirePermission permission="view_course_recommendations" />}>
              <Route path="/course-recommendation" element={<CourseRecommendationPage />} />
            </Route>
            <Route element={<RequirePermission permission="view_learning_roadmap" />}>
              <Route path="/learning-roadmap" element={<LearningRoadmapPage />} />
            </Route>
            <Route path="/appointment" element={<StudentAppointmentPage />} />
          </Route>

          {/* Teacher-only routes - block students from accessing */}
          <Route element={<RequireRole allowedRoles={['teacher']} />}>
            <Route path="/teacher/dashboard" element={<TeacherDashboardPage />} />
            <Route path="/teacher/students" element={<TeacherStudentOverviewPage />} />
            <Route path="/teacher/appointments" element={<TeacherAppointmentsPage />} />
            <Route path="/teacher/questions" element={<TeacherQuestionsPage />} />
            <Route path="/teacher/courses" element={<TeacherCoursesPage />} />
          </Route>

          <Route path="*" element={<RoleBasedRedirect />} />
        </Route>
      </Route>
    </Routes>
  )
}
