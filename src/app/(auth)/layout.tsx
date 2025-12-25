"use client"

import Link from "next/link"
import { Leaf, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Safe area cover for iOS */}
      <div
        className="fixed top-0 left-0 right-0 z-50 bg-background"
        style={{ height: 'env(safe-area-inset-top, 0px)' }}
        aria-hidden="true"
      />

      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div
        className="container max-w-lg mx-auto px-4 py-6 relative z-10 min-h-screen flex flex-col"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.5rem)' }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Back</span>
          </Link>
          <Link href="/" className="flex items-center">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="ml-2 text-xl font-bold text-foreground tracking-tight">CalorieCue</span>
          </Link>
        </motion.div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
