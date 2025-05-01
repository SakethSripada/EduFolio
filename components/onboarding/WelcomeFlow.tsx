"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  Book, 
  Briefcase, 
  FileText, 
  ChevronRight, 
  CheckCircle, 
  Star, 
  Coffee, 
  Sparkles 
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUserSettings, EnabledTools } from '@/hooks/useUserSettings'

const StepVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, x: -50, transition: { duration: 0.3 } }
}

interface WelcomeFlowProps {
  onComplete: () => void
}

export function WelcomeFlow({ onComplete }: WelcomeFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [tools, setTools] = useState<EnabledTools>({
    collegeApp: true,
    portfolio: true,
    resume: true
  })
  const { settings, updateSettings, completeFirstLogin } = useUserSettings()

  const steps = [
    { id: 'welcome', title: 'Welcome to EduFolio!' },
    { id: 'tools', title: 'Choose Your Tools' },
    { id: 'complete', title: 'You\'re All Set!' }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    try {
      // Save tool settings and mark onboarding as complete
      const success = await updateSettings({
        enabledTools: tools,
        isFirstLogin: false
      })
      
      if (!success) {
        console.error("Failed to update settings during onboarding")
      }
      
      // Call onComplete callback regardless to ensure user isn't blocked
      onComplete()
    } catch (error) {
      console.error("Error completing onboarding:", error)
      // Still call onComplete to ensure user isn't blocked if there's an error
      onComplete()
    }
  }

  const handleToolToggle = (toolName: keyof EnabledTools, checked: boolean) => {
    setTools(prev => ({
      ...prev,
      [toolName]: checked
    }))
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <Card className="w-full max-w-3xl overflow-hidden shadow-xl">
        {/* Progress bar */}
        <div className="w-full h-1 bg-muted">
          <motion.div 
            className="h-full bg-primary" 
            initial={{ width: 0 }}
            animate={{ 
              width: `${((currentStep + 1) / steps.length) * 100}%`,
              transition: { duration: 0.3 }
            }}
          />
        </div>

        <CardContent className="p-0">
          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={steps[currentStep].id}
                variants={StepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="p-8"
              >
                {currentStep === 0 && (
                  <WelcomeStep />
                )}

                {currentStep === 1 && (
                  <ToolsStep 
                    tools={tools} 
                    onToolToggle={handleToolToggle} 
                  />
                )}

                {currentStep === 2 && (
                  <CompleteStep />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Step buttons */}
          <div className="p-6 bg-muted/20 border-t flex justify-between items-center">
            <div className="flex items-center gap-2">
              {steps.map((step, i) => (
                <motion.div
                  key={step.id}
                  className={cn(
                    "w-2 h-2 rounded-full",
                    i === currentStep ? "bg-primary" : "bg-muted"
                  )}
                  animate={{
                    scale: i === currentStep ? 1.5 : 1,
                  }}
                />
              ))}
            </div>
            <div className="flex gap-3">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                >
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="group"
              >
                {currentStep < steps.length - 1 ? (
                  <>
                    Next
                    <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                ) : (
                  "Get Started"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Individual step components
const WelcomeStep = () => {
  return (
    <div className="space-y-6 py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              delay: 0.3
            }}
            className="rounded-full bg-primary/10 p-4"
          >
            <Sparkles className="h-16 w-16 text-primary" />
          </motion.div>
        </div>
        <h1 className="text-3xl font-bold mb-4">Welcome to EduFolio!</h1>
        <p className="text-muted-foreground text-lg max-w-lg mx-auto">
          Your all-in-one educational journey organizer. We're excited to help you succeed!
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
      >
        <div className="bg-primary/5 rounded-lg p-6 text-center">
          <Book className="h-10 w-10 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">College Applications</h3>
          <p className="text-sm text-muted-foreground">
            Organize applications, essays, and deadlines all in one place
          </p>
        </div>
        
        <div className="bg-primary/5 rounded-lg p-6 text-center">
          <Briefcase className="h-10 w-10 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Portfolio Builder</h3>
          <p className="text-sm text-muted-foreground">
            Showcase your achievements, projects, and experiences
          </p>
        </div>
        
        <div className="bg-primary/5 rounded-lg p-6 text-center">
          <FileText className="h-10 w-10 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Resume Creator</h3>
          <p className="text-sm text-muted-foreground">
            Build professional resumes with customizable templates
          </p>
        </div>
      </motion.div>
    </div>
  )
}

const ToolsStep = ({ 
  tools, 
  onToolToggle 
}: { 
  tools: EnabledTools; 
  onToolToggle: (tool: keyof EnabledTools, value: boolean) => void;
}) => {
  return (
    <div className="space-y-8 py-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold mb-2">Choose Your Tools</h2>
        <p className="text-muted-foreground">
          Select which tools you'd like to have available in your navigation bar. You can always change these later in Settings.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-6 mt-6"
      >
        <ToolCard
          icon={<Book className="h-8 w-8 text-primary" />}
          name="College Application Manager"
          description="Manage applications, essays, deadlines, and track colleges"
          checked={tools.collegeApp}
          onChange={(checked) => onToolToggle('collegeApp', checked)}
          delay={0.2}
        />
        
        <ToolCard
          icon={<Briefcase className="h-8 w-8 text-primary" />}
          name="Portfolio"
          description="Showcase your projects, achievements, and skills"
          checked={tools.portfolio}
          onChange={(checked) => onToolToggle('portfolio', checked)}
          delay={0.3}
        />
        
        <ToolCard
          icon={<FileText className="h-8 w-8 text-primary" />}
          name="Resume"
          description="Build and manage professional resumes with templates"
          checked={tools.resume}
          onChange={(checked) => onToolToggle('resume', checked)}
          delay={0.4}
        />
      </motion.div>
    </div>
  )
}

const ToolCard = ({
  icon,
  name,
  description,
  checked,
  onChange,
  delay = 0
}: {
  icon: React.ReactNode;
  name: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  delay?: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={cn(
        "flex items-start justify-between p-6 rounded-lg border-2",
        checked ? "border-primary/50 bg-primary/5" : "border-border"
      )}
    >
      <div className="flex gap-4">
        <div className="mt-1">{icon}</div>
        <div>
          <Label className="text-lg font-medium">{name}</Label>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
      />
    </motion.div>
  )
}

const CompleteStep = () => {
  return (
    <div className="space-y-6 py-8 text-center">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="flex justify-center mb-8"
      >
        <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-4">
          <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-500" />
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-3xl font-bold mb-4">You're All Set!</h2>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          Your EduFolio experience is now personalized to your needs. Let's start your educational journey!
        </p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-8"
      >
        <div className="flex flex-col items-center bg-primary/5 p-4 rounded-lg">
          <Star className="h-6 w-6 text-primary mb-2" />
          <span className="text-sm font-medium">Personalized Dashboard</span>
        </div>
        
        <div className="flex flex-col items-center bg-primary/5 p-4 rounded-lg">
          <Coffee className="h-6 w-6 text-primary mb-2" />
          <span className="text-sm font-medium">Easy Navigation</span>
        </div>
        
        <div className="flex flex-col items-center bg-primary/5 p-4 rounded-lg">
          <Sparkles className="h-6 w-6 text-primary mb-2" />
          <span className="text-sm font-medium">Smart Organization</span>
        </div>
      </motion.div>
    </div>
  )
} 