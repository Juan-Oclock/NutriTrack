"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Leaf, HelpCircle, MessageSquare, Mail, FileQuestion, BookOpen, Bug } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

const supportOptions = [
  {
    icon: FileQuestion,
    title: "FAQ",
    description: "Find answers to commonly asked questions about CalorieCue.",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: BookOpen,
    title: "Getting Started",
    description: "Learn the basics of tracking your nutrition with our guides.",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    icon: Bug,
    title: "Report a Bug",
    description: "Found something not working? Let us know so we can fix it.",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  {
    icon: MessageSquare,
    title: "Feature Request",
    description: "Have an idea to make CalorieCue better? We'd love to hear it.",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
]

const faqs = [
  {
    question: "How do I log my meals?",
    answer: "You can log meals by tapping the '+' button on the dashboard. Choose from barcode scanning, photo recognition, or manual search to find and add foods to your diary."
  },
  {
    question: "How are my calorie goals calculated?",
    answer: "Your calorie goals are calculated based on your height, weight, age, activity level, and fitness goals using the Mifflin-St Jeor equation, adjusted for your target weight change rate."
  },
  {
    question: "Can I customize my macro targets?",
    answer: "Yes! Go to Profile > Goals to adjust your protein, carbohydrate, and fat targets. You can set them as percentages or specific gram amounts."
  },
  {
    question: "Is my data private?",
    answer: "Absolutely. Your nutrition data is encrypted and stored securely. We never sell your personal information. Read our Privacy Policy for more details."
  },
  {
    question: "How do I delete my account?",
    answer: "You can delete your account from Profile > Settings > Delete Account. This will permanently remove all your data from our servers."
  },
  {
    question: "Does CalorieCue work offline?",
    answer: "Yes, CalorieCue works offline for viewing your recent entries. However, you'll need an internet connection to search for new foods or sync your data."
  },
]

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-foreground">CalorieCue</span>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 max-w-4xl py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          {/* Title */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mx-auto">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">Support Center</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Need help with CalorieCue? We&apos;re here to assist you on your nutrition journey.
            </p>
          </div>

          {/* Support Options Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {supportOptions.map((option, index) => (
              <motion.div
                key={option.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="h-full hover:border-primary/30 transition-colors cursor-pointer group">
                  <CardHeader>
                    <div className={`h-12 w-12 rounded-xl ${option.bgColor} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                      <option.icon className={`h-6 w-6 ${option.color}`} />
                    </div>
                    <CardTitle className="text-lg">{option.title}</CardTitle>
                    <CardDescription>{option.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* FAQ Section */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={faq.question}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                >
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-medium">{faq.question}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{faq.answer}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Contact Section */}
          <section className="text-center space-y-4 pt-8 border-t border-border">
            <h2 className="text-2xl font-bold text-foreground">Still Need Help?</h2>
            <p className="text-muted-foreground">
              Can&apos;t find what you&apos;re looking for? Reach out to us directly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90"
                asChild
              >
                <a href="mailto:onelasttimejuan@gmail.com">
                  <Mail className="mr-2 h-5 w-5" />
                  Email Support
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="https://github.com/nutritrack/issues" target="_blank" rel="noopener noreferrer">
                  <Bug className="mr-2 h-5 w-5" />
                  Report Issue on GitHub
                </a>
              </Button>
            </div>
          </section>
        </motion.div>
      </main>
    </div>
  )
}
