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

import { KitPreviewClient } from '@/components/kit-preview-client'

interface KitPageProps {
  params: Promise<{
    kitId: string
  }>
  searchParams: Promise<{
    client?: string
    step?: string
  }>
}

export default async function KitPage({ params, searchParams }: KitPageProps) {
  const { kitId } = await params
  const { client: clientIdentifier, step: currentStepId } = await searchParams

  return (
    <KitPreviewClient
      kitId={kitId}
      clientIdentifier={clientIdentifier}
      initialStepId={currentStepId}
    />
  )
}

// Configure dynamic rendering and caching
export const dynamic = 'force-dynamic'
export const revalidate = 0
