"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  PlusCircle, 
  Edit, 
  Trash2, 
  Copy, 
  Loader2,
  Sparkles 
} from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { handleSupabaseError } from "@/lib/supabase"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"
import { useToast } from "@/components/ui/use-toast"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { validateRequired, isValidNumber } from "@/lib/validation"
import { performDatabaseOperation } from "@/lib/utils"
import AIAssistant from "@/components/ai/AIAssistant"
import { NumericInput } from "@/components/ui/numeric-input"

type CollegeAcademicsProps = {
  collegeId: string
}

type Course = {
  id: string
  name: string
  grade: string
  credits: number
  level: string
  grade_level: string
  term: string
  grade_points: number
  weighted_grade_points: number
  school_year?: string | null
  notes?: string | null
}

export default function CollegeAcademics({ collegeId }: CollegeAcademicsProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [generalCourses, setGeneralCourses] = useState<Course[]>([])
  const [newCourse, setNewCourse] = useState<Partial<Course>>({
    name: "",
    grade: "",
    credits: 0,
    level: "Regular",
    grade_level: "11",
    term: "Fall",
  })
  const [isAddingCourse, setIsAddingCourse] = useState(false)
  const [isEditingCourse, setIsEditingCourse] = useState(false)
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null)
  const [isImportingCourses, setIsImportingCourses] = useState(false)
  const [selectedCourses, setSelectedCourses] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [activeGradeLevel, setActiveGradeLevel] = useState<string>("all")
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [confirmDeleteCourse, setConfirmDeleteCourse] = useState<string | null>(null)
  // Add AI assistant state variables
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = createClientComponentClient<Database>()
  const [collegeName, setCollegeName] = useState<string>("")

  // Update the useEffect to use setTimeout for Supabase calls
  useEffect(() => {
    // wait until we have a real user ID and a collegeId
    if (!user?.id || !collegeId) return
  
    setIsLoading(true)
    // immediately‐invoked async function instead of setTimeout
    ;(async () => {
      try {
        // Fetch college name
        const { data: collegeData, error: collegeError } = await supabase
          .from("colleges")
          .select("name")
          .eq("id", collegeId)
          .single()
        if (collegeError) throw collegeError
        if (collegeData) setCollegeName(collegeData.name)
  
        // Fetch college‐specific courses
        const { data: collegeCoursesData, error: collegeCoursesError } = await supabase
          .from("college_courses")
          .select("*")
          .eq("user_id", user.id)
          .eq("college_id", collegeId)
          .order("created_at", { ascending: false })
        if (collegeCoursesError) throw collegeCoursesError
  
        // Fetch general courses for import
        const { data: generalCoursesData, error: generalCoursesError } = await supabase
          .from("courses")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
        if (generalCoursesError) throw generalCoursesError
  
        setCourses(collegeCoursesData || [])
        setGeneralCourses(generalCoursesData || [])
      } catch (error) {
        toast({
          title: "Error loading courses",
          description: handleSupabaseError(error, "There was a problem loading your courses."),
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    })()
  }, [user?.id, collegeId])
  

  // Validate course form
  const validateCourseForm = (): boolean => {
    const errors: Record<string, string> = {}

    const nameError = validateRequired(newCourse.name, "Course name")
    if (nameError) errors.name = nameError

    const gradeError = validateRequired(newCourse.grade, "Grade")
    if (gradeError) errors.grade = gradeError

    const levelError = validateRequired(newCourse.level, "Course level")
    if (levelError) errors.level = levelError

    const gradeLevelError = validateRequired(newCourse.grade_level, "Grade level")
    if (gradeLevelError) errors.grade_level = gradeLevelError

    const termError = validateRequired(newCourse.term, "Term")
    if (termError) errors.term = termError

    if (!isValidNumber(newCourse.credits)) {
      errors.credits = "Credits must be a valid number"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const getGradePoints = (grade: string, level: string): { regular: number; weighted: number } => {
    const gradeScale: { [key: string]: number } = {
      "A+": 4.0,
      A: 4.0,
      "A-": 3.7,
      "B+": 3.3,
      B: 3.0,
      "B-": 2.7,
      "C+": 2.3,
      C: 2.0,
      "C-": 1.7,
      "D+": 1.3,
      D: 1.0,
      "D-": 0.7,
      F: 0.0,
    }

    const regularPoints = gradeScale[grade] || 0
    let weightedPoints = regularPoints

    // Add weight for honors and AP/IB courses
    if (level === "Honors") {
      weightedPoints += 0.5
    } else if (level === "AP/IB" || level === "College") {
      weightedPoints += 1.0
    }

    return { regular: regularPoints, weighted: weightedPoints }
  }

  const addCourse = async () => {
    if (!user || !collegeId || !validateCourseForm()) return

    await performDatabaseOperation(
      async () => {
        const { regular, weighted } = getGradePoints(newCourse.grade as string, newCourse.level as string)

        const { data, error } = await supabase
          .from("college_courses")
          .insert([
            {
              user_id: user.id,
              college_id: collegeId,
              name: newCourse.name as string,
              grade: newCourse.grade as string,
              credits: newCourse.credits || 1,
              level: newCourse.level as string,
              grade_level: newCourse.grade_level as string,
              term: newCourse.term as string,
              grade_points: regular,
              weighted_grade_points: weighted,
              school_year: newCourse.school_year || null,
              notes: newCourse.notes || null,
            },
          ])
          .select()

        if (error) throw error

        return data
      },
      setIsLoading,
      (data) => {
        if (data) {
          setCourses([data[0], ...courses])
          setNewCourse({
            name: "",
            grade: "",
            credits: 1,
            level: "Regular",
            grade_level: "11",
            term: "Year",
            school_year: "",
            notes: "",
          })
          setIsAddingCourse(false)

          toast({
            title: "Course added",
            description: "Your course has been added successfully.",
          })
        }
      },
      (error) => {
        toast({
          title: "Error adding course",
          description: handleSupabaseError(error, "There was a problem adding the course."),
          variant: "destructive",
        })
      },
    )
  }

  const startEditCourse = (courseId: string) => {
    const courseToEdit = courses.find((c) => c.id === courseId)
    if (courseToEdit) {
      setNewCourse({ ...courseToEdit })
      setEditingCourseId(courseId)
      setIsEditingCourse(true)
    }
  }

  const updateCourse = async () => {
    if (!user || !collegeId || !editingCourseId || !validateCourseForm()) return

    await performDatabaseOperation(
      async () => {
        const { regular, weighted } = getGradePoints(newCourse.grade as string, newCourse.level as string)

        const { error } = await supabase
          .from("college_courses")
          .update({
            name: newCourse.name as string,
            grade: newCourse.grade as string,
            credits: newCourse.credits || 1,
            level: newCourse.level as string,
            grade_level: newCourse.grade_level as string,
            term: newCourse.term as string,
            grade_points: regular,
            weighted_grade_points: weighted,
            school_year: newCourse.school_year || null,
            notes: newCourse.notes || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingCourseId)
          .eq("college_id", collegeId)

        if (error) throw error

        return
      },
      setIsLoading,
      () => {
        setCourses(
          courses.map((course) => {
            if (course.id === editingCourseId) {
              const { regular, weighted } = getGradePoints(newCourse.grade as string, newCourse.level as string)
              return {
                ...course,
                name: newCourse.name as string,
                grade: newCourse.grade as string,
                credits: newCourse.credits || 1,
                level: newCourse.level as string,
                grade_level: newCourse.grade_level as string,
                term: newCourse.term as string,
                grade_points: regular,
                weighted_grade_points: weighted,
                school_year: newCourse.school_year || null,
                notes: newCourse.notes || null,
              }
            }
            return course
          }),
        )
        setNewCourse({
          name: "",
          grade: "",
          credits: 1,
          level: "Regular",
          grade_level: "11",
          term: "Year",
          school_year: "",
          notes: "",
        })
        setIsEditingCourse(false)
        setEditingCourseId(null)

        toast({
          title: "Course updated",
          description: "Your course has been updated successfully.",
        })
      },
      (error) => {
        toast({
          title: "Error updating course",
          description: handleSupabaseError(error, "There was a problem updating the course."),
          variant: "destructive",
        })
      },
    )
  }

  const deleteCourse = async (courseId: string) => {
    if (!user || !collegeId) return

    await performDatabaseOperation(
      async () => {
        const { error } = await supabase
          .from("college_courses")
          .delete()
          .eq("id", courseId)
          .eq("college_id", collegeId)

        if (error) throw error
        return { success: true }
      },
      setIsLoading,
      () => {
        setCourses(courses.filter((course) => course.id !== courseId))
        setConfirmDeleteCourse(null)
        
        toast({
          title: "Course deleted",
          description: "Your course has been deleted successfully.",
        })
      },
      (error) => {
        toast({
          title: "Error deleting course",
          description: handleSupabaseError(error, "There was a problem deleting the course."),
          variant: "destructive",
        })
      }
    )
  }

  const importCourses = async () => {
    if (!user || !collegeId) return

    const selectedCourseIds = Object.entries(selectedCourses)
      .filter(([_, isSelected]) => isSelected)
      .map(([id, _]) => id)

    if (selectedCourseIds.length === 0) {
      toast({
        title: "No courses selected",
        description: "Please select at least one course to import.",
        variant: "destructive",
      })
      return
    }

    await performDatabaseOperation(
      async () => {
        const coursesToImport = generalCourses.filter((course) => selectedCourseIds.includes(course.id))

        const coursesData = coursesToImport.map((course) => ({
          user_id: user.id,
          college_id: collegeId,
          name: course.name,
          grade: course.grade,
          credits: course.credits,
          level: course.level,
          grade_level: course.grade_level,
          term: course.term,
          grade_points: course.grade_points,
          weighted_grade_points: course.weighted_grade_points,
          school_year: course.school_year,
          notes: course.notes,
        }))

        const { data, error } = await supabase.from("college_courses").insert(coursesData).select()

        if (error) throw error
        return data
      },
      setIsLoading,
      (data) => {
        if (data) {
          setCourses([...data, ...courses])
          setSelectedCourses({})
          setIsImportingCourses(false)

          toast({
            title: "Courses imported",
            description: `${data.length} course(s) have been imported successfully.`,
          })
        }
      },
      (error) => {
        toast({
          title: "Error importing courses",
          description: handleSupabaseError(error, "There was a problem importing the courses."),
          variant: "destructive",
        })
      },
    )
  }

  // Filter courses based on active grade level
  const filteredCourses =
    activeGradeLevel === "all" ? courses : courses.filter((course) => course.grade_level === activeGradeLevel)

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "AP/IB":
        return <Badge className="bg-blue-500 text-white">AP/IB</Badge>
      case "Honors":
        return <Badge className="bg-purple-500 text-white">Honors</Badge>
      case "College":
        return <Badge className="bg-green-500 text-white">College</Badge>
      default:
        return <Badge variant="outline">Regular</Badge>
    }
  }

  // Add a simple function to open the AI Assistant without specific data
  const openAIAssistant = () => {
    setShowAIAssistant(true);
  }

  if (isLoading && courses.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">{collegeName ? `${collegeName} Courses` : 'College Courses'}</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => openAIAssistant()}
          >
            <Sparkles className="h-4 w-4" /> AI Assistance
          </Button>
          <Button variant="outline" className="flex items-center gap-1" onClick={() => setIsImportingCourses(true)}>
            <Copy className="h-4 w-4" /> Import Courses
          </Button>
          <Button className="flex items-center gap-1" onClick={() => setIsAddingCourse(true)}>
            <PlusCircle className="h-4 w-4" /> Add Course
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex overflow-x-auto pb-2 mb-4">
            <div className="flex space-x-2">
              <Button
                variant={activeGradeLevel === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveGradeLevel("all")}
              >
                All Grades
              </Button>
              <Button
                variant={activeGradeLevel === "9" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveGradeLevel("9")}
              >
                9th Grade
              </Button>
              <Button
                variant={activeGradeLevel === "10" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveGradeLevel("10")}
              >
                10th Grade
              </Button>
              <Button
                variant={activeGradeLevel === "11" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveGradeLevel("11")}
              >
                11th Grade
              </Button>
              <Button
                variant={activeGradeLevel === "12" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveGradeLevel("12")}
              >
                12th Grade
              </Button>
            </div>
          </div>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                      No courses added yet
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCourses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell>{course.name}</TableCell>
                      <TableCell>{course.grade}</TableCell>
                      <TableCell>{getLevelBadge(course.level)}</TableCell>
                      <TableCell>{course.term}</TableCell>
                      <TableCell>{course.credits}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => startEditCourse(course.id)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setConfirmDeleteCourse(course.id)}>
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

      {/* Add Course Dialog */}
      <Dialog open={isAddingCourse} onOpenChange={setIsAddingCourse}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Course</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Course Name</Label>
              <Input
                id="name"
                value={newCourse.name || ""}
                onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
              />
              {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="grade">Grade Received</Label>
                <Select
                  value={newCourse.grade || ""}
                  onValueChange={(value) => setNewCourse({ ...newCourse, grade: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="C+">C+</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="C-">C-</SelectItem>
                    <SelectItem value="D+">D+</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                    <SelectItem value="D-">D-</SelectItem>
                    <SelectItem value="F">F</SelectItem>
                    <SelectItem value="P">Pass</SelectItem>
                    <SelectItem value="NP">No Pass</SelectItem>
                    <SelectItem value="IP">In Progress</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.grade && <p className="text-sm text-red-500">{formErrors.grade}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="level">Course Level</Label>
                <Select
                  value={newCourse.level || "Regular"}
                  onValueChange={(value) =>
                    setNewCourse({
                      ...newCourse,
                      level: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Regular">Regular</SelectItem>
                    <SelectItem value="Honors">Honors</SelectItem>
                    <SelectItem value="AP/IB">AP/IB</SelectItem>
                    <SelectItem value="College">College/Dual Enrollment</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.level && <p className="text-sm text-red-500">{formErrors.level}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="gradeLevel">Grade Level</Label>
                <Select
                  value={newCourse.grade_level || "11"}
                  onValueChange={(value) =>
                    setNewCourse({
                      ...newCourse,
                      grade_level: value,
                    })
                  }
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
                <Label htmlFor="term">Term</Label>
                <Select
                  value={newCourse.term || "Year"}
                  onValueChange={(value) =>
                    setNewCourse({
                      ...newCourse,
                      term: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fall">Fall</SelectItem>
                    <SelectItem value="Spring">Spring</SelectItem>
                    <SelectItem value="Year">Full Year</SelectItem>
                    <SelectItem value="Summer">Summer</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.term && <p className="text-sm text-red-500">{formErrors.term}</p>}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="credits">Credits</Label>
              <NumericInput
                id="credits"
                min={0.5}
                max={10}
                value={typeof newCourse.credits === 'number' ? newCourse.credits : null}
                onChange={(value) => setNewCourse({ ...newCourse, credits: value === null ? 1 : value })}
              />
              {formErrors.credits && <p className="text-sm text-red-500">{formErrors.credits}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="schoolYear">School Year (Optional)</Label>
              <Input
                id="schoolYear"
                placeholder="e.g., 2024-2025"
                value={newCourse.school_year || ""}
                onChange={(e) => setNewCourse({ ...newCourse, school_year: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                value={newCourse.notes || ""}
                onChange={(e) => setNewCourse({ ...newCourse, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={addCourse}>Add Course</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog
        open={isEditingCourse}
        onOpenChange={(open) => {
          if (!open) {
            setIsEditingCourse(false)
            setEditingCourseId(null)
            setNewCourse({
              name: "",
              grade: "",
              credits: 1,
              level: "Regular",
              grade_level: "11",
              term: "Year",
              school_year: "",
              notes: "",
            })
            setFormErrors({})
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Course Name</Label>
              <Input
                id="name"
                value={newCourse.name || ""}
                onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
              />
              {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="grade">Grade Received</Label>
                <Select
                  value={newCourse.grade || ""}
                  onValueChange={(value) => setNewCourse({ ...newCourse, grade: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="C+">C+</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="C-">C-</SelectItem>
                    <SelectItem value="D+">D+</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                    <SelectItem value="D-">D-</SelectItem>
                    <SelectItem value="F">F</SelectItem>
                    <SelectItem value="P">Pass</SelectItem>
                    <SelectItem value="NP">No Pass</SelectItem>
                    <SelectItem value="IP">In Progress</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.grade && <p className="text-sm text-red-500">{formErrors.grade}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="level">Course Level</Label>
                <Select
                  value={newCourse.level || "Regular"}
                  onValueChange={(value) =>
                    setNewCourse({
                      ...newCourse,
                      level: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Regular">Regular</SelectItem>
                    <SelectItem value="Honors">Honors</SelectItem>
                    <SelectItem value="AP/IB">AP/IB</SelectItem>
                    <SelectItem value="College">College/Dual Enrollment</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.level && <p className="text-sm text-red-500">{formErrors.level}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="gradeLevel">Grade Level</Label>
                <Select
                  value={newCourse.grade_level || "11"}
                  onValueChange={(value) =>
                    setNewCourse({
                      ...newCourse,
                      grade_level: value,
                    })
                  }
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
                <Label htmlFor="term">Term</Label>
                <Select
                  value={newCourse.term || "Year"}
                  onValueChange={(value) =>
                    setNewCourse({
                      ...newCourse,
                      term: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fall">Fall</SelectItem>
                    <SelectItem value="Spring">Spring</SelectItem>
                    <SelectItem value="Year">Full Year</SelectItem>
                    <SelectItem value="Summer">Summer</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.term && <p className="text-sm text-red-500">{formErrors.term}</p>}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="credits">Credits</Label>
              <NumericInput
                id="credits"
                min={0.5}
                max={10}
                value={typeof newCourse.credits === 'number' ? newCourse.credits : null}
                onChange={(value) => setNewCourse({ ...newCourse, credits: value === null ? 1 : value })}
              />
              {formErrors.credits && <p className="text-sm text-red-500">{formErrors.credits}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="schoolYear">School Year (Optional)</Label>
              <Input
                id="schoolYear"
                placeholder="e.g., 2024-2025"
                value={newCourse.school_year || ""}
                onChange={(e) => setNewCourse({ ...newCourse, school_year: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                value={newCourse.notes || ""}
                onChange={(e) => setNewCourse({ ...newCourse, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={updateCourse}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Courses Dialog */}
      <Dialog open={isImportingCourses} onOpenChange={setIsImportingCourses}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Import Courses</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Select courses from your general academics to import for this college application.
            </p>
            {generalCourses.length === 0 ? (
              <div className="text-center py-6 border rounded-md">
                <p className="text-muted-foreground">No general courses found to import.</p>
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">Select</TableHead>
                      <TableHead>Course Name</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Grade Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {generalCourses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={!!selectedCourses[course.id]}
                            onChange={(e) => setSelectedCourses({ ...selectedCourses, [course.id]: e.target.checked })}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                        </TableCell>
                        <TableCell>{course.name}</TableCell>
                        <TableCell>{course.grade}</TableCell>
                        <TableCell>{course.level}</TableCell>
                        <TableCell>{course.grade_level}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportingCourses(false)}>
              Cancel
            </Button>
            <Button onClick={importCourses} disabled={generalCourses.length === 0}>
              Import Selected
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={!!confirmDeleteCourse}
        onOpenChange={(open) => !open && setConfirmDeleteCourse(null)}
        title="Delete Course"
        description="Are you sure you want to delete this course? This action cannot be undone."
        confirmText="Delete"
        onConfirm={() => {
          if (confirmDeleteCourse) {
            deleteCourse(confirmDeleteCourse)
          }
        }}
        variant="destructive"
      />

      {/* AI Assistant */}
      {showAIAssistant && (
        <AIAssistant
          showOnLoad={true}
          initialContext={{
            type: "academics"
          }}
          onClose={() => setShowAIAssistant(false)}
        />
      )}
    </div>
  )
}
