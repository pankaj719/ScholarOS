import React from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Calendar,
  ClipboardCheck,
  Award,
  Wallet,
  Megaphone,
  FileText,
  BookOpen,
  ClipboardList,
  LogOut,
  Menu,
  School,
  X,
  Search,
  UserCircle,
  HelpCircle,
  Download,
  MessageCircle,
  Image as ImageIcon
} from 'lucide-react'

const NAV = [
  { label: 'Dashboard', to: '/app', icon: LayoutDashboard },
  { label: 'Students', to: '/app/students', icon: Users },
  { label: 'Teachers & Staff', to: '/app/teachers', icon: GraduationCap },
  { label: 'Classes', to: '/app/classes', icon: School },
  { label: 'Learning Content', to: '/app/learning-content', icon: BookOpen },
  { label: 'Attendance', to: '/app/attendance', icon: ClipboardCheck },
  { label: 'Exams & Marks', to: '/app/exams', icon: Award },
  { label: 'Fees', to: '/app/fees', icon: Wallet },
  { label: 'Notices', to: '/app/notices', icon: Megaphone },
  { label: 'Assignments', to: '/app/assignments', icon: FileText },
  { label: 'Timetable', to: '/app/timetable', icon: Calendar },
  { label: 'Profile', to: '/app/profile', icon: UserCircle },
  { label: 'Banners', to: '/app/banners', icon: ImageIcon, roles: ['admin'] }
]

function StudentLayout({ user, logout }) {
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const nav = useNavigate()

  const closeDrawer = () => setDrawerOpen(false)

  const handleLogout = () => {
    closeDrawer()
    logout()
    nav('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 text-[#0B1F3A]">

      {/* MOBILE / STUDENT HEADER */}
      <header className="sticky top-0 z-50 bg-[#0B1F3A] text-white shadow-md">
        <div className="flex h-[88px] items-center justify-between px-4">

          <button
            onClick={() => setDrawerOpen(true)}
            className="rounded-xl p-2 text-[#FACC15] hover:bg-white/10"
            aria-label="Open menu"
          >
            <Menu size={30} strokeWidth={2.5} />
          </button>

          <Link
            to="/app"
            className="flex flex-col items-center leading-tight text-center"
          >
            <span className="text-lg font-bold tracking-tight">
              <span className="text-white">Hitesh </span>
              <span className="text-[#FACC15]">Coaching Classes</span>
            </span>

            <span className="mt-1 text-[11px] font-medium text-white/90">
              Learn <span className="text-[#FACC15]">•</span> Practice <span className="text-[#FACC15]">•</span> Succeed
            </span>
          </Link>

          <Link
            to="/app/profile"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FACC15] text-[#0B1F3A]"
          >
            <UserCircle size={29} strokeWidth={2.5} />
          </Link>
        </div>

        {/* YELLOW WAVE */}
        <div className="relative h-3 overflow-hidden">
          <svg
            viewBox="0 0 1200 60"
            preserveAspectRatio="none"
            className="absolute bottom-0 h-8 w-full"
          >
            <path
              d="M0,30 C120,0 180,55 300,30 C430,5 500,55 650,32 C800,8 900,55 1030,28 C1110,10 1160,20 1200,35"
              fill="none"
              stroke="#FACC15"
              strokeWidth="6"
            />
          </svg>
        </div>
      </header>

      {/* DRAWER OVERLAY */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/40"
          onClick={closeDrawer}
        >
          <aside
            className="h-full w-[82%] max-w-sm bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >

            {/* DRAWER HEADER */}
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <div className="text-lg font-bold">
                  Hitesh Coaching Classes
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Student Panel
                </div>
              </div>

              <button
                onClick={closeDrawer}
                className="rounded-xl p-2 hover:bg-[#FACC15]/20"
              >
                <X size={22} />
              </button>
            </div>

            {/* PROFILE */}
            <div className="border-b border-slate-200 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0B1F3A]/10">
                  <UserCircle size={30} />
                </div>

                <div className="min-w-0">
                  <div className="truncate font-semibold">
                    {user?.name || 'Student'}
                  </div>

                  <div className="truncate text-xs text-slate-500">
                    {user?.email || ''}
                  </div>

                  <div className="mt-1 text-xs font-medium text-[#0B1F3A]/75">
                    Learner
                  </div>
                </div>
              </div>
            </div>

            {/* DRAWER LINKS */}
            <nav className="p-3">

              <Link
                to="/app"
                onClick={closeDrawer}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium hover:bg-[#FACC15]/20"
              >
                <LayoutDashboard size={19} />
                Home
              </Link>

              <Link
                to="/app/browse-courses"
                onClick={closeDrawer}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium hover:bg-[#FACC15]/20"
              >
                <BookOpen size={19} />
                Browse Courses
              </Link>

              <Link
                to="/app/classes"
                onClick={closeDrawer}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium hover:bg-[#FACC15]/20"
              >
                <GraduationCap size={19} />
                My Courses
              </Link>

              <Link
                to="/app/assignments"
                onClick={closeDrawer}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium hover:bg-[#FACC15]/20"
              >
                <Download size={19} />
                Downloads
              </Link>

              <Link
                to="/app/notices"
                onClick={closeDrawer}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium hover:bg-[#FACC15]/20"
              >
                <Megaphone size={19} />
                Notifications
              </Link>

              <Link
                to="/app/profile"
                onClick={closeDrawer}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium hover:bg-[#FACC15]/20"
              >
                <UserCircle size={19} />
                Edit Profile
              </Link>

              <Link
                to="/app/profile"
                onClick={closeDrawer}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium hover:bg-[#FACC15]/20"
              >
                <HelpCircle size={19} />
                Help & Support
              </Link>

              <button
                onClick={handleLogout}
                className="mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut size={19} />
                Sign Out
              </button>

            </nav>
          </aside>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="pb-24">
        <Outlet />
      </main>

      {/* STUDENT BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#0B1F3A]/15 bg-white">
        <div className="mx-auto grid max-w-lg grid-cols-4">

          <Link
            to="/app"
            className="flex flex-col items-center gap-1 px-2 py-3 text-xs font-medium text-[#0B1F3A]/85"
          >
            <LayoutDashboard size={20} />
            Home
          </Link>

          <Link
            to="/app/classes"
            className="flex flex-col items-center gap-1 px-2 py-3 text-xs font-medium text-[#0B1F3A]/85"
          >
            <BookOpen size={20} />
            My Courses
          </Link>

          <Link
            to="/app/notices"
            className="flex flex-col items-center gap-1 px-2 py-3 text-xs font-medium text-[#0B1F3A]/85"
          >
            <MessageCircle size={20} />
            Help
          </Link>

          <Link
            to="/app/profile"
            className="flex flex-col items-center gap-1 px-2 py-3 text-xs font-medium text-[#0B1F3A]/85"
          >
            <UserCircle size={20} />
            Profile
          </Link>

        </div>
      </nav>

    </div>
  )
}

function ErpLayout({ user, logout }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* MOBILE HEADER */}
      <header className="sticky top-0 z-40 border-b border-[#0B1F3A]/15 bg-white lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">

          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-xl p-2 hover:bg-[#FACC15]/20"
          >
            <Menu size={24} />
          </button>

          <div className="text-sm font-bold">
            H_M SMS
          </div>

          <Link
            to="/app/profile"
            className="rounded-xl p-2 hover:bg-[#FACC15]/20"
          >
            <UserCircle size={22} />
          </Link>

        </div>
      </header>

      {/* MOBILE SIDEBAR */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <aside
            className="h-full w-72 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <div className="font-bold">H_M SMS</div>
                <div className="text-xs text-slate-500">
                  Student Management
                </div>
              </div>

              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-xl p-2 hover:bg-[#FACC15]/20"
              >
                <X size={22} />
              </button>
            </div>

            <nav className="p-3">
              {NAV.filter((item) => !item.roles || item.roles.includes(user?.role)).map((item) => {
                const Icon = item.icon

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium hover:bg-[#FACC15]/20"
                  >
                    <Icon size={19} />
                    {item.label}
                  </Link>
                )
              })}

              <button
                onClick={handleLogout}
                className="mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut size={19} />
                Sign Out
              </button>
            </nav>

          </aside>
        </div>
      )}

      <div className="flex min-h-screen">

        {/* DESKTOP SIDEBAR */}
        <aside className="hidden w-64 border-r border-[#0B1F3A]/15 bg-white lg:block">

          <div className="border-b border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B1F3A]/10">
                <School size={22} />
              </div>

              <div>
                <div className="font-bold">H_M SMS</div>
                <div className="text-xs text-slate-500">
                  Student Management
                </div>
              </div>
            </div>
          </div>

          <nav className="p-3">
            {NAV.filter((item) => !item.roles || item.roles.includes(user?.role)).map((item) => {
              const Icon = item.icon

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="mb-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium hover:bg-[#FACC15]/20"
                >
                  <Icon size={19} />
                  {item.label}
                </Link>
              )
            })}

            <button
              onClick={handleLogout}
              className="mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut size={19} />
              Sign Out
            </button>
          </nav>

        </aside>

        {/* ERP CONTENT */}
        <div className="min-w-0 flex-1">

          <header className="hidden border-b border-[#0B1F3A]/15 bg-white lg:block">
            <div className="flex h-16 items-center justify-between px-6">

              <div>
                <div className="text-sm font-semibold">
                  Welcome, {user?.name || 'User'}
                </div>

                <div className="text-xs text-slate-500 capitalize">
                  {user?.role || ''}
                </div>
              </div>

              <Link
                to="/app/profile"
                className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-[#FACC15]/20"
              >
                <UserCircle size={22} />
                <span className="text-sm">
                  {user?.name || 'Profile'}
                </span>
              </Link>

            </div>
          </header>

          <main className="p-4 sm:p-6">
            <Outlet />
          </main>

        </div>

      </div>
    </div>
  )
}

export default function Layout() {
  const { user, logout } = useAuth()
  const nav = useNavigate()

  if (!user) {
    nav('/login')
    return null
  }

  if (user.role === 'student') {
    return <StudentLayout user={user} logout={logout} />
  }

  return <ErpLayout user={user} logout={logout} />
}
