"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { GameLayout } from "@/components/game/game-layout"
import { GameTimer } from "@/components/game/game-timer"
import { MicIndicator } from "@/components/game/mic-indicator"
import { ProgressBar } from "@/components/game/progress-bar"
import { GameModal } from "@/components/game/game-modal"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, RotateCcw, ArrowRight, Star, Clock, Target, Brain, Loader2 } from "lucide-react"
import VoiceApiClient from "@/lib/voiceApiClient"
import { EnhancedResults } from "@/components/game/enhanced-results"
import { ProcessingScreen } from "@/components/game/processing-screen"
import { ErrorScreen } from "@/components/game/error-screen"

type GamePhase = "setup" | "playing" | "processing" | "results" | "error"

interface AnalysisData {
  score: number
  creativity: number
  relevance: number
  logic: number
  clarity: number
  feedback: string
  category: string
}

interface GameResults {
  total_prompts: number
  completed_prompts: number
  response_rate: number
  avg_response_time: number
  avg_quality_score: number
  score_breakdown: {
    creativity: number
    relevance: number
    logic: number
    clarity: number
  }
  category_breakdown: {
    excellent: number
    good: number
    fair: number
    poor: number
  }
  top_responses: Array<{
    prompt: string
    response: string
    score: number
    feedback: string
  }>
  missed_prompts: string[]
}

interface GameState {
  currentPrompt: number
  totalPrompts: number
  completedPrompts: number
  timerDuration: number
  responses: Array<{
    prompt: string
    responded: boolean
    responseTime?: number
    uploaded?: boolean
  }>
  startTime?: number
  sessionId?: string
}

const ANALOGY_PROMPTS = [
  "Business is like ___",
  "Learning is like ___",
  "Friendship is like ___",
  "Success is like ___",
  "Time is like ___",
  "Leadership is like ___",
  "Innovation is like ___",
  "Communication is like ___",
  "Trust is like ___",
  "Growth is like ___",
  "Creativity is like ___",
  "Teamwork is like ___",
  "Change is like ___",
  "Knowledge is like ___",
  "Opportunity is like ___",
  "Challenge is like ___",
  "Progress is like ___",
  "Vision is like ___",
  "Passion is like ___",
  "Excellence is like ___",
]

export default function Game1Page() {
  const router = useRouter()
  const [phase, setPhase] = useState<GamePhase>("setup")
  const [gameState, setGameState] = useState<GameState>({
    currentPrompt: 0,
    totalPrompts: 10,
    completedPrompts: 0,
    timerDuration: 5,
    responses: [],
  })
  const [gameResults, setGameResults] = useState<GameResults | null>(null)
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [micPermission, setMicPermission] = useState<boolean | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [backgroundFlash, setBackgroundFlash] = useState<"none" | "green" | "red">("none")
  const [showInstructions, setShowInstructions] = useState(false)
  const [timerKey, setTimerKey] = useState(0)
  const [processingMessage, setProcessingMessage] = useState("Processing your responses...")
  const [errorMessage, setErrorMessage] = useState("")
  const currentPromptRef = useRef(0)
  const isProcessingRef = useRef(false)

  // Voice recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const apiClientRef = useRef<VoiceApiClient | null>(null)
  const recordingStartTimeRef = useRef<number | null>(null)

  // Initialize API client
  useEffect(() => {
    apiClientRef.current = new VoiceApiClient('http://127.0.0.1:5005')
  }, [])

  const initializeGame = useCallback(() => {
    const shuffledPrompts = [...ANALOGY_PROMPTS]
      .sort(() => Math.random() - 0.5)
      .slice(0, gameState.totalPrompts)
    const sessionId = apiClientRef.current?.generateSessionId() || `session_${Date.now()}`

    setGameState((prev) => ({
      ...prev,
      responses: shuffledPrompts.map((prompt) => ({ prompt, responded: false, uploaded: false })),
      currentPrompt: 0,
      completedPrompts: 0,
      startTime: Date.now(),
      sessionId,
    }))
    currentPromptRef.current = 0
    isProcessingRef.current = false
  }, [gameState.totalPrompts])

  const requestMicPermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
      setMicPermission(true)
    } catch (error) {
      setMicPermission(false)
    }
  }

  const startVoiceRecording = useCallback(async () => {
    if (!micPermission) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)

      audioChunksRef.current = []
      recordingStartTimeRef.current = Date.now()

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.start()
      mediaRecorderRef.current = mediaRecorder
      setIsRecording(true)
    } catch (error) {
      console.error('Failed to start recording:', error)
    }
  }, [micPermission])

  const stopVoiceRecording = useCallback(async () => {
    if (!mediaRecorderRef.current || !isRecording) return
    return new Promise<void>((resolve) => {
      const mediaRecorder = mediaRecorderRef.current!
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const responseTime = recordingStartTimeRef.current ? Date.now() - recordingStartTimeRef.current : 0

        if (apiClientRef.current && gameState.sessionId) {
          try {
            const currentPrompt = currentPromptRef.current
            const prompt = gameState.responses[currentPrompt]?.prompt || ''
            await apiClientRef.current.uploadVoiceRecording({
              sessionId: gameState.sessionId,
              prompt,
              promptIndex: currentPrompt,
              audioBlob,
              responseTime,
              gameSettings: {
                timer_duration: gameState.timerDuration,
                total_prompts: gameState.totalPrompts
              }
            })
            setGameState((prev) => {
              const newResponses = [...prev.responses]
              if (newResponses[currentPrompt]) {
                newResponses[currentPrompt].uploaded = true
                newResponses[currentPrompt].responded = true
                newResponses[currentPrompt].responseTime = responseTime
              }
              return { 
                ...prev, 
                responses: newResponses,
                completedPrompts: prev.completedPrompts + 1
              }
            })
            console.log('Voice uploaded successfully for prompt:', currentPrompt)
          } catch (error) {
            console.error('Failed to upload voice:', error)
          }
        }

        mediaRecorder.stream.getTracks().forEach(track => track.stop())
        mediaRecorderRef.current = null
        setIsRecording(false)
        resolve()
      }
      mediaRecorder.stop()
    })
  }, [isRecording, gameState.sessionId, gameState.timerDuration, gameState.totalPrompts, gameState.responses])

  const handleTimerComplete = useCallback(async () => {
    if (isProcessingRef.current) return
    isProcessingRef.current = true
    const currentPrompt = currentPromptRef.current
    setIsTimerActive(false)

    // Flash red if no recording was made
    if (!isRecording) {
      setBackgroundFlash("red")
      setTimeout(() => setBackgroundFlash("none"), 300)
    } else {
      setBackgroundFlash("green")
      setTimeout(() => setBackgroundFlash("none"), 300)
    }

    if (isRecording) {
      await stopVoiceRecording()
    }

    if (currentPrompt >= gameState.totalPrompts - 1) {
      // Game complete - start processing phase
      setPhase("processing")
      setProcessingMessage("Analyzing your responses with AI...")
      
      if (apiClientRef.current && gameState.sessionId) {
        try {
          // Call the complete session endpoint which processes all audio
          const result = await apiClientRef.current.completeSession(gameState.sessionId, {
            total_prompts: gameState.totalPrompts,
            completed_prompts: gameState.completedPrompts
          })
          
          setGameResults(result.data)
          setPhase("results")
        } catch (error) {
          console.error('Failed to complete session:', error)
          
          // Try to get basic session data as fallback
          try {
            const sessionData = await apiClientRef.current.getSession(gameState.sessionId)
            const prompts = sessionData.data.prompts || []
            
            // Create fallback results
            const basicResults = {
              total_prompts: gameState.totalPrompts,
              completed_prompts: prompts.filter((p: any) => p.transcription).length,
              response_rate: (gameState.completedPrompts / gameState.totalPrompts) * 100,
              avg_response_time: gameState.responses.filter(r => r.responseTime)
                .reduce((acc, r) => acc + (r.responseTime || 0), 0) /
                Math.max(gameState.responses.filter(r => r.responseTime).length, 1),
              avg_quality_score: 5, // Default score
              score_breakdown: { creativity: 5, relevance: 5, logic: 5, clarity: 5 },
              category_breakdown: { excellent: 0, good: 0, fair: prompts.filter((p: any) => p.transcription).length, poor: 0 },
              top_responses: prompts.filter((p: any) => p.transcription && p.analysis).slice(0, 3).map((p: any) => ({
                prompt: p.prompt,
                response: p.transcription,
                score: p.analysis?.score || 5,
                feedback: p.analysis?.feedback || "Analysis not available"
              })),
              missed_prompts: gameState.responses.filter(r => !r.responded).map(r => r.prompt)
            }
            
            setGameResults(basicResults)
            setPhase("results")
          } catch (fallbackError) {
            console.error('Fallback failed:', fallbackError)
            setErrorMessage(`Failed to process results: ${
              typeof error === "object" && error !== null && "message" in error
                ? (error as { message: string }).message
                : String(error)
            }`)
            setPhase("error")
          }
        }
      } else {
        setErrorMessage("Session ID not found")
        setPhase("error")
      }
      return
    }

    setTimeout(() => {
      const nextPrompt = currentPrompt + 1
      currentPromptRef.current = nextPrompt
      setGameState((prev) => ({ ...prev, currentPrompt: nextPrompt }))
      setTimeout(() => {
        setTimerKey(prev => prev + 1)
        setIsTimerActive(true)
        startVoiceRecording()
        isProcessingRef.current = false
      }, 500)
    }, 300)
  }, [isRecording, stopVoiceRecording, gameState.totalPrompts, gameState.sessionId, gameState.completedPrompts, gameState.responses, startVoiceRecording])

  useEffect(() => {
    currentPromptRef.current = gameState.currentPrompt
  }, [gameState.currentPrompt])

  const startGame = async () => {
    if (micPermission === null) {
      await requestMicPermission()
      return
    }
    if (!micPermission) {
      alert("Microphone permission is required to play this game.")
      return
    }
    initializeGame()
    setPhase("playing")
    setTimeout(() => {
      setTimerKey(0)
      setIsTimerActive(true)
      startVoiceRecording()
    }, 1000)
  }

  const resetGame = () => {
    setPhase("setup")
    setIsTimerActive(false)
    setIsRecording(false)
    setBackgroundFlash("none")
    setTimerKey(0)
    setGameResults(null)
    setErrorMessage("")
    currentPromptRef.current = 0
    isProcessingRef.current = false
    setGameState((prev) => ({
      ...prev,
      currentPrompt: 0,
      completedPrompts: 0,
      responses: [],
    }))
  }

  const retryProcessing = async () => {
    if (!gameState.sessionId) return
    
    setPhase("processing")
    setProcessingMessage("Retrying analysis...")
    
    try {
      const result = await apiClientRef.current?.completeSession(gameState.sessionId, {
        total_prompts: gameState.totalPrompts,
        completed_prompts: gameState.completedPrompts
      })
      
      if (result?.data) {
        setGameResults(result.data)
        setPhase("results")
      } else {
        throw new Error("No data received from server")
      }
    } catch (error) {
      console.error('Retry failed:', error)
      setErrorMessage(`Retry failed: ${typeof error === "object" && error !== null && "message" in error ? (error as { message: string }).message : String(error)}`)
      setPhase("error")
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'excellent': return 'bg-green-100 text-green-800'
      case 'good': return 'bg-blue-100 text-blue-800'
      case 'fair': return 'bg-yellow-100 text-yellow-800'
      case 'poor': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const currentPromptText = gameState.responses[gameState.currentPrompt]?.prompt || ""

  if (phase === "setup") {
    return (
      <GameLayout title="Rapid Fire Analogies">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 rounded-full bg-orange-100">
                <Zap className="h-8 w-8 text-orange-500" />
              </div>
              <CardTitle className="text-2xl">Rapid Fire Analogies</CardTitle>
              <CardDescription className="text-lg">
                Complete each analogy instantly. AI will analyze your creativity and relevance!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Prompts: {gameState.totalPrompts}
                </label>
                <Slider
                  value={[gameState.totalPrompts]}
                  onValueChange={([value]) => setGameState((prev) => ({ ...prev, totalPrompts: value }))}
                  min={5}
                  max={20}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5</span>
                  <span>10</span>
                  <span>15</span>
                  <span>20</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timer Duration: {gameState.timerDuration} seconds
                </label>
                <Slider
                  value={[gameState.timerDuration]}
                  onValueChange={([value]) => setGameState((prev) => ({ ...prev, timerDuration: value }))}
                  min={3}
                  max={8}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>3s</span>
                  <span>5s</span>
                  <span>8s</span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  You'll see {gameState.totalPrompts} analogy prompts. AI will analyze your responses for creativity, relevance, logic, and clarity!
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => setShowInstructions(true)} variant="outline">
                    How to Play
                  </Button>
                  <Button onClick={startGame} size="lg" className="bg-[#4F46E5] hover:bg-[#4338CA]">
                    {micPermission === null ? "Enable Microphone & Start" : "Ready to Play"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <GameModal
          isOpen={showInstructions}
          onClose={() => setShowInstructions(false)}
          title="How to Play Rapid Fire Analogies"
          description="Master the art of quick thinking and verbal agility"
        >
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">🎯 Objective</h4>
              <p>Complete as many analogies as possible with creative and relevant responses.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">🎮 How to Play</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>You'll see prompts like "Business is like ___"</li>
                <li>Speak your completion when the timer starts</li>
                <li>The microphone records your response automatically</li>
                <li>Each prompt has a time limit you set (3-8 seconds)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">🤖 AI Analysis</h4>
              <p>AI will analyze each response for creativity, relevance, logic, and clarity, giving you detailed feedback!</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">🏆 Scoring</h4>
              <p>Get scores from 1-10 based on the quality of your analogies, plus see your top responses!</p>
            </div>
          </div>
        </GameModal>
      </GameLayout>
    )
  }

  if (phase === "playing") {
    return (
      <GameLayout title="Rapid Fire Analogies">
        <div
          className={`transition-all duration-300 ${
            backgroundFlash === "green" ? "game-flash-green" : backgroundFlash === "red" ? "game-flash-red" : ""
          }`}
        >
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Progress */}
            <ProgressBar
              current={gameState.currentPrompt + 1}
              total={gameState.totalPrompts}
              label="Progress"
              className="max-w-md mx-auto"
            />

            {/* Main Prompt */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 min-h-[120px] flex items-center justify-center">
                {currentPromptText}
              </h1>

              {/* Timer and Mic */}
              <div className="flex items-center justify-center gap-8">
                <GameTimer
                  key={timerKey}
                  duration={gameState.timerDuration}
                  isActive={isTimerActive}
                  onComplete={handleTimerComplete}
                  size="lg"
                />
                <MicIndicator
                  isActive={isTimerActive}
                  isRecording={isRecording}
                  hasPermission={micPermission || false}
                  size="lg"
                />
              </div>

              {/* Status */}
              <div className="text-lg text-gray-600">
                {isTimerActive ? (
                  <span className="font-medium">Speak now!</span>
                ) : (
                  <span>Get ready for the next prompt...</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </GameLayout>
    )
  }

  if (phase === "processing") {
    return (
      <GameLayout title="Processing Results">
        <ProcessingScreen 
          message={processingMessage}
          showProgress={true}
        />
      </GameLayout>
    )
  }

  if (phase === "results" && gameResults) {
    return (
      <GameLayout title="Game Results">
        <EnhancedResults gameResults={gameResults} />
        
        {/* Actions */}
        <div className="flex gap-2 justify-center mt-8">
          <Button onClick={resetGame} variant="outline" size="lg">
            <RotateCcw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button onClick={() => router.push("/game2")} size="lg" className="bg-[#4F46E5] hover:bg-[#4338CA]">
            Next Game
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </GameLayout>
    )
  }

  if (phase === "error") {
    return (
      <GameLayout title="Error">
        <ErrorScreen
          error={errorMessage}
          onRetry={retryProcessing}
          onReset={resetGame}
          title="Processing Failed"
          description="We couldn't analyze your responses"
        />
      </GameLayout>
    )
  }

  return null
}