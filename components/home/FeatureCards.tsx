"use client"

import { 
  GraduationCap, 
  Pencil, 
  Bot, 
  FileText
} from "lucide-react"
import { motion } from "framer-motion"

const features = [
  {
    title: "College Applications",
    description: "Track your applications, deadlines, and admissions status all in one place.",
    icon: GraduationCap,
    color: "bg-blue-500/10 text-blue-500"
  },
  {
    title: "Portfolio Builder",
    description: "Showcase your achievements, projects, and extracurricular activities.",
    icon: FileText,
    color: "bg-purple-500/10 text-purple-500"
  },
  {
    title: "Essay Management",
    description: "Write, edit, and organize your college essays with powerful tools.",
    icon: Pencil,
    color: "bg-amber-500/10 text-amber-500"
  },
  {
    title: "AI Assistant",
    description: "Get personalized guidance and feedback powered by advanced AI.",
    icon: Bot,
    color: "bg-emerald-500/10 text-emerald-500"
  }
]

export default function FeatureCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {features.map((feature, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          viewport={{ once: true }}
          className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow"
        >
          <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
            <feature.icon className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
          <p className="text-muted-foreground">{feature.description}</p>
        </motion.div>
      ))}
    </div>
  )
} 