"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { GameLayout } from "@/components/game/game-layout"
import { MicIndicator } from "@/components/game/mic-indicator"
import { EnergyMeter } from "@/components/game/energy-meter"
import { GameModal } from "@/components/game/game-modal"
import { ProcessingScreen } from "@/components/game/processing-screen"
import { ErrorScreen } from "@/components/game/error-screen"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, RotateCcw, ArrowRight, Wind, Star, Zap, Target, TrendingUp } from "lucide-react"
import VoiceApiClient from "@/lib/voiceApiClient"

type GamePhase = "setup" | "playing" | "processing" | "results" | "error"

interface EnergyChange {
  timestamp: number
  targetLevel: number
  actualLevel: number
  transitionTime: number
  success: boolean
}

interface ConductorResults {
  game_type: string
  topic: string
  duration: number
  total_transitions: number
  successful_transitions: number
  success_rate: number
  transition_score: number
  adaptability_score: number
  consistency_score: number
  energy_range_score: number
  avg_adaptation_speed: number
  energy_changes_detected: number
  feedback: string
  overall_score: number
}

interface GameState {
  topic: string
  duration: number // in seconds
  currentEnergy: number
  targetEnergy: number
  energyChanges: EnergyChange[]
  startTime?: number
  totalTransitions: number
  successfulTransitions: number
  breatheMode: boolean
  sessionId?: string
}

const PRESET_TOPICS = [
  "Innovation in Technology",
  "The Future of Work",
  "Climate Change Solutions",
  "Personal Growth and Development",
  "The Power of Communication",
  "Building Strong Teams",
  "Overcoming Challenges",
  "The Importance of Education",
  "Health and Wellness",
  "Creative Problem Solving",
  "Leadership in Modern Times",
  "The Digital Revolution",
  "Sustainable Living",
  "The Art of Storytelling",
  "Building Confidence",
]

export default function Game2Page() {
  const router = useRouter()
  const [phase, setPhase] = useState<GamePhase>("setup")
  const [gameState, setGameState] = useState<GameState>({
    topic: "",
    duration: 180,
    currentEnergy: 5,
    targetEnergy: 5,
    energyChanges: [],
    totalTransitions: 0,
    successfulTransitions: 0,
    breatheMode: false,
  })
  const [gameResults, setGameResults] = useState<ConductorResults | null>(null)
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [micPermission, setMicPermission] = useState<boolean | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [customTopic, setCustomTopic] = useState("")
  const [selectedPresetTopic, setSelectedPresetTopic] = useState("")
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [processingMessage, setProcessingMessage] = useState("Analyzing your vocal energy patterns...")
  const [errorMessage, setErrorMessage] = useState("")

  // Voice recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const apiClientRef = useRef<VoiceApiClient | null>(null)
  const recordingStartTimeRef = useRef<number | null>(null)

  useEffect(() => {
    apiClientRef.current = new VoiceApiClient("http://localhost:5005")
  }, [])

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
      console.error("Failed to start recording:", error)
    }
  }, [micPermission])

  const stopVoiceRecording = useCallback(async () => {
    if (!mediaRecorderRef.current || !isRecording) return
    return new Promise<void>((resolve) => {
      const mediaRecorder = mediaRecorderRef.current!
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        const responseTime = recordingStartTimeRef.current
          ? Date.now() - recordingStartTimeRef.current
          : 0

        if (apiClientRef.current && gameState.sessionId) {
          try {
            await apiClientRef.current.uploadVoiceRecording({
              sessionId: gameState.sessionId,
              prompt: gameState.topic,
              promptIndex: 0,
              audioBlob,
              responseTime,
              gameSettings: {
                game_type: 'conductor',
                duration: gameState.duration,
                total_transitions: gameState.totalTransitions,
                successful_transitions: gameState.successfulTransitions,
                energy_changes: gameState.energyChanges
              }
            })
            console.log("Voice uploaded successfully for The Conductor")
          } catch (error) {
            console.error("Failed to upload voice:", error)
          }
        }

        mediaRecorder.stream.getTracks().forEach(track => track.stop())
        mediaRecorderRef.current = null
        setIsRecording(false)
        resolve()
      }
      mediaRecorder.stop()
    })
  }, [isRecording, gameState])

  // Generate random energy changes
  const generateEnergyChange = useCallback(() => {
    if (!isTimerActive || gameState.breatheMode) return
    const newTargetEnergy = Math.floor(Math.random() * 9) + 1
    const changeTime = Date.now()

    setGameState((prev) => ({
      ...prev,
      targetEnergy: newTargetEnergy,
      totalTransitions: prev.totalTransitions + 1,
    }))

    // Simulate user adaptation (in real implementation, this would be determined by audio analysis)
    setTimeout(() => {
      const success = Math.random() > 0.3 // 70% success rate for demo
      const actualLevel = success ? newTargetEnergy : gameState.currentEnergy
      setGameState((prev) => ({
        ...prev,
        currentEnergy: actualLevel,
        successfulTransitions: success ? prev.successfulTransitions + 1 : prev.successfulTransitions,
        energyChanges: [
          ...prev.energyChanges,
          {
            timestamp: changeTime,
            targetLevel: newTargetEnergy,
            actualLevel,
            transitionTime: Date.now() - changeTime,
            success,
          },
        ],
      }))
    }, 2000)
  }, [isTimerActive, gameState.breatheMode, gameState.currentEnergy])

  const triggerBreatheMode = useCallback(() => {
    if (!isTimerActive) return
    setGameState((prev) => ({ ...prev, breatheMode: true }))
    setTimeout(() => {
      setGameState((prev) => ({ ...prev, breatheMode: false }))
    }, 3000)
  }, [isTimerActive])

  // Game timer
  useEffect(() => {
    if (!isTimerActive) return
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsTimerActive(false)
          // Move to processing phase
          setPhase("processing")
          setProcessingMessage("Analyzing your vocal energy patterns...")
          
          // Stop recording and process results
          if (isRecording) {
            stopVoiceRecording().then(() => {
              processGameResults()
            })
          } else {
            processGameResults()
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isTimerActive, isRecording, stopVoiceRecording])

  const processGameResults = async () => {
    if (!apiClientRef.current || !gameState.sessionId) {
      setErrorMessage("Session ID not found")
      setPhase("error")
      return
    }

    try {
      // Complete the session and get AI analysis
      const result = await apiClientRef.current.completeSession(gameState.sessionId, {
        total_transitions: gameState.totalTransitions,
        successful_transitions: gameState.successfulTransitions
      })
      
      if (result?.data) {
        setGameResults(result.data)
        setPhase("results")
      } else {
        throw new Error("No data received from server")
      }
    } catch (error) {
      console.error('Failed to complete session:', error)
      
      // Create fallback results based on frontend data
      const fallbackResults: ConductorResults = {
        game_type: 'conductor',
        topic: gameState.topic,
        duration: gameState.duration,
        total_transitions: gameState.totalTransitions,
        successful_transitions: gameState.successfulTransitions,
        success_rate: gameState.totalTransitions > 0 ? (gameState.successfulTransitions / gameState.totalTransitions) * 100 : 0,
        transition_score: 6.5, // Default score
        adaptability_score: 7.0,
        consistency_score: 6.0,
        energy_range_score: 7.5,
        avg_adaptation_speed: 2.0,
        energy_changes_detected: gameState.energyChanges.length,
        feedback: "Unable to analyze vocal patterns. Results based on interaction data.",
        overall_score: 6.5
      }
      
      setGameResults(fallbackResults)
      setPhase("results")
    }
  }

  // Energy change & breathe mode timers
  useEffect(() => {
    if (!isTimerActive || gameState.breatheMode) return
    const energyInterval = setInterval(generateEnergyChange, 8000)
    const breatheInterval = setInterval(triggerBreatheMode, 25000)
    return () => {
      clearInterval(energyInterval)
      clearInterval(breatheInterval)
    }
  }, [isTimerActive, gameState.breatheMode, generateEnergyChange, triggerBreatheMode])

  const requestMicPermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
      setMicPermission(true)
    } catch (error) {
      setMicPermission(false)
    }
  }

  const startGame = async () => {
    if (micPermission === null) {
      await requestMicPermission()
      return
    }
    if (!micPermission) {
      alert("Microphone permission is required to play this game.")
      return
    }
    const finalTopic = customTopic || selectedPresetTopic
    if (!finalTopic) {
      alert("Please select or enter a topic to speak about.")
      return
    }
    
    // Generate session ID
    const sessionId = apiClientRef.current?.generateSessionId() || `conductor_${Date.now()}`
    
    setGameState((prev) => ({
      ...prev,
      topic: finalTopic,
      sessionId,
      startTime: Date.now(),
      energyChanges: [],
      totalTransitions: 0,
      successfulTransitions: 0,
      currentEnergy: 5,
      targetEnergy: 5,
      breatheMode: false,
    }))
    setTimeRemaining(gameState.duration)
    setPhase("playing")
    await startVoiceRecording()
    setTimeout(() => {
      setIsTimerActive(true)
    }, 1000)
  }

  const resetGame = () => {
    setPhase("setup")
    setIsTimerActive(false)
    setIsRecording(false)
    setTimeRemaining(0)
    setGameResults(null)
    setErrorMessage("")
    setGameState((prev) => ({
      ...prev,
      energyChanges: [],
      totalTransitions: 0,
      successfulTransitions: 0,
      breatheMode: false,
      sessionId: undefined,
    }))
  }

  const retryProcessing = async () => {
    if (!gameState.sessionId) return
    
    setPhase("processing")
    setProcessingMessage("Retrying energy analysis...")
    
    try {
      const result = await apiClientRef.current?.completeSession(gameState.sessionId, {
        total_transitions: gameState.totalTransitions,
        successful_transitions: gameState.successfulTransitions
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

  const getEnergyLabel = (level: number) => {
    if (level <= 2) return "Very Low"
    if (level <= 3) return "Low"
    if (level <= 4) return "Calm"
    if (level <= 5) return "Normal"
    if (level <= 6) return "Energetic"
    if (level <= 7) return "High"
    if (level <= 8) return "Very High"
    return "Maximum"
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600"
    if (score >= 6) return "text-blue-600"
    if (score >= 4) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 8) return "default"
    if (score >= 6) return "secondary"
    if (score >= 4) return "outline"
    return "destructive"
  }

  if (phase === "setup") {
    return (
      <GameLayout title="The Conductor">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 rounded-full bg-blue-100">
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
              <CardTitle className="text-2xl">The Conductor</CardTitle>
              <CardDescription className="text-lg">
                Speak on a topic while adjusting your vocal energy according to changing prompts. AI will analyze your energy control!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Topic Selection */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Choose a Topic</label>
                  <Select value={selectedPresetTopic} onValueChange={setSelectedPresetTopic}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a preset topic..." />
                    </SelectTrigger>
                    <SelectContent>
                      {PRESET_TOPICS.map((topic) => (
                        <SelectItem key={topic} value={topic}>
                          {topic}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-center text-sm text-gray-500">or</div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Custom Topic</label>
                  <Input
                    placeholder="Enter your own topic..."
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                  />
                </div>
              </div>

              {/* Duration Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration: {Math.floor(gameState.duration / 60)}:
                  {(gameState.duration % 60).toString().padStart(2, "0")}
                </label>
                <div className="flex gap-2">
                  {[60,120, 180, 240, 300].map((duration) => (
                    <Button
                      key={duration}
                      variant={gameState.duration === duration ? "default" : "outline"}
                      size="sm"
                      onClick={() => setGameState((prev) => ({ ...prev, duration }))}
                    >
                      {Math.floor(duration / 60)}min
                    </Button>
                  ))}
                </div>
              </div>

              {/* Energy Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Energy Levels Preview</label>
                <EnergyMeter level={5} className="max-w-sm" />
                <p className="text-xs text-gray-500 mt-2">
                  You'll need to adjust your speaking energy from 1 (very calm) to 9 (maximum intensity)
                </p>
              </div>

              <div className="text-center">
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => setShowInstructions(true)} variant="outline">
                    How to Play
                  </Button>
                  <Button onClick={startGame} size="lg" className="bg-[#4F46E5] hover:bg-[#4338CA]">
                    {micPermission === null ? "Enable Microphone & Start" : "Start Speaking"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <GameModal
          isOpen={showInstructions}
          onClose={() => setShowInstructions(false)}
          title="How to Play The Conductor"
          description="Master vocal energy control while speaking"
        >
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">🎯 Objective</h4>
              <p>Speak continuously on your chosen topic while adapting your vocal energy to match changing targets.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">🎮 How to Play</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Choose a topic you're comfortable discussing</li>
                <li>Speak continuously about that topic</li>
                <li>Watch for energy level changes and adapt your voice</li>
                <li>Level 1 = whisper calm, Level 9 = maximum enthusiasm</li>
                <li>Take breathing breaks when "BREATHE" appears</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">🤖 AI Analysis</h4>
              <p>AI will analyze your vocal energy patterns, measuring your adaptability, consistency, and energy range usage!</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">🏆 Scoring</h4>
              <p>Get detailed feedback on your energy control, adaptation speed, and vocal consistency.</p>
            </div>
          </div>
        </GameModal>
      </GameLayout>
    )
  }

  if (phase === "playing") {
    return (
      <GameLayout title="The Conductor">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Topic and Timer */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700">Speaking Topic:</h2>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{gameState.topic}</h1>
            <div className="text-lg text-gray-600">
              Time Remaining: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, "0")}
            </div>
          </div>

          {/* Breathe Mode Overlay */}
          {gameState.breatheMode && (
            <div className="fixed inset-0 bg-blue-500/20 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 shadow-2xl text-center">
                <Wind className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-pulse" />
                <h2 className="text-3xl font-bold text-blue-600 mb-2">BREATHE</h2>
                <p className="text-gray-600">Take a moment to breathe and relax</p>
              </div>
            </div>
          )}

          {/* Energy Display */}
          <div className="space-y-6">
            <div className="text-4xl md:text-5xl font-bold text-gray-900">
              ENERGY {gameState.targetEnergy} — {getEnergyLabel(gameState.targetEnergy)}
            </div>

            <EnergyMeter
              level={gameState.currentEnergy}
              targetLevel={gameState.targetEnergy}
              className="max-w-lg mx-auto"
              showTarget={true}
            />
          </div>

          {/* Microphone Indicator */}
          <div className="flex justify-center">
            <MicIndicator
              isActive={isTimerActive}
              isRecording={isRecording}
              hasPermission={micPermission || false}
              size="lg"
            />
          </div>

          {/* Instructions */}
          <div className="text-lg text-gray-600 max-w-2xl mx-auto">
            {gameState.breatheMode ? (
              <span className="text-blue-600 font-medium">Take deep breaths and relax...</span>
            ) : (
              <span>
                Keep speaking about <strong>{gameState.topic}</strong> and match the energy level shown above!
              </span>
            )}
          </div>

          {/* Live Stats */}
          <div className="flex justify-center gap-8 text-sm text-gray-500">
            <div>Transitions: {gameState.totalTransitions}</div>
            <div>Successful: {gameState.successfulTransitions}</div>
            <div>Success Rate: {gameState.totalTransitions > 0 ? Math.round((gameState.successfulTransitions / gameState.totalTransitions) * 100) : 0}%</div>
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
      <GameLayout title="Conductor Results">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 rounded-full bg-blue-100">
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
              <CardTitle className="text-2xl">Excellent Conducting!</CardTitle>
              <CardDescription>Here's your vocal energy control analysis</CardDescription>
            </CardHeader>
          </Card>

          {/* Main Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className={`text-3xl font-bold mb-2 ${getScoreColor(gameResults.overall_score)}`}>
                  {gameResults.overall_score}/10
                </div>
                <p className="text-sm text-gray-600">Overall Score</p>
                <Badge variant={getScoreBadgeVariant(gameResults.overall_score)} className="mt-2">
                  {gameResults.overall_score >= 8 ? "Excellent" : 
                   gameResults.overall_score >= 6 ? "Good" : 
                   gameResults.overall_score >= 4 ? "Fair" : "Needs Work"}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-6 w-6 text-green-500 mr-2" />
                  <span className="text-2xl font-bold">{gameResults.success_rate}%</span>
                </div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-xs text-gray-500 mt-1">
                  {gameResults.successful_transitions}/{gameResults.total_transitions} transitions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Zap className="h-6 w-6 text-yellow-500 mr-2" />
                  <span className="text-2xl font-bold">{gameResults.adaptability_score}/10</span>
                </div>
                <p className="text-sm text-gray-600">Adaptability</p>
                <p className="text-xs text-gray-500 mt-1">
                  {gameResults.avg_adaptation_speed.toFixed(1)}s avg speed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Target className="h-6 w-6 text-blue-500 mr-2" />
                  <span className="text-2xl font-bold">{gameResults.consistency_score}/10</span>
                </div>
                <p className="text-sm text-gray-600">Consistency</p>
                <p className="text-xs text-gray-500 mt-1">
                  Energy stability
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Performance Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Transition Score</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(gameResults.transition_score / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold">{gameResults.transition_score}/10</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Adaptability</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(gameResults.adaptability_score / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold">{gameResults.adaptability_score}/10</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Energy Range</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(gameResults.energy_range_score / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold">{gameResults.energy_range_score}/10</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Consistency</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(gameResults.consistency_score / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold">{gameResults.consistency_score}/10</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Session Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Session Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-gray-900">
                      {Math.floor(gameResults.duration / 60)}:{(gameResults.duration % 60).toString().padStart(2, "0")}
                    </div>
                    <p className="text-xs text-gray-600">Duration</p>
                  </div>
                  
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-gray-900">{gameResults.energy_changes_detected}</div>
                    <p className="text-xs text-gray-600">Energy Changes Detected</p>
                  </div>

                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-gray-900">{gameResults.total_transitions}</div>
                    <p className="text-xs text-gray-600">Total Transitions</p>
                  </div>

                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-gray-900">{gameResults.successful_transitions}</div>
                    <p className="text-xs text-gray-600">Successful</p>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-sm font-medium text-gray-700 mb-1">Topic:</p>
                  <p className="text-sm text-gray-600 italic">"{gameResults.topic}"</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Feedback */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Star className="h-5 w-5 text-yellow-500 mr-2" />
                AI Analysis & Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-900 leading-relaxed">{gameResults.feedback}</p>
              </div>
            </CardContent>
          </Card>

          {/* Performance Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-700">Strengths:</h4>
                  <ul className="text-sm text-green-600 space-y-1">
                    {gameResults.adaptability_score >= 7 && (
                      <li>• Excellent adaptability to energy changes</li>
                    )}
                    {gameResults.consistency_score >= 7 && (
                      <li>• Great vocal consistency and control</li>
                    )}
                    {gameResults.energy_range_score >= 7 && (
                      <li>• Good use of vocal energy range</li>
                    )}
                    {gameResults.success_rate >= 70 && (
                      <li>• High success rate in hitting targets</li>
                    )}
                    {gameResults.avg_adaptation_speed <= 2.5 && (
                      <li>• Fast adaptation to energy changes</li>
                    )}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-orange-700">Areas for Improvement:</h4>
                  <ul className="text-sm text-orange-600 space-y-1">
                    {gameResults.adaptability_score < 6 && (
                      <li>• Work on adapting more quickly to energy cues</li>
                    )}
                    {gameResults.consistency_score < 6 && (
                      <li>• Focus on maintaining stable energy when not changing</li>
                    )}
                    {gameResults.energy_range_score < 6 && (
                      <li>• Try using a wider range of vocal energies</li>
                    )}
                    {gameResults.success_rate < 60 && (
                      <li>• Practice responding more dramatically to energy levels</li>
                    )}
                    {gameResults.avg_adaptation_speed > 3 && (
                      <li>• Work on faster response times to energy changes</li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2 justify-center">
            <Button onClick={resetGame} variant="outline" size="lg">
              <RotateCcw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={() => router.push("/game3")} size="lg" className="bg-[#4F46E5] hover:bg-[#4338CA]">
              Next Game
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
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
          title="Analysis Failed"
          description="We couldn't analyze your vocal energy patterns"
        />
      </GameLayout>
    )
  }

  return null
}