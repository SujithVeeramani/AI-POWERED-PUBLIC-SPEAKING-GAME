"use client"

import { cn } from "@/lib/utils"
import { Mic, MicOff } from "lucide-react"

interface MicIndicatorProps {
  isActive: boolean
  isRecording?: boolean
  hasPermission?: boolean
  className?: string
  size?: "sm" | "md" | "lg"
}

export function MicIndicator({
  isActive,
  isRecording = false,
  hasPermission = true,
  className,
  size = "md",
}: MicIndicatorProps) {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20",
  }

  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  }

  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full border-2 transition-all duration-300",
        sizeClasses[size],
        {
          // Active and recording - pulsing green glow
          "border-green-500 bg-green-50 shadow-lg": isActive && isRecording && hasPermission,
          // Active but not recording - blue border
          "border-[#4F46E5] bg-blue-50": isActive && !isRecording && hasPermission,
          // No permission - red border
          "border-red-500 bg-red-50": !hasPermission,
          // Inactive - gray border
          "border-gray-300 bg-gray-50": !isActive && hasPermission,
        },
        className,
      )}
    >
      {/* Pulsing animation when recording */}
      {isActive && isRecording && hasPermission && (
        <div className="absolute inset-0 rounded-full bg-green-400 opacity-20 animate-ping" />
      )}

      {/* Microphone icon */}
      {hasPermission ? (
        <Mic
          className={cn(iconSizes[size], {
            "text-green-600": isActive && isRecording,
            "text-[#4F46E5]": isActive && !isRecording,
            "text-gray-400": !isActive,
          })}
        />
      ) : (
        <MicOff className={cn(iconSizes[size], "text-red-500")} />
      )}
    </div>
  )
}
