"use client"

import { cn } from "@/lib/utils"

interface ProgressBarProps {
  current: number
  total: number
  label?: string
  className?: string
  showNumbers?: boolean
}

export function ProgressBar({ current, total, label, className, showNumbers = true }: ProgressBarProps) {
  const percentage = Math.min((current / total) * 100, 100)

  return (
    <div className={cn("w-full", className)}>
      {(label || showNumbers) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
          {showNumbers && (
            <span className="text-sm text-gray-500">
              {current}/{total}
            </span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#4F46E5] to-[#6366F1] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
