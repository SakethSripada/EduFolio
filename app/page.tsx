import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  Sparkles, 
  GraduationCap, 
  FileText, 
  Pencil, 
  Bot,
  Shield,
  CreditCard,
  Lock,
  Info
} from "lucide-react"
import HeroSection from "../components/home/HeroSection"
import FeatureCards from "../components/home/FeatureCards"
import AIFeatures from "../components/home/AIFeatures"
import CTASection from "../components/home/CTASection"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function Home() {
  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Hero Section with 3D elements and parallax */}
      <HeroSection />

      {/* Features Showcase with enhanced cards */}
      <section className="py-20 bg-background relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,rgba(var(--primary-rgb),0.05)_25%,rgba(var(--primary-rgb),0.05)_75%,transparent_100%)] opacity-60"></div>
        <div className="container mx-auto z-10 relative px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 relative inline-block">
              <span className="relative z-10">All-in-One Educational Platform</span>
              <span className="absolute -bottom-1 left-0 w-full h-3 bg-primary/20 rounded -z-10"></span>
            </h2>
            <p className="text-lg text-muted-foreground">
              EduFolio combines everything you need to organize your educational journey and stand out in your college applications.
            </p>
          </div>
          
          <FeatureCards />
        </div>
      </section>

      {/* AI Features Section with enhanced glassmorphism */}
      <AIFeatures />

      {/* Trust & Security Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Trust & Security</h2>
            <p className="text-muted-foreground">Your security is our top priority</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <div className="flex items-center gap-4 mb-4">
                <Shield className="w-8 h-8 text-primary" />
                <h3 className="text-xl font-semibold">PCI Compliant</h3>
              </div>
              <p className="text-muted-foreground">All payments are processed securely through Stripe, ensuring your payment information is protected.</p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <div className="flex items-center gap-4 mb-4">
                <Lock className="w-8 h-8 text-primary" />
                <h3 className="text-xl font-semibold">Secure Payments</h3>
              </div>
              <p className="text-muted-foreground">We accept all major credit cards and ensure your transactions are encrypted and secure.</p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <div className="flex items-center gap-4 mb-4">
                <Info className="w-8 h-8 text-primary" />
                <h3 className="text-xl font-semibold">Transparent Policies</h3>
              </div>
              <p className="text-muted-foreground">Clear refund and privacy policies to ensure a smooth experience.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection />

      {/* Legal Footer */}
      <footer className="bg-background border-t">
        <div className="container mx-auto px-4 py-8">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-sm">Legal Information</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-muted-foreground">
                  <div>
                    <h4 className="font-semibold mb-2">Contact Information</h4>
                    <p>Email: support@edufolio.com</p>
                    <p>Phone: (555) 123-4567</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Important Links</h4>
                    <p>• <Link href="/policies" className="text-primary hover:underline">Subscription & Refund Policies</Link></p>
                    <p>• <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link></p>
                    <p>• <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link></p>
                    <p>• All prices are in USD</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </footer>
    </div>
  )
}
