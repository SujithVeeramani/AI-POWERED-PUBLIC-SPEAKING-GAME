"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { GameLayout } from "@/components/game/game-layout"
import { AudioPlayer } from "@/components/game/audio-player"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RotateCcw, ArrowRight, Trophy, TrendingUp, Clock, Target } from "lucide-react"

interface GameResult {
  gameId: number
  gameName: string
  score: number
  totalPossible: number
  metrics: {
    responseRate?: number
    avgResponseTime?: number
    energyTransitions?: number
    integrationRate?: number
    smoothnessScore?: number
  }
  highlights: string[]
  improvements: string[]
  audioClips?: Array<{
    title: string
    src: string
    type: "best" | "worst"
  }>
}

export default function ResultsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [gameResult, setGameResult] = useState<GameResult | null>(null)

  useEffect(() => {
    // In a real app, this would fetch results based on session ID
    // For now, we'll simulate based on game parameter
    const gameId = searchParams.get("game")
    const score = searchParams.get("score")

    if (gameId) {
      // Simulate game results based on game ID
      const mockResults: Record<string, GameResult> = {
        "1": {
          gameId: 1,
          gameName: "Rapid Fire Analogies",
          score: Number.parseInt(score || "18"),
          totalPossible: 20,
          metrics: {
            responseRate: 90,
            avgResponseTime: 2.3,
          },
          highlights: [
            "Excellent response speed on business analogies",
            "Creative metaphors for abstract concepts",
            "Consistent performance throughout the session",
          ],
          improvements: [
            "Try to respond to time-related analogies faster",
            "Work on more varied vocabulary for comparisons",
          ],
          audioClips: [
            {
              title: "Best Response: 'Business is like...'",
              src: "/placeholder-audio.mp3",
              type: "best",
            },
            {
              title: "Missed: 'Time is like...'",
              src: "/placeholder-audio.mp3",
              type: "worst",
            },
          ],
        },
        "2": {
          gameId: 2,
          gameName: "The Conductor",
          score: 85,
          totalPossible: 100,
          metrics: {
            responseRate: 85,
            avgResponseTime: 1.8,
            energyTransitions: 12,
          },
          highlights: [
            "Smooth transitions between energy levels",
            "Maintained topic coherence throughout",
            "Excellent high-energy delivery",
          ],
          improvements: ["Work on lower energy levels (1-3)", "Faster adaptation to energy changes"],
          audioClips: [
            {
              title: "Perfect Energy Level 8 Transition",
              src: "/placeholder-audio.mp3",
              type: "best",
            },
          ],
        },
        "3": {
          gameId: 3,
          gameName: "Triple Step",
          score: 75,
          totalPossible: 100,
          metrics: {
            integrationRate: 75,
            smoothnessScore: 8.2,
          },
          highlights: [
            "Natural word integration techniques",
            "Maintained topic flow effectively",
            "Creative use of metaphors",
          ],
          improvements: ["Practice with more challenging vocabulary", "Reduce pause time before integration"],
          audioClips: [
            {
              title: "Smooth 'Serendipity' Integration",
              src: "/placeholder-audio.mp3",
              type: "best",
            },
            {
              title: "Missed 'Kaleidoscope' Integration",
              src: "/placeholder-audio.mp3",
              type: "worst",
            },
          ],
        },
      }

      setGameResult(mockResults[gameId] || null)
    }
  }, [searchParams])

  if (!gameResult) {
    return (
      <GameLayout title="Game Results">
        <div className="max-w-2xl mx-auto text-center">
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-600 mb-4">No game results found.</p>
              <Button onClick={() => router.push("/")} className="bg-[#4F46E5] hover:bg-[#4338CA]">
                Back to Games
              </Button>
            </CardContent>
          </Card>
        </div>
      </GameLayout>
    )
  }

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadge = (score: number, total: number) => {
    const percentage = (score / total) * 100
    if (percentage >= 90) return { label: "Excellent", variant: "default" as const }
    if (percentage >= 80) return { label: "Great", variant: "secondary" as const }
    if (percentage >= 70) return { label: "Good", variant: "outline" as const }
    if (percentage >= 60) return { label: "Fair", variant: "outline" as const }
    return { label: "Needs Practice", variant: "destructive" as const }
  }

  const scoreBadge = getScoreBadge(gameResult.score, gameResult.totalPossible)

  return (
    <GameLayout title="Game Results">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Trophy className="h-8 w-8 text-yellow-500" />
              <CardTitle className="text-2xl">{gameResult.gameName} Complete!</CardTitle>
            </div>
            <CardDescription>Here's your detailed performance analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-4">
                <div className={`text-5xl font-bold ${getScoreColor(gameResult.score, gameResult.totalPossible)}`}>
                  {gameResult.score}
                  <span className="text-2xl text-gray-500">/{gameResult.totalPossible}</span>
                </div>
                <Badge variant={scoreBadge.variant} className="text-sm px-3 py-1">
                  {scoreBadge.label}
                </Badge>
              </div>
              <div className="text-lg text-gray-600">
                {Math.round((gameResult.score / gameResult.totalPossible) * 100)}% Success Rate
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gameResult.metrics.responseRate && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-[#4F46E5]" />
                  <div>
                    <div className="text-2xl font-bold">{gameResult.metrics.responseRate}%</div>
                    <div className="text-sm text-gray-600">Response Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {gameResult.metrics.avgResponseTime && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-[#4F46E5]" />
                  <div>
                    <div className="text-2xl font-bold">{gameResult.metrics.avgResponseTime}s</div>
                    <div className="text-sm text-gray-600">Avg Response Time</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {gameResult.metrics.energyTransitions && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-[#4F46E5]" />
                  <div>
                    <div className="text-2xl font-bold">{gameResult.metrics.energyTransitions}</div>
                    <div className="text-sm text-gray-600">Energy Transitions</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {gameResult.metrics.integrationRate && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-[#4F46E5]" />
                  <div>
                    <div className="text-2xl font-bold">{gameResult.metrics.integrationRate}%</div>
                    <div className="text-sm text-gray-600">Integration Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {gameResult.metrics.smoothnessScore && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-[#4F46E5]" />
                  <div>
                    <div className="text-2xl font-bold">{gameResult.metrics.smoothnessScore}/10</div>
                    <div className="text-sm text-gray-600">Smoothness Score</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Highlights and Improvements */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-green-700">🎉 Highlights</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {gameResult.highlights.map((highlight, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    {highlight}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-blue-700">💡 Areas for Improvement</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {gameResult.improvements.map((improvement, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    {improvement}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Audio Playback */}
        {gameResult.audioClips && gameResult.audioClips.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🎧 Audio Highlights</CardTitle>
              <CardDescription>Listen to your best and challenging moments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {gameResult.audioClips.map((clip, index) => (
                <AudioPlayer
                  key={index}
                  src={clip.src}
                  title={clip.title}
                  className={clip.type === "best" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}
                />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <Button onClick={() => router.push(`/game${gameResult.gameId}`)} variant="outline" size="lg">
            <RotateCcw className="h-4 w-4 mr-2" />
            Play Again
          </Button>
          <Button onClick={() => router.push("/dashboard")} className="bg-[#4F46E5] hover:bg-[#4338CA]" size="lg">
            View Dashboard
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </GameLayout>
  )
}
