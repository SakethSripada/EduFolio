"use client"

import { useRef } from "react"
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion"
import { useEffect } from "react"
import { GraduationCap, FileText, Star, Zap } from "lucide-react"

// Animated counter component
function Counter({ from, to, duration = 2, decimals = 0 }: { from: number; to: number; duration?: number; decimals?: number }) {
  const nodeRef = useRef<HTMLSpanElement>(null)
  const count = useMotionValue(from)
  
  useEffect(() => {
    const animation = animate(count, to, { duration })
    
    return animation.stop
  }, [count, to, duration])
  
  useEffect(() => {
    const unsubscribe = count.onChange(v => {
      if (nodeRef.current) {
        nodeRef.current.textContent = v.toFixed(decimals)
      }
    })
    
    return unsubscribe
  }, [count, decimals])
  
  return <span ref={nodeRef} />
}

export default function StatisticsSection() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 })
  
  const stats = [
    { 
      value: "10,000+", 
      numericValue: 10000,
      label: "Students", 
      icon: <GraduationCap className="h-6 w-6 text-primary" /> 
    },
    { 
      value: "30,000+", 
      numericValue: 30000,
      label: "Essays Improved", 
      icon: <FileText className="h-6 w-6 text-primary" /> 
    },
    { 
      value: "95%", 
      numericValue: 95,
      label: "User Satisfaction", 
      icon: <Star className="h-6 w-6 text-primary" /> 
    },
    { 
      value: "50+", 
      numericValue: 50,
      label: "New Features Added", 
      icon: <Zap className="h-6 w-6 text-primary" /> 
    },
  ]
  
  return (
    <section 
      className="py-24 bg-background border-y border-border/20 relative overflow-hidden"
      ref={sectionRef}
    >
      {/* Subtle animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-30"></div>
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary/5 rounded-full filter blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-primary/5 rounded-full filter blur-3xl"></div>
      </div>
      
      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-6">
          {stats.map((stat, index) => (
            <motion.div 
              key={index} 
              className="flex flex-col items-center text-center px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.1 + 0.2,
                ease: "easeOut" 
              }}
            >
              <motion.div 
                className="bg-primary/10 p-3 rounded-full mb-4"
                whileHover={{ 
                  scale: 1.1, 
                  boxShadow: "0 0 20px rgba(var(--primary-rgb), 0.3)",
                  backgroundColor: "rgba(var(--primary-rgb), 0.15)" 
                }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                {stat.icon}
              </motion.div>
              
              <div className="text-3xl md:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                {stat.value.includes("%") ? (
                  <>
                    <Counter from={0} to={stat.numericValue} />%
                  </>
                ) : stat.value.includes("+") ? (
                  <>
                    <Counter from={0} to={stat.numericValue} />+
                  </>
                ) : (
                  <Counter from={0} to={stat.numericValue} />
                )}
              </div>
              
              <div className="text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
} 