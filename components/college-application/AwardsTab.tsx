"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Edit, Trash2, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { handleSupabaseError } from "@/lib/supabase"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"
import { useToast } from "@/components/ui/use-toast"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { Textarea } from "@/components/ui/textarea"
import { validateRequired } from "@/lib/validation"
import { RequiredLabel } from "@/components/ui/required-label"
import { FormErrorSummary } from "@/components/ui/form-error-summary"

type Award = {
  id: string
  title: string
  grade_level: string
  recognition_level: string
  date_received?: string | null
  date_display?: string | null
  description?: string | null
  issuing_organization?: string | null
}

export default function AwardsTab() {
  const [awards, setAwards] = useState<Award[]>([])
  const [newAward, setNewAward] = useState({
    title: "",
    grade_level: "",
    recognition_level: "",
    date_display: "",
    description: "",
    issuing_organization: "",
  })
  const [isEditingAward, setIsEditingAward] = useState(false)
  const [editingAwardId, setEditingAwardId] = useState<string | null>(null)
  const [editingAward, setEditingAward] = useState({
    title: "",
    grade_level: "",
    recognition_level: "",
    date_display: "",
    description: "",
    issuing_organization: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [formSubmitted, setFormSubmitted] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = createClientComponentClient<Database>()

  // Add state for confirmation dialog
  const [confirmDeleteAward, setConfirmDeleteAward] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from("awards")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error) throw error

        if (data) {
          setAwards(data)
        }
      } catch (error) {
        console.error("Error fetching awards:", error)
        toast({
          title: "Error loading awards",
          description: handleSupabaseError(error, "There was a problem loading your awards."),
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user, toast])

  // Validate award form
  const validateAwardForm = (isEditing: boolean): boolean => {
    const formData = isEditing ? editingAward : newAward
    const errors: Record<string, string> = {}

    const titleError = validateRequired(formData.title, "Award title")
    if (titleError) errors.title = titleError

    const gradeLevelError = validateRequired(formData.grade_level, "Grade level")
    if (gradeLevelError) errors.grade_level = gradeLevelError

    const recognitionLevelError = validateRequired(formData.recognition_level, "Recognition level")
    if (recognitionLevelError) errors.recognition_level = recognitionLevelError

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const addAward = async () => {
    if (!user) return
    
    setFormSubmitted(true)
    
    if (!validateAwardForm(false)) {
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from("awards")
        .insert([
          {
            user_id: user.id,
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

      if (data) {
        setAwards([data[0], ...awards])
        setNewAward({
          title: "",
          grade_level: "",
          recognition_level: "",
          date_display: "",
          description: "",
          issuing_organization: "",
        })
        setFormSubmitted(false)

        toast({
          title: "Award added",
          description: "Your award has been added successfully.",
        })
      }
    } catch (error) {
      console.error("Error adding award:", error)
      toast({
        title: "Error adding award",
        description: handleSupabaseError(error, "There was a problem adding the award."),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const startEditAward = (awardId: string) => {
    const awardToEdit = awards.find((a) => a.id === awardId)
    if (awardToEdit) {
      setEditingAward({
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

  const updateAward = async () => {
    if (!user || !editingAwardId) return
    
    setFormSubmitted(true)
    
    if (!validateAwardForm(true)) {
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase
        .from("awards")
        .update({
          title: editingAward.title,
          grade_level: editingAward.grade_level,
          recognition_level: editingAward.recognition_level,
          date_display: editingAward.date_display || null,
          description: editingAward.description || null,
          issuing_organization: editingAward.issuing_organization || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingAwardId)

      if (error) throw error

      setAwards(
        awards.map((award) => {
          if (award.id === editingAwardId) {
            return {
              ...award,
              title: editingAward.title,
              grade_level: editingAward.grade_level,
              recognition_level: editingAward.recognition_level,
              date_display: editingAward.date_display || null,
              description: editingAward.description || null,
              issuing_organization: editingAward.issuing_organization || null,
            }
          }
          return award
        }),
      )
      setIsEditingAward(false)
      setEditingAwardId(null)
      setEditingAward({
        title: "",
        grade_level: "",
        recognition_level: "",
        date_display: "",
        description: "",
        issuing_organization: "",
      })
      setFormSubmitted(false)

      toast({
        title: "Award updated",
        description: "Your award has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating award:", error)
      toast({
        title: "Error updating award",
        description: handleSupabaseError(error, "There was a problem updating the award."),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const deleteAward = async (awardId: string) => {
    if (!user) return
    setIsLoading(true)

    try {
      const { error } = await supabase.from("awards").delete().eq("id", awardId)

      if (error) throw error

      setAwards(awards.filter((award) => award.id !== awardId))

      toast({
        title: "Award deleted",
        description: "Your award has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting award:", error)
      toast({
        title: "Error deleting award",
        description: handleSupabaseError(error, "There was a problem deleting the award."),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setConfirmDeleteAward(null)
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
    <div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Awards and Honors</CardTitle>
              <CardDescription>Showcase your achievements and recognitions</CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-1">
                  <PlusCircle className="h-4 w-4" /> Add Award
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Award</DialogTitle>
                </DialogHeader>
                
                <FormErrorSummary errors={formErrors} show={formSubmitted} />
                
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <RequiredLabel htmlFor="title">Award Title</RequiredLabel>
                    <Input
                      id="title"
                      value={newAward.title}
                      onChange={(e) => setNewAward({ ...newAward, title: e.target.value })}
                    />
                    {formErrors.title && <p className="text-xs text-destructive">{formErrors.title}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <RequiredLabel htmlFor="grade">Grade Level</RequiredLabel>
                      <Select
                        onValueChange={(value) => setNewAward({ ...newAward, grade_level: value })}
                        value={newAward.grade_level}
                      >
                        <SelectTrigger id="grade">
                          <SelectValue placeholder="Select grade level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="9">9th Grade</SelectItem>
                          <SelectItem value="10">10th Grade</SelectItem>
                          <SelectItem value="11">11th Grade</SelectItem>
                          <SelectItem value="12">12th Grade</SelectItem>
                          <SelectItem value="Multiple">Multiple Grades</SelectItem>
                        </SelectContent>
                      </Select>
                      {formErrors.grade_level && <p className="text-xs text-destructive">{formErrors.grade_level}</p>}
                    </div>

                    <div className="grid gap-2">
                      <RequiredLabel htmlFor="recognition">Recognition Level</RequiredLabel>
                      <Select
                        onValueChange={(value) => setNewAward({ ...newAward, recognition_level: value })}
                        value={newAward.recognition_level}
                      >
                        <SelectTrigger id="recognition">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="School">School</SelectItem>
                          <SelectItem value="Local">Local/Regional</SelectItem>
                          <SelectItem value="State">State/Provincial</SelectItem>
                          <SelectItem value="National">National</SelectItem>
                          <SelectItem value="International">International</SelectItem>
                        </SelectContent>
                      </Select>
                      {formErrors.recognition_level && <p className="text-xs text-destructive">{formErrors.recognition_level}</p>}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="organization">Issuing Organization (Optional)</Label>
                    <Input
                      id="organization"
                      value={newAward.issuing_organization || ""}
                      onChange={(e) => setNewAward({ ...newAward, issuing_organization: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="date">Date Received (Optional)</Label>
                    <Input
                      id="date"
                      placeholder="e.g., May 2024"
                      value={newAward.date_display || ""}
                      onChange={(e) => setNewAward({ ...newAward, date_display: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={newAward.description || ""}
                      onChange={(e) => setNewAward({ ...newAward, description: e.target.value })}
                      placeholder="Briefly describe this award and its significance"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={addAward}>Add Award</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            {/* Edit Award Dialog */}
            <Dialog open={isEditingAward} onOpenChange={setIsEditingAward}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Award</DialogTitle>
                </DialogHeader>
                
                <FormErrorSummary errors={formErrors} show={formSubmitted} />
                
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <RequiredLabel htmlFor="editTitle">Award Title</RequiredLabel>
                    <Input
                      id="editTitle"
                      value={editingAward.title}
                      onChange={(e) => setEditingAward({ ...editingAward, title: e.target.value })}
                    />
                    {formErrors.title && <p className="text-xs text-destructive">{formErrors.title}</p>}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <RequiredLabel htmlFor="editGradeLevel">Grade Level</RequiredLabel>
                      <Select
                        onValueChange={(value) => setEditingAward({ ...editingAward, grade_level: value })}
                        value={editingAward.grade_level}
                      >
                        <SelectTrigger id="editGradeLevel">
                          <SelectValue placeholder="Select grade level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="9">9th Grade</SelectItem>
                          <SelectItem value="10">10th Grade</SelectItem>
                          <SelectItem value="11">11th Grade</SelectItem>
                          <SelectItem value="12">12th Grade</SelectItem>
                          <SelectItem value="Multiple">Multiple Grades</SelectItem>
                        </SelectContent>
                      </Select>
                      {formErrors.grade_level && <p className="text-xs text-destructive">{formErrors.grade_level}</p>}
                    </div>
                    
                    <div className="grid gap-2">
                      <RequiredLabel htmlFor="editLevel">Recognition Level</RequiredLabel>
                      <Select
                        onValueChange={(value) => setEditingAward({ ...editingAward, recognition_level: value })}
                        value={editingAward.recognition_level}
                      >
                        <SelectTrigger id="editLevel">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="School">School</SelectItem>
                          <SelectItem value="Local">Local/Regional</SelectItem>
                          <SelectItem value="State">State/Provincial</SelectItem>
                          <SelectItem value="National">National</SelectItem>
                          <SelectItem value="International">International</SelectItem>
                        </SelectContent>
                      </Select>
                      {formErrors.recognition_level && <p className="text-xs text-destructive">{formErrors.recognition_level}</p>}
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="editIssuingOrganization">Issuing Organization (Optional)</Label>
                    <Input
                      id="editIssuingOrganization"
                      value={editingAward.issuing_organization || ""}
                      onChange={(e) => setEditingAward({ ...editingAward, issuing_organization: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="editDate">Date Received (Optional)</Label>
                    <Input
                      id="editDate"
                      placeholder="e.g., May 2024"
                      value={editingAward.date_display || ""}
                      onChange={(e) => setEditingAward({ ...editingAward, date_display: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="editDescription">Description (Optional)</Label>
                    <Textarea
                      id="editDescription"
                      value={editingAward.description || ""}
                      onChange={(e) => setEditingAward({ ...editingAward, description: e.target.value })}
                      placeholder="Briefly describe this award and its significance"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={updateAward}>Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Honor Title</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Grade Level</TableHead>
                  <TableHead>Level of Recognition</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : awards.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                      No awards added yet
                    </TableCell>
                  </TableRow>
                ) : (
                  awards.map((award) => (
                    <TableRow key={award.id}>
                      <TableCell>{award.title}</TableCell>
                      <TableCell>{award.issuing_organization || "-"}</TableCell>
                      <TableCell>{award.grade_level}</TableCell>
                      <TableCell>{award.recognition_level}</TableCell>
                      <TableCell>{award.date_display || "-"}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => startEditAward(award.id)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setConfirmDeleteAward(award.id)}>
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
      {/* Add the confirmation dialog at the end of the component */}
      <ConfirmationDialog
        open={!!confirmDeleteAward}
        onOpenChange={(open) => !open && setConfirmDeleteAward(null)}
        title="Delete Award"
        description="Are you sure you want to delete this award? This action cannot be undone."
        confirmText="Delete"
        onConfirm={() => confirmDeleteAward && deleteAward(confirmDeleteAward)}
        variant="destructive"
      />
    </div>
  )
}



