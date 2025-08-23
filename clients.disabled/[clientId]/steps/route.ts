/*
 * Copyright (c) 2024 Marvelously Made LLC DBA Dev App Hero. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This software contains proprietary and confidential information.
 * Unauthorized copying, distribution, or use is strictly prohibited.
 * 
 * For licensing information, contact: legal@devapphero.com
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
    
    // Mock data for now - replace with actual database query
    const steps = [
      {
        id: '1',
        name: 'Initial Setup',
        description: 'Complete basic account setup and configuration',
        status: 'completed',
        completed_at: '2024-01-14T14:20:00Z',
        order: 1
      },
      {
            id: '2',
            name: 'Company Information',
            description: 'Provide basic company details and contact information',
            status: 'completed',
            completed_at: '2024-01-15T16:30:00Z',
            order: 2
          },
          {
            id: '3',
            name: 'Legal Documentation',
            description: 'Review and sign necessary legal agreements',
            status: 'completed',
            completed_at: '2024-01-16T10:15:00Z',
            order: 3
          },
          {
            id: '4',
            name: 'Document Upload',
            description: 'Upload required business documents and certifications',
            status: 'in_progress',
            order: 4
          },
          {
            id: '5',
            name: 'Compliance Verification',
            description: 'Verify compliance with industry regulations',
            status: 'pending',
            order: 5
          },
          {
            id: '6',
            name: 'Account Setup',
            description: 'Set up user accounts and access permissions',
            status: 'pending',
            order: 6
          },
          {
            id: '7',
            name: 'Training & Orientation',
            description: 'Complete training modules and system orientation',
            status: 'pending',
            order: 7
          },
          {
            id: '8',
            name: 'Final Review',
            description: 'Final review and approval of onboarding completion',
            status: 'pending',
            order: 8
          }
        ];

    // Mock data structure for different clients
    const mockSteps = {
      '1': steps,
      '2': [ // Sarah Johnson - 100% completed
          {
            id: '1',
            name: 'Welcome & Introduction',
            description: 'Initial welcome message and overview of the onboarding process',
            status: 'completed',
            completed_at: '2024-01-16T11:30:00Z',
            order: 1
          },
          {
            id: '2',
            name: 'Company Information',
            description: 'Provide basic company details and contact information',
            status: 'completed',
            completed_at: '2024-01-16T14:00:00Z',
            order: 2
          },
          {
            id: '3',
            name: 'Legal Documentation',
            description: 'Review and sign necessary legal agreements',
            status: 'completed',
            completed_at: '2024-01-17T09:30:00Z',
            order: 3
          },
          {
            id: '4',
            name: 'Document Upload',
            description: 'Upload required business documents and certifications',
            status: 'completed',
            completed_at: '2024-01-17T15:45:00Z',
            order: 4
          },
          {
            id: '5',
            name: 'Compliance Verification',
            description: 'Verify compliance with industry regulations',
            status: 'completed',
            completed_at: '2024-01-18T10:20:00Z',
            order: 5
          },
          {
            id: '6',
            name: 'Account Setup',
            description: 'Set up user accounts and access permissions',
            status: 'completed',
            completed_at: '2024-01-18T13:15:00Z',
            order: 6
          },
          {
            id: '7',
            name: 'Training & Orientation',
            description: 'Complete training modules and system orientation',
            status: 'completed',
            completed_at: '2024-01-18T16:00:00Z',
            order: 7
          },
          {
            id: '8',
            name: 'Final Review',
            description: 'Final review and approval of onboarding completion',
            status: 'completed',
            completed_at: '2024-01-18T16:45:00Z',
            order: 8
          }
        ],
        '3': [ // Michael Chen - 45% progress
          {
            id: '1',
            name: 'Welcome & Account Setup',
            description: 'Create your account and set up basic profile',
            status: 'completed',
            completed_at: '2024-01-17T10:30:00Z',
            order: 1
          },
          {
            id: '2',
            name: 'Product Overview',
            description: 'Learn about our SaaS platform features and capabilities',
            status: 'completed',
            completed_at: '2024-01-17T11:45:00Z',
            order: 2
          },
          {
            id: '3',
            name: 'Feature Walkthrough',
            description: 'Interactive walkthrough of key platform features',
            status: 'in_progress',
            order: 3
          },
          {
            id: '4',
            name: 'Integration Setup',
            description: 'Connect your existing tools and systems',
            status: 'pending',
            order: 4
          },
          {
            id: '5',
            name: 'Team Collaboration',
            description: 'Set up team members and collaboration features',
            status: 'pending',
            order: 5
          },
          {
            id: '6',
            name: 'Go Live',
            description: 'Launch your first project and go live',
            status: 'pending',
            order: 6
          }
        ],
        '4': [ // Emily Rodriguez - 0% progress (invited only)
          {
            id: '1',
            name: 'Accept Invitation',
            description: 'Click the invitation link and create your account',
            status: 'pending',
            order: 1
          },
          {
            id: '2',
            name: 'Product Overview',
            description: 'Learn about our SaaS platform features and capabilities',
            status: 'pending',
            order: 2
          },
          {
            id: '3',
            name: 'Feature Walkthrough',
            description: 'Interactive walkthrough of key platform features',
            status: 'pending',
            order: 3
          },
          {
            id: '4',
            name: 'Integration Setup',
            description: 'Connect your existing tools and systems',
            status: 'pending',
            order: 4
          },
          {
            id: '5',
            name: 'Team Collaboration',
            description: 'Set up team members and collaboration features',
            status: 'pending',
            order: 5
          },
          {
            id: '6',
            name: 'Go Live',
            description: 'Launch your first project and go live',
            status: 'pending',
            order: 6
          }
        ],
        '5': [ // David Wilson - 20% progress
          {
            id: '1',
            name: 'Welcome & Introduction',
            description: 'Initial welcome message and overview of the onboarding process',
            status: 'completed',
            completed_at: '2024-01-18T15:00:00Z',
            order: 1
          },
          {
            id: '2',
            name: 'Company Information',
            description: 'Provide basic company details and contact information',
            status: 'in_progress',
            order: 2
          },
          {
            id: '3',
            name: 'Legal Documentation',
            description: 'Review and sign necessary legal agreements',
            status: 'pending',
            order: 3
          },
          {
            id: '4',
            name: 'Document Upload',
            description: 'Upload required business documents and certifications',
            status: 'pending',
            order: 4
          },
          {
            id: '5',
            name: 'Compliance Verification',
            description: 'Verify compliance with industry regulations',
            status: 'pending',
            order: 5
          },
          {
            id: '6',
            name: 'Account Setup',
            description: 'Set up user accounts and access permissions',
            status: 'pending',
            order: 6
          },
          {
            id: '7',
            name: 'Training & Orientation',
            description: 'Complete training modules and system orientation',
            status: 'pending',
            order: 7
          },
          {
            id: '8',
            name: 'Final Review',
            description: 'Final review and approval of onboarding completion',
            status: 'pending',
            order: 8
          }
        ],
        '6': [ // Lisa Thompson - 100% completed
          {
            id: '1',
            name: 'Welcome & Setup',
            description: 'Quick welcome and basic account setup',
            status: 'completed',
            completed_at: '2024-01-20T10:45:00Z',
            order: 1
          },
          {
            id: '2',
            name: 'Basic Information',
            description: 'Provide essential contact and business information',
            status: 'completed',
            completed_at: '2024-01-20T11:30:00Z',
            order: 2
          },
          {
            id: '3',
            name: 'Service Agreement',
            description: 'Review and accept service terms',
            status: 'completed',
            completed_at: '2024-01-21T14:15:00Z',
            order: 3
          },
          {
            id: '4',
            name: 'Getting Started',
            description: 'Complete basic setup and start using our services',
            status: 'completed',
            completed_at: '2024-01-21T17:00:00Z',
            order: 4
          }
        ]
      }

      const steps = mockSteps[clientId as keyof typeof mockSteps] || []

      return NextResponse.json({
        success: true,
        data: steps
      })
    }

    const supabase = await getSupabaseClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    try {
      // First verify the client belongs to the user
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('id', clientId)
        .eq('user_id', user.id)
        .single()

      if (clientError || !client) {
        return NextResponse.json(
          { error: 'Client not found' },
          { status: 404 }
        )
      }

      // Fetch onboarding steps for the client
      const { data: steps, error: stepsError } = await supabase
        .from('onboarding_steps')
        .select('*')
        .eq('client_id', clientId)
        .order('order', { ascending: true })

      if (stepsError) {
        console.error('Steps fetch error:', stepsError)
        return NextResponse.json({
          success: true,
          data: []
        })
      }

      return NextResponse.json({
        success: true,
        data: steps || []
      })
    } catch (error) {
      console.error('Client steps fetch error:', error)
      return NextResponse.json({
        success: true,
        data: []
      })
    }
  } catch (error) {
    console.error('Client steps API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}