'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'
import { ParticleBackground } from '@/components/zen/ParticleBackground'
import { Navigation } from '@/components/zen/Navigation'

export default function Meditation() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(10) // minutes
  const [timeRemaining, setTimeRemaining] = useState(600) // seconds
  const [isMuted, setIsMuted] = useState(false)
  const [currentPhrase, setCurrentPhrase] = useState(0)

  const phrases = [
    'Notice your breath.',
    "You don't need to fix anything.",
    'Simply be here.',
    'Let thoughts pass like clouds.',
    'You are enough, right now.',
  ]

  const durations = [5, 10, 15, 20, 30]

  useEffect(() => {
    setTimeRemaining(duration * 60)
  }, [duration])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => prev - 1)
      }, 1000)
    } else if (timeRemaining === 0) {
      setIsPlaying(false)
    }
    return () => clearInterval(interval)
  }, [isPlaying, timeRemaining])

  useEffect(() => {
    if (isPlaying) {
      const phraseInterval = setInterval(() => {
        setCurrentPhrase((prev) => (prev + 1) % phrases.length)
      }, 15000)
      return () => clearInterval(phraseInterval)
    }
  }, [isPlaying, phrases.length])

  const togglePlay = () => {
    if (timeRemaining === 0) {
      setTimeRemaining(duration * 60)
    }
    setIsPlaying(!isPlaying)
  }

  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60
  const progress = 1 - timeRemaining / (duration * 60)

  return (
    <div className="min-h-screen relative">
      <ParticleBackground />
      <Navigation />

      <div className="ml-20 relative z-10">
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-20 py-16">
          {/* Animated Background Waves */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(circle at 50% 50%, rgba(168, 201, 195, ${
                    0.05 + i * 0.03
                  }) 0%, transparent 70%)`,
                }}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.4, 0.7, 0.4],
                }}
                transition={{
                  duration: 10 + i * 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 2,
                }}
              />
            ))}
          </div>

          {/* Breathing Particles */}
          {isPlaying && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    background: 'rgba(168, 201, 195, 0.5)',
                    left: '50%',
                    top: '50%',
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    x: Math.cos((i * Math.PI * 2) / 8) * 200,
                    y: Math.sin((i * Math.PI * 2) / 8) * 200,
                    opacity: [0, 0.8, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: (i * 6) / 8,
                  }}
                />
              ))}
            </div>
          )}

          {/* Main Content */}
          <div className="relative z-10 text-center w-full max-w-2xl">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="mb-16"
            >
              Meditation
            </motion.h2>

            {/* Breathing Circle */}
            <motion.div
              className="relative w-96 h-96 mx-auto mb-16"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              {/* Outer ring */}
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(168, 201, 195, 0.2)"
                  strokeWidth="0.5"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="var(--color-teal)"
                  strokeWidth="0.5"
                  strokeDasharray="283"
                  strokeDashoffset={283 * (1 - progress)}
                  strokeLinecap="round"
                  transition={{ duration: 0.5 }}
                />
              </svg>

              {/* Inner breathing circle */}
              <motion.div
                className="absolute inset-0 m-auto rounded-full"
                style={{
                  width: '240px',
                  height: '240px',
                  background: 'rgba(168, 201, 195, 0.15)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(168, 201, 195, 0.3)',
                }}
                animate={
                  isPlaying
                    ? {
                        scale: [1, 1.15, 1],
                      }
                    : { scale: 1 }
                }
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              {/* Time Display */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="text-6xl font-light"
                  style={{ color: 'var(--color-teal)' }}
                  animate={isPlaying ? { opacity: [0.6, 1, 0.6] } : { opacity: 1 }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </motion.div>
              </div>
            </motion.div>

            {/* Guided Text - Fixed height container */}
            <div className="mb-16 h-20 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {isPlaying && (
                  <motion.div
                    key={currentPhrase}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 1.5, ease: 'easeInOut' }}
                  >
                    <p
                      className="text-2xl font-light serif"
                      style={{ color: 'var(--color-text-light)' }}
                    >
                      {phrases[currentPhrase]}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Controls - Fixed layout */}
            <div className="h-16 flex items-center justify-center gap-8">
              <AnimatePresence mode="wait">
                {!isPlaying && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex gap-3"
                  >
                    {durations.map((d) => (
                      <motion.button
                        key={d}
                        onClick={() => setDuration(d)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 rounded-full transition-all duration-500"
                        style={{
                          background:
                            duration === d
                              ? 'rgba(168, 201, 195, 0.3)'
                              : 'rgba(168, 201, 195, 0.1)',
                          color:
                            duration === d ? 'var(--color-teal)' : 'var(--color-text-light)',
                          border: `1px solid ${
                            duration === d
                              ? 'rgba(168, 201, 195, 0.5)'
                              : 'rgba(168, 201, 195, 0.2)'
                          }`,
                        }}
                      >
                        {d} min
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                onClick={togglePlay}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'rgba(168, 201, 195, 0.3)',
                  border: '1px solid rgba(168, 201, 195, 0.4)',
                }}
              >
                {isPlaying ? (
                  <Pause size={24} strokeWidth={1.5} style={{ color: 'var(--color-teal)' }} />
                ) : (
                  <Play
                    size={24}
                    strokeWidth={1.5}
                    style={{ color: 'var(--color-teal)', marginLeft: '2px' }}
                  />
                )}
              </motion.button>

              <motion.button
                onClick={() => setIsMuted(!isMuted)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'rgba(168, 201, 195, 0.2)',
                  border: '1px solid rgba(168, 201, 195, 0.3)',
                }}
              >
                {isMuted ? (
                  <VolumeX
                    size={20}
                    strokeWidth={1.5}
                    style={{ color: 'var(--color-text-light)' }}
                  />
                ) : (
                  <Volume2 size={20} strokeWidth={1.5} style={{ color: 'var(--color-teal)' }} />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
