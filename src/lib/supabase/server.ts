import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Decode JWT payload without network call
function decodeJWT(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'))
  } catch { return null }
}

// Get the current user from the httpOnly cookie (no network call)
export function getSessionUser() {
  const cookieStore = cookies()
  const token = cookieStore.get('sb-access-token')?.value
  if (!token) return null
  const payload = decodeJWT(token)
  if (!payload) return null
  // Check expiry
  if (payload.exp && typeof payload.exp === 'number' && Date.now() / 1000 > payload.exp) return null
  return { id: payload.sub as string, email: payload.email as string }
}

// Create a Supabase client authenticated with the user's token (for RLS)
export function createClient() {
  const cookieStore = cookies()
  const token = cookieStore.get('sb-access-token')?.value

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  )
}

// Admin client with service role (bypasses RLS) — used in API routes
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}
