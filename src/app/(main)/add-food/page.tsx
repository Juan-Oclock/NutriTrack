"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, ScanBarcode, Camera, Zap, Clock, Star, Apple, ChefHat } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

function AddFoodContent() {
  const searchParams = useSearchParams()
  const meal = searchParams.get("meal") || "breakfast"
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0]

  const quickActions = [
    {
      href: `/add-food/barcode?meal=${meal}&date=${date}`,
      icon: ScanBarcode,
      label: "Scan",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      href: `/add-food/meal-scan?meal=${meal}&date=${date}`,
      icon: Camera,
      label: "Photo",
      gradient: "from-purple-500 to-purple-600",
    },
    {
      href: `/add-food/quick-add?meal=${meal}&date=${date}`,
      icon: Zap,
      label: "Quick",
      gradient: "from-orange-500 to-orange-600",
    },
  ]

  const mealLabels: Record<string, string> = {
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    snacks: "Snacks",
  }

  return (
    <div className="max-w-lg mx-auto pb-24">
      <Header title={`Add to ${mealLabels[meal]}`} showBack />

      <div className="p-4 space-y-6">
        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link href={`/add-food/search?meal=${meal}&date=${date}`}>
            <motion.div
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 bg-card rounded-2xl px-4 py-4 elevation-1 tap-highlight"
            >
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <span className="text-muted-foreground">Search foods...</span>
            </motion.div>
          </Link>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          {quickActions.map((action, index) => (
            <Link key={action.href} href={action.href}>
              <motion.div
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + index * 0.05 }}
                className="flex flex-col items-center gap-2 tap-highlight"
              >
                <div className={cn(
                  "h-16 w-16 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                  action.gradient
                )}>
                  <action.icon className="h-7 w-7 text-white" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">{action.label}</span>
              </motion.div>
            </Link>
          ))}
        </motion.div>

        {/* Tabs for different food sources */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="recent" className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-12 p-1 bg-muted/50 rounded-xl">
              <TabsTrigger value="recent" className="text-xs rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <Clock className="h-3.5 w-3.5 mr-1.5" />
                Recent
              </TabsTrigger>
              <TabsTrigger value="frequent" className="text-xs rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <Star className="h-3.5 w-3.5 mr-1.5" />
                Frequent
              </TabsTrigger>
              <TabsTrigger value="my-foods" className="text-xs rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <Apple className="h-3.5 w-3.5 mr-1.5" />
                Foods
              </TabsTrigger>
              <TabsTrigger value="recipes" className="text-xs rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <ChefHat className="h-3.5 w-3.5 mr-1.5" />
                Recipes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recent" className="mt-4">
              <div className="text-center py-12 rounded-2xl bg-card elevation-1">
                <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                  <Clock className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="font-medium">No recent foods</p>
                <p className="text-sm text-muted-foreground mt-1">Foods you log will appear here</p>
              </div>
            </TabsContent>

            <TabsContent value="frequent" className="mt-4">
              <div className="text-center py-12 rounded-2xl bg-card elevation-1">
                <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                  <Star className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="font-medium">No frequent foods</p>
                <p className="text-sm text-muted-foreground mt-1">Your most logged foods will appear here</p>
              </div>
            </TabsContent>

            <TabsContent value="my-foods" className="mt-4">
              <div className="text-center py-12 rounded-2xl bg-card elevation-1">
                <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                  <Apple className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="font-medium">No custom foods</p>
                <p className="text-sm text-muted-foreground mt-1">Create your own foods to log them quickly</p>
              </div>
            </TabsContent>

            <TabsContent value="recipes" className="mt-4">
              <div className="text-center py-12 rounded-2xl bg-card elevation-1">
                <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                  <ChefHat className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="font-medium">No recipes</p>
                <p className="text-sm text-muted-foreground mt-1">Create recipes to track homemade meals</p>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}

export default function AddFoodPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <AddFoodContent />
    </Suspense>
  )
}
