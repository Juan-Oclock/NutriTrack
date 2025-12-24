"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2, Target, Dumbbell, TrendingDown, TrendingUp, Minus, Zap, Flame, Activity, Check, Scale } from "lucide-react"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  calculateAge,
  calculateNutritionGoals,
  type ActivityLevel,
  type GoalType,
  type Gender,
} from "@/lib/utils/nutrition"
import type { Profile, NutritionGoal } from "@/types/database"

const goalOptions = [
  { value: "lose_weight", label: "Lose Weight", icon: TrendingDown, color: "from-blue-500 to-blue-600" },
  { value: "maintain_weight", label: "Maintain", icon: Minus, color: "from-emerald-500 to-emerald-600" },
  { value: "gain_weight", label: "Gain Weight", icon: TrendingUp, color: "from-orange-500 to-orange-600" },
  { value: "build_muscle", label: "Build Muscle", icon: Dumbbell, color: "from-purple-500 to-purple-600" },
]

const activityOptions = [
  { value: "sedentary", label: "Sedentary", icon: "🪑" },
  { value: "lightly_active", label: "Light", icon: "🚶" },
  { value: "moderately_active", label: "Moderate", icon: "🏃" },
  { value: "very_active", label: "Active", icon: "💪" },
  { value: "extremely_active", label: "Athlete", icon: "🏋️" },
]

export default function GoalsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [currentGoals, setCurrentGoals] = useState<NutritionGoal | null>(null)
  const [goalType, setGoalType] = useState<GoalType | "">("")
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | "">("")
  const [weeklyGoal, setWeeklyGoal] = useState([0.5])
  const [currentWeight, setCurrentWeight] = useState("")
  const [targetWeight, setTargetWeight] = useState("")
  const [calculatedGoals, setCalculatedGoals] = useState<{
    calories: number
    protein_g: number
    carbs_g: number
    fat_g: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        const { data: goalsData } = await supabase
          .from("nutrition_goals")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .single()

        if (profileData) {
          const typedProfile = profileData as Profile
          setProfile(typedProfile)
          setGoalType((typedProfile.goal_type as GoalType) || "")
          setActivityLevel((typedProfile.activity_level as ActivityLevel) || "")
          if (typedProfile.weekly_goal_kg) {
            setWeeklyGoal([typedProfile.weekly_goal_kg])
          }
          if (typedProfile.current_weight_kg) {
            setCurrentWeight(typedProfile.current_weight_kg.toString())
          }
          if (typedProfile.target_weight_kg) {
            setTargetWeight(typedProfile.target_weight_kg.toString())
          }
        }
        if (goalsData) setCurrentGoals(goalsData as NutritionGoal)
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [supabase])

  useEffect(() => {
    if (profile && goalType && activityLevel && profile.date_of_birth && currentWeight) {
      const age = calculateAge(new Date(profile.date_of_birth))
      const goals = calculateNutritionGoals({
        weight_kg: parseFloat(currentWeight) || profile.current_weight_kg || 70,
        height_cm: profile.height_cm || 170,
        age,
        gender: (profile.gender as Gender) || "male",
        activity_level: activityLevel as ActivityLevel,
        goal_type: goalType as GoalType,
        weekly_goal_kg: goalType !== "maintain_weight" ? weeklyGoal[0] : undefined,
      })
      setCalculatedGoals(goals)
    }
  }, [profile, goalType, activityLevel, weeklyGoal, currentWeight])

  const handleSave = async () => {
    if (!calculatedGoals || !profile) return
    setIsSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("You must be logged in")
        return
      }

      // Update profile
      await supabase
        .from("profiles")
        .update({
          goal_type: goalType,
          activity_level: activityLevel,
          weekly_goal_kg: goalType !== "maintain_weight" ? weeklyGoal[0] : null,
          current_weight_kg: parseFloat(currentWeight) || null,
          target_weight_kg: parseFloat(targetWeight) || null,
        } as never)
        .eq("id", user.id)

      // Deactivate old goals
      await supabase
        .from("nutrition_goals")
        .update({ is_active: false } as never)
        .eq("user_id", user.id)

      // Insert new goals
      await supabase
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

      toast.success("Goals updated successfully!")
      router.push("/profile")
    } catch (error) {
      console.error("Error saving goals:", error)
      toast.error("Failed to save goals")
    } finally {
      setIsSaving(false)
    }
  }

  const showWeeklyGoal = goalType === "lose_weight" || goalType === "gain_weight"

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto pb-24">
        <Header title="Nutrition Goals" showBack />
        <div className="p-4 space-y-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto pb-24">
      <Header title="Nutrition Goals" showBack />

      <div className="p-4 space-y-5">
        {/* Current Goals */}
        {currentGoals && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-4 elevation-1"
          >
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Current Daily Targets</p>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <p className="text-xl font-bold text-primary">{currentGoals.calories_goal}</p>
                <p className="text-[10px] text-muted-foreground">Calories</p>
              </div>
              <div>
                <p className="text-xl font-bold text-protein">{currentGoals.protein_goal_g}g</p>
                <p className="text-[10px] text-muted-foreground">Protein</p>
              </div>
              <div>
                <p className="text-xl font-bold text-carbs">{currentGoals.carbs_goal_g}g</p>
                <p className="text-[10px] text-muted-foreground">Carbs</p>
              </div>
              <div>
                <p className="text-xl font-bold text-fat">{currentGoals.fat_goal_g}g</p>
                <p className="text-[10px] text-muted-foreground">Fat</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Weight Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="space-y-3"
        >
          <Label className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-purple-500" />
            Weight
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Current (kg)</label>
              <Input
                type="number"
                placeholder="70"
                value={currentWeight}
                onChange={(e) => setCurrentWeight(e.target.value)}
                min="30"
                max="300"
                step="0.1"
                className="h-12 text-center text-lg font-semibold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Target (kg)</label>
              <Input
                type="number"
                placeholder="65"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                min="30"
                max="300"
                step="0.1"
                className="h-12 text-center text-lg font-semibold"
              />
            </div>
          </div>
          {currentWeight && targetWeight && (
            <p className="text-xs text-center text-muted-foreground">
              {parseFloat(currentWeight) > parseFloat(targetWeight) ? (
                <span className="text-primary font-medium">
                  {(parseFloat(currentWeight) - parseFloat(targetWeight)).toFixed(1)} kg to lose
                </span>
              ) : parseFloat(currentWeight) < parseFloat(targetWeight) ? (
                <span className="text-orange-500 font-medium">
                  {(parseFloat(targetWeight) - parseFloat(currentWeight)).toFixed(1)} kg to gain
                </span>
              ) : (
                <span className="text-emerald-500 font-medium">At target weight!</span>
              )}
            </p>
          )}
        </motion.div>

        {/* Goal Type */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <Label className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            What&apos;s your goal?
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {goalOptions.map((option) => {
              const isSelected = goalType === option.value
              return (
                <motion.button
                  key={option.value}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setGoalType(option.value as GoalType)}
                  className={cn(
                    "p-4 rounded-2xl text-left transition-all tap-highlight relative overflow-hidden",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-card elevation-1"
                  )}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                  <div className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center mb-2",
                    isSelected ? "bg-white/20" : `bg-gradient-to-br ${option.color}`
                  )}>
                    <option.icon className={cn("h-5 w-5", isSelected ? "" : "text-white")} />
                  </div>
                  <p className="font-semibold text-sm">{option.label}</p>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Activity Level */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-3"
        >
          <Label className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Activity Level
          </Label>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {activityOptions.map((option) => {
              const isSelected = activityLevel === option.value
              return (
                <motion.button
                  key={option.value}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setActivityLevel(option.value as ActivityLevel)}
                  className={cn(
                    "flex-shrink-0 p-3 rounded-xl text-center transition-all min-w-[70px] tap-highlight",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-card elevation-1"
                  )}
                >
                  <span className="text-2xl block mb-1">{option.icon}</span>
                  <p className="font-medium text-xs">{option.label}</p>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Weekly Goal Slider */}
        {showWeeklyGoal && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <Label className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Weekly Goal
            </Label>
            <div className="bg-card rounded-2xl p-4 elevation-1">
              <div className="flex justify-between items-center mb-4">
                <span className="text-muted-foreground text-sm">Pace</span>
                <span className="text-xl font-bold text-primary">
                  {weeklyGoal[0]} kg/week
                </span>
              </div>
              <Slider
                value={weeklyGoal}
                onValueChange={setWeeklyGoal}
                min={0.25}
                max={1}
                step={0.25}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
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
            className="bg-gradient-to-br from-primary/20 to-emerald-500/10 rounded-2xl p-5 border border-primary/30"
          >
            <div className="flex items-center gap-2 mb-4">
              <Flame className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">New Daily Targets</h3>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{calculatedGoals.calories}</p>
                <p className="text-[10px] text-muted-foreground">Calories</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-protein">{calculatedGoals.protein_g}g</p>
                <p className="text-[10px] text-muted-foreground">Protein</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-carbs">{calculatedGoals.carbs_g}g</p>
                <p className="text-[10px] text-muted-foreground">Carbs</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-fat">{calculatedGoals.fat_g}g</p>
                <p className="text-[10px] text-muted-foreground">Fat</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Button
            onClick={handleSave}
            className="w-full h-12 rounded-xl text-base font-semibold"
            disabled={isSaving || !goalType || !activityLevel || !currentWeight}
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
