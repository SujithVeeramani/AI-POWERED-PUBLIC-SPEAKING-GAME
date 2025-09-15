"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { GameLayout } from "@/components/game/game-layout"
import { GameTimer } from "@/components/game/game-timer"
import { MicIndicator } from "@/components/game/mic-indicator"
import { ProgressBar } from "@/components/game/progress-bar"
import { GameModal } from "@/components/game/game-modal"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Timer, RotateCcw, ArrowRight, Target } from "lucide-react"

type GamePhase = "setup" | "playing" | "results"

interface WordIntegration {
  word: string
  timestamp: number
  integrated: boolean
  integrationTime?: number
  smoothnessScore: number // 1-10 scale
}

interface GameState {
  topic: string
  wordFrequency: number // seconds between words
  currentWord: string
  wordIntegrations: WordIntegration[]
  totalWords: number
  integratedWords: number
  startTime?: number
  gameEnded: boolean
  showingWord: boolean
  wordStartTime?: number
}

const TOPICS = [
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

const RANDOM_WORDS = [
  // Easy words
  "butterfly",
  "mountain",
  "coffee",
  "rainbow",
  "guitar",
  "ocean",
  "library",
  "garden",
  "telescope",
  "bicycle",
  "sandwich",
  "umbrella",
  "keyboard",
  "elephant",
  "chocolate",
  "adventure",
  "friendship",
  "sunshine",
  "mystery",
  "journey",

  // Medium words
  "serendipity",
  "kaleidoscope",
  "metamorphosis",
  "constellation",
  "archaeology",
  "philosophy",
  "democracy",
  "symphony",
  "architecture",
  "photography",
  "psychology",
  "geography",
  "astronomy",
  "biology",
  "chemistry",
  "mathematics",

  // Challenging words
  "juxtaposition",
  "ephemeral",
  "ubiquitous",
  "paradigm",
  "catalyst",
  "synthesis",
  "equilibrium",
  "phenomenon",
  "infrastructure",
  "sustainability",
  "optimization",
  "collaboration",
  "transformation",
  "implementation",
  "visualization",
  "crystallization",
  "diversification",
  "standardization",
  "personalization",
  "globalization",
]

export default function Game3Page() {
  const router = useRouter()
  const [phase, setPhase] = useState<GamePhase>("setup")
  const [gameState, setGameState] = useState<GameState>({
    topic: TOPICS[0],
    wordFrequency: 30,
    currentWord: "",
    wordIntegrations: [],
    totalWords: 0,
    integratedWords: 0,
    gameEnded: false,
    showingWord: false,
  })
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [micPermission, setMicPermission] = useState<boolean | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [wordTimer, setWordTimer] = useState(5) // 5 seconds to integrate each word
  const [gameTimer, setGameTimer] = useState(120) // 2 minute game
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium")

  // Get random word based on difficulty
  const getRandomWord = useCallback(() => {
    let wordPool: string[]
    switch (difficulty) {
      case "easy":
        wordPool = RANDOM_WORDS.slice(0, 20)
        break
      case "medium":
        wordPool = RANDOM_WORDS.slice(20, 36)
        break
      case "hard":
        wordPool = RANDOM_WORDS.slice(36)
        break
      default:
        wordPool = RANDOM_WORDS.slice(20, 36)
    }
    return wordPool[Math.floor(Math.random() * wordPool.length)]
  }, [difficulty])

  // Present new word
  const presentNewWord = useCallback(() => {
    if (!isTimerActive || gameState.gameEnded) return

    const newWord = getRandomWord()
    setGameState((prev) => ({
      ...prev,
      currentWord: newWord,
      showingWord: true,
      wordStartTime: Date.now(),
      totalWords: prev.totalWords + 1,
    }))
    setWordTimer(5) // Reset word integration timer
  }, [isTimerActive, gameState.gameEnded, getRandomWord])

  // Handle word integration (simulated)
  const handleWordIntegration = useCallback(() => {
    if (!gameState.showingWord || !gameState.currentWord) return

    // Simulate integration success (75% chance)
    const integrated = Math.random() > 0.25
    const integrationTime = Date.now() - (gameState.wordStartTime || 0)
    const smoothnessScore = integrated ? Math.floor(Math.random() * 4) + 7 : Math.floor(Math.random() * 3) + 3 // 7-10 for success, 3-5 for failure

    setGameState((prev) => ({
      ...prev,
      wordIntegrations: [
        ...prev.wordIntegrations,
        {
          word: prev.currentWord,
          timestamp: Date.now(),
          integrated,
          integrationTime,
          smoothnessScore,
        },
      ],
      integratedWords: integrated ? prev.integratedWords + 1 : prev.integratedWords,
      showingWord: false,
      currentWord: "",
    }))
  }, [gameState.showingWord, gameState.currentWord, gameState.wordStartTime])

  // Word timer countdown
  useEffect(() => {
    if (!gameState.showingWord || wordTimer <= 0) return

    const interval = setInterval(() => {
      setWordTimer((prev) => {
        if (prev <= 1) {
          handleWordIntegration()
          return 5
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [gameState.showingWord, wordTimer, handleWordIntegration])

  // Game timer countdown
  useEffect(() => {
    if (!isTimerActive || gameTimer <= 0) return

    const interval = setInterval(() => {
      setGameTimer((prev) => {
        if (prev <= 1) {
          setIsTimerActive(false)
          setGameState((prevState) => ({ ...prevState, gameEnded: true }))
          setPhase("results")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isTimerActive, gameTimer])

  // Word presentation intervals
  useEffect(() => {
    if (!isTimerActive || gameState.gameEnded) return

    const interval = setInterval(presentNewWord, gameState.wordFrequency * 1000)
    return () => clearInterval(interval)
  }, [isTimerActive, gameState.gameEnded, gameState.wordFrequency, presentNewWord])

  // Request microphone permission
  const requestMicPermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
      setMicPermission(true)
    } catch (error) {
      setMicPermission(false)
    }
  }

  // Start the game
  const startGame = async () => {
    if (micPermission === null) {
      await requestMicPermission()
      return
    }
    if (!micPermission) {
      alert("Microphone permission is required to play this game.")
      return
    }

    setGameState((prev) => ({
      ...prev,
      startTime: Date.now(),
      wordIntegrations: [],
      totalWords: 0,
      integratedWords: 0,
      gameEnded: false,
      showingWord: false,
      currentWord: "",
    }))
    setGameTimer(120) // 2 minutes
    setPhase("playing")
    setIsRecording(true)
    setTimeout(() => {
      setIsTimerActive(true)
      presentNewWord() // Present first word after 2 seconds
    }, 2000)
  }

  // Reset game
  const resetGame = () => {
    setPhase("setup")
    setIsTimerActive(false)
    setIsRecording(false)
    setGameTimer(120)
    setWordTimer(5)
    setGameState((prev) => ({
      ...prev,
      wordIntegrations: [],
      totalWords: 0,
      integratedWords: 0,
      gameEnded: false,
      showingWord: false,
      currentWord: "",
    }))
  }

  // Calculate results
  const integrationRate = gameState.totalWords > 0 ? (gameState.integratedWords / gameState.totalWords) * 100 : 0
  const avgSmoothness =
    gameState.wordIntegrations.length > 0
      ? gameState.wordIntegrations.reduce((acc, integration) => acc + integration.smoothnessScore, 0) /
        gameState.wordIntegrations.length
      : 0
  const missedWords = gameState.wordIntegrations.filter((integration) => !integration.integrated)

  if (phase === "setup") {
    return (
      <GameLayout title="Triple Step">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 rounded-full bg-green-100">
                <Timer className="h-8 w-8 text-green-500" />
              </div>
              <CardTitle className="text-2xl">Triple Step</CardTitle>
              <CardDescription className="text-lg">
                Weave random words into your ongoing speech without losing topic flow
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Topic Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Speaking Topic</label>
                <Select
                  value={gameState.topic}
                  onValueChange={(value) => setGameState((prev) => ({ ...prev, topic: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TOPICS.map((topic) => (
                      <SelectItem key={topic} value={topic}>
                        {topic}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Difficulty Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                <div className="flex gap-2">
                  {[
                    { value: "easy", label: "Easy", desc: "Simple words" },
                    { value: "medium", label: "Medium", desc: "Moderate words" },
                    { value: "hard", label: "Hard", desc: "Complex words" },
                  ].map((diff) => (
                    <Button
                      key={diff.value}
                      variant={difficulty === diff.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDifficulty(diff.value as "easy" | "medium" | "hard")}
                      className="flex-1 flex-col h-auto py-3"
                    >
                      <span className="font-medium">{diff.label}</span>
                      <span className="text-xs opacity-70">{diff.desc}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Word Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Word Frequency: Every {gameState.wordFrequency} seconds
                </label>
                <Slider
                  value={[gameState.wordFrequency]}
                  onValueChange={([value]) => setGameState((prev) => ({ ...prev, wordFrequency: value }))}
                  min={20}
                  max={40}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>20s</span>
                  <span>25s</span>
                  <span>30s</span>
                  <span>35s</span>
                  <span>40s</span>
                </div>
              </div>

              {/* Game Preview */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Game Preview</h4>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Topic:</strong> {gameState.topic}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Challenge:</strong> Integrate random words every {gameState.wordFrequency} seconds while
                  staying on topic
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
          title="How to Play Triple Step"
          description="Master the art of seamless word integration"
        >
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">🎯 Objective</h4>
              <p>Speak continuously about your topic while smoothly integrating random words that appear on screen.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">🎮 How to Play</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Start speaking about your chosen topic</li>
                <li>Random words will appear every 20-40 seconds</li>
                <li>You have 5 seconds to integrate each word naturally</li>
                <li>Keep your speech flowing and stay on topic</li>
                <li>Don't force the words - make them feel natural</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">🏆 Scoring</h4>
              <p>You're scored on integration success rate and how smoothly you maintain topic flow.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">💡 Tips</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Use metaphors and analogies to connect words</li>
                <li>Think of the word as an example or illustration</li>
                <li>Don't pause - keep the conversation flowing</li>
              </ul>
            </div>
          </div>
        </GameModal>
      </GameLayout>
    )
  }

  if (phase === "playing") {
    return (
      <GameLayout title="Triple Step">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Topic and Timer */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700">Speaking Topic:</h2>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{gameState.topic}</h1>
            <div className="text-lg text-gray-600">
              Time Remaining: {Math.floor(gameTimer / 60)}:{(gameTimer % 60).toString().padStart(2, "0")}
            </div>
          </div>

          {/* Progress */}
          <ProgressBar
            current={gameState.integratedWords}
            total={gameState.totalWords}
            label="Words Integrated"
            className="max-w-md mx-auto"
          />

          {/* Current Word Display */}
          <div className="space-y-6">
            {gameState.showingWord && gameState.currentWord ? (
              <div className="animate-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white border-2 border-[#4F46E5] rounded-lg p-8 shadow-lg max-w-md mx-auto">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <Target className="h-6 w-6 text-[#4F46E5]" />
                    <span className="text-sm font-medium text-gray-600">INTEGRATE THIS WORD:</span>
                  </div>
                  <div className="text-4xl font-bold text-[#4F46E5] mb-4">{gameState.currentWord}</div>
                  <div className="flex items-center justify-center gap-2">
                    <GameTimer duration={5} isActive={gameState.showingWord} size="sm" />
                    <span className="text-sm text-gray-600">{wordTimer}s remaining</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-2xl text-gray-500 min-h-[200px] flex items-center justify-center">
                Keep speaking about <strong>{gameState.topic}</strong>...
                <br />
                <span className="text-lg">
                  Next word in{" "}
                  {Math.ceil(
                    (gameState.wordFrequency * 1000 -
                      ((Date.now() - (gameState.startTime || 0)) % (gameState.wordFrequency * 1000))) /
                      1000,
                  )}
                  s
                </span>
              </div>
            )}
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

          {/* Game Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto text-center">
            <div className="bg-white p-3 rounded-lg shadow">
              <div className="text-2xl font-bold text-[#4F46E5]">{gameState.totalWords}</div>
              <div className="text-xs text-gray-600">Words Seen</div>
            </div>
            <div className="bg-white p-3 rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">{gameState.integratedWords}</div>
              <div className="text-xs text-gray-600">Integrated</div>
            </div>
            <div className="bg-white p-3 rounded-lg shadow">
              <div className="text-2xl font-bold text-gray-900">
                {gameState.totalWords > 0 ? Math.round(integrationRate) : 0}%
              </div>
              <div className="text-xs text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      </GameLayout>
    )
  }

  if (phase === "results") {
    return (
      <GameLayout title="Game Results">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Masterful Integration!</CardTitle>
              <CardDescription>Here's your word weaving performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main Score */}
              <div className="text-center">
                <div className="text-4xl font-bold text-[#4F46E5] mb-2">{Math.round(integrationRate)}%</div>
                <p className="text-gray-600">Integration Success Rate</p>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {gameState.integratedWords}/{gameState.totalWords}
                  </div>
                  <p className="text-sm text-gray-600">Words Integrated</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{avgSmoothness.toFixed(1)}/10</div>
                  <p className="text-sm text-gray-600">Avg Smoothness</p>
                </div>
              </div>

              {/* Missed Words */}
              {missedWords.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Missed Words ({missedWords.length})</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {missedWords.map((integration, index) => (
                      <div key={index} className="text-sm bg-red-50 text-red-700 p-2 rounded border">
                        {integration.word}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Successfully Integrated Words */}
              {gameState.wordIntegrations.filter((w) => w.integrated).length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Successfully Integrated</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {gameState.wordIntegrations
                      .filter((w) => w.integrated)
                      .map((integration, index) => (
                        <div
                          key={index}
                          className="text-sm bg-green-50 text-green-700 p-2 rounded border flex justify-between"
                        >
                          <span>{integration.word}</span>
                          <span className="text-xs opacity-70">{integration.smoothnessScore}/10</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Performance Feedback */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Performance Insights</h4>
                <div className="text-sm text-green-800 space-y-1">
                  {integrationRate >= 80 && <p>🎉 Exceptional word integration! You're a natural storyteller.</p>}
                  {integrationRate >= 60 && integrationRate < 80 && (
                    <p>👍 Great job weaving words into your speech! Keep practicing for even smoother integration.</p>
                  )}
                  {integrationRate < 60 && (
                    <p>
                      💪 Room for improvement! Try using metaphors and examples to connect random words to your topic.
                    </p>
                  )}
                  {avgSmoothness >= 8 && (
                    <p>🌟 Your speech flow was incredibly smooth! Listeners barely noticed the word integrations.</p>
                  )}
                  {avgSmoothness >= 6 && avgSmoothness < 8 && (
                    <p>✨ Good speech flow with natural-sounding integrations.</p>
                  )}
                  {gameState.totalWords > 0 && (
                    <p>
                      🎯 You handled {gameState.totalWords} word challenges during your {Math.floor(120 / 60)}-minute
                      speech.
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-center">
                <Button onClick={resetGame} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  onClick={() => {
                    setDifficulty(difficulty === "easy" ? "medium" : difficulty === "medium" ? "hard" : "hard")
                    resetGame()
                  }}
                  variant="outline"
                >
                  Harder Words
                </Button>
                <Button onClick={() => router.push("/dashboard")} className="bg-[#4F46E5] hover:bg-[#4338CA]">
                  View Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </GameLayout>
    )
  }

  return null
}
