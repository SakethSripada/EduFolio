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
import { createOrUpdateShareLink } from "@/lib/supabase/utils"

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

  const supabase = createClientComponentClient()
  const { user } = useAuth() // Use the Auth context to get the current user

  // Check for existing share link
  useEffect(() => {
    const checkExistingShareLink = async () => {
      if (!user) return

      const { data, error } = await supabase
        .from("shared_links")
        .select("*")
        .eq("user_id", user.id)
        .eq("content_type", "college_application")
        .maybeSingle()

      if (error) {
        console.error("Error checking for existing share link:", error)
        return
      }

      if (data) {
        setExistingShareLink(data)
        setShareId(data.share_id)

        const baseUrl = typeof window !== "undefined" ? `${window.location.protocol}//${window.location.host}` : ""
        setShareLink(`${baseUrl}/share/college-application/${data.share_id}`)

        setIsPublic(data.is_public)

        if (data.expires_at) {
          setExpiryOption("date")
          setExpiryDate(new Date(data.expires_at))
        } else {
          setExpiryOption("never")
          setExpiryDate(undefined)
        }
      } else {
        // Generate a new share ID if none exists
        const newShareId = Math.random().toString(36).substring(2, 10)
        setShareId(newShareId)

        const baseUrl = typeof window !== "undefined" ? `${window.location.protocol}//${window.location.host}` : ""
        setShareLink(`${baseUrl}/share/college-application/${newShareId}`)
      }
    }

    checkExistingShareLink()
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
      // Calculate expiry date if needed
      let expiresAt = null
      if (expiryOption === "date" && expiryDate) {
        expiresAt = expiryDate.toISOString()
      }

      // Extract the share ID from the link
      const shareId = shareLink.split("/").pop()

      const { success, error } = await createOrUpdateShareLink({
        userId: user.id,
        contentType: "college_application",
        contentId: null,
        isPublic: isPublic,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        existingShareId: existingShareLink?.share_id,
      })

      if (error) throw error

      toast({
        title: "Share link created",
        description: "Your college application can now be shared with others.",
      })
    } catch (error) {
      console.error("Error creating/updating share link:", error)
      toast({
        title: "Error with share link",
        description: "There was a problem with your share link.",
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
              <p className="mt-2 text-muted-foreground">Manage all aspects of your college application in one place.</p>
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
            <DialogHeader>
              <DialogTitle>Share Your College Application</DialogTitle>
              <DialogDescription>Control who can see your application and share it with others.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="font-medium">Application Visibility</h3>
                  <p className="text-sm text-muted-foreground">
                    {isPublic ? "Your application is visible to anyone with the link" : "Your application is private"}
                  </p>
                </div>
                <Switch checked={isPublic} onCheckedChange={toggleApplicationVisibility} />
              </div>

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
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !expiryDate && "text-muted-foreground",
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
            <DialogFooter>
              <Button onClick={handleCreateShareLink} disabled={isLoading}>
                {isLoading ? "Processing..." : existingShareLink ? "Update Share Link" : "Create Share Link"}
              </Button>
              <Button variant="outline" onClick={() => setIsSharingApplication(false)}>
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* AI Assistant */}
        <AIAssistant showOnLoad={false} />
      </div>
    </ProtectedRoute>
  )
}
