"use client"

import { Header } from "@/components/layout/header"
import { FileText, CheckCircle, AlertCircle, Scale, Gavel, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"

const sections = [
  {
    icon: CheckCircle,
    title: "Acceptance of Terms",
    content: `By using NutriTrack, you agree to these terms:
• You must be at least 13 years old
• You are responsible for your account security
• You agree to provide accurate information
• You accept our Privacy Policy`,
  },
  {
    icon: FileText,
    title: "Use of Service",
    content: `NutriTrack is provided for personal use:
• Track nutrition and fitness goals
• Access food database and logging features
• Use AI-powered meal recognition
• View insights and analytics

You may not:
• Use the service for commercial purposes
• Share your account credentials
• Attempt to access other users' data
• Reverse engineer our technology`,
  },
  {
    icon: AlertCircle,
    title: "Health Disclaimer",
    content: `Important health information:
• NutriTrack is not medical advice
• Consult healthcare providers for health decisions
• Calorie calculations are estimates only
• We are not liable for health outcomes
• Seek professional help for eating disorders`,
  },
  {
    icon: Scale,
    title: "Intellectual Property",
    content: `Our content is protected:
• NutriTrack brand and logo are trademarks
• App design and code are copyrighted
• Food database content is proprietary
• User-generated content remains yours
• You grant us license to use your content`,
  },
  {
    icon: Gavel,
    title: "Limitation of Liability",
    content: `To the extent permitted by law:
• Service is provided "as is"
• We don't guarantee accuracy of data
• We're not liable for indirect damages
• Maximum liability limited to fees paid
• Some jurisdictions may vary`,
  },
  {
    icon: RefreshCw,
    title: "Changes to Terms",
    content: `We may update these terms:
• Material changes will be notified
• Continued use implies acceptance
• Previous versions available upon request
• Review terms periodically`,
  },
]

export default function TermsPage() {
  return (
    <div className="max-w-lg mx-auto pb-24">
      <Header title="Terms of Service" showBack />

      <div className="p-4 space-y-5">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-4"
        >
          <div className="h-16 w-16 rounded-2xl bg-primary/10 mx-auto mb-4 flex items-center justify-center">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-xl font-bold mb-2">Terms of Service</h1>
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
            Questions about these terms?
          </p>
          <a
            href="mailto:legal@nutritrack.app"
            className="text-primary font-medium"
          >
            legal@nutritrack.app
          </a>
        </motion.div>
      </div>
    </div>
  )
}
