"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ScanBarcode, Flashlight, Camera, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import type { Food, InsertTables } from "@/types/database"

function BarcodeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const meal = searchParams.get("meal") || "breakfast"
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0]

  const [isScanning, setIsScanning] = useState(false)
  const [manualBarcode, setManualBarcode] = useState("")
  const [isLookingUp, setIsLookingUp] = useState(false)
  const [foundFood, setFoundFood] = useState<Food | null>(null)
  const [servings, setServings] = useState("1")
  const [error, setError] = useState<string | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const supabase = createClient()

  const lookupBarcode = async (barcode: string) => {
    setIsLookingUp(true)
    setError(null)
    setFoundFood(null)

    try {
      // First check local database
      const { data: localFood } = await supabase
        .from("foods")
        .select("*")
        .eq("barcode", barcode)
        .single()

      if (localFood) {
        setFoundFood(localFood)
        return
      }

      // If not found locally, try Open Food Facts API
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${barcode}`,
        {
          headers: {
            "User-Agent": "NutriTrack/1.0",
          },
        }
      )

      if (!response.ok) {
        throw new Error("Failed to lookup barcode")
      }

      const data = await response.json()

      if (data.status !== 1 || !data.product) {
        setError("Product not found. You can add it manually.")
        return
      }

      const product = data.product
      const nutriments = product.nutriments || {}

      // Create food object from Open Food Facts data
      const foodInsert: InsertTables<"foods"> = {
        barcode,
        name: product.product_name || "Unknown Product",
        brand: product.brands || null,
        serving_size: parseFloat(product.serving_quantity) || 100,
        serving_unit: product.serving_quantity_unit || "g",
        calories: nutriments["energy-kcal_100g"] || nutriments["energy-kcal"] || 0,
        protein_g: nutriments.proteins_100g || nutriments.proteins || 0,
        carbs_g: nutriments.carbohydrates_100g || nutriments.carbohydrates || 0,
        fat_g: nutriments.fat_100g || nutriments.fat || 0,
        fiber_g: nutriments.fiber_100g || nutriments.fiber || 0,
        sugar_g: nutriments.sugars_100g || nutriments.sugars || 0,
        sodium_mg: (nutriments.sodium_100g || nutriments.sodium || 0) * 1000,
        saturated_fat_g: nutriments["saturated-fat_100g"] || 0,
        cholesterol_mg: 0,
        potassium_mg: nutriments.potassium_100g || 0,
        vitamin_a_mcg: 0,
        vitamin_c_mg: 0,
        calcium_mg: nutriments.calcium_100g || 0,
        iron_mg: nutriments.iron_100g || 0,
        image_url: product.image_url || null,
        is_verified: false,
      }

      // Save to local database for future lookups (ignore errors if already exists)
      const { data: insertedFood } = await supabase
        .from("foods")
        .insert(foodInsert as never)
        .select()
        .single()

      if (insertedFood) {
        setFoundFood(insertedFood as Food)
      } else {
        // If insert failed (maybe due to duplicate), try to fetch by barcode
        const { data: existingFood } = await supabase
          .from("foods")
          .select("*")
          .eq("barcode", barcode)
          .single()
        if (existingFood) {
          setFoundFood(existingFood)
        }
      }
    } catch (err) {
      console.error("Barcode lookup error:", err)
      setError("Failed to lookup barcode. Please try again or enter manually.")
    } finally {
      setIsLookingUp(false)
    }
  }

  const handleManualLookup = () => {
    if (manualBarcode.length >= 8) {
      lookupBarcode(manualBarcode)
    } else {
      toast.error("Please enter a valid barcode")
    }
  }

  const handleLogFood = async () => {
    if (!foundFood) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("You must be logged in")
        return
      }

      const servingsNum = parseFloat(servings) || 1

      const { error } = await supabase.from("diary_entries").insert({
        user_id: user.id,
        date,
        meal_type: meal as "breakfast" | "lunch" | "dinner" | "snacks",
        food_id: foundFood.id,
        servings: servingsNum,
        logged_calories: foundFood.calories * servingsNum,
        logged_protein_g: foundFood.protein_g * servingsNum,
        logged_carbs_g: foundFood.carbs_g * servingsNum,
        logged_fat_g: foundFood.fat_g * servingsNum,
        logged_fiber_g: foundFood.fiber_g * servingsNum,
        logged_sugar_g: foundFood.sugar_g * servingsNum,
        logged_sodium_mg: foundFood.sodium_mg * servingsNum,
      } as never)

      if (error) throw error

      toast.success(`${foundFood.name} added to ${meal}`)
      router.push("/diary")
    } catch (err) {
      console.error("Error logging food:", err)
      toast.error("Failed to log food")
    }
  }

  const startScanning = async () => {
    try {
      // Check if we're in a secure context (HTTPS or localhost)
      if (!window.isSecureContext) {
        setCameraError(
          "Camera requires HTTPS. Please use localhost or enable HTTPS to scan barcodes. You can still enter the barcode manually below."
        )
        return
      }

      // Check if mediaDevices API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError(
          "Camera not supported on this device/browser. Please enter the barcode manually below."
        )
        return
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        // Explicitly play the video (required for mobile browsers)
        await videoRef.current.play()
        setIsScanning(true)
        setCameraError(null)

        // Note: In a full implementation, you would use @zxing/browser here
        // to continuously scan for barcodes from the video stream
        toast.info("Camera active. Enter barcode manually below for now.")
      }
    } catch (err) {
      console.error("Camera error:", err)
      if (err instanceof Error && err.name === "NotAllowedError") {
        setCameraError("Camera permission denied. Please allow camera access and try again.")
      } else {
        setCameraError("Could not access camera. Please enter barcode manually.")
      }
    }
  }

  const stopScanning = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    setIsScanning(false)
  }

  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [])

  return (
    <div className="max-w-lg mx-auto">
      <Header title="Scan Barcode" showBack />

      <div className="p-4 space-y-4">
        {/* Camera View */}
        <Card className="overflow-hidden">
          <div className="relative aspect-[4/3] bg-black">
            {isScanning ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-32 border-2 border-white rounded-lg" />
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-4 right-4"
                  onClick={stopScanning}
                >
                  Stop
                </Button>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <ScanBarcode className="h-16 w-16 mb-4 opacity-50" />
                <Button onClick={startScanning} disabled={!!cameraError}>
                  <Camera className="mr-2 h-4 w-4" />
                  Start Scanning
                </Button>
                {cameraError && (
                  <p className="text-sm text-red-400 mt-2 text-center px-4">
                    {cameraError}
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Manual Entry */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Enter Barcode Manually</CardTitle>
            <CardDescription>
              Type the barcode number if scanning isn&apos;t working
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Enter barcode number"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleManualLookup} disabled={isLookingUp}>
                {isLookingUp ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Lookup"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Found Food */}
        {foundFood && (
          <Card className="border-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{foundFood.name}</CardTitle>
              {foundFood.brand && (
                <CardDescription>{foundFood.brand}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold">{Math.round(foundFood.calories)}</p>
                  <p className="text-xs text-muted-foreground">cal</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-red-500">{foundFood.protein_g}g</p>
                  <p className="text-xs text-muted-foreground">protein</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-blue-500">{foundFood.carbs_g}g</p>
                  <p className="text-xs text-muted-foreground">carbs</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-yellow-500">{foundFood.fat_g}g</p>
                  <p className="text-xs text-muted-foreground">fat</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                  className="w-20 text-center"
                  min="0.25"
                  step="0.25"
                />
                <span className="text-sm text-muted-foreground flex-1">
                  servings ({foundFood.serving_size} {foundFood.serving_unit} each)
                </span>
              </div>

              <Button className="w-full" onClick={handleLogFood}>
                Add to {meal.charAt(0).toUpperCase() + meal.slice(1)}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function BarcodePage() {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <BarcodeContent />
    </Suspense>
  )
}
