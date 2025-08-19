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

"use client"

import { Button } from '@/components/ui/button'
import { MessageCircle, Sparkles } from 'lucide-react'
import { useChatbot } from './chatbot-provider'

export function ChatbotTrigger() {
  const { isOpen, openChatbot } = useChatbot()

  if (isOpen) return null

  return (
    <Button
      onClick={openChatbot}
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-2 border-white z-50"
      size="lg"
    >
      <div className="relative">
        <MessageCircle className="h-6 w-6 text-white" />
        <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-300 animate-pulse" />
      </div>
    </Button>
  )
}