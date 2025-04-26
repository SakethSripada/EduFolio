"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { PlusCircle, Edit, Trash2, Save, Sparkles, Loader2, History, Info, ChevronUp, ChevronDown, ExternalLink, FolderPlus, Folder, FolderOpen, MoveRight, ArrowLeft, Copy, ChevronRight } from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { handleSupabaseError } from "@/lib/supabase"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"
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
import AIAssistant from "@/components/ai/AIAssistant"
import { RequiredLabel } from "@/components/ui/required-label"
import { FormErrorSummary } from "@/components/ui/form-error-summary"
import { NumericInput } from "@/components/ui/numeric-input"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb"

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
  external_link: string | null
  folder_id: string | null
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

type EssayFolder = {
  id: string
  name: string
  description: string | null
  parent_folder_id: string | null
  college_id: string | null
  created_at: string
}

// Recursive component for rendering folders hierarchically
const FolderItem = ({ 
  folder, 
  folders, 
  selectedFolder, 
  setSelectedFolder, 
  level = 0 
}: { 
  folder: EssayFolder, 
  folders: EssayFolder[], 
  selectedFolder: string | null, 
  setSelectedFolder: (id: string | null) => void,
  level?: number 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = folders.some(f => f.parent_folder_id === folder.id);
  const childFolders = folders.filter(f => f.parent_folder_id === folder.id);
  
  return (
    <div className="ml-0">
      <div 
        className={`p-2 rounded-md cursor-pointer hover:bg-secondary flex items-center gap-2 ${selectedFolder === folder.id ? 'bg-secondary' : ''}`}
        onClick={() => setSelectedFolder(folder.id)}
        style={{ paddingLeft: `${(level * 12) + 8}px` }}
      >
        {hasChildren ? (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-5 w-5 p-0" 
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        ) : (
          <div className="w-5" /> // Spacer for alignment
        )}
        <Folder className="h-4 w-4" />
        <span className="text-sm">{folder.name}</span>
      </div>
      
      {isExpanded && childFolders.length > 0 && (
        <div>
          {childFolders.map(childFolder => (
            <FolderItem
              key={childFolder.id}
              folder={childFolder}
              folders={folders}
              selectedFolder={selectedFolder}
              setSelectedFolder={setSelectedFolder}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

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
    external_link: "",
  })
  const [editingEssay, setEditingEssay] = useState<number | null>(null)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [selectedEssay, setSelectedEssay] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showVersionHistory, setShowVersionHistory] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [idCounter, setIdCounter] = useState(0)
  const [aiAction, setAiAction] = useState<"feedback" | "grammar" | "rephrase" | null>(null)
  const [collapsedEssays, setCollapsedEssays] = useState<Record<string, boolean>>({})
  const [selectedDefaultPrompt, setSelectedDefaultPrompt] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = createClientComponentClient<Database>()

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

  // Add state for adding external essay
  const [isAddingExternalEssay, setIsAddingExternalEssay] = useState(false)
  const [externalEssay, setExternalEssay] = useState({
    title: "",
    prompt: "",
    external_link: "",
    status: "Draft",
    is_common_app: false
  })

  // Add state variable to track which essay details we're editing
  const [editingEssayDetails, setEditingEssayDetails] = useState<string | null>(null)
  // Add state to track if essay is being saved
  const [savingEssay, setSavingEssay] = useState<string | null>(null)
  // Add a state for initializing collapsedEssays only once
  const [didInitCollapse, setDidInitCollapse] = useState(false)

  // Add state for folders
  const [folders, setFolders] = useState<EssayFolder[]>([])
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [isAddingFolder, setIsAddingFolder] = useState(false)
  const [isMovingEssay, setIsMovingEssay] = useState<string | null>(null)
  const [newFolder, setNewFolder] = useState({
    name: "",
    description: "",
  })
  const [folderNavStack, setFolderNavStack] = useState<EssayFolder[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null)
  const [confirmDeleteFolder, setConfirmDeleteFolder] = useState<string | null>(null)

  // Common App personal statement prompts
  const commonAppPrompts = [
    "Some students have a background, identity, interest, or talent that is so meaningful they believe their application would be incomplete without it. If this sounds like you, then please share your story.",
    "The lessons we take from obstacles we encounter can be fundamental to later success. Recount a time when you faced a challenge, setback, or failure. How did it affect you, and what did you learn from the experience?",
    "Reflect on a time when you questioned or challenged a belief or idea. What prompted your thinking? What was the outcome?",
    "Reflect on something that someone has done for you that has made you happy or thankful in a surprising way. How has this gratitude affected or motivated you?",
    "Discuss an accomplishment, event, or realization that sparked a period of personal growth and a new understanding of yourself or others.",
    "Describe a topic, idea, or concept you find so engaging that it makes you lose all track of time. Why does it captivate you? What or who do you turn to when you want to learn more?",
    "Share an essay on any topic of your choice. It can be one you've already written, one that responds to a different prompt, or one of your own design."
  ]

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
          // Fetch essays
          const { data: essaysData, error: essaysError } = await supabase
            .from("essays")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })

          if (essaysError) throw essaysError

          // Fetch folders
          const { data: foldersData, error: foldersError } = await supabase
            .from("essay_folders")
            .select("*")
            .eq("user_id", user.id)
            .is("college_id", null)
            .order("created_at", { ascending: false })

          if (foldersError) throw foldersError

          // Fetch versions for each essay if essays exist
          const versionsMap: Record<string, EssayVersion[]> = {}
          if (essaysData && essaysData.length > 0) {
            const versionsPromises = essaysData.map((essay) =>
              supabase
                .from("essay_versions")
                .select("*")
                .eq("essay_id", essay.id)
                .order("created_at", { ascending: false })
                .limit(MAX_VERSIONS_PER_ESSAY)
            )

            const versionsResults = await Promise.all(versionsPromises)

            // Process and clean up existing versions
            for (let i = 0; i < versionsResults.length; i++) {
              const result = versionsResults[i];
              if (!result.error && result.data) {
                const essayId = essaysData[i].id;
                versionsMap[essayId] = result.data;
                
                // Check if we need to clean up old versions in the database
                if (result.data.length >= MAX_VERSIONS_PER_ESSAY) {
                  await cleanupExistingVersions(essayId, result.data);
                }
              }
            }
          }

          return { 
            essays: essaysData || [], 
            versions: versionsMap,
            folders: foldersData || []
          }
        },
        setIsLoading,
        (data) => {
          // Filter essays based on current folder
          const filtered = currentFolderId ? 
            data.essays.filter((essay: Essay) => essay.folder_id === currentFolderId) : 
            data.essays.filter((essay: Essay) => !essay.folder_id);
          
          setEssays(filtered)
          setFolders(data.folders)
          setEssayVersions(data.versions)
          
          // Initialize the lastSavedContent and lastVersionTimestamp from loaded data
          const initialSavedContent: Record<string, string> = {};
          const initialVersionTimestamp: Record<string, number> = {};
          
          data.essays.forEach((essay: Essay) => {
            initialSavedContent[essay.id] = essay.content;
            
            // Find the latest version timestamp for each essay
            if (data.versions[essay.id]?.length > 0) {
              const latestVersion = data.versions[essay.id][0]; // First is the latest due to ordering
              initialVersionTimestamp[essay.id] = new Date(latestVersion.created_at).getTime();
            }
          });
          
          setLastSavedContent(initialSavedContent);
          setLastVersionTimestamp(initialVersionTimestamp);
        },
        (error) => {
          toast({
            title: "Error loading essays and folders",
            description: handleSupabaseError(error, "There was a problem loading your essays and folders."),
            variant: "destructive",
          })
        },
      )
    }

    fetchData()
  }, [user, toast, MAX_VERSIONS_PER_ESSAY, currentFolderId])

  // New function to clean up versions in the database during initial load
  const cleanupExistingVersions = async (essayId: string, existingVersions: EssayVersion[]) => {
    if (!user || existingVersions.length <= MAX_VERSIONS_PER_ESSAY) return;
    
    try {
      // Get all versions for this essay to ensure we have the complete list
      const { data, error } = await supabase
        .from("essay_versions")
        .select("*")
        .eq("essay_id", essayId)
        .order("created_at", { ascending: false });
      
      if (error || !data || data.length <= MAX_VERSIONS_PER_ESSAY) return;
      
      // Keep the MAX_VERSIONS_PER_ESSAY most recent versions
      const versionsToKeep = data.slice(0, MAX_VERSIONS_PER_ESSAY);
      const keepIds = versionsToKeep.map(v => v.id);
      
      // Delete all other versions
      if (keepIds.length > 0) {
        // Get versions to delete (all except the ones we want to keep)
        const { data: toDelete, error: fetchError } = await supabase
          .from("essay_versions")
          .select("id")
          .eq("essay_id", essayId)
          .not("id", "in", keepIds);
        
        if (fetchError || !toDelete || toDelete.length === 0) {
          return;
        }
        
        const idsToDelete = toDelete.map(v => v.id);
        
        const { error: deleteError } = await supabase
          .from("essay_versions")
          .delete()
          .in("id", idsToDelete);
        
        if (deleteError) {
          console.error("Error cleaning up existing versions:", deleteError);
          return;
        }
        
        console.log(`Cleaned up ${idsToDelete.length} old versions during initial load for essay ${essayId}`);
      }
    } catch (error) {
      console.error("Error in cleanupExistingVersions:", error);
    }
  }

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
    if (!user) return
    
    setFormSubmitted(true)
    
    if (!validateEssayForm()) {
      return
    }

    performDatabaseOperation(
      async () => {
        const { data, error } = await supabase
          .from("essays")
          .insert([
            {
              user_id: user.id,
              title: newEssay.title.trim(),
              prompt: newEssay.prompt.trim(),
              content: newEssay.content,
              word_count: calculateWordCount(newEssay.content),
              character_count: calculateCharacterCount(newEssay.content),
              target_word_count: newEssay.target_word_count ? parseInt(newEssay.target_word_count) : null,
              last_edited: new Date().toISOString(),
              is_common_app: newEssay.is_common_app,
              status: newEssay.status,
              external_link: newEssay.external_link || null,
              folder_id: currentFolderId,
            },
          ])
          .select()

        if (error) throw error
        
        // Create an initial version of the essay if it has content
        if (data && data[0] && newEssay.content.trim()) {
          const { error: versionError } = await supabase
            .from("essay_versions")
            .insert([
              {
                essay_id: data[0].id,
                content: newEssay.content,
                word_count: calculateWordCount(newEssay.content),
                character_count: calculateCharacterCount(newEssay.content),
                version_name: "Initial Version",
              },
            ])
  
          if (versionError) throw versionError
        }

        return data
      },
      setIsLoading,
      (data) => {
        if (data && data[0]) {
          setEssays([data[0], ...essays])
          // Add this essay to last saved content
          setLastSavedContent({
            ...lastSavedContent,
            [data[0].id]: data[0].content
          });
        }
        setNewFolder({
          name: "",
          description: "",
        });
        setNewEssay({
          title: "",
          prompt: "",
          content: "",
          target_word_count: "",
          is_common_app: false,
          status: "Draft",
          external_link: "",
        })
        setFormSubmitted(false)

        toast({
          title: "Essay added",
          description: "Your essay has been added successfully.",
        })
      },
      (error) => {
        toast({
          title: "Error adding essay",
          description: handleSupabaseError(error, "There was a problem adding the essay."),
          variant: "destructive",
        })
      },
    )
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
    debounce(async (essay: any, content: string, showToast: boolean) => {
      saveEssayContent(essay, content, showToast);
    }, SAVE_DEBOUNCE_DELAY)
  ).current;

  // Add a new function to save the essay content to the database
  const saveEssayContent = async (essay: any, content: string, showToast: boolean = false) => {
    if (!user) return Promise.resolve(); // Return resolved promise if no user

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

      if (showToast) {
        toast({
          title: "Essay updated",
          description: "Your essay has been updated successfully.",
        })
      }
      
      return Promise.resolve(); // Return resolved promise on success
    } catch (error) {
      console.error("Error updating essay:", error)
      toast({
        title: "Error updating essay",
        description: handleSupabaseError(error, "There was a problem updating the essay."),
        variant: "destructive",
      })
      
      return Promise.reject(error); // Return rejected promise on error
    }
  }

  // Add a new function to handle the change in the essay content
  const handleEssayContentChange = (content: string) => {
    setEssayContent(content)
  }

  // Add a new function to handle the save essay content
  const handleSaveEssayContent = (essay: any, content: string, showToast: boolean = false): Promise<void> => {
    if (showToast) {
      // For manual saves, don't use debounce
      return saveEssayContent(essay, content, showToast);
    } else {
      // For auto-saves, use debounce - this doesn't return a Promise directly
      debouncedSaveEssayContent(essay, content, showToast);
      // Return a resolved promise anyway so we can chain
      return Promise.resolve();
    }
    // NEVER set editingEssay to null here - this keeps the editor open
  }

  // Add a new function to handle save and exit
  const handleSaveAndExit = (essay: any, content: string) => {
    // First save the content (don't use debounce for this, we want immediate saving)
    saveEssayContent(essay, content, true).then(() => {
      // After saving completes, close the editor by setting editingEssay to null
      setEditingEssay(null);
      
      // Collapse the essay card if it exists in our state
      if (essay && essay.id) {
        setCollapsedEssays(prev => ({
          ...prev,
          [essay.id]: true
        }));
      }
    }).catch(error => {
      console.error("Error in handleSaveAndExit:", error);
      // Still close the editor even if there was an error saving
      setEditingEssay(null);
    });
  }

  // AI feedback function - opens AI assistant with feedback prompt
  const getAiFeedback = (essay: any) => {
    setSelectedEssay(essay);
    setAiAction("feedback");
    setShowAIAssistant(true);
  }

  // AI grammar check function - opens AI assistant with grammar checking prompt
  const checkGrammarWithAi = (essay: any) => {
    setSelectedEssay(essay);
    setAiAction("grammar");
    setShowAIAssistant(true);
  }

  // AI rephrase function - opens AI assistant with rephrasing prompt
  const rephraseWithAi = (essay: any) => {
    setSelectedEssay(essay);
    setAiAction("rephrase");
    setShowAIAssistant(true);
  }

  // General AI assistant without specific function
  const openAIAssistant = () => {
    setSelectedEssay(null);
    setAiAction(null);
    setShowAIAssistant(true);
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
      
      // Get versions to keep and to delete
      const versionsToKeep = sortedVersions.slice(0, MAX_VERSIONS_PER_ESSAY);
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
        updatedVersions[essayId] = versionsToKeep;
        setEssayVersions(updatedVersions);
        
        console.log(`Cleaned up ${versionIdsToDelete.length} old versions for essay ${essayId}`);
      }
    } catch (error) {
      console.error("Error cleaning up old versions:", error);
    }
  }

  // Add a new function to manually clean up versions
  const manualCleanupVersions = async (essayId: string) => {
    if (!user || !essayId) return;
    
    setIsLoading(true);
    try {
      // Get all versions for this essay
      const { data, error } = await supabase
        .from("essay_versions")
        .select("*")
        .eq("essay_id", essayId)
        .order("created_at", { ascending: false });
      
      if (error || !data || data.length <= MAX_VERSIONS_PER_ESSAY) {
        setIsLoading(false);
        if (data && data.length <= MAX_VERSIONS_PER_ESSAY) {
          toast({
            title: "No cleanup needed",
            description: `You already have ${data.length} versions, which is within the maximum limit of ${MAX_VERSIONS_PER_ESSAY}.`,
          });
        }
        return;
      }
      
      // Use the cleanupOldVersions function
      await cleanupOldVersions(essayId, data);
      
      toast({
        title: "Version history cleaned up",
        description: `Kept the ${MAX_VERSIONS_PER_ESSAY} most recent versions for this essay.`,
      });
    } catch (error) {
      console.error("Error cleaning up versions:", error);
      toast({
        title: "Error cleaning up versions",
        description: handleSupabaseError(error, "There was a problem cleaning up the versions."),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addExternalEssay = async () => {
    if (!user) return
    
    setFormSubmitted(true)

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

    performDatabaseOperation(
      async () => {
        const { data, error } = await supabase
          .from("essays")
          .insert([
            {
              user_id: user.id,
              title: externalEssay.title.trim(),
              prompt: externalEssay.prompt.trim(),
              content: "",
              word_count: 0,
              character_count: 0,
              target_word_count: null,
              last_edited: new Date().toISOString(),
              status: externalEssay.status,
              is_common_app: externalEssay.is_common_app,
              external_link: externalEssay.external_link.trim(),
            },
          ])
          .select()

        if (error) throw error
        return data
      },
      setIsLoading,
      (data) => {
        if (data && data[0]) {
          setEssays([data[0], ...essays])
          // Add this essay to last saved content
          setLastSavedContent({
            ...lastSavedContent,
            [data[0].id]: ""
          });
        }
        setExternalEssay({
          title: "",
          prompt: "",
          external_link: "",
          status: "Draft",
          is_common_app: false
        })
        setIsAddingExternalEssay(false)
        setFormSubmitted(false)

        toast({
          title: "External essay added",
          description: "Your linked essay has been added successfully.",
        })
      },
      (error) => {
        toast({
          title: "Error adding external essay",
          description: handleSupabaseError(error, "There was a problem adding the external essay link."),
          variant: "destructive",
        })
      },
    )
  }

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
        setCollapsedEssays((prev) => ({
          ...prev,
          [essayId]: false, // Ensure the edited essay is expanded
        }));
      }
    }
  }, [editingEssay, essays]);

  // Function to get readable prompt name for the dropdown
  const getPromptName = (index: number): string => {
    const truncatedPrompts = [
      "Background, identity, interest, or talent",
      "Lessons from obstacles, challenges, or failure",
      "Questioned or challenged a belief or idea",
      "Gratitude for something done for you",
      "Accomplishment that sparked personal growth",
      "Topic or concept that makes you lose track of time",
      "Essay on topic of your choice"
    ]
    
    return `Prompt #${index + 1}: ${truncatedPrompts[index]}`
  }
  
  // Handle selecting a default prompt
  const handleSelectDefaultPrompt = (promptIndex: number) => {
    const selectedPrompt = commonAppPrompts[promptIndex]
    setSelectedDefaultPrompt(selectedPrompt)
    setNewEssay({
      ...newEssay,
      prompt: selectedPrompt,
      title: "Common App Personal Statement",
      target_word_count: "650", // Common App essays typically have a 650-word limit
      is_common_app: true
    })
  }

  // Function to get folder breadcrumb path
  const getFolderPath = async (folderId: string): Promise<EssayFolder[]> => {
    const path: EssayFolder[] = [];
    let currentId: string | null = folderId;
    
    while (currentId) {
      const folder = folders.find(f => f.id === currentId);
      if (folder) {
        path.unshift(folder);
        currentId = folder.parent_folder_id;
      } else {
        // If folder not in state, fetch it from database
        const { data, error } = await supabase
          .from("essay_folders")
          .select("*")
          .eq("id", currentId)
          .single();
        
        if (error || !data) break;
        
        const typedFolderData = data as EssayFolder;
        path.unshift(typedFolderData);
        currentId = typedFolderData.parent_folder_id;
      }
    }
    
    return path;
  }

  // Function to navigate to a folder
  const navigateToFolder = async (folderId: string | null) => {
    setCurrentFolderId(folderId);
    
    if (folderId) {
      const path = await getFolderPath(folderId);
      setFolderNavStack(path);
    } else {
      setFolderNavStack([]);
    }
  }

  // Function to add a new folder
  const addFolder = async () => {
    if (!user) return
    
    if (!newFolder.name.trim()) {
      toast({
        title: "Folder name required",
        description: "Please enter a name for your folder.",
        variant: "destructive",
      })
      return
    }
    
    performDatabaseOperation(
      async () => {
        const { data, error } = await supabase
          .from("essay_folders")
          .insert([
            {
              user_id: user.id,
              name: newFolder.name.trim(),
              description: newFolder.description.trim() || null,
              parent_folder_id: currentFolderId,
              college_id: null,
            },
          ])
          .select()

        if (error) throw error
        return data
      },
      setIsLoading,
      (data) => {
        if (data && data[0]) {
          setFolders([data[0], ...folders])
          setNewFolder({
            name: "",
            description: "",
          })
          setIsAddingFolder(false)

          toast({
            title: "Folder added",
            description: "Your folder has been added successfully.",
          })
        }
      },
      (error) => {
        toast({
          title: "Error adding folder",
          description: handleSupabaseError(error, "There was a problem adding the folder."),
          variant: "destructive",
        })
      },
    )
  }

  // Function to delete a folder
  const deleteFolder = async (folderId: string) => {
    if (!user) return
    
    performDatabaseOperation(
      async () => {
        // First check if folder has essays or subfolders
        const { data: folderEssays, error: folderEssaysError } = await supabase
          .from("essays")
          .select("id")
          .eq("folder_id", folderId)
          .limit(1)
        
        if (folderEssaysError) throw folderEssaysError
        
        const { data: subfolders, error: subfoldersError } = await supabase
          .from("essay_folders")
          .select("id")
          .eq("parent_folder_id", folderId)
          .limit(1)
          
        if (subfoldersError) throw subfoldersError
        
        if ((folderEssays && folderEssays.length > 0) || (subfolders && subfolders.length > 0)) {
          throw new Error("FOLDER_NOT_EMPTY")
        }
        
        // If folder is empty, delete it
        const { error } = await supabase
          .from("essay_folders")
          .delete()
          .eq("id", folderId)

        if (error) throw error
        return { success: true }
      },
      setIsLoading,
      () => {
        setFolders(folders.filter(folder => folder.id !== folderId))
        setConfirmDeleteFolder(null)
        
        // If we deleted the current folder, navigate back to Home
        if (currentFolderId === folderId) {
          navigateToFolder(null)
        }
        
        toast({
          title: "Folder deleted",
          description: "Your folder has been deleted successfully.",
        })
      },
      (error) => {
        if (error.message === "FOLDER_NOT_EMPTY") {
          toast({
            title: "Folder not empty",
            description: "Please remove all essays and subfolders before deleting this folder.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Error deleting folder",
            description: handleSupabaseError(error, "There was a problem deleting the folder."),
            variant: "destructive",
          })
        }
      },
    )
  }

  // Function to update a folder
  const updateFolder = async (folderId: string) => {
    if (!user) return
    
    if (!newFolder.name.trim()) {
      toast({
        title: "Folder name required",
        description: "Please enter a name for your folder.",
        variant: "destructive",
      })
      return
    }
    
    performDatabaseOperation(
      async () => {
        const { data, error } = await supabase
          .from("essay_folders")
          .update({
            name: newFolder.name.trim(),
            description: newFolder.description.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", folderId)
          .select()

        if (error) throw error
        return data
      },
      setIsLoading,
      (data) => {
        if (data && data[0]) {
          setFolders(folders.map(folder => folder.id === folderId ? data[0] : folder))
          setNewFolder({
            name: "",
            description: "",
          })
          setEditingFolderId(null)

          // Update breadcrumb path if needed
          if (folderNavStack.some(folder => folder.id === folderId)) {
            navigateToFolder(currentFolderId)
          }

          toast({
            title: "Folder updated",
            description: "Your folder has been updated successfully.",
          })
        }
      },
      (error) => {
        toast({
          title: "Error updating folder",
          description: handleSupabaseError(error, "There was a problem updating the folder."),
          variant: "destructive",
        })
      },
    )
  }

  // Function to move an essay to a folder
  const moveEssayToFolder = async (essayId: string, targetFolderId: string | null) => {
    if (!user) return
    
    performDatabaseOperation(
      async () => {
        const { data, error } = await supabase
          .from("essays")
          .update({
            folder_id: targetFolderId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", essayId)
          .select()

        if (error) throw error
        return data
      },
      setIsLoading,
      (data) => {
        if (data && data[0]) {
          // Update the essays list
          const essayIndex = essays.findIndex(e => e.id === essayId);
          
          if (essayIndex !== -1) {
            // If current view matches the target folder, update the essay
            if ((currentFolderId === targetFolderId) || (!currentFolderId && !targetFolderId)) {
              const updatedEssays = [...essays];
              updatedEssays[essayIndex] = data[0];
              setEssays(updatedEssays);
            } else {
              // Otherwise, remove it from current view
              setEssays(essays.filter(e => e.id !== essayId));
            }
          } else if ((currentFolderId === targetFolderId) || (!currentFolderId && !targetFolderId)) {
            // If the essay wasn't in the current view but should be now, add it
            setEssays([data[0], ...essays]);
          }
          
          setIsMovingEssay(null);
          setSelectedFolder(null);
          
          toast({
            title: "Essay moved",
            description: "Your essay has been moved successfully.",
          })
        }
      },
      (error) => {
        toast({
          title: "Error moving essay",
          description: handleSupabaseError(error, "There was a problem moving the essay."),
          variant: "destructive",
        })
      },
    )
  }

  // Function to duplicate an essay
  const duplicateEssay = async (essayId: string) => {
    if (!user) return
    
    performDatabaseOperation(
      async () => {
        // First get the essay to duplicate
        const { data: sourceEssay, error: fetchError } = await supabase
          .from("essays")
          .select("*")
          .eq("id", essayId)
          .single()
        
        if (fetchError) throw fetchError
        if (!sourceEssay) throw new Error("Essay not found")
        
        // Now insert a new essay with the same data
        const { data: newEssay, error: insertError } = await supabase
          .from("essays")
          .insert([
            {
              user_id: user.id,
              title: `${sourceEssay.title} (Copy)`,
              prompt: sourceEssay.prompt,
              content: sourceEssay.content,
              word_count: sourceEssay.word_count,
              character_count: sourceEssay.character_count,
              target_word_count: sourceEssay.target_word_count,
              last_edited: new Date().toISOString(),
              status: sourceEssay.status,
              external_link: sourceEssay.external_link,
              folder_id: sourceEssay.folder_id, // Keep it in the same folder
              is_common_app: sourceEssay.is_common_app,
              college_id: sourceEssay.college_id,
            }
          ])
          .select()
        
        if (insertError) throw insertError
        return newEssay
      },
      setIsLoading,
      (data) => {
        if (data && data[0]) {
          // Add the new essay to the current view if it belongs there
          if ((currentFolderId === data[0].folder_id) || 
              (!currentFolderId && !data[0].folder_id)) {
            setEssays([data[0], ...essays])
          }
          
          toast({
            title: "Essay duplicated",
            description: "Your essay has been duplicated successfully.",
          })
        }
      },
      (error) => {
        toast({
          title: "Error duplicating essay",
          description: handleSupabaseError(error, "There was a problem duplicating the essay."),
          variant: "destructive",
        })
      }
    )
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
        <h2 className="text-2xl font-semibold mb-4 sm:mb-0">Your Essays</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2" onClick={() => openAIAssistant()}>
            <Sparkles className="h-4 w-4" /> AI Assistant
          </Button>
          <Button variant="outline" className="flex items-center gap-2" onClick={() => setIsAddingExternalEssay(true)}>
            <ExternalLink className="h-4 w-4" /> Add External Essay
          </Button>
          <Button variant="outline" className="flex items-center gap-2" onClick={() => setIsAddingFolder(true)}>
            <FolderPlus className="h-4 w-4" /> Add Folder
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" /> Add Essay
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Essay</DialogTitle>
              </DialogHeader>
              
              <FormErrorSummary errors={formErrors} show={formSubmitted} />
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <RequiredLabel htmlFor="title">Essay Title</RequiredLabel>
                  <Input
                    id="title"
                    value={newEssay.title}
                    onChange={(e) => setNewEssay({ ...newEssay, title: e.target.value })}
                    placeholder="e.g., Common App Personal Statement"
                  />
                  {formErrors.title && <p className="text-xs text-destructive">{formErrors.title}</p>}
                </div>
                <div className="grid gap-2">
                  <RequiredLabel htmlFor="prompt">Essay Prompt</RequiredLabel>
                  <Textarea
                    id="prompt"
                    value={newEssay.prompt}
                    onChange={(e) => setNewEssay({ ...newEssay, prompt: e.target.value })}
                    placeholder="Enter the essay prompt or question..."
                  />
                  {formErrors.prompt && <p className="text-xs text-destructive">{formErrors.prompt}</p>}
                </div>
                <div className="grid gap-2">
                  <Label>Use Common App Prompt</Label>
                  <Select 
                    value={selectedDefaultPrompt || "custom_prompt"} 
                    onValueChange={(value) => {
                      if (value === "custom_prompt") {
                        setSelectedDefaultPrompt(null)
                        setNewEssay({ ...newEssay, is_common_app: false })
                        return
                      }
                      const index = commonAppPrompts.findIndex(prompt => prompt === value)
                      if (index !== -1) {
                        handleSelectDefaultPrompt(index)
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a Common App prompt (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom_prompt">Custom Prompt</SelectItem>
                      {commonAppPrompts.map((prompt, index) => (
                        <SelectItem key={index} value={prompt}>
                          {getPromptName(index)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    These are the 2023-2024 Common App personal statement prompts
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="targetWordCount">Target Word Count (Optional)</Label>
                  <NumericInput
                    id="targetWordCount"
                    min={0}
                    value={newEssay.target_word_count === "" ? null : parseFloat(newEssay.target_word_count)}
                    onChange={(value) => setNewEssay({ ...newEssay, target_word_count: value === null ? "" : value.toString() })}
                    placeholder="e.g., 650 for Common App"
                  />
                  {formErrors.target_word_count && <p className="text-xs text-destructive">{formErrors.target_word_count}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    defaultValue={newEssay.status}
                    onValueChange={(value) => setNewEssay({ ...newEssay, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Reviewing">Reviewing</SelectItem>
                      <SelectItem value="Complete">Complete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="isCommonApp"
                      checked={newEssay.is_common_app}
                      onCheckedChange={(checked) => setNewEssay({ ...newEssay, is_common_app: !!checked })}
                    />
                    <Label htmlFor="isCommonApp">This is a Common App essay</Label>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="externalLink">External Link (Optional)</Label>
                  <Input
                    id="externalLink"
                    type="url"
                    placeholder="e.g. https://docs.google.com/document/d/..."
                    value={newEssay.external_link}
                    onChange={(e) => setNewEssay({ ...newEssay, external_link: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Add a link to an external document (Google Docs, Microsoft Word, etc.)
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="content">Initial Content (Optional)</Label>
                  <Textarea
                    id="content"
                    rows={8}
                    value={newEssay.content}
                    onChange={(e) => setNewEssay({ ...newEssay, content: e.target.value })}
                    placeholder="Start writing your essay here..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setFormSubmitted(false);
                  setFormErrors({});
                  setNewEssay({
                    title: "",
                    prompt: "",
                    content: "",
                    target_word_count: "",
                    is_common_app: false,
                    status: "Draft",
                    external_link: "",
                  });
                  setSelectedDefaultPrompt(null);
                }} className="mr-2">
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
        </div>
      </div>

      {/* Breadcrumb navigation */}
      {folderNavStack.length > 0 && (
        <div className="flex items-center mb-4">
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => navigateToFolder(null)} className="cursor-pointer">
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              {folderNavStack.map((folder, index) => (
                <React.Fragment key={folder.id}>
                  {index < folderNavStack.length - 1 ? (
                    <>
                      <BreadcrumbItem>
                        <BreadcrumbLink 
                          onClick={() => navigateToFolder(folder.id)} 
                          className="cursor-pointer"
                        >
                          {folder.name}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                    </>
                  ) : (
                    <BreadcrumbItem>
                      <span className="font-medium">{folder.name}</span>
                    </BreadcrumbItem>
                  )}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      )}

      {/* Folders grid */}
      {folders.filter(folder => folder.parent_folder_id === currentFolderId).length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {folders
            .filter(folder => folder.parent_folder_id === currentFolderId)
            .map(folder => (
              <Card 
                key={folder.id} 
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => navigateToFolder(folder.id)}
              >
                <CardHeader className="p-4 flex flex-row items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-amber-500" />
                  <div>
                    <CardTitle className="text-base">{folder.name}</CardTitle>
                    {folder.description && (
                      <CardDescription className="text-xs line-clamp-1">
                        {folder.description}
                      </CardDescription>
                    )}
                  </div>
                </CardHeader>
                <CardFooter className="p-2 border-t bg-muted/20 flex justify-end">
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingFolderId(folder.id);
                        setNewFolder({
                          name: folder.name,
                          description: folder.description || "",
                        });
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDeleteFolder(folder.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
        </div>
      )}

      {/* If in a folder and there are no essays, show empty message */}
      {essays.length === 0 && folders.filter(folder => folder.parent_folder_id === currentFolderId).length === 0 ? (
        <div className="text-center text-muted-foreground py-12 border rounded-md">
          {currentFolderId ? "This folder is empty" : "No essays added yet"}
        </div>
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
                        {essay.is_common_app && (
                          <Badge className="bg-blue-500">Common App</Badge>
                        )}
                        {getStatusBadge(essay.status)}
                      </CardTitle>
                      <div className="flex items-center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            setIsMovingEssay(essay.id);
                            setSelectedFolder(essay.folder_id);
                          }}
                          className="gap-1"
                        >
                          <MoveRight className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => duplicateEssay(essay.id)}
                          className="gap-1"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setEditingEssayDetails(essay.id)}
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
                      <div 
                        className="prose prose-sm max-w-none dark:text-foreground"
                        dangerouslySetInnerHTML={{ __html: renderSafeHTML(essay.content || "") }}
                      />
                    )}
                  </CardContent>
                
                  <CardFooter className="flex flex-wrap justify-end gap-2 p-4 border-t bg-muted/20">
                    {editingEssay === index ? (
                      <Button onClick={() => {
                        // Save without closing editor
                        handleSaveEssayContent(essay, essayContent, true)
                        // Do NOT set editingEssay to null here
                      }}>
                        <Save className="h-4 w-4 mr-2" /> Save Changes
                      </Button>
                    ) : (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            setIsMovingEssay(essay.id);
                            setSelectedFolder(essay.folder_id);
                          }}
                        >
                          <MoveRight className="h-4 w-4 mr-1" /> Move
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => duplicateEssay(essay.id)}
                        >
                          <Copy className="h-4 w-4 mr-1" /> Duplicate
                        </Button>
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setConfirmDeleteEssay(essay.id)}
                        >
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

      {/* Add Folder Dialog */}
      <Dialog open={isAddingFolder} onOpenChange={setIsAddingFolder}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Folder</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input
                id="folder-name"
                value={newFolder.name}
                onChange={(e) => setNewFolder({ ...newFolder, name: e.target.value })}
                placeholder="My Essays"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="folder-description">Description (Optional)</Label>
              <Textarea
                id="folder-description"
                value={newFolder.description}
                onChange={(e) => setNewFolder({ ...newFolder, description: e.target.value })}
                placeholder="A brief description of this folder..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingFolder(false)} className="mr-2">
              Cancel
            </Button>
            <Button onClick={addFolder} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                "Add Folder"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Folder Dialog */}
      <Dialog open={!!editingFolderId} onOpenChange={(open) => !open && setEditingFolderId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Folder</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-folder-name">Folder Name</Label>
              <Input
                id="edit-folder-name"
                value={newFolder.name}
                onChange={(e) => setNewFolder({ ...newFolder, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-folder-description">Description (Optional)</Label>
              <Textarea
                id="edit-folder-description"
                value={newFolder.description}
                onChange={(e) => setNewFolder({ ...newFolder, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingFolderId(null)} className="mr-2">
              Cancel
            </Button>
            <Button 
              onClick={() => editingFolderId && updateFolder(editingFolderId)} 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                "Update Folder"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Essay Dialog */}
      <Dialog open={!!isMovingEssay} onOpenChange={(open) => !open && setIsMovingEssay(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Move Essay to Folder</DialogTitle>
            <DialogDescription>
              Choose a destination folder for this essay
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="mb-4">
              <Label className="mb-2 block">Select Destination Folder</Label>
              <div className="max-h-[300px] overflow-y-auto space-y-2 border rounded-md p-2">
                <div 
                  className={`p-2 rounded-md cursor-pointer hover:bg-secondary flex items-center gap-2 ${selectedFolder === null ? 'bg-secondary' : ''}`}
                  onClick={() => setSelectedFolder(null)}
                >
                  <Folder className="h-4 w-4" />
                  <span>Home</span>
                </div>
                
                {/* Render Home-level folders */}
                {folders
                  .filter(folder => !folder.parent_folder_id)
                  .map(folder => (
                    <FolderItem
                      key={folder.id}
                      folder={folder}
                      folders={folders}
                      selectedFolder={selectedFolder}
                      setSelectedFolder={setSelectedFolder}
                    />
                  ))
                }
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMovingEssay(null)} className="mr-2">
              Cancel
            </Button>
            <Button 
              onClick={() => isMovingEssay && moveEssayToFolder(isMovingEssay, selectedFolder)} 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Moving...
                </>
              ) : (
                "Move Essay"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Deleting Folder */}
      <ConfirmationDialog
        open={!!confirmDeleteFolder}
        onOpenChange={(open) => !open && setConfirmDeleteFolder(null)}
        title="Delete Folder"
        description="Are you sure you want to delete this folder? This action cannot be undone."
        confirmText="Delete"
        onConfirm={() => {
          if (confirmDeleteFolder) {
            deleteFolder(confirmDeleteFolder)
          }
        }}
        variant="destructive"
      />

      {/* Confirmation Dialog for Deleting Essay */}
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