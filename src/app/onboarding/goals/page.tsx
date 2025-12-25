"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Loader2, Target, Activity, Zap, Flame, ArrowRight, Check } from "lucide-react"
import { toast } from "sonner"
import {
  calculateAge,
  calculateNutritionGoals,
  type ActivityLevel,
  type GoalType,
  type Gender,
} from "@/lib/utils/nutrition"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const goalOptions = [
  { value: "lose_weight", label: "Lose Weight", description: "Burn fat & slim down", icon: "📉", color: "bg-blue-500" },
  { value: "maintain_weight", label: "Maintain", description: "Stay at current weight", icon: "⚖️", color: "bg-emerald-500" },
  { value: "gain_weight", label: "Gain Weight", description: "Increase body mass", icon: "📈", color: "bg-orange-500" },
  { value: "build_muscle", label: "Build Muscle", description: "Get stronger & leaner", icon: "💪", color: "bg-purple-500" },
]

const activityOptions = [
  { value: "sedentary", label: "Sedentary", description: "Little or no exercise", icon: "🪑" },
  { value: "lightly_active", label: "Lightly Active", description: "Light exercise 1-3 days/week", icon: "🚶" },
  { value: "moderately_active", label: "Moderately Active", description: "Moderate exercise 3-5 days/week", icon: "🏃" },
  { value: "very_active", label: "Very Active", description: "Hard exercise 6-7 days/week", icon: "💪" },
  { value: "extremely_active", label: "Extremely Active", description: "Very hard exercise & physical job", icon: "🏋️" },
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
        <h1 className="text-2xl font-bold text-foreground">
          Set your <span className="text-primary">goals</span>
        </h1>
        <p className="text-muted-foreground">
          Tell us what you want to achieve
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Goal Type */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl overflow-hidden elevation-1"
        >
          <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center">
              <Target className="h-3.5 w-3.5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Your Goal</p>
          </div>
          <div className="p-4 grid grid-cols-2 gap-2">
            {goalOptions.map((option) => (
              <motion.button
                key={option.value}
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => setGoalType(option.value as GoalType)}
                className={cn(
                  "p-3 rounded-xl text-left transition-all relative",
                  goalType === option.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <span className="text-xl block mb-1">{option.icon}</span>
                <p className={cn(
                  "font-semibold text-sm",
                  goalType === option.value ? "text-primary-foreground" : "text-foreground"
                )}>
                  {option.label}
                </p>
                <p className={cn(
                  "text-xs mt-0.5",
                  goalType === option.value ? "text-primary-foreground/80" : "text-muted-foreground"
                )}>
                  {option.description}
                </p>
                {goalType === option.value && (
                  <Check className="h-4 w-4 absolute top-3 right-3" />
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Activity Level */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card rounded-2xl overflow-hidden elevation-1"
        >
          <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Activity className="h-3.5 w-3.5 text-orange-500" />
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Activity Level</p>
          </div>
          <div className="divide-y divide-border/50">
            {activityOptions.map((option) => (
              <motion.button
                key={option.value}
                type="button"
                whileTap={{ scale: 0.99 }}
                onClick={() => setActivityLevel(option.value as ActivityLevel)}
                className={cn(
                  "w-full p-4 flex items-center gap-3 text-left transition-colors",
                  activityLevel === option.value ? "bg-primary/5" : "hover:bg-muted/50"
                )}
              >
                <span className="text-2xl">{option.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-medium text-sm",
                    activityLevel === option.value ? "text-primary" : "text-foreground"
                  )}>
                    {option.label}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {option.description}
                  </p>
                </div>
                {activityLevel === option.value && (
                  <Check className="h-5 w-5 text-primary shrink-0" />
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Weekly Goal Slider */}
        {showWeeklyGoal && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl overflow-hidden elevation-1"
          >
            <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Zap className="h-3.5 w-3.5 text-purple-500" />
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Weekly Pace</p>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Target pace</span>
                <div className="px-3 py-1.5 rounded-lg bg-primary/10">
                  <span className="text-lg font-bold text-primary">
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
              <div className="flex justify-between text-xs text-muted-foreground">
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
            className="bg-card rounded-2xl overflow-hidden elevation-1"
          >
            <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-red-500/10 flex items-center justify-center">
                <Flame className="h-3.5 w-3.5 text-red-500" />
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Your Daily Targets</p>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-4 gap-3">
                <div className="text-center p-3 rounded-xl bg-primary/10">
                  <p className="text-xl font-bold text-primary">{calculatedGoals.calories}</p>
                  <p className="text-xs text-muted-foreground">Calories</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-red-500/10">
                  <p className="text-xl font-bold text-red-500">{calculatedGoals.protein_g}g</p>
                  <p className="text-xs text-muted-foreground">Protein</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-blue-500/10">
                  <p className="text-xl font-bold text-blue-500">{calculatedGoals.carbs_g}g</p>
                  <p className="text-xs text-muted-foreground">Carbs</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-yellow-500/10">
                  <p className="text-xl font-bold text-yellow-600">{calculatedGoals.fat_g}g</p>
                  <p className="text-xs text-muted-foreground">Fat</p>
                </div>
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
            className="w-full h-14 rounded-2xl text-lg font-semibold shadow-lg shadow-primary/25 group"
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
