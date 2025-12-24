"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Mail, Lock, User, ArrowRight, Rocket } from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"

export default function RegisterPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success("Account created! Please check your email to verify.")
      router.push("/onboarding/welcome")
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
        <div className="flex justify-center mb-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="relative"
          >
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center shadow-xl shadow-primary/30">
              <Rocket className="h-8 w-8 text-white" />
            </div>
          </motion.div>
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          Create your{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
            account
          </span>
        </h1>
        <p className="text-muted-foreground">
          Start your nutrition journey with CalorieCue
        </p>
      </motion.div>

      {/* Register Form */}
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onSubmit={handleEmailRegister}
        className="space-y-4"
      >
        {/* Full Name Field */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
              <User className="h-3.5 w-3.5 text-white" />
            </div>
            Full Name
          </Label>
          <Input
            id="fullName"
            type="text"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="bg-muted/50 border-border text-foreground h-12 rounded-xl placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20"
          />
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Mail className="h-3.5 w-3.5 text-white" />
            </div>
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-muted/50 border-border text-foreground h-12 rounded-xl placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20"
          />
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Lock className="h-3.5 w-3.5 text-white" />
            </div>
            Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-muted/50 border-border text-foreground h-12 rounded-xl placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20"
          />
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Lock className="h-3.5 w-3.5 text-white" />
            </div>
            Confirm Password
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="bg-muted/50 border-border text-foreground h-12 rounded-xl placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20"
          />
        </div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="pt-2"
        >
          <Button
            type="submit"
            size="lg"
            className="w-full h-14 rounded-2xl text-lg font-semibold bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-500/90 shadow-lg shadow-primary/25 group"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <>
                Create Account
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </motion.div>
      </motion.form>

      {/* Terms */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="text-xs text-center text-muted-foreground"
      >
        By creating an account, you agree to our{" "}
        <Link href="/terms" className="text-primary hover:text-primary/80 transition-colors">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-primary hover:text-primary/80 transition-colors">
          Privacy Policy
        </Link>
      </motion.p>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <p className="text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary hover:text-primary/80 font-semibold transition-colors"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </motion.div>
  )
}
