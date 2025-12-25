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
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
  },
  {
    icon: Camera,
    title: "Scan & Log",
    description: "Barcode scanning & AI recognition",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
  {
    icon: Target,
    title: "Set Goals",
    description: "Personalized calorie & macro targets",
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-500",
  },
  {
    icon: BarChart3,
    title: "View Insights",
    description: "Track progress with detailed reports",
    iconBg: "bg-orange-500/10",
    iconColor: "text-orange-500",
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
    <div className="space-y-6">
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
          className="text-3xl font-bold tracking-tight text-foreground"
        >
          Welcome to <span className="text-primary">CalorieCue</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed"
        >
          Your personal nutrition companion for achieving your health and fitness goals
        </motion.p>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="bg-card rounded-2xl overflow-hidden elevation-1"
      >
        <div className="px-4 py-3 border-b border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Features</p>
        </div>
        <div className="divide-y divide-border/50">
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="p-4 flex items-center gap-4"
            >
              <div className={`h-12 w-12 rounded-xl ${feature.iconBg} flex items-center justify-center shrink-0`}>
                <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-card rounded-2xl p-4 elevation-1"
      >
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { value: "500K+", label: "Foods" },
            { value: "AI", label: "Powered" },
            { value: "Free", label: "Forever" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-xl font-bold text-primary">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
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
          className="w-full h-14 rounded-2xl text-lg font-semibold shadow-lg shadow-primary/25 group"
          onClick={() => router.push("/onboarding/profile")}
        >
          Get Started
          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Takes less than 2 minutes to set up
        </p>
      </motion.div>
    </div>
  )
}
