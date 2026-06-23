import { useEffect, useState } from 'react'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import { Plus, Loader2, Megaphone, Trash2 } from 'lucide-react'

export default function Notices() {
  const { user } = useAuth()
  const toast = useToast()
  const canPost = ['admin','teacher','staff'].includes(user.role)
  const [rows, setRows] = useState(null)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ title:'', description:'', priority:'normal', target_role:'all' })

  async function load() { const { data } = await api.get('/notices'); setRows(data) }
  useEffect(() => { load() }, [])

  async function add(e) {
    e.preventDefault()
    try { await api.post('/notices', form); toast.success('Notice posted'); setAdding(false); setForm({title:'',description:'',priority:'normal',target_role:'all'}); load() }
    catch(e){ toast.error('Failed') }
  }
  async function del(id) { if(!confirm('Delete?')) return; await api.delete(`/notices/${id}`); load() }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-slate-800">Notices</h2>
        {canPost && <button className="ml-auto btn-primary" onClick={()=>setAdding(!adding)}><Plus className="w-4 h-4"/>New notice</button>}
      </div>
      {adding && (
        <form onSubmit={add} className="card p-5 space-y-3">
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2"><label className="label">Title</label><input required className="input" value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})}/></div>
            <div><label className="label">Priority</label><select className="input" value={form.priority} onChange={(e)=>setForm({...form,priority:e.target.value})}><option>normal</option><option>high</option><option>urgent</option></select></div>
          </div>
          <div><label className="label">Description</label><textarea required rows={3} className="input" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})}/></div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className="label">Target role</label><select className="input" value={form.target_role} onChange={(e)=>setForm({...form,target_role:e.target.value})}><option value="all">Everyone</option><option value="student">Students</option><option value="teacher">Teachers</option><option value="staff">Staff</option></select></div>
          </div>
          <div className="flex justify-end gap-2"><button type="button" className="btn-outline" onClick={()=>setAdding(false)}>Cancel</button><button className="btn-primary">Post notice</button></div>
        </form>
      )}
      <div className="space-y-3">
        {!rows ? <div className="card p-12 grid place-items-center text-slate-400"><Loader2 className="w-5 h-5 animate-spin"/></div>
        : rows.length===0 ? <div className="card p-12 text-center text-slate-400"><Megaphone className="w-10 h-10 mx-auto mb-2 opacity-40"/>No notices</div>
        : rows.map(n => (
          <div key={n.id} className="card p-5">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg grid place-items-center ${n.priority==='urgent'?'bg-red-100 text-red-600':n.priority==='high'?'bg-amber-100 text-amber-600':'bg-brand-100 text-brand-700'}`}><Megaphone className="w-5 h-5"/></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="font-semibold text-slate-800">{n.title}</div>
                  <span className={`badge ${n.priority==='urgent'?'bg-red-50 text-red-700':n.priority==='high'?'bg-amber-50 text-amber-700':'bg-slate-100 text-slate-600'}`}>{n.priority}</span>
                  <span className="badge bg-brand-50 text-brand-700">{n.target_role}</span>
                </div>
                <div className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{n.description}</div>
                <div className="text-xs text-slate-400 mt-2">{n.author_name||'System'} • {new Date(n.created_at).toLocaleString()}</div>
              </div>
              {canPost && <button onClick={()=>del(n.id)} className="text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4"/></button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
