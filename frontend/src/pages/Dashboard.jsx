import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import {
  BookOpen, FileText, ClipboardCheck, Download, MessageCircle,
  Bell, PlayCircle, Clock, ChevronRight, GraduationCap,
  IndianRupee, CalendarDays, Award, Wallet, Megaphone
} from 'lucide-react'

const quickItems = [
  { title: 'My Courses', icon: BookOpen, to: '/app/classes', color: 'bg-white/10 text-[#0B1F3A]' },
  { title: 'Free Courses', icon: GraduationCap, to: '/app/classes', color: 'bg-[#0B1F3A]/10 text-[#0B1F3A]' },
  { title: 'Notes', icon: FileText, to: '/app/assignments', color: 'bg-[#FACC15]/20 text-[#0B1F3A]' },
  { title: 'Tests', icon: ClipboardCheck, to: '/app/exams', color: 'bg-[#0B1F3A]/10 text-[#0B1F3A]' },
  { title: 'Downloads', icon: Download, to: '/app/assignments', color: 'bg-[#FACC15]/20 text-[#0B1F3A]' },
  { title: 'Live Classes', icon: PlayCircle, to: '/app/timetable', color: 'bg-[#0B1F3A]/10 text-[#0B1F3A]' },
]

function StudentHome({ user }) {
  const [stats, setStats] = useState({})
  const [banners, setBanners] = useState([])
  const [bannerDebug, setBannerDebug] = useState('Checking banner API...')

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(r => setStats(r.data || {}))
      .catch(() => setStats({}))

    api.get('/banners')
      .then(r => {
        console.log('BANNER API RESPONSE:', r.data)
        setBannerDebug(`Banner API: ${Array.isArray(r.data) ? r.data.length : 'NOT ARRAY'} banner(s)`)
        setBanners(Array.isArray(r.data) ? r.data : [])
      })
      .catch(err => {
        console.log('BANNER API ERROR:', err.response?.data || err.message)
        setBannerDebug(`Banner API ERROR: ${err.response?.status || ''} ${err.response?.data?.error || err.message}`)
        setBanners([])
      })
  }, [])

  const quickItems = [
    { title: 'My Courses', icon: BookOpen, to: '/app/classes' },
    { title: 'Free Courses', icon: GraduationCap, to: '/app/classes' },
    { title: 'Notes', icon: FileText, to: '/app/assignments' },
    { title: 'Tests', icon: ClipboardCheck, to: '/app/exams' },
    { title: 'Downloads', icon: Download, to: '/app/assignments' },
    { title: 'Live Classes', icon: PlayCircle, to: '/app/timetable' },
  ]

  const services = [
    {
      title: 'Attendance',
      text: `${stats.attendance_percentage || 0}% present`,
      icon: ClipboardCheck,
      to: '/app/attendance'
    },
    {
      title: 'Results',
      text: 'View your marks',
      icon: Award,
      to: '/app/exams'
    },
    {
      title: 'Fees',
      text: `₹${stats.fees_due || 0} due`,
      icon: IndianRupee,
      to: '/app/fees'
    },
    {
      title: 'Timetable',
      text: "Today's classes",
      icon: CalendarDays,
      to: '/app/timetable'
    }
  ]

  return (
    <div className="min-h-full bg-white -m-4 lg:-m-8 pb-24 text-[#0B1F3A]">

      <main className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Student Dashboard Banners */}
        {banners.filter(banner => banner.image_url).map((banner) => (
          <section key={banner.id} className="pt-5">
            <div className="relative overflow-hidden rounded-3xl shadow-xl">
              <img
                src={banner.image_url.startsWith('http')
                  ? banner.image_url
                  : `https://heating-temporarily-essentially-difficulty.trycloudflare.com${banner.image_url}`}
                alt={banner.title || 'Banner'}
                className="block w-full h-auto object-cover"
              />
            </div>
          </section>
        ))}

        {/* Explore */}
        <section className="mt-7">
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#0B1F3A]">
                Quick access
              </p>
              <h2 className="text-xl font-extrabold text-[#0B1F3A] mt-1">
                Explore
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              Everything you need
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {quickItems.map(item => {
              const Icon = item.icon

              return (
                <Link
                  key={item.title}
                  to={item.to}
                  className="group bg-white rounded-2xl border border-[#0B1F3A]/15 p-3 sm:p-4 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
                >
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-[#0B1F3A] text-white grid place-items-center group-hover:bg-[#FACC15] transition">
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="text-[11px] sm:text-xs font-bold text-[#0B1F3A]/85 mt-3 leading-tight">
                    {item.title}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* My Learning */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#0B1F3A]">
                Your progress
              </p>
              <h2 className="text-xl font-extrabold text-[#0B1F3A] mt-1">
                My Learning
              </h2>
            </div>

            <Link
              to="/app/classes"
              className="text-xs font-bold text-[#0B1F3A] flex items-center gap-1"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white rounded-3xl border border-[#0B1F3A]/15 p-4 sm:p-5 shadow-sm">
            <div className="flex gap-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-[#0B1F3A] to-[#071426] flex-shrink-0 grid place-items-center text-white">
                <BookOpen className="w-9 h-9" />
              </div>

              <div className="flex-1 min-w-0 py-1">
                <div className="text-[10px] font-bold tracking-wider text-[#0B1F3A] uppercase">
                  Current Course
                </div>

                <h3 className="font-extrabold text-[#0B1F3A] mt-1 truncate">
                  My Coaching Course
                </h3>

                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <PlayCircle className="w-3.5 h-3.5" /> 24 Classes
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> 12 hrs
                  </span>
                </div>

                <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full w-[45%] bg-[#FACC15] rounded-full" />
                </div>

                <div className="text-[10px] font-semibold text-slate-400 mt-1">
                  45% completed
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Continue Learning */}
        <section className="mt-8">
          <SectionHeading title="Continue Learning" to="/app/classes" />

          <div className="bg-[#0B1F3A] rounded-3xl p-5 text-white shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10 grid place-items-center flex-shrink-0">
                <PlayCircle className="w-7 h-7" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold truncate">
                  Continue your classes
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Pick up where you left off
                </p>

                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-[45%] bg-[#FACC15] rounded-full" />
                  </div>
                  <span className="text-[10px] font-bold text-[#FACC15]">
                    45%
                  </span>
                </div>
              </div>
            </div>

            <Link
              to="/app/classes"
              className="mt-4 w-full flex items-center justify-center py-3 rounded-xl bg-white text-[#0B1F3A] text-sm font-bold"
            >
              Continue Learning
            </Link>
          </div>
        </section>

        {/* Upcoming Classes */}
        <section className="mt-8">
          <SectionHeading title="Upcoming Classes" to="/app/timetable" />

          <div className="bg-white rounded-3xl p-4 border border-[#0B1F3A]/15 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#0B1F3A]/10 grid place-items-center flex-shrink-0">
                <Clock className="w-6 h-6 text-[#0B1F3A]" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold text-[#0B1F3A] uppercase">
                  Today
                </div>
                <h3 className="font-bold text-[#0B1F3A] truncate mt-0.5">
                  Next Coaching Class
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Check your timetable for class details
                </p>
              </div>

              <Link
                to="/app/timetable"
                className="px-3 py-2 rounded-xl bg-[#0B1F3A] text-white text-xs font-bold"
              >
                Schedule
              </Link>
            </div>
          </div>
        </section>

        {/* Recent Tests */}
        <section className="mt-8">
          <SectionHeading title="Recent Tests" to="/app/exams" />

          <div className="bg-white rounded-3xl p-4 border border-[#0B1F3A]/15 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#0B1F3A]/10 grid place-items-center flex-shrink-0">
                <Award className="w-6 h-6 text-[#0B1F3A]" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[#0B1F3A] truncate">
                  Practice Tests
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Check your latest tests and results
                </p>
              </div>

              <Link
                to="/app/exams"
                className="px-3 py-2 rounded-xl bg-[#0B1F3A] text-white text-xs font-bold"
              >
                Tests
              </Link>
            </div>
          </div>
        </section>

        {/* Study Material */}
        <section className="mt-8">
          <SectionHeading title="Study Material" to="/app/classes" />

          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/app/classes"
              className="bg-white rounded-3xl p-4 border border-[#0B1F3A]/15 shadow-sm"
            >
              <div className="w-11 h-11 rounded-2xl bg-[#FACC15]/20 grid place-items-center">
                <BookOpen className="w-6 h-6 text-[#0B1F3A]" />
              </div>
              <h3 className="font-bold text-sm mt-3 text-[#0B1F3A]">
                Class Notes
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Notes & study resources
              </p>
            </Link>

            <Link
              to="/app/classes"
              className="bg-white rounded-3xl p-4 border border-[#0B1F3A]/15 shadow-sm"
            >
              <div className="w-11 h-11 rounded-2xl bg-[#0B1F3A]/10 grid place-items-center">
                <Download className="w-6 h-6 text-[#0B1F3A]" />
              </div>
              <h3 className="font-bold text-sm mt-3 text-[#0B1F3A]">
                Downloads
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                PDFs & learning files
              </p>
            </Link>
          </div>
        </section>

        {/* Notices */}
        <section className="mt-8">
          <SectionHeading title="Notices & Announcements" to="/app/notices" />

          <div className="bg-white rounded-3xl p-4 border border-[#0B1F3A]/15 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#FACC15]/20 grid place-items-center flex-shrink-0">
                <Megaphone className="w-6 h-6 text-[#0B1F3A]" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-[#0B1F3A]">
                  Latest Coaching Updates
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Check notices, announcements and important updates.
                </p>

                <Link
                  to="/app/notices"
                  className="inline-block mt-3 text-xs font-bold text-[#0B1F3A]"
                >
                  Open Notices →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Performance */}
        <section className="mt-8">
          <SectionHeading title="My Performance" to="/app/exams" />

          <div className="grid grid-cols-3 gap-3">
            {[
              ['--', 'Tests'],
              ['--', 'Avg. Score'],
              ['--', 'Rank']
            ].map(([value, label]) => (
              <div
                key={label}
                className="bg-white rounded-2xl p-4 border border-[#0B1F3A]/15 shadow-sm text-center"
              >
                <div className="text-xl font-extrabold text-[#0B1F3A]">
                  {value}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Student Services */}
        <section className="mt-8">
          <h2 className="text-xl font-extrabold text-[#0B1F3A] mb-4">
            Student Services
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {services.map(item => {
              const Icon = item.icon

              return (
                <Link
                  key={item.title}
                  to={item.to}
                  className="bg-white rounded-3xl p-4 border border-[#0B1F3A]/15 shadow-sm"
                >
                  <div className="w-11 h-11 rounded-2xl bg-[#0B1F3A] text-white grid place-items-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-sm mt-3 text-[#0B1F3A]">
                    {item.title}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {item.text}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Free Notes / Tests */}
        <section className="mt-8 grid sm:grid-cols-2 gap-3">
          <Link
            to="/app/assignments"
            className="rounded-3xl bg-white border border-[#0B1F3A]/15 p-5 flex items-center gap-4 shadow-sm"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#0B1F3A] text-white grid place-items-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="font-extrabold text-[#0B1F3A]">Free Notes</div>
              <div className="text-xs text-slate-500 mt-1">
                Download study material
              </div>
            </div>
            <ChevronRight className="w-4 h-4 ml-auto text-slate-400" />
          </Link>

          <Link
            to="/app/exams"
            className="rounded-3xl bg-white border border-[#0B1F3A]/15 p-5 flex items-center gap-4 shadow-sm"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#FACC15] text-white grid place-items-center">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="font-extrabold text-[#0B1F3A]">Free Tests</div>
              <div className="text-xs text-slate-500 mt-1">
                Practice & improve
              </div>
            </div>
            <ChevronRight className="w-4 h-4 ml-auto text-slate-400" />
          </Link>
        </section>

      </main>
    </div>
  )
}

function SectionHeading({ title, to }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-extrabold text-[#0B1F3A]">{title}</h2>
      <Link
        to={to}
        className="text-xs font-bold text-[#0B1F3A] flex items-center gap-1"
      >
        View all <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  )
}

function Stat({ icon: Icon, label, value, color }) {
  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl grid place-items-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
        <div className="text-2xl font-bold text-slate-800 mt-0.5">{value}</div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(r => setStats(r.data))
      .catch(() => setStats({}))
  }, [])

  if (!stats) {
    return <div className="flex items-center justify-center p-12 text-slate-400">Loading...</div>
  }

  if (user.role === 'student') {
    return <StudentHome user={user} />
  }

  if (user.role === 'admin' || user.role === 'staff') {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat icon={GraduationCap} label="Students" value={stats.total_students} color="bg-brand-100 text-brand-700" />
          <Stat icon={BookOpen} label="Teachers" value={stats.total_teachers} color="bg-[#0B1F3A]/10 text-[#0B1F3A]" />
          <Stat icon={CalendarDays} label="Classes" value={stats.total_classes} color="bg-[#FACC15]/20 text-[#0B1F3A]" />
          <Stat icon={ClipboardCheck} label="Today Attendance" value={stats.today_attendance} color="bg-violet-100 text-violet-700" />
          <Stat icon={Wallet} label="Pending Fees" value={`${stats.pending_fees_count} (₹${stats.pending_fees_total})`} color="bg-rose-100 text-rose-700" />
          <Stat icon={Megaphone} label="Notices" value={stats.total_notices} color="bg-sky-100 text-sky-700" />
          <Stat icon={FileText} label="Assignments" value={stats.total_assignments} color="bg-teal-100 text-teal-700" />
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Stat icon={ClipboardCheck} label="Attendance %" value={`${stats.attendance_percentage || 0}%`} color="bg-[#0B1F3A]/10 text-[#0B1F3A]" />
      <Stat icon={IndianRupee} label="Fees Due" value={`₹${stats.fees_due || 0}`} color="bg-rose-100 text-rose-700" />
      <Stat icon={IndianRupee} label="Fees Paid" value={`₹${stats.fees_paid || 0}`} color="bg-brand-100 text-brand-700" />
      <Stat icon={FileText} label="Assignments" value={stats.total_assignments || 0} color="bg-[#FACC15]/20 text-[#0B1F3A]" />
    </div>
  )
}
