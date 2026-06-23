import { useEffect, useState } from 'react'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import { Plus, Search, Pencil, Trash2, X, Loader2, GraduationCap } from 'lucide-react'

export default function Students() {
  const { user } = useAuth()
  const toast = useToast()
  const canEdit = ['admin', 'staff'].includes(user.role)
  const canDelete = user.role === 'admin'
  const [rows, setRows] = useState(null)
  const [classes, setClasses] = useState([])
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('')
  const [modal, setModal] = useState(null)

  async function load() {
    const q = new URLSearchParams()
    if (search) q.set('search', search)
    if (classFilter) q.set('class_id', classFilter)
    const { data } = await api.get(`/students?${q}`)
    setRows(data)
  }
  useEffect(() => { load(); api.get('/classes').then(r=>setClasses(r.data)) }, [])
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t) }, [search, classFilter])

  async function save(form) {
    try {
      if (modal.id) await api.put(`/students/${modal.id}`, form)
      else await api.post('/students', form)
      toast.success('Saved'); setModal(null); load()
    } catch (e) { toast.error(e.response?.data?.error || 'Save failed') }
  }
  async function del(id) {
    if (!confirm('Delete this student?')) return
    try { await api.delete(`/students/${id}`); toast.success('Deleted'); load() }
    catch (e) { toast.error(e.response?.data?.error || 'Delete failed') }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center flex-wrap gap-3">
        <h2 className="text-xl font-bold text-slate-800">Students</h2>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute top-2.5 left-3 text-slate-400"/>
            <input className="input pl-9 w-64" placeholder="Search name, roll, email" value={search} onChange={(e)=>setSearch(e.target.value)} data-testid="students-search"/>
          </div>
          <select className="input w-40" value={classFilter} onChange={(e)=>setClassFilter(e.target.value)} data-testid="students-class-filter">
            <option value="">All classes</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {canEdit && <button className="btn-primary" onClick={()=>setModal({})} data-testid="students-add"><Plus className="w-4 h-4"/>Add student</button>}
        </div>
      </div>
      <div className="card overflow-hidden">
        {!rows ? <div className="p-12 grid place-items-center text-slate-400"><Loader2 className="w-5 h-5 animate-spin"/></div>
        : rows.length === 0 ? <div className="p-12 text-center text-slate-400"><GraduationCap className="w-10 h-10 mx-auto mb-2 opacity-40"/>No students found</div>
        : <div className="overflow-x-auto"><table className="table w-full">
          <thead><tr className="border-b border-slate-100"><th>Roll</th><th>Name</th><th>Email</th><th>Class</th><th>Guardian</th><th>Phone</th><th></th></tr></thead>
          <tbody>{rows.map(r => (
            <tr key={r.id} className="hover:bg-slate-50" data-testid={`student-row-${r.id}`}>
              <td className="font-mono text-xs">{r.roll_number}</td>
              <td className="font-medium">{r.full_name}</td>
              <td className="text-slate-500">{r.email}</td>
              <td>{r.class_name || '-'}{r.section_name?` / ${r.section_name}`:''}</td>
              <td>{r.guardian_name || '-'}</td>
              <td>{r.phone || r.guardian_phone || '-'}</td>
              <td className="text-right">
                {canEdit && <button className="text-slate-400 hover:text-brand-600 mr-2" onClick={()=>setModal(r)}><Pencil className="w-4 h-4"/></button>}
                {canDelete && <button className="text-slate-400 hover:text-red-600" onClick={()=>del(r.id)} data-testid={`student-del-${r.id}`}><Trash2 className="w-4 h-4"/></button>}
              </td>
            </tr>
          ))}</tbody>
        </table></div>}
      </div>
      {modal && <StudentModal classes={classes} initial={modal} onClose={()=>setModal(null)} onSave={save}/>}
    </div>
  )
}

function StudentModal({ classes, initial, onClose, onSave }) {
  const isEdit = !!initial.id
  const [f, setF] = useState({
    email: initial.email||'', password: '', full_name: initial.full_name||'', phone: initial.phone||'',
    roll_number: initial.roll_number||'', class_id: initial.class_id||'', section_id: initial.section_id||'',
    dob: initial.dob? initial.dob.slice(0,10):'', gender: initial.gender||'', address: initial.address||'',
    guardian_name: initial.guardian_name||'', guardian_phone: initial.guardian_phone||'', guardian_email: initial.guardian_email||'',
    blood_group: initial.blood_group||''
  })
  const sections = classes.find(c=>c.id===parseInt(f.class_id))?.sections || []
  const upd = (k)=>(e)=>setF({...f,[k]:e.target.value})
  function submit(e) {
    e.preventDefault()
    const data = {...f}
    if (isEdit) { delete data.email; delete data.password; delete data.roll_number; }
    if (!data.class_id) delete data.class_id
    if (!data.section_id) delete data.section_id
    onSave(data)
  }
  return (
    <div className="fixed inset-0 bg-slate-900/40 z-50 grid place-items-center p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={(e)=>e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-2xl shadow-xl" data-testid="student-modal">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center">
          <h3 className="font-semibold">{isEdit?'Edit student':'Add new student'}</h3>
          <button type="button" onClick={onClose} className="ml-auto text-slate-400 hover:text-slate-700"><X className="w-4 h-4"/></button>
        </div>
        <div className="p-6 grid sm:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
          <div><label className="label">Full name *</label><input required className="input" value={f.full_name} onChange={upd('full_name')}/></div>
          <div><label className="label">Email *</label><input type="email" required disabled={isEdit} className="input" value={f.email} onChange={upd('email')}/></div>
          {!isEdit && <div><label className="label">Password *</label><input type="password" required minLength={6} className="input" value={f.password} onChange={upd('password')}/></div>}
          {!isEdit && <div><label className="label">Roll number</label><input className="input" value={f.roll_number} onChange={upd('roll_number')}/></div>}
          <div><label className="label">Phone</label><input className="input" value={f.phone} onChange={upd('phone')}/></div>
          <div><label className="label">Class</label><select className="input" value={f.class_id} onChange={upd('class_id')}>
            <option value="">-</option>{classes.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
          </select></div>
          <div><label className="label">Section</label><select className="input" value={f.section_id} onChange={upd('section_id')}>
            <option value="">-</option>{sections.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
          </select></div>
          <div><label className="label">DOB</label><input type="date" className="input" value={f.dob} onChange={upd('dob')}/></div>
          <div><label className="label">Gender</label><select className="input" value={f.gender} onChange={upd('gender')}><option value="">-</option><option>male</option><option>female</option><option>other</option></select></div>
          <div><label className="label">Blood group</label><input className="input" value={f.blood_group} onChange={upd('blood_group')}/></div>
          <div className="sm:col-span-2"><label className="label">Address</label><input className="input" value={f.address} onChange={upd('address')}/></div>
          <div><label className="label">Guardian name</label><input className="input" value={f.guardian_name} onChange={upd('guardian_name')}/></div>
          <div><label className="label">Guardian phone</label><input className="input" value={f.guardian_phone} onChange={upd('guardian_phone')}/></div>
          <div className="sm:col-span-2"><label className="label">Guardian email</label><input type="email" className="input" value={f.guardian_email} onChange={upd('guardian_email')}/></div>
        </div>
        <div className="px-6 py-3 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
          <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn-primary" data-testid="student-save">{isEdit?'Save changes':'Create student'}</button>
        </div>
      </form>
    </div>
  )
}
