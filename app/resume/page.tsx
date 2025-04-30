"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  DropdownMenu,
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { PlusCircle, Download, Eye, MoreHorizontal, Pencil, Trash2, Check, X } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"

export default function ResumePage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [resumes, setResumes] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("editor")
  const [editingResumeId, setEditingResumeId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")
  const editInputRef = useRef<HTMLInputElement>(null)
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
      fetchResumes()
    }
  }, [user])

  // Focus input when editing title
  useEffect(() => {
    if (editingResumeId && editInputRef.current) {
      editInputRef.current.focus()
    }
  }, [editingResumeId])

  const fetchResumes = async () => {
    if (!user) return
    
    const { data, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })

    if (!error && data) {
      setResumes(data)
    }
  }

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
    } else {
      toast({
        title: "Error",
        description: "Failed to create a new resume",
        variant: "destructive"
      })
    }
  }

  // Start editing resume title
  const startEditingTitle = (resumeId: string, title: string) => {
    setEditingResumeId(resumeId)
    setEditingTitle(title)
  }

  // Save edited resume title
  const saveResumeTitle = async (resumeId: string) => {
    if (!editingTitle.trim()) {
      setEditingTitle("Untitled Resume")
    }
    
    const { error } = await supabase
      .from("resumes")
      .update({ title: editingTitle.trim() })
      .eq("id", resumeId)
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to update resume title",
        variant: "destructive"
      })
    } else {
      fetchResumes()
    }
    
    setEditingResumeId(null)
  }

  // Cancel editing resume title
  const cancelEditingTitle = () => {
    setEditingResumeId(null)
  }

  // Delete a resume
  const deleteResume = async (resumeId: string) => {
    const { error } = await supabase
      .from("resumes")
      .delete()
      .eq("id", resumeId)
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete resume",
        variant: "destructive"
      })
    } else {
      fetchResumes()
      toast({
        title: "Success",
        description: "Resume deleted successfully",
        variant: "default"
      })
    }
  }

  // Handle keydown event when editing title
  const handleKeyDown = (e: React.KeyboardEvent, resumeId: string) => {
    if (e.key === 'Enter') {
      saveResumeTitle(resumeId)
    } else if (e.key === 'Escape') {
      cancelEditingTitle()
    }
  }

  // Create resume with specific template
  const createResumeWithTemplate = async (template: string) => {
    if (!user) return

    const { data, error } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        title: `${template} Resume`,
        content: {},
        style: {
          fontFamily: "Inter",
          primaryColor: template === "Professional" ? "#4f46e5" : 
                       template === "Modern" ? "#8b5cf6" : 
                       "#10b981",
          fontSize: "medium",
          spacing: "comfortable"
        },
        template: template.toLowerCase()
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resume Builder</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your professional resumes
          </p>
        </div>
        <Button onClick={createNewResume} size="lg" className="gap-1">
          <PlusCircle className="h-4 w-4" />
          Create New Resume
        </Button>
      </div>

      <Tabs defaultValue="resumes" className="space-y-6">
        <div className="border-b">
          <div className="container mx-auto">
            <TabsList className="mx-auto justify-start -mb-px h-10">
              <TabsTrigger value="resumes" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">My Resumes</TabsTrigger>
              <TabsTrigger value="templates" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Templates</TabsTrigger>
            </TabsList>
          </div>
        </div>
        
        <TabsContent value="resumes" className="space-y-4">
          {resumes.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 bg-muted/20 rounded-lg border border-dashed">
              <div className="w-16 h-16 bg-muted flex items-center justify-center rounded-full mb-4">
                <PlusCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">No resumes yet</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                Create your first professional resume and easily customize it for different job applications.
              </p>
              <Button onClick={createNewResume} size="lg" className="gap-1">
                <PlusCircle className="h-4 w-4" />
                Create Your First Resume
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resumes.map((resume) => (
                <Card key={resume.id} className="overflow-hidden border group hover:border-primary/50 transition-all hover:shadow-md">
                  <CardHeader className="p-5 space-y-0 flex flex-row items-start justify-between">
                    {editingResumeId === resume.id ? (
                      <div className="flex items-center gap-2 flex-grow">
                        <Input 
                          ref={editInputRef}
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, resume.id)}
                          className="h-8"
                        />
                        <div className="flex items-center">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-green-600"
                            onClick={() => saveResumeTitle(resume.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-red-600"
                            onClick={cancelEditingTitle}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <CardTitle className="text-lg mb-1 flex items-center gap-2">
                            {resume.title}
                          </CardTitle>
                          <CardDescription>
                            Last updated: {new Date(resume.updated_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              className="cursor-pointer gap-2"
                              onClick={() => startEditingTitle(resume.id, resume.title)}
                            >
                              <Pencil className="h-4 w-4" /> Rename
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive cursor-pointer gap-2"
                              onClick={() => deleteResume(resume.id)}
                            >
                              <Trash2 className="h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    )}
                  </CardHeader>
                  <div className="px-5 pb-5">
                    <div className="h-40 bg-muted/20 border rounded-md flex items-center justify-center cursor-pointer"
                         onClick={() => router.push(`/resume/${resume.id}`)}>
                      <div className="w-full max-w-[160px] h-32 bg-white dark:bg-gray-800 rounded shadow-sm mx-auto">
                        {/* Preview thumbnail */}
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
                  </div>
                  <CardFooter className="bg-muted/10 py-3 px-5 flex justify-between">
                    <Button size="sm" variant="ghost" onClick={() => router.push(`/resume/${resume.id}`)} className="gap-1">
                      <Eye className="h-4 w-4" /> Edit
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1">
                      <Download className="h-4 w-4" /> Export
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="overflow-hidden border hover:border-primary/50 transition-all hover:shadow-md">
              <CardHeader className="p-5">
                <CardTitle className="text-lg">Professional</CardTitle>
                <CardDescription>A clean, traditional resume format</CardDescription>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="h-52 bg-muted/20 border rounded-md flex items-center justify-center">
                  <div className="w-full max-w-[180px] h-40 bg-white dark:bg-gray-800 rounded shadow-sm mx-auto p-3">
                    <div className="border-b border-indigo-500 pb-2 mb-2">
                      <div className="w-20 h-2.5 bg-indigo-500/80 mb-2 rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full h-1 bg-gray-400/50 rounded"></div>
                      <div className="w-full h-1 bg-gray-400/50 rounded"></div>
                      <div className="w-3/4 h-1 bg-gray-400/50 rounded"></div>
                    </div>
                    <div className="border-b border-indigo-500 pb-1 pt-3 mb-2">
                      <div className="w-20 h-2.5 bg-indigo-500/80 rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full h-1 bg-gray-400/50 rounded"></div>
                      <div className="w-full h-1 bg-gray-400/50 rounded"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/10 p-5 flex justify-center">
                <Button onClick={() => createResumeWithTemplate("Professional")} className="w-full">Use Template</Button>
              </CardFooter>
            </Card>
            
            <Card className="overflow-hidden border hover:border-primary/50 transition-all hover:shadow-md">
              <CardHeader className="p-5">
                <CardTitle className="text-lg">Modern</CardTitle>
                <CardDescription>A creative, contemporary design</CardDescription>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="h-52 bg-muted/20 border rounded-md flex items-center justify-center">
                  <div className="w-full max-w-[180px] h-40 bg-white dark:bg-gray-800 rounded shadow-sm mx-auto p-3 relative">
                    <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-purple-500/70"></div>
                    <div>
                      <div className="w-20 h-2.5 bg-purple-500/80 mb-1 rounded"></div>
                      <div className="w-16 h-1.5 bg-gray-500/70 mb-3 rounded"></div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="w-full flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500/70 mt-0.5"></div>
                        <div className="w-full h-1 bg-gray-400/50 rounded my-auto"></div>
                      </div>
                      <div className="w-full flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500/70 mt-0.5"></div>
                        <div className="w-full h-1 bg-gray-400/50 rounded my-auto"></div>
                      </div>
                      <div className="w-full flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500/70 mt-0.5"></div>
                        <div className="w-3/4 h-1 bg-gray-400/50 rounded my-auto"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/10 p-5 flex justify-center">
                <Button onClick={() => createResumeWithTemplate("Modern")} className="w-full">Use Template</Button>
              </CardFooter>
            </Card>
            
            <Card className="overflow-hidden border hover:border-primary/50 transition-all hover:shadow-md">
              <CardHeader className="p-5">
                <CardTitle className="text-lg">Academic</CardTitle>
                <CardDescription>Ideal for educational backgrounds</CardDescription>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="h-52 bg-muted/20 border rounded-md flex items-center justify-center">
                  <div className="w-full max-w-[180px] h-40 bg-white dark:bg-gray-800 rounded shadow-sm mx-auto p-3">
                    <div className="flex justify-between mb-2">
                      <div className="w-20 h-2.5 bg-emerald-600/70 rounded"></div>
                      <div className="w-10 h-2.5 bg-emerald-600/70 rounded"></div>
                    </div>
                    <div className="border-l-2 border-emerald-600/70 pl-2 mb-2">
                      <div className="w-full h-1 bg-gray-400/50 mb-1 rounded"></div>
                      <div className="w-full h-1 bg-gray-400/50 mb-1 rounded"></div>
                      <div className="w-3/4 h-1 bg-gray-400/50 rounded"></div>
                    </div>
                    <div className="border-l-2 border-emerald-600/70 pl-2 mt-3">
                      <div className="w-full h-1 bg-gray-400/50 mb-1 rounded"></div>
                      <div className="w-full h-1 bg-gray-400/50 mb-1 rounded"></div>
                      <div className="w-1/2 h-1 bg-gray-400/50 rounded"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/10 p-5 flex justify-center">
                <Button onClick={() => createResumeWithTemplate("Academic")} className="w-full">Use Template</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  )
} 