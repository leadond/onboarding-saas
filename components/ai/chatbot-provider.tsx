'use client'

"use client"

import { createContext, useContext, useState, ReactNode } from 'react'
import { AIChatbot } from './ai-chatbot'

interface ChatbotContextType {
  isOpen: boolean
  isMinimized: boolean
  openChatbot: () => void
  closeChatbot: () => void
  toggleMinimize: () => void
  setContext: (context: any) => void
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined)

export function useChatbot() {
  const context = useContext(ChatbotContext)
  if (!context) {
    throw new Error('useChatbot must be used within a ChatbotProvider')
  }
  return context
}

interface ChatbotProviderProps {
  children: ReactNode
}

export function ChatbotProvider({ children }: ChatbotProviderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(true)
  const [context, setContext] = useState<any>({})

  const openChatbot = () => {
    setIsOpen(true)
    setIsMinimized(false)
  }

  const closeChatbot = () => {
    setIsOpen(false)
    setIsMinimized(true)
  }

  const toggleMinimize = () => {
    if (!isOpen) {
      setIsOpen(true)
    }
    setIsMinimized(!isMinimized)
  }

  return (
    <ChatbotContext.Provider
      value={{
        isOpen,
        isMinimized,
        openChatbot,
        closeChatbot,
        toggleMinimize,
        setContext
      }}
    >
      {children}
      {isOpen && (
        <AIChatbot
          isMinimized={isMinimized}
          onToggleMinimize={toggleMinimize}
          onClose={closeChatbot}
          context={context}
        />
      )}
    </ChatbotContext.Provider>
  )
}