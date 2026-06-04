import { NextResponse } from 'next/server'

// This endpoint is intentionally disabled.
// Session cookies are now set exclusively via the Server Action in
// src/app/auth/actions.ts, which verifies credentials before writing cookies.
export async function POST() {
  return NextResponse.json({ error: 'Not available' }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ error: 'Not available' }, { status: 405 })
}
