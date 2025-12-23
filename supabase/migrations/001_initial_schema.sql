-- NutriTrack Database Schema
-- Initial migration

-- Users profile (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  height_cm DECIMAL(5,2),
  current_weight_kg DECIMAL(5,2),
  target_weight_kg DECIMAL(5,2),
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active')),
  goal_type TEXT CHECK (goal_type IN ('lose_weight', 'maintain_weight', 'gain_weight', 'build_muscle')),
  weekly_goal_kg DECIMAL(3,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User nutrition goals
CREATE TABLE nutrition_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  calories_goal INT NOT NULL,
  protein_goal_g INT NOT NULL,
  carbs_goal_g INT NOT NULL,
  fat_goal_g INT NOT NULL,
  fiber_goal_g INT DEFAULT 25,
  sodium_goal_mg INT DEFAULT 2300,
  sugar_goal_g INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Food database (common foods)
CREATE TABLE foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode TEXT UNIQUE,
  name TEXT NOT NULL,
  brand TEXT,
  serving_size DECIMAL(10,2) NOT NULL,
  serving_unit TEXT NOT NULL,
  calories DECIMAL(10,2) NOT NULL,
  protein_g DECIMAL(10,2) DEFAULT 0,
  carbs_g DECIMAL(10,2) DEFAULT 0,
  fat_g DECIMAL(10,2) DEFAULT 0,
  fiber_g DECIMAL(10,2) DEFAULT 0,
  sugar_g DECIMAL(10,2) DEFAULT 0,
  sodium_mg DECIMAL(10,2) DEFAULT 0,
  saturated_fat_g DECIMAL(10,2) DEFAULT 0,
  cholesterol_mg DECIMAL(10,2) DEFAULT 0,
  potassium_mg DECIMAL(10,2) DEFAULT 0,
  vitamin_a_mcg DECIMAL(10,2) DEFAULT 0,
  vitamin_c_mg DECIMAL(10,2) DEFAULT 0,
  calcium_mg DECIMAL(10,2) DEFAULT 0,
  iron_mg DECIMAL(10,2) DEFAULT 0,
  image_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User custom foods
CREATE TABLE user_foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  barcode TEXT,
  name TEXT NOT NULL,
  brand TEXT,
  serving_size DECIMAL(10,2) NOT NULL,
  serving_unit TEXT NOT NULL,
  calories DECIMAL(10,2) NOT NULL,
  protein_g DECIMAL(10,2) DEFAULT 0,
  carbs_g DECIMAL(10,2) DEFAULT 0,
  fat_g DECIMAL(10,2) DEFAULT 0,
  fiber_g DECIMAL(10,2) DEFAULT 0,
  sugar_g DECIMAL(10,2) DEFAULT 0,
  sodium_mg DECIMAL(10,2) DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recipes
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  servings INT NOT NULL DEFAULT 1,
  prep_time_minutes INT,
  cook_time_minutes INT,
  instructions TEXT,
  image_url TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  calories_per_serving DECIMAL(10,2),
  protein_per_serving DECIMAL(10,2),
  carbs_per_serving DECIMAL(10,2),
  fat_per_serving DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recipe ingredients
CREATE TABLE recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  food_id UUID REFERENCES foods(id),
  user_food_id UUID REFERENCES user_foods(id),
  quantity DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL,
  notes TEXT,
  order_index INT DEFAULT 0,
  CHECK (food_id IS NOT NULL OR user_food_id IS NOT NULL)
);

-- Saved meals (combinations of foods for quick logging)
CREATE TABLE saved_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved meal items
CREATE TABLE saved_meal_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saved_meal_id UUID REFERENCES saved_meals(id) ON DELETE CASCADE,
  food_id UUID REFERENCES foods(id),
  user_food_id UUID REFERENCES user_foods(id),
  recipe_id UUID REFERENCES recipes(id),
  quantity DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL,
  CHECK (
    (food_id IS NOT NULL)::int +
    (user_food_id IS NOT NULL)::int +
    (recipe_id IS NOT NULL)::int = 1
  )
);

-- Daily food diary entries
CREATE TABLE diary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snacks')),
  food_id UUID REFERENCES foods(id),
  user_food_id UUID REFERENCES user_foods(id),
  recipe_id UUID REFERENCES recipes(id),
  servings DECIMAL(10,2) NOT NULL DEFAULT 1,
  logged_calories DECIMAL(10,2) NOT NULL,
  logged_protein_g DECIMAL(10,2),
  logged_carbs_g DECIMAL(10,2),
  logged_fat_g DECIMAL(10,2),
  logged_fiber_g DECIMAL(10,2),
  logged_sugar_g DECIMAL(10,2),
  logged_sodium_mg DECIMAL(10,2),
  notes TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (
    (food_id IS NOT NULL)::int +
    (user_food_id IS NOT NULL)::int +
    (recipe_id IS NOT NULL)::int = 1
  )
);

-- Quick add entries (just calories without food details)
CREATE TABLE quick_add_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snacks')),
  calories DECIMAL(10,2) NOT NULL,
  protein_g DECIMAL(10,2),
  carbs_g DECIMAL(10,2),
  fat_g DECIMAL(10,2),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meal plans
CREATE TABLE meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meal plan days
CREATE TABLE meal_plan_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE,
  day_of_week INT CHECK (day_of_week BETWEEN 0 AND 6),
  specific_date DATE,
  CHECK (day_of_week IS NOT NULL OR specific_date IS NOT NULL)
);

-- Meal plan items
CREATE TABLE meal_plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_day_id UUID REFERENCES meal_plan_days(id) ON DELETE CASCADE,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snacks')),
  food_id UUID REFERENCES foods(id),
  user_food_id UUID REFERENCES user_foods(id),
  recipe_id UUID REFERENCES recipes(id),
  saved_meal_id UUID REFERENCES saved_meals(id),
  servings DECIMAL(10,2) NOT NULL DEFAULT 1,
  order_index INT DEFAULT 0,
  CHECK (
    (food_id IS NOT NULL)::int +
    (user_food_id IS NOT NULL)::int +
    (recipe_id IS NOT NULL)::int +
    (saved_meal_id IS NOT NULL)::int = 1
  )
);

-- Weight log
CREATE TABLE weight_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight_kg DECIMAL(5,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Food scan history (for AI meal recognition)
CREATE TABLE meal_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  detected_foods JSONB,
  selected_foods JSONB,
  scan_date TIMESTAMPTZ DEFAULT NOW()
);

-- User streaks and achievements
CREATE TABLE user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_log_date DATE,
  total_days_logged INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_diary_entries_user_date ON diary_entries(user_id, date);
CREATE INDEX idx_diary_entries_date ON diary_entries(date);
CREATE INDEX idx_foods_barcode ON foods(barcode);
CREATE INDEX idx_foods_name ON foods USING gin(to_tsvector('english', name));
CREATE INDEX idx_user_foods_user ON user_foods(user_id);
CREATE INDEX idx_recipes_user ON recipes(user_id);
CREATE INDEX idx_weight_logs_user_date ON weight_logs(user_id, date);
CREATE INDEX idx_meal_plans_user ON meal_plans(user_id);
CREATE INDEX idx_quick_add_user_date ON quick_add_entries(user_id, date);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_meal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_add_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plan_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Nutrition Goals
CREATE POLICY "Users can manage own nutrition goals" ON nutrition_goals
  FOR ALL USING (auth.uid() = user_id);

-- Foods (public read, authenticated write)
CREATE POLICY "Anyone can view foods" ON foods
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert foods" ON foods
  FOR INSERT TO authenticated WITH CHECK (true);

-- User Foods
CREATE POLICY "Users can manage own foods" ON user_foods
  FOR ALL USING (auth.uid() = user_id);

-- Recipes
CREATE POLICY "Users can view public recipes or own recipes" ON recipes
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage own recipes" ON recipes
  FOR ALL USING (auth.uid() = user_id);

-- Recipe Ingredients
CREATE POLICY "Users can view recipe ingredients for accessible recipes" ON recipe_ingredients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_ingredients.recipe_id
      AND (recipes.is_public = true OR recipes.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage own recipe ingredients" ON recipe_ingredients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_ingredients.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

-- Saved Meals
CREATE POLICY "Users can manage own saved meals" ON saved_meals
  FOR ALL USING (auth.uid() = user_id);

-- Saved Meal Items
CREATE POLICY "Users can manage own saved meal items" ON saved_meal_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM saved_meals
      WHERE saved_meals.id = saved_meal_items.saved_meal_id
      AND saved_meals.user_id = auth.uid()
    )
  );

-- Diary Entries
CREATE POLICY "Users can manage own diary entries" ON diary_entries
  FOR ALL USING (auth.uid() = user_id);

-- Quick Add Entries
CREATE POLICY "Users can manage own quick add entries" ON quick_add_entries
  FOR ALL USING (auth.uid() = user_id);

-- Meal Plans
CREATE POLICY "Users can manage own meal plans" ON meal_plans
  FOR ALL USING (auth.uid() = user_id);

-- Meal Plan Days
CREATE POLICY "Users can manage own meal plan days" ON meal_plan_days
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM meal_plans
      WHERE meal_plans.id = meal_plan_days.meal_plan_id
      AND meal_plans.user_id = auth.uid()
    )
  );

-- Meal Plan Items
CREATE POLICY "Users can manage own meal plan items" ON meal_plan_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM meal_plan_days
      JOIN meal_plans ON meal_plans.id = meal_plan_days.meal_plan_id
      WHERE meal_plan_days.id = meal_plan_items.meal_plan_day_id
      AND meal_plans.user_id = auth.uid()
    )
  );

-- Weight Logs
CREATE POLICY "Users can manage own weight logs" ON weight_logs
  FOR ALL USING (auth.uid() = user_id);

-- Meal Scans
CREATE POLICY "Users can manage own meal scans" ON meal_scans
  FOR ALL USING (auth.uid() = user_id);

-- User Streaks
CREATE POLICY "Users can manage own streaks" ON user_streaks
  FOR ALL USING (auth.uid() = user_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );

  -- Create initial streak record
  INSERT INTO public.user_streaks (user_id)
  VALUES (new.id);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nutrition_goals_updated_at BEFORE UPDATE ON nutrition_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_foods_updated_at BEFORE UPDATE ON foods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_foods_updated_at BEFORE UPDATE ON user_foods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_saved_meals_updated_at BEFORE UPDATE ON saved_meals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_diary_entries_updated_at BEFORE UPDATE ON diary_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_meal_plans_updated_at BEFORE UPDATE ON meal_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_streaks_updated_at BEFORE UPDATE ON user_streaks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
