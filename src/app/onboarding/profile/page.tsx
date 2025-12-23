"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, User, Calendar, Ruler, Scale } from "lucide-react"
import { toast } from "sonner"
import { feetToCm, lbsToKg } from "@/lib/utils/nutrition"
import { motion } from "framer-motion"

type Gender = "male" | "female" | "other" | "prefer_not_to_say"

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
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
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-white">Tell us about yourself</h1>
        <p className="text-slate-400">
          This helps us calculate your personalized nutrition goals
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Gender Selection */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <Label className="flex items-center gap-2 text-white">
            <User className="h-4 w-4 text-primary" />
            Gender
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {genderOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setGender(option.value as Gender)}
                className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  gender === option.value
                    ? "border-primary bg-primary/20 text-primary"
                    : "border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Date of Birth */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-3"
        >
          <Label className="flex items-center gap-2 text-white">
            <Calendar className="h-4 w-4 text-primary" />
            Date of Birth
          </Label>
          <Input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            required
            className="bg-slate-800/50 border-slate-700 text-white h-12 rounded-xl"
          />
        </motion.div>

        {/* Height */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <Label className="flex items-center gap-2 text-white">
            <Ruler className="h-4 w-4 text-primary" />
            Height
          </Label>

          {/* Unit Toggle */}
          <div className="flex bg-slate-800/50 rounded-xl p-1 border border-slate-700">
            <button
              type="button"
              onClick={() => setHeightUnit("imperial")}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                heightUnit === "imperial"
                  ? "bg-primary text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              ft / in
            </button>
            <button
              type="button"
              onClick={() => setHeightUnit("metric")}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                heightUnit === "metric"
                  ? "bg-primary text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              cm
            </button>
          </div>

          {heightUnit === "metric" ? (
            <Input
              type="number"
              placeholder="170"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              min="100"
              max="250"
              required={heightUnit === "metric"}
              className="bg-slate-800/50 border-slate-700 text-white h-12 rounded-xl text-center text-lg"
            />
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
                  className="bg-slate-800/50 border-slate-700 text-white h-12 rounded-xl text-center text-lg pr-10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">ft</span>
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
                  className="bg-slate-800/50 border-slate-700 text-white h-12 rounded-xl text-center text-lg pr-10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">in</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Weight */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-3"
        >
          <Label className="flex items-center gap-2 text-white">
            <Scale className="h-4 w-4 text-primary" />
            Current Weight
          </Label>

          {/* Unit Toggle */}
          <div className="flex bg-slate-800/50 rounded-xl p-1 border border-slate-700">
            <button
              type="button"
              onClick={() => setWeightUnit("imperial")}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                weightUnit === "imperial"
                  ? "bg-primary text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              lbs
            </button>
            <button
              type="button"
              onClick={() => setWeightUnit("metric")}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                weightUnit === "metric"
                  ? "bg-primary text-white"
                  : "text-slate-400 hover:text-white"
              }`}
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
                className="bg-slate-800/50 border-slate-700 text-white h-12 rounded-xl text-center text-lg pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">kg</span>
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
                className="bg-slate-800/50 border-slate-700 text-white h-12 rounded-xl text-center text-lg pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">lbs</span>
            </div>
          )}
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            type="submit"
            className="w-full h-12 rounded-xl text-base font-semibold"
            disabled={isLoading || !gender || !dateOfBirth}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue
          </Button>
        </motion.div>
      </form>
    </motion.div>
  )
}
