"use client"

import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  color: string
  bgColor: string
  index: number
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  color,
  bgColor,
  index
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: 0.1 * index, duration: 0.5 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="group p-5 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 elevation-1 hover:elevation-2"
    >
      <div className={cn(
        "h-12 w-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
        bgColor
      )}>
        <Icon className={cn("h-6 w-6", color)} />
      </div>
      <h3 className="font-semibold text-foreground text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  )
}
