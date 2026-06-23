import { useEffect, useMemo, useState } from 'react'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import { Loader2, ClipboardCheck, Save } from 'lucide-react'

export default function Attendance() {
  const { user } = useAuth()
  const toast = useToast()
  const canMark = ['admin','teacher','staff'].includes(user.role)
  const [classes, setClasses] = useState([])
  const [classId, setClassId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0,10))
  const [students, setStudents] = useState([])
  const [marks, setMarks] = useState({})
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (canMark) api.get('/classes').then(r=>setClasses(r.data)) }, [])

  async function loadStudents() {
    if (!classId) return
    setLoading(true)
    const { data: studs } = await api.get(`/students?class_id=${classId}`)
    setStudents(studs)
    const { data: att } = await api.get(`/attendance?class_id=${classId}&date=${date}`)
    const m = {}
    att.forEach(a => { m[a.student_id] = { status: a.status, remarks: a.remarks||'' } })
    studs.forEach(s => { if (!m[s.id]) m[s.id] = { status: 'present', remarks: '' } })
    setMarks(m); setLoading(false)
  }
  useEffect(() => { if (canMark && classId) loadStudents() }, [classId, date])
  useEffect(() => { if (user.role === 'student') api.get('/attendance').then(r => setRecords(r.data)) }, [])

  async function submit() {
    const recs = students.map(s => ({ student_id: s.id, status: marks[s.id]?.status||'present', remarks: marks[s.id]?.remarks||'' }))
    try { await api.post('/attendance/mark', { date, class_id: parseInt(classId), records: recs }); toast.success('Attendance saved') }
    catch (e) { toast.error('Failed') }
  }
  const stats = useMemo(() => {
    const total = records.length
    const present = records.filter(r=>r.status==='present').length
    return { total, present, percent: total? Math.round(present*100/total):0 }
  }, [records])

  if (!canMark) return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-slate-800">My attendance</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-5"><div className="text-xs uppercase text-slate-500">Total days</div><div className="text-2xl font-bold mt-1">{stats.total}</div></div>
        <div className="card p-5"><div className="text-xs uppercase text-slate-500">Present</div><div className="text-2xl font-bold mt-1 text-emerald-600">{stats.present}</div></div>
        <div className="card p-5"><div className="text-xs uppercase text-slate-500">Percentage</div><div className="text-2xl font-bold mt-1 text-brand-600">{stats.percent}%</div></div>
      </div>
      <div className="card overflow-hidden">
        {records.length===0 ? <div className="p-12 text-center text-slate-400"><ClipboardCheck className="w-10 h-10 mx-auto mb-2 opacity-40"/>No attendance recorded yet</div>
        : <table className="table w-full"><thead><tr className="border-b border-slate-100"><th>Date</th><th>Status</th><th>Remarks</th></tr></thead>
        <tbody>{records.map(r => (<tr key={r.id}><td>{new Date(r.date).toLocaleDateString()}</td><td><span className={`badge ${r.status==='present'?'bg-emerald-50 text-emerald-700':r.status==='absent'?'bg-red-50 text-red-700':r.status==='late'?'bg-amber-50 text-amber-700':'bg-slate-100 text-slate-700'}`}>{r.status}</span></td><td className="text-slate-500">{r.remarks||'-'}</td></tr>))}</tbody></table>}
      </div>
    </div>
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center flex-wrap gap-3">
        <h2 className="text-xl font-bold text-slate-800">Mark attendance</h2>
        <div className="ml-auto flex items-center gap-2">
          <select className="input w-40" value={classId} onChange={(e)=>setClassId(e.target.value)} data-testid="att-class">
            <option value="">Select class</option>{classes.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input type="date" className="input w-40" value={date} onChange={(e)=>setDate(e.target.value)} data-testid="att-date"/>
          <button className="btn-primary" onClick={submit} disabled={!classId||loading} data-testid="att-save"><Save className="w-4 h-4"/>Save</button>
        </div>
      </div>
      <div className="card overflow-hidden">
        {loading ? <div className="p-12 grid place-items-center text-slate-400"><Loader2 className="w-5 h-5 animate-spin"/></div>
        : !classId ? <div className="p-12 text-center text-slate-400">Select a class above to start marking attendance</div>
        : students.length === 0 ? <div className="p-12 text-center text-slate-400">No students in this class</div>
        : <table className="table w-full"><thead><tr className="border-b border-slate-100"><th>Roll</th><th>Name</th><th>Status</th><th>Remarks</th></tr></thead>
          <tbody>{students.map(s => (
            <tr key={s.id} className="hover:bg-slate-50">
              <td className="font-mono text-xs">{s.roll_number}</td>
              <td className="font-medium">{s.full_name}</td>
              <td>
                <div className="flex gap-1">
                  {['present','absent','late','leave'].map(st => (
                    <button key={st} onClick={()=>setMarks({...marks, [s.id]:{...marks[s.id], status: st}})} className={`px-3 py-1 rounded text-xs font-medium ${marks[s.id]?.status===st?(st==='present'?'bg-emerald-600 text-white':st==='absent'?'bg-red-600 text-white':st==='late'?'bg-amber-600 text-white':'bg-slate-600 text-white'):'bg-slate-100 text-slate-600'}`}>{st}</button>
                  ))}
                </div>
              </td>
              <td><input className="input" placeholder="Optional" value={marks[s.id]?.remarks||''} onChange={(e)=>setMarks({...marks, [s.id]:{...marks[s.id], remarks: e.target.value}})}/></td>
            </tr>
          ))}</tbody></table>}
      </div>
    </div>
  )
}
