// components/game/processing-screen.tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Loader2, Brain, Mic, Zap } from "lucide-react"

interface ProcessingScreenProps {
  message?: string
  progress?: number
  showProgress?: boolean
}

export function ProcessingScreen({ 
  message = "Processing your responses...", 
  progress,
  showProgress = false 
}: ProcessingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [animatedProgress, setAnimatedProgress] = useState(0)

  const processingSteps = [
    { icon: Mic, text: "Converting speech to text", duration: 3000 },
    { icon: Brain, text: "Analyzing with AI", duration: 4000 },
    { icon: Zap, text: "Calculating scores", duration: 2000 },
    { icon: Brain, text: "Generating feedback", duration: 3000 }
  ]

  useEffect(() => {
    if (!showProgress) return

    const stepDuration = 12000 / processingSteps.length // 12 seconds total
    
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < processingSteps.length - 1) {
          return prev + 1
        }
        return prev
      })
    }, stepDuration)

    // Animate progress bar
    const progressInterval = setInterval(() => {
      setAnimatedProgress((prev) => {
        if (prev < 90) { // Cap at 90% until real progress comes in
          return prev + 1
        }
        return prev
      })
    }, 100)

    return () => {
      clearInterval(interval)
      clearInterval(progressInterval)
    }
  }, [showProgress, processingSteps.length])

  useEffect(() => {
    if (progress !== undefined) {
      setAnimatedProgress(progress)
    }
  }, [progress])

  const CurrentIcon = processingSteps[currentStep]?.icon || Brain

  return (
    <div className="max-w-2xl mx-auto text-center">
      <Card className="border-2 border-blue-200">
        <CardContent className="pt-8 pb-8">
          <div className="space-y-8">
            {/* Animated Icon */}
            <div className="relative">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center border-4 border-blue-200">
                <CurrentIcon className="h-10 w-10 text-blue-600" />
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-blue-300 animate-ping opacity-30"></div>
              <Loader2 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-24 w-24 text-blue-400 animate-spin opacity-20" />
            </div>

            {/* Main Message */}
            <div>
              <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Analyzing Your Responses
              </h2>
              <p className="text-lg text-gray-600 mb-2">{message}</p>
              {showProgress && (
                <p className="text-sm text-blue-600 font-medium">
                  {processingSteps[currentStep]?.text}
                </p>
              )}
            </div>

            {/* Progress Bar */}
            <div className="max-w-md mx-auto space-y-3">
              <Progress 
                value={animatedProgress} 
                className="h-3 bg-blue-100"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Processing...</span>
                <span>{Math.round(animatedProgress)}%</span>
              </div>
            </div>

            {/* Processing Steps Indicator */}
            {showProgress && (
              <div className="flex justify-center space-x-4">
                {processingSteps.map((step, index) => {
                  const StepIcon = step.icon
                  const isActive = index <= currentStep
                  const isCurrent = index === currentStep
                  
                  return (
                    <div key={index} className="flex flex-col items-center space-y-2">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500
                        ${isCurrent ? 'bg-blue-100 border-blue-500 scale-110' : 
                          isActive ? 'bg-green-100 border-green-500' : 
                          'bg-gray-100 border-gray-300'}
                      `}>
                        <StepIcon className={`h-5 w-5 ${
                          isCurrent ? 'text-blue-600' : 
                          isActive ? 'text-green-600' : 
                          'text-gray-400'
                        }`} />
                      </div>
                      <span className={`text-xs text-center max-w-16 leading-tight ${
                        isActive ? 'text-gray-700' : 'text-gray-400'
                      }`}>
                        {step.text.split(' ').slice(0, 2).join(' ')}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Additional Info */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-start space-x-3">
                <Brain className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-medium text-blue-800 mb-1">AI Analysis in Progress</p>
                  <p className="text-xs text-blue-700">
                    Our AI is transcribing your voice recordings and analyzing each analogy for creativity, 
                    relevance, logic, and clarity. This usually takes 15-45 seconds.
                  </p>
                </div>
              </div>
            </div>

            {/* Fun Facts */}
            <div className="text-xs text-gray-500 space-y-1">
              <p>💡 Did you know? The best analogies connect unexpected concepts in meaningful ways!</p>
              <p>🧠 Our AI considers both the creativity and logical connection of your responses</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}