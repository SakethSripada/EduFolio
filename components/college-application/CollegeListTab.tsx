"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle, Edit, Trash2, Star, StarOff, Loader2, FileText } from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { supabase, handleSupabaseError } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { validateRequired } from "@/lib/validation"
import { performDatabaseOperation } from "@/lib/utils"

type College = {
  id: string
  name: string
  location: string
  type: string
  size: string
  acceptance_rate: number
  ranking: number
  tuition: number
  logo_url: string
  website_url?: string
}

type UserCollege = {
  id: string
  user_id: string
  college_id: string
  application_status: string
  application_deadline?: string | null
  application_deadline_display?: string | null
  is_reach: boolean
  is_target: boolean
  is_safety: boolean
  is_favorite: boolean
  notes?: string | null
  college: College
}

export default function CollegeListTab() {
  const [colleges, setColleges] = useState<College[]>([])
  const [userColleges, setUserColleges] = useState<UserCollege[]>([])
  const [isAddingCollege, setIsAddingCollege] = useState(false)
  const [isEditingCollege, setIsEditingCollege] = useState(false)
  const [editingCollegeId, setEditingCollegeId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const { user } = useAuth()
  const { toast } = useToast()
  const [collegeSearchQuery, setCollegeSearchQuery] = useState("")
  const [selectedColleges, setSelectedColleges] = useState<string[]>([])

  const [newUserCollege, setNewUserCollege] = useState({
    college_id: "",
    application_status: "Researching",
    application_deadline_display: "",
    is_reach: false,
    is_target: false,
    is_safety: false,
    is_favorite: false,
    notes: "",
  })

  // Add state for confirmation dialog
  const [confirmDeleteCollege, setConfirmDeleteCollege] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      setIsLoading(true)

      setTimeout(async () => {
        try {
          // Fetch all colleges
          const { data: collegesData, error: collegesError } = await supabase
            .from("colleges")
            .select("*")
            .order("name", { ascending: true })

          if (collegesError) throw collegesError

          // Fetch user's colleges with college details
          const { data: userCollegesData, error: userCollegesError } = await supabase
            .from("user_colleges")
            .select(`
          *,
          college:colleges(*)
        `)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })

          if (userCollegesError) throw userCollegesError

          setColleges(collegesData || [])
          setUserColleges(userCollegesData || [])
        } catch (error) {
          toast({
            title: "Error loading colleges",
            description: handleSupabaseError(error, "There was a problem loading your college list."),
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
      }, 0)
    }

    fetchData()
  }, [user, toast])

  // Validate college form
  const validateCollegeForm = (): boolean => {
    const errors: Record<string, string> = {}

    const collegeIdError = validateRequired(newUserCollege.college_id, "College")
    if (collegeIdError) errors.college_id = collegeIdError

    const statusError = validateRequired(newUserCollege.application_status, "Application status")
    if (statusError) errors.application_status = statusError

    // Validate that at least one category is selected
    if (!newUserCollege.is_reach && !newUserCollege.is_target && !newUserCollege.is_safety) {
      errors.category = "Please select at least one category (Reach, Target, or Safety)"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Filter colleges based on search query for the add college dialog
  const filteredCollegesForSelection = colleges.filter((college) => {
    if (!collegeSearchQuery) return true;
    return (
      college.name.toLowerCase().includes(collegeSearchQuery.toLowerCase()) ||
      college.location.toLowerCase().includes(collegeSearchQuery.toLowerCase())
    );
  });

  // Toggle selection of a college
  const toggleCollegeSelection = (collegeId: string) => {
    setSelectedColleges((prev) => {
      if (prev.includes(collegeId)) {
        return prev.filter((id) => id !== collegeId);
      } else {
        return [...prev, collegeId];
      }
    });
  };

  // Add multiple selected colleges
  const addSelectedColleges = async () => {
    if (selectedColleges.length === 0) {
      toast({
        title: "No colleges selected",
        description: "Please select at least one college to add.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Add each selected college
      for (const collegeId of selectedColleges) {
        const selectedCollege = colleges.find((c) => c.id === collegeId);
        if (!selectedCollege) continue;

        // Check if college is already in user's list
        const { data: existingCollege, error: checkError } = await supabase
          .from("user_colleges")
          .select("id")
          .eq("user_id", user?.id)
          .eq("college_id", collegeId)
          .maybeSingle();

        if (checkError) throw checkError;

        if (existingCollege) {
          toast({
            title: "College already in list",
            description: `${selectedCollege.name} is already in your list.`,
            variant: "destructive",
          });
          continue;
        }

        // Add college to user's list
        const { error } = await supabase.from("user_colleges").insert([
          {
            user_id: user?.id,
            college_id: collegeId,
            application_status: "Researching",
            is_reach: selectedCollege.acceptance_rate < 0.15,
            is_target: selectedCollege.acceptance_rate >= 0.15 && selectedCollege.acceptance_rate < 0.35,
            is_safety: selectedCollege.acceptance_rate >= 0.35,
            is_favorite: false,
          },
        ]);

        if (error) throw error;
      }

      // Refresh user's colleges
      const { data: userCollegesData, error: userCollegesError } = await supabase
        .from("user_colleges")
        .select(`
          *,
          college:colleges(*)
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (userCollegesError) throw userCollegesError;

      setUserColleges(userCollegesData || []);
      setSelectedColleges([]);
      setIsAddingCollege(false);

      toast({
        title: "Colleges added",
        description: `Added ${selectedColleges.length} college(s) to your list.`,
      });
    } catch (error) {
      toast({
        title: "Error adding colleges",
        description: handleSupabaseError(error, "There was a problem adding the colleges to your list."),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startEditCollege = (userCollegeId: string) => {
    const userCollegeToEdit = userColleges.find((uc) => uc.id === userCollegeId)
    if (userCollegeToEdit) {
      setNewUserCollege({
        college_id: userCollegeToEdit.college_id,
        application_status: userCollegeToEdit.application_status,
        application_deadline_display: userCollegeToEdit.application_deadline_display || "",
        is_reach: userCollegeToEdit.is_reach,
        is_target: userCollegeToEdit.is_target,
        is_safety: userCollegeToEdit.is_safety,
        is_favorite: userCollegeToEdit.is_favorite,
        notes: userCollegeToEdit.notes || "",
      })
      setEditingCollegeId(userCollegeId)
      setIsEditingCollege(true)
    }
  }

  const updateCollege = async () => {
    if (!user || !editingCollegeId || !validateCollegeForm()) return

    await performDatabaseOperation(
      async () => {
        const { error } = await supabase
          .from("user_colleges")
          .update({
            application_status: newUserCollege.application_status,
            application_deadline_display: newUserCollege.application_deadline_display || null,
            is_reach: newUserCollege.is_reach,
            is_target: newUserCollege.is_target,
            is_safety: newUserCollege.is_safety,
            is_favorite: newUserCollege.is_favorite,
            notes: newUserCollege.notes || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingCollegeId)

        if (error) throw error

        // Fetch the updated record with college details
        const { data: updatedData, error: fetchError } = await supabase
          .from("user_colleges")
          .select(`
            *,
            college:colleges(*)
          `)
          .eq("id", editingCollegeId)
          .single()

        if (fetchError) throw fetchError

        return updatedData
      },
      setIsLoading,
      (updatedData) => {
        setUserColleges(
          userColleges.map((userCollege) => {
            if (userCollege.id === editingCollegeId) {
              return updatedData
            }
            return userCollege
          }),
        )
        setNewUserCollege({
          college_id: "",
          application_status: "Researching",
          application_deadline_display: "",
          is_reach: false,
          is_target: false,
          is_safety: false,
          is_favorite: false,
          notes: "",
        })
        setIsEditingCollege(false)
        setEditingCollegeId(null)
        setFormErrors({})

        toast({
          title: "College updated",
          description: "Your college information has been updated successfully.",
        })
      },
      (error) => {
        toast({
          title: "Error updating college",
          description: handleSupabaseError(error, "There was a problem updating the college information."),
          variant: "destructive",
        })
      },
    )
  }

  const toggleFavorite = async (userCollegeId: string) => {
    const userCollegeToToggle = userColleges.find((uc) => uc.id === userCollegeId)
    if (!userCollegeToToggle || !user) return

    const newFavoriteState = !userCollegeToToggle.is_favorite

    await performDatabaseOperation(
      async () => {
        const { error } = await supabase
          .from("user_colleges")
          .update({
            is_favorite: newFavoriteState,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userCollegeId)

        if (error) throw error
        return { success: true }
      },
      setIsLoading,
      () => {
        setUserColleges(
          userColleges.map((userCollege) => {
            if (userCollege.id === userCollegeId) {
              return {
                ...userCollege,
                is_favorite: newFavoriteState,
              }
            }
            return userCollege
          }),
        )

        toast({
          title: newFavoriteState ? "College favorited" : "College unfavorited",
          description: `The college has been ${newFavoriteState ? "added to" : "removed from"} your favorites.`,
        })
      },
      (error) => {
        toast({
          title: "Error updating college",
          description: handleSupabaseError(error, "There was a problem updating the college information."),
          variant: "destructive",
        })
      },
    )
  }

  const deleteCollege = async (userCollegeId: string) => {
    if (!user) return

    await performDatabaseOperation(
      async () => {
        // Delete college-specific data first
        const userCollege = userColleges.find((uc) => uc.id === userCollegeId)
        if (!userCollege) throw new Error("College not found")

        // Delete college courses
        await supabase.from("college_courses").delete().eq("user_id", user.id).eq("college_id", userCollege.college_id)

        // Delete college extracurricular activities
        await supabase
          .from("college_extracurricular_activities")
          .delete()
          .eq("user_id", user.id)
          .eq("college_id", userCollege.college_id)

        // Delete college awards
        await supabase.from("college_awards").delete().eq("user_id", user.id).eq("college_id", userCollege.college_id)

        // Delete college essays
        await supabase.from("college_essays").delete().eq("user_id", user.id).eq("college_id", userCollege.college_id)

        // Delete college todos
        await supabase.from("college_todos").delete().eq("user_id", user.id).eq("college_id", userCollege.college_id)

        // Finally delete the user college entry
        const { error } = await supabase.from("user_colleges").delete().eq("id", userCollegeId)

        if (error) throw error
        return { success: true }
      },
      setIsLoading,
      () => {
        setUserColleges(userColleges.filter((userCollege) => userCollege.id !== userCollegeId))
        setConfirmDeleteCollege(null)

        toast({
          title: "College removed",
          description: "The college has been removed from your list successfully.",
        })
      },
      (error) => {
        toast({
          title: "Error removing college",
          description: handleSupabaseError(error, "There was a problem removing the college from your list."),
          variant: "destructive",
        })
      },
    )
  }

  const navigateToCollegeApplication = (collegeId: string, collegeName: string) => {
    // Store the selected college in localStorage for persistence
    localStorage.setItem("selectedCollegeId", collegeId)
    localStorage.setItem("selectedCollegeName", collegeName)

    // Navigate to the college application page
    window.location.href = `/college-application/college/${collegeId}`
  }

  // Filter colleges based on active tab
  const filteredColleges = userColleges.filter((userCollege) => {
    if (activeTab === "all") return true
    if (activeTab === "favorites") return userCollege.is_favorite
    if (activeTab === "reach") return userCollege.is_reach
    if (activeTab === "target") return userCollege.is_target
    if (activeTab === "safety") return userCollege.is_safety
    if (activeTab === userCollege.application_status.toLowerCase()) return true
    return false
  })

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Researching":
        return <Badge variant="outline">Researching</Badge>
      case "Applying":
        return <Badge className="bg-blue-500">Applying</Badge>
      case "Applied":
        return <Badge className="bg-purple-500">Applied</Badge>
      case "Waitlisted":
        return <Badge className="bg-yellow-500">Waitlisted</Badge>
      case "Accepted":
        return <Badge className="bg-green-500">Accepted</Badge>
      case "Rejected":
        return <Badge className="bg-red-500">Rejected</Badge>
      case "Committed":
        return <Badge className="bg-primary">Committed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading && userColleges.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-semibold">My College List</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Search colleges..."
            className="w-full md:w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button className="flex items-center gap-1" onClick={() => setIsAddingCollege(true)}>
            <PlusCircle className="h-4 w-4" /> Add College
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 flex flex-wrap">
          <TabsTrigger value="all">All Colleges</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="reach">Reach</TabsTrigger>
          <TabsTrigger value="target">Target</TabsTrigger>
          <TabsTrigger value="safety">Safety</TabsTrigger>
          <TabsTrigger value="researching">Researching</TabsTrigger>
          <TabsTrigger value="applying">Applying</TabsTrigger>
          <TabsTrigger value="applied">Applied</TabsTrigger>
          <TabsTrigger value="waitlisted">Waitlisted</TabsTrigger>
          <TabsTrigger value="accepted">Accepted</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {filteredColleges.length === 0 ? (
            <div className="text-center text-muted-foreground py-12 border rounded-md">
              No colleges found. Add a college to get started.
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>College</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredColleges.map((userCollege) => (
                    <TableRow key={userCollege.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {userCollege.is_favorite ? (
                            <Star className="h-4 w-4 text-yellow-500" />
                          ) : (
                            <StarOff className="h-4 w-4 text-muted-foreground opacity-0" />
                          )}
                          <span>{userCollege.college.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{userCollege.college.location}</TableCell>
                      <TableCell>{getStatusBadge(userCollege.application_status)}</TableCell>
                      <TableCell>{userCollege.application_deadline_display || "Not set"}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {userCollege.is_reach && (
                            <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-200">
                              Reach
                            </Badge>
                          )}
                          {userCollege.is_target && (
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                              Target
                            </Badge>
                          )}
                          {userCollege.is_safety && (
                            <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">
                              Safety
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleFavorite(userCollege.id)}
                            title={userCollege.is_favorite ? "Remove from favorites" : "Add to favorites"}
                          >
                            {userCollege.is_favorite ? (
                              <Star className="h-4 w-4 text-yellow-500" />
                            ) : (
                              <StarOff className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startEditCollege(userCollege.id)}
                            title="Edit college"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setConfirmDeleteCollege(userCollege.id)}
                            title="Remove college"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              navigateToCollegeApplication(userCollege.college_id, userCollege.college.name)
                            }
                            title="View college application"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add College Dialog */}
      <Dialog open={isAddingCollege} onOpenChange={setIsAddingCollege}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Colleges to Your List</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="college-search">Search Colleges</Label>
              <Input
                id="college-search"
                placeholder="Search by name or location..."
                value={collegeSearchQuery}
                onChange={(e) => setCollegeSearchQuery(e.target.value)}
                className="mb-2"
              />
              
              <div className="border rounded-md max-h-[300px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead>College</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Acceptance Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCollegesForSelection.map((college) => (
                      <TableRow 
                        key={college.id}
                        className={selectedColleges.includes(college.id) ? "bg-muted" : ""}
                        onClick={() => toggleCollegeSelection(college.id)}
                        style={{ cursor: "pointer" }}
                      >
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedColleges.includes(college.id)}
                            onChange={() => {}}
                            onClick={(e) => e.stopPropagation()}
                            className="h-4 w-4"
                          />
                        </TableCell>
                        <TableCell>{college.name}</TableCell>
                        <TableCell>{college.location}</TableCell>
                        <TableCell>{(college.acceptance_rate * 100).toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {selectedColleges.length > 0 && (
                <div className="mt-2 p-2 bg-muted rounded-md">
                  <p className="text-sm font-medium">Selected Colleges:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedColleges.map((collegeId) => {
                      const college = colleges.find((c) => c.id === collegeId);
                      if (!college) return null;
                      return (
                        <Badge key={collegeId} variant="outline" className="m-1">
                          {college.name}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={addSelectedColleges} 
              disabled={selectedColleges.length === 0 || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                `Add ${selectedColleges.length} College${selectedColleges.length !== 1 ? 's' : ''}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit College Dialog */}
      <Dialog open={isEditingCollege} onOpenChange={setIsEditingCollege}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit College Information</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editStatus">Application Status</Label>
              <Select
                value={newUserCollege.application_status}
                onValueChange={(value) => setNewUserCollege({ ...newUserCollege, application_status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Researching">Researching</SelectItem>
                  <SelectItem value="Applying">Applying</SelectItem>
                  <SelectItem value="Applied">Applied</SelectItem>
                  <SelectItem value="Waitlisted">Waitlisted</SelectItem>
                  <SelectItem value="Accepted">Accepted</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Committed">Committed</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.application_status && <p className="text-sm text-red-500">{formErrors.application_status}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editDeadline">Application Deadline (Optional)</Label>
              <Input
                id="editDeadline"
                placeholder="e.g., January 1, 2025"
                value={newUserCollege.application_deadline_display || ""}
                onChange={(e) => setNewUserCollege({ ...newUserCollege, application_deadline_display: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>College Category</Label>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="editReach"
                    checked={newUserCollege.is_reach}
                    onCheckedChange={(checked) => setNewUserCollege({ ...newUserCollege, is_reach: checked })}
                  />
                  <Label htmlFor="editReach">Reach</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="editTarget"
                    checked={newUserCollege.is_target}
                    onCheckedChange={(checked) => setNewUserCollege({ ...newUserCollege, is_target: checked })}
                  />
                  <Label htmlFor="editTarget">Target</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="editSafety"
                    checked={newUserCollege.is_safety}
                    onCheckedChange={(checked) => setNewUserCollege({ ...newUserCollege, is_safety: checked })}
                  />
                  <Label htmlFor="editSafety">Safety</Label>
                </div>
              </div>
              {formErrors.category && <p className="text-sm text-red-500">{formErrors.category}</p>}
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="editFavorite"
                checked={newUserCollege.is_favorite}
                onCheckedChange={(checked) => setNewUserCollege({ ...newUserCollege, is_favorite: checked })}
              />
              <Label htmlFor="editFavorite">Add to favorites</Label>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editNotes">Notes (Optional)</Label>
              <Textarea
                id="editNotes"
                placeholder="Add any notes about this college..."
                value={newUserCollege.notes || ""}
                onChange={(e) => setNewUserCollege({ ...newUserCollege, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={updateCollege}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={!!confirmDeleteCollege}
        onOpenChange={(open) => !open && setConfirmDeleteCollege(null)}
        title="Remove College"
        description="Are you sure you want to remove this college from your list? This will also delete any college-specific data you've created."
        confirmText="Remove"
        onConfirm={() => confirmDeleteCollege && deleteCollege(confirmDeleteCollege)}
        variant="destructive"
      />
    </div>
  )
}
