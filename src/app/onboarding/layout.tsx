"use client"

import { usePathname } from "next/navigation"
import { Progress } from "@/components/ui/progress"
import { Leaf } from "lucide-react"
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
  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
      <div className="container max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center mb-6"
        >
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center shadow-lg shadow-primary/20">
            <Leaf className="h-5 w-5 text-white" />
          </div>
          <span className="ml-2 text-xl font-bold text-white">CalorieCue</span>
        </motion.div>

        {/* Progress Steps */}
        {pathname !== "/onboarding/welcome" && pathname !== "/onboarding/complete" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <div className="flex justify-between mb-3">
              {steps.slice(1, -1).map((step, index) => (
                <div key={step.path} className="flex flex-col items-center">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium mb-1 transition-colors ${
                      index < currentStep - 1
                        ? "bg-primary text-white"
                        : index === currentStep - 1
                        ? "bg-primary text-white ring-4 ring-primary/20"
                        : "bg-slate-700 text-slate-400"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      index <= currentStep - 1
                        ? "text-primary"
                        : "text-slate-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
            <Progress value={progress} className="h-1.5" />
          </motion.div>
        )}

        {/* Content */}
        <main>{children}</main>
      </div>
    </div>
  )
}
