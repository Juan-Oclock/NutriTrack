"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, ScanBarcode, Camera, Zap, Clock, Star, Apple, ChefHat, UtensilsCrossed } from "lucide-react"

function AddFoodContent() {
  const searchParams = useSearchParams()
  const meal = searchParams.get("meal") || "breakfast"
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0]

  const quickActions = [
    { href: `/add-food/barcode?meal=${meal}&date=${date}`, icon: ScanBarcode, label: "Scan Barcode", color: "bg-blue-100 text-blue-600" },
    { href: `/add-food/meal-scan?meal=${meal}&date=${date}`, icon: Camera, label: "Meal Scan", color: "bg-purple-100 text-purple-600" },
    { href: `/add-food/quick-add?meal=${meal}&date=${date}`, icon: Zap, label: "Quick Add", color: "bg-orange-100 text-orange-600" },
  ]

  const mealLabels: Record<string, string> = {
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    snacks: "Snacks",
  }

  return (
    <div className="max-w-lg mx-auto">
      <Header title={`Add to ${mealLabels[meal]}`} showBack />

      <div className="p-4 space-y-6">
        {/* Search */}
        <Link href={`/add-food/search?meal=${meal}&date=${date}`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search foods..."
              className="pl-10 cursor-pointer"
              readOnly
            />
          </div>
        </Link>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="hover:border-primary/50 transition-colors">
                <CardContent className="p-4 flex flex-col items-center gap-2">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${action.color}`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-center">{action.label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Tabs for different food sources */}
        <Tabs defaultValue="recent" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="recent" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Recent
            </TabsTrigger>
            <TabsTrigger value="frequent" className="text-xs">
              <Star className="h-3 w-3 mr-1" />
              Frequent
            </TabsTrigger>
            <TabsTrigger value="my-foods" className="text-xs">
              <Apple className="h-3 w-3 mr-1" />
              My Foods
            </TabsTrigger>
            <TabsTrigger value="recipes" className="text-xs">
              <ChefHat className="h-3 w-3 mr-1" />
              Recipes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="mt-4">
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No recent foods</p>
              <p className="text-sm">Foods you log will appear here</p>
            </div>
          </TabsContent>

          <TabsContent value="frequent" className="mt-4">
            <div className="text-center py-8 text-muted-foreground">
              <Star className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No frequent foods</p>
              <p className="text-sm">Your most logged foods will appear here</p>
            </div>
          </TabsContent>

          <TabsContent value="my-foods" className="mt-4">
            <div className="text-center py-8 text-muted-foreground">
              <Apple className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No custom foods</p>
              <p className="text-sm">Create your own foods to log them quickly</p>
            </div>
          </TabsContent>

          <TabsContent value="recipes" className="mt-4">
            <div className="text-center py-8 text-muted-foreground">
              <ChefHat className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No recipes</p>
              <p className="text-sm">Create recipes to track homemade meals</p>
            </div>
          </TabsContent>
        </Tabs>
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
