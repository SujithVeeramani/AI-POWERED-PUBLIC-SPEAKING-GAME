"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface GameModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export function GameModal({ isOpen, onClose, title, description, children, actions, className }: GameModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <Card className={cn("relative w-full max-w-md mx-4 shadow-2xl", className)}>
        <CardHeader className="relative">
          <Button variant="ghost" size="sm" className="absolute right-2 top-2 h-8 w-8 p-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
          <CardTitle className="text-xl pr-8">{title}</CardTitle>
          {description && <CardDescription className="text-base">{description}</CardDescription>}
        </CardHeader>
        {children && <CardContent>{children}</CardContent>}
        {actions && (
          <CardContent className="pt-0">
            <div className="flex gap-2 justify-end">{actions}</div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
