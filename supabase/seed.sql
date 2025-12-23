-- Seed data for NutriTrack
-- Common foods database

INSERT INTO foods (name, brand, serving_size, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, is_verified) VALUES
-- Proteins
('Chicken Breast, Grilled', NULL, 100, 'g', 165, 31, 0, 3.6, 0, 0, 74, true),
('Salmon, Atlantic, Baked', NULL, 100, 'g', 208, 20, 0, 13, 0, 0, 59, true),
('Eggs, Scrambled', NULL, 100, 'g', 147, 10, 1.6, 11, 0, 1.4, 145, true),
('Ground Beef, 90% Lean', NULL, 100, 'g', 176, 20, 0, 10, 0, 0, 66, true),
('Tofu, Firm', NULL, 100, 'g', 76, 8, 1.9, 4.8, 0.3, 0.6, 7, true),
('Greek Yogurt, Plain, Nonfat', 'Generic', 170, 'g', 100, 17, 6, 0.7, 0, 4, 65, true),
('Tuna, Canned in Water', NULL, 100, 'g', 116, 26, 0, 0.8, 0, 0, 338, true),
('Turkey Breast, Deli Sliced', NULL, 56, 'g', 60, 12, 2, 0.5, 0, 1, 450, true),

-- Grains & Carbs
('Brown Rice, Cooked', NULL, 195, 'g', 216, 5, 45, 1.8, 3.5, 0, 10, true),
('White Rice, Cooked', NULL, 158, 'g', 206, 4.3, 45, 0.4, 0.6, 0, 1.6, true),
('Oatmeal, Cooked', NULL, 234, 'g', 158, 6, 27, 3.2, 4, 1.1, 9, true),
('Whole Wheat Bread', 'Generic', 28, 'g', 69, 3.6, 12, 1.1, 1.9, 1.4, 132, true),
('Pasta, Cooked', NULL, 140, 'g', 220, 8.1, 43, 1.3, 2.5, 0.8, 1, true),
('Quinoa, Cooked', NULL, 185, 'g', 222, 8.1, 39, 3.6, 5.2, 0, 13, true),
('Sweet Potato, Baked', NULL, 200, 'g', 180, 4, 41, 0.2, 6.6, 13, 72, true),
('Potato, Baked', NULL, 173, 'g', 161, 4.3, 37, 0.2, 3.8, 1.9, 17, true),

-- Vegetables
('Broccoli, Steamed', NULL, 156, 'g', 55, 3.7, 11, 0.6, 5.1, 2.2, 64, true),
('Spinach, Raw', NULL, 30, 'g', 7, 0.9, 1.1, 0.1, 0.7, 0.1, 24, true),
('Carrots, Raw', NULL, 128, 'g', 52, 1.2, 12, 0.3, 3.6, 6.1, 88, true),
('Bell Pepper, Red', NULL, 149, 'g', 46, 1.5, 9, 0.5, 3.1, 6.3, 6, true),
('Tomato, Raw', NULL, 123, 'g', 22, 1.1, 4.8, 0.2, 1.5, 3.2, 6, true),
('Cucumber, Raw', NULL, 104, 'g', 16, 0.7, 3.8, 0.1, 0.5, 1.7, 2, true),
('Mixed Greens Salad', NULL, 85, 'g', 18, 1.5, 3.5, 0.2, 1.8, 1.5, 25, true),
('Avocado', NULL, 150, 'g', 240, 3, 12, 22, 10, 1, 10, true),

-- Fruits
('Apple, Medium', NULL, 182, 'g', 95, 0.5, 25, 0.3, 4.4, 19, 2, true),
('Banana, Medium', NULL, 118, 'g', 105, 1.3, 27, 0.4, 3.1, 14, 1, true),
('Orange, Medium', NULL, 131, 'g', 62, 1.2, 15, 0.2, 3.1, 12, 0, true),
('Strawberries', NULL, 152, 'g', 49, 1, 12, 0.5, 3, 7.4, 2, true),
('Blueberries', NULL, 148, 'g', 84, 1.1, 21, 0.5, 3.6, 15, 1, true),
('Grapes, Red', NULL, 151, 'g', 104, 1.1, 27, 0.2, 1.4, 23, 3, true),

-- Dairy & Alternatives
('Milk, 2%', NULL, 244, 'ml', 122, 8.1, 12, 4.8, 0, 12, 115, true),
('Almond Milk, Unsweetened', 'Generic', 240, 'ml', 30, 1, 1, 2.5, 0, 0, 170, true),
('Cheddar Cheese', NULL, 28, 'g', 113, 7, 0.4, 9.3, 0, 0.1, 174, true),
('Mozzarella Cheese', NULL, 28, 'g', 85, 6.3, 0.6, 6.3, 0, 0.2, 138, true),
('Cottage Cheese, Low Fat', NULL, 113, 'g', 82, 14, 3.1, 1.2, 0, 2.7, 459, true),

-- Fats & Oils
('Olive Oil', NULL, 14, 'ml', 119, 0, 0, 13.5, 0, 0, 0, true),
('Butter', NULL, 14, 'g', 102, 0.1, 0, 11.5, 0, 0, 91, true),
('Peanut Butter', NULL, 32, 'g', 188, 8, 6, 16, 1.9, 3, 136, true),
('Almonds', NULL, 28, 'g', 164, 6, 6, 14, 3.5, 1.2, 0, true),
('Walnuts', NULL, 28, 'g', 185, 4.3, 3.9, 18.5, 1.9, 0.7, 0.6, true),

-- Beverages
('Coffee, Black', NULL, 240, 'ml', 2, 0.3, 0, 0, 0, 0, 5, true),
('Green Tea', NULL, 240, 'ml', 2, 0, 0, 0, 0, 0, 2, true),
('Orange Juice', NULL, 240, 'ml', 112, 1.7, 26, 0.5, 0.5, 21, 2, true),

-- Snacks & Misc
('Protein Bar', 'Generic', 60, 'g', 200, 20, 22, 6, 3, 6, 150, true),
('Rice Cake', NULL, 9, 'g', 35, 0.7, 7.3, 0.3, 0.4, 0, 29, true),
('Hummus', NULL, 30, 'g', 79, 2.4, 6, 5.4, 1.5, 0.3, 141, true),
('Dark Chocolate, 70%', NULL, 28, 'g', 170, 2.2, 13, 12, 3.1, 6.8, 6, true);

-- Add more foods as needed
