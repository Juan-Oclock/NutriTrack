import { createClient } from "@/lib/supabase/client"
import type { USDAFood } from "@/hooks/use-food-search"
import type { Food } from "@/types/database"

/**
 * Cache a USDA food to the local database.
 * Returns the local food ID for use in diary entries.
 */
export async function cacheUSDAFood(usdaFood: USDAFood): Promise<string | null> {
  const supabase = createClient()

  // Check if this food is already cached using raw filter
  const { data: existingFood } = await supabase
    .from("foods")
    .select("id")
    .filter("usda_fdc_id", "eq", usdaFood.fdcId)
    .maybeSingle()

  if (existingFood) {
    return (existingFood as { id: string }).id
  }

  // Insert the food into the local database
  const { data: newFood, error } = await supabase
    .from("foods")
    .insert({
      name: usdaFood.name,
      brand: usdaFood.brand,
      serving_size: usdaFood.serving_size,
      serving_unit: usdaFood.serving_unit,
      calories: usdaFood.calories,
      protein_g: usdaFood.protein_g,
      carbs_g: usdaFood.carbs_g,
      fat_g: usdaFood.fat_g,
      fiber_g: usdaFood.fiber_g,
      sugar_g: usdaFood.sugar_g,
      sodium_mg: usdaFood.sodium_mg,
      saturated_fat_g: usdaFood.saturated_fat_g,
      cholesterol_mg: usdaFood.cholesterol_mg,
      potassium_mg: usdaFood.potassium_mg,
      is_verified: true,
      usda_fdc_id: usdaFood.fdcId,
    } as never)
    .select("id")
    .single()

  if (error) {
    console.error("Error caching USDA food:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      food: usdaFood.name,
      fdcId: usdaFood.fdcId,
    })
    return null
  }

  return (newFood as { id: string } | null)?.id || null
}

/**
 * Get a cached food by USDA FDC ID
 */
export async function getCachedUSDAFood(fdcId: number): Promise<Food | null> {
  const supabase = createClient()

  const { data } = await supabase
    .from("foods")
    .select("*")
    .filter("usda_fdc_id", "eq", fdcId)
    .maybeSingle()

  return data as Food | null
}

/**
 * Check if a USDA food is already cached
 */
export async function isUSDAFoodCached(fdcId: number): Promise<boolean> {
  const supabase = createClient()

  const { data } = await supabase
    .from("foods")
    .select("id")
    .filter("usda_fdc_id", "eq", fdcId)
    .maybeSingle()

  return !!data
}
