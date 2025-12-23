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

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json()

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      )
    }

    const apiKey = process.env.DEEPSEEK_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: "DeepSeek API key not configured" },
        { status: 500 }
      )
    }

    // Extract base64 data from data URL if needed
    const base64Image = image.includes("base64,")
      ? image.split("base64,")[1]
      : image

    const systemPrompt = `You are a nutrition analysis expert. Analyze the food image and identify all visible food items.
For each food item, estimate:
- Name of the food
- Portion size (e.g., "1 cup", "150g", "1 medium")
- Calories
- Protein (grams)
- Carbohydrates (grams)
- Fat (grams)
- Confidence level (0.0 to 1.0)

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

Be accurate with nutritional estimates based on visible portion sizes. If unsure, provide conservative estimates.`

    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
              {
                type: "text",
                text: "Analyze this meal image and identify all food items with their nutritional information.",
              },
            ],
          },
        ],
        max_tokens: 1024,
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("DeepSeek API error:", errorData)

      // Fallback: If vision isn't supported, use text-only analysis
      if (response.status === 400 || response.status === 422) {
        return await fallbackTextAnalysis(apiKey)
      }

      return NextResponse.json(
        { error: "Failed to analyze image" },
        { status: response.status }
      )
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 }
      )
    }

    // Parse the JSON response
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error("No JSON found in response")
      }

      const parsed = JSON.parse(jsonMatch[0])
      const foods: DetectedFood[] = parsed.foods || []

      return NextResponse.json({ foods })
    } catch (parseError) {
      console.error("Failed to parse AI response:", content)
      return NextResponse.json(
        { error: "Failed to parse nutrition data" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Meal analysis error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Fallback for when vision model isn't available
async function fallbackTextAnalysis(apiKey: string) {
  // Return a message indicating vision isn't supported
  // The user can still manually input foods
  return NextResponse.json({
    error: "Vision analysis not available. Please try the manual food search instead.",
    fallback: true,
  }, { status: 501 })
}
