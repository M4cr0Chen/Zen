'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import Link from 'next/link'
import { ParticleBackground } from '@/components/zen/ParticleBackground'
import { Navigation } from '@/components/zen/Navigation'

export default function Journal() {
  const [entry, setEntry] = useState('')
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
  const [showSaved, setShowSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const emotions = [
    'peaceful',
    'anxious',
    'hopeful',
    'uncertain',
    'grateful',
    'restless',
    'curious',
    'tender',
  ]

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions((prev) =>
      prev.includes(emotion)
        ? prev.filter((e) => e !== emotion)
        : [...prev, emotion]
    )
  }

  const handleSave = async () => {
    if (!entry.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/journal/ingest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: entry,
          emotions: selectedEmotions,
        }),
      })

      if (response.ok) {
        setShowSaved(true)
        setTimeout(() => {
          setShowSaved(false)
          setEntry('')
          setSelectedEmotions([])
        }, 2000)
      }
    } catch (error) {
      console.error('Error saving journal entry:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative">
      <ParticleBackground />
      <Navigation />

      <div className="ml-20 relative z-10">
        <div className="min-h-screen flex items-center justify-center px-20 py-16">
          <div className="max-w-4xl w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: 'easeOut' }}
            >
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className="mb-2">Your Journal</h2>
                  <p style={{ color: 'var(--color-text-light)' }}>
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                <Link href="/digital-self">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    className="flex items-center gap-2 px-6 py-3 rounded-full cursor-pointer"
                    style={{
                      background: 'rgba(168, 201, 195, 0.2)',
                      color: 'var(--color-teal)',
                      border: '1px solid rgba(168, 201, 195, 0.3)',
                    }}
                  >
                    <Sparkles size={18} strokeWidth={1.5} />
                    <span>View Your Inner Landscape</span>
                  </motion.div>
                </Link>
              </div>

              <motion.div
                className="rounded-3xl p-12 mb-8"
                style={{
                  background: 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(168, 201, 195, 0.2)',
                }}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
              >
                <textarea
                  value={entry}
                  onChange={(e) => setEntry(e.target.value)}
                  placeholder="Write freely. This space remembers gently."
                  className="w-full h-96 bg-transparent border-none outline-none resize-none text-lg"
                  style={{
                    color: 'var(--color-text)',
                    lineHeight: '2',
                  }}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.4 }}
                className="flex items-center justify-between"
              >
                <div className="flex flex-wrap gap-3">
                  {emotions.map((emotion, index) => (
                    <motion.button
                      key={emotion}
                      onClick={() => toggleEmotion(emotion)}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 + index * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-5 py-2 rounded-full text-sm transition-all duration-500"
                      style={{
                        background: selectedEmotions.includes(emotion)
                          ? 'rgba(168, 201, 195, 0.3)'
                          : 'rgba(168, 201, 195, 0.1)',
                        color: selectedEmotions.includes(emotion)
                          ? 'var(--color-teal)'
                          : 'var(--color-text-light)',
                        border: `1px solid ${
                          selectedEmotions.includes(emotion)
                            ? 'rgba(168, 201, 195, 0.5)'
                            : 'rgba(168, 201, 195, 0.2)'
                        }`,
                      }}
                    >
                      {emotion}
                    </motion.button>
                  ))}
                </div>

                <motion.button
                  onClick={handleSave}
                  disabled={isLoading || !entry.trim()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="px-8 py-3 rounded-full text-sm relative overflow-hidden disabled:opacity-50"
                  style={{
                    background: 'rgba(168, 201, 195, 0.3)',
                    color: 'var(--color-teal)',
                    border: '1px solid rgba(168, 201, 195, 0.4)',
                  }}
                >
                  {showSaved ? (
                    <motion.span
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      Saved
                    </motion.span>
                  ) : isLoading ? (
                    'Saving...'
                  ) : (
                    'Save'
                  )}
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
