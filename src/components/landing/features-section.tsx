"use client"

import { motion } from "framer-motion"
import { Target, ScanBarcode, ChartBar, Sparkles } from "lucide-react"
import { FeatureCard } from "./feature-card"

const features = [
  {
    icon: Target,
    title: "Calorie & Macro Tracking",
    description: "Visualize your daily intake with beautiful progress rings and detailed nutritional breakdowns for protein, carbs, and fat.",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/15",
  },
  {
    icon: ScanBarcode,
    title: "Effortless Food Logging",
    description: "Log meals in seconds with barcode scanning, AI-powered photo recognition, or quick search through our 500K+ food database.",
    color: "text-blue-500",
    bgColor: "bg-blue-500/15",
  },
  {
    icon: ChartBar,
    title: "Progress Insights",
    description: "Track your weight trends, maintain motivating streaks, and celebrate achievements with detailed progress reports.",
    color: "text-purple-500",
    bgColor: "bg-purple-500/15",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Features",
    description: "Get smart meal suggestions, personalized recommendations, and intelligent tips powered by artificial intelligence.",
    color: "text-amber-500",
    bgColor: "bg-amber-500/15",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 lg:py-32 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-muted/30" />

      <div className="container relative mx-auto px-4 max-w-7xl">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4">
            Everything You Need to{" "}
            <span className="text-primary">
              Succeed
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Powerful tools designed to make nutrition tracking simple, enjoyable, and effective.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
