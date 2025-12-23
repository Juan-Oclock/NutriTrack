"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Apple, BarChart3, Camera, Target, ArrowRight, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

const features = [
  {
    icon: Apple,
    title: "Track Your Meals",
    description: "Log food with our extensive database",
    color: "text-emerald-400",
    bg: "bg-emerald-500/20",
  },
  {
    icon: Camera,
    title: "Scan & Log",
    description: "Barcode scanning & AI recognition",
    color: "text-blue-400",
    bg: "bg-blue-500/20",
  },
  {
    icon: Target,
    title: "Set Goals",
    description: "Personalized calorie & macro targets",
    color: "text-orange-400",
    bg: "bg-orange-500/20",
  },
  {
    icon: BarChart3,
    title: "View Insights",
    description: "Track progress with detailed reports",
    color: "text-purple-400",
    bg: "bg-purple-500/20",
  },
]

export default function WelcomePage() {
  const router = useRouter()

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="flex justify-center mb-6"
        >
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center shadow-lg shadow-primary/25">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
        </motion.div>

        <h1 className="text-3xl font-bold tracking-tight text-white">
          Welcome to CalorieCue
        </h1>
        <p className="text-slate-400 text-lg max-w-md mx-auto">
          Your personal nutrition companion for achieving your health and fitness goals
        </p>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-2 gap-3"
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + index * 0.05 }}
            className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-colors"
          >
            <div className={`h-10 w-10 rounded-xl ${feature.bg} flex items-center justify-center mb-3`}>
              <feature.icon className={`h-5 w-5 ${feature.color}`} />
            </div>
            <h3 className="font-semibold text-white text-sm mb-1">{feature.title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-3 pt-4"
      >
        <Button
          size="lg"
          className="w-full h-14 rounded-xl text-lg font-semibold bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-500/90 group"
          onClick={() => router.push("/onboarding/profile")}
        >
          Get Started
          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>
        <p className="text-center text-sm text-slate-500">
          Takes less than 2 minutes to set up
        </p>
      </motion.div>
    </div>
  )
}
