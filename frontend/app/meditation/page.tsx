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
  Pause,
  Music,
  Send,
  Sparkles,
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
  const [isPaused, setIsPaused] = useState(false)
  const [currentStageIndex, setCurrentStageIndex] = useState(-1)
  const [stageContent, setStageContent] = useState('')
  const [stageProgress, setStageProgress] = useState(0)
  const [completedStages, setCompletedStages] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [musicEnabled, setMusicEnabled] = useState(true)
  const [sessionComplete, setSessionComplete] = useState(false)
  const [showReflection, setShowReflection] = useState(false)
  const [reflectionText, setReflectionText] = useState('')
  const [reflectionInsight, setReflectionInsight] = useState('')
  const [isSavingReflection, setIsSavingReflection] = useState(false)

  // Refs for independent audio processes
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pausedAtRef = useRef<number>(0)
  const stageStartTimeRef = useRef<number>(0)
  const musicRef = useRef<HTMLAudioElement | null>(null)
  const voiceEnabledRef = useRef(true) // Track voice state for async operations
  const currentStageContentRef = useRef('') // Store current content for re-speaking

  // Keep voiceEnabledRef in sync
  useEffect(() => {
    voiceEnabledRef.current = voiceEnabled
  }, [voiceEnabled])

  // ==================== MUSIC FUNCTIONS (Independent) ====================

  const initMusic = useCallback(() => {
    if (!musicRef.current) {
      musicRef.current = new Audio()
      musicRef.current.loop = true
      musicRef.current.volume = 0.3
      // Placeholder path - user should add their own music file
      musicRef.current.src = '/audio/meditation-ambient.mp3'
    }
  }, [])

  const startMusic = useCallback(() => {
    if (!musicRef.current) initMusic()
    if (musicRef.current && musicEnabled) {
      musicRef.current.play().catch((e) => {
        console.log('[MEDITATION] Background music not available (placeholder)')
      })
    }
  }, [musicEnabled, initMusic])

  const pauseMusic = useCallback(() => {
    if (musicRef.current) {
      musicRef.current.pause()
    }
  }, [])

  const resumeMusic = useCallback(() => {
    if (musicRef.current && musicEnabled) {
      musicRef.current.play().catch(() => {})
    }
  }, [musicEnabled])

  const stopMusic = useCallback(() => {
    if (musicRef.current) {
      musicRef.current.pause()
      musicRef.current.currentTime = 0
    }
  }, [])

  // Toggle music - independent of voice
  const toggleMusic = useCallback(() => {
    if (musicEnabled) {
      pauseMusic()
    } else {
      if (isSessionActive && !isPaused) {
        resumeMusic()
      }
    }
    setMusicEnabled(!musicEnabled)
  }, [musicEnabled, isSessionActive, isPaused, pauseMusic, resumeMusic])

  // ==================== VOICE FUNCTIONS (Independent) ====================

  const stopVoice = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.speechSynthesis.cancel()
    }
  }, [])

  const speakText = useCallback((text: string) => {
    if (typeof window === 'undefined') return

    // Always cancel previous speech first
    window.speechSynthesis.cancel()

    // Check current voice state (use ref for most up-to-date value)
    if (!voiceEnabledRef.current) return

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.75
    utterance.pitch = 0.85
    utterance.volume = 0.85

    // Try to find a calm-sounding voice
    const voices = window.speechSynthesis.getVoices()
    const preferredVoice = voices.find(
      (v) =>
        v.name.includes('Samantha') ||
        v.name.includes('Karen') ||
        v.name.includes('Moira') ||
        v.name.includes('Google UK English Female')
    )
    if (preferredVoice) {
      utterance.voice = preferredVoice
    }

    window.speechSynthesis.speak(utterance)
  }, [])

  const pauseVoice = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.speechSynthesis.pause()
    }
  }, [])

  const resumeVoice = useCallback(() => {
    if (typeof window !== 'undefined' && voiceEnabled) {
      window.speechSynthesis.resume()
    }
  }, [voiceEnabled])

  // Toggle voice - independent of music
  const toggleVoice = useCallback(() => {
    if (voiceEnabled) {
      // Turning off - stop current speech
      stopVoice()
    }
    // When turning back on, voice will work for the next content
    // (we don't re-speak current content to avoid jarring experience)
    setVoiceEnabled(!voiceEnabled)
  }, [voiceEnabled, stopVoice])

  // ==================== SESSION CLEANUP ====================

  const cleanupSession = useCallback(() => {
    // Stop voice
    stopVoice()
    // Stop music
    stopMusic()
    // Clear progress interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
  }, [stopVoice, stopMusic])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupSession()
    }
  }, [cleanupSession])

  // Cleanup on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      cleanupSession()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [cleanupSession])

  // ==================== STAGE MANAGEMENT ====================

  // Fetch stages on mount
  useEffect(() => {
    fetchStages()
    // Pre-load voices
    if (typeof window !== 'undefined') {
      window.speechSynthesis.getVoices()
    }
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
      setStages([
        { id: 'welcome', name: 'Welcome', duration: 30, icon: 'heart', description: 'Setting intentions' },
        { id: 'breathing', name: 'Breathing', duration: 120, icon: 'wind', description: 'Deep breathing exercises' },
        { id: 'bodyscan', name: 'Body Scan', duration: 90, icon: 'user', description: 'Release physical tension' },
        { id: 'visualization', name: 'Visualization', duration: 90, icon: 'eye', description: 'Peaceful imagery' },
        { id: 'closing', name: 'Closing', duration: 30, icon: 'sun', description: 'Gentle return' },
      ])
    }
  }

  const startStage = useCallback(async (stageIndex: number) => {
    if (stageIndex >= stages.length) {
      // Session complete
      stopVoice() // Only stop voice, music continues until reflection is done
      setSessionComplete(true)
      setIsSessionActive(false)
      setShowReflection(true)

      // Speak completion message if voice is enabled
      setTimeout(() => {
        if (voiceEnabledRef.current) {
          speakText('Your meditation is complete... take a moment to notice how you feel.')
        }
      }, 500)
      return
    }

    const stage = stages[stageIndex]
    setCurrentStageIndex(stageIndex)
    setStageProgress(0)
    setIsLoading(true)
    setIsPaused(false)

    // Stop any current voice (but don't touch music)
    stopVoice()

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/meditation/stage/${stage.id}/content`
      )
      if (response.ok) {
        const data = await response.json()
        setStageContent(data.content)
        currentStageContentRef.current = data.content
        // Speak if voice is enabled
        if (voiceEnabledRef.current) {
          speakText(data.content)
        }
      }
    } catch (error) {
      console.error('[MEDITATION] Failed to fetch stage content:', error)
      const fallbackContent = `Breathe... and be present... allow yourself to settle into this moment.`
      setStageContent(fallbackContent)
      currentStageContentRef.current = fallbackContent
      if (voiceEnabledRef.current) {
        speakText(fallbackContent)
      }
    } finally {
      setIsLoading(false)
    }

    // Start progress timer
    stageStartTimeRef.current = Date.now()
    const duration = stage.duration * 1000

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - stageStartTimeRef.current
      const progress = Math.min((elapsed / duration) * 100, 100)
      setStageProgress(progress)

      if (progress >= 100) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current)
        }
        setCompletedStages((prev) => new Set([...prev, stage.id]))
        setTimeout(() => {
          startStage(stageIndex + 1)
        }, 1500)
      }
    }, 100)
  }, [stages, stopVoice, speakText])

  const startSession = useCallback(() => {
    setIsSessionActive(true)
    setSessionComplete(false)
    setShowReflection(false)
    setReflectionText('')
    setReflectionInsight('')
    setCompletedStages(new Set())
    setCurrentStageIndex(-1)

    // Start music (independent of voice)
    startMusic()

    // Start first stage
    startStage(0)
  }, [startMusic, startStage])

  const stopSession = useCallback(() => {
    // Clear progress
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
    // Stop voice
    stopVoice()
    // Stop music
    stopMusic()

    setIsSessionActive(false)
    setIsPaused(false)
    setCurrentStageIndex(-1)
    setStageContent('')
    setStageProgress(0)
  }, [stopVoice, stopMusic])

  const togglePause = useCallback(() => {
    if (isPaused) {
      // Resume
      setIsPaused(false)

      // Resume voice if enabled
      if (voiceEnabled) {
        resumeVoice()
      }

      // Resume music if enabled
      if (musicEnabled) {
        resumeMusic()
      }

      // Resume progress timer
      const stage = stages[currentStageIndex]
      stageStartTimeRef.current = Date.now() - (stage.duration * 1000 * pausedAtRef.current) / 100

      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - stageStartTimeRef.current
        const progress = Math.min((elapsed / (stage.duration * 1000)) * 100, 100)
        setStageProgress(progress)

        if (progress >= 100) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current)
          }
          setCompletedStages((prev) => new Set([...prev, stage.id]))
          setTimeout(() => {
            startStage(currentStageIndex + 1)
          }, 1500)
        }
      }, 100)
    } else {
      // Pause
      setIsPaused(true)
      pausedAtRef.current = stageProgress

      // Pause voice (independent)
      pauseVoice()

      // Pause music (independent)
      pauseMusic()

      // Pause progress timer
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [isPaused, voiceEnabled, musicEnabled, stages, currentStageIndex, stageProgress, resumeVoice, resumeMusic, pauseVoice, pauseMusic, startStage])

  const skipToStage = useCallback((index: number) => {
    if (!isSessionActive || index === currentStageIndex) return

    // Clear current progress
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }

    // Stop current voice (music continues uninterrupted)
    stopVoice()

    setIsPaused(false)
    startStage(index)
  }, [isSessionActive, currentStageIndex, stopVoice, startStage])

  // ==================== REFLECTION ====================

  const saveReflection = async () => {
    if (!reflectionText.trim()) return

    setIsSavingReflection(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/meditation/reflection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: reflectionText.trim(),
          session_duration: totalDuration,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setReflectionInsight(data.insight || 'Thank you for sharing your reflection.')
      }
    } catch (error) {
      console.error('[MEDITATION] Failed to save reflection:', error)
      setReflectionInsight('Your reflection has been noted. Carry this peace with you.')
    } finally {
      setIsSavingReflection(false)
    }
  }

  const finishSession = useCallback(() => {
    // Now stop music (session truly ending)
    stopMusic()
    stopVoice()

    setShowReflection(false)
    setSessionComplete(false)
    setReflectionText('')
    setReflectionInsight('')
  }, [stopMusic, stopVoice])

  // ==================== COMPUTED VALUES ====================

  const totalDuration = stages.reduce((sum, s) => sum + s.duration, 0)
  const currentStage = currentStageIndex >= 0 ? stages[currentStageIndex] : null

  const overallProgress = (() => {
    if (!isSessionActive || currentStageIndex < 0) return sessionComplete ? 100 : 0
    const completedTime = stages.slice(0, currentStageIndex).reduce((sum, s) => sum + s.duration, 0)
    const currentStageTime = currentStage ? (stageProgress / 100) * currentStage.duration : 0
    return ((completedTime + currentStageTime) / totalDuration) * 100
  })()

  // ==================== RENDER ====================

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
          <div className="flex items-center gap-2">
            {/* Music Toggle */}
            <button
              onClick={toggleMusic}
              className={`p-2 border transition-all ${
                musicEnabled
                  ? 'border-terminal-accent text-terminal-accent'
                  : 'border-terminal-muted text-terminal-muted'
              }`}
              title={musicEnabled ? 'Mute music' : 'Enable music'}
            >
              <Music className="w-5 h-5" />
            </button>

            {/* Voice Toggle */}
            <button
              onClick={toggleVoice}
              className={`p-2 border transition-all ${
                voiceEnabled
                  ? 'border-terminal-accent text-terminal-accent'
                  : 'border-terminal-muted text-terminal-muted'
              }`}
              title={voiceEnabled ? 'Mute voice' : 'Enable voice'}
            >
              {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            {/* Exit */}
            <Link
              href="/council"
              onClick={cleanupSession}
              className="px-4 py-2 border border-terminal-muted hover:border-terminal-accent transition-all"
            >
              EXIT
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-3xl w-full space-y-8">
          <AnimatePresence mode="wait">
            {/* Post-Session Reflection */}
            {showReflection ? (
              <motion.div
                key="reflection"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Completion Circle */}
                <div className="flex justify-center">
                  <div className="w-32 h-32 rounded-full border-4 border-terminal-accent bg-terminal-accent/10 flex items-center justify-center">
                    <Check className="w-16 h-16 text-terminal-accent" />
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold">Session Complete</h2>
                  <p className="text-terminal-muted">
                    Take a moment to capture any thoughts or feelings...
                  </p>
                </div>

                {/* Reflection Input */}
                {!reflectionInsight ? (
                  <div className="space-y-4">
                    <textarea
                      value={reflectionText}
                      onChange={(e) => setReflectionText(e.target.value)}
                      placeholder="What did you notice during this meditation? Any insights, feelings, or thoughts you'd like to remember..."
                      className="w-full h-40 bg-transparent border border-terminal-muted p-4 rounded-lg focus:outline-none focus:border-terminal-accent resize-none"
                      disabled={isSavingReflection}
                    />
                    <div className="flex justify-between items-center">
                      <button
                        onClick={finishSession}
                        className="text-sm text-terminal-muted hover:text-terminal-accent transition-all"
                      >
                        Skip reflection
                      </button>
                      <button
                        onClick={saveReflection}
                        disabled={!reflectionText.trim() || isSavingReflection}
                        className="px-6 py-3 border border-terminal-accent bg-terminal-accent/10 hover:bg-terminal-accent hover:text-terminal-bg transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        {isSavingReflection ? 'Saving...' : 'Save Reflection'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <div className="p-6 border border-terminal-accent/50 bg-terminal-accent/5 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-terminal-accent flex-shrink-0 mt-1" />
                        <p className="text-sm leading-relaxed">{reflectionInsight}</p>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <button
                        onClick={finishSession}
                        className="px-8 py-3 border border-terminal-accent bg-terminal-accent/10 hover:bg-terminal-accent hover:text-terminal-bg transition-all"
                      >
                        Finish
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              /* Main Meditation UI */
              <motion.div
                key="meditation"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                {/* Progress Circle */}
                <div className="flex justify-center">
                  <div className="relative">
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

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <AnimatePresence mode="wait">
                        {isSessionActive && currentStage ? (
                          <motion.div
                            key={currentStage.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="text-center"
                          >
                            <div className="text-terminal-accent mb-2 flex justify-center">
                              {STAGE_ICONS[currentStage.icon]}
                            </div>
                            <p className="text-lg font-bold">{currentStage.name}</p>
                            <p className="text-sm text-terminal-muted">
                              {Math.ceil((currentStage.duration * (100 - stageProgress)) / 100)}s
                            </p>
                            {isPaused && (
                              <p className="text-xs text-terminal-accent mt-2">PAUSED</p>
                            )}
                          </motion.div>
                        ) : (
                          <motion.div
                            key="idle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center"
                          >
                            <Circle className="w-16 h-16 text-terminal-muted mx-auto mb-2" />
                            <p className="text-sm text-terminal-muted">Ready to begin</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* Stage Milestones */}
                <div className="flex justify-center gap-2 flex-wrap">
                  {stages.map((stage, index) => {
                    const isCompleted = completedStages.has(stage.id)
                    const isCurrent = index === currentStageIndex

                    return (
                      <button
                        key={stage.id}
                        onClick={() => skipToStage(index)}
                        disabled={!isSessionActive}
                        className={`
                          flex flex-col items-center p-3 rounded-lg border transition-all
                          ${
                            isCompleted
                              ? 'border-terminal-accent bg-terminal-accent/20 text-terminal-accent'
                              : isCurrent
                              ? 'border-terminal-accent bg-terminal-accent/10'
                              : 'border-terminal-muted/50 hover:border-terminal-muted'
                          }
                          ${isSessionActive ? 'cursor-pointer' : 'cursor-default opacity-60'}
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

                {/* Stage Content */}
                <AnimatePresence mode="wait">
                  {stageContent && isSessionActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="border border-terminal-muted p-6 rounded-lg max-h-48 overflow-y-auto"
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap italic text-terminal-muted">
                        {stageContent}
                      </p>
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
                      START SESSION
                    </button>
                  ) : (
                    <>
                      {/* Pause/Resume Button */}
                      <button
                        onClick={togglePause}
                        className="px-6 py-4 border border-terminal-accent bg-terminal-accent/10 hover:bg-terminal-accent hover:text-terminal-bg transition-all flex items-center gap-2"
                      >
                        {isPaused ? (
                          <>
                            <Play className="w-5 h-5" />
                            RESUME
                          </>
                        ) : (
                          <>
                            <Pause className="w-5 h-5" />
                            PAUSE
                          </>
                        )}
                      </button>

                      {/* Skip Button */}
                      <button
                        onClick={() => skipToStage(currentStageIndex + 1)}
                        className="px-6 py-4 border border-terminal-muted hover:border-terminal-accent transition-all flex items-center gap-2"
                      >
                        <SkipForward className="w-5 h-5" />
                        SKIP
                      </button>

                      {/* Stop Button */}
                      <button
                        onClick={stopSession}
                        className="px-6 py-4 border-2 border-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white transition-all duration-300 flex items-center gap-2"
                      >
                        <Square className="w-5 h-5" />
                        STOP
                      </button>
                    </>
                  )}
                </div>

                {/* Instructions */}
                {!isSessionActive && (
                  <div className="text-center text-sm text-terminal-muted space-y-2">
                    <p>Find a quiet space. Headphones recommended.</p>
                    <p className="text-xs opacity-75">
                      {voiceEnabled ? 'Voice guidance enabled' : 'Voice muted'} ·{' '}
                      {musicEnabled ? 'Background music enabled' : 'Music muted'}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Background Music Placeholder Notice */}
      {(isSessionActive || showReflection) && musicEnabled && (
        <div className="fixed bottom-4 left-4 text-xs text-terminal-muted/50">
          <Music className="w-3 h-3 inline mr-1" />
          Music: Add audio file to /public/audio/meditation-ambient.mp3
        </div>
      )}
    </div>
  )
}
