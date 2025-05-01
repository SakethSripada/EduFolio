"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Share2, Copy, Check, Calendar } from "lucide-react"
import AcademicsTab from "@/components/college-application/AcademicsTab"
import ExtracurricularsTab from "@/components/college-application/ExtracurricularsTab"
import AwardsTab from "@/components/college-application/AwardsTab"
import EssaysTab from "@/components/college-application/EssaysTab"
import CollegeListTab from "@/components/college-application/CollegeListTab"
import TodoList from "@/components/todo/TodoList"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import AIAssistant from "@/components/ai/AIAssistant"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/AuthProvider"
import { createOrUpdateShareLink, generateShareUrl } from "@/lib/supabase/utils"
import { Separator } from "@/components/ui/separator"

export default function CollegeApplication() {
  const [isSharingApplication, setIsSharingApplication] = useState(false)
  const [isPublic, setIsPublic] = useState(false)
  const [shareLink, setShareLink] = useState("")
  const [shareId, setShareId] = useState("")
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState("academics")
  const [isLoading, setIsLoading] = useState(false)
  const [existingShareLink, setExistingShareLink] = useState<any>(null)
  const [expiryOption, setExpiryOption] = useState("never")
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined)
  // State for the section visibility settings
  const [shareSettings, setShareSettings] = useState({
    showAcademics: true,
    showExtracurriculars: true,
    showAwards: true,
    showEssays: true,
    showColleges: true,
  })

  const supabase = createClientComponentClient()
  const { user } = useAuth() // Get the current authenticated user

  // On mount, check if a share link already exists and if not, immediately create one.
  useEffect(() => {
    const checkOrCreateShareLink = async () => {
      if (!user) return

      const baseUrl =
        typeof window !== "undefined" ? `${window.location.protocol}//${window.location.host}` : ""

      // Query for existing share links without using maybeSingle to handle multiple records
      const { data: existingRecords, error } = await supabase
        .from("shared_links")
        .select("*")
        .eq("user_id", user.id)
        .eq("content_type", "college_application")

      if (error) {
        console.error("Error checking share link:", error)
        return
      }

      if (existingRecords && existingRecords.length > 0) {
        // Share link record exists – handle potential duplicates
        
        // If there are multiple records, keep only the first one
        if (existingRecords.length > 1) {
          
          // Get the first record's ID to keep
          const firstRecordId = existingRecords[0].id
          
          // Get all other record IDs to delete
          const idsToDelete = existingRecords.slice(1).map(record => record.id)
          
          // Delete duplicate records
          const { error: deleteError } = await supabase
            .from("shared_links")
            .delete()
            .in("id", idsToDelete)
            
          if (deleteError) {
            console.error("Error deleting duplicate share links:", deleteError)
          }
        }
        
        // Use the first record
        const data = existingRecords[0]
        
        // Load its data
        setExistingShareLink(data)
        setShareId(data.share_id)
        setShareLink(`${baseUrl}/share/college-application/${data.share_id}`)
        setIsPublic(data.is_public)
        if (data.expires_at) {
          setExpiryOption("date")
          setExpiryDate(new Date(data.expires_at))
        } else {
          setExpiryOption("never")
          setExpiryDate(undefined)
        }
        if (data.settings) {
          setShareSettings({
            showAcademics: data.settings.showAcademics ?? true,
            showExtracurriculars: data.settings.showExtracurriculars ?? true,
            showAwards: data.settings.showAwards ?? true,
            showEssays: data.settings.showEssays ?? true,
            showColleges: data.settings.showColleges ?? true,
          })
        }
      } else {
        // No share link exists: create one with default settings.
        const newShareId = Math.random().toString(36).substring(2, 10)
        const defaultSettings = {
          showAcademics: true,
          showExtracurriculars: true,
          showAwards: true,
          showEssays: true,
          showColleges: true,
        }
        
        // Simple insert operation
        const { data: insertedData, error: insertError } = await supabase
          .from("shared_links")
          .insert({
            user_id: user.id,
            share_id: newShareId,
            content_type: "college_application",
            content_id: null,
            is_public: false, // default to private until updated
            expires_at: null,
            settings: defaultSettings,
          })
          .select("*")
          .single()

        if (insertError) {
          console.error("Error creating share link:", insertError)
          return
        }

        if (insertedData) {
          setExistingShareLink(insertedData)
          setShareId(insertedData.share_id)
          setShareLink(`${baseUrl}/share/college-application/${insertedData.share_id}`)
          setIsPublic(insertedData.is_public)
          setShareSettings(defaultSettings)
        }
      }
    }

    checkOrCreateShareLink()
  }, [supabase, user])

  const handleCreateShareLink = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a share link.",
        variant: "destructive",
      })
      return
    }
    
    setIsLoading(true)
    try {
      let expiresAt: Date | null = null
      if (expiryOption === "date" && expiryDate) {
        expiresAt = expiryDate
      }
      // Do not change the share_id if a record exists. Use it directly.
      const currentShareId = existingShareLink?.share_id || shareId
      
      const { success, error } = await createOrUpdateShareLink({
        userId: user.id,
        contentType: "college_application",
        contentId: null,
        isPublic,
        expiresAt,
        existingShareId: currentShareId,
        settings: shareSettings,
      })
      
      if (error) throw error

      toast({
        title: "Share link saved",
        description: "Your college application share settings have been updated.",
      })
    } catch (error) {
      console.error("Error creating/updating share link:", error)
      toast({
        title: "Error with share link",
        description: "There was a problem updating your share settings.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({
      title: "Link copied",
      description: "Share link has been copied to clipboard.",
    })
  }

  const toggleApplicationVisibility = () => {
    setIsPublic(!isPublic)
  }

  return (
    <ProtectedRoute>
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <Toaster />
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">College Application</h1>
              <p className="mt-2 text-muted-foreground">
                Manage all aspects of your college application in one place.
              </p>
            </div>
            <Button variant="outline" className="flex items-center gap-2" onClick={() => setIsSharingApplication(true)}>
              <Share2 className="h-4 w-4" /> Share Application
            </Button>
          </div>

          <div className="bg-card shadow rounded-lg overflow-hidden">
            <Tabs defaultValue="academics" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="px-4 sm:px-6 border-b">
                <TabsList className="flex w-full overflow-x-auto py-2 gap-2 justify-start sm:justify-center">
                  <TabsTrigger value="colleges" className="px-4 py-2 rounded-md whitespace-nowrap">
                    College List
                  </TabsTrigger>
                  <TabsTrigger value="academics" className="px-4 py-2 rounded-md whitespace-nowrap">
                    Academics
                  </TabsTrigger>
                  <TabsTrigger value="extracurriculars" className="px-4 py-2 rounded-md whitespace-nowrap">
                    Extracurriculars
                  </TabsTrigger>
                  <TabsTrigger value="awards" className="px-4 py-2 rounded-md whitespace-nowrap">
                    Awards
                  </TabsTrigger>
                  <TabsTrigger value="essays" className="px-4 py-2 rounded-md whitespace-nowrap">
                    Essays
                  </TabsTrigger>
                  <TabsTrigger value="todo" className="px-4 py-2 rounded-md whitespace-nowrap">
                    To-Do List
                  </TabsTrigger>
                </TabsList>
              </div>
              <div className="p-4 sm:p-6">
                <TabsContent value="colleges">
                  <CollegeListTab />
                </TabsContent>
                <TabsContent value="academics">
                  <AcademicsTab />
                </TabsContent>
                <TabsContent value="extracurriculars">
                  <ExtracurricularsTab />
                </TabsContent>
                <TabsContent value="awards">
                  <AwardsTab />
                </TabsContent>
                <TabsContent value="essays">
                  <EssaysTab />
                </TabsContent>
                <TabsContent value="todo">
                  <TodoList />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>

        {/* Share Application Dialog */}
        <Dialog open={isSharingApplication} onOpenChange={setIsSharingApplication}>
          <DialogContent className="w-full max-w-[90vw] sm:max-w-[500px]">
            <DialogHeader className="pt-6">
              <DialogTitle>Share Your College Application</DialogTitle>
              <DialogDescription>
                Control who can see your application and select which sections are shared.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4 overflow-y-auto max-h-[60vh] pr-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="font-medium">Application Visibility</h3>
                  <p className="text-sm text-muted-foreground">
                    {isPublic ? "Your application is visible to anyone with the link" : "Your application is private"}
                  </p>
                </div>
                <Switch checked={isPublic} onCheckedChange={toggleApplicationVisibility} />
              </div>

              <Separator className="my-4" />
              
              <div className="space-y-4">
                <h3 className="font-medium">Section Visibility</h3>
                <p className="text-sm text-muted-foreground">
                  Control which sections of your application are visible to others
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showAcademics" className="cursor-pointer">Academics</Label>
                    <Switch 
                      id="showAcademics" 
                      checked={shareSettings.showAcademics} 
                      onCheckedChange={(checked) => setShareSettings({...shareSettings, showAcademics: checked})} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showExtracurriculars" className="cursor-pointer">Extracurriculars</Label>
                    <Switch 
                      id="showExtracurriculars" 
                      checked={shareSettings.showExtracurriculars} 
                      onCheckedChange={(checked) => setShareSettings({...shareSettings, showExtracurriculars: checked})} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showAwards" className="cursor-pointer">Awards</Label>
                    <Switch 
                      id="showAwards" 
                      checked={shareSettings.showAwards} 
                      onCheckedChange={(checked) => setShareSettings({...shareSettings, showAwards: checked})} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showEssays" className="cursor-pointer">Essays</Label>
                    <Switch 
                      id="showEssays" 
                      checked={shareSettings.showEssays} 
                      onCheckedChange={(checked) => setShareSettings({...shareSettings, showEssays: checked})} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showColleges" className="cursor-pointer">College List</Label>
                    <Switch 
                      id="showColleges" 
                      checked={shareSettings.showColleges} 
                      onCheckedChange={(checked) => setShareSettings({...shareSettings, showColleges: checked})} 
                    />
                  </div>
                </div>
              </div>
              
              <Separator className="my-4" />

              <div className="space-y-3">
                <Label>Link Expiration</Label>
                <RadioGroup value={expiryOption} onValueChange={setExpiryOption}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="never" id="never" />
                    <Label htmlFor="never">Never expires</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="date" id="date" />
                    <Label htmlFor="date">Expires on specific date</Label>
                  </div>
                </RadioGroup>
                {expiryOption === "date" && (
                  <div className="pt-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !expiryDate && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {expiryDate ? format(expiryDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={expiryDate}
                          onSelect={setExpiryDate}
                          initialFocus
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>

              {/* The share link input is auto‑populated; no extra "Generate" button is shown */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input value={shareLink} readOnly className="flex-grow" />
                  <Button variant="outline" size="icon" onClick={copyShareLink}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {isPublic
                    ? "Anyone with this link can view your application"
                    : "Enable public visibility to share your application"}
                </p>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t">
              <p className="text-xs text-amber-500 mr-4 hidden sm:block">
                Remember to click "Update Share Link" to save visibility settings
              </p>
              <Button onClick={handleCreateShareLink} disabled={isLoading}>
                {isLoading ? "Processing..." : "Update Share Link"}
              </Button>
              <Button variant="outline" onClick={() => setIsSharingApplication(false)}>
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AIAssistant showOnLoad={false} />
      </div>
    </ProtectedRoute>
  )
}
