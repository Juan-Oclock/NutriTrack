"use client"

import { Header } from "@/components/layout/header"
import { Shield, Eye, Lock, Server, Trash2, Bell } from "lucide-react"
import { motion } from "framer-motion"

const sections = [
  {
    icon: Eye,
    title: "Information We Collect",
    content: `We collect information you provide directly, including:
• Account information (email, name)
• Health data (weight, height, nutrition logs)
• Device information for app functionality
• Usage data to improve our services`,
  },
  {
    icon: Lock,
    title: "How We Protect Your Data",
    content: `Your security is our priority:
• All data is encrypted in transit and at rest
• We use secure, industry-standard protocols
• Regular security audits and updates
• Two-factor authentication available`,
  },
  {
    icon: Server,
    title: "Data Storage",
    content: `Your data is stored securely:
• Hosted on secure cloud infrastructure
• Regular encrypted backups
• Data centers with physical security
• Compliant with data protection regulations`,
  },
  {
    icon: Shield,
    title: "Your Rights",
    content: `You have control over your data:
• Access your personal data anytime
• Request data export or deletion
• Update or correct your information
• Opt out of non-essential communications`,
  },
  {
    icon: Bell,
    title: "Communications",
    content: `We may send you:
• Essential service notifications
• Optional progress reminders (configurable)
• Product updates and tips (opt-out available)
• We never sell your email to third parties`,
  },
  {
    icon: Trash2,
    title: "Data Deletion",
    content: `You can delete your account anytime:
• Go to Settings → Delete Account
• All personal data will be permanently removed
• Some anonymized data may be retained for analytics
• Deletion is irreversible`,
  },
]

export default function PrivacyPage() {
  return (
    <div className="max-w-lg mx-auto pb-24">
      <Header title="Privacy Policy" showBack />

      <div className="p-4 space-y-5">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-4"
        >
          <div className="h-16 w-16 rounded-2xl bg-primary/10 mx-auto mb-4 flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-xl font-bold mb-2">Your Privacy Matters</h1>
          <p className="text-sm text-muted-foreground">
            Last updated: December 2024
          </p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-4">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card rounded-2xl p-4 elevation-1"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <section.icon className="h-5 w-5 text-primary" />
                </div>
                <h2 className="font-semibold">{section.title}</h2>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl p-4 elevation-1 text-center"
        >
          <p className="text-sm text-muted-foreground mb-2">
            Questions about your privacy?
          </p>
          <a
            href="mailto:privacy@caloriecue.app"
            className="text-primary font-medium"
          >
            privacy@caloriecue.app
          </a>
        </motion.div>
      </div>
    </div>
  )
}
