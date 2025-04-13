import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, GraduationCap, FileText, Pencil, Bot, Brain, Zap, CheckCircle } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="py-20 md:py-32 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto text-center">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
            <Sparkles className="h-3 w-3 mr-1" /> AI-Powered
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Your Educational Journey, Beautifully Organized
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto text-muted-foreground">
            Manage your college applications, academics, extracurriculars, and essays all in one place. Powered by AI to
            help you succeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8" asChild>
              <Link href="/college-application">Explore Features</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-center">Key Features</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Everything you need to organize your educational journey and stand out in your college applications.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "AI-Powered Assistance",
                description:
                  "Get personalized recommendations, essay feedback, and application strategies from our advanced AI assistant.",
                icon: <Bot className="h-10 w-10 text-primary mb-4" />,
              },
              {
                title: "College List Builder",
                description:
                  "Research, organize, and track your college applications with customized profiles for each school.",
                icon: <GraduationCap className="h-10 w-10 text-primary mb-4" />,
              },
              {
                title: "Academic Tracking",
                description:
                  "Record and visualize your grades and test scores with automatic GPA calculation and analysis.",
                icon: <FileText className="h-10 w-10 text-primary mb-4" />,
              },
              {
                title: "Essay Workshop",
                description: "Craft and refine your application essays with AI assistance and feedback.",
                icon: <Pencil className="h-10 w-10 text-primary mb-4" />,
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="bg-card p-6 rounded-lg shadow-md border border-border/50 hover:border-primary/20 hover:shadow-lg transition-all"
              >
                <CardContent className="p-0 text-center">
                  <div className="flex justify-center">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2 text-primary">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary/5">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
              <Sparkles className="h-3 w-3 mr-1" /> AI-Powered
            </Badge>
            <h2 className="text-3xl font-bold mb-4">How AI Enhances Your Application</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our advanced AI assistant helps you at every step of your college application journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-lg shadow-md border border-border/50 flex flex-col items-center text-center">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Smart Essay Feedback</h3>
              <p className="text-muted-foreground">
                Get real-time suggestions to improve your essays, enhance your writing style, and make your personal
                statement stand out.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-md border border-border/50 flex flex-col items-center text-center">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Personalized College Matches</h3>
              <p className="text-muted-foreground">
                Receive tailored college recommendations based on your academic profile, interests, and career goals.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-md border border-border/50 flex flex-col items-center text-center">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Application Optimization</h3>
              <p className="text-muted-foreground">
                Get strategic advice on how to present your extracurriculars, highlight your strengths, and address
                weaknesses in your application.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Streamline Your College Application Process?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of students who are using EduFolio to organize their educational journey and stand out in
              their college applications.
            </p>
          </div>
          <div className="flex justify-center">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link href="/signup">Get Started Today</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
