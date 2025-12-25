"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Mail, Lock, ArrowRight, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      // Check if user has completed onboarding
      if (data.user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("goal_type, height_cm, current_weight_kg")
          .eq("id", data.user.id)
          .single()

        // If profile is incomplete, redirect to onboarding
        const profile = profileData as { goal_type: string | null; height_cm: number | null; current_weight_kg: number | null } | null
        if (!profile?.goal_type || !profile?.height_cm || !profile?.current_weight_kg) {
          toast.success("Let's finish setting up your profile!")
          router.push("/onboarding/welcome")
          router.refresh()
          return
        }
      }

      toast.success("Welcome back!")
      router.push("/dashboard")
      router.refresh()
    } catch {
      toast.error("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center space-y-2"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex justify-center mb-4"
        >
          <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/30">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
        </motion.div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome <span className="text-primary">back</span>
        </h1>
        <p className="text-muted-foreground">
          Sign in to continue your nutrition journey
        </p>
      </motion.div>

      {/* Login Form */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl overflow-hidden elevation-1"
      >
        <div className="px-4 py-3 border-b border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Sign In</p>
        </div>

        <form onSubmit={handleEmailLogin}>
          {/* Email Field */}
          <div className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
              <Mail className="h-5 w-5 text-blue-500" />
            </div>
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 h-12 rounded-xl border-0 bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          {/* Password Field */}
          <div className="p-4 pt-0 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
              <Lock className="h-5 w-5 text-purple-500" />
            </div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="flex-1 h-12 rounded-xl border-0 bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          {/* Forgot Password Link */}
          <div className="px-4 pb-4">
            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:text-primary/80 transition-colors ml-[52px]"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <div className="p-4 pt-0 space-y-3">
            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-base font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <p className="text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-primary hover:text-primary/80 font-semibold transition-colors"
          >
            Sign up
          </Link>
        </p>
      </motion.div>
    </motion.div>
  )
}
