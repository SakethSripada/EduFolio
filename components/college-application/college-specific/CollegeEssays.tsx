"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Edit, Trash2, Copy, Loader2, Save, Sparkles, ChevronDown, ChevronUp, ExternalLink } from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"
import { useToast } from "@/components/ui/use-toast"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { validateRequired } from "@/lib/validation"
import SimpleEssayEditor from "@/components/essay/SimpleEssayEditor"
import AIAssistant from "@/components/ai/AIAssistant"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { debounce } from "@/lib/utils"
import { useRef } from "react"
import { NumericInput } from "@/components/ui/numeric-input"

type AiAssistantType = "brainstorm" | "outline" | "feedback" | "grammar" | "improve"

type CollegeEssaysProps = {
  collegeId: string
  collegeName: string
}

type Essay = {
  id: string
  title: string
  prompt: string
  content: string
  word_count: number
  character_count: number
  target_word_count: number | null
  last_edited: string
  status: string
  external_link?: string | null
}

// Function to handle Supabase errors
const handleSupabaseError = (error: any, defaultMessage: string): string => {
  if (error && error.message) {
    return error.message
  }
  return defaultMessage
}

export default function CollegeEssays({ collegeId, collegeName }: CollegeEssaysProps) {
  const [essays, setEssays] = useState<Essay[]>([])
  const [generalEssays, setGeneralEssays] = useState<Essay[]>([])
  const [newEssay, setNewEssay] = useState<Partial<Essay>>({
    title: "",
    prompt: "",
    content: "",
    target_word_count: null,
    status: "Draft",
    external_link: null,
  })
  const [isAddingEssay, setIsAddingEssay] = useState(false)
  const [isEditingEssay, setIsEditingEssay] = useState(false)
  const [editingEssayId, setEditingEssayId] = useState<string | null>(null)
  const [isImportingEssays, setIsImportingEssays] = useState(false)
  const [selectedEssays, setSelectedEssays] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [confirmDeleteEssay, setConfirmDeleteEssay] = useState<string | null>(null)
  const [essayContent, setEssayContent] = useState<string>("")
  const [editingEssay, setEditingEssay] = useState<number | null>(null)
  const [showVersionHistory, setShowVersionHistory] = useState<string | null>(null)
  // Add state for collapsed essays
  const [collapsedEssays, setCollapsedEssays] = useState<Record<string, boolean>>({})
  // Add initialization flag
  const [didInitCollapse, setDidInitCollapse] = useState(false)
  // Add AI assistant state variables
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [selectedEssay, setSelectedEssay] = useState<any>(null)
  const [aiAction, setAiAction] = useState<"feedback" | "grammar" | "rephrase" | null>(null)
  // Add state to track if an essay is being saved
  const [savingEssay, setSavingEssay] = useState<string | null>(null)
  // Add state for adding external essay
  const [isAddingExternalEssay, setIsAddingExternalEssay] = useState(false)
  const [externalEssay, setExternalEssay] = useState<{
    title: string;
    prompt: string;
    external_link: string;
    status: string;
  }>({
    title: "",
    prompt: "",
    external_link: "",
    status: "Draft"
  })
  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = createClientComponentClient<Database>()
  const [aiAssistantType, setAiAssistantType] = useState<AiAssistantType>("brainstorm")
  const [aiPrompt, setAiPrompt] = useState("")
  const [aiEssayContent, setAiEssayContent] = useState("")
  const [aiResult, setAiResult] = useState("")
  const [aiIsLoading, setAiIsLoading] = useState(false)
  const [aiFeedbackFocus, setAiFeedbackFocus] = useState("")
  const [selectedEssayForAi, setSelectedEssayForAi] = useState<string | null>(null)
  
  // Constants
  const SAVE_DEBOUNCE_DELAY = 2000; // 2 seconds
  
  // Create a debounced version of saveEssayContent
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSaveEssayContent = useRef(
    debounce(async (essay: any, content: string, showToast: boolean) => {
      saveEssayContent(essay, content, showToast);
    }, SAVE_DEBOUNCE_DELAY)
  ).current;

  useEffect(() => {
    if (!user || !collegeId) return

    const fetchData = async () => {
      setIsLoading(true)

      setTimeout(async () => {
        try {
          const { data: collegeEssaysData, error: collegeEssaysError } = await supabase
            .from("college_essays")
            .select("*")
            .eq("user_id", user.id)
            .eq("college_id", collegeId)
            .order("created_at", { ascending: false })

          if (collegeEssaysError) throw collegeEssaysError

          // Fetch general essays for import
          const { data: generalEssaysData, error: generalEssaysError } = await supabase
            .from("essays")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })

          if (generalEssaysError) throw generalEssaysError

          setEssays(collegeEssaysData || [])
          setGeneralEssays(generalEssaysData || [])
        } catch (error) {
          console.error("Error loading essays:", error)
          toast({
            title: "Error loading essays",
            description: handleSupabaseError(error, "There was a problem loading your essays."),
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
      }, 0)
    }

    fetchData()
  }, [user, collegeId, toast])

  // Initialize collapsed essays ONLY ONCE when essays are first loaded
  useEffect(() => {
    if (!didInitCollapse && essays.length > 0) {
      const initialCollapsedState = essays.reduce((acc, essay) => {
        acc[essay.id] = true; // Set to true to collapse by default
        return acc;
      }, {} as Record<string, boolean>);
      setCollapsedEssays(initialCollapsedState);
      setDidInitCollapse(true);
    }
  }, [essays, didInitCollapse]);

  // Auto-expand the card being edited
  useEffect(() => {
    if (editingEssay !== null && essays.length > 0) {
      const essayId = essays[editingEssay]?.id;
      if (essayId) {
        setCollapsedEssays(prev => ({
          ...prev,
          [essayId]: false // Ensure the edited essay is expanded
        }));
      }
    }
  }, [editingEssay, essays]);

  // Validate essay form
  const validateEssayForm = (): boolean => {
    const errors: Record<string, string> = {}

    const titleError = validateRequired(newEssay.title, "Essay title")
    if (titleError) errors.title = titleError

    const promptError = validateRequired(newEssay.prompt, "Essay prompt")
    if (promptError) errors.prompt = promptError

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const countWords = (text: string | undefined): number => {
    if (!text) return 0
    return text.trim().split(/\s+/).filter(Boolean).length
  }

  const calculateWordCount = (text: string): number => {
    return text.trim().split(/\s+/).filter(Boolean).length
  }

  const calculateCharacterCount = (text: string): number => {
    return text.length
  }

  const addEssay = async () => {
    if (!user || !collegeId || !validateEssayForm()) return

    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from("college_essays")
        .insert([
          {
            user_id: user.id,
            college_id: collegeId,
            title: newEssay.title || "",
            prompt: newEssay.prompt || "",
            content: newEssay.content || "",
            word_count: countWords(newEssay.content || ""),
            character_count: (newEssay.content || "").length,
            target_word_count: newEssay.target_word_count || null,
            last_edited: new Date().toISOString(),
            status: newEssay.status || "Draft",
            external_link: newEssay.external_link || null,
          },
        ])
        .select()

      if (error) throw error

      if (data) {
        setEssays([data[0], ...essays])
        setNewEssay({
          title: "",
          prompt: "",
          content: "",
          target_word_count: null,
          status: "Draft",
          external_link: null,
        })
        setIsAddingEssay(false)

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

  const startEditEssay = (essayId: string) => {
    const essayToEdit = essays.find((e) => e.id === essayId)
    if (essayToEdit) {
      setNewEssay({
        title: essayToEdit.title,
        prompt: essayToEdit.prompt,
        content: essayToEdit.content,
        target_word_count: essayToEdit.target_word_count,
        status: essayToEdit.status,
      })
      setEditingEssayId(essayId)
      setIsEditingEssay(true)
    }
  }

  const updateEssay = async () => {
    if (!user || !collegeId || !editingEssayId || !validateEssayForm()) return

    setIsLoading(true)

    try {
      const { error } = await supabase
        .from("college_essays")
        .update({
          title: newEssay.title || "",
          prompt: newEssay.prompt || "",
          content: newEssay.content as string,
          word_count: countWords(newEssay.content || ""),
          character_count: (newEssay.content || "").length,
          target_word_count: newEssay.target_word_count || null,
          last_edited: new Date().toISOString(),
          status: newEssay.status || "Draft",
          external_link: newEssay.external_link || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingEssayId)
        .eq("college_id", collegeId)

      if (error) throw error

      setEssays(
        essays.map((essay) => {
          if (essay.id === editingEssayId) {
            return {
              ...essay,
              title: newEssay.title as string,
              prompt: newEssay.prompt as string,
              content: newEssay.content as string,
              word_count: countWords(newEssay.content || ""),
              character_count: (newEssay.content || "").length,
              target_word_count: newEssay.target_word_count || null,
              last_edited: new Date().toISOString(),
              status: newEssay.status as string,
              external_link: newEssay.external_link as string | null,
            }
          }
          return essay
        }),
      )
      setIsEditingEssay(false)
      setEditingEssayId(null)
      setNewEssay({
        title: "",
        prompt: "",
        content: "",
        target_word_count: null,
        status: "Draft",
      })

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
    } finally {
      setIsLoading(false)
    }
  }

  const deleteEssay = async (essayId: string) => {
    if (!user || !collegeId) return
    setIsLoading(true)

    try {
      const { error } = await supabase.from("college_essays").delete().eq("id", essayId).eq("college_id", collegeId)

      if (error) throw error

      setEssays(essays.filter((essay) => essay.id !== essayId))

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

  const importEssays = async () => {
    if (!user || !collegeId) return

    const selectedEssayIds = Object.entries(selectedEssays)
      .filter(([_, isSelected]) => isSelected)
      .map(([id, _]) => id)

    if (selectedEssayIds.length === 0) {
      toast({
        title: "No essays selected",
        description: "Please select at least one essay to import.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const essaysToImport = generalEssays.filter((essay) => selectedEssayIds.includes(essay.id))

      const essaysData = essaysToImport.map((essay) => ({
        user_id: user.id,
        college_id: collegeId,
        title: essay.title,
        prompt: essay.prompt,
        content: essay.content,
        word_count: essay.word_count,
        character_count: essay.character_count,
        target_word_count: essay.target_word_count,
        last_edited: essay.last_edited,
        status: essay.status,
      }))

      const { data, error } = await supabase.from("college_essays").insert(essaysData).select()

      if (error) throw error

      if (data) {
        setEssays([...data, ...essays])
        setSelectedEssays({})
        setIsImportingEssays(false)

        toast({
          title: "Essays imported",
          description: `${data.length} essay(s) have been imported successfully.`,
        })
      }
    } catch (error) {
      console.error("Error importing essays:", error)
      toast({
        title: "Error importing essays",
        description: handleSupabaseError(error, "There was a problem importing the essays."),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Draft":
        return <Badge variant="outline">Draft</Badge>
      case "In Progress":
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
      case "Review":
        return <Badge className="bg-yellow-100 text-yellow-800">Review</Badge>
      case "Complete":
        return <Badge className="bg-green-100 text-green-800">Complete</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Replace the updateEssayContent function with the following code
  const updateEssayContent = async (index: number, content: string) => {
    if (!user) return

    const essay = essays[index]
    const newEssays = [...essays]
    newEssays[index].content = content

    setEssays(newEssays)
  }

  // Add a new function to save the essay content to the database
  const saveEssayContent = async (essay: any, content: string, showToast: boolean = false) => {
    if (!user) return
    
    // Track if we're saving
    const savingId = essay.id;
    setSavingEssay(savingId);

    const wordCount = calculateWordCount(content)
    const charCount = calculateCharacterCount(content)

    try {
      const { error } = await supabase
        .from("college_essays")
        .update({
          content: content,
          word_count: wordCount,
          character_count: charCount,
          last_edited: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", essay.id)
        .eq("college_id", collegeId)

      if (error) {
        throw error
      }

      // Update local state using functional update to preserve editing state
      setEssays((prevEssays) => {
        return prevEssays.map((e) => {
          if (e.id === essay.id) {
            return {
              ...e,
              content: content,
              word_count: wordCount,
              character_count: charCount,
              last_edited: new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              }),
            };
          }
          return e;
        });
      });

      // Only show toast for manual saves, not auto-saves
      if (showToast) {
        toast({
          title: "Essay updated",
          description: "Your essay has been updated successfully.",
        })
      }
    } catch (error) {
      console.error("Error updating essay:", error)
      if (showToast) {
        toast({
          title: "Error updating essay",
          description: handleSupabaseError(error, "There was a problem updating the essay."),
          variant: "destructive",
        })
      }
    } finally {
      // Clear saving state
      setSavingEssay(null);
    }
  }

  // Add a new function to handle the change in the essay content
  const handleEssayContentChange = (content: string) => {
    setEssayContent(content)
  }

  // Add a new function to handle the save essay content
  const handleSaveEssayContent = (essay: any, content: string, showToast: boolean = false) => {
    if (showToast) {
      // For manual saves, don't use debounce
      saveEssayContent(essay, content, showToast)
    } else {
      // For auto-saves, use debounce
      debouncedSaveEssayContent(essay, content, showToast)
    }
    // NEVER set editingEssay to null here - this ensures the editor stays open
  }

  // Add helper functions for text processing
  const stripHTML = (htmlContent: string) => {
    // Create a temp div to hold the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent || "";
    // Return just the text content (strips HTML tags)
    return tempDiv.textContent || tempDiv.innerText || "";
  }

  // AI feedback function - opens AI assistant with feedback prompt
  const getAiFeedback = (essay: any) => {
    setSelectedEssay(essay);
    setAiAssistantType("feedback");
    setShowAIAssistant(true);
  }

  // AI grammar check function - opens AI assistant with grammar checking prompt
  const checkGrammarWithAi = (essay: any) => {
    setSelectedEssay(essay);
    setAiAssistantType("grammar");
    setShowAIAssistant(true);
  }

  // AI rephrase function - opens AI assistant with rephrasing prompt
  const rephraseWithAi = (essay: any) => {
    setSelectedEssay(essay);
    setAiAssistantType("improve");
    setShowAIAssistant(true);
  }

  const addExternalEssay = async () => {
    if (!user || !collegeId) return

    // Validate the form
    const errors: Record<string, string> = {}
    if (!externalEssay.title.trim()) errors.title = "Essay title is required"
    if (!externalEssay.external_link.trim()) errors.external_link = "External link is required"
    
    // Simple URL validation
    if (externalEssay.external_link && 
        !externalEssay.external_link.match(/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?$/)) {
      errors.external_link = "Please enter a valid URL"
    }

    setFormErrors(errors)
    if (Object.keys(errors).length > 0) return

    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from("college_essays")
        .insert([
          {
            user_id: user.id,
            college_id: collegeId,
            title: externalEssay.title.trim(),
            prompt: externalEssay.prompt.trim(),
            content: "",
            word_count: 0,
            character_count: 0,
            target_word_count: null,
            last_edited: new Date().toISOString(),
            status: externalEssay.status,
            external_link: externalEssay.external_link.trim(),
          },
        ])
        .select()

      if (error) throw error

      if (data) {
        setEssays([data[0], ...essays])
        setExternalEssay({
          title: "",
          prompt: "",
          external_link: "",
          status: "Draft"
        })
        setIsAddingExternalEssay(false)

        toast({
          title: "External essay added",
          description: "Your linked essay has been added successfully.",
        })
      }
    } catch (error) {
      console.error("Error adding external essay:", error)
      toast({
        title: "Error adding external essay",
        description: handleSupabaseError(error, "There was a problem adding the external essay link."),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAiAssistantSubmit = async () => {
    if (!user || !collegeId) return

    setAiIsLoading(true);

    try {
      // Find the selected essay or use the current values
      const essayId = selectedEssayForAi || (selectedEssay?.id || "");
      const essayPrompt = aiPrompt || (selectedEssay?.prompt || "");
      const essayContent = aiEssayContent || (selectedEssay?.content || "");
      
      // Set state for the AIAssistant component
      setSelectedEssay({ 
        id: essayId,
        prompt: essayPrompt,
        content: essayContent
      });
      setShowAIAssistant(true);
      
      toast({
        title: "AI Assistant Opened",
        description: "You can now interact with the AI assistant.",
      });
    } catch (error) {
      console.error("Error handling AI assistant:", error);
      toast({
        title: "Error opening AI assistant",
        description: handleSupabaseError(error, "There was a problem opening the AI assistant."),
        variant: "destructive",
      });
    } finally {
      setAiIsLoading(false);
    }
  }

  // Add a helper function to get the correct AI prompt based on the type
  const getAIPromptForType = (type: AiAssistantType, prompt: string, content: string, collegeName: string, focus?: string): string => {
    switch (type) {
      case "brainstorm":
        return `Please help me brainstorm ideas for this essay prompt for ${collegeName}: ${prompt}`
      case "outline":
        return `Please create an outline for an essay responding to this prompt for ${collegeName}: ${prompt}`
      case "feedback":
        return `Please provide feedback on this essay for ${collegeName}${focus ? ` focusing on ${focus}` : ''}:\n\n${stripHTML(content)}`
      case "grammar":
        return `Please check this essay for ${collegeName} for grammar, spelling, and punctuation errors and suggest corrections:\n\n${stripHTML(content)}`
      case "improve":
        return `Please help me rephrase this essay for ${collegeName} to improve its flow and clarity while maintaining the original meaning:\n\n${stripHTML(content)}`
      default:
        return ""
    }
  }

  // Update AI button to simply open the assistant without sending specific data
  const openGenericAIAssistant = () => {
    setSelectedEssay(null);
    setAiAssistantType("brainstorm");
    setShowAIAssistant(true);
  }

  // Add a new function to handle save and exit
  const handleSaveAndExit = (essay: any, content: string) => {
    // First save the content (don't use debounce for this, we want immediate saving)
    saveEssayContent(essay, content, true).then(() => {
      // After saving completes, close the editor by setting editingEssay to null
      setEditingEssay(null);
      
      // Collapse the essay card
      setCollapsedEssays(prev => ({
        ...prev,
        [essay.id]: true
      }));
    });
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-xl font-semibold mb-4 sm:mb-0">{collegeName} Essays</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2" onClick={() => openGenericAIAssistant()}>
            <Sparkles className="h-4 w-4" /> AI Assistant
          </Button>
          <Button variant="outline" className="flex items-center gap-2" onClick={() => setIsImportingEssays(true)}>
            <Copy className="h-4 w-4" /> Import Essays
          </Button>
          <Button variant="outline" className="flex items-center gap-2" onClick={() => setIsAddingExternalEssay(true)}>
            <ExternalLink className="h-4 w-4" /> Add External Essay
          </Button>
          <Button className="flex items-center gap-2" onClick={() => setIsAddingEssay(true)}>
            <PlusCircle className="h-4 w-4" /> Add Essay
          </Button>
        </div>
      </div>
      
      {essays.length > 0 && (
        <div className="flex justify-end gap-2 mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              const allEssayIds = essays.reduce((acc, essay) => {
                acc[essay.id] = false;
                return acc;
              }, {} as Record<string, boolean>);
              setCollapsedEssays(allEssayIds);
            }}
          >
            <ChevronUp className="h-4 w-4 mr-1" /> Expand All
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              const allEssayIds = essays.reduce((acc, essay) => {
                acc[essay.id] = true;
                return acc;
              }, {} as Record<string, boolean>);
              setCollapsedEssays(allEssayIds);
            }}
          >
            <ChevronDown className="h-4 w-4 mr-1" /> Collapse All
          </Button>
        </div>
      )}

      {essays.length === 0 ? (
        <div className="text-center text-muted-foreground py-12 border rounded-md">No essays added yet for {collegeName}</div>
      ) : (
        <div className="grid gap-6">
          {essays.map((essay, index) => (
            <Card key={essay.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        {essay.title}
                        {getStatusBadge(essay.status)}
                      </CardTitle>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            setEditingEssayId(essay.id);
                            setIsEditingEssay(true);
                            setNewEssay({
                              title: essay.title,
                              prompt: essay.prompt,
                              target_word_count: essay.target_word_count,
                              status: essay.status,
                              external_link: essay.external_link,
                            });
                          }}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit Details</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setCollapsedEssays({
                              ...collapsedEssays, 
                              [essay.id]: !collapsedEssays[essay.id]
                            });
                          }}
                        >
                          {collapsedEssays[essay.id] ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronUp className="h-4 w-4" />
                          )}
                          <span className="sr-only">
                            {collapsedEssays[essay.id] ? "Expand" : "Collapse"}
                          </span>
                        </Button>
                      </div>
                    </div>
                    <CardDescription className="mt-1">
                      <div className="flex flex-wrap gap-2 items-center">
                        <span>{essay.prompt}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 items-center mt-1">
                        <span className="font-medium">Word Count: {essay.word_count}</span>
                        {essay.target_word_count && <span> / {essay.target_word_count}</span>} • 
                        <span className="ml-1">Last Edited: {new Date(essay.last_edited).toLocaleDateString()}</span>
                        {essay.external_link && (
                          <a 
                            href={essay.external_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center ml-2 text-primary hover:underline"
                          >
                            <ExternalLink className="h-3.5 w-3.5 mr-1" /> External Document
                          </a>
                        )}
                      </div>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              {!collapsedEssays[essay.id] && (
                <>
                  <CardContent>
                    {editingEssay === index ? (
                      <SimpleEssayEditor
                        content={essayContent}
                        onChange={(content) => {
                          // Update local state without triggering save yet
                          // (the editor will handle autosave timing)
                          setEssayContent(content)
                        }}
                        onSave={() => {
                          // This will be called both on manual save button click
                          // and when auto-save timer fires
                          handleSaveEssayContent(essay, essayContent, true)
                        }}
                        onSaveAndExit={() => {
                          // This will be called when the "Save & Exit" button is clicked
                          handleSaveAndExit(essay, essayContent)
                        }}
                        wordCount={calculateWordCount(essayContent)}
                        targetWordCount={essay.target_word_count}
                        onShowHistory={() => setShowVersionHistory(essay.id)}
                        autoSave={true}
                        autoSaveDelay={SAVE_DEBOUNCE_DELAY}
                      />
                    ) : (
                      <div className="prose prose-sm max-w-none dark:text-foreground">
                        {essay.content || "Start writing your essay..."}
                      </div>
                    )}
                  </CardContent>
                
                  <CardFooter className="flex flex-wrap justify-end gap-2 p-4 border-t bg-muted/20">
                    {editingEssay === index ? (
                      <Button onClick={() => {
                        // Save without closing editor
                        handleSaveEssayContent(essay, essayContent, true)
                        // Do NOT set editingEssay to null here
                      }}>
                        <Save className="h-4 w-4 mr-2" /> Save
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingEssay(index)
                            setEssayContent(essay.content)
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" /> Edit Content
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => getAiFeedback(essay)}>
                          <Sparkles className="h-4 w-4 mr-1" /> AI Feedback
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => checkGrammarWithAi(essay)}>
                          <Sparkles className="h-4 w-4 mr-1" /> Grammar
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => rephraseWithAi(essay)}>
                          <Sparkles className="h-4 w-4 mr-1" /> Rephrase
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setConfirmDeleteEssay(essay.id)}>
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </>
                    )}
                  </CardFooter>
                </>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Add Essay Dialog */}
      <Dialog open={isAddingEssay} onOpenChange={setIsAddingEssay}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle>Add New Essay for {collegeName}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Essay Title</Label>
              <Input
                id="title"
                value={newEssay.title || ""}
                onChange={(e) => setNewEssay({ ...newEssay, title: e.target.value })}
              />
              {formErrors.title && <p className="text-sm text-red-500">{formErrors.title}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="prompt">Essay Prompt</Label>
              <Textarea
                id="prompt"
                value={newEssay.prompt || ""}
                onChange={(e) => setNewEssay({ ...newEssay, prompt: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="targetWordCount">Target Word Count (Optional)</Label>
              <NumericInput
                id="targetWordCount"
                min={0}
                value={typeof newEssay.target_word_count === 'number' ? newEssay.target_word_count : null}
                onChange={(value) => setNewEssay({ ...newEssay, target_word_count: value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newEssay.status || "Draft"}
                onChange={(e) => setNewEssay({ ...newEssay, status: e.target.value })}
              >
                <option value="Draft">Draft</option>
                <option value="In Progress">In Progress</option>
                <option value="Reviewing">Reviewing</option>
                <option value="Complete">Complete</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="externalLink">External Link (Optional)</Label>
              <Input
                id="externalLink"
                type="url"
                placeholder="e.g. https://docs.google.com/document/d/..."
                value={newEssay.external_link || ""}
                onChange={(e) => setNewEssay({ ...newEssay, external_link: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Add a link to an external document (Google Docs, Microsoft Word, etc.)
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Essay Content (Optional)</Label>
              <Textarea
                id="content"
                rows={6}
                value={newEssay.content || ""}
                onChange={(e) => setNewEssay({ ...newEssay, content: e.target.value })}
                placeholder="Start writing your essay here..."
              />
            </div>
          </div>
          <DialogFooter className="sticky bottom-0 bg-background pt-2">
            <Button variant="outline" onClick={() => setIsAddingEssay(false)} className="mr-2">
              Cancel
            </Button>
            <Button onClick={addEssay} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                "Add Essay"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Essay Details Dialog */}
      <Dialog
        open={isEditingEssay}
        onOpenChange={(open) => {
          if (!open) {
            setIsEditingEssay(false)
            setEditingEssayId(null)
            setNewEssay({
              title: "",
              prompt: "",
              content: "",
              target_word_count: null,
              status: "Draft",
            })
            setFormErrors({})
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle>Edit Essay Details</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Essay Title</Label>
              <Input
                id="title"
                value={newEssay.title || ""}
                onChange={(e) => setNewEssay({ ...newEssay, title: e.target.value })}
              />
              {formErrors.title && <p className="text-sm text-red-500">{formErrors.title}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="prompt">Essay Prompt</Label>
              <Textarea
                id="prompt"
                value={newEssay.prompt || ""}
                onChange={(e) => setNewEssay({ ...newEssay, prompt: e.target.value })}
              />
              {formErrors.prompt && <p className="text-sm text-red-500">{formErrors.prompt}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="targetWordCount">Target Word Count (Optional)</Label>
              <NumericInput
                id="targetWordCount"
                min={0}
                value={typeof newEssay.target_word_count === 'number' ? newEssay.target_word_count : null}
                onChange={(value) => setNewEssay({ ...newEssay, target_word_count: value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newEssay.status || "Draft"}
                onChange={(e) => setNewEssay({ ...newEssay, status: e.target.value })}
              >
                <option value="Draft">Draft</option>
                <option value="In Progress">In Progress</option>
                <option value="Reviewing">Reviewing</option>
                <option value="Complete">Complete</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="externalLink">External Link (Optional)</Label>
              <Input
                id="externalLink"
                type="url"
                placeholder="e.g. https://docs.google.com/document/d/..."
                value={newEssay.external_link || ""}
                onChange={(e) => setNewEssay({ ...newEssay, external_link: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter className="sticky bottom-0 bg-background pt-2">
            <Button variant="outline" onClick={() => setIsEditingEssay(false)} className="mr-2">
              Cancel
            </Button>
            <Button onClick={updateEssay}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Essays Dialog */}
      <Dialog open={isImportingEssays} onOpenChange={setIsImportingEssays}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle>Import Essays</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Select essays from your general essays to import for this college application.
            </p>
            {generalEssays.length === 0 ? (
              <div className="text-center py-6 border rounded-md">
                <p className="text-muted-foreground">No general essays found to import.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {generalEssays.map((essay) => (
                  <div key={essay.id} className="flex items-start p-3 border rounded-md hover:bg-muted/30 transition-colors">
                    <input
                      type="checkbox"
                      checked={!!selectedEssays[essay.id]}
                      onChange={(e) => setSelectedEssays({ ...selectedEssays, [essay.id]: e.target.checked })}
                      className="h-4 w-4 mt-1 rounded border-gray-300 mr-3"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{essay.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">{essay.prompt}</p>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{essay.word_count} words</span>
                        <span>{getStatusBadge(essay.status)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter className="sticky bottom-0 bg-background pt-2">
            <Button variant="outline" onClick={() => setIsImportingEssays(false)} disabled={isLoading} className="mr-2">
              Cancel
            </Button>
            <Button onClick={importEssays} disabled={isLoading || !generalEssays || generalEssays.length === 0}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Importing...
                </>
              ) : (
                "Import Selected"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              deleteEssay(confirmDeleteEssay)
            }
          }
        }}
        variant="destructive"
      />

      {/* AI Assistant Dialog */}
      <Dialog open={showAIAssistant} onOpenChange={setShowAIAssistant}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-2">
            <DialogTitle>AI Essay Assistant</DialogTitle>
            <DialogDescription>
              Get help with your college essays
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="ai-prompt" className="text-base">What would you like help with?</Label>
                <Select value={aiAssistantType} onValueChange={(value) => setAiAssistantType(value as AiAssistantType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type of assistance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brainstorm">Brainstorm essay ideas</SelectItem>
                    <SelectItem value="outline">Create an essay outline</SelectItem>
                    <SelectItem value="feedback">Get feedback on my essay</SelectItem>
                    <SelectItem value="grammar">Check grammar and clarity</SelectItem>
                    <SelectItem value="improve">Improve my essay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {aiAssistantType === 'brainstorm' && (
                <div className="space-y-2">
                  <Label htmlFor="prompt" className="text-base">Essay Prompt</Label>
                  <Textarea 
                    id="prompt" 
                    value={aiPrompt} 
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Enter the essay prompt"
                    className="min-h-[100px]"
                  />
                </div>
              )}
              
              {aiAssistantType === 'outline' && (
                <div className="space-y-2">
                  <Label htmlFor="prompt" className="text-base">Essay Prompt</Label>
                  <Textarea 
                    id="prompt" 
                    value={aiPrompt} 
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Enter the essay prompt"
                    className="min-h-[100px]"
                  />
                </div>
              )}
              
              {(aiAssistantType === 'feedback' || aiAssistantType === 'grammar' || aiAssistantType === 'improve') && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="essay-content" className="text-base">Essay Content</Label>
                    <Select
                      value={selectedEssayForAi || ""}
                      onValueChange={(value) => {
                        setSelectedEssayForAi(value);
                        const essay = essays.find(e => e.id === value);
                        if (essay) {
                          setAiPrompt(essay.prompt);
                          setAiEssayContent(essay.content);
                        }
                      }}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select an essay" />
                      </SelectTrigger>
                      <SelectContent>
                        {essays.map(essay => (
                          <SelectItem key={essay.id} value={essay.id}>
                            {essay.prompt.substring(0, 30)}...
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Textarea 
                    id="essay-content" 
                    value={aiEssayContent} 
                    onChange={(e) => setAiEssayContent(e.target.value)}
                    placeholder="Paste your essay here"
                    className="min-h-[200px] font-serif"
                  />
                </div>
              )}
              
              {aiAssistantType === 'feedback' && (
                <div className="space-y-2">
                  <Label htmlFor="feedback-focus" className="text-base">Focus Areas (Optional)</Label>
                  <Textarea 
                    id="feedback-focus" 
                    value={aiFeedbackFocus} 
                    onChange={(e) => setAiFeedbackFocus(e.target.value)}
                    placeholder="What specific areas would you like feedback on? (e.g., clarity, structure, persuasiveness)"
                    className="min-h-[80px]"
                  />
                </div>
              )}
            </div>
            
            {aiResult && (
              <div className="border rounded-lg p-4 mt-4 bg-muted/20">
                <h3 className="text-sm font-medium mb-2">AI Response:</h3>
                <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                  {aiResult}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="sticky bottom-0 bg-background pt-2 mt-4">
            <div className="flex w-full items-center justify-between gap-2">
              <div className="flex-1">
                {aiIsLoading && <p className="text-sm text-muted-foreground">Generating response...</p>}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => {
                  setShowAIAssistant(false);
                  setAiResult('');
                }}>
                  Close
                </Button>
                <Button
                  onClick={handleAiAssistantSubmit}
                  disabled={aiIsLoading || 
                    (aiAssistantType === 'brainstorm' && !aiPrompt) ||
                    (aiAssistantType === 'outline' && !aiPrompt) ||
                    ((aiAssistantType === 'feedback' || aiAssistantType === 'grammar' || aiAssistantType === 'improve') && !aiEssayContent)
                  }
                >
                  {aiIsLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing
                    </>
                  ) : (
                    <>Generate</>
                  )}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add External Essay Dialog */}
      <Dialog open={isAddingExternalEssay} onOpenChange={setIsAddingExternalEssay}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle>Add External Essay Link</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="ext-title">Essay Title</Label>
              <Input
                id="ext-title"
                value={externalEssay.title}
                onChange={(e) => setExternalEssay({ ...externalEssay, title: e.target.value })}
                placeholder="e.g., Why This College Essay"
              />
              {formErrors.title && <p className="text-sm text-red-500">{formErrors.title}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ext-prompt">Essay Prompt (Optional)</Label>
              <Textarea
                id="ext-prompt"
                value={externalEssay.prompt}
                onChange={(e) => setExternalEssay({ ...externalEssay, prompt: e.target.value })}
                placeholder="Enter the essay prompt or question..."
                rows={2}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ext-link">External Link <span className="text-red-500">*</span></Label>
              <Input
                id="ext-link"
                type="url"
                value={externalEssay.external_link}
                onChange={(e) => setExternalEssay({ ...externalEssay, external_link: e.target.value })}
                placeholder="e.g., https://docs.google.com/document/d/..."
              />
              {formErrors.external_link && <p className="text-sm text-red-500">{formErrors.external_link}</p>}
              <p className="text-xs text-muted-foreground">
                Add a link to where your essay is stored (Google Docs, Microsoft Word, etc.)
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ext-status">Status</Label>
              <select
                id="ext-status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={externalEssay.status}
                onChange={(e) => setExternalEssay({ ...externalEssay, status: e.target.value })}
              >
                <option value="Draft">Draft</option>
                <option value="In Progress">In Progress</option>
                <option value="Reviewing">Reviewing</option>
                <option value="Complete">Complete</option>
              </select>
            </div>
          </div>
          <DialogFooter className="sticky bottom-0 bg-background pt-2">
            <Button variant="outline" onClick={() => setIsAddingExternalEssay(false)} className="mr-2">
              Cancel
            </Button>
            <Button onClick={addExternalEssay} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Adding...
                </>
              ) : (
                "Add External Essay"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Assistant */}
      {showAIAssistant && (
        <AIAssistant
          showOnLoad={true}
          initialContext={{
            type: "essay",
            id: selectedEssay?.id,
            title: selectedEssay?.title || selectedEssay?.prompt,
          }}
          initialPrompt={selectedEssay ? getAIPromptForType(aiAssistantType, selectedEssay.prompt, selectedEssay.content, collegeName, aiFeedbackFocus) : undefined}
          onClose={() => setShowAIAssistant(false)}
        />
      )}
    </div>
  )
}
