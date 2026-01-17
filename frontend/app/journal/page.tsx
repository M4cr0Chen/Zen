'use client'

import { useState } from 'react'
import { Book, Save, Check, ChevronRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

interface FollowUpState {
  originalEntry: string
  questions: string[]
  answers: { [key: string]: string }
  insight: string
}

export default function JournalPage() {
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [followUp, setFollowUp] = useState<FollowUpState | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [finalInsight, setFinalInsight] = useState('')

  const saveEntry = async () => {
    if (!content.trim()) return

    setIsLoading(true)
    setSaved(false)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/journal/ingest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save journal entry')
      }

      const data = await response.json()
      console.log('[JOURNAL] Response:', data)

      // If we got follow-up questions, enter the interview mode
      if (data.follow_up_questions && data.follow_up_questions.length > 0) {
        setFollowUp({
          originalEntry: content.trim(),
          questions: data.follow_up_questions,
          answers: {},
          insight: data.insights || '',
        })
        setCurrentQuestionIndex(0)
        setCurrentAnswer('')
      } else {
        setSaved(true)
        setTimeout(() => {
          setContent('')
          setSaved(false)
        }, 2000)
      }
    } catch (error) {
      console.error('Error saving journal entry:', error)
      alert('Failed to save journal entry. Please make sure the backend is running.')
    } finally {
      setIsLoading(false)
    }
  }

  const submitFollowUpAnswer = async () => {
    if (!followUp || !currentAnswer.trim()) return

    const currentQuestion = followUp.questions[currentQuestionIndex]
    const newAnswers = {
      ...followUp.answers,
      [currentQuestion]: currentAnswer.trim(),
    }

    setFollowUp({
      ...followUp,
      answers: newAnswers,
    })

    // Check if we have more questions
    if (currentQuestionIndex < followUp.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setCurrentAnswer('')
    } else {
      // All questions answered, submit the follow-up
      setIsLoading(true)
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/journal/follow-up`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            original_entry: followUp.originalEntry,
            follow_up_answers: newAnswers,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to save follow-up')
        }

        const data = await response.json()
        setFinalInsight(data.insights || 'Your reflection has been saved.')
        setSaved(true)

        // Reset after delay
        setTimeout(() => {
          setContent('')
          setFollowUp(null)
          setCurrentQuestionIndex(0)
          setCurrentAnswer('')
          setSaved(false)
          setFinalInsight('')
        }, 5000)
      } catch (error) {
        console.error('Error saving follow-up:', error)
        alert('Failed to save follow-up. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const skipFollowUp = () => {
    setFollowUp(null)
    setSaved(true)
    setTimeout(() => {
      setContent('')
      setSaved(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-terminal-muted p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Book className="w-8 h-8 terminal-glow" />
            <div>
              <h1 className="text-2xl font-bold terminal-glow">JOURNAL ENTRY</h1>
              <p className="text-sm text-terminal-muted">
                Feed your Digital Twin with your thoughts
              </p>
            </div>
          </div>
          <Link
            href="/council"
            className="px-4 py-2 border border-terminal-muted hover:border-terminal-accent transition-all"
          >
            BACK TO COUNCIL
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <AnimatePresence mode="wait">
            {/* Initial Entry Mode */}
            {!followUp && !saved && (
              <motion.div
                key="entry"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div>
                  <label htmlFor="journal" className="block text-sm mb-2 text-terminal-muted">
                    What&apos;s on your mind?
                  </label>
                  <textarea
                    id="journal"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your thoughts, feelings, or experiences here..."
                    className="w-full h-96 bg-transparent border border-terminal-muted p-4 rounded focus:outline-none focus:border-terminal-accent resize-none"
                    disabled={isLoading}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-sm text-terminal-muted">{content.length} characters</p>

                  <button
                    onClick={saveEntry}
                    disabled={isLoading || !content.trim()}
                    className="px-8 py-3 border border-terminal-accent bg-terminal-accent/10 hover:bg-terminal-accent hover:text-terminal-bg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {isLoading ? 'ANALYZING...' : 'SAVE & REFLECT'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Follow-up Interview Mode */}
            {followUp && !saved && (
              <motion.div
                key="followup"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Insight Card */}
                {followUp.insight && (
                  <div className="p-4 border border-terminal-accent/50 bg-terminal-accent/5 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-terminal-accent flex-shrink-0 mt-0.5" />
                      <p className="text-sm">{followUp.insight}</p>
                    </div>
                  </div>
                )}

                {/* Progress Indicator */}
                <div className="flex items-center gap-2">
                  {followUp.questions.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 flex-1 rounded-full transition-all ${
                        index < currentQuestionIndex
                          ? 'bg-terminal-accent'
                          : index === currentQuestionIndex
                          ? 'bg-terminal-accent/50'
                          : 'bg-terminal-muted/30'
                      }`}
                    />
                  ))}
                </div>

                {/* Current Question */}
                <div className="space-y-4">
                  <p className="text-xs text-terminal-muted">
                    QUESTION {currentQuestionIndex + 1} OF {followUp.questions.length}
                  </p>
                  <h2 className="text-xl font-medium">
                    {followUp.questions[currentQuestionIndex]}
                  </h2>
                </div>

                {/* Answer Input */}
                <textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Take your time to reflect..."
                  className="w-full h-48 bg-transparent border border-terminal-muted p-4 rounded focus:outline-none focus:border-terminal-accent resize-none"
                  disabled={isLoading}
                  autoFocus
                />

                {/* Actions */}
                <div className="flex justify-between items-center">
                  <button
                    onClick={skipFollowUp}
                    className="text-sm text-terminal-muted hover:text-terminal-accent transition-all"
                  >
                    Skip deeper reflection
                  </button>

                  <button
                    onClick={submitFollowUpAnswer}
                    disabled={isLoading || !currentAnswer.trim()}
                    className="px-6 py-3 border border-terminal-accent bg-terminal-accent/10 hover:bg-terminal-accent hover:text-terminal-bg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isLoading ? (
                      'SAVING...'
                    ) : currentQuestionIndex < followUp.questions.length - 1 ? (
                      <>
                        NEXT <ChevronRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        COMPLETE <Check className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Saved Confirmation */}
            {saved && (
              <motion.div
                key="saved"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-8 border border-terminal-accent bg-terminal-accent/10 rounded-lg text-center space-y-4"
              >
                <div className="w-16 h-16 mx-auto rounded-full border-2 border-terminal-accent flex items-center justify-center">
                  <Check className="w-8 h-8 text-terminal-accent" />
                </div>
                <h2 className="text-xl font-bold">Reflection Saved</h2>
                {finalInsight ? (
                  <p className="text-terminal-muted max-w-md mx-auto">{finalInsight}</p>
                ) : (
                  <p className="text-terminal-muted">
                    Your entry has been saved and embedded into your Digital Twin.
                  </p>
                )}
                <p className="text-xs text-terminal-muted">
                  This memory will be used to provide personalized guidance.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
