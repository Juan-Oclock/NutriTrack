import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit"

interface DetectedFood {
  name: string
  portion: string
  calories: number
  protein: number
  carbs: number
  fat: number
  confidence: number
}

interface AnalysisResult {
  success: boolean
  foods?: DetectedFood[]
  rateLimited?: boolean
  error?: string
}

// Google Gemini API - using gemini-2.0-flash model
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

// LogMeal API
const LOGMEAL_API_URL = "https://api.logmeal.com/v2/image/segmentation/complete/v1.0"
const LOGMEAL_NUTRITION_URL = "https://api.logmeal.com/v2/recipe/nutritionalInfo/v1.0"

// Max image size: 5MB in base64 (roughly 6.6MB encoded)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024

// Optimized prompt - reduced tokens while maintaining accuracy
const NUTRITION_PROMPT = `Identify all foods in this image. Return JSON only:
{"foods":[{"name":"string","portion":"string","calories":number,"protein":number,"carbs":number,"fat":number,"confidence":0.0-1.0}]}
Estimate nutrition per visible portion. Be accurate.`

// Primary: Google Gemini
async function analyzeWithGemini(base64Image: string): Promise<AnalysisResult> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY

  if (!apiKey) {
    console.error("GOOGLE_GEMINI_API_KEY not found in environment")
    return { success: false, error: "Gemini API key not configured" }
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: base64Image,
                },
              },
              {
                text: NUTRITION_PROMPT,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1024,
        },
      }),
    })

    // Check for rate limiting
    if (response.status === 429) {
      console.error("Gemini API rate limited")
      return { success: false, rateLimited: true }
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Gemini API error:", response.status, errorText)
      return { success: false, error: `Gemini API error: ${response.status}` }
    }

    const data = await response.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!content) {
      return { success: false, error: "No response from Gemini" }
    }

    // Parse JSON from response with try-catch
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return { success: false, error: "No JSON in response" }
    }

    try {
      const parsed = JSON.parse(jsonMatch[0])
      // Validate the response structure
      if (!Array.isArray(parsed.foods)) {
        return { success: false, error: "Invalid response format" }
      }
      return { success: true, foods: parsed.foods }
    } catch {
      return { success: false, error: "Invalid JSON in response" }
    }
  } catch (error) {
    console.error("Gemini analysis error:", error)
    return { success: false, error: "Gemini analysis failed" }
  }
}

// Fallback: LogMeal API
async function analyzeWithLogMeal(base64Image: string): Promise<AnalysisResult> {
  const apiKey = process.env.LOGMEAL_API_KEY

  if (!apiKey) {
    console.error("LOGMEAL_API_KEY not found in environment")
    return { success: false, error: "LogMeal API key not configured" }
  }

  try {
    // Convert base64 to blob for LogMeal
    const imageBuffer = Buffer.from(base64Image, "base64")
    const blob = new Blob([imageBuffer], { type: "image/jpeg" })

    const formData = new FormData()
    formData.append("image", blob, "meal.jpg")

    // Step 1: Get food segmentation
    const segmentResponse = await fetch(LOGMEAL_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    })

    if (segmentResponse.status === 429) {
      console.error("LogMeal API rate limited")
      return { success: false, rateLimited: true }
    }

    if (!segmentResponse.ok) {
      const errorText = await segmentResponse.text()
      console.error("LogMeal segmentation error:", segmentResponse.status, errorText)
      return { success: false, error: `LogMeal API error: ${segmentResponse.status}` }
    }

    const segmentData = await segmentResponse.json()
    const imageId = segmentData.imageId

    if (!imageId || !segmentData.segmentation_results?.length) {
      return { success: false, error: "No food detected by LogMeal" }
    }

    // Step 2: Get nutrition info
    const nutritionResponse = await fetch(LOGMEAL_NUTRITION_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageId }),
    })

    if (!nutritionResponse.ok) {
      // Fall back to just the detected foods without detailed nutrition
      const foods: DetectedFood[] = segmentData.segmentation_results.map(
        (item: { recognition_results: { name: string; prob: number }[] }) => ({
          name: item.recognition_results?.[0]?.name || "Unknown food",
          portion: "1 serving",
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          confidence: item.recognition_results?.[0]?.prob || 0.5,
        })
      )
      return { success: true, foods }
    }

    const nutritionData = await nutritionResponse.json()

    // Map LogMeal response to our format
    const foods: DetectedFood[] = segmentData.segmentation_results.map(
      (item: { recognition_results: { name: string; prob: number }[] }, index: number) => {
        const nutrition = nutritionData.nutritional_info_per_food?.[index] || {}
        return {
          name: item.recognition_results?.[0]?.name || "Unknown food",
          portion: `${nutrition.serving_size || 100}g`,
          calories: Math.round(nutrition.calories || 0),
          protein: Math.round(nutrition.totalNutrients?.PROCNT?.quantity || 0),
          carbs: Math.round(nutrition.totalNutrients?.CHOCDF?.quantity || 0),
          fat: Math.round(nutrition.totalNutrients?.FAT?.quantity || 0),
          confidence: item.recognition_results?.[0]?.prob || 0.7,
        }
      }
    )

    return { success: true, foods }
  } catch (error) {
    console.error("LogMeal analysis error:", error)
    return { success: false, error: "LogMeal analysis failed" }
  }
}

export async function POST(request: NextRequest) {
  // Check authentication
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  // Rate limiting by user ID (stricter for meal analysis)
  const rateLimitResult = checkRateLimit(
    `meal-analysis:${user.id}`,
    RATE_LIMITS.mealAnalysis
  )

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: "Too many meal scans. Please wait a moment before trying again.",
        fallback: true
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
        }
      }
    )
  }

  try {
    const { image } = await request.json()

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      )
    }

    // Extract base64 data from data URL if needed
    const base64Image = image.includes("base64,")
      ? image.split("base64,")[1]
      : image

    // Validate image size
    const imageSize = Buffer.byteLength(base64Image, "base64")
    if (imageSize > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: "Image too large. Please use an image under 5MB." },
        { status: 400 }
      )
    }

    // Basic validation that it's actually base64
    if (!/^[A-Za-z0-9+/=]+$/.test(base64Image)) {
      return NextResponse.json(
        { error: "Invalid image format" },
        { status: 400 }
      )
    }

    // Helper function to save scan results to database
    async function saveMealScan(foods: DetectedFood[], imageData: string) {
      try {
        const totalCalories = foods.reduce((sum, food) => sum + (food.calories || 0), 0)
        const mealName = foods.length === 1
          ? foods[0].name
          : `${foods[0].name} + ${foods.length - 1} more`

        const { data: scanData, error: scanError } = await supabase
          .from("meal_scans")
          .insert({
            user_id: user!.id,
            image_url: imageData.substring(0, 500), // Store truncated for reference
            detected_foods: foods,
            total_calories: totalCalories,
            meal_name: mealName,
            scan_date: new Date().toISOString(),
          } as never)
          .select("id")
          .single()

        if (scanError) {
          console.error("Error saving meal scan:", scanError)
          return null
        }
        return (scanData as { id: string } | null)?.id
      } catch (err) {
        console.error("Error saving meal scan:", err)
        return null
      }
    }

    // Try Google Gemini first (primary)
    const geminiResult = await analyzeWithGemini(base64Image)

    if (geminiResult.success && geminiResult.foods) {
      // Save to meal_scans for history/caching
      const scanId = await saveMealScan(geminiResult.foods, image)

      return NextResponse.json(
        { foods: geminiResult.foods, scanId },
        {
          headers: {
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
          }
        }
      )
    }

    // If Gemini rate limited or failed, try LogMeal fallback
    if (geminiResult.rateLimited || !geminiResult.success) {
      const logmealResult = await analyzeWithLogMeal(base64Image)

      if (logmealResult.success && logmealResult.foods) {
        // Save to meal_scans for history/caching
        const scanId = await saveMealScan(logmealResult.foods, image)

        return NextResponse.json(
          { foods: logmealResult.foods, scanId },
          {
            headers: {
              "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            }
          }
        )
      }

      // If LogMeal also rate limited
      if (logmealResult.rateLimited) {
        return NextResponse.json(
          {
            error: "AI services are busy. Please try again in a moment or search for foods manually.",
            fallback: true
          },
          { status: 429 }
        )
      }
    }

    // All providers failed - graceful degradation
    console.error("All meal analysis providers failed")
    return NextResponse.json(
      {
        error: "Could not analyze the meal. Please try searching for foods manually.",
        fallback: true
      },
      { status: 503 }
    )
  } catch (error) {
    console.error("Meal analysis error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
