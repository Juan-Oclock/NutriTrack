"use client"

import { motion } from "framer-motion"
import { Star, Quote } from "lucide-react"
import { cn } from "@/lib/utils"

interface TestimonialCardProps {
  name: string
  role: string
  quote: string
  rating: number
  index: number
}

export function TestimonialCard({
  name,
  role,
  quote,
  rating,
  index
}: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: 0.15 * index, duration: 0.5 }}
      className="glass rounded-2xl p-6 elevation-2 relative overflow-hidden"
    >
      {/* Quote icon decoration */}
      <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/10" />

      {/* Rating stars */}
      <div className="flex items-center gap-0.5 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-4 w-4",
              i < rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"
            )}
          />
        ))}
      </div>

      {/* Quote */}
      <blockquote className="text-foreground mb-4 leading-relaxed">
        &ldquo;{quote}&rdquo;
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-3">
        {/* Avatar placeholder */}
        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm">
          {name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <p className="font-medium text-foreground text-sm">{name}</p>
          <p className="text-xs text-muted-foreground">{role}</p>
        </div>
      </div>
    </motion.div>
  )
}
