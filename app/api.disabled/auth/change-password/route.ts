import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { verifyToken } from '@/lib/auth/jwt'

const MIN_PASSWORD_LENGTH = 8

export async function POST(request: Request) {
  try {
    if (request.headers.get('content-type') !== 'application/json') {
      return NextResponse.json({ error: 'Expected application/json' }, { status: 400 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (typeof newPassword !== 'string' || newPassword.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json({ error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters` }, { status: 400 })
    }

    // Get token from cookie
    const cookieHeader = request.headers.get('cookie') || ''
    const cookies = Object.fromEntries(cookieHeader.split(';').map(c => c.trim().split('=')))
    const token = cookies['session_token']

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    const supabase = await createServerSupabaseClient()

    // Fetch user by ID
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', payload.userId)
      .single()

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify current password
    const passwordMatch = await bcrypt.compare(currentPassword, user.password_hash)
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 })
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10)

    // Update password and clear force_password_change flag
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password_hash: newPasswordHash,
        force_password_change: false,
      })
      .eq('id', payload.userId)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Password changed successfully' })
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}