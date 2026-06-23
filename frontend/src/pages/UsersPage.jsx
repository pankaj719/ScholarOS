import { useEffect, useState } from 'react'
import api from '../lib/api'
import { useToast } from '../components/Toast'
import { Plus, Pencil, Trash2, X, Loader2, Users } from 'lucide-react'

export default function UsersPage() {
  const toast = useToast()
  const [rows, setRows] = useState(null)
  const [role, setRole] = useState('teacher')
  const [modal, setModal] = useState(null)
  async function load() { const { data } = await api.get(`/users?role=${role}`); setRows(data) }
  useEffect(() => { load() }, [role])
  async function save(form) {
    try {
      if (modal.id) await api.put(`/users/${modal.id}`, form)
      else await api.post('/users', { ...form, role })
      toast.success('Saved'); setModal(null); load()
    } catch (e) { toast.error(e.response?.data?.error || 'Save failed') }
  }
  async function del(id) {
    if (!confirm('Delete this user?')) return
    await api.delete(`/users/${id}`); toast.success('Deleted'); load()
  }
  return (
    <div className="space-y-5">
      <div className="flex items-center flex-wrap gap-3">
        <h2 className="text-xl font-bold text-slate-800">Teachers & Staff</h2>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex bg-slate-100 rounded-lg p-1">
            {['teacher','staff','admin'].map(r => (
              <button key={r} onClick={()=>setRole(r)} className={`px-3 py-1.5 text-sm rounded-md ${role===r?'bg-white shadow-sm text-brand-700 font-medium':'text-slate-500'}`} data-testid={`tab-${r}`}>{r}</button>
            ))}
          </div>
          <button className="btn-primary" onClick={()=>setModal({})} data-testid="user-add"><Plus className="w-4 h-4"/>Add {role}</button>
        </div>
      </div>
      <div className="card overflow-hidden">
        {!rows ? <div className="p-12 grid place-items-center text-slate-400"><Loader2 className="w-5 h-5 animate-spin"/></div>
        : rows.length===0 ? <div className="p-12 text-center text-slate-400"><Users className="w-10 h-10 mx-auto mb-2 opacity-40"/>No {role}s yet</div>
        : <div className="overflow-x-auto"><table className="table w-full">
          <thead><tr className="border-b border-slate-100"><th>Name</th><th>Email</th><th>Phone</th><th>Status</th><th></th></tr></thead>
          <tbody>{rows.map(r => (
            <tr key={r.id} className="hover:bg-slate-50">
              <td className="font-medium">{r.full_name}</td>
              <td className="text-slate-500">{r.email}</td>
              <td>{r.phone||'-'}</td>
              <td><span className={`badge ${r.is_active?'bg-emerald-50 text-emerald-700':'bg-slate-100 text-slate-500'}`}>{r.is_active?'Active':'Inactive'}</span></td>
              <td className="text-right">
                <button className="text-slate-400 hover:text-brand-600 mr-2" onClick={()=>setModal(r)}><Pencil className="w-4 h-4"/></button>
                <button className="text-slate-400 hover:text-red-600" onClick={()=>del(r.id)}><Trash2 className="w-4 h-4"/></button>
              </td>
            </tr>
          ))}</tbody>
        </table></div>}
      </div>
      {modal && <UserModal role={role} initial={modal} onClose={()=>setModal(null)} onSave={save}/>}
    </div>
  )
}
function UserModal({ role, initial, onClose, onSave }) {
  const isEdit = !!initial.id
  const [f, setF] = useState({ email: initial.email||'', password:'', full_name: initial.full_name||'', phone: initial.phone||'', is_active: initial.is_active??true })
  const upd = (k)=>(e)=>setF({...f,[k]: k==='is_active'? e.target.checked : e.target.value})
  function submit(e){ e.preventDefault(); const d={...f}; if (isEdit) { delete d.email; if (!d.password) delete d.password } onSave(d) }
  return (
    <div className="fixed inset-0 bg-slate-900/40 z-50 grid place-items-center p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={(e)=>e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center"><h3 className="font-semibold">{isEdit?'Edit user':`Add ${role}`}</h3><button type="button" onClick={onClose} className="ml-auto text-slate-400 hover:text-slate-700"><X className="w-4 h-4"/></button></div>
        <div className="p-6 space-y-4">
          <div><label className="label">Full name *</label><input required className="input" value={f.full_name} onChange={upd('full_name')}/></div>
          <div><label className="label">Email *</label><input type="email" required disabled={isEdit} className="input" value={f.email} onChange={upd('email')}/></div>
          <div><label className="label">{isEdit?'New password (leave blank to keep)':'Password *'}</label><input type="password" minLength={isEdit?0:6} required={!isEdit} className="input" value={f.password} onChange={upd('password')}/></div>
          <div><label className="label">Phone</label><input className="input" value={f.phone} onChange={upd('phone')}/></div>
          {isEdit && <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={f.is_active} onChange={upd('is_active')}/>Active</label>}
        </div>
        <div className="px-6 py-3 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
          <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn-primary">{isEdit?'Save':'Create'}</button>
        </div>
      </form>
    </div>
  )
}
