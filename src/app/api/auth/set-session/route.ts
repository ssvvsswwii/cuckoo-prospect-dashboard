import { NextRequest, NextResponse } from 'next/server'

// POST — set session cookies directly on the response object
export async function POST(request: NextRequest) {
  const { access_token, refresh_token, expires_in } = await request.json()

  if (!access_token) {
    return NextResponse.json({ error: 'No token' }, { status: 400 })
  }

  const res = NextResponse.json({ success: true })
  const secure = true // always secure on Vercel

  res.cookies.set('sb-access-token', access_token, {
    path:     '/',
    maxAge:   expires_in ?? 3600,
    sameSite: 'lax',
    secure,
    httpOnly: true,
  })

  if (refresh_token) {
    res.cookies.set('sb-refresh-token', refresh_token, {
      path:     '/',
      maxAge:   60 * 60 * 24 * 7,
      sameSite: 'lax',
      secure,
      httpOnly: true,
    })
  }

  return res
}

// DELETE — clear session cookies
export async function DELETE() {
  const res = NextResponse.json({ success: true })
  res.cookies.set('sb-access-token',  '', { path: '/', maxAge: 0 })
  res.cookies.set('sb-refresh-token', '', { path: '/', maxAge: 0 })
  return res
}
