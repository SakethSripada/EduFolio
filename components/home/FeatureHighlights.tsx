"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { CheckCircle, Code, Target, Bot } from "lucide-react"

export default function FeatureHighlights() {
  // References for each feature section
  const feature1Ref = useRef(null)
  const feature2Ref = useRef(null)
  const feature3Ref = useRef(null)
  
  // In-view detection for animations
  const isFeature1InView = useInView(feature1Ref, { once: true, amount: 0.3 })
  const isFeature2InView = useInView(feature2Ref, { once: true, amount: 0.3 })
  const isFeature3InView = useInView(feature3Ref, { once: true, amount: 0.3 })
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  }
  
  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  }
  
  const imageVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.8,
        ease: "easeOut"
      } 
    }
  }
  
  return (
    <section className="py-24 bg-background overflow-hidden">
      <div className="container mx-auto">
        {/* Feature 1: Portfolio */}
        <motion.div 
          className="grid md:grid-cols-2 gap-16 items-center mb-32"
          ref={feature1Ref}
          initial="hidden"
          animate={isFeature1InView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <motion.div variants={containerVariants}>
            <motion.div 
              className="inline-flex items-center px-3 py-1 rounded-full bg-secondary/10 text-secondary mb-4 text-sm"
              variants={textVariants}
            >
              <Code className="h-4 w-4 mr-2" />
              <span>Portfolio Showcase</span>
            </motion.div>
            
            <motion.h2 
              className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-secondary to-secondary/70"
              variants={textVariants}
            >
              Showcase Your Projects and Achievements
            </motion.h2>
            
            <motion.p 
              className="text-muted-foreground mb-8 text-lg"
              variants={textVariants}
            >
              Create beautiful, customizable portfolios that highlight your skills, projects, and achievements. 
              Stand out to admissions officers and future employers with a professional digital presence.
            </motion.p>
            
            <motion.ul 
              className="space-y-4 mb-8"
              variants={containerVariants}
            >
              {[
                "Customizable project cards with images and descriptions",
                "Skills and achievements showcase with visual representations",
                "Category organization for different types of work",
                "Shareable public and private links with analytics"
              ].map((item, i) => (
                <motion.li 
                  key={i} 
                  className="flex items-start"
                  variants={textVariants}
                >
                  <CheckCircle className="h-5 w-5 text-secondary mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-foreground/90">{item}</span>
                </motion.li>
              ))}
            </motion.ul>
            
            <motion.div variants={textVariants}>
              <Button 
                size="lg"
                className="px-6 py-6 text-white bg-secondary hover:bg-secondary/90" 
                asChild
              >
                <Link href="/signup">Create Your Portfolio</Link>
              </Button>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="relative h-full min-h-[400px]"
            variants={imageVariants}
          >
            <div 
              className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-xl shadow-2xl border border-secondary/20"
              style={{
                transformStyle: "preserve-3d",
                perspective: "1000px"
              }}
            >
              <motion.div
                className="w-full h-full"
                animate={{
                  rotateX: isFeature1InView ? [2, -2, 2] : 0,
                  rotateY: isFeature1InView ? [-2, 2, -2] : 0,
                }}
                transition={{
                  duration: 12,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <Image
                  src="/images/portfolio-preview.jpg"
                  alt="Portfolio Showcase"
                  fill
                  className="object-cover rounded-xl"
                />
              </motion.div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-secondary/10 rounded-full blur-3xl -z-10"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-secondary/10 rounded-full blur-3xl -z-10"></div>
          </motion.div>
        </motion.div>

        {/* Feature 2: Application Tracker */}
        <motion.div 
          className="grid md:grid-cols-2 gap-16 items-center mb-32"
          ref={feature2Ref}
          initial="hidden"
          animate={isFeature2InView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <motion.div 
            className="relative h-full min-h-[400px] order-2 md:order-1"
            variants={imageVariants}
          >
            <div 
              className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-xl shadow-2xl border border-primary/20"
              style={{
                transformStyle: "preserve-3d",
                perspective: "1000px"
              }}
            >
              <motion.div
                className="w-full h-full bg-primary/5 rounded-xl flex items-center justify-center"
                animate={{
                  rotateX: isFeature2InView ? [2, -2, 2] : 0,
                  rotateY: isFeature2InView ? [-2, 2, -2] : 0,
                }}
                transition={{
                  duration: 12,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="text-primary/50 text-xl">College App Tracker</div>
              </motion.div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10"></div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10"></div>
          </motion.div>
          
          <motion.div className="order-1 md:order-2" variants={containerVariants}>
            <motion.div 
              className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary mb-4 text-sm"
              variants={textVariants}
            >
              <Target className="h-4 w-4 mr-2" />
              <span>Application Tracker</span>
            </motion.div>
            
            <motion.h2 
              className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70"
              variants={textVariants}
            >
              Manage Your College Applications
            </motion.h2>
            
            <motion.p 
              className="text-muted-foreground mb-8 text-lg"
              variants={textVariants}
            >
              Keep track of all your college applications in one place. Monitor deadlines, requirements, and status updates 
              to ensure you never miss an important date.
            </motion.p>
            
            <motion.ul 
              className="space-y-4 mb-8"
              variants={containerVariants}
            >
              {[
                "Deadline tracking with automated reminders",
                "Application status monitoring and updates",
                "College-specific requirement checklists",
                "Essay drafts and documents organized by school"
              ].map((item, i) => (
                <motion.li 
                  key={i} 
                  className="flex items-start"
                  variants={textVariants}
                >
                  <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-foreground/90">{item}</span>
                </motion.li>
              ))}
            </motion.ul>
            
            <motion.div variants={textVariants}>
              <Button 
                size="lg"
                className="px-6 py-6" 
                asChild
              >
                <Link href="/signup">Track Your Applications</Link>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Feature 3: AI Assistant */}
        <motion.div 
          className="grid md:grid-cols-2 gap-16 items-center"
          ref={feature3Ref}
          initial="hidden"
          animate={isFeature3InView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <motion.div variants={containerVariants}>
            <motion.div 
              className="inline-flex items-center px-3 py-1 rounded-full bg-secondary/10 text-secondary mb-4 text-sm"
              variants={textVariants}
            >
              <Bot className="h-4 w-4 mr-2" />
              <span>AI Assistant</span>
            </motion.div>
            
            <motion.h2 
              className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-secondary to-secondary/70"
              variants={textVariants}
            >
              Personalized AI Writing Assistant
            </motion.h2>
            
            <motion.p 
              className="text-muted-foreground mb-8 text-lg"
              variants={textVariants}
            >
              Get real-time feedback on your essays and personal statements from our advanced AI assistant. 
              Improve your writing with personalized suggestions to make your application stand out.
            </motion.p>
            
            <motion.ul 
              className="space-y-4 mb-8"
              variants={containerVariants}
            >
              {[
                "Real-time writing feedback and suggestions",
                "Grammar, style, and tone improvements",
                "Content ideas personalized to your experiences",
                "Essay structure and flow optimization"
              ].map((item, i) => (
                <motion.li 
                  key={i} 
                  className="flex items-start"
                  variants={textVariants}
                >
                  <CheckCircle className="h-5 w-5 text-secondary mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-foreground/90">{item}</span>
                </motion.li>
              ))}
            </motion.ul>
            
            <motion.div variants={textVariants}>
              <Button 
                size="lg"
                className="px-6 py-6 text-white bg-secondary hover:bg-secondary/90" 
                asChild
              >
                <Link href="/signup">Try AI Assistant</Link>
              </Button>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="relative h-full min-h-[400px]"
            variants={imageVariants}
          >
            <div 
              className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-xl shadow-2xl border border-secondary/20"
              style={{
                transformStyle: "preserve-3d",
                perspective: "1000px"
              }}
            >
              <motion.div
                className="w-full h-full bg-secondary/5 rounded-xl flex items-center justify-center"
                animate={{
                  rotateX: isFeature3InView ? [2, -2, 2] : 0,
                  rotateY: isFeature3InView ? [-2, 2, -2] : 0,
                }}
                transition={{
                  duration: 12,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="text-secondary/50 text-xl">AI Writing Assistant</div>
              </motion.div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-secondary/10 rounded-full blur-3xl -z-10"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-secondary/10 rounded-full blur-3xl -z-10"></div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
} 