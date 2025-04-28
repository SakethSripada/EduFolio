"use client"

import { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ArrowRight, Plus, Trash, Search } from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"
import { useToast } from "@/components/ui/use-toast"
import { 
  GRADE_LEVELS, 
  TERMS, 
  COURSE_LEVELS, 
  GRADE_OPTIONS, 
  CREDITS_OPTIONS, 
  SCHOOL_YEARS,
  COMMON_COURSES,
  CourseTemplate,
  initializeCoursesWithSelection
} from "./courseData"

type BulkEntryFormData = {
  gradeLevel: string
  term: string
  schoolYear: string
  grade: string
}

type BulkCourseEntryProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCoursesAdded: () => void
  userId: string
}

export function BulkCourseEntry({ open, onOpenChange, onCoursesAdded, userId }: BulkCourseEntryProps) {
  const [activeTab, setActiveTab] = useState("common-courses")
  const [activeCategoryTab, setActiveCategoryTab] = useState("English")
  const [courseGroups, setCourseGroups] = useState(() => initializeCoursesWithSelection(COMMON_COURSES))
  const [customCourses, setCustomCourses] = useState<CourseTemplate[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  
  const [newCustomCourse, setNewCustomCourse] = useState<Omit<CourseTemplate, 'isSelected'>>({
    name: "",
    credits: 1,
    level: "Regular"
  })
  
  const [formData, setFormData] = useState<BulkEntryFormData>({
    gradeLevel: "",
    term: "",
    schoolYear: "",
    grade: ""
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = createClientComponentClient<Database>()
  
  // Filter courses based on search query
  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) {
      return courseGroups;
    }
    
    const searchLower = searchQuery.toLowerCase();
    const results: Record<string, CourseTemplate[]> = {};
    
    for (const [category, courses] of Object.entries(courseGroups)) {
      const matchedCourses = courses.filter(course => 
        course.name.toLowerCase().includes(searchLower) || 
        course.level.toLowerCase().includes(searchLower)
      );
      
      if (matchedCourses.length > 0) {
        results[category] = matchedCourses;
      }
    }
    
    return results;
  }, [courseGroups, searchQuery]);
  
  // Get all selected courses from both common and custom lists
  const selectedCourses = useMemo(() => {
    const selectedCommonCourses: CourseTemplate[] = [];
    
    // Collect all selected courses from each category
    for (const courses of Object.values(courseGroups)) {
      const selected = courses.filter(course => course.isSelected);
      selectedCommonCourses.push(...selected);
    }
    
    const selectedCustomCourses = customCourses.filter(course => course.isSelected);
    return [...selectedCommonCourses, ...selectedCustomCourses];
  }, [courseGroups, customCourses]);
  
  // Add a new custom course
  const addCustomCourse = useCallback(() => {
    if (!newCustomCourse.name.trim()) return;
    
    setCustomCourses(prev => [
      ...prev,
      { ...newCustomCourse, isSelected: true }
    ]);
    
    setNewCustomCourse({
      name: "",
      credits: 1,
      level: "Regular"
    });
  }, [newCustomCourse]);
  
  // Remove a custom course
  const removeCustomCourse = useCallback((index: number) => {
    setCustomCourses(prev => prev.filter((_, i) => i !== index));
  }, []);
  
  // Toggle course selection
  const toggleCourseSelection = useCallback((courseName: string, category: string) => {
    setCourseGroups(prev => {
      const updatedGroups = { ...prev };
      const categoryData = [...updatedGroups[category]];
      const courseIndex = categoryData.findIndex(c => c.name === courseName);
      
      if (courseIndex !== -1) {
        categoryData[courseIndex] = {
          ...categoryData[courseIndex],
          isSelected: !categoryData[courseIndex].isSelected
        };
        updatedGroups[category] = categoryData;
      }
      
      return updatedGroups;
    });
  }, []);
  
  // Toggle custom course selection
  const toggleCustomCourseSelection = useCallback((index: number) => {
    setCustomCourses(prev => {
      const updatedCourses = [...prev];
      updatedCourses[index] = {
        ...updatedCourses[index],
        isSelected: !updatedCourses[index].isSelected
      };
      return updatedCourses;
    });
  }, []);
  
  // Update course details
  const updateCourseDetails = useCallback((index: number, field: keyof CourseTemplate, value: any) => {
    setCustomCourses(prev => {
      const updatedCourses = [...prev];
      updatedCourses[index] = { 
        ...updatedCourses[index], 
        [field]: field === 'credits' ? parseFloat(value) : value 
      };
      return updatedCourses;
    });
  }, []);
  
  // Handle form submission
  const handleSubmit = async () => {
    // Validate form data
    if (!formData.gradeLevel || !formData.term || !formData.schoolYear || !formData.grade) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }
    
    if (selectedCourses.length === 0) {
      toast({
        title: "No courses selected",
        description: "Please select at least one course to add",
        variant: "destructive"
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Calculate grade points based on the grade
      const gradePointsMap: { [key: string]: number } = { "A": 4, "B": 3, "C": 2, "D": 1, "F": 0 }
      const gradePoints = gradePointsMap[formData.grade] || 0
      
      // Determine if the course is weighted
      const calculateWeightedPoints = (level: string, grade: string): number => {
        const basePoints = gradePointsMap[grade] || 0
        
        // Only add a point if grade is A, B, or C and the course is honors/AP/IB
        if (["A", "B", "C"].includes(grade) && ["Honors", "AP", "IB HL", "IB SL", "College"].includes(level)) {
          return basePoints + 1
        }
        
        return basePoints
      }
      
      // Create course objects for each selected course
      const courseObjects = selectedCourses.map(course => ({
        user_id: userId,
        name: course.name,
        grade: formData.grade,
        credits: course.credits,
        level: course.level,
        grade_level: formData.gradeLevel,
        term: formData.term,
        school_year: formData.schoolYear,
        grade_points: gradePoints,
        weighted_grade_points: calculateWeightedPoints(course.level, formData.grade),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))
      
      // Insert all courses in bulk
      const { error } = await supabase
        .from("courses")
        .insert(courseObjects)
      
      if (error) throw error
      
      toast({
        title: "Courses added",
        description: `Successfully added ${courseObjects.length} courses`,
      })
      
      // Reset form and close dialog
      onCoursesAdded()
      onOpenChange(false)
    } catch (error) {
      console.error("Error adding courses:", error)
      toast({
        title: "Error",
        description: "Failed to add courses. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Add Courses</DialogTitle>
          <DialogDescription>
            Add multiple courses at once with the same term, grade level, and grade.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Course selection panel */}
          <div className="flex-1 flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="common-courses">Common Courses</TabsTrigger>
                <TabsTrigger value="custom-courses">Custom Courses</TabsTrigger>
              </TabsList>
              
              <TabsContent value="common-courses" className="flex-1 flex flex-col">
                <div className="mb-2 flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search courses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <div className="text-sm text-muted-foreground whitespace-nowrap">
                    Selected: <span className="font-medium">{selectedCourses.length}</span>
                  </div>
                </div>
                
                <div className="flex flex-col border rounded-md">
                  <Tabs 
                    value={activeCategoryTab} 
                    onValueChange={setActiveCategoryTab}
                    className="flex-1 flex flex-col"
                  >
                    <div className="border-b">
                      <ScrollArea className="w-full">
                        <TabsList className="inline-flex h-10 py-1 px-1">
                          {Object.keys(filteredCourses).map((category) => (
                            <TabsTrigger
                              key={category}
                              value={category}
                              className="py-1.5 px-3 whitespace-nowrap"
                            >
                              {category}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                        <ScrollBar orientation="horizontal" />
                      </ScrollArea>
                    </div>
                    
                    {Object.keys(filteredCourses).map((category) => (
                      <TabsContent 
                        key={category} 
                        value={category} 
                        className="flex-1 flex-col data-[state=active]:flex"
                      >
                        <ScrollArea className="h-[350px]">
                          <div className="p-2 space-y-1">
                            {filteredCourses[category]?.map((course) => (
                              <div 
                                key={course.name}
                                className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
                              >
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    checked={course.isSelected}
                                    onCheckedChange={() => toggleCourseSelection(course.name, category)}
                                    id={`course-${course.name}`}
                                  />
                                  <label 
                                    htmlFor={`course-${course.name}`}
                                    className="text-sm font-medium cursor-pointer flex-1"
                                  >
                                    {course.name}
                                  </label>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                                    {course.level}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {course.credits} cr
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
              </TabsContent>
              
              <TabsContent value="custom-courses" className="flex-1 flex flex-col">
                <div className="flex items-end gap-2 mb-3">
                  <div className="flex-1">
                    <Label htmlFor="custom-name" className="text-xs mb-1">Course name</Label>
                    <Input
                      id="custom-name"
                      placeholder="Enter course name"
                      value={newCustomCourse.name}
                      onChange={(e) => setNewCustomCourse({ ...newCustomCourse, name: e.target.value })}
                    />
                  </div>
                  
                  <div className="w-24">
                    <Label htmlFor="custom-credits" className="text-xs mb-1">Credits</Label>
                    <Select
                      value={newCustomCourse.credits.toString()}
                      onValueChange={(value) => setNewCustomCourse({ 
                        ...newCustomCourse, 
                        credits: parseFloat(value) 
                      })}
                    >
                      <SelectTrigger id="custom-credits">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CREDITS_OPTIONS.map((credit) => (
                          <SelectItem key={credit} value={credit.toString()}>
                            {credit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="w-32">
                    <Label htmlFor="custom-level" className="text-xs mb-1">Level</Label>
                    <Select
                      value={newCustomCourse.level}
                      onValueChange={(value) => setNewCustomCourse({ 
                        ...newCustomCourse, 
                        level: value 
                      })}
                    >
                      <SelectTrigger id="custom-level">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COURSE_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    onClick={addCustomCourse} 
                    disabled={!newCustomCourse.name.trim()}
                    className="flex-shrink-0"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
                
                <div className="flex-1 border rounded-md">
                  <ScrollArea className="h-[350px]">
                    <div className="p-2 space-y-1">
                      {customCourses.length === 0 ? (
                        <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
                          No custom courses added yet
                        </div>
                      ) : (
                        customCourses.map((course, index) => (
                          <div 
                            key={index}
                            className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
                          >
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={course.isSelected}
                                onCheckedChange={() => toggleCustomCourseSelection(index)}
                                id={`custom-course-${index}`}
                              />
                              <label 
                                htmlFor={`custom-course-${index}`}
                                className="text-sm font-medium cursor-pointer flex-1"
                              >
                                {course.name}
                              </label>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                                {course.level}
                              </div>
                              <div className="text-xs text-muted-foreground mr-2">
                                {course.credits} cr
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-7 w-7" 
                                onClick={() => removeCustomCourse(index)}
                              >
                                <Trash className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Form details panel */}
          <div className="w-full md:w-80 flex flex-col gap-3 p-2 border rounded-md">
            <div className="space-y-2">
              <Label htmlFor="grade-level">Grade Level</Label>
              <Select 
                value={formData.gradeLevel} 
                onValueChange={(value) => setFormData({ ...formData, gradeLevel: value })}
              >
                <SelectTrigger id="grade-level">
                  <SelectValue placeholder="Select Grade Level" />
                </SelectTrigger>
                <SelectContent>
                  {GRADE_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="term">Term</Label>
              <Select 
                value={formData.term} 
                onValueChange={(value) => setFormData({ ...formData, term: value })}
              >
                <SelectTrigger id="term">
                  <SelectValue placeholder="Select Term" />
                </SelectTrigger>
                <SelectContent>
                  {TERMS.map((term) => (
                    <SelectItem key={term} value={term}>{term}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="school-year">School Year</Label>
              <Select 
                value={formData.schoolYear} 
                onValueChange={(value) => setFormData({ ...formData, schoolYear: value })}
              >
                <SelectTrigger id="school-year">
                  <SelectValue placeholder="Select School Year" />
                </SelectTrigger>
                <SelectContent>
                  {SCHOOL_YEARS.map((year) => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="grade">Grade</Label>
              <Select 
                value={formData.grade} 
                onValueChange={(value) => setFormData({ ...formData, grade: value })}
              >
                <SelectTrigger id="grade">
                  <SelectValue placeholder="Select Grade" />
                </SelectTrigger>
                <SelectContent>
                  {GRADE_OPTIONS.map((grade) => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="mt-6 p-3 bg-muted/40 rounded-md">
              <div className="text-sm font-medium mb-1">Selected Courses</div>
              <div className="text-2xl font-bold">{selectedCourses.length}</div>
              <div className="text-xs text-muted-foreground">Courses will be added with the same grade, term, and grade level</div>
            </div>
            
            <div className="mt-auto">
              <Button 
                className="w-full" 
                onClick={handleSubmit} 
                disabled={isSubmitting || selectedCourses.length === 0}
              >
                {isSubmitting ? "Adding Courses..." : "Add Selected Courses"}
                {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 