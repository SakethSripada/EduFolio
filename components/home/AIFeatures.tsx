"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { CheckCircle, Sparkles, Brain, Star, BarChart3 } from "lucide-react"

export default function AIFeatures() {
  const containerRef = useRef(null)
  const isInView = useInView(containerRef, { once: true, amount: 0.2 })
  
  const features = [
    {
      title: "Smart Essay Feedback",
      description: "Get real-time, personalized feedback on your essays with suggestions to improve clarity, structure, and impact.",
      icon: <Brain className="h-12 w-12 text-primary" />,
      features: ["Style and tone analysis", "Grammar and structure improvements", "Personalized content suggestions"],
    },
    {
      title: "Portfolio Optimization",
      description: "AI-powered recommendations to highlight your strongest achievements and create a compelling narrative.",
      icon: <Star className="h-12 w-12 text-primary" />,
      features: ["Project presentation tips", "Skills gap analysis", "Strategic highlighting recommendations"],
    },
    {
      title: "Application Strategy",
      description: "Data-driven insights to help you stand out and maximize your chances of admission.",
      icon: <BarChart3 className="h-12 w-12 text-primary" />,
      features: ["School-specific advice", "Application strength assessment", "Strategic application planning"],
    },
  ]
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  }
  
  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-br from-primary/5 to-background">
      {/* Animated grid pattern background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>
      
      {/* Animated gradient blobs */}
      <div className="absolute top-40 -left-64 w-96 h-96 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
      <div className="absolute -bottom-40 -right-64 w-96 h-96 bg-primary/5 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      
      <div className="container mx-auto relative z-10" ref={containerRef}>
        <motion.div 
          className="text-center mb-16 max-w-3xl mx-auto"
          variants={{
            hidden: { opacity: 0, y: 20 },
            show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
          }}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
        >
          <motion.div 
            className="inline-flex items-center justify-center px-4 py-2 mb-4 rounded-full bg-primary/10 text-primary"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">AI-Powered Features</span>
          </motion.div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Your Personal AI Educational Assistant
          </h2>
          <p className="text-lg text-muted-foreground">
            Our advanced AI technology provides personalized guidance throughout your educational journey.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={container}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              className="relative group backdrop-blur-sm rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 p-8 transition-all duration-500 overflow-hidden"
              variants={item}
              whileHover={{ y: -5 }}
            >
              {/* Background gradient effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
              
              {/* Shimmering light effect on hover */}
              <div className="absolute -inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-2000 rounded-2xl"></div>
              
              <div className="relative z-10">
                <div className="bg-primary/10 p-4 rounded-xl inline-block mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground/90 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground mb-6 group-hover:text-foreground/80 transition-colors">
                  {feature.description}
                </p>
                
                <ul className="space-y-3">
                  {feature.features.map((item, i) => (
                    <li key={i} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                      <span className="text-sm text-foreground/80">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
      
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: scale(1) translate(0px, 0px);
          }
          33% {
            transform: scale(1.1) translate(20px, -20px);
          }
          66% {
            transform: scale(0.9) translate(-20px, 20px);
          }
          100% {
            transform: scale(1) translate(0px, 0px);
          }
        }
        .animate-blob {
          animation: blob 12s infinite;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(var(--foreground-rgb), 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(var(--foreground-rgb), 0.05) 1px, transparent 1px);
          background-size: 24px 24px;
        }
      `}</style>
    </section>
  )
} 