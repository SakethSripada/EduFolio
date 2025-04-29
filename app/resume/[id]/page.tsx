"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Download, ArrowLeft, Save } from "lucide-react"
import ResumeEditor from "@/components/resume/ResumeEditor"
import ResumePreview from "@/components/resume/ResumePreview"

export default function ResumeEditorPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [resume, setResume] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [activeTab, setActiveTab] = useState("content")
  const supabase = createClientComponentClient()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // Fetch resume data
  useEffect(() => {
    if (user && params.id) {
      const fetchResume = async () => {
        setLoading(true)
        
        const { data, error } = await supabase
          .from("resumes")
          .select("*")
          .eq("id", params.id)
          .eq("user_id", user.id)
          .single()
        
        if (error) {
          console.error("Error fetching resume:", error)
          router.push("/resume")
          return
        }
        
        if (data) {
          setResume(data)
        } else {
          router.push("/resume")
        }
        
        setLoading(false)
      }

      fetchResume()
    }
  }, [user, params.id, supabase, router])

  // Auto-save when resume changes (debounced)
  useEffect(() => {
    if (!resume) return
    
    const saveTimer = setTimeout(async () => {
      await saveResume()
    }, 1000)
    
    return () => clearTimeout(saveTimer)
  }, [resume])

  const updateResume = async (field: string, value: any) => {
    if (!resume) return

    setResume({
      ...resume,
      [field]: value,
      updated_at: new Date().toISOString()
    })
    
    setSaveStatus("idle")
  }

  const saveResume = async () => {
    if (!resume) return

    setSaveStatus("saving")
    
    const { error } = await supabase
      .from("resumes")
      .update(resume)
      .eq("id", resume.id)
    
    if (error) {
      console.error("Error saving resume:", error)
      setSaveStatus("error")
    } else {
      setSaveStatus("saved")
      
      // Reset save status after 3 seconds
      setTimeout(() => {
        setSaveStatus("idle")
      }, 3000)
    }
  }

  if (loading || isLoading) {
    return (
      <div className="container py-10">
        <div className="w-full h-screen flex items-center justify-center">
          <div className="animate-pulse text-2xl">Loading...</div>
        </div>
      </div>
    )
  }

  if (!resume) {
    return (
      <div className="container py-10">
        <div className="w-full h-screen flex items-center justify-center">
          <div className="text-2xl">Resume not found</div>
        </div>
      </div>
    )
  }

  return (
    <main className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2"
            onClick={() => router.push("/resume")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <Input
            value={resume.title}
            onChange={(e) => updateResume("title", e.target.value)}
            className="text-xl font-bold h-10 w-72 border-none focus-visible:ring-transparent"
          />
        </div>
        <div className="flex gap-2 items-center">
          {saveStatus === "saving" && (
            <span className="text-xs text-muted-foreground">Saving...</span>
          )}
          {saveStatus === "saved" && (
            <span className="text-xs text-green-600 dark:text-green-400">Saved</span>
          )}
          {saveStatus === "error" && (
            <span className="text-xs text-red-600 dark:text-red-400">Error saving</span>
          )}
          <Button onClick={saveResume} variant="default">
            <Save className="h-4 w-4 mr-1" /> Save
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-1" /> Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4 lg:col-span-3 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="style">Style</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="content" className="space-y-4 pt-4">
              <ResumeEditor resume={resume} onUpdate={updateResume} />
            </TabsContent>
            
            <TabsContent value="style" className="space-y-4 pt-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Resume Style</h3>
                <p className="text-muted-foreground text-center py-4">
                  Style customization options will be implemented here
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4 pt-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Settings</h3>
                <p className="text-muted-foreground text-center py-4">
                  Resume settings will be implemented here
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="md:col-span-8 lg:col-span-9">
          <div className="bg-white dark:bg-gray-950 border rounded-md shadow-sm min-h-[1056px] w-full max-w-[816px] mx-auto p-10">
            <ResumePreview resume={resume} />
          </div>
        </div>
      </div>
    </main>
  )
} 