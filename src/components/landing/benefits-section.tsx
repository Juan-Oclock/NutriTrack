"use client"

import { motion } from "framer-motion"
import { PhoneMockup } from "./phone-mockup"
import { Check } from "lucide-react"

const benefits = [
  {
    title: "Track Every Meal with Ease",
    description: "Our intuitive dashboard shows your daily progress at a glance. Beautiful calorie rings, macro breakdowns, and quick actions make logging your meals a breeze.",
    variant: "dashboard" as const,
    imageAlt: "Dashboard with calorie tracking",
    features: [
      "Visual calorie progress rings",
      "Macro breakdown by protein, carbs, fat",
      "Quick action buttons for fast logging",
    ],
  },
  {
    title: "Your Complete Food Diary",
    description: "Keep a detailed record of everything you eat, organized by meal. View your history, repeat favorite meals, and stay on track with your nutrition goals.",
    variant: "diary" as const,
    imageAlt: "Food diary view",
    features: [
      "Organized by breakfast, lunch, dinner, snacks",
      "Easy to repeat previous meals",
      "Detailed nutritional information",
    ],
  },
  {
    title: "Insights That Drive Results",
    description: "Understand your eating patterns with detailed analytics. Track weight changes, see weekly trends, and get personalized recommendations to improve.",
    variant: "insights" as const,
    imageAlt: "Progress insights and charts",
    features: [
      "Weight trend visualization",
      "Weekly and monthly reports",
      "Personalized recommendations",
    ],
  },
]

export function BenefitsSection() {
  return (
    <section className="py-20 lg:py-32">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Why CalorieCue
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4">
            Designed for Your{" "}
            <span className="text-primary">
              Success
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            See how CalorieCue helps you build healthy habits and achieve your goals.
          </p>
        </motion.div>

        {/* Benefits list */}
        <div className="space-y-24 lg:space-y-32">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${
                index % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Text content */}
              <div className={`space-y-6 ${index % 2 === 1 ? "lg:order-2" : ""}`}>
                <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
                  {benefit.title}
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
                <ul className="space-y-3">
                  {benefit.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Phone mockup */}
              <div className={`flex justify-center ${index % 2 === 1 ? "lg:order-1" : ""}`}>
                <PhoneMockup
                  variant={benefit.variant}
                  alt={benefit.imageAlt}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
