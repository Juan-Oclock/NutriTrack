"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Loader2, Target, Dumbbell, TrendingDown, TrendingUp, Minus, Zap, Flame, Activity, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import {
  calculateAge,
  calculateNutritionGoals,
  type ActivityLevel,
  type GoalType,
  type Gender,
} from "@/lib/utils/nutrition"
import { motion } from "framer-motion"

const goalOptions = [
  { value: "lose_weight", label: "Lose Weight", description: "Burn fat & slim down", icon: TrendingDown, color: "text-blue-400", bg: "bg-blue-500/20", border: "border-blue-500/50" },
  { value: "maintain_weight", label: "Maintain", description: "Stay at current weight", icon: Minus, color: "text-emerald-400", bg: "bg-emerald-500/20", border: "border-emerald-500/50" },
  { value: "gain_weight", label: "Gain Weight", description: "Increase body mass", icon: TrendingUp, color: "text-orange-400", bg: "bg-orange-500/20", border: "border-orange-500/50" },
  { value: "build_muscle", label: "Build Muscle", description: "Get stronger & leaner", icon: Dumbbell, color: "text-purple-400", bg: "bg-purple-500/20", border: "border-purple-500/50" },
]

const activityOptions = [
  { value: "sedentary", label: "Sedentary", description: "Little or no exercise", icon: "🪑" },
  { value: "lightly_active", label: "Light", description: "1-3 days/week", icon: "🚶" },
  { value: "moderately_active", label: "Moderate", description: "3-5 days/week", icon: "🏃" },
  { value: "very_active", label: "Active", description: "6-7 days/week", icon: "💪" },
  { value: "extremely_active", label: "Athlete", description: "Intense training", icon: "🏋️" },
]

export default function GoalsPage() {
  const [goalType, setGoalType] = useState<GoalType | "">("")
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | "">("")
  const [targetWeight, setTargetWeight] = useState("")
  const [weeklyGoal, setWeeklyGoal] = useState([0.5])
  const [calculatedGoals, setCalculatedGoals] = useState<{
    calories: number
    protein_g: number
    carbs_g: number
    fat_g: number
  } | null>(null)
  const [profile, setProfile] = useState<{
    height_cm: number
    current_weight_kg: number
    gender: Gender
    date_of_birth: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from("profiles")
        .select("height_cm, current_weight_kg, gender, date_of_birth")
        .eq("id", user.id)
        .single()

      if (data) {
        const profileData = data as {
          height_cm: number
          current_weight_kg: number
          gender: Gender
          date_of_birth: string
        }
        setProfile(profileData)
        setTargetWeight(profileData.current_weight_kg?.toString() || "")
      }
    }
    loadProfile()
  }, [supabase])

  useEffect(() => {
    if (profile && goalType && activityLevel) {
      const age = calculateAge(new Date(profile.date_of_birth))
      const goals = calculateNutritionGoals({
        weight_kg: profile.current_weight_kg,
        height_cm: profile.height_cm,
        age,
        gender: profile.gender,
        activity_level: activityLevel as ActivityLevel,
        goal_type: goalType as GoalType,
        weekly_goal_kg: goalType !== "maintain_weight" ? weeklyGoal[0] : undefined,
      })
      setCalculatedGoals(goals)
    }
  }, [profile, goalType, activityLevel, weeklyGoal])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!calculatedGoals) return
    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error("You must be logged in")
        router.push("/login")
        return
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          goal_type: goalType,
          activity_level: activityLevel,
          target_weight_kg: parseFloat(targetWeight),
          weekly_goal_kg: goalType !== "maintain_weight" ? weeklyGoal[0] : null,
        } as never)
        .eq("id", user.id)

      if (profileError) {
        toast.error(profileError.message)
        return
      }

      // Deactivate any existing goals first
      await supabase
        .from("nutrition_goals")
        .update({ is_active: false } as never)
        .eq("user_id", user.id)

      const { error: goalsError } = await supabase
        .from("nutrition_goals")
        .insert({
          user_id: user.id,
          calories_goal: calculatedGoals.calories,
          protein_goal_g: calculatedGoals.protein_g,
          carbs_goal_g: calculatedGoals.carbs_g,
          fat_goal_g: calculatedGoals.fat_g,
          fiber_goal_g: 25,
          sodium_goal_mg: 2300,
          is_active: true,
        } as never)

      if (goalsError) {
        toast.error(goalsError.message)
        return
      }

      router.push("/onboarding/complete")
    } catch {
      toast.error("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const showWeeklyGoal = goalType === "lose_weight" || goalType === "gain_weight"

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
        <h1 className="text-2xl font-bold text-white">
          Set your{" "}
          <span className="text-primary">
            goals
          </span>
        </h1>
        <p className="text-slate-400">Tell us what you want to achieve</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Goal Type */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <Label className="flex items-center gap-2 text-white">
            <div className="h-6 w-6 rounded-lg bg-primary flex items-center justify-center">
              <Target className="h-3.5 w-3.5 text-white" />
            </div>
            What&apos;s your goal?
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {goalOptions.map((option) => (
              <motion.button
                key={option.value}
                type="button"
                onClick={() => setGoalType(option.value as GoalType)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  goalType === option.value
                    ? `${option.border} ${option.bg} shadow-lg`
                    : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                }`}
              >
                <div className={`h-10 w-10 rounded-xl ${option.bg} flex items-center justify-center mb-2`}>
                  <option.icon className={`h-5 w-5 ${option.color}`} />
                </div>
                <p className="font-semibold text-white text-sm">{option.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{option.description}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Activity Level */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-3"
        >
          <Label className="flex items-center gap-2 text-white">
            <div className="h-6 w-6 rounded-lg bg-primary flex items-center justify-center">
              <Activity className="h-3.5 w-3.5 text-white" />
            </div>
            Activity Level
          </Label>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
            {activityOptions.map((option) => (
              <motion.button
                key={option.value}
                type="button"
                onClick={() => setActivityLevel(option.value as ActivityLevel)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex-shrink-0 p-3 rounded-xl border-2 text-center transition-all min-w-[85px] ${
                  activityLevel === option.value
                    ? "border-primary bg-primary/20 shadow-lg shadow-primary/20"
                    : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                }`}
              >
                <span className="text-2xl block mb-1">{option.icon}</span>
                <p className="font-medium text-white text-xs">{option.label}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{option.description}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Weekly Goal Slider */}
        {showWeeklyGoal && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Label className="flex items-center gap-2 text-white">
              <div className="h-6 w-6 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="h-3.5 w-3.5 text-white" />
              </div>
              Weekly Goal
            </Label>
            <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700">
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-400 text-sm">Pace</span>
                <div className="px-3 py-1.5 rounded-lg bg-primary/20 border border-primary/30">
                  <span className="text-xl font-bold text-primary">
                    {weeklyGoal[0]} kg/week
                  </span>
                </div>
              </div>
              <Slider
                value={weeklyGoal}
                onValueChange={setWeeklyGoal}
                min={0.25}
                max={1}
                step={0.25}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-3">
                <span>Gradual</span>
                <span>Moderate</span>
                <span>Aggressive</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Calculated Goals Preview */}
        {calculatedGoals && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-primary/10 rounded-2xl p-5 border border-primary/30"
          >
            <div className="flex items-center gap-2 mb-4">
              <Flame className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-white">Your Daily Targets</h3>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{calculatedGoals.calories}</p>
                <p className="text-xs text-slate-400">Calories</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-400">{calculatedGoals.protein_g}g</p>
                <p className="text-xs text-slate-400">Protein</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">{calculatedGoals.carbs_g}g</p>
                <p className="text-xs text-slate-400">Carbs</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-400">{calculatedGoals.fat_g}g</p>
                <p className="text-xs text-slate-400">Fat</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="pt-2"
        >
          <Button
            type="submit"
            size="lg"
            className="w-full h-14 rounded-2xl text-lg font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 group"
            disabled={isLoading || !goalType || !activityLevel}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <>
                Complete Setup
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  )
}
