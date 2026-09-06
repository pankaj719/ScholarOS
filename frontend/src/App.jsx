import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './components/Toast'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import BrowseCourses from './pages/BrowseCourses'
import CourseDetails from './pages/CourseDetails'
import SubjectDetails from './pages/SubjectDetails'
import ChapterDetails from './pages/ChapterDetails'
import LessonDetails from './pages/LessonDetails'
import LearningContent from './pages/LearningContent'
import Students from './pages/Students'
import UsersPage from './pages/UsersPage'
import Classes from './pages/Classes'
import Attendance from './pages/Attendance'
import Exams from './pages/Exams'
import Fees from './pages/Fees'
import Notices from './pages/Notices'
import Assignments from './pages/Assignments'
import Timetable from './pages/Timetable'
import Profile from './pages/Profile'
import Banners from './pages/Banners'

function Protected({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AdminOnly({ children }) {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />

  if (user.role !== 'admin') {
    return <Navigate to="/app" replace />
  }

  return children
}

function AdminTeacherOnly({ children }) {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />

  if (user.role !== 'admin' && user.role !== 'teacher') {
    return <Navigate to="/app" replace />
  }

  return children
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/app" element={<Protected><Layout /></Protected>}>
            <Route index element={<Dashboard />} />
            <Route path="students" element={<Students />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="banners" element={<AdminOnly><Banners /></AdminOnly>} />
            <Route path="classes" element={<Classes />} />
            <Route path="browse-courses" element={<BrowseCourses />} />
            <Route path="course/:id" element={<CourseDetails />} />
            <Route path="subject/:subjectId" element={<SubjectDetails />} />
      <Route path="chapter/:chapterId" element={<ChapterDetails />} />
      <Route path="lesson/:lessonId" element={<LessonDetails />} />
            <Route path="learning-content" element={<AdminTeacherOnly><LearningContent /></AdminTeacherOnly>} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="exams" element={<Exams />} />
            <Route path="fees" element={<Fees />} />
            <Route path="notices" element={<Notices />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="timetable" element={<Timetable />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  )
}
