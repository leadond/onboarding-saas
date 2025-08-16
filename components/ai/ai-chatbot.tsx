'use client'

"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  MessageCircle,
  Send,
  Bot,
  User,
  Sparkles,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Minimize2,
  Maximize2,
  X
} from 'lucide-react'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  type?: 'text' | 'suggestion' | 'action'
  metadata?: {
    confidence?: number
    sources?: string[]
    actions?: Array<{
      label: string
      action: string
      data?: any
    }>
  }
}

interface AIChatbotProps {
  isMinimized?: boolean
  onToggleMinimize?: () => void
  onClose?: () => void
  context?: {
    page?: string
    user?: string
    currentTask?: string
  }
}

const SUGGESTED_PROMPTS = [
  "How can I improve my onboarding completion rate?",
  "Create a welcome email template for new clients",
  "What are the best practices for form design?",
  "Help me set up automated workflows",
  "Analyze my client engagement metrics",
  "Generate content for my onboarding steps"
]

const MOCK_RESPONSES = {
  "completion rate": {
    content: "Based on your current data, here are 3 proven strategies to improve completion rates:\n\n1. **Simplify Forms** - Reduce required fields by 30% (can increase completion by 15%)\n2. **Add Progress Indicators** - Show users how far they've come\n3. **Implement Smart Reminders** - Send personalized follow-ups after 24 hours\n\nWould you like me to help implement any of these strategies?",
    confidence: 92,
    actions: [
      { label: "Simplify Current Forms", action: "optimize_forms" },
      { label: "Add Progress Bars", action: "add_progress" },
      { label: "Set Up Reminders", action: "create_reminders" }
    ]
  },
  "welcome email": {
    content: "I'll create a professional welcome email template for you:\n\n**Subject:** Welcome to [Company Name] - Let's Get Started!\n\n**Body:**\nHi [Client Name],\n\nWelcome to [Company Name]! We're excited to work with you.\n\nTo get started, please complete your onboarding process:\n• Upload required documents\n• Review and sign agreements\n• Set up your account preferences\n\nThis should take about 10-15 minutes. If you need help, our team is here to assist.\n\nBest regards,\n[Your Name]\n\nWould you like me to customize this for a specific industry?",
    confidence: 95,
    actions: [
      { label: "Customize for Industry", action: "customize_email" },
      { label: "Add to Templates", action: "save_template" }
    ]
  },
  "form design": {
    content: "Here are the top form design best practices for onboarding:\n\n**Layout & Structure:**\n• Use single-column layouts\n• Group related fields together\n• Limit to 7±2 fields per page\n\n**User Experience:**\n• Clear, descriptive labels\n• Helpful placeholder text\n• Real-time validation\n• Progress indicators\n\n**Optimization:**\n• Mobile-first design\n• Auto-save functionality\n• Smart defaults when possible\n\nYour current forms score 7.2/10. Want me to analyze specific improvements?",
    confidence: 88,
    actions: [
      { label: "Analyze My Forms", action: "analyze_forms" },
      { label: "Apply Best Practices", action: "optimize_forms" }
    ]
  }
}

export function AIChatbot({ isMinimized = false, onToggleMinimize, onClose, context }: AIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hi! I'm your AI assistant for OnboardKit. I can help you optimize your onboarding processes, generate content, and provide insights based on your data.${context?.currentTask ? `\n\nI see you're working on: ${context.currentTask}. How can I help?` : ''}`,
      role: 'assistant',
      timestamp: new Date(),
      type: 'text'
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date(),
      type: 'text'
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const response = generateResponse(input)
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.content,
        role: 'assistant',
        timestamp: new Date(),
        type: response.actions ? 'action' : 'text',
        metadata: {
          confidence: response.confidence,
          actions: response.actions
        }
      }

      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
  }

  const generateResponse = (query: string): { content: string; confidence?: number; actions?: any[] } => {
    const lowerQuery = query.toLowerCase()
    
    if (lowerQuery.includes('completion') || lowerQuery.includes('rate')) {
      return MOCK_RESPONSES["completion rate"]
    } else if (lowerQuery.includes('email') || lowerQuery.includes('welcome')) {
      return MOCK_RESPONSES["welcome email"]
    } else if (lowerQuery.includes('form') || lowerQuery.includes('design')) {
      return MOCK_RESPONSES["form design"]
    } else if (lowerQuery.includes('workflow') || lowerQuery.includes('automat')) {
      return {
        content: "I can help you set up automated workflows! Here are some popular automation ideas:\n\n• **Welcome Sequence** - Automatically send welcome emails and create tasks\n• **Follow-up Reminders** - Remind clients about incomplete steps\n• **Escalation Rules** - Alert team members when clients are stuck\n• **Completion Celebrations** - Send congratulations and next steps\n\nWhich type of workflow interests you most?",
        confidence: 90,
        actions: [
          { label: "Create Welcome Workflow", action: "create_workflow", data: { type: "welcome" } },
          { label: "Set Up Reminders", action: "create_workflow", data: { type: "reminders" } }
        ]
      }
    } else {
      return {
        content: "I'd be happy to help! I can assist with:\n\n• **Content Generation** - Create emails, forms, and page copy\n• **Process Optimization** - Improve completion rates and user experience\n• **Analytics Insights** - Understand your data and trends\n• **Workflow Automation** - Set up smart automations\n• **Best Practices** - Industry-specific recommendations\n\nWhat would you like to work on?",
        confidence: 85
      }
    }
  }

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt)
    inputRef.current?.focus()
  }

  const handleAction = (action: string, data?: any) => {
    // Simulate action execution
    const actionMessage: Message = {
      id: Date.now().toString(),
      content: `✅ Action executed: ${action}${data ? ` with parameters: ${JSON.stringify(data)}` : ''}`,
      role: 'assistant',
      timestamp: new Date(),
      type: 'suggestion'
    }
    setMessages(prev => [...prev, actionMessage])
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  if (isMinimized) {
    return (
      <Card className="fixed bottom-4 right-4 w-80 shadow-lg border-2 border-blue-200">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Bot className="h-5 w-5 text-blue-600" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              </div>
              <CardTitle className="text-sm">AI Assistant</CardTitle>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleMinimize}
                className="h-6 w-6 p-0"
              >
                <Maximize2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-gray-600 mb-2">Ready to help optimize your onboarding!</p>
          <Button
            onClick={onToggleMinimize}
            className="w-full h-8 text-xs"
            size="sm"
          >
            <MessageCircle className="h-3 w-3 mr-1" />
            Start Chat
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[600px] shadow-xl border-2 border-blue-200 flex flex-col">
      <CardHeader className="pb-2 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Bot className="h-5 w-5 text-blue-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            </div>
            <div>
              <CardTitle className="text-sm">AI Assistant</CardTitle>
              <p className="text-xs text-gray-500">Powered by GPT-4</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleMinimize}
              className="h-6 w-6 p-0"
            >
              <Minimize2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex space-x-2 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <Avatar className="h-6 w-6 mt-1">
                    {message.role === 'user' ? (
                      <>
                        <AvatarFallback className="bg-blue-100">
                          <User className="h-3 w-3 text-blue-600" />
                        </AvatarFallback>
                      </>
                    ) : (
                      <>
                        <AvatarFallback className="bg-purple-100">
                          <Bot className="h-3 w-3 text-purple-600" />
                        </AvatarFallback>
                      </>
                    )}
                  </Avatar>
                  <div className={`rounded-lg p-3 ${
                    message.role === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : message.type === 'suggestion'
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-gray-100'
                  }`}>
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    
                    {message.metadata?.confidence && (
                      <div className="mt-2 flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          <Sparkles className="h-3 w-3 mr-1" />
                          {message.metadata.confidence}% confident
                        </Badge>
                      </div>
                    )}

                    {message.metadata?.actions && (
                      <div className="mt-3 space-y-2">
                        {message.metadata.actions.map((action, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="w-full justify-start text-xs h-7"
                            onClick={() => handleAction(action.action, action.data)}
                          >
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    )}

                    {message.role === 'assistant' && (
                      <div className="mt-2 flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => copyMessage(message.content)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                        >
                          <ThumbsUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                        >
                          <ThumbsDown className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex space-x-2 max-w-[85%]">
                  <Avatar className="h-6 w-6 mt-1">
                    <AvatarFallback className="bg-purple-100">
                      <Bot className="h-3 w-3 text-purple-600" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      <span className="text-sm text-gray-600">Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {messages.length === 1 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 font-medium">Suggested prompts:</p>
                {SUGGESTED_PROMPTS.slice(0, 3).map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs h-8 text-left"
                    onClick={() => handleSuggestedPrompt(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>

        <div className="border-t p-4">
          <div className="flex space-x-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about onboarding..."
              className="flex-1 text-sm"
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="sm"
              className="px-3"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            AI responses are generated and may not always be accurate
          </p>
        </div>
      </CardContent>
    </Card>
  )
}