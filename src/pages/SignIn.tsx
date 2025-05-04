import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function SignIn() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [pwd, setPwd] = useState('')
  const [err, setErr] = useState('')

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(email, pwd)
      nav('/')
    } catch (error: any) {
      setErr(error.message)
    }
  }

  return (
    <main className="h-screen flex items-center justify-center bg-slate-50">
      <form onSubmit={handle} className="w-80 p-8 bg-white rounded-xl shadow">
        <h1 className="text-2xl font-semibold mb-6 text-center">HabitVault</h1>
        <input
          type="email"
          placeholder="Email"
          className="input"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="input"
          value={pwd}
          onChange={e => setPwd(e.target.value)}
          required
        />
        {err && <p className="text-red-500 text-sm">{err}</p>}
        <button className="btn-primary w-full mt-4">Log in</button>
        <p className="text-xs text-center mt-4">
          No account? <Link to="/register" className="text-blue-600">Register</Link>
        </p>
      </form>
    </main>
  )
}
