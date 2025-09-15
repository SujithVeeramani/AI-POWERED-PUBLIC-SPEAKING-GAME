"use client"

import { useState } from "react"
import Link from "next/link"
import { GameLayout } from "@/components/game/game-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Trophy, TrendingUp, Clock, Play, BarChart3, Calendar, Target, Zap, Timer } from "lucide-react"

interface GameSession {
  id: string
  date: string
  gameId: number
  gameName: string
  score: number
  totalPossible: number
  duration: string
  highlights: string[]
}

interface UserStats {
  gamesPlayed: number
  avgResponseRate: number
  bestEnergyMatch: number
  totalPlayTime: string
  favoriteGame: string
  improvementTrend: "up" | "down" | "stable"
}

export default function DashboardPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<"week" | "month" | "all">("month")

  // Mock user data - in a real app, this would come from an API
  const userStats: UserStats = {
    gamesPlayed: 24,
    avgResponseRate: 78,
    bestEnergyMatch: 85,
    totalPlayTime: "2h 45m",
    favoriteGame: "The Conductor",
    improvementTrend: "up",
  }

  const recentSessions: GameSession[] = [
    {
      id: "1",
      date: "2024-01-15",
      gameId: 1,
      gameName: "Rapid Fire Analogies",
      score: 18,
      totalPossible: 20,
      duration: "3m 45s",
      highlights: ["Fast responses", "Creative analogies"],
    },
    {
      id: "2",
      date: "2024-01-14",
      gameId: 2,
      gameName: "The Conductor",
      score: 85,
      totalPossible: 100,
      duration: "4m 12s",
      highlights: ["Smooth energy transitions", "Great topic flow"],
    },
    {
      id: "3",
      date: "2024-01-13",
      gameId: 3,
      gameName: "Triple Step",
      score: 12,
      totalPossible: 16,
      duration: "2m 58s",
      highlights: ["Natural word integration", "Maintained coherence"],
    },
    {
      id: "4",
      date: "2024-01-12",
      gameId: 1,
      gameName: "Rapid Fire Analogies",
      score: 16,
      totalPossible: 20,
      duration: "3m 22s",
      highlights: ["Improved speed", "Better vocabulary"],
    },
    {
      id: "5",
      date: "2024-01-11",
      gameId: 2,
      gameName: "The Conductor",
      score: 92,
      totalPossible: 100,
      duration: "5m 01s",
      highlights: ["Perfect energy control", "Excellent adaptation"],
    },
  ]

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getGameIcon = (gameId: number) => {
    switch (gameId) {
      case 1:
        return <Zap className="h-4 w-4" />
      case 2:
        return <BarChart3 className="h-4 w-4" />
      case 3:
        return <Timer className="h-4 w-4" />
      default:
        return <Play className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <GameLayout title="Dashboard" showBackButton={false}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* User Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                <AvatarFallback className="bg-[#4F46E5] text-white text-xl">
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">Welcome back, Speaker!</h1>
                <p className="text-gray-600">Ready to improve your public speaking skills?</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Member since</div>
                <div className="font-medium">January 2024</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8 text-yellow-500" />
                <div>
                  <div className="text-2xl font-bold">{userStats.gamesPlayed}</div>
                  <div className="text-sm text-gray-600">Games Played</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-[#4F46E5]" />
                <div>
                  <div className="text-2xl font-bold">{userStats.avgResponseRate}%</div>
                  <div className="text-sm text-gray-600">Avg Response Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">{userStats.bestEnergyMatch}%</div>
                  <div className="text-sm text-gray-600">Best Energy Match</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">{userStats.totalPlayTime}</div>
                  <div className="text-sm text-gray-600">Total Practice</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Progress Overview
                </CardTitle>
                <CardDescription>Your speaking skills are improving!</CardDescription>
              </div>
              <div className="flex gap-2">
                {["week", "month", "all"].map((timeframe) => (
                  <Button
                    key={timeframe}
                    variant={selectedTimeframe === timeframe ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTimeframe(timeframe as "week" | "month" | "all")}
                  >
                    {timeframe === "all" ? "All Time" : `This ${timeframe}`}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Response Speed</span>
                  <span className="text-sm text-gray-500">+12%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-[#4F46E5] h-2 rounded-full" style={{ width: "78%" }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Energy Control</span>
                  <span className="text-sm text-gray-500">+8%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: "85%" }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Word Integration</span>
                  <span className="text-sm text-gray-500">+15%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "72%" }} />
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">Great progress!</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                You've improved your overall speaking performance by 12% this month. Your favorite game is{" "}
                <strong>{userStats.favoriteGame}</strong> - keep practicing!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Sessions
            </CardTitle>
            <CardDescription>Your latest practice sessions and achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-gray-100">{getGameIcon(session.gameId)}</div>
                    <div>
                      <div className="font-medium">{session.gameName}</div>
                      <div className="text-sm text-gray-500">{formatDate(session.date)}</div>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-lg font-bold ${getScoreColor(session.score, session.totalPossible)}`}>
                        {session.score}/{session.totalPossible}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {Math.round((session.score / session.totalPossible) * 100)}%
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      {session.highlights.slice(0, 2).map((highlight, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {highlight}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-gray-500">{session.duration}</div>
                    <Link href={`/results?game=${session.gameId}&score=${session.score}`}>
                      <Button variant="ghost" size="sm" className="mt-1">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <Button variant="outline">View All Sessions</Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Continue Practicing</CardTitle>
            <CardDescription>Jump back into your favorite games</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Link href="/game1">
                <Button variant="outline" className="w-full h-auto p-4 flex flex-col gap-2 bg-transparent">
                  <Zap className="h-6 w-6 text-orange-500" />
                  <span className="font-medium">Rapid Fire Analogies</span>
                  <span className="text-xs text-gray-500">Last played: 2 days ago</span>
                </Button>
              </Link>

              <Link href="/game2">
                <Button variant="outline" className="w-full h-auto p-4 flex flex-col gap-2 bg-transparent">
                  <BarChart3 className="h-6 w-6 text-blue-500" />
                  <span className="font-medium">The Conductor</span>
                  <span className="text-xs text-gray-500">Your best game!</span>
                </Button>
              </Link>

              <Link href="/game3">
                <Button variant="outline" className="w-full h-auto p-4 flex flex-col gap-2 bg-transparent">
                  <Timer className="h-6 w-6 text-green-500" />
                  <span className="font-medium">Triple Step</span>
                  <span className="text-xs text-gray-500">Room for improvement</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </GameLayout>
  )
}
