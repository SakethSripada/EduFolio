import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-background border-t py-8">
      <div className="container mx-auto" suppressHydrationWarning>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8" suppressHydrationWarning>
          <div suppressHydrationWarning>
            <h3 className="text-lg font-semibold mb-4">EduFolio</h3>
            <p className="text-muted-foreground">Your educational journey, beautifully organized.</p>
          </div>
          <div suppressHydrationWarning>
            <h3 className="text-lg font-semibold mb-4">Features</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/college-application" className="text-muted-foreground hover:text-primary transition-colors">
                  College Applications
                </Link>
              </li>
              <li>
                <Link href="/resume" className="text-muted-foreground hover:text-primary transition-colors">
                  Resume Builder
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="text-muted-foreground hover:text-primary transition-colors">
                  Portfolio Creator
                </Link>
              </li>
            </ul>
          </div>
          <div suppressHydrationWarning>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Guides
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>
          <div suppressHydrationWarning>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground" suppressHydrationWarning>
          © 2025 EduFolio. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
