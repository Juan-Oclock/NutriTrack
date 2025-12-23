"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Search, Apple, Trash2, Edit2 } from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface CustomFood {
  id: string
  name: string
  brand?: string
  serving_size: string
  serving_unit: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  created_at: string
}

export default function MyFoodsPage() {
  const [foods, setFoods] = useState<CustomFood[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadFoods() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
          .from("custom_foods")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (data) setFoods(data as CustomFood[])
      } catch (error) {
        console.error("Error loading foods:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadFoods()
  }, [supabase])

  const handleDelete = async (id: string) => {
    try {
      await supabase.from("custom_foods").delete().eq("id", id)
      setFoods(foods.filter(f => f.id !== id))
      toast.success("Food deleted")
    } catch (error) {
      toast.error("Failed to delete food")
    }
  }

  const filteredFoods = foods.filter(food =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    food.brand?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto pb-24">
        <Header title="My Foods" showBack />
        <div className="p-4 space-y-3">
          <Skeleton className="h-12 w-full rounded-xl" />
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto pb-24">
      <Header title="My Foods" showBack />

      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search your foods..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 rounded-xl bg-card"
          />
        </div>

        {/* Add Button */}
        <Link href="/add-food?mode=create">
          <motion.div
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-primary to-emerald-600 text-white tap-highlight"
          >
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">Create Custom Food</p>
              <p className="text-sm text-white/80">Add your own food item</p>
            </div>
          </motion.div>
        </Link>

        {/* Foods List */}
        {filteredFoods.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="h-20 w-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Apple className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No custom foods yet</h3>
            <p className="text-muted-foreground text-sm">
              Create your own foods for quick logging
            </p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {filteredFoods.map((food, index) => (
                <motion.div
                  key={food.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card rounded-2xl p-4 elevation-1"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{food.name}</h4>
                      {food.brand && (
                        <p className="text-sm text-muted-foreground">{food.brand}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {food.serving_size} {food.serving_unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">{food.calories}</p>
                      <p className="text-[10px] text-muted-foreground">cal</p>
                    </div>
                  </div>

                  {/* Macros */}
                  <div className="flex gap-4 mt-3 pt-3 border-t border-border/50">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold text-protein bg-protein/20 px-1.5 py-0.5 rounded">P</span>
                      <span className="text-sm">{food.protein_g}g</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold text-carbs bg-carbs/20 px-1.5 py-0.5 rounded">C</span>
                      <span className="text-sm">{food.carbs_g}g</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold text-fat bg-fat/20 px-1.5 py-0.5 rounded">F</span>
                      <span className="text-sm">{food.fat_g}g</span>
                    </div>
                    <div className="flex-1" />
                    <button
                      onClick={() => handleDelete(food.id)}
                      className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors tap-highlight"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
