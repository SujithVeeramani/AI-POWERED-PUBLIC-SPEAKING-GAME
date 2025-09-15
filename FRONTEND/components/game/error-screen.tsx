// components/game/error-screen.tsx
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, RotateCcw } from "lucide-react"

interface ErrorScreenProps {
  error: string
  onRetry?: () => void
  onReset?: () => void
  title?: string
  description?: string
}

export function ErrorScreen({ 
  error, 
  onRetry, 
  onReset,
  title = "Something went wrong",
  description = "We encountered an error while processing your game"
}: ErrorScreenProps) {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <Card className="border-2 border-red-200">
        <CardHeader>
          <div className="mx-auto mb-4 p-3 rounded-full bg-red-100">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-700">{title}</CardTitle>
          <CardDescription className="text-lg">{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-700">
              <strong>Error details:</strong> {error}
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="text-left bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Possible solutions:</h4>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>Check your internet connection</li>
                <li>Make sure the backend server is running (localhost:5005)</li>
                <li>Ensure Ollama is running with Mistral model</li>
                <li>Try refreshing the page</li>
              </ul>
            </div>
            
            <div className="flex gap-3 justify-center">
              {onRetry && (
                <Button onClick={onRetry} variant="outline" className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
              )}
              {onReset && (
                <Button onClick={onReset} className="flex items-center gap-2 bg-red-600 hover:bg-red-700">
                  <RotateCcw className="h-4 w-4" />
                  Reset Game
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}