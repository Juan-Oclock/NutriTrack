"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Calendar, ChefHat, Sun, Cloud, Moon, Cookie } from "lucide-react"
import Link from "next/link"

const mealIcons = {
  breakfast: Sun,
  lunch: Cloud,
  dinner: Moon,
  snacks: Cookie,
}

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default function PlansPage() {
  const [selectedDay, setSelectedDay] = useState(new Date().getDay())

  return (
    <div className="max-w-lg mx-auto">
      <Header
        title="Meal Plans"
        rightContent={
          <Link href="/plans/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              New Plan
            </Button>
          </Link>
        }
      />

      <div className="p-4 space-y-6">
        <Tabs defaultValue="weekly">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weekly">Weekly Plan</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="mt-4 space-y-4">
            {/* Day Selector */}
            <div className="flex justify-between bg-card rounded-lg p-1 border border-border">
              {days.map((day, index) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(index)}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                    selectedDay === index
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Meal Slots */}
            <div className="space-y-3">
              {(["breakfast", "lunch", "dinner", "snacks"] as const).map((meal) => {
                const Icon = mealIcons[meal]
                return (
                  <Card key={meal}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium capitalize">{meal}</p>
                            <p className="text-sm text-muted-foreground">
                              No meal planned
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Empty State */}
            <Card className="bg-muted/50">
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No meal plan for {days[selectedDay]}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start planning your meals to reach your nutrition goals
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Meals
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="mt-4 space-y-4">
            {/* Template Cards */}
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <ChefHat className="h-4 w-4 text-primary" />
                  High Protein Plan
                </CardTitle>
                <CardDescription>
                  ~2,200 cal | 180g protein
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  A week of high-protein meals perfect for muscle building
                </p>
              </CardContent>
            </Card>

            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <ChefHat className="h-4 w-4 text-primary" />
                  Low Carb Plan
                </CardTitle>
                <CardDescription>
                  ~1,800 cal | 50g carbs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Keto-friendly meals for effective weight loss
                </p>
              </CardContent>
            </Card>

            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <ChefHat className="h-4 w-4 text-primary" />
                  Balanced Diet
                </CardTitle>
                <CardDescription>
                  ~2,000 cal | Balanced macros
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Well-rounded meals for maintaining a healthy lifestyle
                </p>
              </CardContent>
            </Card>

            {/* Create Template */}
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <Plus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="font-medium">Create Your Own Template</p>
                <p className="text-sm text-muted-foreground">
                  Build a custom meal plan from your recipes
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
