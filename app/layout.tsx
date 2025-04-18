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

// Script to prevent theme flashing
const themeInitializerScript = `
  (function() {
    try {
      // Try to get the theme from localStorage
      const storedTheme = localStorage.getItem('theme');
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // Logic to determine which theme to use
      if (storedTheme === 'dark' || (storedTheme === 'system' && systemPrefersDark) || (!storedTheme && systemPrefersDark)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.error('Error setting initial theme', e);
    }
  })();
`;

export const metadata: Metadata = {
  title: "EduFolio - Your Educational Journey, Beautifully Organized",
  description: "Manage your college applications, resume, professional experience, and portfolio with ease.",
  viewport: "width=device-width, initial-scale=1",
  generator: 'v0.dev',
  icons: {
    icon: [
      { url: '/EduFolioLogo.ico', sizes: '32x32' },
      { url: '/EduFolioLogo.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/EduFolioLogo.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/EduFolioLogo.ico" />
        {/* Add script to prevent theme flash */}
        <script dangerouslySetInnerHTML={{ __html: themeInitializerScript }} />
      </head>
      <body className={inter.className} suppressHydrationWarning>
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


import './globals.css'