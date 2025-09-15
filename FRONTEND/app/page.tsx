import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Timer, Zap, BarChart3 } from "lucide-react"

export default function HomePage() {
  const games = [
    {
      id: 1,
      title: "Rapid Fire Analogies",
      description: "Complete each analogy instantly. Don't think—just speak!",
      icon: Zap,
      route: "/game1",
      color: "text-orange-500",
    },
    {
      id: 2,
      title: "The Conductor",
      description: "Speak on a topic while adjusting your vocal energy.",
      icon: BarChart3,
      route: "/game2",
      color: "text-blue-500",
    },
    {
      id: 3,
      title: "Triple Step",
      description: "Weave random words into your speech without losing flow.",
      icon: Timer,
      route: "/game3",
      color: "text-green-500",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Mic className="h-8 w-8 text-[#4F46E5]" />
              <h1 className="text-xl font-bold text-gray-900">Speaking Trainer</h1>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">AI-Powered Public Speaking Trainer</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Improve your public speaking skills with three gamified exercises. Get real-time feedback on response speed,
            vocal energy, and topic coherence.
          </p>
        </div>

        {/* Game Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {games.map((game) => {
            const IconComponent = game.icon
            return (
              <Card key={game.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 rounded-full bg-gray-100">
                    <IconComponent className={`h-8 w-8 ${game.color}`} />
                  </div>
                  <CardTitle className="text-xl">{game.title}</CardTitle>
                  <CardDescription className="text-base">{game.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={game.route}>
                    <Button className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white" size="lg">
                      Play Now
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Features Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="p-3 rounded-full bg-[#4F46E5] text-white mb-4">
                <Mic className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">Speak Into Your Mic</h3>
              <p className="text-gray-600">Use your microphone to respond to prompts and challenges</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="p-3 rounded-full bg-[#4F46E5] text-white mb-4">
                <Timer className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">Beat the Timer</h3>
              <p className="text-gray-600">Respond quickly and adapt to changing requirements</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="p-3 rounded-full bg-[#4F46E5] text-white mb-4">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">Get AI Feedback</h3>
              <p className="text-gray-600">Receive detailed analysis of your speaking performance</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>AI-Powered Public Speaking Trainer - Improve your communication skills through practice</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
