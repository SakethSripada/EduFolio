"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RequiredLabel } from "@/components/ui/required-label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Edit, Trash2, ChevronDown, ChevronUp, Sparkles, Loader2 } from "lucide-react"
import AIAssistant from "@/components/ai/AIAssistant"
import { useAuth } from "@/components/auth/AuthProvider"
import { handleSupabaseError } from "@/lib/supabase"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"
import { useToast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { validateRequired } from "@/lib/validation"
import { performDatabaseOperation } from "@/lib/utils"
import { FormErrorSummary } from "@/components/ui/form-error-summary"
import { NumericInput } from "@/components/ui/numeric-input"

type Activity = {
  id: string
  user_id: string
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

export default function ExtracurricularsTab() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [newActivity, setNewActivity] = useState({
    activity_type: "",
    position: "",
    organization: "",
    description: "",
    grade_levels: "",
    participation_timing: "",
    hours_per_week: "",
    weeks_per_year: "",
    continue_in_college: false,
    impact_statement: "",
    is_current: false,
  })
  const [expandedActivity, setExpandedActivity] = useState<number | null>(null)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<any>(null)
  const [isEditingActivity, setIsEditingActivity] = useState(false)
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null)
  const [editingActivity, setEditingActivity] = useState({
    activity_type: "",
    position: "",
    organization: "",
    description: "",
    grade_levels: "",
    participation_timing: "",
    hours_per_week: "",
    weeks_per_year: "",
    continue_in_college: false,
    impact_statement: "",
    is_current: false,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [formSubmitted, setFormSubmitted] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = createClientComponentClient<Database>()

  // Add state for confirmation dialog
  const [confirmDeleteActivity, setConfirmDeleteActivity] = useState<string | null>(null)

  const [aiAction, setAiAction] = useState<"improve" | "all" | null>(null)

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      performDatabaseOperation(
        async () => {
          const { data, error } = await supabase
            .from("extracurricular_activities")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });
          if (error) throw error;
          return data || [];
        },
        setIsLoading,
        (data) => setActivities(data),
        (error) => {
          toast({
            title: "Error loading extracurriculars",
            description: handleSupabaseError(
              error,
              "There was a problem loading your extracurricular activities."
            ),
            variant: "destructive",
          });
        }
      );
    };

    fetchData();
  }, [user?.id]);

  // Validate activity form
  const validateActivityForm = (isEditing: boolean): boolean => {
    const formData = isEditing ? editingActivity : newActivity
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
    if (!user) return
    
    setFormSubmitted(true)
    
    if (!validateActivityForm(false)) {
      // Form validation failed, error summary will be shown
      return
    }

    await performDatabaseOperation(
      async () => {
        const { data, error } = await supabase
          .from("extracurricular_activities")
          .insert([
            {
              user_id: user.id,
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
            hours_per_week: "",
            weeks_per_year: "",
            continue_in_college: false,
            impact_statement: "",
            is_current: false,
          })
          setFormSubmitted(false)
        }
        toast({
          title: "Activity added",
          description: "Your extracurricular activity has been added successfully.",
        })
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

  // Format a single activity for AI
  const formatActivityForAI = (activity: Activity) => {
    return `
Activity: ${activity.organization}
Position: ${activity.position}
Type: ${activity.activity_type}
Description: ${activity.description || "N/A"}
Impact: ${activity.impact_statement || "N/A"}
Time Commitment: ${activity.hours_per_week} hours per week, ${activity.weeks_per_year} weeks per year
Grade Levels: ${activity.grade_levels}
Timing: ${activity.participation_timing}
Currently Active: ${activity.is_current ? "Yes" : "No"}
Plan to Continue in College: ${activity.continue_in_college ? "Yes" : "No"}
    `.trim();
  };

  // Format all activities for AI
  const formatAllActivitiesForAI = () => {
    if (activities.length === 0) {
      return "You haven't added any extracurricular activities yet.";
    }

    return `Here are all your extracurricular activities:
    
${activities.map((activity, index) => `#${index + 1}: ${formatActivityForAI(activity)}`).join('\n\n')}`;
  };

  // Open AI assistant for a specific activity
  const openAIAssistantForActivity = (activity: any) => {
    setSelectedActivity(activity);
    setAiAction("improve");
    setShowAIAssistant(true);
  };

  // Open AI assistant for all activities
  const openAIAssistantForAll = () => {
    setSelectedActivity(null);
    setAiAction("all");
    setShowAIAssistant(true);
  };

  // Add a simple function to open the AI Assistant without specific data
  const openAIAssistant = () => {
    setSelectedActivity(null);
    setAiAction(null);
    setShowAIAssistant(true);
  }

  const startEditActivity = (activityId: string) => {
    const activityToEdit = activities.find((a) => a.id === activityId)
    if (activityToEdit) {
      setEditingActivity({
        activity_type: activityToEdit.activity_type,
        position: activityToEdit.position,
        organization: activityToEdit.organization,
        description: activityToEdit.description || "",
        grade_levels: activityToEdit.grade_levels,
        participation_timing: activityToEdit.participation_timing,
        hours_per_week: activityToEdit.hours_per_week.toString(),
        weeks_per_year: activityToEdit.weeks_per_year.toString(),
        continue_in_college: activityToEdit.continue_in_college,
        impact_statement: activityToEdit.impact_statement || "",
        is_current: activityToEdit.is_current || false,
      })
      setEditingActivityId(activityId)
      setIsEditingActivity(true)
    }
  }

  const updateActivity = async () => {
    if (!user || !editingActivityId) return
    
    setFormSubmitted(true)
    
    if (!validateActivityForm(true)) {
      // Form validation failed, error summary will be shown
      return
    }

    await performDatabaseOperation(
      async () => {
        const { error } = await supabase
          .from("extracurricular_activities")
          .update({
            activity_type: editingActivity.activity_type,
            position: editingActivity.position,
            organization: editingActivity.organization,
            description: editingActivity.description || null,
            grade_levels: editingActivity.grade_levels,
            participation_timing: editingActivity.participation_timing,
            hours_per_week: Number(editingActivity.hours_per_week),
            weeks_per_year: Number(editingActivity.weeks_per_year),
            continue_in_college: editingActivity.continue_in_college,
            impact_statement: editingActivity.impact_statement || null,
            is_current: editingActivity.is_current,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingActivityId)

        if (error) throw error

        setActivities(
          activities.map((activity) => {
            if (activity.id === editingActivityId) {
              return {
                ...activity,
                activity_type: editingActivity.activity_type,
                position: editingActivity.position,
                organization: editingActivity.organization,
                description: editingActivity.description || null,
                grade_levels: editingActivity.grade_levels,
                participation_timing: editingActivity.participation_timing,
                hours_per_week: Number(editingActivity.hours_per_week),
                weeks_per_year: Number(editingActivity.weeks_per_year),
                continue_in_college: editingActivity.continue_in_college,
                impact_statement: editingActivity.impact_statement || null,
                is_current: editingActivity.is_current,
              }
            }
            return activity
          }),
        )
        setIsEditingActivity(false)
        setEditingActivityId(null)
        setEditingActivity({
          activity_type: "",
          position: "",
          organization: "",
          description: "",
          grade_levels: "",
          participation_timing: "",
          hours_per_week: "",
          weeks_per_year: "",
          continue_in_college: false,
          impact_statement: "",
          is_current: false,
        })
        setFormSubmitted(false)
      },
      setIsLoading,
      () => {
        toast({
          title: "Activity updated",
          description: "Your extracurricular activity has been updated successfully.",
        })
      },
      (error) => {
        console.error("Error updating activity:", error)
        toast({
          title: "Error updating activity",
          description: handleSupabaseError(error, "There was a problem updating the activity."),
          variant: "destructive",
        })
      },
    )
  }

  const deleteActivity = async (activityId: string) => {
    if (!user) return
    setIsLoading(true)

    try {
      const { error } = await supabase.from("extracurricular_activities").delete().eq("id", activityId)

      if (error) throw error

      setActivities(activities.filter((activity) => activity.id !== activityId))

      toast({
        title: "Activity deleted",
        description: "Your extracurricular activity has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting activity:", error)
      toast({
        title: "Error deleting activity",
        description: handleSupabaseError(error, "There was a problem deleting the activity."),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setConfirmDeleteActivity(null)
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
              <CardTitle className="flex items-center gap-2">
                Extracurricular Activities
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-full"
                          onClick={() => openAIAssistantForAll()}
                        >
                          <Sparkles className="h-4 w-4 text-primary" />
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Get AI assistance</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
              <CardDescription>Track your involvement outside the classroom</CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-1">
                  <PlusCircle className="h-4 w-4" /> Add Activity
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Extracurricular Activity</DialogTitle>
                </DialogHeader>
                
                <FormErrorSummary errors={formErrors} show={formSubmitted} />
                
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <RequiredLabel htmlFor="type">Activity Type</RequiredLabel>
                      <Select
                        onValueChange={(value) => setNewActivity({ ...newActivity, activity_type: value })}
                        value={newActivity.activity_type}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Academic">Academic</SelectItem>
                            <SelectItem value="Art">Art</SelectItem>
                            <SelectItem value="Athletics: Club">Athletics: Club</SelectItem>
                            <SelectItem value="Athletics: JV/Varsity">Athletics: JV/Varsity</SelectItem>
                            <SelectItem value="Career Oriented">Career Oriented</SelectItem>
                            <SelectItem value="Community Service (Volunteer)">Community Service (Volunteer)</SelectItem>
                            <SelectItem value="Computer/Technology">Computer/Technology</SelectItem>
                            <SelectItem value="Cultural">Cultural</SelectItem>
                            <SelectItem value="Dance">Dance</SelectItem>
                            <SelectItem value="Debate/Speech">Debate/Speech</SelectItem>
                            <SelectItem value="Environmental">Environmental</SelectItem>
                            <SelectItem value="Family Responsibilities">Family Responsibilities</SelectItem>
                            <SelectItem value="Foreign Exchange">Foreign Exchange</SelectItem>
                            <SelectItem value="Foreign Language">Foreign Language</SelectItem>
                            <SelectItem value="Internship">Internship</SelectItem>
                            <SelectItem value="Journalism/Publication">Journalism/Publication</SelectItem>
                            <SelectItem value="Junior R.O.T.C.">Junior R.O.T.C.</SelectItem>
                            <SelectItem value="LGBT">LGBT</SelectItem>
                            <SelectItem value="Music: Instrumental">Music: Instrumental</SelectItem>
                            <SelectItem value="Music: Vocal">Music: Vocal</SelectItem>
                            <SelectItem value="Religious">Religious</SelectItem>
                            <SelectItem value="Research">Research</SelectItem>
                            <SelectItem value="Robotics">Robotics</SelectItem>
                            <SelectItem value="School Spirit">School Spirit</SelectItem>
                            <SelectItem value="Science/Math">Science/Math</SelectItem>
                            <SelectItem value="Social Justice">Social Justice</SelectItem>
                            <SelectItem value="Student Govt./Politics">Student Govt./Politics</SelectItem>
                            <SelectItem value="Theater/Drama">Theater/Drama</SelectItem>
                            <SelectItem value="Work (Paid)">Work (Paid)</SelectItem>
                            <SelectItem value="Other Club/Activity">Other Club/Activity</SelectItem>
                        </SelectContent>
                      </Select>
                      {formErrors.activity_type && <p className="text-sm text-red-500">{formErrors.activity_type}</p>}
                    </div>
                    <div className="grid gap-2">
                      <RequiredLabel htmlFor="position">Position/Leadership</RequiredLabel>
                      <Input
                        id="position"
                        maxLength={50}
                        value={newActivity.position}
                        onChange={(e) => setNewActivity({ ...newActivity, position: e.target.value })}
                      />
                      {formErrors.position && <p className="text-sm text-red-500">{formErrors.position}</p>}
                    </div>
                    <div className="grid gap-2">
                      <RequiredLabel htmlFor="organization">Organization Name</RequiredLabel>
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
                      value={newActivity.description}
                      onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="impact">Impact Statement (Optional)</Label>
                    <Textarea
                      id="impact"
                      maxLength={200}
                      placeholder="Describe the impact of your involvement..."
                      value={newActivity.impact_statement}
                      onChange={(e) => setNewActivity({ ...newActivity, impact_statement: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <RequiredLabel htmlFor="grades">Participation Grade Levels</RequiredLabel>
                      <Input
                        id="grades"
                        placeholder="e.g. 9, 10, 11"
                        value={newActivity.grade_levels}
                        onChange={(e) => setNewActivity({ ...newActivity, grade_levels: e.target.value })}
                      />
                      {formErrors.grade_levels && <p className="text-sm text-red-500">{formErrors.grade_levels}</p>}
                    </div>
                    <div className="grid gap-2">
                      <RequiredLabel htmlFor="timing">Timing of Participation</RequiredLabel>
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
                      <RequiredLabel htmlFor="hoursPerWeek">Hours Spent Per Week</RequiredLabel>
                      <NumericInput
                        id="hoursPerWeek"
                        min={0}
                        max={168}
                        value={newActivity.hours_per_week === "" ? null : parseFloat(newActivity.hours_per_week)}
                        onChange={(value) => setNewActivity({ ...newActivity, hours_per_week: value === null ? "" : value.toString() })}
                      />
                      {formErrors.hours_per_week && <p className="text-sm text-red-500">{formErrors.hours_per_week}</p>}
                    </div>
                    <div className="grid gap-2">
                      <RequiredLabel htmlFor="weeksPerYear">Weeks Spent Per Year</RequiredLabel>
                      <NumericInput
                        id="weeksPerYear"
                        min={0}
                        max={52}
                        value={newActivity.weeks_per_year === "" ? null : parseFloat(newActivity.weeks_per_year)}
                        onChange={(value) => setNewActivity({ ...newActivity, weeks_per_year: value === null ? "" : value.toString() })}
                      />
                      {formErrors.weeks_per_year && <p className="text-sm text-red-500">{formErrors.weeks_per_year}</p>}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isCurrent"
                      checked={newActivity.is_current}
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
                  <Button onClick={addActivity}>Add Activity</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            {/* Edit Activity Dialog */}
            <Dialog
              open={isEditingActivity}
              onOpenChange={(open) => {
                if (!open) {
                  setIsEditingActivity(false)
                  setEditingActivityId(null)
                  setEditingActivity({
                    activity_type: "",
                    position: "",
                    organization: "",
                    description: "",
                    grade_levels: "",
                    participation_timing: "",
                    hours_per_week: "",
                    weeks_per_year: "",
                    continue_in_college: false,
                    impact_statement: "",
                    is_current: false,
                  })
                  setFormSubmitted(false)
                }
              }}
            >
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Extracurricular Activity</DialogTitle>
                </DialogHeader>
                
                <FormErrorSummary errors={formErrors} show={formSubmitted} />
                
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="editType">Activity Type</Label>
                      <Select
                        onValueChange={(value) => setEditingActivity({ ...editingActivity, activity_type: value })}
                        value={editingActivity.activity_type}
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
                      <Label htmlFor="editPosition">Position/Leadership</Label>
                      <Input
                        id="editPosition"
                        maxLength={50}
                        value={editingActivity.position}
                        onChange={(e) => setEditingActivity({ ...editingActivity, position: e.target.value })}
                      />
                      {formErrors.position && <p className="text-sm text-red-500">{formErrors.position}</p>}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="editOrganization">Organization Name</Label>
                      <Input
                        id="editOrganization"
                        maxLength={100}
                        value={editingActivity.organization}
                        onChange={(e) => setEditingActivity({ ...editingActivity, organization: e.target.value })}
                      />
                      {formErrors.organization && <p className="text-sm text-red-500">{formErrors.organization}</p>}
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="editDescription">Description</Label>
                    <Textarea
                      id="editDescription"
                      maxLength={150}
                      value={editingActivity.description}
                      onChange={(e) => setEditingActivity({ ...editingActivity, description: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="editImpact">Impact Statement (Optional)</Label>
                    <Textarea
                      id="editImpact"
                      maxLength={200}
                      placeholder="Describe the impact of your involvement..."
                      value={editingActivity.impact_statement}
                      onChange={(e) => setEditingActivity({ ...editingActivity, impact_statement: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="editGrades">Participation Grade Levels</Label>
                      <Input
                        id="editGrades"
                        placeholder="e.g. 9, 10, 11"
                        value={editingActivity.grade_levels}
                        onChange={(e) => setEditingActivity({ ...editingActivity, grade_levels: e.target.value })}
                      />
                      {formErrors.grade_levels && <p className="text-sm text-red-500">{formErrors.grade_levels}</p>}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="editTiming">Timing of Participation</Label>
                      <Select
                        onValueChange={(value) =>
                          setEditingActivity({ ...editingActivity, participation_timing: value })
                        }
                        value={editingActivity.participation_timing}
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
                      <Label htmlFor="editHoursPerWeek">Hours Spent Per Week</Label>
                      <NumericInput
                        id="editHoursPerWeek"
                        min={0}
                        max={168}
                        value={editingActivity.hours_per_week === "" ? null : parseFloat(editingActivity.hours_per_week)}
                        onChange={(value) => setEditingActivity({ ...editingActivity, hours_per_week: value === null ? "" : value.toString() })}
                      />
                      {formErrors.hours_per_week && <p className="text-sm text-red-500">{formErrors.hours_per_week}</p>}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="editWeeksPerYear">Weeks Spent Per Year</Label>
                      <NumericInput
                        id="editWeeksPerYear"
                        min={0}
                        max={52}
                        value={editingActivity.weeks_per_year === "" ? null : parseFloat(editingActivity.weeks_per_year)}
                        onChange={(value) => setEditingActivity({ ...editingActivity, weeks_per_year: value === null ? "" : value.toString() })}
                      />
                      {formErrors.weeks_per_year && <p className="text-sm text-red-500">{formErrors.weeks_per_year}</p>}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="editIsCurrent"
                      checked={editingActivity.is_current}
                      onCheckedChange={(checked) =>
                        setEditingActivity({ ...editingActivity, is_current: checked as boolean })
                      }
                    />
                    <Label htmlFor="editIsCurrent">I am currently involved in this activity</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="editContinueInCollege"
                      checked={editingActivity.continue_in_college}
                      onCheckedChange={(checked) =>
                        setEditingActivity({ ...editingActivity, continue_in_college: checked as boolean })
                      }
                    />
                    <Label htmlFor="editContinueInCollege">
                      I intend to participate in a similar activity in college
                    </Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={updateActivity}>Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center text-muted-foreground py-6 border rounded-md">
                <Loader2 className="h-5 w-5 animate-spin mx-auto" />
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center text-muted-foreground py-6 border rounded-md">No activities added yet</div>
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
                            openAIAssistant()
                          }}
                        >
                          <Sparkles className="h-4 w-4 mr-1" /> Improve with AI
                        </Button>
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

      {/* AI Assistant */}
      {showAIAssistant && (
        <AIAssistant
          initialContext={{
            type: "extracurricular",
            id: selectedActivity?.id,
            title: selectedActivity?.organization || "Extracurricular Activities",
          }}
          initialPrompt={
            aiAction === "improve" && selectedActivity
              ? `Please help me improve this extracurricular activity for my college applications:\n\n${formatActivityForAI(selectedActivity)}\n\nCan you suggest ways to strengthen the description, highlight the impact better, and make this activity more compelling to college admissions officers?`
              : aiAction === "all"
                ? `${formatAllActivitiesForAI()}\n\nPlease review my extracurricular activities and provide specific advice on how to improve them. Which ones should I emphasize for college applications? Are there any gaps in my profile I should address?`
                : undefined
          }
          showOnLoad={true}
          onClose={() => {
            setShowAIAssistant(false);
            setAiAction(null);
          }}
        />
      )}
      {/* Add the confirmation dialog at the end of the component */}
      <ConfirmationDialog
        open={!!confirmDeleteActivity}
        onOpenChange={(open) => !open && setConfirmDeleteActivity(null)}
        title="Delete Activity"
        description="Are you sure you want to delete this activity? This action cannot be undone."
        confirmText="Delete"
        onConfirm={() => confirmDeleteActivity && deleteActivity(confirmDeleteActivity)}
        variant="destructive"
      />
    </div>
  )
}
