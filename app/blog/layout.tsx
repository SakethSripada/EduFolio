import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../globals.css"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"
import Link from "next/link"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "EduFolio Blog",
  description: "Educational insights, tips, and resources for students and educators",
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={cn("min-h-screen", inter.className)}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
              <div className="flex items-center gap-6 md:gap-10">
                <Link href="/blog" className="flex items-center space-x-2">
                  <span className="hidden font-bold sm:inline-block">
                    EduFolio Blog
                  </span>
                </Link>
                <nav className="hidden gap-6 md:flex">
                  <Link
                    href="/blog/categories/education"
                    className="flex items-center text-lg font-medium transition-colors hover:text-primary"
                  >
                    Education
                  </Link>
                  <Link
                    href="/blog/categories/college"
                    className="flex items-center text-lg font-medium transition-colors hover:text-primary"
                  >
                    College
                  </Link>
                  <Link
                    href="/blog/categories/career"
                    className="flex items-center text-lg font-medium transition-colors hover:text-primary"
                  >
                    Career
                  </Link>
                </nav>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <Link
                    href="/"
                    className="mr-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
                  >
                    Back to EduFolio
                  </Link>
                  <ModeToggle />
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t py-6 md:py-0">
            <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
              <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                © 2025 EduFolio. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <Link 
                  href="/privacy-policy" 
                  className="text-sm text-muted-foreground underline underline-offset-4"
                >
                  Privacy Policy
                </Link>
                <Link 
                  href="/terms-of-service" 
                  className="text-sm text-muted-foreground underline underline-offset-4"
                >
                  Terms of Service
                </Link>
                <Link 
                  href="/" 
                  className="text-sm text-muted-foreground underline underline-offset-4"
                >
                  Main Site
                </Link>
              </div>
            </div>
          </footer>
        </div>
      </ThemeProvider>
    </div>
  )
} 