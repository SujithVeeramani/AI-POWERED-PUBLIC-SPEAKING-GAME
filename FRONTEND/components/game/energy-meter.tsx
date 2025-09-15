"use client"

import { cn } from "@/lib/utils"

interface EnergyMeterProps {
  level: number // 1-9
  targetLevel?: number
  className?: string
  showTarget?: boolean
}

export function EnergyMeter({ level, targetLevel, className, showTarget = true }: EnergyMeterProps) {
  const maxLevel = 9
  const normalizedLevel = Math.max(1, Math.min(maxLevel, level))
  const normalizedTarget = targetLevel ? Math.max(1, Math.min(maxLevel, targetLevel)) : undefined

  const getEnergyColor = (energyLevel: number) => {
    if (energyLevel <= 3) return "bg-blue-500"
    if (energyLevel <= 6) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getEnergyLabel = (energyLevel: number) => {
    if (energyLevel <= 2) return "Very Low"
    if (energyLevel <= 3) return "Low"
    if (energyLevel <= 4) return "Calm"
    if (energyLevel <= 5) return "Normal"
    if (energyLevel <= 6) return "Energetic"
    if (energyLevel <= 7) return "High"
    if (energyLevel <= 8) return "Very High"
    return "Maximum"
  }

  return (
    <div className={cn("w-full max-w-md", className)}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">Energy Level</span>
        <span className="text-sm text-gray-500">
          {normalizedLevel} - {getEnergyLabel(normalizedLevel)}
        </span>
      </div>

      <div className="relative">
        {/* Energy bars */}
        <div className="flex gap-1 h-8">
          {Array.from({ length: maxLevel }, (_, i) => {
            const barLevel = i + 1
            const isActive = barLevel <= normalizedLevel
            const isTarget = showTarget && normalizedTarget && barLevel === normalizedTarget

            return (
              <div
                key={i}
                className={cn("flex-1 rounded-sm transition-all duration-300", {
                  [getEnergyColor(normalizedLevel)]: isActive,
                  "bg-gray-200": !isActive,
                  "ring-2 ring-gray-800 ring-offset-1": isTarget,
                })}
              />
            )
          })}
        </div>

        {/* Target indicator */}
        {showTarget && normalizedTarget && (
          <div className="mt-2 text-center">
            <span className="text-xs text-gray-600">
              Target: Level {normalizedTarget} - {getEnergyLabel(normalizedTarget)}
            </span>
          </div>
        )}
      </div>

      {/* Level labels */}
      <div className="flex justify-between mt-1 text-xs text-gray-400">
        <span>1</span>
        <span>5</span>
        <span>9</span>
      </div>
    </div>
  )
}
