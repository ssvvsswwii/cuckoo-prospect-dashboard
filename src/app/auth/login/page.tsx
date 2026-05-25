'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError || !data.session) {
      setError(signInError?.message ?? 'Sign in failed')
      setLoading(false)
      return
    }

    const session = data.session

    // Store session server-side via API route (httpOnly cookies)
    const res = await fetch('/api/auth/set-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_token:  session.access_token,
        refresh_token: session.refresh_token,
        expires_in:    session.expires_in,
      }),
    })

    if (!res.ok) {
      setError('Failed to establish session. Please try again.')
      setLoading(false)
      return
    }

    // Check if account is active
    const { data: profile } = await supabase
      .from('profiles')
      .select('status')
      .eq('id', session.user.id)
      .single()

    if (profile?.status === 'pending') {
      await supabase.auth.signOut()
      await fetch('/api/auth/set-session', { method: 'DELETE' })
      setError('Your account is pending approval. Please wait for admin activation.')
      setLoading(false)
      return
    }
    if (profile?.status === 'inactive') {
      await supabase.auth.signOut()
      await fetch('/api/auth/set-session', { method: 'DELETE' })
      setError('Your account has been deactivated. Please contact your admin.')
      setLoading(false)
      return
    }

    // Navigate to dashboard (full reload so middleware sees the new cookie)
    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md overflow-hidden">
        <div className="bg-brand px-8 py-10 text-center text-white">
          <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center text-3xl font-extrabold mx-auto mb-3">C</div>
          <h1 className="text-2xl font-extrabold tracking-widest">CUCKOO</h1>
          <p className="text-sm opacity-80 mt-1">Prospect Dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="px-8 py-8 space-y-5">
          <h2 className="text-lg font-bold text-gray-800">Sign In</h2>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              placeholder="you@example.com" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              placeholder="••••••••" />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-60">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>

          <p className="text-center text-sm text-gray-500">
            No account?{' '}
            <Link href="/auth/register" className="text-brand font-semibold hover:underline">Request Access</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
