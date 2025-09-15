// components/game/enhanced-results.tsx
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Star, Brain, Target, Zap, Clock, TrendingUp, Award, MessageCircle } from "lucide-react"

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

interface EnhancedResultsProps {
  gameResults: GameResults
}

export function EnhancedResults({ gameResults }: EnhancedResultsProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'excellent': return 'bg-green-100 text-green-800 border-green-200'
      case 'good': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'fair': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'poor': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6) return 'text-blue-600'
    if (score >= 4) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPerformanceLevel = (score: number) => {
    if (score >= 8) return 'Excellent'
    if (score >= 6) return 'Good'
    if (score >= 4) return 'Fair'
    return 'Needs Improvement'
  }

  return (
    <div className="space-y-6">
      {/* Overall Performance */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="text-center bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="mx-auto mb-3 p-3 rounded-full bg-blue-100">
            <Award className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-3xl">
            Overall Score: {gameResults.avg_quality_score}/10
          </CardTitle>
          <CardDescription className="text-lg">
            {getPerformanceLevel(gameResults.avg_quality_score)} Performance
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600">
                {gameResults.completed_prompts}/{gameResults.total_prompts}
              </div>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <Star className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <div className={`text-2xl font-bold ${getScoreColor(gameResults.avg_quality_score)}`}>
                {gameResults.avg_quality_score}/10
              </div>
              <p className="text-sm text-gray-600">Avg Quality</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <Target className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(gameResults.response_rate)}%
              </div>
              <p className="text-sm text-gray-600">Response Rate</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <Clock className="h-6 w-6 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold text-orange-600">
                {(gameResults.avg_response_time / 1000).toFixed(1)}s
              </div>
              <p className="text-sm text-gray-600">Avg Time</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skill Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Skill Analysis
          </CardTitle>
          <CardDescription>
            Detailed breakdown of your analogy skills
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <Brain className="h-4 w-4 text-purple-500" />
                      Creativity
                    </span>
                    <span className={`font-bold ${getScoreColor(gameResults.score_breakdown.creativity)}`}>
                      {gameResults.score_breakdown.creativity}/10
                    </span>
                  </div>
                  <Progress 
                    value={gameResults.score_breakdown.creativity * 10} 
                    className="h-2"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-500" />
                      Relevance
                    </span>
                    <span className={`font-bold ${getScoreColor(gameResults.score_breakdown.relevance)}`}>
                      {gameResults.score_breakdown.relevance}/10
                    </span>
                  </div>
                  <Progress 
                    value={gameResults.score_breakdown.relevance * 10} 
                    className="h-2"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      Logic
                    </span>
                    <span className={`font-bold ${getScoreColor(gameResults.score_breakdown.logic)}`}>
                      {gameResults.score_breakdown.logic}/10
                    </span>
                  </div>
                  <Progress 
                    value={gameResults.score_breakdown.logic * 10} 
                    className="h-2"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-green-500" />
                      Clarity
                    </span>
                    <span className={`font-bold ${getScoreColor(gameResults.score_breakdown.clarity)}`}>
                      {gameResults.score_breakdown.clarity}/10
                    </span>
                  </div>
                  <Progress 
                    value={gameResults.score_breakdown.clarity * 10} 
                    className="h-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Responses */}
      {gameResults.top_responses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Your Best Analogies
            </CardTitle>
            <CardDescription>
              Your highest-scoring creative responses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {gameResults.top_responses.map((response, index) => (
                <div key={index} className="p-4 border rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg text-gray-800">{response.prompt}</h4>
                      <p className="text-blue-600 font-medium text-xl mt-1">
                        "{response.response}"
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 px-3 py-1">
                        <Star className="h-3 w-3 mr-1" />
                        {response.score}/10
                      </Badge>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded border-l-4 border-yellow-400">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">AI Feedback: </span>
                      {response.feedback}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Response Quality Distribution</CardTitle>
          <CardDescription>
            How your responses were categorized
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(gameResults.category_breakdown).map(([category, count]) => {
              const percentage = gameResults.completed_prompts > 0 
                ? Math.round((count / gameResults.completed_prompts) * 100) 
                : 0;
              
              return (
                <div key={category} className="text-center p-4 border rounded-lg">
                  <div className="text-3xl font-bold mb-2">{count}</div>
                  <Badge className={`${getCategoryColor(category)} mb-2`}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Badge>
                  <p className="text-xs text-gray-500">{percentage}%</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Missed Prompts */}
      {gameResults.missed_prompts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Missed Opportunities</CardTitle>
            <CardDescription>
              Prompts you didn't respond to - try these next time!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {gameResults.missed_prompts.map((prompt, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border-l-4 border-red-200">
                  <div className="w-6 h-6 rounded-full bg-red-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 text-xs font-bold">{index + 1}</span>
                  </div>
                  <span className="text-gray-700">{prompt}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Tip:</strong> Try to respond to every prompt, even with simple analogies. 
                Practice helps improve your speed and creativity!
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}