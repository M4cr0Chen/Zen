'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Palette, Waves } from 'lucide-react'
import { ParticleBackground } from '@/components/zen/ParticleBackground'
import { Navigation } from '@/components/zen/Navigation'

export default function Profile() {
  // In a real app, these would come from the API
  const stats = [
    { label: 'Meditation sessions', value: '23' },
    { label: 'Time reflecting', value: '8.5 hours' },
    { label: 'Journal entries', value: '47' },
  ]

  const [preferences, setPreferences] = useState([
    {
      id: 'background',
      icon: Palette,
      label: 'Background Style',
      options: ['Soft Sage', 'Warm Gray', 'Pale Teal'],
      selected: 'Soft Sage',
    },
    {
      id: 'motion',
      icon: Waves,
      label: 'Motion Intensity',
      options: ['Minimal', 'Gentle', 'Flowing'],
      selected: 'Gentle',
    },
  ])

  const updatePreference = (prefId: string, option: string) => {
    setPreferences((prev) =>
      prev.map((pref) =>
        pref.id === prefId ? { ...pref, selected: option } : pref
      )
    )
  }

  return (
    <div className="min-h-screen relative">
      <ParticleBackground />
      <Navigation />

      <div className="ml-20 relative z-10">
        <div className="min-h-screen flex items-center justify-center px-20 py-16">
          <div className="max-w-3xl w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <div className="text-center mb-16">
                <h1 className="mb-4">Your Journey</h1>
                <p className="text-lg" style={{ color: 'var(--color-text-light)' }}>
                  You&apos;ve spent time with yourself.
                </p>
              </div>

              {/* Stats */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className="p-8 rounded-3xl text-center"
                    style={{
                      background: 'rgba(255, 255, 255, 0.5)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(168, 201, 195, 0.2)',
                    }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                    whileHover={{
                      y: -5,
                      transition: { duration: 0.5 },
                    }}
                  >
                    <div
                      className="text-4xl font-light mb-3"
                      style={{ color: 'var(--color-teal)' }}
                    >
                      {stat.value}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--color-text-light)' }}>
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Preferences */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                <h3 className="mb-8" style={{ color: 'var(--color-teal)' }}>
                  Preferences
                </h3>

                <div className="space-y-6 mb-12">
                  {preferences.map((pref, index) => (
                    <motion.div
                      key={pref.id}
                      className="p-8 rounded-3xl"
                      style={{
                        background: 'rgba(255, 255, 255, 0.5)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(168, 201, 195, 0.2)',
                      }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <pref.icon
                          size={20}
                          strokeWidth={1.5}
                          style={{ color: 'var(--color-teal)' }}
                        />
                        <span className="font-medium">{pref.label}</span>
                      </div>

                      <div className="flex gap-3 flex-wrap">
                        {pref.options.map((option) => (
                          <motion.button
                            key={option}
                            onClick={() => updatePreference(pref.id, option)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ duration: 0.4 }}
                            className="px-6 py-3 rounded-full transition-all duration-500"
                            style={{
                              background:
                                pref.selected === option
                                  ? 'rgba(168, 201, 195, 0.3)'
                                  : 'rgba(168, 201, 195, 0.1)',
                              color:
                                pref.selected === option
                                  ? 'var(--color-teal)'
                                  : 'var(--color-text-light)',
                              border: `1px solid ${
                                pref.selected === option
                                  ? 'rgba(168, 201, 195, 0.5)'
                                  : 'rgba(168, 201, 195, 0.2)'
                              }`,
                            }}
                          >
                            {option}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Privacy Notice */}
                <motion.div
                  className="p-8 rounded-3xl"
                  style={{
                    background: 'rgba(212, 201, 224, 0.2)',
                    border: '1px solid rgba(212, 201, 224, 0.3)',
                  }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.8 }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'rgba(212, 201, 224, 0.3)',
                      }}
                    >
                      <Lock size={20} strokeWidth={1.5} style={{ color: 'var(--color-lavender)' }} />
                    </div>
                    <div>
                      <h3 className="mb-3" style={{ color: 'var(--color-lavender)' }}>
                        Your Privacy & Ownership
                      </h3>
                      <p
                        className="leading-relaxed"
                        style={{ color: 'var(--color-text-light)' }}
                      >
                        Everything you share here belongs to you. Your reflections, insights, and
                        journey are private and secure. We never share your data, and you can export
                        or delete it at any time.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
