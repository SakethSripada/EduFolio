"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowRight } from "lucide-react"

export default function HeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight
      })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Animated Background with Parallax Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-primary/10 z-0">
        <div 
          className="absolute inset-0 opacity-30"
          style={{ 
            transform: `translateX(${mousePosition.x * -20}px) translateY(${mousePosition.y * -20}px)` 
          }}
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_600px_at_25%_25%,rgba(var(--primary-rgb),0.15),transparent)]"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_600px_at_80%_80%,rgba(var(--primary-rgb),0.15),transparent)]"></div>
        </div>
        
        <motion.div 
          className="absolute top-1/4 left-1/3 w-64 h-64 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl"
          animate={{ 
            scale: [1, 1.1, 0.9, 1],
            x: [0, 20, -20, 0],
            y: [0, -20, 20, 0],
          }}
          transition={{ 
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        />
        
        <motion.div 
          className="absolute top-1/3 right-1/4 w-72 h-72 bg-secondary/10 rounded-full mix-blend-multiply filter blur-3xl"
          animate={{ 
            scale: [1, 0.9, 1.1, 1],
            x: [0, -20, 20, 0],
            y: [0, 20, -20, 0],
          }}
          transition={{ 
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        
        <motion.div 
          className="absolute bottom-1/4 left-1/2 w-60 h-60 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl"
          animate={{ 
            scale: [1, 1.1, 0.9, 1],
            x: [0, 20, -20, 0],
            y: [0, -20, 20, 0],
          }}
          transition={{ 
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
        />
      </div>
      
      <div className="container mx-auto text-center relative z-10">
        <motion.div 
          className="inline-flex items-center justify-center px-5 py-2.5 mb-8 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Sparkles className="h-4 w-4 mr-2 text-primary" />
          <span className="text-sm font-medium text-primary">Powered by Advanced AI</span>
        </motion.div>
        
        <motion.h1 
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 leading-tight max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Your Educational Journey,
          <span className="block">Brilliantly Organized</span>
        </motion.h1>
        
        <motion.p 
          className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto text-muted-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Manage your college applications, academics, portfolio, and essays all in one place.
          Powered by AI to help you stand out and succeed.
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:translate-y-[-2px]" 
            asChild
          >
            <Link href="/signup">Get Started For Free</Link>
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="text-lg px-8 py-6 group hover:border-primary/50 transition-all hover:bg-primary/5" 
            asChild
          >
            <Link href="/login" className="flex items-center">
              Take a Tour 
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
} 