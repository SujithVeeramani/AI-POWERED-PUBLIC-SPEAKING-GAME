"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface GameTimerProps {
  duration: number // in seconds
  isActive: boolean
  onComplete?: () => void
  size?: "sm" | "md" | "lg"
  className?: string
}

export function GameTimer({ duration, isActive, onComplete, size = "md", className }: GameTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration)

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  }

  const textSizes = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
  }

  // Reset timeLeft when duration changes (new timer)
  useEffect(() => {
    setTimeLeft(duration)
  }, [duration])

  // Main timer effect
  useEffect(() => {
    if (!isActive || timeLeft <= 0) return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1
        
        // When we reach 0, clear interval and call onComplete
        if (newTime <= 0) {
          clearInterval(interval)
          // Use requestAnimationFrame to ensure this happens after render
          requestAnimationFrame(() => {
            if (onComplete) {
              onComplete()
            }
          })
          return 0
        }
        
        return newTime
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, timeLeft, onComplete])

  const progress = ((duration - timeLeft) / duration) * 100
  const circumference = 2 * Math.PI * 45 // radius of 45
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className={cn("relative flex items-center justify-center", sizeClasses[size], className)}>
      <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="currentColor"
          strokeWidth="4"
          fill="transparent"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="currentColor"
          strokeWidth="4"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={cn(
            "transition-all duration-1000 ease-linear",
            timeLeft <= 3 ? "text-red-500" : timeLeft <= 10 ? "text-yellow-500" : "text-[#4F46E5]",
          )}
          strokeLinecap="round"
        />
      </svg>
      <div className={cn("absolute inset-0 flex items-center justify-center font-bold", textSizes[size])}>
        {timeLeft}
      </div>
    </div>
  )
}