"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, User, Calendar, Ruler, Scale, ArrowRight, Check } from "lucide-react"
import { toast } from "sonner"
import { feetToCm, lbsToKg } from "@/lib/utils/nutrition"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

type Gender = "male" | "female" | "other" | "prefer_not_to_say"

const genderOptions = [
  { value: "male", label: "Male", icon: "♂️" },
  { value: "female", label: "Female", icon: "♀️" },
  { value: "other", label: "Other", icon: "⚧️" },
  { value: "prefer_not_to_say", label: "Prefer not to say", icon: "🤐" },
]

export default function ProfilePage() {
  const [gender, setGender] = useState<Gender | "">("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [heightUnit, setHeightUnit] = useState<"metric" | "imperial">("imperial")
  const [heightCm, setHeightCm] = useState("")
  const [heightFeet, setHeightFeet] = useState("")
  const [heightInches, setHeightInches] = useState("")
  const [weightUnit, setWeightUnit] = useState<"metric" | "imperial">("imperial")
  const [weightKg, setWeightKg] = useState("")
  const [weightLbs, setWeightLbs] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error("You must be logged in")
        router.push("/login")
        return
      }

      // Calculate height in cm
      let finalHeightCm: number
      if (heightUnit === "metric") {
        finalHeightCm = parseFloat(heightCm)
      } else {
        finalHeightCm = feetToCm(parseInt(heightFeet) || 0, parseInt(heightInches) || 0)
      }

      // Calculate weight in kg
      let finalWeightKg: number
      if (weightUnit === "metric") {
        finalWeightKg = parseFloat(weightKg)
      } else {
        finalWeightKg = lbsToKg(parseFloat(weightLbs))
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          gender: gender as Gender,
          date_of_birth: dateOfBirth,
          height_cm: finalHeightCm,
          current_weight_kg: finalWeightKg,
        } as never)
        .eq("id", user.id)

      if (error) {
        toast.error(error.message)
        return
      }

      router.push("/onboarding/goals")
    } catch {
      toast.error("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h1 className="text-2xl font-bold text-foreground">
          Tell us about <span className="text-primary">yourself</span>
        </h1>
        <p className="text-muted-foreground">
          This helps us calculate your personalized nutrition goals
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Gender Selection */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl overflow-hidden elevation-1"
        >
          <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <User className="h-3.5 w-3.5 text-purple-500" />
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Gender</p>
          </div>
          <div className="p-4 grid grid-cols-2 gap-2">
            {genderOptions.map((option) => (
              <motion.button
                key={option.value}
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => setGender(option.value as Gender)}
                className={cn(
                  "p-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between",
                  gender === option.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                )}
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">{option.icon}</span>
                  {option.label}
                </span>
                {gender === option.value && <Check className="h-4 w-4" />}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Date of Birth */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card rounded-2xl overflow-hidden elevation-1"
        >
          <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Calendar className="h-3.5 w-3.5 text-orange-500" />
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Date of Birth</p>
          </div>
          <div className="p-4">
            <Input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              required
              className="h-12 rounded-xl border-0 bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
        </motion.div>

        {/* Height */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl overflow-hidden elevation-1"
        >
          <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Ruler className="h-3.5 w-3.5 text-blue-500" />
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Height</p>
          </div>
          <div className="p-4 space-y-3">
            {/* Unit Toggle */}
            <div className="flex bg-muted rounded-xl p-1">
              <button
                type="button"
                onClick={() => setHeightUnit("imperial")}
                className={cn(
                  "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all",
                  heightUnit === "imperial"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                )}
              >
                ft / in
              </button>
              <button
                type="button"
                onClick={() => setHeightUnit("metric")}
                className={cn(
                  "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all",
                  heightUnit === "metric"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                )}
              >
                cm
              </button>
            </div>

            {heightUnit === "metric" ? (
              <div className="relative">
                <Input
                  type="number"
                  placeholder="170"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  min="100"
                  max="250"
                  required={heightUnit === "metric"}
                  className="h-12 rounded-xl border-0 bg-muted/50 text-center text-lg pr-12 focus-visible:ring-1 focus-visible:ring-primary"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">cm</span>
              </div>
            ) : (
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Input
                    type="number"
                    placeholder="5"
                    value={heightFeet}
                    onChange={(e) => setHeightFeet(e.target.value)}
                    min="3"
                    max="8"
                    required={heightUnit === "imperial"}
                    className="h-12 rounded-xl border-0 bg-muted/50 text-center text-lg pr-10 focus-visible:ring-1 focus-visible:ring-primary"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">ft</span>
                </div>
                <div className="flex-1 relative">
                  <Input
                    type="number"
                    placeholder="10"
                    value={heightInches}
                    onChange={(e) => setHeightInches(e.target.value)}
                    min="0"
                    max="11"
                    required={heightUnit === "imperial"}
                    className="h-12 rounded-xl border-0 bg-muted/50 text-center text-lg pr-10 focus-visible:ring-1 focus-visible:ring-primary"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">in</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Weight */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-card rounded-2xl overflow-hidden elevation-1"
        >
          <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Scale className="h-3.5 w-3.5 text-emerald-500" />
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Current Weight</p>
          </div>
          <div className="p-4 space-y-3">
            {/* Unit Toggle */}
            <div className="flex bg-muted rounded-xl p-1">
              <button
                type="button"
                onClick={() => setWeightUnit("imperial")}
                className={cn(
                  "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all",
                  weightUnit === "imperial"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                )}
              >
                lbs
              </button>
              <button
                type="button"
                onClick={() => setWeightUnit("metric")}
                className={cn(
                  "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all",
                  weightUnit === "metric"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                )}
              >
                kg
              </button>
            </div>

            {weightUnit === "metric" ? (
              <div className="relative">
                <Input
                  type="number"
                  placeholder="70"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  min="30"
                  max="300"
                  step="0.1"
                  required={weightUnit === "metric"}
                  className="h-12 rounded-xl border-0 bg-muted/50 text-center text-lg pr-12 focus-visible:ring-1 focus-visible:ring-primary"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">kg</span>
              </div>
            ) : (
              <div className="relative">
                <Input
                  type="number"
                  placeholder="150"
                  value={weightLbs}
                  onChange={(e) => setWeightLbs(e.target.value)}
                  min="66"
                  max="660"
                  step="0.1"
                  required={weightUnit === "imperial"}
                  className="h-12 rounded-xl border-0 bg-muted/50 text-center text-lg pr-12 focus-visible:ring-1 focus-visible:ring-primary"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">lbs</span>
              </div>
            )}
          </div>
        </motion.div>

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
            className="w-full h-14 rounded-2xl text-lg font-semibold shadow-lg shadow-primary/25 group"
            disabled={isLoading || !gender || !dateOfBirth}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <>
                Continue
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  )
}
