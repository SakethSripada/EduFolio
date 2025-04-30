"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Edit, Trash2, Copy, Loader2, Sparkles } from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"
import { useToast } from "@/components/ui/use-toast"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { validateRequired } from "@/lib/validation"
import { handleSupabaseError } from "@/lib/supabase"
import AIAssistant from "@/components/ai/AIAssistant"
import { performDatabaseOperation } from "@/lib/utils"

type CollegeAwardsProps = {
  collegeId: string
}

type Award = {
  id: string
  title: string
  grade_level: string
  recognition_level: string
  date_received: string | null
  date_display: string | null
  description: string | null
  issuing_organization: string | null
}

export default function CollegeAwards({ collegeId }: CollegeAwardsProps) {
  const [awards, setAwards] = useState<Award[]>([])
  const [generalAwards, setGeneralAwards] = useState<Award[]>([])
  const [isAddingAward, setIsAddingAward] = useState(false)
  const [isEditingAward, setIsEditingAward] = useState(false)
  const [editingAwardId, setEditingAwardId] = useState<string | null>(null)
  const [isImportingAwards, setIsImportingAwards] = useState(false)
  const [selectedAwards, setSelectedAwards] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [confirmDeleteAward, setConfirmDeleteAward] = useState<string | null>(null)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [collegeName, setCollegeName] = useState<string>("")
  
  // Initialize form state
  const [newAward, setNewAward] = useState<Partial<Award>>({
    title: "",
    grade_level: "",
    recognition_level: "",
    date_display: "",
    description: "",
    issuing_organization: "",
  })
  
  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = createClientComponentClient<Database>()

  // Fetch data on component mount
  useEffect(() => {
    // Only run once we know who the user is and which college
    if (!user?.id || !collegeId) return
  
    setIsLoading(true)
    ;(async () => {
      try {
        // 1) College name
        const { data: col, error: colErr } = await supabase
          .from("colleges")
          .select("name")
          .eq("id", collegeId)
          .single()
        if (colErr) throw colErr
        if (col) setCollegeName(col.name)
  
        // 2) College‐specific awards
        const { data: ca, error: caErr } = await supabase
          .from("college_awards")
          .select("*")
          .eq("user_id", user.id)
          .eq("college_id", collegeId)
          .order("created_at", { ascending: false })
        if (caErr) throw caErr
  
        // 3) General awards for import
        const { data: ga, error: gaErr } = await supabase
          .from("awards")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
        if (gaErr) throw gaErr
  
        setAwards(ca || [])
        setGeneralAwards(ga || [])
      } catch (error) {
        toast({
          title: "Error loading awards",
          description: handleSupabaseError(error, "There was a problem loading your awards."),
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    })()
  }, [user?.id, collegeId])
  

  // Add award mutation
  const addAward = async () => {
    if (!user || !collegeId || !validateAwardForm()) return

    await performDatabaseOperation(
      async () => {
        const { data, error } = await supabase
          .from("college_awards")
          .insert([
            {
              user_id: user.id,
              college_id: collegeId,
              title: newAward.title,
              grade_level: newAward.grade_level,
              recognition_level: newAward.recognition_level,
              date_display: newAward.date_display || null,
              description: newAward.description || null,
              issuing_organization: newAward.issuing_organization || null,
            },
          ])
          .select()

        if (error) throw error
        return data
      },
      setIsLoading,
      (data) => {
        if (data && data[0]) {
          setAwards([data[0], ...awards])
          setNewAward({
            title: "",
            grade_level: "",
            recognition_level: "",
            date_display: "",
            description: "",
            issuing_organization: "",
          })
          
          // Use a timeout to ensure state updates don't conflict
          setTimeout(() => {
            setIsAddingAward(false)
          }, 0)

          toast({
            title: "Award added",
            description: "Your award has been added successfully.",
          })
        }
      },
      (error) => {
        toast({
          title: "Error adding award",
          description: handleSupabaseError(error, "There was a problem adding the award."),
          variant: "destructive",
        })
      },
    )
  }

  // Update award mutation
  const updateAward = async () => {
    if (!user || !collegeId || !editingAwardId || !validateAwardForm()) return

    await performDatabaseOperation(
      async () => {
        const { error } = await supabase
          .from("college_awards")
          .update({
            title: newAward.title,
            grade_level: newAward.grade_level,
            recognition_level: newAward.recognition_level,
            date_display: newAward.date_display || null,
            description: newAward.description || null,
            issuing_organization: newAward.issuing_organization || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingAwardId)
          .eq("college_id", collegeId)

        if (error) throw error
        return { success: true }
      },
      setIsLoading,
      () => {
        const updatedAwards = awards.map((award) => {
          if (award.id === editingAwardId) {
            return {
              ...award,
              title: newAward.title as string,
              grade_level: newAward.grade_level as string,
              recognition_level: newAward.recognition_level as string,
              date_display: newAward.date_display || null,
              description: newAward.description || null,
              issuing_organization: newAward.issuing_organization || null,
            }
          }
          return award
        });
        
        setAwards(updatedAwards);
        
        // Reset form first
        setNewAward({
          title: "",
          grade_level: "",
          recognition_level: "",
          date_display: "",
          description: "",
          issuing_organization: "",
        })
        
        // Use a timeout to ensure state updates don't conflict
        setTimeout(() => {
          setIsEditingAward(false)
          setEditingAwardId(null)
        }, 0)

        toast({
          title: "Award updated",
          description: "Your award has been updated successfully.",
        })
      },
      (error) => {
        toast({
          title: "Error updating award",
          description: handleSupabaseError(error, "There was a problem updating the award."),
          variant: "destructive",
        })
      },
    )
  }

  // Delete award mutation
  const deleteAward = async (awardId: string) => {
    if (!user || !collegeId) return

    await performDatabaseOperation(
      async () => {
        const { error } = await supabase
          .from("college_awards")
          .delete()
          .eq("id", awardId)
          .eq("college_id", collegeId)

        if (error) throw error
        return { success: true }
      },
      setIsLoading,
      () => {
        setAwards(awards.filter((award) => award.id !== awardId))
        setConfirmDeleteAward(null)
        toast({
          title: "Award deleted",
          description: "Your award has been deleted successfully.",
        })
      },
      (error) => {
        toast({
          title: "Error deleting award",
          description: handleSupabaseError(error, "There was a problem deleting the award."),
          variant: "destructive",
        })
      },
    )
  }

  // Import awards mutation
  const importAwards = async () => {
    if (!user || !collegeId) return

    const selectedAwardIds = Object.entries(selectedAwards)
      .filter(([_, isSelected]) => isSelected)
      .map(([id, _]) => id)

    if (selectedAwardIds.length === 0) {
      toast({
        title: "No awards selected",
        description: "Please select at least one award to import.",
        variant: "destructive",
      })
      return
    }

    await performDatabaseOperation(
      async () => {
        const awardsToImport = generalAwards.filter((award) => selectedAwardIds.includes(award.id))

        const awardsData = awardsToImport.map((award) => ({
          user_id: user.id,
          college_id: collegeId,
          title: award.title,
          grade_level: award.grade_level,
          recognition_level: award.recognition_level,
          date_received: award.date_received,
          date_display: award.date_display,
          description: award.description,
          issuing_organization: award.issuing_organization,
        }))

        const { data, error } = await supabase.from("college_awards").insert(awardsData).select()

        if (error) throw error
        return data
      },
      setIsLoading,
      (data) => {
        if (data) {
          setAwards([...data, ...awards])
          setSelectedAwards({})
          
          // Use a timeout to ensure state updates don't conflict
          setTimeout(() => {
            setIsImportingAwards(false)
          }, 0)

          toast({
            title: "Awards imported",
            description: `${data.length} award(s) have been imported successfully.`,
          })
        }
      },
      (error) => {
        toast({
          title: "Error importing awards",
          description: handleSupabaseError(error, "There was a problem importing the awards."),
          variant: "destructive",
        })
      },
    )
  }

  // Validate award form
  const validateAwardForm = (): boolean => {
    const errors: Record<string, string> = {}

    const titleError = validateRequired(newAward.title, "Award title")
    if (titleError) errors.title = titleError

    const gradeLevelError = validateRequired(newAward.grade_level, "Grade level")
    if (gradeLevelError) errors.grade_level = gradeLevelError

    const recognitionLevelError = validateRequired(newAward.recognition_level, "Recognition level")
    if (recognitionLevelError) errors.recognition_level = recognitionLevelError

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const startEditAward = (awardId: string) => {
    const awardToEdit = awards.find((a) => a.id === awardId)
    if (awardToEdit) {
      setNewAward({
        title: awardToEdit.title,
        grade_level: awardToEdit.grade_level,
        recognition_level: awardToEdit.recognition_level,
        date_display: awardToEdit.date_display || "",
        description: awardToEdit.description || "",
        issuing_organization: awardToEdit.issuing_organization || "",
      })
      setEditingAwardId(awardId)
      setIsEditingAward(true)
    }
  }

  const getRecognitionLevelBadge = (level: string) => {
    switch (level) {
      case "School":
        return <Badge className="bg-blue-100 text-blue-800">School</Badge>
      case "Regional":
        return <Badge className="bg-purple-100 text-purple-800">Regional</Badge>
      case "State":
        return <Badge className="bg-green-100 text-green-800">State</Badge>
      case "National":
        return <Badge className="bg-yellow-100 text-yellow-800">National</Badge>
      case "International":
        return <Badge className="bg-red-100 text-red-800">International</Badge>
      default:
        return <Badge variant="outline">{level}</Badge>
    }
  }

  // Cleanup function for mutations on component unmount
  useEffect(() => {
    return () => {
      // Cleanup any active mutations
    }
  }, [])

  const isLoadingOperations = isLoading

  if (isLoading && awards.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Add a simple function to open the AI Assistant without specific data
  const openAIAssistant = () => {
    setShowAIAssistant(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">{collegeName ? `${collegeName} Awards and Honors` : 'College Awards and Honors'}</h2>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2" onClick={() => openAIAssistant()}>
            <Sparkles className="h-4 w-4" /> AI Assistance
          </Button>
          <Button variant="outline" className="flex items-center gap-1" onClick={() => setIsImportingAwards(true)}>
            <Copy className="h-4 w-4" /> Import Awards
          </Button>
          <Button className="flex items-center gap-1" onClick={() => setIsAddingAward(true)}>
            <PlusCircle className="h-4 w-4" /> Add Award
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Award Title</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Grade Level</TableHead>
                  <TableHead>Recognition Level</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {awards.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                      No awards added yet
                    </TableCell>
                  </TableRow>
                ) : (
                  awards.map((award) => (
                    <TableRow key={award.id}>
                      <TableCell>{award.title}</TableCell>
                      <TableCell>{award.issuing_organization || "—"}</TableCell>
                      <TableCell>{award.grade_level}</TableCell>
                      <TableCell>{getRecognitionLevelBadge(award.recognition_level)}</TableCell>
                      <TableCell>{award.date_display || "—"}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startEditAward(award.id)}
                            disabled={isLoading}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setConfirmDeleteAward(award.id)}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Award Dialog */}
      <Dialog
        open={isAddingAward}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddingAward(false)
            setFormErrors({})
            setNewAward({
              title: "",
              grade_level: "",
              recognition_level: "",
              date_display: "",
              description: "",
              issuing_organization: "",
            })
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Award</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Award Title</Label>
              <Input
                id="title"
                value={newAward.title || ""}
                onChange={(e) => setNewAward({ ...newAward, title: e.target.value })}
              />
              {formErrors.title && <p className="text-sm text-red-500">{formErrors.title}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="organization">Issuing Organization (Optional)</Label>
              <Input
                id="organization"
                value={newAward.issuing_organization || ""}
                onChange={(e) => setNewAward({ ...newAward, issuing_organization: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="gradeLevel">Grade Level</Label>
                <Select
                  value={newAward.grade_level || ""}
                  onValueChange={(value) => setNewAward({ ...newAward, grade_level: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9">9th Grade</SelectItem>
                    <SelectItem value="10">10th Grade</SelectItem>
                    <SelectItem value="11">11th Grade</SelectItem>
                    <SelectItem value="12">12th Grade</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.grade_level && <p className="text-sm text-red-500">{formErrors.grade_level}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="recognitionLevel">Recognition Level</Label>
                <Select
                  value={newAward.recognition_level || ""}
                  onValueChange={(value) => setNewAward({ ...newAward, recognition_level: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="School">School</SelectItem>
                    <SelectItem value="Regional">Regional</SelectItem>
                    <SelectItem value="State">State</SelectItem>
                    <SelectItem value="National">National</SelectItem>
                    <SelectItem value="International">International</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.recognition_level && <p className="text-sm text-red-500">{formErrors.recognition_level}</p>}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Date Received (Optional)</Label>
              <Input
                id="date"
                placeholder="e.g., May 2023"
                value={newAward.date_display || ""}
                onChange={(e) => setNewAward({ ...newAward, date_display: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe the award and its significance..."
                value={newAward.description || ""}
                onChange={(e) => setNewAward({ ...newAward, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={addAward} 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                "Add Award"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Award Dialog */}
      <Dialog
        open={isEditingAward}
        onOpenChange={(open) => {
          if (!open) {
            setIsEditingAward(false)
            setEditingAwardId(null)
            setFormErrors({})
            setNewAward({
              title: "",
              grade_level: "",
              recognition_level: "",
              date_display: "",
              description: "",
              issuing_organization: "",
            })
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Award</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Award Title</Label>
              <Input
                id="title"
                value={newAward.title || ""}
                onChange={(e) => setNewAward({ ...newAward, title: e.target.value })}
              />
              {formErrors.title && <p className="text-sm text-red-500">{formErrors.title}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="organization">Issuing Organization (Optional)</Label>
              <Input
                id="organization"
                value={newAward.issuing_organization || ""}
                onChange={(e) => setNewAward({ ...newAward, issuing_organization: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="gradeLevel">Grade Level</Label>
                <Select
                  value={newAward.grade_level || ""}
                  onValueChange={(value) => setNewAward({ ...newAward, grade_level: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9">9th Grade</SelectItem>
                    <SelectItem value="10">10th Grade</SelectItem>
                    <SelectItem value="11">11th Grade</SelectItem>
                    <SelectItem value="12">12th Grade</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.grade_level && <p className="text-sm text-red-500">{formErrors.grade_level}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="recognitionLevel">Recognition Level</Label>
                <Select
                  value={newAward.recognition_level || ""}
                  onValueChange={(value) => setNewAward({ ...newAward, recognition_level: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="School">School</SelectItem>
                    <SelectItem value="Regional">Regional</SelectItem>
                    <SelectItem value="State">State</SelectItem>
                    <SelectItem value="National">National</SelectItem>
                    <SelectItem value="International">International</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.recognition_level && <p className="text-sm text-red-500">{formErrors.recognition_level}</p>}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Date Received (Optional)</Label>
              <Input
                id="date"
                placeholder="e.g., May 2023"
                value={newAward.date_display || ""}
                onChange={(e) => setNewAward({ ...newAward, date_display: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe the award and its significance..."
                value={newAward.description || ""}
                onChange={(e) => setNewAward({ ...newAward, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={updateAward} 
              disabled={isLoading}
            >
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

      {/* Import Awards Dialog */}
      <Dialog
        open={isImportingAwards}
        onOpenChange={(open) => {
          if (!open) {
            setIsImportingAwards(false)
            setSelectedAwards({})
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Import Awards</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Select awards from your general honors to import for this college application.
            </p>
            {generalAwards.length === 0 ? (
              <div className="text-center py-6 border rounded-md">
                <p className="text-muted-foreground">No general awards found to import.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {generalAwards.map((award) => (
                  <div key={award.id} className="flex items-start space-x-3 p-3 border rounded-md">
                    <input
                      type="checkbox"
                      checked={!!selectedAwards[award.id]}
                      onChange={(e) => setSelectedAwards({ ...selectedAwards, [award.id]: e.target.checked })}
                      className="h-4 w-4 mt-1 rounded border-gray-300"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{award.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">{award.description}</p>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{award.grade_level}</span>
                        <span>{award.recognition_level}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsImportingAwards(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={importAwards}
              disabled={
                generalAwards.length === 0 ||
                Object.values(selectedAwards).filter(Boolean).length === 0 ||
                isLoading
              }
            >
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
        open={!!confirmDeleteAward}
        onOpenChange={(open) => !open && setConfirmDeleteAward(null)}
        title="Delete Award"
        description="Are you sure you want to delete this award? This action cannot be undone."
        confirmText="Delete"
        onConfirm={() => {
          if (confirmDeleteAward) {
            deleteAward(confirmDeleteAward)
          }
        }}
        variant="destructive"
      />

      {/* AI Assistant */}
      {showAIAssistant && (
        <AIAssistant
          showOnLoad={true}
          initialContext={{
            type: "award"
          }}
          onClose={() => setShowAIAssistant(false)}
        />
      )}
    </div>
  )
}
