import { useEffect, useState } from 'react'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import { Loader2, User, Lock } from 'lucide-react'

export default function Profile() {
  const { user } = useAuth()
  const toast = useToast()
  const [me, setMe] = useState(null)
  const [form, setForm] = useState({ full_name:'', phone:'' })
  const [pw, setPw] = useState({ current_password:'', new_password:'' })
  useEffect(() => { api.get('/auth/me').then(r => { setMe(r.data); setForm({ full_name: r.data.user.full_name, phone: r.data.user.phone||'' }) }) }, [])
  async function save(e) { e.preventDefault(); try { await api.put('/auth/me', form); toast.success('Profile updated') } catch { toast.error('Failed') } }
  async function changePw(e) { e.preventDefault(); try { await api.post('/auth/change-password', pw); toast.success('Password changed'); setPw({current_password:'',new_password:''}) } catch (e) { toast.error(e.response?.data?.error||'Failed') } }
  if (!me) return <div className="grid place-items-center p-12 text-slate-400"><Loader2 className="w-5 h-5 animate-spin"/></div>
  return (
    <div className="space-y-5 max-w-3xl">
      <h2 className="text-xl font-bold text-slate-800">Profile</h2>
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-700 grid place-items-center font-bold text-xl">{user.name?.charAt(0).toUpperCase()}</div>
          <div><div className="font-semibold text-slate-800 text-lg">{me.user.full_name}</div><div className="text-sm text-slate-500">{me.user.email}</div><div className="text-xs text-slate-400 capitalize mt-1">{me.user.role}</div></div>
        </div>
        <form onSubmit={save} className="grid sm:grid-cols-2 gap-4">
          <div><label className="label">Full name</label><input className="input" value={form.full_name} onChange={(e)=>setForm({...form,full_name:e.target.value})}/></div>
          <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})}/></div>
          <div className="sm:col-span-2 flex justify-end"><button className="btn-primary"><User className="w-4 h-4"/>Save profile</button></div>
        </form>
      </div>
      {me.student && (
        <div className="card p-6 space-y-2 text-sm">
          <div className="font-semibold text-slate-800 mb-2">Student details</div>
          <div className="grid sm:grid-cols-2 gap-y-2 text-slate-600">
            <div><span className="text-slate-400">Roll number:</span> {me.student.roll_number}</div>
            <div><span className="text-slate-400">Class:</span> {me.student.class_name||'-'} / {me.student.section_name||'-'}</div>
            <div><span className="text-slate-400">DOB:</span> {me.student.dob? new Date(me.student.dob).toLocaleDateString():'-'}</div>
            <div><span className="text-slate-400">Gender:</span> {me.student.gender||'-'}</div>
            <div className="sm:col-span-2"><span className="text-slate-400">Address:</span> {me.student.address||'-'}</div>
            <div><span className="text-slate-400">Guardian:</span> {me.student.guardian_name||'-'}</div>
            <div><span className="text-slate-400">Guardian phone:</span> {me.student.guardian_phone||'-'}</div>
          </div>
        </div>
      )}
      <form onSubmit={changePw} className="card p-6 grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2 font-semibold text-slate-800">Change password</div>
        <div><label className="label">Current password</label><input type="password" required className="input" value={pw.current_password} onChange={(e)=>setPw({...pw,current_password:e.target.value})}/></div>
        <div><label className="label">New password</label><input type="password" required minLength={6} className="input" value={pw.new_password} onChange={(e)=>setPw({...pw,new_password:e.target.value})}/></div>
        <div className="sm:col-span-2 flex justify-end"><button className="btn-primary"><Lock className="w-4 h-4"/>Update password</button></div>
      </form>
    </div>
  )
}
