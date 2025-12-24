"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/layout/header"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2, Apple } from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"

export default function CreateCustomFoodPage() {
  const router = useRouter()
  const supabase = createClient()

  const [name, setName] = useState("")
  const [brand, setBrand] = useState("")
  const [servingSize, setServingSize] = useState("")
  const [servingUnit, setServingUnit] = useState("g")
  const [calories, setCalories] = useState("")
  const [protein, setProtein] = useState("")
  const [carbs, setCarbs] = useState("")
  const [fat, setFat] = useState("")
  const [fiber, setFiber] = useState("")
  const [sugar, setSugar] = useState("")
  const [sodium, setSodium] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error("Please enter a food name")
      return
    }

    if (!servingSize || parseFloat(servingSize) <= 0) {
      toast.error("Please enter a valid serving size")
      return
    }

    if (!calories || parseFloat(calories) < 0) {
      toast.error("Please enter calories")
      return
    }

    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("You must be logged in")
        router.push("/login")
        return
      }

      const { error } = await supabase.from("user_foods").insert({
        user_id: user.id,
        name: name.trim(),
        brand: brand.trim() || null,
        serving_size: parseFloat(servingSize),
        serving_unit: servingUnit,
        calories: parseFloat(calories),
        protein_g: protein ? parseFloat(protein) : 0,
        carbs_g: carbs ? parseFloat(carbs) : 0,
        fat_g: fat ? parseFloat(fat) : 0,
        fiber_g: fiber ? parseFloat(fiber) : 0,
        sugar_g: sugar ? parseFloat(sugar) : 0,
        sodium_mg: sodium ? parseFloat(sodium) : 0,
      } as never)

      if (error) throw error

      toast.success("Custom food created!")
      router.push("/profile/my-foods")
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to create food")
    } finally {
      setIsLoading(false)
    }
  }

  const servingUnits = ["g", "ml", "oz", "cup", "tbsp", "tsp", "piece", "slice", "serving"]

  return (
    <div className="max-w-lg mx-auto pb-24">
      <Header title="Create Custom Food" showBack />

      <div className="p-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-5 elevation-1"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Apple className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">New Custom Food</h2>
              <p className="text-sm text-muted-foreground">Add your own food item</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground font-medium">Food Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g., Homemade Granola"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 rounded-xl"
                  autoFocus
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand" className="text-foreground font-medium">Brand (optional)</Label>
                <Input
                  id="brand"
                  type="text"
                  placeholder="e.g., Homemade"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>
            </div>

            {/* Serving Size */}
            <div className="space-y-2">
              <Label className="text-foreground font-medium">Serving Size *</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="100"
                  value={servingSize}
                  onChange={(e) => setServingSize(e.target.value)}
                  min="0"
                  step="0.1"
                  className="h-12 rounded-xl flex-1"
                  required
                />
                <select
                  value={servingUnit}
                  onChange={(e) => setServingUnit(e.target.value)}
                  className="h-12 px-3 rounded-xl bg-muted border-0 text-sm font-medium min-w-[80px]"
                >
                  {servingUnits.map((unit) => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Calories */}
            <div className="space-y-2">
              <Label htmlFor="calories" className="text-foreground font-medium">Calories *</Label>
              <Input
                id="calories"
                type="number"
                placeholder="0"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                min="0"
                className="h-12 rounded-xl"
                required
              />
            </div>

            {/* Macros */}
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider font-medium text-muted-foreground">Macronutrients</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="protein" className="text-xs flex items-center gap-1 text-foreground">
                    <span className="h-2 w-2 rounded-full bg-protein" />
                    Protein (g)
                  </Label>
                  <Input
                    id="protein"
                    type="number"
                    placeholder="0"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    min="0"
                    step="0.1"
                    className="h-10 rounded-lg text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="carbs" className="text-xs flex items-center gap-1 text-foreground">
                    <span className="h-2 w-2 rounded-full bg-carbs" />
                    Carbs (g)
                  </Label>
                  <Input
                    id="carbs"
                    type="number"
                    placeholder="0"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    min="0"
                    step="0.1"
                    className="h-10 rounded-lg text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="fat" className="text-xs flex items-center gap-1 text-foreground">
                    <span className="h-2 w-2 rounded-full bg-fat" />
                    Fat (g)
                  </Label>
                  <Input
                    id="fat"
                    type="number"
                    placeholder="0"
                    value={fat}
                    onChange={(e) => setFat(e.target.value)}
                    min="0"
                    step="0.1"
                    className="h-10 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Additional Nutrients (collapsible or always visible) */}
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider font-medium text-muted-foreground">Additional Nutrients (optional)</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="fiber" className="text-xs text-foreground">Fiber (g)</Label>
                  <Input
                    id="fiber"
                    type="number"
                    placeholder="0"
                    value={fiber}
                    onChange={(e) => setFiber(e.target.value)}
                    min="0"
                    step="0.1"
                    className="h-10 rounded-lg text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sugar" className="text-xs text-foreground">Sugar (g)</Label>
                  <Input
                    id="sugar"
                    type="number"
                    placeholder="0"
                    value={sugar}
                    onChange={(e) => setSugar(e.target.value)}
                    min="0"
                    step="0.1"
                    className="h-10 rounded-lg text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sodium" className="text-xs text-foreground">Sodium (mg)</Label>
                  <Input
                    id="sodium"
                    type="number"
                    placeholder="0"
                    value={sodium}
                    onChange={(e) => setSodium(e.target.value)}
                    min="0"
                    step="1"
                    className="h-10 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-base font-semibold"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Food
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
