import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { KitPortal } from '@/components/kit-portal/kit-portal'
import { KitPortalSkeleton } from '@/components/kit-portal/kit-portal-skeleton'
import type { Kit, KitStep } from '@/types'

interface Business {
  id: string
  name: string
  logo_url?: string
  brand_color?: string
  website_url?: string
}

interface KitWithBusiness extends Kit {
  business?: Business
}

interface KitPageProps {
  params: {
    kitId: string
  }
  searchParams: {
    client?: string
    step?: string
  }
}

async function getKitData(kitId: string) {
  const supabase = createClient()

  try {
    // Fetch kit details
    const { data: kit, error: kitError } = await supabase
      .from('kits')
      .select(
        `
        *,
        user:users!user_id(
          id,
          full_name,
          company_name
        )
      `
      )
      .eq('id', kitId)
      .eq('status', 'published')
      .single()

    if (kitError || !kit) {
      return null
    }

    // Fetch kit steps
    const { data: steps, error: stepsError } = await supabase
      .from('kit_steps')
      .select('*')
      .eq('kit_id', kitId)
      .order('order_index')

    if (stepsError) {
      console.error('Error fetching kit steps:', stepsError)
      return null
    }

    return {
      kit: kit as KitWithBusiness,
      steps: (steps || []) as KitStep[],
    }
  } catch (error) {
    console.error('Error fetching kit data:', error)
    return null
  }
}

export default async function KitPage({ params, searchParams }: KitPageProps) {
  const { kitId } = params
  const { client: clientIdentifier, step: currentStepId } = searchParams

  const kitData = await getKitData(kitId)

  if (!kitData) {
    notFound()
  }

  const { kit, steps } = kitData

  // Generate client identifier if not provided
  const finalClientIdentifier = clientIdentifier || generateClientIdentifier()

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<KitPortalSkeleton />}>
        <KitPortal
          kit={kit}
          steps={steps}
          clientIdentifier={finalClientIdentifier}
          initialStepId={currentStepId}
        />
      </Suspense>
    </div>
  )
}

function generateClientIdentifier(): string {
  // Generate a unique identifier for the client session
  // In production, this might come from authentication or a more sophisticated system
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  return `client_${timestamp}_${random}`
}

// Generate metadata for better SEO and social sharing
export async function generateMetadata({
  params,
}: {
  params: { kitId: string }
}) {
  const kitData = await getKitData(params.kitId)

  if (!kitData) {
    return {
      title: 'Kit Not Found',
      description: 'The requested onboarding kit could not be found.',
    }
  }

  const { kit } = kitData

  return {
    title: `${kit.name} | ${(kit as any).user?.company_name || (kit as any).user?.full_name || 'Onboarding'}`,
    description:
      kit.description ||
      `Complete your onboarding process for ${(kit as any).user?.company_name || 'this business'}`,
    openGraph: {
      title: `${kit.name} | ${(kit as any).user?.company_name || (kit as any).user?.full_name || 'Onboarding'}`,
      description:
        kit.description ||
        `Complete your onboarding process for ${(kit as any).user?.company_name || 'this business'}`,
      type: 'website',
      images: kit.logo_url
        ? [
            {
              url: kit.logo_url,
              width: 1200,
              height: 630,
              alt: `${kit.name} Logo`,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${kit.name} | ${(kit as any).user?.company_name || (kit as any).user?.full_name || 'Onboarding'}`,
      description:
        kit.description ||
        `Complete your onboarding process for ${(kit as any).user?.company_name || 'this business'}`,
      images: kit.logo_url ? [kit.logo_url] : undefined,
    },
    robots: {
      index: false, // Don't index client onboarding pages
      follow: false,
    },
  }
}

// Configure dynamic rendering and caching
export const dynamic = 'force-dynamic'
export const revalidate = 0
