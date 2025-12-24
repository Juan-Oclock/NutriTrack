"use client"

import { useState, useRef, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Camera, Sparkles, AlertCircle, History, Star, RotateCcw, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { compressImage } from "@/lib/image-compression"
import { useMealHistory, type DetectedFood as HistoryDetectedFood } from "@/hooks/use-meal-history"

interface DetectedFood {
  name: string
  portion: string
  calories: number
  protein: number
  carbs: number
  fat: number
  confidence: number
  selected: boolean
}

function MealScanContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const meal = searchParams.get("meal") || "breakfast"
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0]

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [detectedFoods, setDetectedFoods] = useState<DetectedFood[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLogging, setIsLogging] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  // Meal history hook
  const { scans, loading: historyLoading, toggleFavorite, deleteScan, hasHistory } = useMealHistory({ limit: 10 })

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = async () => {
        try {
          // Compress image before setting preview
          const compressed = await compressImage(reader.result as string)
          setImagePreview(compressed)
          setDetectedFoods([])
          setError(null)
          setShowHistory(false)
        } catch {
          // Fallback to original if compression fails
          setImagePreview(reader.result as string)
          setDetectedFoods([])
          setError(null)
          setShowHistory(false)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeMeal = async () => {
    if (!imagePreview) return

    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch("/api/analyze-meal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: imagePreview }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.fallback) {
          setError("AI vision analysis is not available. Try searching for foods manually.")
          return
        }
        throw new Error(data.error || "Failed to analyze meal")
      }

      if (!data.foods || data.foods.length === 0) {
        setError("No food items detected. Try taking a clearer photo.")
        return
      }

      // Add selected: true to each detected food
      const detectedWithSelection = data.foods.map((food: Omit<DetectedFood, "selected">) => ({
        ...food,
        selected: true,
      }))

      setDetectedFoods(detectedWithSelection)
      toast.success(`Detected ${data.foods.length} food item(s)!`)
    } catch (err) {
      console.error("Analysis error:", err)
      setError(err instanceof Error ? err.message : "Failed to analyze meal. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Log Again from history - no API call needed!
  const handleLogAgain = (historyFoods: HistoryDetectedFood[]) => {
    const foodsWithSelection = historyFoods.map((food) => ({
      ...food,
      selected: true,
    }))
    setDetectedFoods(foodsWithSelection)
    setShowHistory(false)
    setImagePreview(null)
    toast.success("Loaded from history - no API call used!")
  }

  const toggleFood = (index: number) => {
    setDetectedFoods((prev) =>
      prev.map((food, i) =>
        i === index ? { ...food, selected: !food.selected } : food
      )
    )
  }

  const handleLogFoods = async () => {
    const selectedFoods = detectedFoods.filter((f) => f.selected)
    if (selectedFoods.length === 0) {
      toast.error("Please select at least one food to log")
      return
    }

    setIsLogging(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("You must be logged in")
        return
      }

      // Log each selected food as a quick add entry
      for (const food of selectedFoods) {
        await supabase.from("quick_add_entries").insert({
          user_id: user.id,
          date,
          meal_type: meal as "breakfast" | "lunch" | "dinner" | "snacks",
          calories: food.calories,
          protein_g: food.protein,
          carbs_g: food.carbs,
          fat_g: food.fat,
          description: `${food.name} (${food.portion}) - AI Detected`,
        } as never)
      }

      toast.success(`${selectedFoods.length} item(s) added to ${meal}`)
      router.push("/diary")
    } catch (err) {
      console.error("Error logging foods:", err)
      toast.error("Failed to log foods")
    } finally {
      setIsLogging(false)
    }
  }

  const totalSelected = detectedFoods.filter((f) => f.selected)
  const totalCalories = totalSelected.reduce((sum, f) => sum + f.calories, 0)

  // Format date for display
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    return d.toLocaleDateString()
  }

  return (
    <div className="max-w-lg mx-auto">
      <Header title="Meal Scan" showBack />

      <div className="p-4 space-y-4">
        {/* History Toggle - show if has history and not showing detected foods */}
        {hasHistory && detectedFoods.length === 0 && (
          <div className="flex gap-2">
            <Button
              variant={showHistory ? "default" : "outline"}
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="flex-1"
            >
              <History className="mr-2 h-4 w-4" />
              {showHistory ? "Hide History" : "Recent Meals"}
            </Button>
          </div>
        )}

        {/* Meal History Section */}
        {showHistory && !imagePreview && detectedFoods.length === 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground">
              Recent Scans (Log Again = No API Cost!)
            </h3>
            {historyLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-2">
                {scans.map((scan) => (
                  <Card key={scan.id} className="overflow-hidden">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {scan.meal_name || "Scanned Meal"}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{scan.total_calories || 0} cal</span>
                            <span>-</span>
                            <span>{formatDate(scan.scan_date)}</span>
                          </div>
                          {scan.detected_foods && (
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                              {scan.detected_foods.map((f) => f.name).join(", ")}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => toggleFavorite(scan.id)}
                          >
                            <Star
                              className={`h-4 w-4 ${
                                scan.is_favorite
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => deleteScan(scan.id)}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => scan.detected_foods && handleLogAgain(scan.detected_foods)}
                            disabled={!scan.detected_foods}
                          >
                            <RotateCcw className="mr-1 h-3 w-3" />
                            Log Again
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Image Upload */}
        {!showHistory && (
          <Card>
            <CardContent className="p-4">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
              />

              {imagePreview ? (
                <div className="space-y-4">
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                    <img
                      src={imagePreview}
                      alt="Meal preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Retake
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={analyzeMeal}
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Analyze Meal
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : detectedFoods.length === 0 ? (
                <div
                  className="aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="font-medium">Take a photo of your meal</p>
                  <p className="text-sm text-muted-foreground">
                    or upload from gallery
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        {!imagePreview && !showHistory && detectedFoods.length === 0 && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">Tips for best results:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Ensure good lighting</li>
                <li>Center all food items in frame</li>
                <li>Avoid blurry photos</li>
                <li>Include the full plate/meal</li>
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Detected Foods */}
        {detectedFoods.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Detected Foods</h3>
              <p className="text-sm text-muted-foreground">
                {totalSelected.length} selected
              </p>
            </div>

            <div className="space-y-2">
              {detectedFoods.map((food, index) => (
                <Card
                  key={index}
                  className={`cursor-pointer transition-colors ${
                    food.selected ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => toggleFood(index)}
                >
                  <CardContent className="p-4 flex items-start gap-3">
                    <Checkbox
                      checked={food.selected}
                      className="mt-1"
                      onClick={(e) => e.stopPropagation()}
                      onCheckedChange={() => toggleFood(index)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{food.name}</p>
                        <p className="font-semibold">{food.calories} cal</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {food.portion}
                      </p>
                      <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                        <span className="text-red-500">P: {food.protein}g</span>
                        <span className="text-blue-500">C: {food.carbs}g</span>
                        <span className="text-yellow-500">F: {food.fat}g</span>
                      </div>
                      {food.confidence !== undefined && (
                        <div className="mt-1">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              food.confidence >= 0.9
                                ? "bg-green-100 text-green-700"
                                : food.confidence >= 0.7
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {Math.round(food.confidence * 100)}% confident
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Log Button */}
            <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 safe-area-bottom">
              <div className="max-w-lg mx-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Total Calories</span>
                  <span className="font-bold text-lg">{totalCalories} cal</span>
                </div>
                <Button
                  className="w-full"
                  onClick={handleLogFoods}
                  disabled={isLogging || totalSelected.length === 0}
                >
                  {isLogging && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Log {totalSelected.length} Item(s) to{" "}
                  {meal.charAt(0).toUpperCase() + meal.slice(1)}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function MealScanPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <MealScanContent />
    </Suspense>
  )
}
