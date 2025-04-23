"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/components/auth/AuthProvider"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"
import { useToast } from "@/components/ui/use-toast"
import { Info } from "lucide-react"

type Course = {
  id: string
  name: string
  grade: string
  credits: number
  level: string
  grade_level: string
  term: string
  school_year: string
}

type UCGPACalculatorProps = {
  userId: string
}

export function UCGPACalculator({ userId }: UCGPACalculatorProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ucGPA, setUcGPA] = useState<number | null>(null)
  const [eligibleCourses, setEligibleCourses] = useState<Course[]>([])
  const [ineligibleCourses, setIneligibleCourses] = useState<Course[]>([])
  const [honorPoints, setHonorPoints] = useState(0)
  const [totalGradePoints, setTotalGradePoints] = useState(0)
  const [totalCourses, setTotalCourses] = useState(0)
  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = createClientComponentClient<Database>()

  // Load courses
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from("courses")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
        
        if (error) throw error
        
        setCourses(data || [])
      } catch (err) {
        console.error("Error fetching courses:", err)
        setError("Failed to load courses")
      } finally {
        setLoading(false)
      }
    }
    
    if (userId) {
      fetchCourses()
    }
  }, [userId])
  
  // Calculate UC GPA
  useEffect(() => {
    if (courses.length === 0) return
    
    const calculateUCGPA = () => {
      // UC GPA only counts courses from summer after 9th grade through summer after 11th grade
      const gradeLevelOrder = ["9th Grade", "10th Grade", "11th Grade", "12th Grade"]
      
      const eligibleGradeLevels = ["10th Grade", "11th Grade"]
      const summerAfter9thCourses = courses.filter(c => 
        c.grade_level === "9th Grade" && c.term.toLowerCase().includes("summer")
      )
      
      const regularEligibleCourses = courses.filter(c => 
        eligibleGradeLevels.includes(c.grade_level)
      )
      
      const summerAfter11thCourses = courses.filter(c => 
        c.grade_level === "11th Grade" && c.term.toLowerCase().includes("summer")
      )
      
      // Combine all eligible courses
      const allEligibleCourses = [
        ...summerAfter9thCourses, 
        ...regularEligibleCourses, 
        ...summerAfter11thCourses
      ]
      
      // Sort courses by grade level
      allEligibleCourses.sort((a, b) => {
        const aIndex = gradeLevelOrder.indexOf(a.grade_level)
        const bIndex = gradeLevelOrder.indexOf(b.grade_level)
        if (aIndex === bIndex) {
          // If same grade level, sort by term
          const termOrder: Record<string, number> = { "Fall": 1, "Spring": 2, "Summer": 3 }
          const aTerm = a.term.split(" ")[0]
          const bTerm = b.term.split(" ")[0]
          return (termOrder[aTerm] || 0) - (termOrder[bTerm] || 0)
        }
        return aIndex - bIndex
      })
      
      setEligibleCourses(allEligibleCourses)
      
      // All other courses are ineligible
      const ineligibleCoursesList = courses.filter(c => 
        !allEligibleCourses.some(ec => ec.id === c.id)
      )
      setIneligibleCourses(ineligibleCoursesList)
      
      // Convert grades to points
      const gradePoints: Record<string, number> = {
        "A": 4,
        "B": 3,
        "C": 2,
        "D": 1,
        "F": 0
      }
      
      let totalPoints = 0
      let totalHonorPoints = 0
      let tenthGradeHonorPoints = 0
      let totalEligibleCourses = 0
      
      allEligibleCourses.forEach(course => {
        // Base points from the grade
        const basePoints = gradePoints[course.grade] || 0
        totalPoints += basePoints
        totalEligibleCourses++
        
        // Honor points calculation
        const isHonorsCourse = ["Honors", "AP", "IB HL", "IB SL", "College"].includes(course.level)
        const isEligibleForHonorPoint = ["A", "B", "C"].includes(course.grade) && isHonorsCourse
        
        if (isEligibleForHonorPoint) {
          // Track honor points separately by grade level for the 8-point maximum
          if (course.grade_level === "10th Grade" || 
              (course.grade_level === "9th Grade" && course.term.toLowerCase().includes("summer"))) {
            tenthGradeHonorPoints++
          }
          
          totalHonorPoints++
        }
      })
      
      // Apply the 4 honors point maximum for 10th grade
      const tenthGradeHonorPointsCapped = Math.min(tenthGradeHonorPoints, 4)
      
      // Apply the 8 honors point maximum overall
      const totalHonorPointsCapped = Math.min(totalHonorPoints, 8)
      
      // Add honor points to total
      totalPoints += totalHonorPointsCapped
      
      // Calculate UC GPA
      const calculatedGPA = totalEligibleCourses > 0 ? totalPoints / totalEligibleCourses : 0
      
      // Set state with calculations
      setUcGPA(calculatedGPA)
      setHonorPoints(totalHonorPointsCapped)
      setTotalGradePoints(totalPoints)
      setTotalCourses(totalEligibleCourses)
    }
    
    calculateUCGPA()
  }, [courses])
  
  const formatGPA = (gpa: number | null) => {
    if (gpa === null) return "N/A"
    return gpa.toFixed(2)
  }
  
  const getCoursesCountBadge = (count: number) => {
    return (
      <Badge variant="secondary" className="ml-2">
        {count} {count === 1 ? "course" : "courses"}
      </Badge>
    )
  }
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>UC GPA Calculator</CardTitle>
          <CardDescription>Loading your courses...</CardDescription>
        </CardHeader>
      </Card>
    )
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>UC GPA Calculator</CardTitle>
          <CardDescription>Error: {error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>UC GPA Calculator</CardTitle>
        <CardDescription>
          Calculate your UC GPA based on courses from summer after 9th grade through summer after 11th grade
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {courses.length === 0 ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>No courses found</AlertTitle>
            <AlertDescription>
              Add your courses to calculate your UC GPA.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm font-medium mb-1">UC GPA</div>
                <div className="text-3xl font-bold">{formatGPA(ucGPA)}</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm font-medium mb-1">Honors Points</div>
                <div className="text-3xl font-bold">{honorPoints} <span className="text-sm text-muted-foreground">/ 8 max</span></div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm font-medium mb-1">Course Count</div>
                <div className="text-3xl font-bold">{totalCourses}</div>
              </div>
            </div>
            
            <Accordion type="single" collapsible defaultValue="eligible-courses">
              <AccordionItem value="eligible-courses">
                <AccordionTrigger>
                  Courses Included in GPA Calculation {getCoursesCountBadge(eligibleCourses.length)}
                </AccordionTrigger>
                <AccordionContent>
                  <ScrollArea className="h-60">
                    <div className="space-y-2">
                      {eligibleCourses.map((course) => (
                        <div key={course.id} className="p-3 bg-background border rounded-md">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{course.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {course.grade_level} • {course.term} • {course.school_year}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge>{course.level}</Badge>
                              <div className="text-lg font-bold">{course.grade}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {eligibleCourses.length === 0 && (
                        <div className="text-center p-4 text-muted-foreground">
                          No eligible courses found
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="excluded-courses">
                <AccordionTrigger>
                  Courses Excluded from GPA Calculation {getCoursesCountBadge(ineligibleCourses.length)}
                </AccordionTrigger>
                <AccordionContent>
                  <ScrollArea className="h-60">
                    <div className="space-y-2">
                      {ineligibleCourses.map((course) => (
                        <div key={course.id} className="p-3 bg-background border rounded-md">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{course.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {course.grade_level} • {course.term} • {course.school_year}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{course.level}</Badge>
                              <div className="text-lg font-bold text-muted-foreground">{course.grade}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {ineligibleCourses.length === 0 && (
                        <div className="text-center p-4 text-muted-foreground">
                          No excluded courses found
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start border-t p-4 text-sm text-muted-foreground">
        <h4 className="font-medium text-foreground mb-2">UC GPA Calculation Rules</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Courses from summer after 9th grade through summer after 11th grade</li>
          <li>Grade points: A=4, B=3, C=2, D=1, F=0 (no +/- considered)</li>
          <li>Extra point for honors/AP/IB/college courses if grade is A, B, or C</li>
          <li>Maximum of 8 honors points total</li>
          <li>Maximum of 4 honors points from 10th grade (including summer after 9th)</li>
        </ul>
      </CardFooter>
    </Card>
  )
} 