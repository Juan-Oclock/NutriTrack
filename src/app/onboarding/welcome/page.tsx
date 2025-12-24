"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Apple, BarChart3, Camera, Target, ArrowRight, Sparkles, Zap } from "lucide-react"
import { motion } from "framer-motion"

const features = [
  {
    icon: Apple,
    title: "Track Meals",
    description: "Log food with our extensive database",
    bgColor: "bg-primary",
  },
  {
    icon: Camera,
    title: "Scan & Log",
    description: "Barcode scanning & AI recognition",
    bgColor: "bg-primary",
  },
  {
    icon: Target,
    title: "Set Goals",
    description: "Personalized calorie & macro targets",
    bgColor: "bg-primary",
  },
  {
    icon: BarChart3,
    title: "View Insights",
    description: "Track progress with detailed reports",
    bgColor: "bg-primary",
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

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
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="flex justify-center mb-6"
        >
          <div className="relative">
            <div className="h-24 w-24 rounded-3xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/30">
              <Sparkles className="h-12 w-12 text-white" />
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 }}
              className="absolute -right-2 -top-2 h-8 w-8 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg"
            >
              <Zap className="h-4 w-4 text-white" />
            </motion.div>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold tracking-tight text-white"
        >
          Welcome to{" "}
          <span className="text-primary">
            CalorieCue
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed"
        >
          Your personal nutrition companion for achieving your health and fitness goals
        </motion.p>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3"
      >
        {features.map((feature) => (
          <motion.div
            key={feature.title}
            variants={item}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative p-4 rounded-2xl bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 hover:border-slate-600 transition-all duration-300 overflow-hidden group"
          >
            {/* Glow on hover */}
            <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300" />

            <div className={`h-11 w-11 rounded-xl ${feature.bgColor} flex items-center justify-center mb-3 shadow-lg`}>
              <feature.icon className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold text-white text-sm mb-1">{feature.title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex justify-center gap-8 py-4"
      >
        {[
          { value: "500K+", label: "Foods" },
          { value: "AI", label: "Powered" },
          { value: "Free", label: "Forever" },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-slate-500">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-4 pt-2"
      >
        <Button
          size="lg"
          className="w-full h-14 rounded-2xl text-lg font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 group"
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
