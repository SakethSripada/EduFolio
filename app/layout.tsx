import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter, Merriweather, Roboto, Montserrat, Lora, Source_Sans_3, Playfair_Display } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { AuthProvider } from "@/components/auth/AuthProvider"
import { Toaster } from "@/components/ui/toaster"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' })
const merriweather = Merriweather({ subsets: ["latin"], weight: ['300', '400', '700', '900'], variable: '--font-merriweather' })
const roboto = Roboto({ subsets: ["latin"], weight: ['100', '300', '400', '500', '700', '900'], variable: '--font-roboto' })
const playfairDisplay = Playfair_Display({ subsets: ["latin"], variable: '--font-playfair-display' })
const montserrat = Montserrat({ subsets: ["latin"], variable: '--font-montserrat' })
const lora = Lora({ subsets: ["latin"], variable: '--font-lora' })
const sourceSansPro = Source_Sans_3({ subsets: ["latin"], variable: '--font-source-sans-pro' })

export const metadata: Metadata = {
  title: "EduFolio - Your Educational Journey, Beautifully Organized",
  description: "Manage your college applications, resume, professional experience, and portfolio with ease.",
  viewport: "width=device-width, initial-scale=1",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <Script
          id="theme-script"
          strategy="beforeInteractive"
          src="/theme-script.js"
        />
      </head>
      <body className={`${inter.variable} ${merriweather.variable} ${roboto.variable} ${playfairDisplay.variable} ${montserrat.variable} ${lora.variable} ${sourceSansPro.variable}`}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">{children}</main>
              <Footer />
              <Toaster />
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
