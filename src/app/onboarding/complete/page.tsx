"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle, Utensils, Camera, BarChart3, Sparkles, Download, Share, X, Smartphone, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

const steps = [
  {
    icon: Utensils,
    title: "Log your meals",
    description: "Track breakfast, lunch, dinner & snacks",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
  },
  {
    icon: Camera,
    title: "Scan barcodes",
    description: "Quickly log packaged foods",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
  {
    icon: BarChart3,
    title: "Track progress",
    description: "View insights & nutrition trends",
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-500",
  },
]

export default function CompletePage() {
  const router = useRouter()
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSInstructions, setShowIOSInstructions] = useState(false)

  // Send welcome email on mount
  useEffect(() => {
    const sendWelcomeEmail = async () => {
      try {
        await fetch("/api/emails/welcome", { method: "POST" })
      } catch (error) {
        // Silently fail - email is not critical
        console.error("Failed to send welcome email:", error)
      }
    }
    sendWelcomeEmail()
  }, [])

  // Confetti animation
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

  // PWA install detection
  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches
    const isIOSStandalone = ("standalone" in window.navigator) && (window.navigator as Navigator & { standalone: boolean }).standalone

    if (isStandalone || isIOSStandalone) {
      setIsInstalled(true)
    }

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window)
    setIsIOS(isIOSDevice)

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
      toast.success("App installed! Open CalorieCue from your home screen")
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return
    }

    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      toast.success("Installing CalorieCue...")
    }

    setDeferredPrompt(null)
  }

  const canShowInstall = !isInstalled && (isIOS || deferredPrompt)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      {/* Success Icon */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex justify-center"
        >
          <div className="h-24 w-24 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
            <CheckCircle className="h-12 w-12 text-white" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
            You&apos;re all set! <Sparkles className="h-7 w-7 text-yellow-500" />
          </h1>
          <p className="text-muted-foreground text-lg">
            Your personalized nutrition plan is ready
          </p>
        </motion.div>
      </div>

      {/* Next Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card rounded-2xl overflow-hidden elevation-1"
      >
        <div className="px-4 py-3 border-b border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">What&apos;s Next</p>
        </div>
        <div className="divide-y divide-border/50">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex items-center gap-4 p-4"
            >
              <div className={`h-12 w-12 rounded-xl ${step.iconBg} flex items-center justify-center shrink-0`}>
                <step.icon className={`h-6 w-6 ${step.iconColor}`} />
              </div>
              <div>
                <p className="font-semibold text-foreground">{step.title}</p>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Install App Section */}
      {canShowInstall && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-card rounded-2xl overflow-hidden elevation-1"
        >
          <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center">
              <Smartphone className="h-3.5 w-3.5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Install App</p>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Add CalorieCue to your home screen for quick access and offline support
            </p>
            <Button
              onClick={isIOS ? () => setShowIOSInstructions(true) : handleInstallClick}
              className="w-full h-12 rounded-xl"
            >
              <Download className="h-4 w-4 mr-2" />
              Install App
            </Button>
          </div>
        </motion.div>
      )}

      {/* iOS Instructions Modal */}
      <AnimatePresence>
        {showIOSInstructions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
            onClick={() => setShowIOSInstructions(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card w-full max-w-md rounded-2xl p-6 space-y-4 shadow-xl elevation-2"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Install CalorieCue</h3>
                <button
                  onClick={() => setShowIOSInstructions(false)}
                  className="h-8 w-8 rounded-full bg-muted flex items-center justify-center"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              <p className="text-sm text-muted-foreground">
                To install CalorieCue on your iPhone, follow these steps:
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-semibold text-primary">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Tap the Share button</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      Look for the <Share className="h-4 w-4 inline" /> icon at the bottom of Safari
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-semibold text-primary">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Scroll down and tap &quot;Add to Home Screen&quot;</p>
                    <p className="text-sm text-muted-foreground">You may need to scroll to find it</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-semibold text-primary">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Tap &quot;Add&quot; in the top right</p>
                    <p className="text-sm text-muted-foreground">CalorieCue will appear on your home screen</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setShowIOSInstructions(false)}
                className="w-full h-12 rounded-xl"
              >
                Got it
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: canShowInstall ? 0.9 : 0.8 }}
        className="pt-2"
      >
        <Button
          size="lg"
          className="w-full h-14 rounded-2xl text-lg font-semibold shadow-lg shadow-primary/25 group"
          onClick={() => router.push("/dashboard")}
        >
          Go to Dashboard
          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>
        {canShowInstall && (
          <p className="text-center text-sm text-muted-foreground mt-2">
            You can also install later from Settings
          </p>
        )}
      </motion.div>
    </motion.div>
  )
}
