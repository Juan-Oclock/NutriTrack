export type Gender = "male" | "female" | "other" | "prefer_not_to_say"
export type ActivityLevel =
  | "sedentary"
  | "lightly_active"
  | "moderately_active"
  | "very_active"
  | "extremely_active"
export type GoalType = "lose_weight" | "maintain_weight" | "gain_weight" | "build_muscle"

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extremely_active: 1.9,
}

const CALORIES_PER_KG = 7700 // Approximate calories to lose/gain 1kg

export interface UserMetrics {
  weight_kg: number
  height_cm: number
  age: number
  gender: Gender
  activity_level: ActivityLevel
  goal_type: GoalType
  weekly_goal_kg?: number
}

export interface NutritionGoals {
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fiber_g: number
  sodium_mg: number
  sugar_g: number
}

/**
 * Calculate BMR using Mifflin-St Jeor equation
 */
export function calculateBMR(
  weight_kg: number,
  height_cm: number,
  age: number,
  gender: Gender
): number {
  const base = 10 * weight_kg + 6.25 * height_cm - 5 * age

  if (gender === "male") {
    return base + 5
  } else if (gender === "female") {
    return base - 161
  } else {
    // For other/prefer not to say, use average
    return base - 78
  }
}

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 */
export function calculateTDEE(bmr: number, activity_level: ActivityLevel): number {
  return bmr * ACTIVITY_MULTIPLIERS[activity_level]
}

/**
 * Calculate daily calorie goal based on user metrics and goals
 */
export function calculateCalorieGoal(metrics: UserMetrics): number {
  const bmr = calculateBMR(
    metrics.weight_kg,
    metrics.height_cm,
    metrics.age,
    metrics.gender
  )
  const tdee = calculateTDEE(bmr, metrics.activity_level)

  // Calculate calorie adjustment based on goal
  let adjustment = 0
  if (metrics.weekly_goal_kg && metrics.goal_type !== "maintain_weight") {
    const dailyCalorieChange = (metrics.weekly_goal_kg * CALORIES_PER_KG) / 7
    adjustment = metrics.goal_type === "lose_weight" ? -dailyCalorieChange : dailyCalorieChange
  }

  // Ensure minimum calories (1200 for women, 1500 for men)
  const minCalories = metrics.gender === "female" ? 1200 : 1500
  return Math.max(minCalories, Math.round(tdee + adjustment))
}

/**
 * Calculate recommended macro split based on goal type
 */
export function calculateMacroGoals(
  calories: number,
  goal_type: GoalType
): { protein_g: number; carbs_g: number; fat_g: number } {
  let proteinPercent: number
  let carbsPercent: number
  let fatPercent: number

  switch (goal_type) {
    case "lose_weight":
      proteinPercent = 0.40
      carbsPercent = 0.35
      fatPercent = 0.25
      break
    case "build_muscle":
    case "gain_weight":
      proteinPercent = 0.35
      carbsPercent = 0.45
      fatPercent = 0.20
      break
    case "maintain_weight":
    default:
      proteinPercent = 0.30
      carbsPercent = 0.40
      fatPercent = 0.30
      break
  }

  // Protein: 4 cal/g, Carbs: 4 cal/g, Fat: 9 cal/g
  return {
    protein_g: Math.round((calories * proteinPercent) / 4),
    carbs_g: Math.round((calories * carbsPercent) / 4),
    fat_g: Math.round((calories * fatPercent) / 9),
  }
}

/**
 * Calculate full nutrition goals
 */
export function calculateNutritionGoals(metrics: UserMetrics): NutritionGoals {
  const calories = calculateCalorieGoal(metrics)
  const macros = calculateMacroGoals(calories, metrics.goal_type)

  return {
    calories,
    ...macros,
    fiber_g: 25,
    sodium_mg: 2300,
    sugar_g: Math.round(calories * 0.1 / 4), // 10% of calories from sugar max
  }
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: Date): number {
  const today = new Date()
  let age = today.getFullYear() - dateOfBirth.getFullYear()
  const monthDiff = today.getMonth() - dateOfBirth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--
  }

  return age
}

/**
 * Convert height from feet/inches to cm
 */
export function feetToCm(feet: number, inches: number): number {
  return Math.round((feet * 30.48) + (inches * 2.54))
}

/**
 * Convert height from cm to feet/inches
 */
export function cmToFeet(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54
  const feet = Math.floor(totalInches / 12)
  const inches = Math.round(totalInches % 12)
  return { feet, inches }
}

/**
 * Convert weight from lbs to kg
 */
export function lbsToKg(lbs: number): number {
  return Math.round(lbs * 0.453592 * 10) / 10
}

/**
 * Convert weight from kg to lbs
 */
export function kgToLbs(kg: number): number {
  return Math.round(kg / 0.453592 * 10) / 10
}

/**
 * Calculate BMI
 */
export function calculateBMI(weight_kg: number, height_cm: number): number {
  const height_m = height_cm / 100
  return Math.round((weight_kg / (height_m * height_m)) * 10) / 10
}

/**
 * Get BMI category
 */
export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight"
  if (bmi < 25) return "Normal"
  if (bmi < 30) return "Overweight"
  return "Obese"
}

/**
 * Calculate calories from macros
 */
export function calculateCaloriesFromMacros(
  protein_g: number,
  carbs_g: number,
  fat_g: number
): number {
  return Math.round(protein_g * 4 + carbs_g * 4 + fat_g * 9)
}
