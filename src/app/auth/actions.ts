'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// ─── Login (called by the login form action) ─────────────────────────────────
export async function login(
  prevState: { error: string } | null,
  formData: FormData
) {
  const email    = (formData.get('email')    as string)?.trim()
  const password = (formData.get('password') as string)

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  // 1. Sign in on the server using the anon key
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.session) {
    return { error: error?.message ?? 'Sign-in failed. Please try again.' }
  }

  // 2. Check profile status using the service-role client (bypasses RLS)
  const admin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )

  const { data: profile } = await admin
    .from('profiles')
    .select('status')
    .eq('id', data.session.user.id)
    .single()

  if (profile?.status === 'pending') {
    return { error: 'Your account is pending approval. Please wait for an admin to activate it.' }
  }
  if (profile?.status === 'inactive') {
    return { error: 'Your account has been deactivated. Please contact your administrator.' }
  }

  // 3. Write httpOnly cookies — same request context as the redirect below
  const cookieStore = cookies()

  cookieStore.set('sb-access-token', data.session.access_token, {
    path:     '/',
    maxAge:   data.session.expires_in ?? 3600,
    sameSite: 'lax',
    secure:   true,
    httpOnly: true,
  })

  cookieStore.set('sb-refresh-token', data.session.refresh_token, {
    path:     '/',
    maxAge:   60 * 60 * 24 * 7,
    sameSite: 'lax',
    secure:   true,
    httpOnly: true,
  })

  // 4. Redirect — happens in the same server response as the Set-Cookie headers
  redirect('/dashboard')
}

// ─── Sign out ─────────────────────────────────────────────────────────────────
export async function clearSession() {
  const store = cookies()
  store.delete('sb-access-token')
  store.delete('sb-refresh-token')
  redirect('/auth/login')
}
