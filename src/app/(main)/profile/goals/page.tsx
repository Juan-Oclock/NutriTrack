"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import {
  Loader2,
  Target,
  Dumbbell,
  TrendingDown,
  TrendingUp,
  Minus,
  Zap,
  Flame,
  Activity,
  Check,
  Scale,
  ChevronRight,
  ChevronDown,
  User,
  Calendar,
  Ruler,
  Users,
} from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  calculateAge,
  calculateNutritionGoals,
  feetToCm,
  cmToFeet,
  type ActivityLevel,
  type GoalType,
  type Gender,
} from "@/lib/utils/nutrition"
import type { Profile, NutritionGoal } from "@/types/database"

const goalOptions = [
  { value: "lose_weight", label: "Lose Weight", icon: TrendingDown, color: "bg-blue-500" },
  { value: "maintain_weight", label: "Maintain", icon: Minus, color: "bg-emerald-500" },
  { value: "gain_weight", label: "Gain Weight", icon: TrendingUp, color: "bg-orange-500" },
  { value: "build_muscle", label: "Build Muscle", icon: Dumbbell, color: "bg-purple-500" },
]

const activityOptions = [
  { value: "sedentary", label: "Sedentary", description: "Little to no exercise, desk job", icon: "🪑" },
  { value: "lightly_active", label: "Light", description: "Light exercise 1-3 times/week", icon: "🚶" },
  { value: "moderately_active", label: "Moderate", description: "Moderate exercise 3-5 times/week", icon: "🏃" },
  { value: "very_active", label: "Active", description: "Hard exercise 6-7 times/week", icon: "💪" },
  { value: "extremely_active", label: "Athlete", description: "Very hard exercise, physical job", icon: "🏋️" },
]

const genderOptions = [
  { value: "male", label: "Male", icon: "♂️" },
  { value: "female", label: "Female", icon: "♀️" },
  { value: "other", label: "Other", icon: "⚧️" },
  { value: "prefer_not_to_say", label: "Prefer not to say", icon: "🤐" },
]

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="px-4 py-3 border-b border-border/50">
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{title}</p>
    </div>
  )
}

function SettingRow({
  icon: Icon,
  iconColor = "text-primary",
  iconBg = "bg-primary/10",
  label,
  value,
  description,
  action,
  onClick,
  border = false,
  showChevron = false,
}: {
  icon?: React.ElementType
  iconColor?: string
  iconBg?: string
  label: string
  value?: string | React.ReactNode
  description?: string
  action?: React.ReactNode
  onClick?: () => void
  border?: boolean
  showChevron?: boolean
}) {
  const content = (
    <>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", iconBg)}>
            <Icon className={cn("h-5 w-5", iconColor)} />
          </div>
        )}
        <div className="text-left">
          <p className="font-medium">{label}</p>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-muted-foreground">{value}</span>}
        {action}
        {showChevron && <ChevronRight className="h-5 w-5 text-muted-foreground" />}
      </div>
    </>
  )

  if (onClick) {
    return (
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        type="button"
        className={cn(
          "w-full flex items-center justify-between p-4 tap-highlight",
          border && "border-t border-border/50"
        )}
      >
        {content}
      </motion.button>
    )
  }

  return (
    <div className={cn("flex items-center justify-between p-4", border && "border-t border-border/50")}>
      {content}
    </div>
  )
}

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

  // Personal details state
  const [personalDetailsOpen, setPersonalDetailsOpen] = useState(false)
  const [dateOfBirth, setDateOfBirth] = useState<string>("")
  const [heightCm, setHeightCm] = useState("")
  const [heightUnit, setHeightUnit] = useState<"cm" | "ft-in">("cm")
  const [heightFeet, setHeightFeet] = useState("")
  const [heightInches, setHeightInches] = useState("")
  const [gender, setGender] = useState<Gender | "">("")
  const [age, setAge] = useState<number | null>(null)

  // Edit sheet state
  const [editingField, setEditingField] = useState<string | null>(null)

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
          // Personal details
          if (typedProfile.date_of_birth) {
            setDateOfBirth(typedProfile.date_of_birth.split("T")[0])
            setAge(calculateAge(new Date(typedProfile.date_of_birth)))
          }
          if (typedProfile.height_cm) {
            setHeightCm(typedProfile.height_cm.toString())
            const { feet, inches } = cmToFeet(typedProfile.height_cm)
            setHeightFeet(feet.toString())
            setHeightInches(inches.toString())
          }
          if (typedProfile.gender) {
            setGender(typedProfile.gender as Gender)
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

  // Recalculate goals when any input changes
  useEffect(() => {
    if (profile && goalType && activityLevel && currentWeight) {
      // Calculate age from DOB
      const currentAge = dateOfBirth
        ? calculateAge(new Date(dateOfBirth))
        : profile.date_of_birth
          ? calculateAge(new Date(profile.date_of_birth))
          : null

      if (!currentAge) return
      setAge(currentAge)

      // Calculate height
      let finalHeightCm = parseFloat(heightCm)
      if (heightUnit === "ft-in" && (heightFeet || heightInches)) {
        finalHeightCm = feetToCm(parseInt(heightFeet) || 0, parseInt(heightInches) || 0)
      }
      if (!finalHeightCm || isNaN(finalHeightCm)) {
        finalHeightCm = profile.height_cm || 170
      }

      const goals = calculateNutritionGoals({
        weight_kg: parseFloat(currentWeight) || profile.current_weight_kg || 70,
        height_cm: finalHeightCm,
        age: currentAge,
        gender: (gender as Gender) || (profile.gender as Gender) || "male",
        activity_level: activityLevel as ActivityLevel,
        goal_type: goalType as GoalType,
        weekly_goal_kg: goalType !== "maintain_weight" ? weeklyGoal[0] : undefined,
      })
      setCalculatedGoals(goals)
    }
  }, [profile, goalType, activityLevel, weeklyGoal, currentWeight, dateOfBirth, heightCm, heightUnit, heightFeet, heightInches, gender])

  const handleSave = async () => {
    if (!calculatedGoals || !profile) return
    setIsSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("You must be logged in")
        return
      }

      // Calculate final height
      let finalHeightCm = parseFloat(heightCm)
      if (heightUnit === "ft-in" && (heightFeet || heightInches)) {
        finalHeightCm = feetToCm(parseInt(heightFeet) || 0, parseInt(heightInches) || 0)
      }

      // Update profile with personal details + goals
      await supabase
        .from("profiles")
        .update({
          // Personal details
          date_of_birth: dateOfBirth || profile.date_of_birth,
          height_cm: finalHeightCm || profile.height_cm,
          gender: gender || profile.gender,
          // Goal settings
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

  const formatHeight = () => {
    if (heightUnit === "cm") {
      return heightCm ? `${heightCm} cm` : profile?.height_cm ? `${profile.height_cm} cm` : "--"
    } else {
      if (heightFeet || heightInches) {
        return `${heightFeet || 0}' ${heightInches || 0}"`
      }
      if (profile?.height_cm) {
        const { feet, inches } = cmToFeet(profile.height_cm)
        return `${feet}' ${inches}"`
      }
      return "--"
    }
  }

  const formatGender = (g: Gender | "") => {
    const option = genderOptions.find(o => o.value === g)
    return option ? option.label : "--"
  }

  const getWeightDifferenceText = () => {
    const current = parseFloat(currentWeight)
    const target = parseFloat(targetWeight)
    if (isNaN(current) || isNaN(target)) return null

    if (current > target) {
      return <span className="text-primary">{(current - target).toFixed(1)} kg to lose</span>
    } else if (current < target) {
      return <span className="text-orange-500">{(target - current).toFixed(1)} kg to gain</span>
    }
    return <span className="text-emerald-500">At target weight!</span>
  }

  const handleHeightUnitChange = (unit: "cm" | "ft-in") => {
    if (unit === heightUnit) return
    setHeightUnit(unit)

    if (unit === "ft-in" && heightCm) {
      const { feet, inches } = cmToFeet(parseFloat(heightCm))
      setHeightFeet(feet.toString())
      setHeightInches(inches.toString())
    } else if (unit === "cm" && (heightFeet || heightInches)) {
      const cm = feetToCm(parseInt(heightFeet) || 0, parseInt(heightInches) || 0)
      setHeightCm(cm.toString())
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto pb-24">
        <Header title="Nutrition Goals" showBack />
        <div className="p-4 space-y-4">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto pb-24">
      <Header title="Nutrition Goals" showBack />

      <div className="p-4 space-y-5">
        {/* Personal Details Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl overflow-hidden elevation-1"
        >
          <SectionHeader title="Personal Details" />

          <SettingRow
            icon={personalDetailsOpen ? ChevronDown : User}
            iconBg="bg-indigo-500/10"
            iconColor="text-indigo-500"
            label="Personal Details"
            value={personalDetailsOpen ? "Hide" : "Edit"}
            onClick={() => setPersonalDetailsOpen(!personalDetailsOpen)}
            showChevron={!personalDetailsOpen}
          />

          <AnimatePresence>
            {personalDetailsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <SettingRow
                  icon={Calendar}
                  iconBg="bg-orange-500/10"
                  iconColor="text-orange-500"
                  label="Age"
                  value={age ? `${age} years` : "--"}
                  onClick={() => setEditingField("age")}
                  showChevron
                  border
                />

                <SettingRow
                  icon={Ruler}
                  iconBg="bg-blue-500/10"
                  iconColor="text-blue-500"
                  label="Height"
                  value={formatHeight()}
                  onClick={() => setEditingField("height")}
                  showChevron
                  border
                />

                <SettingRow
                  icon={Users}
                  iconBg="bg-purple-500/10"
                  iconColor="text-purple-500"
                  label="Gender"
                  value={formatGender(gender)}
                  onClick={() => setEditingField("gender")}
                  showChevron
                  border
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Body Metrics Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-card rounded-2xl overflow-hidden elevation-1"
        >
          <SectionHeader title="Body Metrics" />

          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Scale className="h-5 w-5 text-emerald-500" />
                </div>
                <span className="font-medium">Current Weight</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(e.target.value)}
                  className="w-20 h-10 text-center rounded-xl"
                  placeholder="70"
                  min="30"
                  max="300"
                  step="0.1"
                />
                <span className="text-muted-foreground text-sm">kg</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border/50 pt-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <span className="font-medium">Target Weight</span>
                  {getWeightDifferenceText() && (
                    <p className="text-xs">{getWeightDifferenceText()}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  className="w-20 h-10 text-center rounded-xl"
                  placeholder="65"
                  min="30"
                  max="300"
                  step="0.1"
                />
                <span className="text-muted-foreground text-sm">kg</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Goal Type Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl overflow-hidden elevation-1"
        >
          <SectionHeader title="Your Goal" />

          <SettingRow
            icon={Target}
            label="Goal Type"
            value={goalOptions.find(g => g.value === goalType)?.label || "Select"}
            onClick={() => setEditingField("goalType")}
            showChevron
          />
        </motion.div>

        {/* Activity Level Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card rounded-2xl overflow-hidden elevation-1"
        >
          <SectionHeader title="Activity Level" />

          <SettingRow
            icon={Activity}
            label="Activity"
            value={activityOptions.find(a => a.value === activityLevel)?.label || "Select"}
            description={activityOptions.find(a => a.value === activityLevel)?.description}
            onClick={() => setEditingField("activityLevel")}
            showChevron
          />
        </motion.div>

        {/* Weekly Pace Section */}
        {showWeeklyGoal && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl overflow-hidden elevation-1"
          >
            <SectionHeader title="Weekly Pace" />

            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">Pace</span>
                </div>
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
            className="bg-primary/10 rounded-2xl p-5 border border-primary/30"
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

      {/* Age Edit Sheet */}
      <Sheet open={editingField === "age"} onOpenChange={() => setEditingField(null)}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Edit Date of Birth</SheetTitle>
          </SheetHeader>
          <div className="py-6 space-y-4">
            <Input
              type="date"
              value={dateOfBirth}
              onChange={(e) => {
                setDateOfBirth(e.target.value)
                if (e.target.value) {
                  setAge(calculateAge(new Date(e.target.value)))
                }
              }}
              max={new Date().toISOString().split("T")[0]}
              className="h-12 rounded-xl"
            />
            {age && (
              <p className="text-center text-muted-foreground">
                You are <span className="font-semibold text-foreground">{age}</span> years old
              </p>
            )}
          </div>
          <Button
            onClick={() => setEditingField(null)}
            className="w-full h-12 rounded-xl"
          >
            Done
          </Button>
        </SheetContent>
      </Sheet>

      {/* Height Edit Sheet */}
      <Sheet open={editingField === "height"} onOpenChange={() => setEditingField(null)}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Edit Height</SheetTitle>
          </SheetHeader>
          <div className="py-6 space-y-4">
            {/* Unit Toggle */}
            <div className="flex bg-muted rounded-lg p-1">
              {(["cm", "ft-in"] as const).map((unit) => (
                <button
                  key={unit}
                  onClick={() => handleHeightUnitChange(unit)}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all",
                    heightUnit === unit
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {unit === "cm" ? "Centimeters" : "Feet & Inches"}
                </button>
              ))}
            </div>

            {heightUnit === "cm" ? (
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder="170"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  className="h-12 rounded-xl text-center text-lg"
                  min="100"
                  max="250"
                />
                <p className="text-center text-sm text-muted-foreground">centimeters</p>
              </div>
            ) : (
              <div className="flex gap-3">
                <div className="flex-1 space-y-2">
                  <Input
                    type="number"
                    placeholder="5"
                    value={heightFeet}
                    onChange={(e) => setHeightFeet(e.target.value)}
                    className="h-12 rounded-xl text-center text-lg"
                    min="3"
                    max="8"
                  />
                  <p className="text-center text-sm text-muted-foreground">feet</p>
                </div>
                <div className="flex-1 space-y-2">
                  <Input
                    type="number"
                    placeholder="10"
                    value={heightInches}
                    onChange={(e) => setHeightInches(e.target.value)}
                    className="h-12 rounded-xl text-center text-lg"
                    min="0"
                    max="11"
                  />
                  <p className="text-center text-sm text-muted-foreground">inches</p>
                </div>
              </div>
            )}
          </div>
          <Button
            onClick={() => setEditingField(null)}
            className="w-full h-12 rounded-xl"
          >
            Done
          </Button>
        </SheetContent>
      </Sheet>

      {/* Gender Edit Sheet */}
      <Sheet open={editingField === "gender"} onOpenChange={() => setEditingField(null)}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Select Gender</SheetTitle>
          </SheetHeader>
          <div className="py-4 space-y-2">
            {genderOptions.map((option) => (
              <motion.button
                key={option.value}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setGender(option.value as Gender)
                  setEditingField(null)
                }}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-xl transition-all",
                  gender === option.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{option.icon}</span>
                  <span className="font-medium">{option.label}</span>
                </div>
                {gender === option.value && <Check className="h-5 w-5" />}
              </motion.button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Goal Type Edit Sheet */}
      <Sheet open={editingField === "goalType"} onOpenChange={() => setEditingField(null)}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[80vh]">
          <SheetHeader>
            <SheetTitle>Select Your Goal</SheetTitle>
          </SheetHeader>
          <div className="py-4 space-y-2 overflow-y-auto">
            {goalOptions.map((option) => (
              <motion.button
                key={option.value}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setGoalType(option.value as GoalType)
                  setEditingField(null)
                }}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-xl transition-all",
                  goalType === option.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center",
                    goalType === option.value ? "bg-white/20" : option.color
                  )}>
                    <option.icon className={cn(
                      "h-5 w-5",
                      goalType === option.value ? "" : "text-white"
                    )} />
                  </div>
                  <span className="font-medium">{option.label}</span>
                </div>
                {goalType === option.value && <Check className="h-5 w-5" />}
              </motion.button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Activity Level Edit Sheet */}
      <Sheet open={editingField === "activityLevel"} onOpenChange={() => setEditingField(null)}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[80vh]">
          <SheetHeader>
            <SheetTitle>Select Activity Level</SheetTitle>
          </SheetHeader>
          <div className="py-4 space-y-2 overflow-y-auto">
            {activityOptions.map((option) => (
              <motion.button
                key={option.value}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setActivityLevel(option.value as ActivityLevel)
                  setEditingField(null)
                }}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-xl transition-all text-left",
                  activityLevel === option.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{option.icon}</span>
                  <div>
                    <p className="font-medium">{option.label}</p>
                    <p className={cn(
                      "text-sm",
                      activityLevel === option.value
                        ? "text-primary-foreground/80"
                        : "text-muted-foreground"
                    )}>
                      {option.description}
                    </p>
                  </div>
                </div>
                {activityLevel === option.value && <Check className="h-5 w-5" />}
              </motion.button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
