"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import Image from "next/image"

export default function Testimonials() {
  const containerRef = useRef(null)
  const isInView = useInView(containerRef, { once: true, amount: 0.2 })
  
  const testimonials = [
    {
      quote: "EduFolio completely transformed my college application process. The AI essay feedback helped me improve my personal statement, and I got accepted to my dream school!",
      name: "Alex T.",
      role: "Admitted to Stanford University",
      avatar: "/avatars/avatar-1.png"
    },
    {
      quote: "The portfolio feature helped me showcase my coding projects in a professional way that really impressed admissions officers. It made a huge difference in my applications.",
      name: "Jordan P.",
      role: "CS Major at MIT",
      avatar: "/avatars/avatar-2.png"
    },
    {
      quote: "As a first-generation college student, I found the application tracking system incredibly helpful. It kept me organized and on top of all my deadlines.",
      name: "Taylor R.",
      role: "Scholarship Recipient",
      avatar: "/avatars/avatar-3.png"
    }
  ]
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  }
  
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background"></div>
      
      {/* Subtle patterns */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>
      
      {/* Background blobs */}
      <div className="absolute -top-40 left-0 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl opacity-60"></div>
      <div className="absolute -bottom-40 right-0 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl opacity-60"></div>
      
      <div className="container mx-auto relative z-10" ref={containerRef}>
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.h2 
            className="text-3xl sm:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          >
            What Our Users Say
          </motion.h2>
          <motion.p 
            className="text-muted-foreground max-w-2xl mx-auto text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            Join thousands of students who have streamlined their educational journey with EduFolio.
          </motion.p>
        </motion.div>
        
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={container}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={index} 
              className="bg-background/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-border/30 relative group"
              variants={item}
              whileHover={{ 
                y: -10,
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                transition: { duration: 0.3 }
              }}
            >
              {/* Background glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
              
              <div className="absolute top-0 right-0 -mt-3 -mr-3 text-6xl text-primary/10 font-serif">"</div>
              
              <p className="mb-8 relative z-10 text-lg text-foreground/90 leading-relaxed">{testimonial.quote}</p>
              
              <div className="flex items-center relative z-10">
                <div className="w-14 h-14 rounded-full bg-primary/10 overflow-hidden mr-4 flex items-center justify-center">
                  <div className="font-semibold text-primary text-xl">
                    {testimonial.name.charAt(0)}
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-lg group-hover:text-primary transition-colors">
                    {testimonial.name}
                  </div>
                  <div className="text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
              
              {/* Subtle border glow on hover */}
              <div className="absolute inset-0 rounded-2xl border border-primary/0 group-hover:border-primary/20 transition-colors duration-500"></div>
            </motion.div>
          ))}
        </motion.div>
      </div>
      
      <style jsx>{`
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