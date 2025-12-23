import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { checkRateLimit, getClientIP, RATE_LIMITS } from "@/lib/rate-limit"

const USDA_API_KEY = process.env.USDA_API_KEY
const USDA_API_URL = "https://api.nal.usda.gov/fdc/v1/foods/search"

// Return error if API key not configured
if (!USDA_API_KEY) {
  console.warn("USDA_API_KEY not configured - food search will fail")
}

interface USDAFood {
  fdcId: number
  description: string
  dataType: string
  brandOwner?: string
  brandName?: string
  ingredients?: string
  servingSize?: number
  servingSizeUnit?: string
  foodNutrients: {
    nutrientId: number
    nutrientName: string
    nutrientNumber: string
    unitName: string
    value: number
  }[]
}

interface USDASearchResponse {
  totalHits: number
  currentPage: number
  totalPages: number
  foods: USDAFood[]
}

// Map USDA nutrient IDs to our fields
const NUTRIENT_MAP: Record<number, string> = {
  1008: "calories",      // Energy (kcal)
  1003: "protein_g",     // Protein
  1005: "carbs_g",       // Carbohydrate, by difference
  1004: "fat_g",         // Total lipid (fat)
  1079: "fiber_g",       // Fiber, total dietary
  2000: "sugar_g",       // Sugars, total
  1093: "sodium_mg",     // Sodium
  1258: "saturated_fat_g", // Fatty acids, total saturated
  1253: "cholesterol_mg", // Cholesterol
  1092: "potassium_mg",  // Potassium
}

function extractNutrients(foodNutrients: USDAFood["foodNutrients"]) {
  const nutrients: Record<string, number> = {
    calories: 0,
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
    fiber_g: 0,
    sugar_g: 0,
    sodium_mg: 0,
    saturated_fat_g: 0,
    cholesterol_mg: 0,
    potassium_mg: 0,
  }

  for (const nutrient of foodNutrients) {
    const field = NUTRIENT_MAP[nutrient.nutrientId]
    if (field) {
      nutrients[field] = nutrient.value || 0
    }
  }

  return nutrients
}

function transformUSDAFood(food: USDAFood) {
  const nutrients = extractNutrients(food.foodNutrients)

  return {
    id: `usda_${food.fdcId}`,
    fdcId: food.fdcId,
    name: food.description,
    brand: food.brandOwner || food.brandName || null,
    serving_size: food.servingSize || 100,
    serving_unit: food.servingSizeUnit || "g",
    calories: nutrients.calories,
    protein_g: nutrients.protein_g,
    carbs_g: nutrients.carbs_g,
    fat_g: nutrients.fat_g,
    fiber_g: nutrients.fiber_g,
    sugar_g: nutrients.sugar_g,
    sodium_mg: nutrients.sodium_mg,
    saturated_fat_g: nutrients.saturated_fat_g,
    cholesterol_mg: nutrients.cholesterol_mg,
    potassium_mg: nutrients.potassium_mg,
    is_verified: true,
    source: "usda" as const,
    dataType: food.dataType,
  }
}

export async function GET(request: NextRequest) {
  // Check authentication
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  // Rate limiting by user ID
  const rateLimitResult = checkRateLimit(
    `search:${user.id}`,
    RATE_LIMITS.search
  )

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
        }
      }
    )
  }

  // Check API key is configured
  if (!USDA_API_KEY) {
    return NextResponse.json(
      { error: "Food search service not configured" },
      { status: 503 }
    )
  }

  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("query")
  const pageSize = searchParams.get("pageSize") || "25"
  const pageNumber = searchParams.get("pageNumber") || "1"
  const dataType = searchParams.get("dataType")

  // Input validation
  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: "Query must be at least 2 characters" },
      { status: 400 }
    )
  }

  if (query.length > 100) {
    return NextResponse.json(
      { error: "Query too long (max 100 characters)" },
      { status: 400 }
    )
  }

  const pageSizeNum = parseInt(pageSize, 10)
  const pageNumberNum = parseInt(pageNumber, 10)

  if (isNaN(pageSizeNum) || pageSizeNum < 1 || pageSizeNum > 50) {
    return NextResponse.json(
      { error: "Invalid pageSize (must be 1-50)" },
      { status: 400 }
    )
  }

  if (isNaN(pageNumberNum) || pageNumberNum < 1) {
    return NextResponse.json(
      { error: "Invalid pageNumber" },
      { status: 400 }
    )
  }

  try {
    const params = new URLSearchParams({
      api_key: USDA_API_KEY,
      query,
      pageSize: pageSizeNum.toString(),
      pageNumber: pageNumberNum.toString(),
    })

    if (dataType) {
      params.append("dataType", dataType)
    }

    const response = await fetch(`${USDA_API_URL}?${params}`, {
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      console.error("USDA API error:", response.status)
      return NextResponse.json(
        { error: "Failed to fetch from food database" },
        { status: response.status }
      )
    }

    const data: USDASearchResponse = await response.json()
    const foods = data.foods.map(transformUSDAFood)

    const bestMatch = foods.filter(
      (f) => f.dataType === "Foundation" || f.dataType === "SR Legacy"
    )
    const moreResults = foods.filter(
      (f) => f.dataType !== "Foundation" && f.dataType !== "SR Legacy"
    )

    return NextResponse.json({
      foods,
      bestMatch,
      moreResults,
      totalHits: data.totalHits,
      currentPage: data.currentPage,
      totalPages: data.totalPages,
    }, {
      headers: {
        "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
      }
    })
  } catch (error) {
    console.error("Search foods error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
