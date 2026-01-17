'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Sparkles,
  Send,
  Loader2,
  Bot,
  User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export default function AIAssistantPage() {
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chatLoading, setChatLoading] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  async function handleChat(e: React.FormEvent) {
    e.preventDefault()
    if (!chatInput.trim() || chatLoading) return

    const userMessage = chatInput.trim()
    setChatInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setChatLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            content: m.content
          }))
        })
      })
      const data = await response.json()
      if (data.error) {
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.error}` }])
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response || 'No response received' }])
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.'
      }])
    } finally {
      setChatLoading(false)
    }
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white px-4 sm:px-8 py-4 sm:py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/90 text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-neutral-900">Ask Zoe</h1>
            <p className="text-sm text-neutral-500">
              Your AI inventory assistant
            </p>
          </div>
        </div>
      </div>

      {/* Main Content - Chat Only */}
      <div className="flex-1 overflow-hidden flex justify-center p-4 sm:p-6">
        <div className="w-full max-w-3xl flex flex-col min-h-0 rounded-2xl border border-neutral-200 bg-white overflow-hidden">
          {/* Chat Header */}
          <div className="flex items-center gap-4 px-4 sm:px-6 py-4 border-b border-neutral-200 bg-neutral-50/50">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">Zoe</h3>
              <p className="text-xs text-primary font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                Analyzing your inventory
              </p>
            </div>
          </div>

          {/* Chat Messages */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-neutral-50/30"
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-20 h-20 bg-white rounded-2xl shadow-inner flex items-center justify-center text-4xl text-neutral-200 mb-6">
                  <Sparkles className="h-10 w-10" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">How can I help today?</h3>
                <p className="text-sm text-neutral-500 max-w-md">
                  Ask me about your inventory, stock levels, or trends. Try:
                </p>
                <div className="mt-4 space-y-2">
                  {[
                    'What items are running low?',
                    'Show me inventory summary',
                    'Which products need reordering?'
                  ].map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => setChatInput(suggestion)}
                      className="block w-full text-sm text-primary hover:text-primary hover:underline"
                    >
                      &quot;{suggestion}&quot;
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      msg.role === 'user' ? 'bg-primary/20 text-primary' : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div className={`px-4 py-3 rounded-2xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-primary text-white rounded-tr-none'
                        : 'bg-white border border-neutral-200 text-neutral-800 rounded-tl-none'
                    }`}>
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-white border border-neutral-200 px-4 py-3 rounded-2xl rounded-tl-none">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-neutral-200 bg-white">
            <form onSubmit={handleChat} className="flex items-center gap-3">
              <Input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about your inventory..."
                className="flex-1"
                disabled={chatLoading}
              />
              <Button type="submit" disabled={chatLoading || !chatInput.trim()}>
                {chatLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
