'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function setSessionAndRedirect(
  accessToken: string,
  refreshToken: string,
  expiresIn: number
) {
  const store = cookies()

  store.set('sb-access-token', accessToken, {
    path:     '/',
    maxAge:   expiresIn || 3600,
    sameSite: 'lax',
    secure:   true,
    httpOnly: true,
  })

  store.set('sb-refresh-token', refreshToken, {
    path:     '/',
    maxAge:   60 * 60 * 24 * 7,
    sameSite: 'lax',
    secure:   true,
    httpOnly: true,
  })

  redirect('/dashboard')
}

export async function clearSession() {
  const store = cookies()
  store.delete('sb-access-token')
  store.delete('sb-refresh-token')
  redirect('/auth/login')
}
