"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play, Leaf } from "lucide-react"
import { PhoneMockup } from "./phone-mockup"
import Link from "next/link"

export function HeroSection() {
  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToCta = () => {
    document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative min-h-[90vh] flex items-center py-12 lg:py-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-muted/30" />

      {/* Decorative blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="container relative mx-auto px-4 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left: Text content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left space-y-6"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
            >
              <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
                <Leaf className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium text-primary">CalorieCue</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground"
            >
              Track Your{" "}
              <span className="text-primary">
                Nutrition Journey
              </span>{" "}
              with Confidence
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0"
            >
              Join thousands who&apos;ve transformed their health with smart calorie tracking,
              AI-powered food recognition, and personalized insights.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button
                size="lg"
                onClick={scrollToCta}
                className="h-14 px-8 rounded-xl text-lg font-semibold bg-primary hover:bg-primary/90 group shadow-lg shadow-primary/25"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={scrollToFeatures}
                className="h-14 px-8 rounded-xl text-lg font-semibold"
              >
                <Play className="mr-2 h-5 w-5" />
                See How It Works
              </Button>
            </motion.div>

            {/* Stats preview */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-center lg:justify-start gap-8 pt-4"
            >
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">10K+</p>
                <p className="text-xs text-muted-foreground">Active Users</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">4.8</p>
                <p className="text-xs text-muted-foreground">Star Rating</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">500K+</p>
                <p className="text-xs text-muted-foreground">Foods</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Phone mockup */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative">
              {/* Main phone */}
              <PhoneMockup
                variant="dashboard"
                alt="CalorieCue Dashboard"
                className="relative z-10"
              />

              {/* Secondary phone (tilted) */}
              <motion.div
                initial={{ opacity: 0, x: -20, rotate: -6 }}
                animate={{ opacity: 1, x: 0, rotate: -6 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="absolute -left-16 top-12 -z-10 hidden lg:block"
              >
                <div className="scale-90 opacity-60">
                  <PhoneMockup
                    variant="diary"
                    alt="CalorieCue Food Diary"
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
