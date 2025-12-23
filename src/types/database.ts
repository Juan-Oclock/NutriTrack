export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    PostgrestVersion: "12"
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          date_of_birth: string | null
          gender: "male" | "female" | "other" | "prefer_not_to_say" | null
          height_cm: number | null
          current_weight_kg: number | null
          target_weight_kg: number | null
          activity_level: "sedentary" | "lightly_active" | "moderately_active" | "very_active" | "extremely_active" | null
          goal_type: "lose_weight" | "maintain_weight" | "gain_weight" | "build_muscle" | null
          weekly_goal_kg: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          date_of_birth?: string | null
          gender?: "male" | "female" | "other" | "prefer_not_to_say" | null
          height_cm?: number | null
          current_weight_kg?: number | null
          target_weight_kg?: number | null
          activity_level?: "sedentary" | "lightly_active" | "moderately_active" | "very_active" | "extremely_active" | null
          goal_type?: "lose_weight" | "maintain_weight" | "gain_weight" | "build_muscle" | null
          weekly_goal_kg?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          date_of_birth?: string | null
          gender?: "male" | "female" | "other" | "prefer_not_to_say" | null
          height_cm?: number | null
          current_weight_kg?: number | null
          target_weight_kg?: number | null
          activity_level?: "sedentary" | "lightly_active" | "moderately_active" | "very_active" | "extremely_active" | null
          goal_type?: "lose_weight" | "maintain_weight" | "gain_weight" | "build_muscle" | null
          weekly_goal_kg?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      nutrition_goals: {
        Row: {
          id: string
          user_id: string
          calories_goal: number
          protein_goal_g: number
          carbs_goal_g: number
          fat_goal_g: number
          fiber_goal_g: number
          sodium_goal_mg: number
          sugar_goal_g: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          calories_goal: number
          protein_goal_g: number
          carbs_goal_g: number
          fat_goal_g: number
          fiber_goal_g?: number
          sodium_goal_mg?: number
          sugar_goal_g?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          calories_goal?: number
          protein_goal_g?: number
          carbs_goal_g?: number
          fat_goal_g?: number
          fiber_goal_g?: number
          sodium_goal_mg?: number
          sugar_goal_g?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      foods: {
        Row: {
          id: string
          barcode: string | null
          name: string
          brand: string | null
          serving_size: number
          serving_unit: string
          calories: number
          protein_g: number
          carbs_g: number
          fat_g: number
          fiber_g: number
          sugar_g: number
          sodium_mg: number
          saturated_fat_g: number
          cholesterol_mg: number
          potassium_mg: number
          vitamin_a_mcg: number
          vitamin_c_mg: number
          calcium_mg: number
          iron_mg: number
          image_url: string | null
          is_verified: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          barcode?: string | null
          name: string
          brand?: string | null
          serving_size: number
          serving_unit: string
          calories: number
          protein_g?: number
          carbs_g?: number
          fat_g?: number
          fiber_g?: number
          sugar_g?: number
          sodium_mg?: number
          saturated_fat_g?: number
          cholesterol_mg?: number
          potassium_mg?: number
          vitamin_a_mcg?: number
          vitamin_c_mg?: number
          calcium_mg?: number
          iron_mg?: number
          image_url?: string | null
          is_verified?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          barcode?: string | null
          name?: string
          brand?: string | null
          serving_size?: number
          serving_unit?: string
          calories?: number
          protein_g?: number
          carbs_g?: number
          fat_g?: number
          fiber_g?: number
          sugar_g?: number
          sodium_mg?: number
          saturated_fat_g?: number
          cholesterol_mg?: number
          potassium_mg?: number
          vitamin_a_mcg?: number
          vitamin_c_mg?: number
          calcium_mg?: number
          iron_mg?: number
          image_url?: string | null
          is_verified?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_foods: {
        Row: {
          id: string
          user_id: string
          barcode: string | null
          name: string
          brand: string | null
          serving_size: number
          serving_unit: string
          calories: number
          protein_g: number
          carbs_g: number
          fat_g: number
          fiber_g: number
          sugar_g: number
          sodium_mg: number
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          barcode?: string | null
          name: string
          brand?: string | null
          serving_size: number
          serving_unit: string
          calories: number
          protein_g?: number
          carbs_g?: number
          fat_g?: number
          fiber_g?: number
          sugar_g?: number
          sodium_mg?: number
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          barcode?: string | null
          name?: string
          brand?: string | null
          serving_size?: number
          serving_unit?: string
          calories?: number
          protein_g?: number
          carbs_g?: number
          fat_g?: number
          fiber_g?: number
          sugar_g?: number
          sodium_mg?: number
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      recipes: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          servings: number
          prep_time_minutes: number | null
          cook_time_minutes: number | null
          instructions: string | null
          image_url: string | null
          is_public: boolean
          calories_per_serving: number | null
          protein_per_serving: number | null
          carbs_per_serving: number | null
          fat_per_serving: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          servings?: number
          prep_time_minutes?: number | null
          cook_time_minutes?: number | null
          instructions?: string | null
          image_url?: string | null
          is_public?: boolean
          calories_per_serving?: number | null
          protein_per_serving?: number | null
          carbs_per_serving?: number | null
          fat_per_serving?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          servings?: number
          prep_time_minutes?: number | null
          cook_time_minutes?: number | null
          instructions?: string | null
          image_url?: string | null
          is_public?: boolean
          calories_per_serving?: number | null
          protein_per_serving?: number | null
          carbs_per_serving?: number | null
          fat_per_serving?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      recipe_ingredients: {
        Row: {
          id: string
          recipe_id: string
          food_id: string | null
          user_food_id: string | null
          quantity: number
          unit: string
          notes: string | null
          order_index: number
        }
        Insert: {
          id?: string
          recipe_id: string
          food_id?: string | null
          user_food_id?: string | null
          quantity: number
          unit: string
          notes?: string | null
          order_index?: number
        }
        Update: {
          id?: string
          recipe_id?: string
          food_id?: string | null
          user_food_id?: string | null
          quantity?: number
          unit?: string
          notes?: string | null
          order_index?: number
        }
      }
      saved_meals: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      saved_meal_items: {
        Row: {
          id: string
          saved_meal_id: string
          food_id: string | null
          user_food_id: string | null
          recipe_id: string | null
          quantity: number
          unit: string
        }
        Insert: {
          id?: string
          saved_meal_id: string
          food_id?: string | null
          user_food_id?: string | null
          recipe_id?: string | null
          quantity: number
          unit: string
        }
        Update: {
          id?: string
          saved_meal_id?: string
          food_id?: string | null
          user_food_id?: string | null
          recipe_id?: string | null
          quantity?: number
          unit?: string
        }
      }
      diary_entries: {
        Row: {
          id: string
          user_id: string
          date: string
          meal_type: "breakfast" | "lunch" | "dinner" | "snacks"
          food_id: string | null
          user_food_id: string | null
          recipe_id: string | null
          servings: number
          logged_calories: number
          logged_protein_g: number | null
          logged_carbs_g: number | null
          logged_fat_g: number | null
          logged_fiber_g: number | null
          logged_sugar_g: number | null
          logged_sodium_mg: number | null
          notes: string | null
          logged_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          meal_type: "breakfast" | "lunch" | "dinner" | "snacks"
          food_id?: string | null
          user_food_id?: string | null
          recipe_id?: string | null
          servings?: number
          logged_calories: number
          logged_protein_g?: number | null
          logged_carbs_g?: number | null
          logged_fat_g?: number | null
          logged_fiber_g?: number | null
          logged_sugar_g?: number | null
          logged_sodium_mg?: number | null
          notes?: string | null
          logged_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          meal_type?: "breakfast" | "lunch" | "dinner" | "snacks"
          food_id?: string | null
          user_food_id?: string | null
          recipe_id?: string | null
          servings?: number
          logged_calories?: number
          logged_protein_g?: number | null
          logged_carbs_g?: number | null
          logged_fat_g?: number | null
          logged_fiber_g?: number | null
          logged_sugar_g?: number | null
          logged_sodium_mg?: number | null
          notes?: string | null
          logged_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      quick_add_entries: {
        Row: {
          id: string
          user_id: string
          date: string
          meal_type: "breakfast" | "lunch" | "dinner" | "snacks"
          calories: number
          protein_g: number | null
          carbs_g: number | null
          fat_g: number | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          meal_type: "breakfast" | "lunch" | "dinner" | "snacks"
          calories: number
          protein_g?: number | null
          carbs_g?: number | null
          fat_g?: number | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          meal_type?: "breakfast" | "lunch" | "dinner" | "snacks"
          calories?: number
          protein_g?: number | null
          carbs_g?: number | null
          fat_g?: number | null
          description?: string | null
          created_at?: string
        }
      }
      meal_plans: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          start_date: string | null
          end_date: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      meal_plan_days: {
        Row: {
          id: string
          meal_plan_id: string
          day_of_week: number | null
          specific_date: string | null
        }
        Insert: {
          id?: string
          meal_plan_id: string
          day_of_week?: number | null
          specific_date?: string | null
        }
        Update: {
          id?: string
          meal_plan_id?: string
          day_of_week?: number | null
          specific_date?: string | null
        }
      }
      meal_plan_items: {
        Row: {
          id: string
          meal_plan_day_id: string
          meal_type: "breakfast" | "lunch" | "dinner" | "snacks"
          food_id: string | null
          user_food_id: string | null
          recipe_id: string | null
          saved_meal_id: string | null
          servings: number
          order_index: number
        }
        Insert: {
          id?: string
          meal_plan_day_id: string
          meal_type: "breakfast" | "lunch" | "dinner" | "snacks"
          food_id?: string | null
          user_food_id?: string | null
          recipe_id?: string | null
          saved_meal_id?: string | null
          servings?: number
          order_index?: number
        }
        Update: {
          id?: string
          meal_plan_day_id?: string
          meal_type?: "breakfast" | "lunch" | "dinner" | "snacks"
          food_id?: string | null
          user_food_id?: string | null
          recipe_id?: string | null
          saved_meal_id?: string | null
          servings?: number
          order_index?: number
        }
      }
      weight_logs: {
        Row: {
          id: string
          user_id: string
          date: string
          weight_kg: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          weight_kg: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          weight_kg?: number
          notes?: string | null
          created_at?: string
        }
      }
      meal_scans: {
        Row: {
          id: string
          user_id: string
          image_url: string
          detected_foods: Json | null
          selected_foods: Json | null
          scan_date: string
        }
        Insert: {
          id?: string
          user_id: string
          image_url: string
          detected_foods?: Json | null
          selected_foods?: Json | null
          scan_date?: string
        }
        Update: {
          id?: string
          user_id?: string
          image_url?: string
          detected_foods?: Json | null
          selected_foods?: Json | null
          scan_date?: string
        }
      }
      user_streaks: {
        Row: {
          id: string
          user_id: string
          current_streak: number
          longest_streak: number
          last_log_date: string | null
          total_days_logged: number
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          current_streak?: number
          longest_streak?: number
          last_log_date?: string | null
          total_days_logged?: number
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          current_streak?: number
          longest_streak?: number
          last_log_date?: string | null
          total_days_logged?: number
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"]
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"]

// Convenience types
export type Profile = Tables<"profiles">
export type NutritionGoal = Tables<"nutrition_goals">
export type Food = Tables<"foods">
export type UserFood = Tables<"user_foods">
export type Recipe = Tables<"recipes">
export type RecipeIngredient = Tables<"recipe_ingredients">
export type SavedMeal = Tables<"saved_meals">
export type SavedMealItem = Tables<"saved_meal_items">
export type DiaryEntry = Tables<"diary_entries">
export type QuickAddEntry = Tables<"quick_add_entries">
export type MealPlan = Tables<"meal_plans">
export type MealPlanDay = Tables<"meal_plan_days">
export type MealPlanItem = Tables<"meal_plan_items">
export type WeightLog = Tables<"weight_logs">
export type MealScan = Tables<"meal_scans">
export type UserStreak = Tables<"user_streaks">

export type MealType = "breakfast" | "lunch" | "dinner" | "snacks"
