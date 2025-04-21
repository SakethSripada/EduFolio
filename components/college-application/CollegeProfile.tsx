"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ArrowLeft,
  PlusCircle,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Share2,
  Copy,
  Check,
  Calendar,
} from "lucide-react"
import AIAssistant from "@/components/ai/AIAssistant"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from "@clerk/nextjs"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { createOrUpdateShareLink, generateShareUrl } from "@/lib/share-utils"
import { format } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import SimpleEssayEditor from "@/components/essay/SimpleEssayEditor"

type CollegeProfileProps = {
  collegeId: string
  collegeName: string
  onBack: () => void
  generalAcademics: any[]
  generalExtracurriculars: any[]
  generalAwards: any[]
  generalEssays: any[]
}

export default function CollegeProfile({
  collegeId,
  collegeName,
  onBack,
  generalAcademics,
  generalExtracurriculars,
  generalAwards,
  generalEssays,
}: CollegeProfileProps) {
  const [activeTab, setActiveTab] = useState("academics")
  const [academics, setAcademics] = useState<any[]>([])
  const [extracurriculars, setExtracurriculars] = useState<any[]>([])
  const [awards, setAwards] = useState<any[]>([])
  const [essays, setEssays] = useState<any[]>([])
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [expandedActivity, setExpandedActivity] = useState<number | null>(null)
  const [isAddingEssay, setIsAddingEssay] = useState(false)
  const [editingEssay, setEditingEssay] = useState<number | null>(null)
  const [newEssay, setNewEssay] = useState({
    prompt: "",
    content: "",
  })

  // Improve the sharing functionality
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [shareLink, setShareLink] = useState("")
  const [copied, setCopied] = useState(false)
  const [isPublic, setIsPublic] = useState(false)
  const [isLoadingShare, setIsLoadingShare] = useState(false)
  const [existingShareLink, setExistingShareLink] = useState<any>(null)
  const [expiryOption, setExpiryOption] = useState("never")
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined)
  const { toast } = useToast()
  const { user } = useUser()
  const supabase = createClientComponentClient()

  // Add a counter for generating unique IDs
  const [idCounter, setIdCounter] = useState(0)
  
  // Function to generate unique IDs
  const generateUniqueId = () => {
    const uniqueId = `${Date.now()}-${idCounter}`;
    setIdCounter(prev => prev + 1);
    return uniqueId;
  };

  // Add this to the component
  useEffect(() => {
    // Check for existing share link and generate share URL
    const checkExistingShareLink = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from("shared_links")
          .select("*")
          .eq("user_id", user.id)
          .eq("content_type", "college_profile")
          .eq("content_id", collegeId)
          .maybeSingle()

        if (error) throw error

        if (data) {
          setExistingShareLink(data)
          setShareLink(generateShareUrl("college_profile", data.share_id, collegeId))
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
          const shareId = Math.random().toString(36).substring(2, 10)
          setShareLink(generateShareUrl("college_profile", shareId, collegeId))
        }
      } catch (error) {
        console.error("Error checking for existing share link:", error)
      }
    }

    checkExistingShareLink()
  }, [user, collegeId, supabase])

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Initialize college-specific data with general data on first load
  useEffect(() => {
    // Check if we already have data for this college in localStorage
    const storedData = localStorage.getItem(`college_${collegeId}`)

    if (storedData) {
      const parsedData = JSON.parse(storedData)
      setAcademics(parsedData.academics || [])
      setExtracurriculars(parsedData.extracurriculars || [])
      setAwards(parsedData.awards || [])
      setEssays(parsedData.essays || [])
    } else {
      // Use general data as starting point
      setAcademics([...generalAcademics])
      setExtracurriculars([...generalExtracurriculars])
      setAwards([...generalAwards])
      setEssays([...generalEssays])

      // Save to localStorage
      saveToLocalStorage()
    }
  }, [collegeId, generalAcademics, generalExtracurriculars, generalAwards, generalEssays])

  // Save data to localStorage whenever it changes
  const saveToLocalStorage = () => {
    const dataToSave = {
      academics,
      extracurriculars,
      awards,
      essays,
    }

    localStorage.setItem(`college_${collegeId}`, JSON.stringify(dataToSave))
  }

  // Save data whenever it changes
  useEffect(() => {
    saveToLocalStorage()
  }, [academics, extracurriculars, awards, essays])

  const toggleExpand = (index: number) => {
    setExpandedActivity(expandedActivity === index ? null : index)
  }

  const addEssay = () => {
    if (newEssay.prompt) {
      setEssays([
        ...essays,
        {
          id: generateUniqueId(),
          prompt: newEssay.prompt,
          content: newEssay.content,
          wordCount: newEssay.content.split(/\s+/).filter(Boolean).length,
          lastEdited: new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          }),
        },
      ])
      setNewEssay({
        prompt: "",
        content: "",
      })
      setIsAddingEssay(false)
    }
  }

  const updateEssayContent = (index: number, content: string) => {
    const newEssays = [...essays]
    newEssays[index].content = content
    newEssays[index].wordCount = content.split(/\s+/).filter(Boolean).length
    newEssays[index].lastEdited = new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    setEssays(newEssays)
  }

  const deleteEssay = (index: number) => {
    const newEssays = [...essays]
    newEssays.splice(index, 1)
    setEssays(newEssays)
  }

  const handleShareProfile = async () => {
    if (!user) return

    setIsLoadingShare(true)
    try {
      // Calculate expiry date if needed
      let expiresAt = null
      if (expiryOption === "date" && expiryDate) {
        expiresAt = expiryDate
      }

      // Extract the share ID from the link
      const shareId = shareLink.split("/").pop()

      const result = await createOrUpdateShareLink({
        userId: user.id,
        contentType: "college_profile",
        contentId: collegeId,
        isPublic,
        expiresAt,
        existingShareId: existingShareLink?.share_id,
      })

      if (!result.success) throw new Error("Failed to create share link")

      toast({
        title: existingShareLink ? "Share link updated" : "Share link created",
        description: "Your college profile can now be shared with others.",
      })

      // If this is a new share link, update the state
      if (!existingShareLink) {
        setExistingShareLink({
          share_id: result.shareId,
          content_id: collegeId,
          content_type: "college_profile",
          is_public: isPublic,
          expires_at: expiresAt ? expiresAt.toISOString() : null,
        })
      }
    } catch (error) {
      console.error("Error creating share link:", error)
      toast({
        title: "Error creating share link",
        description: "There was a problem creating your share link.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingShare(false)
    }
  }

  // Add a simple function to open the AI Assistant without specific data
  const openAIAssistant = () => {
    setShowAIAssistant(true);
  }

  return (
    <div className="space-y-6">
      {/* Add a share button to the top of the component */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to College List
        </Button>
        <h2 className="text-2xl font-bold mt-2 sm:mt-0">{collegeName} Profile</h2>
        <div className="ml-auto mt-2 sm:mt-0">
          <Button variant="outline" className="flex items-center gap-2" onClick={() => setShareDialogOpen(true)}>
            <Share2 className="h-4 w-4" /> Share Profile
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>College-Specific Application Materials</CardTitle>
          <CardDescription>Customize your application materials specifically for {collegeName}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="academics" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 overflow-x-auto flex w-full">
              <TabsTrigger value="academics">Academics</TabsTrigger>
              <TabsTrigger value="extracurriculars">Extracurriculars</TabsTrigger>
              <TabsTrigger value="awards">Awards</TabsTrigger>
              <TabsTrigger value="essays">Essays</TabsTrigger>
            </TabsList>

            <TabsContent value="academics">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Academic Profile for {collegeName}</h3>
                  <Button variant="outline" className="gap-1" onClick={() => openAIAssistant()}>
                    <Sparkles className="h-4 w-4" /> AI Recommendations
                  </Button>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-2">Academic Strengths to Highlight</h4>
                  <Textarea
                    placeholder={`Add notes about which academic achievements to emphasize for ${collegeName}...`}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course Name</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Include?</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {academics.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                            No courses added yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        academics.map((course, index) => (
                          <TableRow key={index}>
                            <TableCell>{course.name}</TableCell>
                            <TableCell>{course.grade}</TableCell>
                            <TableCell>
                              {course.level === "AP/IB" ? (
                                <Badge className="bg-blue-500">AP/IB</Badge>
                              ) : course.level === "Honors" ? (
                                <Badge className="bg-purple-500">Honors</Badge>
                              ) : course.level === "College" ? (
                                <Badge className="bg-green-500">College</Badge>
                              ) : (
                                <Badge variant="outline">Regular</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Checkbox defaultChecked />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="extracurriculars">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Extracurriculars for {collegeName}</h3>
                  <Button variant="outline" className="gap-1" onClick={() => openAIAssistant()}>
                    <Sparkles className="h-4 w-4" /> AI Recommendations
                  </Button>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-2">Activities to Emphasize</h4>
                  <Textarea
                    placeholder={`Add notes about which extracurriculars to emphasize for ${collegeName}...`}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-4">
                  {extracurriculars.length === 0 ? (
                    <div className="text-center text-muted-foreground py-6 border rounded-md">
                      No activities added yet
                    </div>
                  ) : (
                    extracurriculars.map((activity, index) => (
                      <Card key={index} className="overflow-hidden">
                        <div
                          className="p-4 flex justify-between items-center cursor-pointer hover:bg-muted/50"
                          onClick={() => toggleExpand(index)}
                        >
                          <div className="flex items-center gap-4">
                            <Checkbox defaultChecked />
                            <div>
                              <h3 className="font-medium">{activity.organization}</h3>
                              <p className="text-sm text-muted-foreground">{activity.position}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon">
                            {expandedActivity === index ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        {expandedActivity === index && (
                          <div className="p-4 border-t">
                            <div className="mb-4">
                              <Label className="mb-2 block">Custom Description for {collegeName}</Label>
                              <Textarea
                                defaultValue={activity.description}
                                placeholder={`Customize this activity description for ${collegeName}...`}
                                className="min-h-[100px]"
                              />
                            </div>
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                              <div>
                                <dt className="text-sm font-medium text-muted-foreground">Activity Type</dt>
                                <dd>{activity.type}</dd>
                              </div>
                              <div>
                                <dt className="text-sm font-medium text-muted-foreground">Grade Levels</dt>
                                <dd>{activity.grades}</dd>
                              </div>
                              <div>
                                <dt className="text-sm font-medium text-muted-foreground">Timing</dt>
                                <dd>{activity.timing}</dd>
                              </div>
                              <div>
                                <dt className="text-sm font-medium text-muted-foreground">Hours/Week</dt>
                                <dd>{activity.hoursPerWeek}</dd>
                              </div>
                            </dl>
                          </div>
                        )}
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="awards">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Awards for {collegeName}</h3>
                  <Button variant="outline" className="gap-1" onClick={() => openAIAssistant()}>
                    <Sparkles className="h-4 w-4" /> AI Recommendations
                  </Button>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-2">Awards to Emphasize</h4>
                  <Textarea
                    placeholder={`Add notes about which awards to emphasize for ${collegeName}...`}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Include</TableHead>
                        <TableHead>Honor Title</TableHead>
                        <TableHead>Grade Level</TableHead>
                        <TableHead>Level of Recognition</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {awards.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                            No awards added yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        awards.map((award, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Checkbox defaultChecked />
                            </TableCell>
                            <TableCell>{award.title}</TableCell>
                            <TableCell>{award.gradeLevel}</TableCell>
                            <TableCell>{award.level}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="essays">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">{collegeName} Essays</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" className="gap-1" onClick={() => openAIAssistant()}>
                      <Sparkles className="h-4 w-4" /> AI Essay Help
                    </Button>
                    <Button className="gap-1" onClick={() => setIsAddingEssay(true)}>
                      <PlusCircle className="h-4 w-4" /> Add Essay
                    </Button>
                  </div>
                </div>

                {essays.length === 0 ? (
                  <div className="text-center text-muted-foreground py-12 border rounded-md">
                    No essays added yet for {collegeName}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {essays.map((essay, index) => (
                      <Card key={index} className="overflow-hidden">
                        <CardHeader>
                          <CardTitle>{essay.prompt}</CardTitle>
                          <CardDescription>
                            Word Count: {essay.wordCount} • Last Edited: {essay.lastEdited}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {editingEssay === index ? (
                            <SimpleEssayEditor
                              content={essay.content}
                              onChange={(content) => updateEssayContent(index, content)}
                              onSave={() => setEditingEssay(null)}
                              wordCount={essay.wordCount}
                              targetWordCount={essay.targetWordCount}
                            />
                          ) : (
                            <div className="p-4 bg-muted/50 rounded-md font-serif text-foreground">
                              {essay.content || "Start writing your essay..."}
                            </div>
                          )}
                        </CardContent>
                        <div className="flex flex-wrap justify-end space-x-2 p-4 bg-muted/20">
                          {editingEssay === index ? (
                            <Button variant="default" onClick={() => setEditingEssay(null)}>
                              Save
                            </Button>
                          ) : (
                            <>
                              <Button
                                variant="outline"
                                className="mb-2 sm:mb-0"
                                onClick={() => openAIAssistant()}
                              >
                                <Sparkles className="h-4 w-4 mr-1" /> AI Feedback
                              </Button>
                              <Button variant="outline" className="mb-2 sm:mb-0" onClick={() => setEditingEssay(index)}>
                                <Edit className="h-4 w-4 mr-1" /> Edit
                              </Button>
                              <Button variant="outline" onClick={() => deleteEssay(index)}>
                                <Trash2 className="h-4 w-4 mr-1" /> Delete
                              </Button>
                            </>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Add Essay Dialog */}
      <Dialog open={isAddingEssay} onOpenChange={setIsAddingEssay}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Essay for {collegeName}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="prompt">Essay Prompt</Label>
              <Input
                id="prompt"
                value={newEssay.prompt}
                onChange={(e) => setNewEssay({ ...newEssay, prompt: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Initial Content (Optional)</Label>
              <Textarea
                id="content"
                rows={5}
                value={newEssay.content}
                onChange={(e) => setNewEssay({ ...newEssay, content: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={addEssay}>Add Essay</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Assistant */}
      {showAIAssistant && (
        <AIAssistant
          showOnLoad={true}
          initialContext={{
            type: "college",
            title: collegeName
          }}
          onClose={() => setShowAIAssistant(false)}
        />
      )}

      {/* Add the share dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Share {collegeName} Profile</DialogTitle>
            <DialogDescription>Share your customized profile for {collegeName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="font-medium">Profile Visibility</h3>
                <p className="text-sm text-muted-foreground">
                  {isPublic ? "Your profile is visible to anyone with the link" : "Your profile is private"}
                </p>
              </div>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
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
                  ? "Anyone with this link can view your customized profile for " + collegeName
                  : "Enable public visibility to share your profile"}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleShareProfile} disabled={isLoadingShare}>
              {isLoadingShare ? "Processing..." : existingShareLink ? "Update Share Link" : "Create Share Link"}
            </Button>
            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
