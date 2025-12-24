"use client"

import { usePathname } from "next/navigation"
import { Leaf, Check } from "lucide-react"
import { motion } from "framer-motion"

const steps = [
  { path: "/onboarding/welcome", label: "Welcome" },
  { path: "/onboarding/profile", label: "Profile" },
  { path: "/onboarding/goals", label: "Goals" },
  { path: "/onboarding/complete", label: "Complete" },
]

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const currentStep = steps.findIndex((step) => step.path === pathname)
  const showProgress = pathname !== "/onboarding/welcome" && pathname !== "/onboarding/complete"

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container max-w-lg mx-auto px-4 py-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center mb-8"
        >
          <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25 glow-primary">
            <Leaf className="h-6 w-6 text-white" />
          </div>
          <span className="ml-3 text-2xl font-bold text-white tracking-tight">CalorieCue</span>
        </motion.div>

        {/* Progress Steps */}
        {showProgress && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex items-center justify-center gap-3">
              {steps.slice(1, -1).map((step, index) => {
                const isComplete = index < currentStep - 1
                const isCurrent = index === currentStep - 1

                return (
                  <div key={step.path} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                          isComplete
                            ? "bg-primary text-white shadow-lg shadow-primary/25"
                            : isCurrent
                            ? "bg-primary text-white shadow-lg shadow-primary/25 ring-4 ring-primary/20"
                            : "bg-slate-800/80 text-slate-500 border border-slate-700"
                        }`}
                      >
                        {isComplete ? <Check className="h-5 w-5" /> : index + 1}
                      </motion.div>
                      <span
                        className={`text-xs font-medium mt-2 transition-colors ${
                          isComplete || isCurrent ? "text-white" : "text-slate-500"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {index < steps.length - 3 && (
                      <div
                        className={`w-12 h-0.5 mx-2 rounded-full transition-colors ${
                          isComplete ? "bg-primary" : "bg-slate-700"
                        }`}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Content */}
        <main>{children}</main>
      </div>
    </div>
  )
}
