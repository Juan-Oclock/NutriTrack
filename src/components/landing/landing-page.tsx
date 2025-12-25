"use client"

import { motion } from "framer-motion"
import { Leaf, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HeroSection } from "./hero-section"
import { FeaturesSection } from "./features-section"
import { BenefitsSection } from "./benefits-section"
import { SocialProofSection } from "./social-proof-section"
import { CTASection } from "./cta-section"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [safeAreaTop, setSafeAreaTop] = useState('env(safe-area-inset-top, 0px)')

  useEffect(() => {
    // Detect if running as installed PWA and apply fallback
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as Navigator & { standalone?: boolean }).standalone === true

    if (isStandalone) {
      setSafeAreaTop('max(env(safe-area-inset-top, 47px), 47px)')
    }
  }, [])

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Safe area cover for iOS */}
      <div
        className="fixed top-0 left-0 right-0 z-[60] bg-background"
        style={{ height: safeAreaTop }}
        aria-hidden="true"
      />

      {/* Navigation */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50"
        style={{ top: safeAreaTop }}
      >
        <nav className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-foreground">CalorieCue</span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => scrollToSection('features')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('cta')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Get Started
              </button>
              <ThemeToggle />
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
              <Button
                size="sm"
                onClick={() => scrollToSection('cta')}
                className="bg-primary hover:bg-primary/90"
              >
                Sign Up Free
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center gap-2 md:hidden">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-4 border-t border-border/50"
            >
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => scrollToSection('features')}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection('cta')}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                >
                  Get Started
                </button>
                <div className="flex gap-2 pt-2">
                  <Link href="/login" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    onClick={() => scrollToSection('cta')}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    Sign Up
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </nav>
      </motion.header>

      {/* Main content */}
      <main
        className="pt-14"
        style={{ paddingTop: `calc(${safeAreaTop} + 3.5rem)` }}
      >
        <HeroSection />
        <FeaturesSection />
        <BenefitsSection />
        <SocialProofSection />
        <CTASection />
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 bg-muted/30">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col items-center gap-8">
            {/* Top row */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 w-full">
              {/* Logo */}
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <Leaf className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-foreground">CalorieCue</span>
              </div>

              {/* Links */}
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
                <Link href="/support" className="hover:text-foreground transition-colors">
                  Support
                </Link>
              </div>

              {/* Copyright */}
              <p className="text-sm text-muted-foreground">
                {new Date().getFullYear()} CalorieCue. All rights reserved.
              </p>
            </div>

            {/* Bottom row - Attribution */}
            <div className="pt-4 border-t border-border/50 w-full text-center">
              <p className="text-sm text-muted-foreground">
                Proudly over-engineered by{" "}
                <a
                  href="https://juan-oclock.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  Juan Oclock
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
