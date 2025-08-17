import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  profileUpdateSchema,
  updatePasswordSchema,
} from '@/lib/validations/auth'
import {
  handleApiError,
  handleDatabaseError,
  createUnauthorizedErrorResponse,
  createValidationErrorResponse
} from '@/lib/utils/api-error-handler'

// GET - Retrieve user profile
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return createUnauthorizedErrorResponse()
    }

       // Get user profile from database
    let { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    // If user doesn't exist in users table, create them with enterprise access
    if (profileError && profileError.code === 'PGRST116') {
      const { data: newProfile, error: createError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || 'User',
          company_name: user.user_metadata?.company_name || null,
          avatar_url: user.user_metadata?.avatar_url || null,
          subscription_status: 'active',
          subscription_tier: 'enterprise', // Give enterprise access by default
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single()

      if (createError) {
        return handleDatabaseError(createError, 'create', 'User profile')
      }
      userProfile = newProfile
    } else if (profileError) {
      return handleDatabaseError(profileError, 'fetch', 'User profile')
    }


    return NextResponse.json({
      user: {
        id: userProfile.id,
        email: userProfile.email,
        fullName: userProfile.full_name,
        companyName: userProfile.company_name,
        avatarUrl: userProfile.avatar_url,
        subscriptionStatus: userProfile.subscription_status,
        subscriptionTier: userProfile.subscription_tier,
        stripeCustomerId: userProfile.stripe_customer_id,
        trialEndsAt: userProfile.trial_ends_at,
        onboardingCompletedAt: userProfile.onboarding_completed_at,
        lastLoginAt: userProfile.last_login_at,
        createdAt: userProfile.created_at,
        updatedAt: userProfile.updated_at,
      },
    })
  } catch (error) {
    return handleApiError(error, 'GET /api/user/profile')
  }
}

// PATCH - Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = await createClient()

    // Get current user session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return createUnauthorizedErrorResponse()
    }

    // Check if this is a password update
    if (body.currentPassword && body.newPassword) {
      const validationResult = updatePasswordSchema.safeParse(body)
      if (!validationResult.success) {
        return createValidationErrorResponse(validationResult.error)
      }

      const { currentPassword, newPassword } = validationResult.data

      // Verify current password by attempting to sign in
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: currentPassword,
      })

      if (verifyError) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        )
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to update password' },
          { status: 400 }
        )
      }

      // Log audit event
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'update',
        resource_type: 'user',
        resource_id: user.id,
        details: {
          action: 'password_changed',
          user_agent: request.headers.get('user-agent'),
        },
        ip_address:
          request.headers.get('x-forwarded-for') ||
          request.headers.get('x-real-ip') ||
          '127.0.0.1',
      })

      return NextResponse.json({
        message: 'Password updated successfully',
      })
    }

    // Handle profile updates
    const validationResult = profileUpdateSchema.safeParse(body)
    if (!validationResult.success) {
      return createValidationErrorResponse(validationResult.error)
    }

    const { fullName, companyName, email, avatarUrl } = validationResult.data

    // Update auth user metadata if email is changing
    const updateData: any = {}
    if (email !== user.email) {
      updateData.email = email
    }
    if (avatarUrl) {
      updateData.data = { ...user.user_metadata, avatar_url: avatarUrl }
    }

    if (Object.keys(updateData).length > 0) {
      const { error: authUpdateError } =
        await supabase.auth.updateUser(updateData)
      if (authUpdateError) {
        return NextResponse.json(
          { error: 'Failed to update auth profile' },
          { status: 400 }
        )
      }
    }

    // Update user profile in database
    const { data: updatedProfile, error: updateError } = await supabase
      .from('users')
      .update({
        full_name: fullName,
        company_name: companyName || null,
        email: email,
        avatar_url: avatarUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select('*')
      .single()

    if (updateError) {
      return handleDatabaseError(updateError, 'update', 'Profile')
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'update',
      resource_type: 'user',
      resource_id: user.id,
      details: {
        action: 'profile_updated',
        changes: {
          fullName: fullName !== user.user_metadata?.full_name,
          companyName: companyName !== user.user_metadata?.company_name,
          email: email !== user.email,
          avatarUrl: avatarUrl !== user.user_metadata?.avatar_url,
        },
        user_agent: request.headers.get('user-agent'),
      },
      ip_address:
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        '127.0.0.1',
    })

    return NextResponse.json({
      user: {
        id: updatedProfile.id,
        email: updatedProfile.email,
        fullName: updatedProfile.full_name,
        companyName: updatedProfile.company_name,
        avatarUrl: updatedProfile.avatar_url,
        subscriptionStatus: updatedProfile.subscription_status,
        subscriptionTier: updatedProfile.subscription_tier,
        stripeCustomerId: updatedProfile.stripe_customer_id,
        trialEndsAt: updatedProfile.trial_ends_at,
        onboardingCompletedAt: updatedProfile.onboarding_completed_at,
        lastLoginAt: updatedProfile.last_login_at,
        createdAt: updatedProfile.created_at,
        updatedAt: updatedProfile.updated_at,
      },
      message: 'Profile updated successfully',
    })
  } catch (error) {
    return handleApiError(error, 'PATCH /api/user/profile')
  }
}

// DELETE - Delete user account
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return createUnauthorizedErrorResponse()
    }

    // Log audit event before deletion
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'delete',
      resource_type: 'user',
      resource_id: user.id,
      details: {
        action: 'account_deleted',
        user_agent: request.headers.get('user-agent'),
      },
      ip_address:
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        '127.0.0.1',
    })

    // Delete user from auth (this will cascade to user profile due to foreign key)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)

    if (deleteError) {
      return handleDatabaseError(deleteError, 'delete', 'Account')
    }

    return NextResponse.json({
      message: 'Account deleted successfully',
    })
  } catch (error) {
    return handleApiError(error, 'DELETE /api/user/profile')
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
