import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const allCookies = request.cookies.getAll()
  const authCookies = allCookies.filter(c => c.name.includes('sb-') || c.name.includes('supabase'))

  return NextResponse.json({
    totalCookies: allCookies.length,
    authCookies: authCookies.map(c => ({ name: c.name, valueLength: c.value.length })),
    allCookieNames: allCookies.map(c => c.name),
  })
}
