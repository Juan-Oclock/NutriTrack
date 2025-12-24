"use client"

import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { TestimonialCard } from "./testimonial-card"
import { Star } from "lucide-react"

const stats = [
  { value: 10000, suffix: "+", label: "Active Users" },
  { value: 500000, suffix: "+", label: "Foods in Database" },
  { value: 4.8, label: "App Rating", isRating: true },
  { value: 1000000, suffix: "+", label: "Meals Logged" },
]

const testimonials = [
  {
    name: "Sarah M.",
    role: "Lost 15 lbs in 3 months",
    quote: "CalorieCue made calorie counting actually enjoyable. The barcode scanner saves me so much time, and I love seeing my progress in those beautiful charts!",
    rating: 5,
  },
  {
    name: "James K.",
    role: "Fitness Enthusiast",
    quote: "Finally an app that tracks macros properly. The visual progress rings keep me motivated, and the AI suggestions are surprisingly accurate.",
    rating: 5,
  },
  {
    name: "Emily R.",
    role: "Meal Prep Expert",
    quote: "The food diary feature is exactly what I needed. Being able to repeat previous meals makes my weekly meal prep so much easier to track.",
    rating: 5,
  },
]

function AnimatedCounter({ value, suffix = "", isRating = false }: { value: number; suffix?: string; isRating?: boolean }) {
  const [displayValue, setDisplayValue] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          const duration = 2000
          const start = Date.now()
          const end = start + duration

          const tick = () => {
            const now = Date.now()
            const progress = Math.min((now - start) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic

            if (isRating) {
              setDisplayValue(Math.round(eased * value * 10) / 10)
            } else {
              setDisplayValue(Math.round(eased * value))
            }

            if (progress < 1) {
              requestAnimationFrame(tick)
            }
          }

          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.5 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [value, isRating, hasAnimated])

  const formatNumber = (num: number) => {
    if (isRating) return num.toFixed(1)
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
    return num.toString()
  }

  return (
    <div ref={ref} className="text-4xl sm:text-5xl font-bold text-foreground">
      {formatNumber(displayValue)}{suffix}
    </div>
  )
}

export function SocialProofSection() {
  return (
    <section className="py-20 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-muted/30" />

      <div className="container relative mx-auto px-4 max-w-7xl">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * index }}
              className="text-center"
            >
              {stat.isRating ? (
                <div className="flex items-center justify-center gap-2 mb-2">
                  <AnimatedCounter value={stat.value} isRating />
                  <Star className="h-8 w-8 text-amber-400 fill-amber-400" />
                </div>
              ) : (
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              )}
              <p className="text-muted-foreground mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4">
            Loved by{" "}
            <span className="text-primary">
              Thousands
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            See what our users have to say about their experience with CalorieCue.
          </p>
        </motion.div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={testimonial.name} {...testimonial} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
