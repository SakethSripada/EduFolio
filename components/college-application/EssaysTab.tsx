"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { PlusCircle, Edit, Trash2, Save, Sparkles, Loader2, History, Info } from "lucide-react"
import AIAssistant from "@/components/ai/AIAssistant"
import { useAuth } from "@/components/auth/AuthProvider"
import { supabase, handleSupabaseError } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { calculateWordCount, calculateCharacterCount, validateRequired } from "@/lib/validation"
import { debounce, hasSignificantChanges } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import SimpleEssayEditor from "@/components/essay/SimpleEssayEditor"
import DOMPurify from "dompurify"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type Essay = {
  id: string
  title: string
  prompt: string
  content: string
  word_count: number
  character_count: number
  target_word_count: number | null
  last_edited: string
  college_id: string | null
  is_common_app: boolean | null
  status: string | null
}

type EssayVersion = {
  id: string
  essay_id: string
  content: string
  word_count: number
  character_count: number
  version_name: string | null
  created_at: string
}

export default function EssaysTab() {
  const [essays, setEssays] = useState<Essay[]>([])
  const [essayVersions, setEssayVersions] = useState<Record<string, EssayVersion[]>>({})
  const [newEssay, setNewEssay] = useState({
    title: "",
    prompt: "",
    content: "",
    target_word_count: "",
    is_common_app: false,
    status: "Draft",
  })
  const [editingEssay, setEditingEssay] = useState<number | null>(null)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [selectedEssay, setSelectedEssay] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showVersionHistory, setShowVersionHistory] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [idCounter, setIdCounter] = useState(0)
  const [aiAction, setAiAction] = useState<"feedback" | "grammar" | "rephrase" | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  // Add state for confirmation dialog
  const [confirmDeleteEssay, setConfirmDeleteEssay] = useState<string | null>(null)

  // Add a new state variable to store the essay content
  const [essayContent, setEssayContent] = useState<string>("")

  // Add a state to track the last saved content for each essay
  const [lastSavedContent, setLastSavedContent] = useState<Record<string, string>>({})
  // Add a state to track the last version timestamp for each essay
  const [lastVersionTimestamp, setLastVersionTimestamp] = useState<Record<string, number>>({})
  // Add a minimum time between versions in milliseconds (default: 15 minutes)
  const MIN_TIME_BETWEEN_VERSIONS = 15 * 60 * 1000; 
  // Add a debounce delay for saving content (default: 2 seconds)
  const SAVE_DEBOUNCE_DELAY = 2000;

  // Add a maximum number of versions to keep per essay
  const MAX_VERSIONS_PER_ESSAY = 10;

  // Function to generate unique IDs
  const generateUniqueId = () => {
    const uniqueId = `${Date.now()}-${idCounter}`;
    setIdCounter(prev => prev + 1);
    return uniqueId;
  };

  const performDatabaseOperation = async (
    operation: () => Promise<any>,
    setIsLoading: (loading: boolean) => void,
    setData: (data: any) => void,
    handleError: (error: any) => void,
  ) => {
    setIsLoading(true)
    try {
      const result = await operation()
      setData(result)
    } catch (error) {
      console.error("Database operation failed:", error)
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      performDatabaseOperation(
        async () => {
          const { data, error } = await supabase
            .from("essays")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })

          if (error) throw error

          // Fetch versions for each essay if essays exist
          const versionsMap: Record<string, EssayVersion[]> = {}
          if (data && data.length > 0) {
            const versionsPromises = data.map((essay) =>
              supabase
                .from("essay_versions")
                .select("*")
                .eq("essay_id", essay.id)
                .order("created_at", { ascending: false }),
            )

            const versionsResults = await Promise.all(versionsPromises)

            versionsResults.forEach((result, index) => {
              if (!result.error && result.data) {
                versionsMap[data[index].id] = result.data
              }
            })
          }

          return { essays: data || [], versions: versionsMap }
        },
        setIsLoading,
        (data) => {
          setEssays(data.essays)
          setEssayVersions(data.versions)
        },
        (error) => {
          toast({
            title: "Error loading essays",
            description: handleSupabaseError(error, "There was a problem loading your essays."),
            variant: "destructive",
          })
        },
      )
    }

    fetchData()
  }, [user, toast])

  // Validate essay form
  const validateEssayForm = (): boolean => {
    const errors: Record<string, string> = {}

    const titleError = validateRequired(newEssay.title, "Essay title")
    if (titleError) errors.title = titleError

    const promptError = validateRequired(newEssay.prompt, "Essay prompt")
    if (promptError) errors.prompt = promptError

    if (newEssay.target_word_count && isNaN(Number(newEssay.target_word_count))) {
      errors.target_word_count = "Target word count must be a valid number"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const addEssay = async () => {
    if (!user || !validateEssayForm()) return

    setIsLoading(true)

    try {
      const wordCount = calculateWordCount(newEssay.content)
      const charCount = calculateCharacterCount(newEssay.content)

      const { data, error } = await supabase
        .from("essays")
        .insert([
          {
            user_id: user.id,
            title: newEssay.title,
            prompt: newEssay.prompt,
            content: newEssay.content,
            word_count: wordCount,
            character_count: charCount,
            target_word_count: newEssay.target_word_count ? Number(newEssay.target_word_count) : null,
            last_edited: new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            }),
            is_common_app: newEssay.is_common_app,
            status: newEssay.status,
          },
        ])
        .select()

      if (error) throw error

      if (data) {
        setEssays([data[0], ...essays])

        // Create initial version if there's content
        if (newEssay.content) {
          const { error: versionError } = await supabase.from("essay_versions").insert({
            essay_id: data[0].id,
            content: newEssay.content,
            word_count: wordCount,
            character_count: charCount,
            version_name: "Initial Draft",
          })

          if (versionError) {
            console.error("Error creating essay version:", versionError)
          } else {
            setEssayVersions({
              ...essayVersions,
              [data[0].id]: [
                {
                  id: generateUniqueId(), // Use the unique ID generator instead of Date.now()
                  essay_id: data[0].id,
                  content: newEssay.content,
                  word_count: wordCount,
                  character_count: charCount,
                  version_name: "Initial Draft",
                  created_at: new Date().toISOString(),
                },
              ],
            })
          }
        }

        setNewEssay({
          title: "",
          prompt: "",
          content: "",
          target_word_count: "",
          is_common_app: false,
          status: "Draft",
        })

        toast({
          title: "Essay added",
          description: "Your essay has been added successfully.",
        })
      }
    } catch (error) {
      console.error("Error adding essay:", error)
      toast({
        title: "Error adding essay",
        description: handleSupabaseError(error, "There was a problem adding the essay."),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateEssayContent = async (index: number, content: string) => {
    if (!user) return

    const essay = essays[index]
    const newEssays = [...essays]
    newEssays[index].content = content

    setEssays(newEssays)
  }

  // Create a debounced version of saveEssayContent
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSaveEssayContent = useRef(
    debounce(async (essay: any, content: string) => {
      saveEssayContent(essay, content);
    }, SAVE_DEBOUNCE_DELAY)
  ).current;

  // Add a new function to save the essay content to the database
  const saveEssayContent = async (essay: any, content: string) => {
    if (!user) return

    const wordCount = calculateWordCount(content)
    const charCount = calculateCharacterCount(content)
    const now = new Date()

    try {
      const { error } = await supabase
        .from("essays")
        .update({
          content: content,
          word_count: wordCount,
          character_count: charCount,
          last_edited: now.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          }),
          updated_at: now.toISOString(),
        })
        .eq("id", essay.id)

      if (error) {
        throw error
      }

      // Get the previously saved content or empty string if none exists
      const previousContent = lastSavedContent[essay.id] || "";
      const lastVersionTime = lastVersionTimestamp[essay.id] || 0;
      const currentTime = now.getTime();
      
      // Determine if we should create a new version based on:
      // 1. Significant content changes
      // 2. Enough time has passed since the last version
      const shouldCreateVersion = 
        hasSignificantChanges(previousContent, content) && 
        (currentTime - lastVersionTime >= MIN_TIME_BETWEEN_VERSIONS);

      // Create a new version only if needed
      if (shouldCreateVersion) {
        const { data: versionData, error: versionError } = await supabase
          .from("essay_versions")
          .insert({
            essay_id: essay.id,
            content: content,
            word_count: wordCount,
            character_count: charCount,
            version_name: `Edit on ${now.toLocaleDateString()}`,
          })
          .select()

        if (versionError) {
          console.error("Error creating essay version:", versionError)
        } else if (versionData) {
          // Update versions in state
          const updatedVersions = { ...essayVersions }
          if (!updatedVersions[essay.id]) {
            updatedVersions[essay.id] = []
          }
          updatedVersions[essay.id] = [versionData[0], ...(updatedVersions[essay.id] || [])]
          setEssayVersions(updatedVersions)
          
          // Update last version timestamp
          setLastVersionTimestamp(prev => ({
            ...prev,
            [essay.id]: currentTime
          }));
          
          // Clean up old versions if necessary
          cleanupOldVersions(essay.id, [versionData[0], ...(updatedVersions[essay.id] || [])]);
        }
      }

      // Update last saved content regardless of version creation
      setLastSavedContent(prev => ({
        ...prev,
        [essay.id]: content
      }));

      // Update local state immediately after successful database update
      setEssays((prevEssays) =>
        prevEssays.map((e) =>
          e.id === essay.id
            ? {
                ...e,
                content: content,
                word_count: wordCount,
                character_count: charCount,
                last_edited: now.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }),
              }
            : e,
        ),
      )

      toast({
        title: "Essay updated",
        description: "Your essay has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating essay:", error)
      toast({
        title: "Error updating essay",
        description: handleSupabaseError(error, "There was a problem updating the essay."),
        variant: "destructive",
      })
    }
  }

  // Add a new function to handle the change in the essay content
  const handleEssayContentChange = (content: string) => {
    setEssayContent(content)
  }

  // Add a new function to handle the save essay content
  const handleSaveEssayContent = (essay: any, content: string) => {
    debouncedSaveEssayContent(essay, content)
  }

  // AI feedback function - opens AI assistant with feedback prompt
  const getAiFeedback = (essay: any) => {
    setSelectedEssay(essay)
    setAiAction("feedback")
    setShowAIAssistant(true)
  }

  // AI grammar check function - opens AI assistant with grammar checking prompt
  const checkGrammarWithAi = (essay: any) => {
    setSelectedEssay(essay)
    setAiAction("grammar")
    setShowAIAssistant(true)
  }

  // AI rephrase function - opens AI assistant with rephrasing prompt
  const rephraseWithAi = (essay: any) => {
    setSelectedEssay(essay)
    setAiAction("rephrase")
    setShowAIAssistant(true)
  }

  // General AI assistant without specific function
  const openAIAssistant = (essay: any) => {
    setSelectedEssay(essay)
    setAiAction(null)
    setShowAIAssistant(true)
  }

  const deleteEssay = async (essayId: string, index: number) => {
    if (!user) return
    setIsLoading(true)

    try {
      // First delete all versions
      const { error: versionsError } = await supabase.from("essay_versions").delete().eq("essay_id", essayId)

      if (versionsError) {
        console.error("Error deleting essay versions:", versionsError)
      }

      // Then delete the essay
      const { error } = await supabase.from("essays").delete().eq("id", essayId)

      if (error) {
        throw error
      }

      const newEssays = [...essays]
      newEssays.splice(index, 1)
      setEssays(newEssays)

      // Remove versions from state
      const updatedVersions = { ...essayVersions }
      delete updatedVersions[essayId]
      setEssayVersions(updatedVersions)

      toast({
        title: "Essay deleted",
        description: "Your essay has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting essay:", error)
      toast({
        title: "Error deleting essay",
        description: handleSupabaseError(error, "There was a problem deleting the essay."),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setConfirmDeleteEssay(null)
    }
  }

  const restoreVersion = async (essayId: string, versionId: string, content: string) => {
    if (!user) return

    try {
      const essayIndex = essays.findIndex((e) => e.id === essayId)
      if (essayIndex === -1) return

      await updateEssayContent(essayIndex, content)
      setShowVersionHistory(null)

      toast({
        title: "Version restored",
        description: "The selected version has been restored.",
      })
    } catch (error) {
      console.error("Error restoring version:", error)
      toast({
        title: "Error restoring version",
        description: handleSupabaseError(error, "There was a problem restoring the version."),
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string | null) => {
    if (!status) return null

    switch (status) {
      case "Draft":
        return <Badge variant="outline">Draft</Badge>
      case "In Progress":
        return <Badge className="bg-yellow-500">In Progress</Badge>
      case "Review":
        return <Badge className="bg-blue-500">Review</Badge>
      case "Complete":
        return <Badge className="bg-green-500">Complete</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Safe HTML rendering function
  const renderSafeHTML = (content: string) => {
    return DOMPurify.sanitize(content || "")
  }

  // Extract plain text from HTML for AI prompts
  const stripHTML = (htmlContent: string) => {
    // Create a temp div to hold the HTML
    const tempDiv = document.createElement('div');
    // Set the sanitized HTML to the div
    tempDiv.innerHTML = DOMPurify.sanitize(htmlContent || "");
    // Return just the text content (strips HTML tags)
    return tempDiv.textContent || tempDiv.innerText || "";
  }

  // Add a function to clean up old versions when they exceed the maximum limit
  const cleanupOldVersions = async (essayId: string, currentVersions: EssayVersion[]) => {
    if (!user || currentVersions.length <= MAX_VERSIONS_PER_ESSAY) return;
    
    try {
      // Sort versions by creation date, newest first
      const sortedVersions = [...currentVersions].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      // Get versions to delete (keep first MAX_VERSIONS_PER_ESSAY, delete the rest)
      const versionsToDelete = sortedVersions.slice(MAX_VERSIONS_PER_ESSAY);
      
      if (versionsToDelete.length > 0) {
        // Get the IDs of versions to delete
        const versionIdsToDelete = versionsToDelete.map(v => v.id);
        
        // Delete versions from the database
        const { error } = await supabase
          .from("essay_versions")
          .delete()
          .in("id", versionIdsToDelete);
          
        if (error) {
          console.error("Error deleting old versions:", error);
          return;
        }
        
        // Update versions in state
        const updatedVersions = { ...essayVersions };
        updatedVersions[essayId] = sortedVersions.slice(0, MAX_VERSIONS_PER_ESSAY);
        setEssayVersions(updatedVersions);
        
        console.log(`Cleaned up ${versionIdsToDelete.length} old versions for essay ${essayId}`);
      }
    } catch (error) {
      console.error("Error cleaning up old versions:", error);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Application Essays</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-1"
            onClick={() => {
              setSelectedEssay(null)
              setShowAIAssistant(true)
            }}
          >
            <Sparkles className="h-4 w-4" /> AI Essay Help
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1">
                <PlusCircle className="h-4 w-4" /> Add Essay
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Essay</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Essay Title</Label>
                  <Input
                    id="title"
                    value={newEssay.title}
                    onChange={(e) => setNewEssay({ ...newEssay, title: e.target.value })}
                  />
                  {formErrors.title && <p className="text-sm text-red-500">{formErrors.title}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="prompt">Essay Prompt</Label>
                  <Textarea
                    id="prompt"
                    value={newEssay.prompt}
                    onChange={(e) => setNewEssay({ ...newEssay, prompt: e.target.value })}
                  />
                  {formErrors.prompt && <p className="text-sm text-red-500">{formErrors.prompt}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="targetWordCount">Target Word Count (Optional)</Label>
                    <Input
                      id="targetWordCount"
                      type="number"
                      value={newEssay.target_word_count}
                      onChange={(e) => setNewEssay({ ...newEssay, target_word_count: e.target.value })}
                    />
                    {formErrors.target_word_count && (
                      <p className="text-sm text-red-500">{formErrors.target_word_count}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={newEssay.status}
                      onValueChange={(value) => setNewEssay({ ...newEssay, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Review">Review</SelectItem>
                        <SelectItem value="Complete">Complete</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isCommonApp"
                    checked={newEssay.is_common_app}
                    onCheckedChange={(checked) => setNewEssay({ ...newEssay, is_common_app: checked as boolean })}
                  />
                  <Label htmlFor="isCommonApp">This is a Common App essay</Label>
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
        </div>
      </div>

      {essays.length === 0 ? (
        <div className="text-center text-muted-foreground py-12 border rounded-md">No essays added yet</div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {essays.map((essay, index) => (
            <Card key={essay.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{essay.title}</CardTitle>
                    <CardDescription>
                      Word Count: {essay.word_count}
                      {essay.target_word_count ? ` / ${essay.target_word_count}` : ""} • Character Count:{" "}
                      {essay.character_count} • Last Edited: {essay.last_edited}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {essay.is_common_app && <Badge className="bg-primary">Common App</Badge>}
                    {getStatusBadge(essay.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-2 text-sm text-muted-foreground">
                  <strong>Prompt:</strong> {essay.prompt}
                </div>
                {editingEssay === index ? (
                  <SimpleEssayEditor
                    content={essayContent}
                    onChange={handleEssayContentChange}
                    onSave={() => {
                      setEditingEssay(null)
                      handleSaveEssayContent(essay, essayContent)
                    }}
                    wordCount={calculateWordCount(essayContent)}
                    targetWordCount={essay.target_word_count}
                    onShowHistory={() => setShowVersionHistory(essay.id)}
                  />
                ) : (
                  <div 
                    className="p-4 bg-muted/50 rounded-md font-serif"
                    dangerouslySetInnerHTML={{ __html: renderSafeHTML(essay.content || "Start writing your essay...") }}
                  />
                )}
              </CardContent>
              <CardFooter className="flex justify-end space-x-2 bg-muted/20">
                {editingEssay === index ? null : (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="ml-2"
                      onClick={() => setShowVersionHistory(essay.id)}
                      disabled={!essayVersions[essay.id] || essayVersions[essay.id].length === 0}
                    >
                      <div className="flex items-center gap-1">
                        <History className="h-4 w-4" />
                        <span>Version History</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-flex ml-1">
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>Smart versioning enabled. New versions are created only when significant changes are made, reducing clutter in version history.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </Button>
                    <Button variant="outline" onClick={() => getAiFeedback(essay)}>
                      <Sparkles className="h-4 w-4 mr-1" /> AI Feedback
                    </Button>
                    <Button variant="outline" onClick={() => checkGrammarWithAi(essay)}>
                      <Sparkles className="h-4 w-4 mr-1" /> Check Grammar
                    </Button>
                    <Button variant="outline" onClick={() => rephraseWithAi(essay)}>
                      <Sparkles className="h-4 w-4 mr-1" /> Rephrase
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingEssay(index)
                        setEssayContent(essay.content)
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button variant="outline" onClick={() => setConfirmDeleteEssay(essay.id)}>
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Version History Dialog */}
      <Dialog open={!!showVersionHistory} onOpenChange={(open) => !open && setShowVersionHistory(null)}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Version History</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {showVersionHistory && essayVersions[showVersionHistory] && essayVersions[showVersionHistory].length > 0 ? (
              <div className="space-y-4">
                {essayVersions[showVersionHistory].map((version) => (
                  <Card key={version.id}>
                    <CardHeader className="py-3">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">{version.version_name || "Unnamed Version"}</CardTitle>
                        <CardDescription>
                          {new Date(version.created_at).toLocaleString()} • Words: {version.word_count} • Characters:{" "}
                          {version.character_count}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="py-2">
                      <div 
                        className="p-3 bg-muted/30 rounded-md text-sm max-h-[200px] overflow-y-auto"
                        dangerouslySetInnerHTML={{ __html: renderSafeHTML(version.content) }}
                      />
                    </CardContent>
                    <CardFooter className="py-2">
                      <Button size="sm" onClick={() => restoreVersion(showVersionHistory, version.id, version.content)}>
                        Restore This Version
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No version history available for this essay</div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Assistant */}
      {showAIAssistant && (
        <AIAssistant
          initialContext={{
            type: "essay",
            id: selectedEssay?.id,
            title: selectedEssay?.prompt || "Essay Writing",
          }}
          initialPrompt={
            selectedEssay && aiAction 
              ? aiAction === "feedback"
                ? `Please provide feedback on this essay:\n\n${stripHTML(selectedEssay.content)}`
                : aiAction === "grammar"
                  ? `Please check this essay for grammar, spelling, and punctuation errors and suggest corrections:\n\n${stripHTML(selectedEssay.content)}`
                  : `Please help me rephrase this essay to improve its flow and clarity while maintaining the original meaning:\n\n${stripHTML(selectedEssay.content)}`
              : undefined
          }
          showOnLoad={true}
          onClose={() => {
            setShowAIAssistant(false)
            setAiAction(null)
          }}
        />
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={!!confirmDeleteEssay}
        onOpenChange={(open) => !open && setConfirmDeleteEssay(null)}
        title="Delete Essay"
        description="Are you sure you want to delete this essay? This action cannot be undone."
        confirmText="Delete"
        onConfirm={() => {
          if (confirmDeleteEssay) {
            const index = essays.findIndex((essay) => essay.id === confirmDeleteEssay)
            if (index !== -1) {
              deleteEssay(confirmDeleteEssay, index)
            }
          }
        }}
        variant="destructive"
      />
    </div>
  )
}