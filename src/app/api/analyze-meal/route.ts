import { NextRequest, NextResponse } from "next/server"

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

// Google Gemini API
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

// LogMeal API
const LOGMEAL_API_URL = "https://api.logmeal.com/v2/image/segmentation/complete/v1.0"
const LOGMEAL_NUTRITION_URL = "https://api.logmeal.com/v2/recipe/nutritionalInfo/v1.0"

const NUTRITION_PROMPT = `Analyze this food image and identify all visible food items.
For each food item, provide:
- name: Name of the food
- portion: Estimated portion size (e.g., "1 cup", "150g", "1 medium")
- calories: Estimated calories (number)
- protein: Protein in grams (number)
- carbs: Carbohydrates in grams (number)
- fat: Fat in grams (number)
- confidence: Your confidence level 0.0-1.0 (number)

Respond ONLY with valid JSON in this exact format:
{
  "foods": [
    {
      "name": "Food Name",
      "portion": "portion size",
      "calories": 200,
      "protein": 10,
      "carbs": 25,
      "fat": 8,
      "confidence": 0.85
    }
  ]
}

Be accurate with nutritional estimates based on visible portion sizes.`

// Primary: Google Gemini
async function analyzeWithGemini(base64Image: string): Promise<AnalysisResult> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY

  if (!apiKey) {
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
      console.log("Gemini rate limited, trying fallback...")
      return { success: false, rateLimited: true }
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Gemini API error:", errorText)
      return { success: false, error: "Gemini API error" }
    }

    const data = await response.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!content) {
      return { success: false, error: "No response from Gemini" }
    }

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return { success: false, error: "No JSON in response" }
    }

    const parsed = JSON.parse(jsonMatch[0])
    return { success: true, foods: parsed.foods || [] }
  } catch (error) {
    console.error("Gemini analysis error:", error)
    return { success: false, error: "Gemini analysis failed" }
  }
}

// Fallback: LogMeal API
async function analyzeWithLogMeal(base64Image: string): Promise<AnalysisResult> {
  const apiKey = process.env.LOGMEAL_API_KEY

  if (!apiKey) {
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
      return { success: false, rateLimited: true }
    }

    if (!segmentResponse.ok) {
      console.error("LogMeal segmentation error:", await segmentResponse.text())
      return { success: false, error: "LogMeal API error" }
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

    // Try Google Gemini first (primary)
    const geminiResult = await analyzeWithGemini(base64Image)

    if (geminiResult.success && geminiResult.foods) {
      return NextResponse.json({ foods: geminiResult.foods })
    }

    // If Gemini rate limited or failed, try LogMeal fallback
    if (geminiResult.rateLimited || !geminiResult.success) {
      const logmealResult = await analyzeWithLogMeal(base64Image)

      if (logmealResult.success && logmealResult.foods) {
        return NextResponse.json({ foods: logmealResult.foods })
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
