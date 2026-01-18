'use client'

import { motion } from 'framer-motion'
import { Home, BookOpen, MessageCircle, Flower2, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { id: '/', icon: Home, label: 'Home' },
    { id: '/journal', icon: BookOpen, label: 'Journal' },
    { id: '/counsel', icon: MessageCircle, label: 'Counsel' },
    { id: '/meditation', icon: Flower2, label: 'Meditation' },
    { id: '/profile', icon: User, label: 'Profile' },
  ]

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  return (
    <motion.nav
      initial={{ x: -80 }}
      animate={{ x: 0 }}
      className="fixed left-0 top-0 h-full w-20 flex flex-col items-center py-8 z-50"
      style={{
        background: 'rgba(255, 255, 255, 0.4)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(168, 201, 195, 0.2)',
      }}
    >
      <div className="mb-12">
        <motion.div
          className="text-2xl font-light"
          style={{ color: 'var(--color-teal)' }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.5 }}
        >
          禅
        </motion.div>
      </div>

      <div className="flex-1 flex flex-col gap-8">
        {navItems.map((item) => (
          <Link key={item.id} href={item.id}>
            <motion.div
              className="relative flex flex-col items-center gap-1 group cursor-pointer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            >
              <item.icon
                size={24}
                strokeWidth={1.5}
                style={{
                  color: isActive(item.id)
                    ? 'var(--color-teal)'
                    : 'var(--color-text-light)',
                  transition: 'color 0.5s ease',
                }}
              />
              <span
                className="text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ color: 'var(--color-text-light)' }}
              >
                {item.label}
              </span>
              {isActive(item.id) && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute -right-5 w-1 h-8 rounded-full"
                  style={{ background: 'var(--color-teal)' }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                />
              )}
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.nav>
  )
}
