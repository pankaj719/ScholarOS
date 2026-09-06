import { useEffect, useState } from 'react'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import {
  Plus,
  Trash2,
  Loader2,
  School,
  BookOpen,
  GraduationCap,
  ChevronRight,
  UserRound,
  CalendarDays
} from 'lucide-react'


function StudentCourses() {
  const [courses, setCourses] = useState(null)

  useEffect(() => {
    api.get('/classes/my-courses')
      .then(({ data }) => setCourses(data))
      .catch(() => setCourses([]))
  }, [])

  if (courses === null) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#0B1F3A]" />
      </div>
    )
  }

  if (!courses.length) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1F3A]">My Courses</h1>
          <p className="text-sm text-slate-500 mt-1">
            Your enrolled coaching courses
          </p>
        </div>

        <div className="card p-10 text-center">
          <GraduationCap className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h2 className="font-semibold text-[#0B1F3A]">
            No course assigned yet
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Your coaching course will appear here once you are enrolled.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1F3A]">My Courses</h1>
        <p className="text-sm text-slate-500 mt-1">
          Continue your learning journey
        </p>
      </div>

      {courses.map(course => (
        <div key={course.id} className="space-y-4">

          <div className="rounded-2xl overflow-hidden shadow-sm bg-gradient-to-br from-[#0B1F3A] to-[#071426] text-white">
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/15 grid place-items-center shrink-0">
                  <GraduationCap className="w-8 h-8" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs text-white/75 uppercase tracking-wide">
                    My Course
                  </p>
                  <h2 className="text-xl font-bold mt-1">
                    {course.name}
                  </h2>
                  <p className="text-sm text-white/80 mt-1">
                    Academic Year {course.academic_year}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-5">
                <div className="rounded-xl bg-white/10 p-3">
                  <div className="flex items-center gap-2 text-white/70 text-xs">
                    <UserRound className="w-4 h-4" />
                    Section
                  </div>
                  <div className="font-semibold mt-1">
                    {course.section_name || 'Not assigned'}
                  </div>
                </div>

                <div className="rounded-xl bg-white/10 p-3">
                  <div className="flex items-center gap-2 text-white/70 text-xs">
                    <BookOpen className="w-4 h-4" />
                    Subjects
                  </div>
                  <div className="font-semibold mt-1">
                    {(course.subjects || []).length}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-[#0B1F3A]">Your Subjects</h3>
              <span className="text-xs text-slate-500">
                {(course.subjects || []).length} subjects
              </span>
            </div>

            <div className="space-y-3">
              {(course.subjects || []).map((subject, index) => (
                <div
                  key={subject.id}
                  className="card p-4 flex items-center gap-3 active:scale-[0.99] transition"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#FACC15]/20 text-[#0B1F3A] grid place-items-center font-bold">
                    {index + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[#0B1F3A]">
                      {subject.name}
                    </div>
                    {subject.code && (
                      <div className="text-xs text-slate-500 mt-0.5">
                        {subject.code}
                      </div>
                    )}
                  </div>

                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
              ))}

              {!(course.subjects || []).length && (
                <div className="card p-6 text-center text-sm text-slate-500">
                  No subjects assigned to this course yet.
                </div>
              )}
            </div>
          </div>

          <div className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B1F3A]/10 text-[#0B1F3A] grid place-items-center">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-[#0B1F3A]">
                Academic Session
              </div>
              <div className="text-sm text-slate-500">
                {course.academic_year}
              </div>
            </div>
          </div>

        </div>
      ))}
    </div>
  )
}

export default function Classes() {
  const { user } = useAuth()

  if (user.role === 'student') {
    return <StudentCourses />
  }

  const toast = useToast()
  const isAdmin = user.role === 'admin'
  const [rows, setRows] = useState(null)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: '', academic_year: new Date().getFullYear()+'-'+(new Date().getFullYear()+1) })
  const [selected, setSelected] = useState(null)
  const [subjects, setSubjects] = useState([])
  const [secName, setSecName] = useState('')
  const [subName, setSubName] = useState('')

  async function load() { const { data } = await api.get('/classes'); setRows(data) }
  useEffect(() => { load() }, [])
  useEffect(() => { if (selected) api.get(`/classes/${selected.id}/subjects`).then(r=>setSubjects(r.data)) }, [selected])

  async function add(e) {
    e.preventDefault()
    try { await api.post('/classes', form); toast.success('Class added'); setForm({name:'',academic_year:form.academic_year}); setAdding(false); load() }
    catch(e){ toast.error(e.response?.data?.error||'Failed') }
  }
  async function delClass(id) { if(!confirm('Delete class?')) return; await api.delete(`/classes/${id}`); load(); setSelected(null) }
  async function addSection() { if (!secName) return; await api.post(`/classes/${selected.id}/sections`, { name: secName }); setSecName(''); load(); }
  async function delSection(id) { await api.delete(`/classes/sections/${id}`); load() }
  async function addSubject() { if (!subName) return; await api.post(`/classes/${selected.id}/subjects`, { name: subName }); setSubName(''); api.get(`/classes/${selected.id}/subjects`).then(r=>setSubjects(r.data)) }
  async function delSubject(id) { await api.delete(`/classes/subjects/${id}`); api.get(`/classes/${selected.id}/subjects`).then(r=>setSubjects(r.data)) }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-[#0B1F3A]">Classes & Sections</h2>
        {isAdmin && <button className="ml-auto btn-primary" onClick={()=>setAdding(!adding)} data-testid="class-add"><Plus className="w-4 h-4"/>New class</button>}
      </div>
      {adding && (
        <form onSubmit={add} className="card p-5 grid sm:grid-cols-3 gap-3 items-end">
          <div><label className="label">Name *</label><input required className="input" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})}/></div>
          <div><label className="label">Academic year *</label><input required className="input" value={form.academic_year} onChange={(e)=>setForm({...form,academic_year:e.target.value})}/></div>
          <button className="btn-primary">Create</button>
        </form>
      )}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1 card p-3">
          {!rows ? <div className="p-12 grid place-items-center text-slate-400"><Loader2 className="w-5 h-5 animate-spin"/></div>
          : rows.length === 0 ? <div className="p-8 text-center text-slate-400"><School className="w-10 h-10 mx-auto mb-2 opacity-40"/>No classes yet</div>
          : <div className="space-y-1">{rows.map(c => (
            <button key={c.id} onClick={()=>setSelected(c)} className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center ${selected?.id===c.id?'bg-[#FACC15]/20 text-[#0B1F3A]':'hover:bg-[#FACC15]/15'}`}>
              <div className="flex-1"><div className="font-medium">{c.name}</div><div className="text-xs text-slate-500">{c.academic_year} • {c.student_count} students</div></div>
              {isAdmin && <span onClick={(e)=>{e.stopPropagation();delClass(c.id)}} className="text-slate-400 hover:text-[#0B1F3A]"><Trash2 className="w-4 h-4"/></span>}
            </button>
          ))}</div>}
        </div>
        <div className="lg:col-span-2">
          {!selected ? <div className="card p-12 text-center text-slate-400"><BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40"/>Select a class to view sections and subjects</div>
          : <div className="space-y-5">
            <div className="card p-5">
              <div className="flex items-center"><div className="font-semibold text-[#0B1F3A]">Sections — {selected.name}</div>
                {isAdmin && <div className="ml-auto flex gap-2"><input className="input w-32" placeholder="Section name" value={secName} onChange={(e)=>setSecName(e.target.value)}/><button className="btn-primary text-sm" onClick={addSection}>Add</button></div>}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {(selected.sections||[]).filter(s=>s.id).map(s => (
                  <span key={s.id} className="badge bg-[#FACC15]/20 text-[#0B1F3A]">{s.name} {isAdmin && <button onClick={()=>delSection(s.id)} className="ml-1 hover:text-[#0B1F3A]">×</button>}</span>
                ))}
                {!(selected.sections||[]).filter(s=>s.id).length && <span className="text-xs text-slate-400">No sections</span>}
              </div>
            </div>
            <div className="card p-5">
              <div className="flex items-center"><div className="font-semibold text-[#0B1F3A]">Subjects</div>
                {isAdmin && <div className="ml-auto flex gap-2"><input className="input w-40" placeholder="Subject name" value={subName} onChange={(e)=>setSubName(e.target.value)}/><button className="btn-primary text-sm" onClick={addSubject}>Add</button></div>}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {subjects.map(s => <span key={s.id} className="badge bg-[#FACC15]/20 text-[#0B1F3A]">{s.name} {isAdmin && <button onClick={()=>delSubject(s.id)} className="ml-1 hover:text-[#0B1F3A]">×</button>}</span>)}
                {!subjects.length && <span className="text-xs text-slate-400">No subjects</span>}
              </div>
            </div>
          </div>}
        </div>
      </div>
    </div>
  )
}
