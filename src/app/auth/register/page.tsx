'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function RegisterPage() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '', role: 'client_consultant' })
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  function handle(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    if (form.password.length < 6)       { setError('Password must be at least 6 characters'); return }

    setLoading(true)
    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name, role: form.role } },
    })

    if (signUpError) { setError(signUpError.message); setLoading(false); return }

    // Profile is auto-created via DB trigger with status = 'pending'
    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-brand-light flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-brand flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Request Submitted!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Your account is pending approval from the Admin.<br/>
            You will be notified once your account is activated.
          </p>
          <Link href="/auth/login" className="text-brand font-semibold hover:underline text-sm">
            Back to Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md overflow-hidden">
        <div className="bg-brand px-8 py-8 text-center text-white">
          <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center text-2xl font-extrabold mx-auto mb-2">C</div>
          <h1 className="text-xl font-extrabold tracking-widest">CUCKOO</h1>
          <p className="text-sm opacity-80 mt-1">Request Dashboard Access</p>
        </div>

        <form onSubmit={handleRegister} className="px-8 py-8 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Full Name</label>
            <input name="full_name" required value={form.full_name} onChange={handle}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              placeholder="Your full name" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Email</label>
            <input name="email" type="email" required value={form.email} onChange={handle}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Role</label>
            <select name="role" value={form.role} onChange={handle}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20">
              <option value="client_consultant">Client Consultant</option>
              <option value="branch_manager">Branch Manager</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Password</label>
            <input name="password" type="password" required value={form.password} onChange={handle}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              placeholder="Min. 6 characters" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Confirm Password</label>
            <input name="confirm" type="password" required value={form.confirm} onChange={handle}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              placeholder="Repeat password" />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-60">
            {loading ? 'Submitting…' : 'Request Access'}
          </button>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-brand font-semibold hover:underline">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
