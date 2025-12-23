"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle, Utensils, Camera, BarChart3, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import confetti from "canvas-confetti"
import { useEffect } from "react"

const steps = [
  {
    icon: Utensils,
    title: "Log your meals",
    description: "Track breakfast, lunch, dinner & snacks",
    color: "text-emerald-400",
    bg: "bg-emerald-500/20",
  },
  {
    icon: Camera,
    title: "Scan barcodes",
    description: "Quickly log packaged foods",
    color: "text-blue-400",
    bg: "bg-blue-500/20",
  },
  {
    icon: BarChart3,
    title: "Track progress",
    description: "View insights & nutrition trends",
    color: "text-purple-400",
    bg: "bg-purple-500/20",
  },
]

export default function CompletePage() {
  const router = useRouter()

  useEffect(() => {
    const end = Date.now() + 2000
    const colors = ["#22c55e", "#3b82f6", "#f97316"]

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }
    frame()
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8"
    >
      {/* Success Icon */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex justify-center"
        >
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center shadow-lg shadow-primary/25">
            <CheckCircle className="h-12 w-12 text-white" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <h1 className="text-3xl font-bold text-white flex items-center justify-center gap-2">
            You're all set! <Sparkles className="h-7 w-7 text-yellow-400" />
          </h1>
          <p className="text-slate-400 text-lg">
            Your personalized nutrition plan is ready
          </p>
        </motion.div>
      </div>

      {/* Next Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide text-center">
          What's Next
        </h2>
        <div className="space-y-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700"
            >
              <div className={`h-12 w-12 rounded-xl ${step.bg} flex items-center justify-center shrink-0`}>
                <step.icon className={`h-6 w-6 ${step.color}`} />
              </div>
              <div>
                <p className="font-semibold text-white">{step.title}</p>
                <p className="text-sm text-slate-400">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Button
          size="lg"
          className="w-full h-14 rounded-xl text-lg font-semibold bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-500/90"
          onClick={() => router.push("/dashboard")}
        >
          Go to Dashboard
        </Button>
      </motion.div>
    </motion.div>
  )
}
