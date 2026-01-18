'use client'

import { motion } from 'framer-motion'
import { ParticleBackground } from '@/components/zen/ParticleBackground'
import { Navigation } from '@/components/zen/Navigation'

export default function DigitalSelf() {
  // In a real app, this would come from the API based on journal analysis
  const insights = {
    coreValues: [
      'Authenticity',
      'Growth',
      'Connection',
      'Compassion',
      'Curiosity',
    ],
    emotionalPatterns: [
      'You often find peace in solitude',
      'Uncertainty precedes your moments of growth',
      'Gratitude appears in quiet observations',
    ],
    identityThemes: [
      'The Observer',
      'The Learner',
      'The Seeker',
      'The Gentle Warrior',
    ],
    tensions: [
      'Between doing and being',
      'Between certainty and exploration',
      'Between connection and solitude',
    ],
  }

  const floatingKeywords = [
    { word: 'present', x: 15, y: 20, delay: 0 },
    { word: 'tender', x: 75, y: 15, delay: 0.3 },
    { word: 'seeking', x: 45, y: 70, delay: 0.6 },
    { word: 'authentic', x: 25, y: 85, delay: 0.9 },
    { word: 'evolving', x: 80, y: 60, delay: 1.2 },
  ]

  return (
    <div className="min-h-screen relative">
      <ParticleBackground />
      <Navigation />

      <div className="ml-20 relative z-10">
        <div className="min-h-screen flex items-center justify-center px-20 py-16">
          <div className="max-w-5xl w-full relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: 'easeOut' }}
            >
              <div className="text-center mb-16">
                <h1 className="mb-3">Your Inner Landscape</h1>
                <p className="text-lg serif" style={{ color: 'var(--color-text-light)' }}>
                  A gentle reflection of who you&apos;re becoming
                </p>
              </div>

              {/* Floating Keywords */}
              <div className="relative h-64 mb-16">
                {floatingKeywords.map((item, index) => (
                  <motion.div
                    key={index}
                    className="absolute text-2xl font-light"
                    style={{
                      left: `${item.x}%`,
                      top: `${item.y}%`,
                      color: 'var(--color-teal)',
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                      scale: [1, 1.1, 1],
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 6,
                      delay: item.delay,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    {item.word}
                  </motion.div>
                ))}
              </div>

              {/* Core Values */}
              <motion.div
                className="mb-12 p-10 rounded-3xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.5)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(168, 201, 195, 0.2)',
                }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
              >
                <h3 className="mb-6" style={{ color: 'var(--color-teal)' }}>
                  Core Values
                </h3>
                <div className="flex flex-wrap gap-4">
                  {insights.coreValues.map((value, index) => (
                    <motion.div
                      key={value}
                      className="px-6 py-3 rounded-full"
                      style={{
                        background: 'rgba(168, 201, 195, 0.2)',
                        border: '1px solid rgba(168, 201, 195, 0.3)',
                      }}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                    >
                      {value}
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Emotional Patterns */}
              <motion.div
                className="mb-12 p-10 rounded-3xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.5)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(212, 201, 224, 0.2)',
                }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                <h3 className="mb-6" style={{ color: 'var(--color-lavender)' }}>
                  Emotional Patterns
                </h3>
                <div className="space-y-4">
                  {insights.emotionalPatterns.map((pattern, index) => (
                    <motion.p
                      key={index}
                      className="text-lg serif"
                      style={{ color: 'var(--color-text)' }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 0.7 + index * 0.2 }}
                    >
                      {pattern}
                    </motion.p>
                  ))}
                </div>
              </motion.div>

              {/* Identity Themes & Tensions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <motion.div
                  className="p-10 rounded-3xl"
                  style={{
                    background: 'rgba(255, 255, 255, 0.5)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(168, 201, 195, 0.2)',
                  }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.7 }}
                >
                  <h3 className="mb-6" style={{ color: 'var(--color-teal)' }}>
                    Identity Themes
                  </h3>
                  <div className="space-y-3">
                    {insights.identityThemes.map((theme, index) => (
                      <motion.div
                        key={theme}
                        className="text-lg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.9 + index * 0.15 }}
                      >
                        {theme}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  className="p-10 rounded-3xl"
                  style={{
                    background: 'rgba(255, 255, 255, 0.5)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(232, 217, 184, 0.2)',
                  }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.9 }}
                >
                  <h3 className="mb-6" style={{ color: 'var(--color-gold)' }}>
                    Tensions & Growth
                  </h3>
                  <div className="space-y-3">
                    {insights.tensions.map((tension, index) => (
                      <motion.div
                        key={tension}
                        className="text-lg serif"
                        style={{ color: 'var(--color-text-light)' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 1.1 + index * 0.15 }}
                      >
                        {tension}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
