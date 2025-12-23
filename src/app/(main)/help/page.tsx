"use client"

import { Header } from "@/components/layout/header"
import { MessageCircle, Mail, BookOpen, ChevronRight, ExternalLink } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const faqItems = [
  {
    question: "How do I log a meal?",
    answer: "Tap the + button in the navigation bar, then search for food or scan a barcode. You can also take a photo for AI-powered food recognition.",
  },
  {
    question: "How are my calorie goals calculated?",
    answer: "We use the Mifflin-St Jeor equation along with your activity level and weight goals to calculate your daily calorie needs.",
  },
  {
    question: "Can I create custom foods?",
    answer: "Yes! Go to Profile → My Foods → Create Custom Food to add foods that aren't in our database.",
  },
  {
    question: "How do I track my progress?",
    answer: "Visit the Insights tab to see your nutrition trends, weight progress, and detailed analytics over time.",
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We use industry-standard encryption and never share your personal data with third parties.",
  },
]

const contactOptions = [
  {
    icon: Mail,
    label: "Email Support",
    description: "Get help within 24 hours",
    action: "support@caloriecue.app",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: MessageCircle,
    label: "Live Chat",
    description: "Chat with our team",
    action: "Start chat",
    color: "from-emerald-500 to-emerald-600",
  },
  {
    icon: BookOpen,
    label: "Knowledge Base",
    description: "Browse articles & guides",
    action: "Visit docs",
    color: "from-purple-500 to-purple-600",
  },
]

export default function HelpPage() {
  return (
    <div className="max-w-lg mx-auto pb-24">
      <Header title="Help & Support" showBack />

      <div className="p-4 space-y-5">
        {/* Contact Options */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Get in Touch
          </h2>
          <div className="grid gap-3">
            {contactOptions.map((option, index) => (
              <motion.button
                key={option.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 p-4 rounded-2xl bg-card elevation-1 tap-highlight text-left w-full"
              >
                <div className={cn(
                  "h-12 w-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-sm",
                  option.color
                )}>
                  <option.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{option.label}</p>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-3"
        >
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Frequently Asked Questions
          </h2>
          <div className="bg-card rounded-2xl overflow-hidden elevation-1">
            {faqItems.map((item, index) => (
              <details
                key={index}
                className={cn(
                  "group",
                  index < faqItems.length - 1 && "border-b border-border/50"
                )}
              >
                <summary className="flex items-center justify-between p-4 cursor-pointer list-none tap-highlight">
                  <span className="font-medium pr-4">{item.question}</span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-open:rotate-90 flex-shrink-0" />
                </summary>
                <div className="px-4 pb-4 text-sm text-muted-foreground">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </motion.div>

        {/* App Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center pt-4"
        >
          <p className="text-sm text-muted-foreground">CalorieCue v1.0.0</p>
          <p className="text-xs text-muted-foreground mt-1">
            Made with care for your health journey
          </p>
        </motion.div>
      </div>
    </div>
  )
}
