'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export interface ZoeMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ZoeContextType {
  isOpen: boolean
  openZoe: () => void
  closeZoe: () => void
  toggleZoe: () => void
  messages: ZoeMessage[]
  addMessage: (role: 'user' | 'assistant', content: string) => void
  clearMessages: () => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

const ZoeContext = createContext<ZoeContextType | undefined>(undefined)

export function useZoe() {
  const context = useContext(ZoeContext)
  if (!context) {
    throw new Error('useZoe must be used within a ZoeProvider')
  }
  return context
}

interface ZoeProviderProps {
  children: ReactNode
}

export function ZoeProvider({ children }: ZoeProviderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ZoeMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const openZoe = useCallback(() => setIsOpen(true), [])
  const closeZoe = useCallback(() => setIsOpen(false), [])
  const toggleZoe = useCallback(() => setIsOpen((prev) => !prev), [])

  const addMessage = useCallback((role: 'user' | 'assistant', content: string) => {
    const newMessage: ZoeMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role,
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  return (
    <ZoeContext.Provider
      value={{
        isOpen,
        openZoe,
        closeZoe,
        toggleZoe,
        messages,
        addMessage,
        clearMessages,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </ZoeContext.Provider>
  )
}
