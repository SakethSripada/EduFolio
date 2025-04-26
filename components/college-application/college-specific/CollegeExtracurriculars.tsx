"use client"

import { TableCell } from "@/components/ui/table"

import { TableBody } from "@/components/ui/table"

import { TableHead } from "@/components/ui/table"

import { TableRow } from "@/components/ui/table"

import { TableHeader } from "@/components/ui/table"

import { Table } from "@/components/ui/table"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Edit, Trash2, ChevronDown, ChevronUp, Copy, Loader2, Sparkles } from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { handleSupabaseError } from "@/lib/supabase"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"
import { useToast } from "@/components/ui/use-toast"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { validateRequired } from "@/lib/validation"
import { performDatabaseOperation } from "@/lib/utils"
import AIAssistant from "@/components/ai/AIAssistant"
import { NumericInput } from "@/components/ui/numeric-input"

type CollegeExtracurricularsProps = {
  collegeId: string
}

type Activity = {
  id: string
  activity_type: string
  position: string
  organization: string
  description: string | null
  grade_levels: string
  participation_timing: string
  hours_per_week: number
  weeks_per_year: number
  continue_in_college: boolean
  impact_statement: string | null
  start_date: string | null
  end_date: string | null
  is_current: boolean | null
}

export default function CollegeExtracurriculars({ collegeId }: CollegeExtracurricularsProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [generalActivities, setGeneralActivities] = useState<Activity[]>([])
  const [newActivity, setNewActivity] = useState<Partial<Activity>>({
    activity_type: "",
    position: "",
    organization: "",
    description: "",
    grade_levels: "",
    participation_timing: "",
    hours_per_week: 0,
    weeks_per_year: 0,
    continue_in_college: false,
    impact_statement: "",
    is_current: false,
  })
  const [expandedActivity, setExpandedActivity] = useState<number | null>(null)
  const [isEditingActivity, setIsEditingActivity] = useState(false)
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null)
  const [isImportingActivities, setIsImportingActivities] = useState(false)
  const [selectedActivities, setSelectedActivities] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [confirmDeleteActivity, setConfirmDeleteActivity] = useState<string | null>(null)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [collegeName, setCollegeName] = useState<string>("")
  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = createClientComponentClient<Database>()

  // Update the useEffect to use setTimeout for Supabase calls
  useEffect(() => {
    if (!user || !collegeId) return

    const fetchData = async () => {
      setIsLoading(true)

      setTimeout(async () => {
        try {
          // Fetch college name
          const { data: collegeData, error: collegeError } = await supabase
            .from("colleges")
            .select("name")
            .eq("id", collegeId)
            .single()

          if (collegeError) throw collegeError
          if (collegeData) setCollegeName(collegeData.name)
          
          // Fetch college-specific activities
          const { data: collegeActivitiesData, error: collegeActivitiesError } = await supabase
            .from("college_extracurricular_activities")
            .select("*")
            .eq("user_id", user.id)
            .eq("college_id", collegeId)
            .order("created_at", { ascending: false })

          if (collegeActivitiesError) throw collegeActivitiesError

          // Fetch general activities for import
          const { data: generalActivitiesData, error: generalActivitiesError } = await supabase
            .from("extracurricular_activities")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })

          if (generalActivitiesError) throw generalActivitiesError

          setActivities(collegeActivitiesData || [])
          setGeneralActivities(generalActivitiesData || [])
        } catch (error) {
          toast({
            title: "Error loading activities",
            description: handleSupabaseError(error, "There was a problem loading your activities."),
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
      }, 0)
    }

    fetchData()
  }, [user, collegeId, toast])

  // Validate activity form
  const validateActivityForm = (isEditing: boolean): boolean => {
    const formData = isEditing ? newActivity : newActivity
    const errors: Record<string, string> = {}

    const typeError = validateRequired(formData.activity_type, "Activity type")
    if (typeError) errors.activity_type = typeError

    const positionError = validateRequired(formData.position, "Position")
    if (positionError) errors.position = positionError

    const organizationError = validateRequired(formData.organization, "Organization")
    if (organizationError) errors.organization = organizationError

    const gradeLevelsError = validateRequired(formData.grade_levels, "Grade levels")
    if (gradeLevelsError) errors.grade_levels = gradeLevelsError

    const timingError = validateRequired(formData.participation_timing, "Participation timing")
    if (timingError) errors.participation_timing = timingError

    if (!formData.hours_per_week) {
      errors.hours_per_week = "Hours per week is required"
    } else if (isNaN(Number(formData.hours_per_week))) {
      errors.hours_per_week = "Hours per week must be a valid number"
    }

    if (!formData.weeks_per_year) {
      errors.weeks_per_year = "Weeks per year is required"
    } else if (isNaN(Number(formData.weeks_per_year))) {
      errors.weeks_per_year = "Weeks per year must be a valid number"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const addActivity = async () => {
    if (!user || !collegeId || !validateActivityForm(false)) return

    await performDatabaseOperation(
      async () => {
        const { data, error } = await supabase
          .from("college_extracurricular_activities")
          .insert([
            {
              user_id: user.id,
              college_id: collegeId,
              activity_type: newActivity.activity_type,
              position: newActivity.position,
              organization: newActivity.organization,
              description: newActivity.description || null,
              grade_levels: newActivity.grade_levels,
              participation_timing: newActivity.participation_timing,
              hours_per_week: Number(newActivity.hours_per_week),
              weeks_per_year: Number(newActivity.weeks_per_year),
              continue_in_college: newActivity.continue_in_college,
              impact_statement: newActivity.impact_statement || null,
              is_current: newActivity.is_current,
            },
          ])
          .select()

        if (error) throw error

        return data
      },
      setIsLoading,
      (data) => {
        if (data && data[0]) {
          setActivities([data[0], ...activities])
          setNewActivity({
            activity_type: "",
            position: "",
            organization: "",
            description: "",
            grade_levels: "",
            participation_timing: "",
            hours_per_week: 0,
            weeks_per_year: 0,
            continue_in_college: false,
            impact_statement: "",
            is_current: false,
          })
          
          // Use a timeout to ensure state updates don't conflict
          setTimeout(() => {
            setIsEditingActivity(false)
          }, 0)

          toast({
            title: "Activity added",
            description: "Your extracurricular activity has been added successfully.",
          })
        }
      },
      (error) => {
        toast({
          title: "Error adding activity",
          description: handleSupabaseError(error, "There was a problem adding the activity."),
          variant: "destructive",
        })
      },
    )
  }

  const toggleExpand = (index: number) => {
    setExpandedActivity(expandedActivity === index ? null : index)
  }

  const startEditActivity = (activityId: string) => {
    const activityToEdit = activities.find((a) => a.id === activityId)
    if (activityToEdit) {
      setNewActivity({
        activity_type: activityToEdit.activity_type,
        position: activityToEdit.position,
        organization: activityToEdit.organization,
        description: activityToEdit.description || "",
        grade_levels: activityToEdit.grade_levels,
        participation_timing: activityToEdit.participation_timing,
        hours_per_week: activityToEdit.hours_per_week,
        weeks_per_year: activityToEdit.weeks_per_year,
        continue_in_college: activityToEdit.continue_in_college,
        impact_statement: activityToEdit.impact_statement || "",
        is_current: activityToEdit.is_current || false,
      })
      setEditingActivityId(activityId)
      setIsEditingActivity(true)
    }
  }

  const updateActivity = async () => {
    if (!user || !collegeId || !editingActivityId || !validateActivityForm(true)) return

    await performDatabaseOperation(
      async () => {
        const { error } = await supabase
          .from("college_extracurricular_activities")
          .update({
            activity_type: newActivity.activity_type as string,
            position: newActivity.position as string,
            organization: newActivity.organization as string,
            description: newActivity.description || null,
            grade_levels: newActivity.grade_levels as string,
            participation_timing: newActivity.participation_timing as string,
            hours_per_week: Number(newActivity.hours_per_week),
            weeks_per_year: Number(newActivity.weeks_per_year),
            continue_in_college: newActivity.continue_in_college === undefined ? false : newActivity.continue_in_college,
            impact_statement: newActivity.impact_statement || null,
            is_current: newActivity.is_current === undefined ? false : newActivity.is_current,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingActivityId)
          .eq("college_id", collegeId)

        if (error) throw error
        return { success: true }
      },
      setIsLoading,
      () => {
        const updatedActivities = activities.map((activity) => {
          if (activity.id === editingActivityId) {
            return {
              ...activity,
              activity_type: newActivity.activity_type as string,
              position: newActivity.position as string,
              organization: newActivity.organization as string,
              description: newActivity.description || null,
              grade_levels: newActivity.grade_levels as string,
              participation_timing: newActivity.participation_timing as string,
              hours_per_week: Number(newActivity.hours_per_week),
              weeks_per_year: Number(newActivity.weeks_per_year),
              continue_in_college: newActivity.continue_in_college === undefined ? false : newActivity.continue_in_college,
              impact_statement: newActivity.impact_statement || null,
              is_current: newActivity.is_current === undefined ? false : newActivity.is_current,
            } as Activity
          }
          return activity
        });
        
        setActivities(updatedActivities);
        
        // Reset form first
        setNewActivity({
          activity_type: "",
          position: "",
          organization: "",
          description: "",
          grade_levels: "",
          participation_timing: "",
          hours_per_week: 0,
          weeks_per_year: 0,
          continue_in_college: false,
          impact_statement: "",
          is_current: false,
        })
        
        // Use a timeout to ensure state updates don't conflict
        setTimeout(() => {
          setIsEditingActivity(false)
          setEditingActivityId(null)
        }, 0)

        toast({
          title: "Activity updated",
          description: "Your extracurricular activity has been updated successfully.",
        })
      },
      (error) => {
        toast({
          title: "Error updating activity",
          description: handleSupabaseError(error, "There was a problem updating the activity."),
          variant: "destructive",
        })
      },
    )
  }

  const deleteActivity = async (activityId: string) => {
    if (!user || !collegeId) return

    await performDatabaseOperation(
      async () => {
        const { error } = await supabase
          .from("college_extracurricular_activities")
          .delete()
          .eq("id", activityId)
          .eq("college_id", collegeId)

        if (error) throw error
        return { success: true }
      },
      setIsLoading,
      () => {
        setActivities(activities.filter((activity) => activity.id !== activityId))
        setConfirmDeleteActivity(null)
        toast({
          title: "Activity deleted",
          description: "Your extracurricular activity has been deleted successfully.",
        })
      },
      (error) => {
        toast({
          title: "Error deleting activity",
          description: handleSupabaseError(error, "There was a problem deleting the activity."),
          variant: "destructive",
        })
      },
    )
  }

  const importActivities = async () => {
    if (!user || !collegeId) return

    const selectedActivityIds = Object.entries(selectedActivities)
      .filter(([_, isSelected]) => isSelected)
      .map(([id, _]) => id)

    if (selectedActivityIds.length === 0) {
      toast({
        title: "No activities selected",
        description: "Please select at least one activity to import.",
        variant: "destructive",
      })
      return
    }

    await performDatabaseOperation(
      async () => {
        const activitiesToImport = generalActivities.filter((activity) => selectedActivityIds.includes(activity.id))

        const activitiesData = activitiesToImport.map((activity) => ({
          user_id: user.id,
          college_id: collegeId,
          activity_type: activity.activity_type,
          position: activity.position,
          organization: activity.organization,
          description: activity.description,
          grade_levels: activity.grade_levels,
          participation_timing: activity.participation_timing,
          hours_per_week: activity.hours_per_week,
          weeks_per_year: activity.weeks_per_year,
          continue_in_college: activity.continue_in_college,
          impact_statement: activity.impact_statement,
          is_current: activity.is_current,
        }))

        const { data, error } = await supabase
          .from("college_extracurricular_activities")
          .insert(activitiesData)
          .select()

        if (error) throw error
        return data
      },
      setIsLoading,
      (data) => {
        if (data) {
          setActivities([...data, ...activities])
          setSelectedActivities({})
          
          // Use a timeout to ensure state updates don't conflict
          setTimeout(() => {
            setIsImportingActivities(false)
          }, 0)

          toast({
            title: "Activities imported",
            description: `${data.length} activity/activities have been imported successfully.`,
          })
        }
      },
      (error) => {
        toast({
          title: "Error importing activities",
          description: handleSupabaseError(error, "There was a problem importing the activities."),
          variant: "destructive",
        })
      },
    )
  }

  // Add a simple function to open the AI Assistant without specific data
  const openAIAssistant = () => {
    setShowAIAssistant(true);
  }

  if (isLoading && activities.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">{collegeName ? `${collegeName} Extracurriculars` : 'College Extracurriculars'}</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="flex items-center gap-2" onClick={() => openAIAssistant()}>
            <Sparkles className="h-4 w-4" /> AI Assistance
          </Button>
          <Button variant="outline" className="flex items-center gap-1" onClick={() => setIsImportingActivities(true)}>
            <Copy className="h-4 w-4" /> Import Activities
          </Button>
          <Button className="flex items-center gap-1" onClick={() => setIsEditingActivity(true)}>
            <PlusCircle className="h-4 w-4" /> Add Activity
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Extracurricular Activities</CardTitle>
          <CardDescription>Activities you're highlighting for this specific college</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.length === 0 ? (
              <div className="text-center text-muted-foreground py-6 border rounded-md">
                No activities added yet. Add activities specific to this college application.
              </div>
            ) : (
              activities.map((activity, index) => (
                <Card key={index} className="overflow-hidden">
                  <div
                    className="p-4 flex justify-between items-center cursor-pointer hover:bg-muted/50"
                    onClick={() => toggleExpand(index)}
                  >
                    <div>
                      <h3 className="font-medium">{activity.organization}</h3>
                      <p className="text-sm text-muted-foreground">{activity.position}</p>
                    </div>
                    <div>
                      {expandedActivity === index ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                  {expandedActivity === index && (
                    <div className="p-4 border-t">
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">Activity Type</dt>
                          <dd>{activity.activity_type}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">Description</dt>
                          <dd>{activity.description || "No description provided"}</dd>
                        </div>
                        {activity.impact_statement && (
                          <div className="sm:col-span-2">
                            <dt className="text-sm font-medium text-muted-foreground">Impact</dt>
                            <dd>{activity.impact_statement}</dd>
                          </div>
                        )}
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">Grade Levels</dt>
                          <dd>{activity.grade_levels}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">Timing</dt>
                          <dd>{activity.participation_timing}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">Hours/Week</dt>
                          <dd>{activity.hours_per_week}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">Weeks/Year</dt>
                          <dd>{activity.weeks_per_year}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">Current Activity</dt>
                          <dd>{activity.is_current ? "Yes" : "No"}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">Continue in College</dt>
                          <dd>{activity.continue_in_college ? "Yes" : "No"}</dd>
                        </div>
                      </dl>
                      <div className="mt-4 flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            startEditActivity(activity.id)
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setConfirmDeleteActivity(activity.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Activity Dialog */}
      <Dialog
        open={isEditingActivity}
        onOpenChange={(open) => {
          if (!open) {
            // Only handle close events here - don't set to true
            setNewActivity({
              activity_type: "",
              position: "",
              organization: "",
              description: "",
              grade_levels: "",
              participation_timing: "",
              hours_per_week: 0,
              weeks_per_year: 0,
              continue_in_college: false,
              impact_statement: "",
              is_current: false,
            })
            setFormErrors({})
            setIsEditingActivity(false)
            setEditingActivityId(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingActivityId ? "Edit Activity" : "Add New Activity"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Activity Type</Label>
                <Select
                  onValueChange={(value) => setNewActivity({ ...newActivity, activity_type: value })}
                  value={newActivity.activity_type}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Club">Club</SelectItem>
                    <SelectItem value="Sport">Sport</SelectItem>
                    <SelectItem value="Volunteer">Volunteer</SelectItem>
                    <SelectItem value="Work">Work</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                    <SelectItem value="Research">Research</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.activity_type && <p className="text-sm text-red-500">{formErrors.activity_type}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="position">Position/Leadership</Label>
                <Input
                  id="position"
                  maxLength={50}
                  value={newActivity.position}
                  onChange={(e) => setNewActivity({ ...newActivity, position: e.target.value })}
                />
                {formErrors.position && <p className="text-sm text-red-500">{formErrors.position}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="organization">Organization Name</Label>
                <Input
                  id="organization"
                  maxLength={100}
                  value={newActivity.organization}
                  onChange={(e) => setNewActivity({ ...newActivity, organization: e.target.value })}
                />
                {formErrors.organization && <p className="text-sm text-red-500">{formErrors.organization}</p>}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                maxLength={150}
                value={newActivity.description || ''}
                onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="impact">Impact Statement (Optional)</Label>
              <Textarea
                id="impact"
                maxLength={200}
                placeholder="Describe the impact of your involvement..."
                value={newActivity.impact_statement || ''}
                onChange={(e) => setNewActivity({ ...newActivity, impact_statement: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="grades">Participation Grade Levels</Label>
                <Input
                  id="grades"
                  placeholder="e.g. 9, 10, 11"
                  value={newActivity.grade_levels}
                  onChange={(e) => setNewActivity({ ...newActivity, grade_levels: e.target.value })}
                />
                {formErrors.grade_levels && <p className="text-sm text-red-500">{formErrors.grade_levels}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="timing">Timing of Participation</Label>
                <Select
                  onValueChange={(value) => setNewActivity({ ...newActivity, participation_timing: value })}
                  value={newActivity.participation_timing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="School Year">School Year</SelectItem>
                    <SelectItem value="Summer">Summer</SelectItem>
                    <SelectItem value="Year Round">Year Round</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.participation_timing && (
                  <p className="text-sm text-red-500">{formErrors.participation_timing}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="hours">Hours Spent Per Week</Label>
                <NumericInput
                  id="hours"
                  min={0}
                  max={168}
                  value={typeof newActivity.hours_per_week === 'number' ? newActivity.hours_per_week : null}
                  onChange={(value) => setNewActivity({ ...newActivity, hours_per_week: value === null ? 0 : value })}
                />
                {formErrors.hours_per_week && <p className="text-sm text-red-500">{formErrors.hours_per_week}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="weeks">Weeks Spent Per Year</Label>
                <NumericInput
                  id="weeks"
                  min={0}
                  max={52}
                  value={typeof newActivity.weeks_per_year === 'number' ? newActivity.weeks_per_year : null}
                  onChange={(value) => setNewActivity({ ...newActivity, weeks_per_year: value === null ? 0 : value })}
                />
                {formErrors.weeks_per_year && <p className="text-sm text-red-500">{formErrors.weeks_per_year}</p>}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isCurrent"
                checked={!!newActivity.is_current}
                onCheckedChange={(checked) => setNewActivity({ ...newActivity, is_current: checked as boolean })}
              />
              <Label htmlFor="isCurrent">I am currently involved in this activity</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="continueInCollege"
                checked={newActivity.continue_in_college}
                onCheckedChange={(checked) =>
                  setNewActivity({ ...newActivity, continue_in_college: checked as boolean })
                }
              />
              <Label htmlFor="continueInCollege">I intend to participate in a similar activity in college</Label>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={editingActivityId ? updateActivity : addActivity}>
              {editingActivityId ? "Save Changes" : "Add Activity"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Activities Dialog */}
      <Dialog open={isImportingActivities} onOpenChange={setIsImportingActivities}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Import Extracurricular Activities</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Select activities from your general extracurriculars to import for this college application.
            </p>
            {generalActivities.length === 0 ? (
              <div className="text-center py-6 border rounded-md">
                <p className="text-muted-foreground">No general activities found to import.</p>
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">Select</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {generalActivities.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={!!selectedActivities[activity.id]}
                            onChange={(e) =>
                              setSelectedActivities({ ...selectedActivities, [activity.id]: e.target.checked })
                            }
                            className="h-4 w-4 rounded border-gray-300"
                          />
                        </TableCell>
                        <TableCell>{activity.organization}</TableCell>
                        <TableCell>{activity.position}</TableCell>
                        <TableCell>{activity.activity_type}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportingActivities(false)}>
              Cancel
            </Button>
            <Button onClick={importActivities} disabled={generalActivities.length === 0}>
              Import Selected
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={!!confirmDeleteActivity}
        onOpenChange={(open) => !open && setConfirmDeleteActivity(null)}
        title="Delete Activity"
        description="Are you sure you want to delete this activity? This action cannot be undone."
        confirmText="Delete"
        onConfirm={() => {
          if (confirmDeleteActivity) {
            deleteActivity(confirmDeleteActivity)
          }
        }}
        variant="destructive"
      />

      {/* AI Assistant Dialog */}
      {showAIAssistant && (
        <AIAssistant
          showOnLoad={true}
          initialContext={{
            type: "extracurricular"
          }}
          onClose={() => setShowAIAssistant(false)}
        />
      )}
    </div>
  )
}
