"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle, Utensils, Camera, BarChart3, Sparkles, Download, Share, X, Smartphone } from "lucide-react"
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
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSInstructions, setShowIOSInstructions] = useState(false)

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

      {/* Install App Section */}
      {canShowInstall && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-500/20 border border-primary/30"
        >
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <Smartphone className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="font-semibold text-white">Install CalorieCue</h3>
                <p className="text-sm text-slate-400">
                  Add to your home screen for quick access and offline support
                </p>
              </div>
              <Button
                onClick={isIOS ? () => setShowIOSInstructions(true) : handleInstallClick}
                className="w-full bg-primary hover:bg-primary/90"
              >
                <Download className="h-4 w-4 mr-2" />
                Install App
              </Button>
            </div>
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
              className="bg-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4 shadow-xl border border-slate-700"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Install CalorieCue</h3>
                <button
                  onClick={() => setShowIOSInstructions(false)}
                  className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center"
                >
                  <X className="h-4 w-4 text-slate-300" />
                </button>
              </div>

              <p className="text-sm text-slate-400">
                To install CalorieCue on your iPhone, follow these steps:
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <span className="text-sm font-semibold text-primary">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-white">Tap the Share button</p>
                    <p className="text-sm text-slate-400 flex items-center gap-1">
                      Look for the <Share className="h-4 w-4 inline" /> icon at the bottom of Safari
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <span className="text-sm font-semibold text-primary">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-white">Scroll down and tap &quot;Add to Home Screen&quot;</p>
                    <p className="text-sm text-slate-400">You may need to scroll to find it</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <span className="text-sm font-semibold text-primary">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-white">Tap &quot;Add&quot; in the top right</p>
                    <p className="text-sm text-slate-400">CalorieCue will appear on your home screen</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSInstructions(false)}
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: canShowInstall ? 0.9 : 0.8 }}
      >
        <Button
          size="lg"
          className="w-full h-14 rounded-xl text-lg font-semibold bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-500/90"
          onClick={() => router.push("/dashboard")}
        >
          Go to Dashboard
        </Button>
        {canShowInstall && (
          <p className="text-center text-sm text-slate-500 mt-2">
            You can also install later from Settings
          </p>
        )}
      </motion.div>
    </motion.div>
  )
}
