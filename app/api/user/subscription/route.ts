import { createRouteHandlerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    if (!action) {
      return NextResponse.json({ success: false, error: 'Missing action parameter' }, { status: 400 })
    }

    const userId = session.user.id

    if (action === 'assign_beta') {
      // Assign BETA tier and start trial
      const now = new Date()
      const trialDurationDays = 14
      const trialEndDate = new Date(now.getTime() + trialDurationDays * 24 * 60 * 60 * 1000)

      const { error } = await supabase
        .from('user_profiles')
        .update({
          subscription_tier: 'beta',
          trial_start_date: now.toISOString(),
          trial_end_date: trialEndDate.toISOString(),
          trial_active: true,
        })
        .eq('id', userId)

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: 'BETA tier assigned and trial started' })
    }

    if (action === 'check_trial') {
      // Check trial status and expiration
      const { data: user, error } = await supabase
        .from('user_profiles')
        .select('subscription_tier, trial_start_date, trial_end_date, trial_active')
        .eq('id', userId)
        .single()

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }

      if (user.subscription_tier !== 'beta' || !user.trial_active) {
        return NextResponse.json({ success: true, trialActive: false })
      }

      const now = new Date()
      const trialEnd = new Date(user.trial_end_date)
      const trialActive = now < trialEnd

      if (!trialActive) {
        // Mark trial as inactive
        await supabase
          .from('user_profiles')
          .update({ trial_active: false })
          .eq('id', userId)
      }

      const remainingDays = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))

      return NextResponse.json({ success: true, trialActive, remainingDays })
    }

    if (action === 'upgrade_tier') {
      // Upgrade from BETA to paid tier
      const { newTier } = body
      const validTiers = ['starter', 'professional', 'enterprise', 'enterprise_plus']
      if (!newTier || !validTiers.includes(newTier)) {
        return NextResponse.json({ success: false, error: 'Invalid or missing newTier parameter' }, { status: 400 })
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({
          subscription_tier: newTier,
          trial_active: false,
          trial_start_date: null,
          trial_end_date: null,
        })
        .eq('id', userId)

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: `Upgraded to ${newTier} tier` })
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}