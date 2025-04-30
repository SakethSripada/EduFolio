import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { AuthProvider } from "@/components/auth/AuthProvider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "EduFolio - Your Educational Journey, Beautifully Organized",
  description: "Manage your college applications, resume, professional experience, and portfolio with ease.",
  viewport: "width=device-width, initial-scale=1",
    generator: 'v0.dev'
}

// This script runs before any content to set the theme 
// and prevent theme flash on initial load
const themeScript = `
  (function() {
    try {
      // Try to get the theme from localStorage
      const storedTheme = localStorage.getItem('theme');
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // Logic to determine which theme to use
      let theme;
      if (storedTheme === 'dark' || (storedTheme === 'system' && systemPrefersDark) || (!storedTheme && systemPrefersDark)) {
        document.documentElement.classList.add('dark');
        theme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        theme = 'light';
      }
      
      localStorage.setItem('theme', theme);
    } catch (e) {
      console.error('Error setting initial theme', e);
    }
  })()
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
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
