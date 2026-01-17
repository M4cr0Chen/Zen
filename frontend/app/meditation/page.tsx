'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Circle,
  Play,
  Square,
  Waves,
  Heart,
  Wind,
  User,
  Eye,
  Sun,
  Volume2,
  VolumeX,
  Check,
  SkipForward,
} from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

interface Stage {
  id: string
  name: string
  duration: number
  icon: string
  description: string
}

const STAGE_ICONS: { [key: string]: React.ReactNode } = {
  heart: <Heart className="w-5 h-5" />,
  wind: <Wind className="w-5 h-5" />,
  user: <User className="w-5 h-5" />,
  eye: <Eye className="w-5 h-5" />,
  sun: <Sun className="w-5 h-5" />,
}

export default function MeditationPage() {
  const [stages, setStages] = useState<Stage[]>([])
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [currentStageIndex, setCurrentStageIndex] = useState(-1)
  const [stageContent, setStageContent] = useState('')
  const [stageProgress, setStageProgress] = useState(0)
  const [completedStages, setCompletedStages] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [sessionComplete, setSessionComplete] = useState(false)

  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Fetch stages on mount
  useEffect(() => {
    fetchStages()
  }, [])

  const fetchStages = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/meditation/stages`)
      if (response.ok) {
        const data = await response.json()
        setStages(data.stages)
      }
    } catch (error) {
      console.error('[MEDITATION] Failed to fetch stages:', error)
      // Use fallback stages
      setStages([
        { id: 'welcome', name: 'Welcome', duration: 30, icon: 'heart', description: 'Setting intentions' },
        { id: 'breathing', name: 'Breathing', duration: 120, icon: 'wind', description: 'Deep breathing exercises' },
        { id: 'bodyscan', name: 'Body Scan', duration: 90, icon: 'user', description: 'Release physical tension' },
        { id: 'visualization', name: 'Visualization', duration: 90, icon: 'eye', description: 'Peaceful imagery' },
        { id: 'closing', name: 'Closing', duration: 30, icon: 'sun', description: 'Gentle return' },
      ])
    }
  }

  const speakText = useCallback((text: string) => {
    if (!audioEnabled || typeof window === 'undefined') return

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.85 // Slower for meditation
    utterance.pitch = 0.9
    utterance.volume = 0.8

    // Try to find a calm-sounding voice
    const voices = window.speechSynthesis.getVoices()
    const preferredVoice = voices.find(
      (v) => v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Google')
    )
    if (preferredVoice) {
      utterance.voice = preferredVoice
    }

    speechSynthRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }, [audioEnabled])

  const startStage = async (stageIndex: number) => {
    if (stageIndex >= stages.length) {
      // Session complete
      setSessionComplete(true)
      setIsSessionActive(false)
      speakText('Your meditation session is complete. Namaste.')
      return
    }

    const stage = stages[stageIndex]
    setCurrentStageIndex(stageIndex)
    setStageProgress(0)
    setIsLoading(true)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/meditation/stage/${stage.id}/content`
      )
      if (response.ok) {
        const data = await response.json()
        setStageContent(data.content)
        speakText(data.content)
      }
    } catch (error) {
      console.error('[MEDITATION] Failed to fetch stage content:', error)
      setStageContent(`Beginning ${stage.name}... Take a deep breath and relax.`)
    } finally {
      setIsLoading(false)
    }

    // Start progress timer
    const startTime = Date.now()
    const duration = stage.duration * 1000

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min((elapsed / duration) * 100, 100)
      setStageProgress(progress)

      if (progress >= 100) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current)
        }
        // Mark stage as complete
        setCompletedStages((prev) => new Set([...prev, stage.id]))
        // Auto-advance to next stage after a brief pause
        setTimeout(() => {
          startStage(stageIndex + 1)
        }, 1000)
      }
    }, 100)
  }

  const startSession = () => {
    setIsSessionActive(true)
    setSessionComplete(false)
    setCompletedStages(new Set())
    setCurrentStageIndex(-1)
    startStage(0)
  }

  const stopSession = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }
    window.speechSynthesis.cancel()
    setIsSessionActive(false)
    setCurrentStageIndex(-1)
    setStageContent('')
    setStageProgress(0)
  }

  const skipToStage = (index: number) => {
    if (!isSessionActive || index === currentStageIndex) return
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }
    window.speechSynthesis.cancel()
    startStage(index)
  }

  const toggleAudio = () => {
    if (audioEnabled) {
      window.speechSynthesis.cancel()
    }
    setAudioEnabled(!audioEnabled)
  }

  const totalDuration = stages.reduce((sum, s) => sum + s.duration, 0)
  const currentStage = currentStageIndex >= 0 ? stages[currentStageIndex] : null

  // Calculate overall progress
  const overallProgress = (() => {
    if (!isSessionActive || currentStageIndex < 0) return 0
    const completedTime = stages
      .slice(0, currentStageIndex)
      .reduce((sum, s) => sum + s.duration, 0)
    const currentStageTime = currentStage
      ? (stageProgress / 100) * currentStage.duration
      : 0
    return ((completedTime + currentStageTime) / totalDuration) * 100
  })()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-terminal-muted p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Waves className="w-8 h-8 terminal-glow" />
            <div>
              <h1 className="text-2xl font-bold terminal-glow">MEDITATION SESSION</h1>
              <p className="text-sm text-terminal-muted">
                {Math.floor(totalDuration / 60)} minute guided meditation
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleAudio}
              className="p-2 border border-terminal-muted hover:border-terminal-accent transition-all"
              title={audioEnabled ? 'Mute audio' : 'Enable audio'}
            >
              {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <Link
              href="/council"
              className="px-4 py-2 border border-terminal-muted hover:border-terminal-accent transition-all"
            >
              BACK TO COUNCIL
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-3xl w-full space-y-8">
          {/* Progress Circle */}
          <div className="flex justify-center">
            <div className="relative">
              {/* Background circle */}
              <svg className="w-64 h-64 transform -rotate-90">
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-terminal-muted/20"
                />
                {/* Progress arc */}
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  className="text-terminal-accent transition-all duration-300"
                  strokeDasharray={`${2 * Math.PI * 120}`}
                  strokeDashoffset={`${2 * Math.PI * 120 * (1 - overallProgress / 100)}`}
                />
              </svg>

              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                  {sessionComplete ? (
                    <motion.div
                      key="complete"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-center"
                    >
                      <Check className="w-16 h-16 text-terminal-accent mx-auto mb-2" />
                      <p className="text-lg font-bold">Complete</p>
                    </motion.div>
                  ) : isSessionActive && currentStage ? (
                    <motion.div
                      key={currentStage.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center"
                    >
                      <div className="text-terminal-accent mb-2">
                        {STAGE_ICONS[currentStage.icon]}
                      </div>
                      <p className="text-lg font-bold">{currentStage.name}</p>
                      <p className="text-sm text-terminal-muted">
                        {Math.ceil((currentStage.duration * (100 - stageProgress)) / 100)}s
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center"
                    >
                      <Circle className="w-16 h-16 text-terminal-muted mx-auto mb-2" />
                      <p className="text-sm text-terminal-muted">Ready</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Stage Milestones */}
          <div className="flex justify-center gap-2">
            {stages.map((stage, index) => {
              const isCompleted = completedStages.has(stage.id)
              const isCurrent = index === currentStageIndex
              const isClickable = isSessionActive && !isCompleted

              return (
                <button
                  key={stage.id}
                  onClick={() => skipToStage(index)}
                  disabled={!isClickable}
                  className={`
                    flex flex-col items-center p-3 rounded-lg border transition-all
                    ${
                      isCompleted
                        ? 'border-terminal-accent bg-terminal-accent/20 text-terminal-accent'
                        : isCurrent
                        ? 'border-terminal-accent bg-terminal-accent/10 animate-pulse'
                        : 'border-terminal-muted/50 hover:border-terminal-muted'
                    }
                    ${isClickable ? 'cursor-pointer' : 'cursor-default'}
                  `}
                  title={stage.description}
                >
                  <div className={isCompleted ? 'text-terminal-accent' : 'text-terminal-muted'}>
                    {isCompleted ? <Check className="w-5 h-5" /> : STAGE_ICONS[stage.icon]}
                  </div>
                  <span className="text-xs mt-1">{stage.name}</span>
                </button>
              )
            })}
          </div>

          {/* Stage Content / Transcript */}
          <AnimatePresence mode="wait">
            {stageContent && isSessionActive && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="border border-terminal-muted p-6 rounded-lg max-h-48 overflow-y-auto"
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{stageContent}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            {!isSessionActive ? (
              <button
                onClick={startSession}
                disabled={stages.length === 0}
                className="px-8 py-4 border-2 border-terminal-accent bg-terminal-accent/10 hover:bg-terminal-accent hover:text-terminal-bg transition-all duration-300 flex items-center gap-3 disabled:opacity-50"
              >
                <Play className="w-6 h-6" />
                {sessionComplete ? 'START AGAIN' : 'START SESSION'}
              </button>
            ) : (
              <>
                <button
                  onClick={() => skipToStage(currentStageIndex + 1)}
                  className="px-6 py-4 border border-terminal-muted hover:border-terminal-accent transition-all flex items-center gap-2"
                >
                  <SkipForward className="w-5 h-5" />
                  SKIP
                </button>
                <button
                  onClick={stopSession}
                  className="px-8 py-4 border-2 border-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white transition-all duration-300 flex items-center gap-3"
                >
                  <Square className="w-6 h-6" />
                  END SESSION
                </button>
              </>
            )}
          </div>

          {/* Instructions */}
          {!isSessionActive && (
            <div className="text-center text-sm text-terminal-muted space-y-2">
              <p>Find a quiet space. Put on headphones for the best experience.</p>
              <p className="text-xs">
                {audioEnabled
                  ? 'Audio guidance is enabled - the meditation will be spoken aloud'
                  : 'Audio is muted - click the speaker icon to enable voice guidance'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
