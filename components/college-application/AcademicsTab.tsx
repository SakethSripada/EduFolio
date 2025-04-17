"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Edit, Trash2, Calculator, Sparkles, Info, FileEdit, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import AIAssistant from "@/components/ai/AIAssistant"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/components/auth/AuthProvider"
import { supabase, handleSupabaseError } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { isValidGPA, isValidNumber, validateRequired } from "@/lib/validation"
import { performDatabaseOperation } from "@/lib/utils"

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

type TestScore = {
  id: string
  test_name: string
  score: number
  max_score?: number | null
  test_date?: string | null
  test_date_display?: string | null
  notes?: string | null
}

type ManualGPA = {
  id?: string
  user_id?: string
  unweighted: number
  weighted: number
  uc_gpa: number
  use_manual: boolean
  created_at?: string
  updated_at?: string
}

export default function AcademicsTab() {
  const [courses, setCourses] = useState<Course[]>([])
  const [testScores, setTestScores] = useState<TestScore[]>([])
  const [newCourse, setNewCourse] = useState<Partial<Course>>({
    name: "",
    grade: "",
    credits: 1,
    level: "Regular",
    grade_level: "11",
    term: "Year",
  })
  const [newTestScore, setNewTestScore] = useState({
    test_name: "",
    score: "",
    max_score: "",
    test_date_display: "",
    notes: "",
  })
  const [isAddingCourse, setIsAddingCourse] = useState(false)
  const [isEditingCourse, setIsEditingCourse] = useState(false)
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null)
  const [isCalculatingGPA, setIsCalculatingGPA] = useState(false)
  const [activeGradeLevel, setActiveGradeLevel] = useState<string>("all")
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [isEditingGPA, setIsEditingGPA] = useState(false)
  const [manualGPA, setManualGPA] = useState<ManualGPA>({
    unweighted: 0.0,
    weighted: 0.0,
    uc_gpa: 0.0,
    use_manual: false,
  })
  const [isEditingTestScore, setIsEditingTestScore] = useState(false)
  const [editingTestScoreId, setEditingTestScoreId] = useState<string | null>(null)
  const [editingTestScore, setEditingTestScore] = useState({
    test_name: "",
    score: "",
    max_score: "",
    test_date_display: "",
    notes: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const { user } = useAuth()
  const { toast } = useToast()

  // Add state for confirmation dialog
  const [confirmDeleteCourse, setConfirmDeleteCourse] = useState<string | null>(null)
  const [confirmDeleteTestScore, setConfirmDeleteTestScore] = useState<string | null>(null)

  const [aiAction, setAiAction] = useState<"courses" | "testscores" | "gpa" | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      performDatabaseOperation(
        async () => {
          // Fetch courses
          const { data: coursesData, error: coursesError } = await supabase
            .from("courses")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })

          if (coursesError) throw coursesError

          // Fetch test scores
          const { data: testScoresData, error: testScoresError } = await supabase
            .from("test_scores")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })

          if (testScoresError) throw testScoresError

          // Fetch manual GPA settings
          const { data: gpaData, error: gpaError } = await supabase
            .from("manual_gpa")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle()

          if (gpaError && gpaError.code !== "PGRST116") throw gpaError

          return { coursesData, testScoresData, gpaData }
        },
        setIsLoading,
        (data) => {
          if (data.coursesData) setCourses(data.coursesData)
          if (data.testScoresData) setTestScores(data.testScoresData)
          if (data.gpaData) {
            setManualGPA({
              id: data.gpaData.id,
              user_id: data.gpaData.user_id,
              unweighted: data.gpaData.unweighted,
              weighted: data.gpaData.weighted,
              uc_gpa: data.gpaData.uc_gpa,
              use_manual: data.gpaData.use_manual,
              created_at: data.gpaData.created_at,
              updated_at: data.gpaData.updated_at,
            })
          }
        },
        (error) => {
          toast({
            title: "Error loading academics data",
            description: handleSupabaseError(error, "There was a problem loading your academics data."),
            variant: "destructive",
          })
        },
      )
    }

    fetchData()
  }, [user, toast])

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

  // Validate test score form
  const validateTestScoreForm = (isEditing: boolean): boolean => {
    const formData = isEditing ? editingTestScore : newTestScore
    const errors: Record<string, string> = {}

    const testNameError = validateRequired(formData.test_name, "Test name")
    if (testNameError) errors.test_name = testNameError

    const scoreError = validateRequired(formData.score, "Score")
    if (scoreError) errors.score = scoreError

    if (formData.score && !isValidNumber(formData.score)) {
      errors.score = "Score must be a valid number"
    }

    if (formData.max_score && !isValidNumber(formData.max_score)) {
      errors.max_score = "Maximum score must be a valid number"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Validate GPA form
  const validateGPAForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!isValidGPA(manualGPA.unweighted)) {
      errors.unweighted = "Unweighted GPA must be between 0 and 4.0"
    }

    if (!isValidGPA(manualGPA.weighted)) {
      errors.weighted = "Weighted GPA must be between 0 and 5.0"
    }

    if (!isValidGPA(manualGPA.uc_gpa)) {
      errors.uc_gpa = "UC GPA must be between 0 and 5.0"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // GPA calculation
  const calculateGPA = (weighted: boolean, includeNinthGrade = true) => {
    if (manualGPA.use_manual) {
      if (weighted) {
        return includeNinthGrade ? manualGPA.weighted : manualGPA.uc_gpa
      } else {
        return manualGPA.unweighted
      }
    }

    let filteredCourses = courses

    if (!includeNinthGrade) {
      filteredCourses = courses.filter((course) => course.grade_level !== "9")
    }

    if (filteredCourses.length === 0) return 0

    const totalCredits = filteredCourses.reduce((sum, course) => sum + course.credits, 0)
    const totalPoints = filteredCourses.reduce((sum, course) => {
      return sum + (weighted ? course.weighted_grade_points : course.grade_points) * course.credits
    }, 0)

    return totalCredits > 0 ? totalPoints / totalCredits : 0
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
    if (!user || !validateCourseForm()) return

    performDatabaseOperation(
      async () => {
        const { regular, weighted } = getGradePoints(newCourse.grade as string, newCourse.level as string)

        const { data, error } = await supabase
          .from("courses")
          .insert([
            {
              user_id: user.id,
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
    if (!user || !editingCourseId || !validateCourseForm()) return

    performDatabaseOperation(
      async () => {
        const { regular, weighted } = getGradePoints(newCourse.grade as string, newCourse.level as string)

        const { error } = await supabase
          .from("courses")
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

        if (error) throw error

        return
      },
      setIsLoading,
      () => {
        const { regular, weighted } = getGradePoints(newCourse.grade as string, newCourse.level as string)
        setCourses(
          courses.map((course) => {
            if (course.id === editingCourseId) {
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
    if (!user) return

    performDatabaseOperation(
      async () => {
        const { error } = await supabase.from("courses").delete().eq("id", courseId)
        if (error) throw error
        return
      },
      setIsLoading,
      () => {
        setCourses(courses.filter((course) => course.id !== courseId))
        toast({
          title: "Course deleted",
          description: "Your course has been deleted successfully.",
        })
        setConfirmDeleteCourse(null)
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

  const addTestScore = async () => {
    if (!user || !validateTestScoreForm(false)) return

    performDatabaseOperation(
      async () => {
        const { data, error } = await supabase
          .from("test_scores")
          .insert([
            {
              user_id: user.id,
              test_name: newTestScore.test_name,
              score: Number(newTestScore.score),
              max_score: newTestScore.max_score ? Number(newTestScore.max_score) : null,
              test_date_display: newTestScore.test_date_display || null,
              notes: newTestScore.notes || null,
            },
          ])
          .select()

        if (error) throw error

        return data
      },
      setIsLoading,
      (data) => {
        if (data) {
          setTestScores([data[0], ...testScores])
          setNewTestScore({
            test_name: "",
            score: "",
            max_score: "",
            test_date_display: "",
            notes: "",
          })

          toast({
            title: "Test score added",
            description: "Your test score has been added successfully.",
          })
        }
      },
      (error) => {
        toast({
          title: "Error adding test score",
          description: handleSupabaseError(error, "There was a problem adding the test score."),
          variant: "destructive",
        })
      },
    )
  }

  const deleteTestScore = async (scoreId: string) => {
    if (!user) return

    performDatabaseOperation(
      async () => {
        const { error } = await supabase.from("test_scores").delete().eq("id", scoreId)
        if (error) throw error
        return
      },
      setIsLoading,
      () => {
        setTestScores(testScores.filter((score) => score.id !== scoreId))
        toast({
          title: "Test score deleted",
          description: "Your test score has been deleted successfully.",
        })
        setConfirmDeleteTestScore(null)
      },
      (error) => {
        toast({
          title: "Error deleting test score",
          description: handleSupabaseError(error, "There was a problem deleting the test score."),
          variant: "destructive",
        })
      }
    )
  }

  const startEditTestScore = (scoreId: string) => {
    const scoreToEdit = testScores.find((s) => s.id === scoreId)
    if (scoreToEdit) {
      setEditingTestScore({
        test_name: scoreToEdit.test_name,
        score: scoreToEdit.score.toString(),
        max_score: scoreToEdit.max_score?.toString() || "",
        test_date_display: scoreToEdit.test_date_display || "",
        notes: scoreToEdit.notes || "",
      })
      setEditingTestScoreId(scoreId)
      setIsEditingTestScore(true)
    }
  }

  const updateTestScore = async () => {
    if (!user || !editingTestScoreId || !validateTestScoreForm(true)) return

    performDatabaseOperation(
      async () => {
        const { error } = await supabase
          .from("test_scores")
          .update({
            test_name: editingTestScore.test_name,
            score: Number(editingTestScore.score),
            max_score: editingTestScore.max_score ? Number(editingTestScore.max_score) : null,
            test_date_display: editingTestScore.test_date_display || null,
            notes: editingTestScore.notes || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingTestScoreId)

        if (error) throw error

        return
      },
      setIsLoading,
      () => {
        setTestScores(
          testScores.map((score) => {
            if (score.id === editingTestScoreId) {
              return {
                ...score,
                test_name: editingTestScore.test_name,
                score: Number(editingTestScore.score),
                max_score: editingTestScore.max_score ? Number(editingTestScore.max_score) : null,
                test_date_display: editingTestScore.test_date_display || null,
                notes: editingTestScore.notes || null,
              }
            }
            return score
          }),
        )
        setIsEditingTestScore(false)
        setEditingTestScoreId(null)
        setEditingTestScore({
          test_name: "",
          score: "",
          max_score: "",
          test_date_display: "",
          notes: "",
        })

        toast({
          title: "Test score updated",
          description: "Your test score has been updated successfully.",
        })
      },
      (error) => {
        toast({
          title: "Error updating test score",
          description: handleSupabaseError(error, "There was a problem updating the test score."),
          variant: "destructive",
        })
      },
    )
  }

  const saveManualGPA = async () => {
    if (!user || !validateGPAForm()) return

    setIsLoading(true)

    try {
      // Check if manual GPA record exists
      if (manualGPA.id) {
        // Update existing record
        const { error } = await supabase
          .from("manual_gpa")
          .update({
            unweighted: manualGPA.unweighted,
            weighted: manualGPA.weighted,
            uc_gpa: manualGPA.uc_gpa,
            use_manual: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", manualGPA.id)

        if (error) throw error
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from("manual_gpa")
          .insert({
            user_id: user.id,
            unweighted: manualGPA.unweighted,
            weighted: manualGPA.weighted,
            uc_gpa: manualGPA.uc_gpa,
            use_manual: true,
          })
          .select()

        if (error) throw error

        if (data && data[0]) {
          setManualGPA({
            ...manualGPA,
            id: data[0].id,
            user_id: data[0].user_id,
            created_at: data[0].created_at,
            updated_at: data[0].updated_at,
          })
        }
      }

      setIsEditingGPA(false)
      toast({
        title: "GPA saved",
        description: "Your manual GPA has been saved successfully.",
      })
    } catch (error) {
      console.error("Error saving manual GPA:", error)
      toast({
        title: "Error saving GPA",
        description: handleSupabaseError(error, "There was a problem saving your manual GPA."),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleUseManualGPA = async (useManual: boolean) => {
    if (!user) return

    setIsLoading(true)

    try {
      if (manualGPA.id) {
        // Update existing record
        const { error } = await supabase
          .from("manual_gpa")
          .update({
            use_manual: useManual,
            updated_at: new Date().toISOString(),
          })
          .eq("id", manualGPA.id)

        if (error) throw error

        setManualGPA({
          ...manualGPA,
          use_manual: useManual,
        })
      } else if (useManual) {
        // Only create a new record if we're enabling manual GPA
        const { data, error } = await supabase
          .from("manual_gpa")
          .insert({
            user_id: user.id,
            unweighted: manualGPA.unweighted,
            weighted: manualGPA.weighted,
            uc_gpa: manualGPA.uc_gpa,
            use_manual: useManual,
          })
          .select()

        if (error) throw error

        if (data && data[0]) {
          setManualGPA({
            ...manualGPA,
            id: data[0].id,
            user_id: data[0].user_id,
            use_manual: useManual,
            created_at: data[0].created_at,
            updated_at: data[0].updated_at,
          })
        }
      }

      toast({
        title: "GPA settings updated",
        description: `Now using ${useManual ? "manually entered" : "calculated"} GPA.`,
      })
    } catch (error) {
      console.error("Error toggling manual GPA:", error)
      toast({
        title: "Error updating GPA settings",
        description: handleSupabaseError(error, "There was a problem updating your GPA settings."),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredCourses =
    activeGradeLevel === "all" ? courses : courses.filter((course) => course.grade_level === activeGradeLevel)

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "AP/IB":
        return <Badge className="bg-blue-500">AP/IB</Badge>
      case "Honors":
        return <Badge className="bg-purple-500">Honors</Badge>
      case "College":
        return <Badge className="bg-green-500">College</Badge>
      default:
        return <Badge variant="outline">Regular</Badge>
    }
  }

  // Format courses for AI
  const formatCoursesForAI = () => {
    if (courses.length === 0) {
      return "You haven't added any courses yet.";
    }

    const coursesByGradeLevel: Record<string, Course[]> = {};
    
    courses.forEach(course => {
      if (!coursesByGradeLevel[course.grade_level]) {
        coursesByGradeLevel[course.grade_level] = [];
      }
      coursesByGradeLevel[course.grade_level].push(course);
    });

    let formattedText = "Here is your academic course information:\n\n";
    
    Object.keys(coursesByGradeLevel).sort().forEach(gradeLevel => {
      formattedText += `Grade ${gradeLevel}:\n`;
      coursesByGradeLevel[gradeLevel].forEach(course => {
        formattedText += `- ${course.name} (${course.level}) - Grade: ${course.grade}, Credits: ${course.credits}, Term: ${course.term}\n`;
      });
      formattedText += '\n';
    });

    return formattedText;
  };

  // Format test scores for AI
  const formatTestScoresForAI = () => {
    if (testScores.length === 0) {
      return "You haven't added any test scores yet.";
    }

    let formattedText = "Here are your test scores:\n\n";
    
    testScores.forEach(score => {
      formattedText += `${score.test_name}: ${score.score}`;
      if (score.max_score) formattedText += ` out of ${score.max_score}`;
      if (score.test_date_display) formattedText += ` (${score.test_date_display})`;
      if (score.notes) formattedText += ` - Notes: ${score.notes}`;
      formattedText += '\n';
    });

    return formattedText;
  };

  // Calculate UC GPA (needed for format GPA for AI)
  const calculateUCGPA = (coursesToCalculate: Course[]) => {
    return calculateGPA(true, false);
  }

  // Format GPA information for AI
  const formatGPAForAI = () => {
    let formattedText = "GPA Information:\n";
    
    if (manualGPA.use_manual) {
      formattedText += `- Using manually entered GPA values\n`;
      formattedText += `- Unweighted GPA: ${manualGPA.unweighted}\n`;
      formattedText += `- Weighted GPA: ${manualGPA.weighted}\n`;
      formattedText += `- UC GPA: ${manualGPA.uc_gpa}\n`;
    } else {
      const unweighted = calculateGPA(false);
      const weighted = calculateGPA(true);
      const ucGPA = calculateGPA(true, false);
      
      formattedText += `- Using calculated GPA values\n`;
      formattedText += `- Unweighted GPA: ${unweighted}\n`;
      formattedText += `- Weighted GPA: ${weighted}\n`;
      formattedText += `- UC GPA: ${ucGPA}\n`;
    }

    return formattedText;
  };

  // Format all academic data for AI
  const formatAllAcademicDataForAI = () => {
    return `${formatCoursesForAI()}\n${formatTestScoresForAI()}\n${formatGPAForAI()}\n\nWhat would you like to know about your academic profile?`;
  };

  // Open AI assistant for course recommendations
  const openAIAssistantForCourses = () => {
    setAiAction("courses");
    setShowAIAssistant(true);
  };

  return (
    <div className="space-y-8">
      {/* GPA Summary Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Your GPA</CardTitle>
              <CardDescription>Academic performance summary</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-1" onClick={() => setIsEditingGPA(true)}>
                <FileEdit className="h-4 w-4" /> Enter GPA Manually
              </Button>
              <Button variant="outline" className="gap-1" onClick={() => setIsCalculatingGPA(true)}>
                <Calculator className="h-4 w-4" /> Calculate GPA
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card rounded-lg p-4 border shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Cumulative GPA</div>
              <div className="text-3xl font-bold">{calculateGPA(false).toFixed(2)}</div>
              <div className="text-xs text-muted-foreground mt-1">Unweighted</div>
            </div>
            <div className="bg-card rounded-lg p-4 border shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Weighted GPA</div>
              <div className="text-3xl font-bold">{calculateGPA(true).toFixed(2)}</div>
              <div className="text-xs text-muted-foreground mt-1">Including honors/AP bonus</div>
            </div>
            <div className="bg-card rounded-lg p-4 border shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">UC GPA</div>
              <div className="text-3xl font-bold">{calculateGPA(true, false).toFixed(2)}</div>
              <div className="text-xs text-muted-foreground mt-1">10-12th grade, weighted</div>
            </div>
          </div>
          {manualGPA.use_manual && (
            <div className="mt-4 p-2 bg-muted/30 rounded-md text-sm text-center text-muted-foreground">
              Using manually entered GPA values.{" "}
              <Button variant="link" className="p-0 h-auto" onClick={() => toggleUseManualGPA(false)}>
                Switch to calculated GPA
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Courses Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Courses
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-full"
                          onClick={() => openAIAssistantForCourses()}
                        >
                          <Sparkles className="h-4 w-4 text-primary" />
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Ask AI for course recommendations</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
              <CardDescription>Track your academic courses by grade level</CardDescription>
            </div>
            <Button className="flex items-center gap-1" onClick={() => setIsAddingCourse(true)}>
              <PlusCircle className="h-4 w-4" /> Add Course
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeGradeLevel} onValueChange={setActiveGradeLevel} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Grades</TabsTrigger>
              <TabsTrigger value="9">9th Grade</TabsTrigger>
              <TabsTrigger value="10">10th Grade</TabsTrigger>
              <TabsTrigger value="11">11th Grade</TabsTrigger>
              <TabsTrigger value="12">12th Grade</TabsTrigger>
            </TabsList>

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
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : filteredCourses.length === 0 ? (
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
          </Tabs>
        </CardContent>
      </Card>

      {/* Test Scores Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Test Scores</CardTitle>
              <CardDescription>Record your standardized test results</CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-1">
                  <PlusCircle className="h-4 w-4" /> Add Test Score
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Test Score</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="test">Test</Label>
                    <Select
                      onValueChange={(value) => setNewTestScore({ ...newTestScore, test_name: value })}
                      value={newTestScore.test_name}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a test" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SAT">SAT</SelectItem>
                        <SelectItem value="ACT">ACT</SelectItem>
                        <SelectItem value="AP Biology">AP Biology</SelectItem>
                        <SelectItem value="AP Calculus AB">AP Calculus AB</SelectItem>
                        <SelectItem value="AP Calculus BC">AP Calculus BC</SelectItem>
                        <SelectItem value="AP Chemistry">AP Chemistry</SelectItem>
                        <SelectItem value="AP Physics">AP Physics</SelectItem>
                        <SelectItem value="AP English Literature">AP English Literature</SelectItem>
                        <SelectItem value="AP English Language">AP English Language</SelectItem>
                        <SelectItem value="AP U.S. History">AP U.S. History</SelectItem>
                        <SelectItem value="SAT Subject Test">SAT Subject Test</SelectItem>
                        <SelectItem value="TOEFL">TOEFL</SelectItem>
                        <SelectItem value="IELTS">IELTS</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.test_name && <p className="text-sm text-red-500">{formErrors.test_name}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="score">Score</Label>
                      <Input
                        id="score"
                        type="number"
                        value={newTestScore.score}
                        onChange={(e) => setNewTestScore({ ...newTestScore, score: e.target.value })}
                      />
                      {formErrors.score && <p className="text-sm text-red-500">{formErrors.score}</p>}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="maxScore">Max Possible Score (Optional)</Label>
                      <Input
                        id="maxScore"
                        type="number"
                        value={newTestScore.max_score}
                        onChange={(e) => setNewTestScore({ ...newTestScore, max_score: e.target.value })}
                      />
                      {formErrors.max_score && <p className="text-sm text-red-500">{formErrors.max_score}</p>}
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date">Test Date</Label>
                    <Input
                      id="date"
                      type="text"
                      placeholder="e.g., May 2025"
                      value={newTestScore.test_date_display}
                      onChange={(e) => setNewTestScore({ ...newTestScore, test_date_display: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Input
                      id="notes"
                      value={newTestScore.notes}
                      onChange={(e) => setNewTestScore({ ...newTestScore, notes: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={addTestScore}>Add Test Score</Button>
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
                  <TableHead>Test</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : testScores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                      No test scores added yet
                    </TableCell>
                  </TableRow>
                ) : (
                  testScores.map((score) => (
                    <TableRow key={score.id}>
                      <TableCell>{score.test_name}</TableCell>
                      <TableCell>
                        {score.score}
                        {score.max_score ? ` / ${score.max_score}` : ""}
                      </TableCell>
                      <TableCell>{score.test_date_display || "Not specified"}</TableCell>
                      <TableCell>{score.notes || "-"}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => startEditTestScore(score.id)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setConfirmDeleteTestScore(score.id)}>
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

      {/* Edit Test Score Dialog */}
      <Dialog open={isEditingTestScore} onOpenChange={setIsEditingTestScore}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Test Score</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editTest">Test</Label>
              <Select
                value={editingTestScore.test_name}
                onValueChange={(value) => setEditingTestScore({ ...editingTestScore, test_name: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a test" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SAT">SAT</SelectItem>
                  <SelectItem value="ACT">ACT</SelectItem>
                  <SelectItem value="AP Biology">AP Biology</SelectItem>
                  <SelectItem value="AP Calculus AB">AP Calculus AB</SelectItem>
                  <SelectItem value="AP Calculus BC">AP Calculus BC</SelectItem>
                  <SelectItem value="AP Chemistry">AP Chemistry</SelectItem>
                  <SelectItem value="AP Physics">AP Physics</SelectItem>
                  <SelectItem value="AP English Literature">AP English Literature</SelectItem>
                  <SelectItem value="AP English Language">AP English Language</SelectItem>
                  <SelectItem value="AP U.S. History">AP U.S. History</SelectItem>
                  <SelectItem value="SAT Subject Test">SAT Subject Test</SelectItem>
                  <SelectItem value="TOEFL">TOEFL</SelectItem>
                  <SelectItem value="IELTS">IELTS</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.test_name && <p className="text-sm text-red-500">{formErrors.test_name}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="editScore">Score</Label>
                <Input
                  id="editScore"
                  type="number"
                  value={editingTestScore.score}
                  onChange={(e) => setEditingTestScore({ ...editingTestScore, score: e.target.value })}
                />
                {formErrors.score && <p className="text-sm text-red-500">{formErrors.score}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editMaxScore">Max Possible Score (Optional)</Label>
                <Input
                  id="editMaxScore"
                  type="number"
                  value={editingTestScore.max_score}
                  onChange={(e) => setEditingTestScore({ ...editingTestScore, max_score: e.target.value })}
                />
                {formErrors.max_score && <p className="text-sm text-red-500">{formErrors.max_score}</p>}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editDate">Test Date</Label>
              <Input
                id="editDate"
                type="text"
                placeholder="e.g., May 2025"
                value={editingTestScore.test_date_display}
                onChange={(e) => setEditingTestScore({ ...editingTestScore, test_date_display: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editNotes">Notes (Optional)</Label>
              <Input
                id="editNotes"
                value={editingTestScore.notes}
                onChange={(e) => setEditingTestScore({ ...editingTestScore, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={updateTestScore}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Course Dialog */}
      <Dialog
        open={isAddingCourse || isEditingCourse}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddingCourse(false)
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
            <DialogTitle>{isEditingCourse ? "Edit Course" : "Add New Course"}</DialogTitle>
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
              <Input
                id="credits"
                type="number"
                min="0.5"
                max="2"
                step="0.5"
                value={newCourse.credits || 1}
                onChange={(e) => setNewCourse({ ...newCourse, credits: Number.parseFloat(e.target.value) })}
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
            <Button onClick={isEditingCourse ? updateCourse : addCourse}>
              {isEditingCourse ? "Save Changes" : "Add Course"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual GPA Entry Dialog */}
      <Dialog open={isEditingGPA} onOpenChange={setIsEditingGPA}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Enter GPA Manually</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="useManualGPA">Use manually entered GPA</Label>
              <Switch
                id="useManualGPA"
                checked={manualGPA.use_manual}
                onCheckedChange={(checked) => {
                  setManualGPA({ ...manualGPA, use_manual: checked })
                  toggleUseManualGPA(checked)
                }}
              />
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="unweighted">Unweighted GPA</Label>
                <Input
                  id="unweighted"
                  type="number"
                  min="0"
                  max="4.0"
                  step="0.01"
                  value={manualGPA.unweighted.toString()}
                  onChange={(e) => {
                    const value = e.target.value === "" ? 0 : Number.parseFloat(e.target.value)
                    setManualGPA({
                      ...manualGPA,
                      unweighted: isNaN(value) ? 0 : Math.min(4.0, Math.max(0, value)),
                    })
                  }}
                />
                {formErrors.unweighted && <p className="text-sm text-red-500">{formErrors.unweighted}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="weighted">Weighted GPA</Label>
                <Input
                  id="weighted"
                  type="number"
                  min="0"
                  max="5.0"
                  step="0.01"
                  value={manualGPA.weighted.toString()}
                  onChange={(e) => {
                    const value = e.target.value === "" ? 0 : Number.parseFloat(e.target.value)
                    setManualGPA({
                      ...manualGPA,
                      weighted: isNaN(value) ? 0 : Math.min(5.0, Math.max(0, value)),
                    })
                  }}
                />
                {formErrors.weighted && <p className="text-sm text-red-500">{formErrors.weighted}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="ucGPA">UC GPA (10-12th grade)</Label>
                <Input
                  id="ucGPA"
                  type="number"
                  min="0"
                  max="5.0"
                  step="0.01"
                  value={manualGPA.uc_gpa.toString()}
                  onChange={(e) => {
                    const value = e.target.value === "" ? 0 : Number.parseFloat(e.target.value)
                    setManualGPA({
                      ...manualGPA,
                      uc_gpa: isNaN(value) ? 0 : Math.min(5.0, Math.max(0, value)),
                    })
                  }}
                />
                {formErrors.uc_gpa && <p className="text-sm text-red-500">{formErrors.uc_gpa}</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={saveManualGPA}>Save GPA</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* GPA Calculator Dialog */}
      <Dialog open={isCalculatingGPA} onOpenChange={setIsCalculatingGPA}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>GPA Calculator</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg">Unweighted GPA</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-3xl font-bold">{calculateGPA(false).toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground mt-1">Standard 4.0 scale, all courses equal</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg">Weighted GPA</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-3xl font-bold">{calculateGPA(true).toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground mt-1">Honors: +0.5, AP/IB: +1.0</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg flex items-center gap-1">
                    UC GPA
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex">
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Excludes 9th grade, caps at 8 semesters of weighted courses</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-3xl font-bold">{calculateGPA(true, false).toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground mt-1">10-12th grade only</p>
                </CardContent>
              </Card>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">GPA Breakdown by Grade Level</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["9", "10", "11", "12"].map((grade) => {
                  const gradeSpecificCourses = courses.filter((c) => c.grade_level === grade)
                  const hasCoursesInGrade = gradeSpecificCourses.length > 0

                  const gradeUnweighted = hasCoursesInGrade
                    ? gradeSpecificCourses.reduce((sum, c) => sum + c.grade_points * c.credits, 0) /
                      gradeSpecificCourses.reduce((sum, c) => sum + c.credits, 0)
                    : 0

                  const gradeWeighted = hasCoursesInGrade
                    ? gradeSpecificCourses.reduce((sum, c) => sum + c.weighted_grade_points * c.credits, 0) /
                      gradeSpecificCourses.reduce((sum, c) => sum + c.credits, 0)
                    : 0

                  return (
                    <div key={grade} className="bg-card p-3 rounded border">
                      <div className="text-sm font-medium">{grade}th Grade</div>
                      <div className="flex justify-between text-sm mt-1">
                        <span>Unweighted:</span>
                        <span className="font-medium">{hasCoursesInGrade ? gradeUnweighted.toFixed(2) : "N/A"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Weighted:</span>
                        <span className="font-medium">{hasCoursesInGrade ? gradeWeighted.toFixed(2) : "N/A"}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsCalculatingGPA(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Assistant */}
      {showAIAssistant && (
        <AIAssistant
          initialContext={{
            type: "academics",
            title: "Course Planning",
          }}
          initialPrompt={
            aiAction === "courses" 
              ? `${formatAllAcademicDataForAI()}\n\nBased on my academic record, can you recommend courses I should take to strengthen my profile? Are there any gaps or weaknesses in my academic record I should address?`
              : undefined
          }
          showOnLoad={true}
          onClose={() => {
            setShowAIAssistant(false);
            setAiAction(null);
          }}
        />
      )}
      {/* Confirmation Dialog for Course Deletion */}
      <ConfirmationDialog
        open={!!confirmDeleteCourse}
        onOpenChange={(open) => !open && setConfirmDeleteCourse(null)}
        title="Delete Course"
        description="Are you sure you want to delete this course? This action cannot be undone."
        confirmText="Delete"
        onConfirm={() => confirmDeleteCourse && deleteCourse(confirmDeleteCourse)}
        variant="destructive"
      />

      {/* Confirmation Dialog for Test Score Deletion */}
      <ConfirmationDialog
        open={!!confirmDeleteTestScore}
        onOpenChange={(open) => !open && setConfirmDeleteTestScore(null)}
        title="Delete Test Score"
        description="Are you sure you want to delete this test score? This action cannot be undone."
        confirmText="Delete"
        onConfirm={() => confirmDeleteTestScore && deleteTestScore(confirmDeleteTestScore)}
        variant="destructive"
      />
    </div>
  )
}
