'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { AgentAvatar } from './AgentAvatar'

export interface Message {
  role: 'user' | 'assistant'
  content: string
  agent?: string
}

interface MessageListProps {
  messages: Message[]
}

export function MessageList({ messages }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Extract persona name from agent string (e.g., "wise_mentor:Marcus Aurelius")
  const getPersonaName = (agent?: string) => {
    if (!agent) return null
    if (agent.includes(':')) {
      return agent.split(':')[1]
    }
    return null
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto space-y-6 p-6 scroll-smooth"
      style={{ maxHeight: 'calc(100vh - 200px)' }}
    >
      {messages.map((message, index) => {
        const personaName = getPersonaName(message.agent)

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex gap-4 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <AgentAvatar agent={message.agent || 'orchestrator'} />
            )}

            <div
              className={`max-w-2xl p-4 rounded-lg border ${
                message.role === 'user'
                  ? 'border-terminal-accent bg-terminal-accent/10'
                  : 'border-terminal-muted bg-terminal-muted/5'
              }`}
            >
              {/* Show persona name if available */}
              {message.role === 'assistant' && personaName && (
                <p className="text-xs text-terminal-accent mb-2 font-semibold">
                  {personaName}
                </p>
              )}
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>

            {message.role === 'user' && (
              <div className="w-10 h-10 rounded-full border border-terminal-accent flex items-center justify-center flex-shrink-0">
                <span className="text-sm">YOU</span>
              </div>
            )}
          </motion.div>
        )
      })}

      {/* Invisible element to scroll to */}
      <div ref={messagesEndRef} />
    </div>
  )
}
