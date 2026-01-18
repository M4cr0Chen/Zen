'use client'

import { motion } from 'framer-motion'
import { BookOpen, MessageCircle, Flower2 } from 'lucide-react'
import Link from 'next/link'
import { ParticleBackground } from '@/components/zen/ParticleBackground'
import { Navigation } from '@/components/zen/Navigation'

export default function Home() {
  const cards = [
    {
      id: 'journal',
      title: 'Journal',
      subtitle: 'Build your digital self',
      icon: BookOpen,
      color: 'var(--color-teal)',
      href: '/journal',
    },
    {
      id: 'counsel',
      title: 'Counsel',
      subtitle: 'Talk it through',
      icon: MessageCircle,
      color: 'var(--color-lavender)',
      href: '/counsel',
    },
    {
      id: 'meditation',
      title: 'Meditation',
      subtitle: 'Return to presence',
      icon: Flower2,
      color: 'var(--color-gold)',
      href: '/meditation',
    },
  ]

  return (
    <div className="min-h-screen relative">
      <ParticleBackground />
      <Navigation />

      <div className="ml-20 relative z-10">
        <div className="min-h-screen flex items-center justify-center px-20">
          <div className="max-w-6xl w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="text-center mb-20"
            >
              <h1 className="mb-4">Welcome back.</h1>
              <p className="text-xl" style={{ color: 'var(--color-text-light)' }}>
                Where would you like to begin?
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {cards.map((card, index) => (
                <Link key={card.id} href={card.href}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 1,
                      delay: index * 0.2,
                      ease: 'easeOut',
                    }}
                    whileHover={{
                      y: -8,
                      transition: { duration: 0.6, ease: 'easeOut' },
                    }}
                    className="relative p-12 rounded-3xl text-left overflow-hidden group cursor-pointer"
                    style={{
                      background: 'rgba(255, 255, 255, 0.5)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(168, 201, 195, 0.2)',
                    }}
                  >
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100"
                      style={{
                        background: `radial-gradient(circle at 50% 50%, ${card.color}15 0%, transparent 70%)`,
                      }}
                      transition={{ duration: 0.8, ease: 'easeInOut' }}
                    />

                    <div className="relative z-10">
                      <motion.div
                        className="mb-6"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.5 }}
                      >
                        <card.icon
                          size={40}
                          strokeWidth={1.5}
                          style={{ color: card.color }}
                        />
                      </motion.div>

                      <h2 className="mb-2">{card.title}</h2>
                      <p
                        className="text-lg"
                        style={{ color: 'var(--color-text-light)' }}
                      >
                        {card.subtitle}
                      </p>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
