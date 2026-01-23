'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Send, Sparkles, MessageCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useZoe, ZoeMessage } from '@/contexts/ZoeContext'
import { Button } from '@/components/ui/button'

const EXAMPLE_PROMPTS = [
  'Show me low stock items',
  "What's in Warehouse A?",
  'Find items expiring soon',
  'Which items sold the most?',
]

// Placeholder responses for demo
const PLACEHOLDER_RESPONSES: Record<string, string> = {
  'low stock': "I found 12 items that are running low on stock. The most critical ones are:\n\n• USB-C Cables (5 left, min: 20)\n• Wireless Mouse (3 left, min: 10)\n• HDMI Adapters (2 left, min: 15)\n\nWould you like me to create a restock reminder?",
  'warehouse': "Warehouse A currently has 234 items across 18 categories. The top categories are:\n\n• Electronics (89 items)\n• Office Supplies (67 items)\n• Cables & Adapters (45 items)\n\nWant me to show you a detailed breakdown?",
  'expiring': "I found 8 items with upcoming expiration dates:\n\n• Batteries (expires in 30 days)\n• First Aid Kit (expires in 45 days)\n• Printer Ink (expires in 60 days)\n\nShould I set up alerts for these?",
  'sold': "Based on your recent activity, here are your top sellers:\n\n1. Laptop Stand Pro - 47 units\n2. USB-C Hub - 38 units\n3. Wireless Keyboard - 29 units\n\nWant to see the full sales report?",
  'default': "I'm still learning! This feature is coming soon. In the future, I'll be able to help you with:\n\n• Natural language inventory searches\n• Stock level insights\n• Reorder suggestions\n• Activity summaries\n\nStay tuned!",
}

function getPlaceholderResponse(query: string): string {
  const lowerQuery = query.toLowerCase()

  if (lowerQuery.includes('low') || lowerQuery.includes('stock')) {
    return PLACEHOLDER_RESPONSES['low stock']
  }
  if (lowerQuery.includes('warehouse')) {
    return PLACEHOLDER_RESPONSES['warehouse']
  }
  if (lowerQuery.includes('expir')) {
    return PLACEHOLDER_RESPONSES['expiring']
  }
  if (lowerQuery.includes('sold') || lowerQuery.includes('sell') || lowerQuery.includes('top')) {
    return PLACEHOLDER_RESPONSES['sold']
  }

  return PLACEHOLDER_RESPONSES['default']
}

function ZoeAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base',
  }

  return (
    <div className={cn(
      'flex items-center justify-center rounded-full',
      'bg-gradient-to-br from-violet-500 to-purple-600',
      'text-white font-semibold',
      sizeClasses[size]
    )}>
      Z
    </div>
  )
}

function MessageBubble({ message }: { message: ZoeMessage }) {
  const isUser = message.role === 'user'

  return (
    <div className={cn(
      'flex gap-3',
      isUser ? 'flex-row-reverse' : 'flex-row'
    )}>
      {!isUser && <ZoeAvatar size="sm" />}
      <div className={cn(
        'max-w-[80%] rounded-2xl px-4 py-2.5',
        isUser
          ? 'bg-primary text-white rounded-br-md'
          : 'bg-neutral-100 text-neutral-800 rounded-bl-md'
      )}>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  )
}

export function ZoeChatPanel() {
  const { isOpen, closeZoe, messages, addMessage, isLoading, setIsLoading } = useZoe()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    addMessage('user', userMessage)
    setIsLoading(true)

    // Simulate AI response delay
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000))

    const response = getPlaceholderResponse(userMessage)
    addMessage('assistant', response)
    setIsLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleExampleClick = (prompt: string) => {
    setInput(prompt)
    inputRef.current?.focus()
  }

  if (!mounted || !isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:p-6 pointer-events-none">
      {/* Backdrop - subtle, doesn't block interaction elsewhere */}
      <div
        className="absolute inset-0 bg-black/10 pointer-events-auto"
        onClick={closeZoe}
      />

      {/* Chat Panel */}
      <div
        className={cn(
          'relative pointer-events-auto',
          'w-full max-w-md h-[600px] max-h-[80vh]',
          'bg-white rounded-2xl shadow-2xl',
          'flex flex-col overflow-hidden',
          'animate-in slide-in-from-right-5 fade-in duration-300'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 bg-gradient-to-r from-violet-50 to-purple-50">
          <div className="flex items-center gap-3">
            <ZoeAvatar size="md" />
            <div>
              <h2 className="font-semibold text-neutral-900">Zoe</h2>
              <p className="text-xs text-neutral-500">Your AI Assistant</p>
            </div>
          </div>
          <button
            onClick={closeZoe}
            className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-neutral-200/50 transition-colors"
          >
            <X className="h-5 w-5 text-neutral-500" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            // Welcome state
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 mb-4">
                <Sparkles className="h-8 w-8 text-violet-600" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                Hi! I&apos;m Zoe
              </h3>
              <p className="text-sm text-neutral-500 mb-6">
                Your AI inventory assistant. Ask me anything about your stock, items, or reports!
              </p>

              <div className="w-full space-y-2">
                <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
                  Try asking:
                </p>
                {EXAMPLE_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleExampleClick(prompt)}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2',
                      'text-sm text-left text-neutral-600',
                      'bg-neutral-50 hover:bg-neutral-100',
                      'rounded-lg transition-colors'
                    )}
                  >
                    <MessageCircle className="h-4 w-4 text-neutral-400 shrink-0" />
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Message history
            <>
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <ZoeAvatar size="sm" />
                  <div className="bg-neutral-100 rounded-2xl rounded-bl-md px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Zoe..."
              disabled={isLoading}
              className={cn(
                'flex-1 px-4 py-2.5 text-sm',
                'bg-white border border-neutral-200 rounded-full',
                'placeholder:text-neutral-400',
                'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-10 w-10 rounded-full bg-violet-600 hover:bg-violet-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 text-xs text-center text-neutral-400">
            AI responses are simulated. Full AI coming soon!
          </p>
        </div>
      </div>
    </div>,
    document.body
  )
}
