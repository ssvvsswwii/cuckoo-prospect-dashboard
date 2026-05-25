import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// POST /api/auth/set-session — called by login page after signInWithPassword
export async function POST(request: NextRequest) {
  const { access_token, refresh_token, expires_in } = await request.json()

  if (!access_token) {
    return NextResponse.json({ error: 'No token provided' }, { status: 400 })
  }

  const cookieStore = cookies()
  const secure = process.env.NODE_ENV === 'production'

  cookieStore.set('sb-access-token', access_token, {
    path: '/',
    maxAge: expires_in ?? 3600,
    sameSite: 'lax',
    secure,
    httpOnly: true,
  })

  if (refresh_token) {
    cookieStore.set('sb-refresh-token', refresh_token, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
      secure,
      httpOnly: true,
    })
  }

  return NextResponse.json({ success: true })
}

// DELETE /api/auth/set-session — called by sign-out
export async function DELETE() {
  const cookieStore = cookies()
  cookieStore.delete('sb-access-token')
  cookieStore.delete('sb-refresh-token')
  return NextResponse.json({ success: true })
}
