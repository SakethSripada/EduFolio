import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  Sparkles, 
  GraduationCap, 
  FileText, 
  Pencil, 
  Bot
} from "lucide-react"
import HeroSection from "../components/home/HeroSection"
import FeatureCards from "../components/home/FeatureCards"
import AIFeatures from "../components/home/AIFeatures"
import CTASection from "../components/home/CTASection"

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

      {/* CTA Section */}
      <CTASection />
    </div>
  )
}
