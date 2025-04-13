"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Edit, Trash2, Copy, Loader2, Save } from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { validateRequired } from "@/lib/validation"

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
  })
  const [isAddingEssay, setIsAddingEssay] = useState(false)
  const [isEditingEssay, setIsEditingEssay] = useState(false)
  const [editingEssayId, setEditingEssayId] = useState<string | null>(null)
  const [isImportingEssays, setIsImportingEssays] = useState(false)
  const [selectedEssays, setSelectedEssays] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const { user } = useAuth()
  const { toast } = useToast()

  // Add state for confirmation dialog
  const [confirmDeleteEssay, setConfirmDeleteEssay] = useState<string | null>(null)

  // Add a new state variable to store the essay content
  const [essayContent, setEssayContent] = useState<string>("")

  const [editingEssay, setEditingEssay] = useState<number | null>(null)

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

  const countWords = (text: string): number => {
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
            title: newEssay.title,
            prompt: newEssay.prompt,
            content: newEssay.content,
            word_count: countWords(newEssay.content),
            character_count: newEssay.content.length,
            target_word_count: newEssay.target_word_count || null,
            last_edited: new Date().toISOString(),
            status: newEssay.status || "Draft",
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
          title: newEssay.title,
          prompt: newEssay.prompt,
          content: newEssay.content,
          word_count: countWords(newEssay.content),
          character_count: newEssay.content.length,
          target_word_count: newEssay.target_word_count || null,
          last_edited: new Date().toISOString(),
          status: newEssay.status || "Draft",
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
              word_count: countWords(newEssay.content),
              character_count: newEssay.content.length,
              target_word_count: newEssay.target_word_count || null,
              last_edited: new Date().toISOString(),
              status: newEssay.status as string,
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
  const saveEssayContent = async (essay: any, content: string) => {
    if (!user) return

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

      // Update local state immediately after successful database update
      setEssays((prevEssays) =>
        prevEssays.map((e) =>
          e.id === essay.id
            ? {
                ...e,
                content: content,
                word_count: wordCount,
                character_count: charCount,
                last_edited: new Date().toLocaleDateString("en-US", {
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
    saveEssayContent(essay, content)
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
        <h2 className="text-2xl font-semibold">College-Specific Essays</h2>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-1" onClick={() => setIsImportingEssays(true)}>
            <Copy className="h-4 w-4" /> Import Essays
          </Button>
          <Button className="flex items-center gap-1" onClick={() => setIsAddingEssay(true)}>
            <PlusCircle className="h-4 w-4" /> Add Essay
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Essays for {collegeName}</CardTitle>
          <CardDescription>Essays you're writing for this specific college</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {essays.length === 0 ? (
              <div className="col-span-2 text-center text-muted-foreground py-6 border rounded-md">
                No essays added yet
              </div>
            ) : (
              essays.map((essay, index) => (
                <Card key={essay.id} className="overflow-hidden">
                  <CardHeader>
                    <CardTitle>{essay.prompt}</CardTitle>
                    <CardDescription>
                      Word Count: {essay.word_count} • Last Edited: {essay.last_edited}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-muted/50 rounded-md font-serif">
                      {editingEssay === index ? (
                        <Textarea
                          className="min-h-[200px] font-serif"
                          value={essayContent}
                          onChange={(e) => handleEssayContentChange(e.target.value)}
                        />
                      ) : (
                        essay.content || "Start writing your essay..."
                      )}
                    </div>
                  </CardContent>
                  <div className="px-6 py-2 bg-muted/50 flex justify-end space-x-2">
                    {editingEssay === index ? (
                      <Button
                        variant="default"
                        onClick={() => {
                          setEditingEssay(null)
                          handleSaveEssayContent(essay, essayContent)
                        }}
                      >
                        <Save className="h-4 w-4 mr-1" /> Save
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => {
                            startEditEssay(essay.id)
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
                  </div>
                </Card>
              ))
            )}
          </div>
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
              <Input
                id="targetWordCount"
                type="number"
                value={newEssay.target_word_count || ""}
                onChange={(e) =>
                  setNewEssay({ ...newEssay, target_word_count: e.target.value ? Number(e.target.value) : null })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newEssay.status || "Draft"}
                onChange={(e) => setNewEssay({ ...newEssay, status: e.target.value })}
              >
                <option value="Draft">Draft</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Complete">Complete</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Essay Content (Optional)</Label>
              <Textarea
                id="content"
                rows={8}
                value={newEssay.content || ""}
                onChange={(e) => setNewEssay({ ...newEssay, content: e.target.value })}
                placeholder="Start writing your essay here..."
              />
            </div>
          </div>
          <DialogFooter>
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

      {/* Edit Essay Dialog */}
      <Dialog
        open={isEditingEssay}
        onOpenChange={(open) => {
          if (!open) {
            setIsEditingEssay(false)
            setEditingEssayId(null)
            setFormErrors({})
            setNewEssay({
              title: "",
              prompt: "",
              content: "",
              target_word_count: null,
              status: "Draft",
            })
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Essay for {collegeName}</DialogTitle>
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
              <Input
                id="targetWordCount"
                type="number"
                value={newEssay.target_word_count || ""}
                onChange={(e) =>
                  setNewEssay({ ...newEssay, target_word_count: e.target.value ? Number(e.target.value) : null })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newEssay.status || "Draft"}
                onChange={(e) => setNewEssay({ ...newEssay, status: e.target.value })}
              >
                <option value="Draft">Draft</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Complete">Complete</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Essay Content</Label>
              <Textarea
                id="content"
                rows={8}
                value={newEssay.content || ""}
                onChange={(e) => setNewEssay({ ...newEssay, content: e.target.value })}
                placeholder="Start writing your essay here..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={updateEssay} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Essays Dialog */}
      <Dialog open={isImportingEssays} onOpenChange={setIsImportingEssays}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
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
              <div className="space-y-4">
                {generalEssays.map((essay) => (
                  <div key={essay.id} className="flex items-start space-x-3 p-3 border rounded-md">
                    <input
                      type="checkbox"
                      checked={!!selectedEssays[essay.id]}
                      onChange={(e) => setSelectedEssays({ ...selectedEssays, [essay.id]: e.target.checked })}
                      className="h-4 w-4 mt-1 rounded border-gray-300"
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportingEssays(false)} disabled={isLoading}>
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
        confirmText={isLoading ? "Deleting..." : "Delete"}
        onConfirm={() => confirmDeleteEssay && deleteEssay(confirmDeleteEssay)}
        variant="destructive"
        disabled={isLoading}
      />
    </div>
  )
}
