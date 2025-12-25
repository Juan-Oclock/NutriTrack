import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toast"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeColorMeta } from "@/components/theme-color-meta"
import { QueryProvider } from "@/providers/query-provider"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

// Helper to ensure URL has protocol
function getBaseUrl(): URL {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL
  if (!envUrl) {
    return new URL("https://caloriecue.vercel.app")
  }
  // Add https:// if no protocol specified
  if (!envUrl.startsWith("http://") && !envUrl.startsWith("https://")) {
    return new URL(`https://${envUrl}`)
  }
  return new URL(envUrl)
}

export const metadata: Metadata = {
  metadataBase: getBaseUrl(),
  title: {
    default: "CalorieCue - Calorie & Macro Tracker",
    template: "%s | CalorieCue",
  },
  description: "Track calories, macros, and nutrition goals with AI-powered meal scanning. Scan barcodes, log meals, and achieve your fitness goals with 500K+ foods database.",
  keywords: ["calorie tracker", "macro tracker", "nutrition app", "meal scanner", "food diary", "fitness app", "diet tracker", "barcode scanner", "AI meal recognition"],
  authors: [{ name: "CalorieCue" }],
  creator: "CalorieCue",
  publisher: "CalorieCue",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CalorieCue",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "CalorieCue",
    title: "CalorieCue - Calorie & Macro Tracker",
    description: "Track calories, macros, and nutrition goals with AI-powered meal scanning. Scan barcodes, log meals, and achieve your fitness goals.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CalorieCue - Your personal nutrition companion",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "CalorieCue - Calorie & Macro Tracker",
    description: "Track calories, macros, and nutrition goals with AI-powered meal scanning. 500K+ foods database.",
    images: ["/og-image.png"],
    creator: "@caloriecue",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F1EB" },
    { media: "(prefers-color-scheme: dark)", color: "#15120F" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <ThemeColorMeta />
            {children}
            <Toaster />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
