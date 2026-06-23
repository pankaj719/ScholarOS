import { useEffect, useState } from 'react'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { GraduationCap, Users, School, ClipboardCheck, Wallet, Megaphone, FileText, Loader2 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
function Stat({ icon: Icon, label, value, color }) {
  return (
    <div className="card p-5 flex items-start gap-4" data-testid={`stat-${label.toLowerCase().replace(/ /g,'-')}`}>
      <div className={`w-12 h-12 rounded-xl grid place-items-center ${color}`}><Icon className="w-5 h-5" /></div>
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
  useEffect(() => { api.get('/dashboard/stats').then(r=>setStats(r.data)).catch(()=>setStats({})) }, [])
  if (!stats) return <div className="flex items-center justify-center p-12 text-slate-400"><Loader2 className="w-5 h-5 animate-spin"/></div>
  if (user.role === 'admin' || user.role === 'staff') return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={GraduationCap} label="Students" value={stats.total_students} color="bg-brand-100 text-brand-700" />
        <Stat icon={Users} label="Teachers" value={stats.total_teachers} color="bg-emerald-100 text-emerald-700" />
        <Stat icon={School} label="Classes" value={stats.total_classes} color="bg-amber-100 text-amber-700" />
        <Stat icon={ClipboardCheck} label="Today Attendance" value={stats.today_attendance} color="bg-violet-100 text-violet-700" />
        <Stat icon={Wallet} label="Pending Fees" value={`${stats.pending_fees_count} (₹${stats.pending_fees_total})`} color="bg-rose-100 text-rose-700" />
        <Stat icon={Megaphone} label="Notices" value={stats.total_notices} color="bg-sky-100 text-sky-700" />
        <Stat icon={FileText} label="Assignments" value={stats.total_assignments} color="bg-teal-100 text-teal-700" />
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <div className="font-semibold text-slate-800 mb-3">Attendance trend (last 7 days)</div>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={(stats.attendance_trend||[]).map(d=>({...d, date: new Date(d.date).toLocaleDateString(undefined,{month:'short',day:'numeric'})}))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12}/>
                <YAxis stroke="#94a3b8" fontSize={12}/>
                <Tooltip /><Legend />
                <Line type="monotone" dataKey="present" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} />
                <Line type="monotone" dataKey="late" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-5">
          <div className="font-semibold text-slate-800 mb-3">Recent notices</div>
          <div className="space-y-3">
            {(stats.recent_notices||[]).map(n => (
              <div key={n.id} className="p-3 rounded-lg bg-slate-50">
                <div className="text-sm font-medium text-slate-800">{n.title}</div>
                <div className="text-xs text-slate-500 mt-1">{new Date(n.created_at).toLocaleString()} • {n.priority}</div>
              </div>
            ))}
            {!stats.recent_notices?.length && <div className="text-xs text-slate-400">No notices yet</div>}
          </div>
        </div>
      </div>
    </div>
  )
  if (user.role === 'teacher') return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Stat icon={School} label="My Classes" value={stats.my_classes||0} color="bg-brand-100 text-brand-700" />
      <Stat icon={GraduationCap} label="My Students" value={stats.my_students||0} color="bg-emerald-100 text-emerald-700" />
      <Stat icon={FileText} label="My Assignments" value={stats.my_assignments||0} color="bg-amber-100 text-amber-700" />
      <Stat icon={Megaphone} label="My Notices" value={stats.my_notices||0} color="bg-violet-100 text-violet-700" />
    </div>
  )
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Stat icon={ClipboardCheck} label="Attendance %" value={`${stats.attendance_percentage||0}%`} color="bg-emerald-100 text-emerald-700" />
      <Stat icon={Wallet} label="Fees Due" value={`₹${stats.fees_due||0}`} color="bg-rose-100 text-rose-700" />
      <Stat icon={Wallet} label="Fees Paid" value={`₹${stats.fees_paid||0}`} color="bg-brand-100 text-brand-700" />
      <Stat icon={FileText} label="Assignments" value={stats.total_assignments||0} color="bg-amber-100 text-amber-700" />
    </div>
  )
}
