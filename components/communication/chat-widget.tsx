/*
 * Copyright (c) 2024 [Your Company Name]. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This software contains proprietary and confidential information.
 * Unauthorized copying, distribution, or use is strictly prohibited.
 * 
 * For licensing information, contact: [your-email@domain.com]
 */

'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'

interface ChatMessage {
  id: string
  content: string
  sender_type: 'client' | 'admin' | 'system'
  sender_name?: string
  sender_avatar?: string
  timestamp: string
  read: boolean
  message_type: 'text' | 'image' | 'file' | 'system_notification'
  metadata?: {
    file_url?: string
    file_name?: string
    file_size?: number
    image_url?: string
  }
}

interface ChatWidgetProps {
  kitId: string
  clientIdentifier: string
  clientName?: string
  clientEmail?: string
  position?: 'bottom-right' | 'bottom-left' | 'embedded'
  theme?: 'light' | 'dark'
  brandColor?: string
  companyName?: string
  initialMinimized?: boolean
  className?: string
  onNewMessage?: (message: ChatMessage) => void
}

export function ChatWidget({
  kitId,
  clientIdentifier,
  clientName = 'Client',
  clientEmail,
  position = 'bottom-right',
  theme = 'light',
  brandColor = '#3B82F6',
  companyName = 'Onboard Hero',
  initialMinimized = true,
  className,
  onNewMessage,
}: ChatWidgetProps) {
  const [isMinimized, setIsMinimized] = useState(initialMinimized)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [supportAgent, setSupportAgent] = useState({
    name: 'Support Team',
    avatar: '👋',
    status: 'online',
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messageInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Load chat history
  const loadChatHistory = useCallback(async () => {
    setIsLoading(true)
    try {
      // In a real implementation, this would query a chat_messages table
      // For demo, we'll create some sample messages
      const sampleMessages: ChatMessage[] = [
        {
          id: '1',
          content: `Hi ${clientName}! 👋 Welcome to ${companyName}. I'm here to help you with your onboarding. Feel free to ask any questions!`,
          sender_type: 'admin',
          sender_name: supportAgent.name,
          sender_avatar: supportAgent.avatar,
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          read: true,
          message_type: 'text',
        },
        {
          id: '2',
          content:
            'This chat is monitored during business hours (9 AM - 6 PM EST). For urgent matters, please email us directly.',
          sender_type: 'system',
          sender_name: 'System',
          timestamp: new Date(Date.now() - 1000 * 60 * 29).toISOString(),
          read: true,
          message_type: 'system_notification',
        },
      ]

      setMessages(sampleMessages)
      setIsConnected(true)
    } catch (error) {
      console.error('Failed to load chat history:', error)
    } finally {
      setIsLoading(false)
    }
  }, [clientName, companyName, supportAgent.name, supportAgent.avatar])

  // Send message
  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || isLoading) return

    const message: ChatMessage = {
      id: Date.now().toString(),
      content: newMessage.trim(),
      sender_type: 'client',
      sender_name: clientName,
      timestamp: new Date().toISOString(),
      read: false,
      message_type: 'text',
    }

    // Add message to local state immediately (optimistic update)
    setMessages(prev => [...prev, message])
    setNewMessage('')

    // In real implementation, send to backend
    try {
      // await supabase.from('chat_messages').insert({...})
      onNewMessage?.(message)

      // Simulate admin response after a delay
      setTimeout(() => {
        const autoReply: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content:
            "Thanks for your message! I'll get back to you shortly. In the meantime, you can check our help center for common questions.",
          sender_type: 'admin',
          sender_name: supportAgent.name,
          sender_avatar: supportAgent.avatar,
          timestamp: new Date().toISOString(),
          read: false,
          message_type: 'text',
        }
        setMessages(prev => [...prev, autoReply])
        setUnreadCount(prev => prev + 1)
      }, 2000)
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }, [
    newMessage,
    clientName,
    isLoading,
    onNewMessage,
    supportAgent.name,
    supportAgent.avatar,
  ])

  // Handle key press
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        sendMessage()
      }
    },
    [sendMessage]
  )

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory()
  }, [loadChatHistory])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (!isMinimized) {
      setUnreadCount(0)
    }
  }, [isMinimized])

  // Focus input when chat opens
  useEffect(() => {
    if (!isMinimized && messageInputRef.current) {
      setTimeout(() => {
        messageInputRef.current?.focus()
      }, 100)
    }
  }, [isMinimized])

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const getMessageBubbleStyle = (senderType: ChatMessage['sender_type']) => {
    if (senderType === 'client') {
      return {
        container: 'justify-end',
        bubble: `bg-[${brandColor}] text-white`,
        triangle: 'right',
      }
    } else if (senderType === 'admin') {
      return {
        container: 'justify-start',
        bubble:
          theme === 'dark'
            ? 'bg-gray-700 text-white'
            : 'bg-gray-100 text-gray-900',
        triangle: 'left',
      }
    } else {
      return {
        container: 'justify-center',
        bubble:
          theme === 'dark'
            ? 'bg-gray-800 text-gray-300'
            : 'bg-yellow-50 text-yellow-800 border border-yellow-200',
        triangle: 'none',
      }
    }
  }

  if (position === 'embedded') {
    return (
      <Card className={cn('flex h-96 flex-col', className)}>
        {/* Embedded chat content */}
        <div className="flex flex-1 flex-col">
          <ChatContent />
        </div>
      </Card>
    )
  }

  // Floating chat widget
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  }

  function ChatContent() {
    return (
      <>
        {/* Header */}
        <div
          className="flex items-center justify-between border-b p-4"
          style={{ backgroundColor: brandColor, color: 'white' }}
        >
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{supportAgent.avatar}</div>
            <div>
              <div className="font-medium">{supportAgent.name}</div>
              <div className="flex items-center text-xs opacity-90">
                <div
                  className={cn(
                    'mr-2 h-2 w-2 rounded-full',
                    isConnected ? 'bg-green-400' : 'bg-gray-400'
                  )}
                ></div>
                {isConnected ? 'Online' : 'Offline'}
              </div>
            </div>
          </div>

          {position !== 'embedded' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsMinimized(true)}
              className="text-white hover:bg-white/10"
            >
              −
            </Button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
              <span className="ml-2 text-gray-600">Loading chat...</span>
            </div>
          ) : (
            messages.map(message => {
              const styles = getMessageBubbleStyle(message.sender_type)

              return (
                <div key={message.id} className={cn('flex', styles.container)}>
                  <div
                    className={cn(
                      'max-w-xs rounded-lg px-4 py-2 lg:max-w-md',
                      styles.bubble,
                      message.sender_type === 'system'
                        ? 'text-center text-sm'
                        : ''
                    )}
                  >
                    {message.sender_type !== 'system' &&
                      message.sender_type !== 'client' && (
                        <div className="mb-1 text-xs opacity-75">
                          {message.sender_name}
                        </div>
                      )}
                    <div className="break-words">{message.content}</div>
                    <div
                      className={cn(
                        'mt-1 text-xs',
                        message.sender_type === 'client'
                          ? 'text-white/75'
                          : 'text-gray-500'
                      )}
                    >
                      {formatTimestamp(message.timestamp)}
                    </div>
                  </div>
                </div>
              )
            })
          )}

          {isTyping && (
            <div className="flex justify-start">
              <div className="rounded-lg bg-gray-100 px-4 py-2">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                    style={{ animationDelay: '0.1s' }}
                  ></div>
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex space-x-2">
            <Input
              ref={messageInputRef}
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={!isConnected}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim() || !isConnected}
              style={{ backgroundColor: brandColor }}
            >
              Send
            </Button>
          </div>
          <div className="mt-2 text-center text-xs text-gray-500">
            Press Enter to send • Shift+Enter for new line
          </div>
        </div>
      </>
    )
  }

  return (
    <div className={cn('fixed z-50', positionClasses[position], className)}>
      {/* Minimized State */}
      {isMinimized ? (
        <Button
          onClick={() => setIsMinimized(false)}
          className={cn(
            'relative h-16 w-16 rounded-full shadow-lg',
            'transition-all duration-200 hover:scale-105'
          )}
          style={{ backgroundColor: brandColor }}
        >
          <span className="text-2xl">💬</span>

          {unreadCount > 0 && (
            <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}

          {/* Pulse animation for new messages */}
          {unreadCount > 0 && (
            <div className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-20"></div>
          )}
        </Button>
      ) : (
        /* Expanded State */
        <Card className="flex h-96 w-80 flex-col shadow-xl">
          <ChatContent />
        </Card>
      )}
    </div>
  )
}

export default ChatWidget
