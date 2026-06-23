import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import { Loader2, Mail, Lock } from 'lucide-react'
export default function Login() {
  const { login } = useAuth()
  const toast = useToast()
  const nav = useNavigate()
  const [email, setEmail] = useState('admin@hmsms.local')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  async function submit(e) {
    e.preventDefault(); setLoading(true)
    try { await login(email, password); toast.success('Welcome back!'); nav('/app') }
    catch (err) { toast.error(err.response?.data?.error || 'Login failed') }
    finally { setLoading(false) }
  }
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-brand-700 text-white p-12 relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-brand-500/30 blur-3xl" />
        <div className="flex items-center gap-2 relative">
          <div className="w-10 h-10 rounded-xl bg-white/10 grid place-items-center font-bold">H</div>
          <div className="font-bold">H_M SMS</div>
        </div>
        <div className="relative">
          <h2 className="text-3xl font-bold leading-tight">Welcome back to your school workspace.</h2>
          <p className="mt-3 text-brand-100/80 max-w-md">Manage students, attendance, fees, and academics — all from one secure dashboard.</p>
        </div>
        <div className="text-xs text-brand-100/70 relative">© H_M SMS — Secure by design</div>
      </div>
      <div className="flex items-center justify-center p-6 lg:p-12">
        <form onSubmit={submit} className="w-full max-w-md card p-8" data-testid="login-form">
          <h1 className="text-2xl font-bold text-slate-800">Sign in</h1>
          <p className="text-sm text-slate-500 mt-1">Welcome back. Please enter your credentials.</p>
          <div className="mt-6 space-y-4">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute top-3 left-3" />
                <input value={email} onChange={(e)=>setEmail(e.target.value)} required className="input pl-9" placeholder="you@school.com" data-testid="login-email" />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute top-3 left-3" />
                <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required className="input pl-9" placeholder="••••••••" data-testid="login-password" />
              </div>
            </div>
            <button disabled={loading} className="btn-primary w-full" data-testid="login-submit">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />} Sign in
            </button>
          </div>
          <div className="text-sm text-slate-500 mt-6 text-center">
            New student? <Link to="/register" className="text-brand-600 font-medium" data-testid="link-register">Create an account</Link>
          </div>
          <div className="mt-6 p-3 rounded-lg bg-slate-50 text-xs text-slate-600">
            <div className="font-semibold text-slate-700 mb-1">Demo accounts</div>
            Admin: <span className="font-mono">admin@hmsms.local / Admin@12345</span><br/>
            Teacher: <span className="font-mono">teacher@hmsms.local / Teacher@123</span><br/>
            Student: <span className="font-mono">alice@hmsms.local / Student@123</span>
          </div>
        </form>
      </div>
    </div>
  )
}
