"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { PlusCircle, Download, Eye, Settings } from "lucide-react"

export default function ResumePage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [resumes, setResumes] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("editor")
  const supabase = createClientComponentClient()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // Fetch user's resumes
  useEffect(() => {
    if (user) {
      const fetchResumes = async () => {
        const { data, error } = await supabase
          .from("resumes")
          .select("*")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false })

        if (!error && data) {
          setResumes(data)
        }
      }

      fetchResumes()
    }
  }, [user, supabase])

  // Create a new resume
  const createNewResume = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        title: "New Resume",
        content: {},
        style: {
          fontFamily: "Inter",
          primaryColor: "#4f46e5",
          fontSize: "medium",
          spacing: "comfortable"
        },
        template: "standard"
      })
      .select()

    if (!error && data) {
      router.push(`/resume/${data[0].id}`)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="w-full h-screen flex items-center justify-center">
          <div className="animate-pulse text-2xl">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <main className="container py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resume Builder</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your professional resumes
          </p>
        </div>
        <Button onClick={createNewResume}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Resume
        </Button>
      </div>

      <Tabs defaultValue="resumes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="resumes">My Resumes</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        <TabsContent value="resumes" className="space-y-4">
          {resumes.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 bg-muted/50 rounded-lg">
              <h3 className="text-xl font-medium mb-2">No resumes yet</h3>
              <p className="text-muted-foreground mb-4 text-center max-w-md">
                Create your first professional resume and easily customize it for different job applications.
              </p>
              <Button onClick={createNewResume}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Your First Resume
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resumes.map((resume) => (
                <Card key={resume.id} className="overflow-hidden">
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg">{resume.title}</CardTitle>
                    <CardDescription>
                      Last updated: {new Date(resume.updated_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-40 bg-muted/30 border-y flex items-center justify-center">
                      <div className="w-full max-w-[160px] h-32 bg-white/80 dark:bg-gray-800/80 rounded shadow-sm mx-auto">
                        {/* Preview thumbnail would go here */}
                        <div className="p-2">
                          <div className="w-16 h-2 bg-muted mb-2 rounded"></div>
                          <div className="w-24 h-2 bg-muted mb-4 rounded"></div>
                          <div className="w-full h-1 bg-muted/50 mb-1 rounded"></div>
                          <div className="w-full h-1 bg-muted/50 mb-1 rounded"></div>
                          <div className="w-3/4 h-1 bg-muted/50 mb-3 rounded"></div>
                          <div className="w-16 h-2 bg-muted mb-2 rounded"></div>
                          <div className="w-full h-1 bg-muted/50 mb-1 rounded"></div>
                          <div className="w-5/6 h-1 bg-muted/50 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between p-4">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="ghost" onClick={() => router.push(`/resume/${resume.id}`)}>
                        <Eye className="h-4 w-4 mr-1" /> Edit
                      </Button>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-lg">Professional Template</CardTitle>
                <CardDescription>A clean, professional resume format</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-40 bg-muted/30 border-y flex items-center justify-center">
                  <div className="w-full max-w-[160px] h-32 bg-white/80 dark:bg-gray-800/80 rounded shadow-sm mx-auto">
                    <div className="p-2">
                      <div className="w-16 h-2 bg-blue-500/70 mb-2 rounded"></div>
                      <div className="w-24 h-2 bg-gray-500/70 mb-4 rounded"></div>
                      <div className="w-full h-1 bg-gray-400/50 mb-1 rounded"></div>
                      <div className="w-full h-1 bg-gray-400/50 mb-1 rounded"></div>
                      <div className="w-3/4 h-1 bg-gray-400/50 mb-3 rounded"></div>
                      <div className="w-16 h-2 bg-blue-500/70 mb-2 rounded"></div>
                      <div className="w-full h-1 bg-gray-400/50 mb-1 rounded"></div>
                      <div className="w-5/6 h-1 bg-gray-400/50 rounded"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center p-4">
                <Button onClick={createNewResume}>Use Template</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-lg">Modern Template</CardTitle>
                <CardDescription>A modern, creative resume design</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-40 bg-muted/30 border-y flex items-center justify-center">
                  <div className="w-full max-w-[160px] h-32 bg-white/80 dark:bg-gray-800/80 rounded shadow-sm mx-auto">
                    <div className="p-2">
                      <div className="w-10 h-10 rounded-full bg-purple-500/70 absolute top-2 right-2"></div>
                      <div className="w-16 h-2 bg-purple-500/70 mb-2 rounded"></div>
                      <div className="w-24 h-2 bg-gray-500/70 mb-4 rounded"></div>
                      <div className="w-full h-1 bg-gray-400/50 mb-1 rounded"></div>
                      <div className="w-full h-1 bg-gray-400/50 mb-1 rounded"></div>
                      <div className="w-3/4 h-1 bg-gray-400/50 mb-3 rounded"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center p-4">
                <Button onClick={createNewResume}>Use Template</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-lg">Academic Template</CardTitle>
                <CardDescription>Perfect for educational backgrounds</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-40 bg-muted/30 border-y flex items-center justify-center">
                  <div className="w-full max-w-[160px] h-32 bg-white/80 dark:bg-gray-800/80 rounded shadow-sm mx-auto">
                    <div className="p-2">
                      <div className="w-full flex justify-between mb-2">
                        <div className="w-20 h-2 bg-green-600/70 rounded"></div>
                        <div className="w-10 h-2 bg-green-600/70 rounded"></div>
                      </div>
                      <div className="w-24 h-2 bg-gray-500/70 mb-4 rounded"></div>
                      <div className="w-full h-1 bg-gray-400/50 mb-1 rounded"></div>
                      <div className="w-full h-1 bg-gray-400/50 mb-1 rounded"></div>
                      <div className="w-3/4 h-1 bg-gray-400/50 mb-3 rounded"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center p-4">
                <Button onClick={createNewResume}>Use Template</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  )
} 