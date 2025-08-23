import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out' })
  response.cookies.set({
    name: 'session_token',
    value: '',
    httpOnly: true,
    secure: true,
    path: '/',
    maxAge: 0,
    sameSite: 'lax',
  })
  return response
}