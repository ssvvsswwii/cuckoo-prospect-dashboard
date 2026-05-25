'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { login } from '@/app/auth/actions'
import Link from 'next/link'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-60"
    >
      {pending ? 'Signing in…' : 'Sign In'}
    </button>
  )
}

export default function LoginPage() {
  const [state, action] = useFormState(login, null)

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="bg-brand px-8 py-10 text-center text-white">
          <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center text-3xl font-extrabold mx-auto mb-3">C</div>
          <h1 className="text-2xl font-extrabold tracking-widest">CUCKOO</h1>
          <p className="text-sm opacity-80 mt-1">Prospect Dashboard</p>
        </div>

        {/* Form */}
        <form action={action} className="px-8 py-8 space-y-5">
          <h2 className="text-lg font-bold text-gray-800">Sign In</h2>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              placeholder="••••••••"
            />
          </div>

          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {state.error}
            </div>
          )}

          <SubmitButton />

          <p className="text-center text-sm text-gray-500">
            No account?{' '}
            <Link href="/auth/register" className="text-brand font-semibold hover:underline">
              Request Access
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
