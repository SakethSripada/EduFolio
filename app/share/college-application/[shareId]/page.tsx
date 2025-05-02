"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2, Lock, Calendar, AlertTriangle, ChevronDown, FileText, Briefcase, School, GraduationCap } from "lucide-react"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { format } from "date-fns"
import React from "react"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"

export default function SharedCollegeApplicationPage() {
  // Use useParams to get the dynamic id from the route.
  const { shareId } = useParams()

  const [studentData, setStudentData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [shareData, setShareData] = useState<any>(null)
  const [visibleSettings, setVisibleSettings] = useState({
    showAcademics: true,
    showExtracurriculars: true,
    showAwards: true,
    showEssays: true,
    showColleges: true,
  })

  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Verify the share link is valid.
        const { data: shareRecords, error: shareError } = await supabase
          .from("shared_links")
          .select("*")
          .eq("share_id", shareId) // Use the shareId from useParams
          .eq("content_type", "college_application")

        if (shareError) {
          console.error("Share link error:", shareError);
          setError("This share link is invalid or has expired.")
          setLoading(false)
          return
        }

        if (!shareRecords || shareRecords.length === 0) {
          console.error("No share data found");
          setError("This share link is invalid or has expired.")
          setLoading(false)
          return
        }

        // Use the first record if multiple exist
        const shareData = shareRecords[0]

        // Check if the link has expired.
        if (shareData.expires_at && new Date(shareData.expires_at) < new Date()) {
          setError("This share link has expired.")
          setLoading(false)
          return
        }
        // Check if the link is public.
        if (!shareData.is_public) {
          setError("This share link is set to private.")
          setLoading(false)
          return
        }

        setShareData(shareData)
        // Apply share settings saved in the database or default.
        setVisibleSettings({
          showAcademics:
            shareData.settings?.showAcademics !== undefined ? shareData.settings.showAcademics : true,
          showExtracurriculars:
            shareData.settings?.showExtracurriculars !== undefined ? shareData.settings.showExtracurriculars : true,
          showAwards:
            shareData.settings?.showAwards !== undefined ? shareData.settings.showAwards : true,
          showEssays:
            shareData.settings?.showEssays !== undefined ? shareData.settings.showEssays : true,
          showColleges:
            shareData.settings?.showColleges !== undefined ? shareData.settings.showColleges : true,
        })

        // Fetch owner profile.
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", shareData.user_id)
          .maybeSingle()

        if (profileError) {
          console.error("Profile error:", profileError);
          // Don't fail completely, just use fallback values
          console.warn("Using fallback profile data due to error");
        }

        // Create fallback profile data if not found or error occurred
        const userProfile = profileData || {
          full_name: "Student",
          avatar_url: null,
          school: "Not specified",
          grad_year: "Not specified"
        };

        // Apply share privacy settings
        const processedProfile = {
          full_name: shareData.settings?.hideUserName 
            ? "Anonymous"
            : userProfile.full_name || "Student",
          avatar_url: userProfile.avatar_url,
          school: shareData.settings?.hidePersonalInfo 
            ? ""
            : userProfile.school || "Not specified",
          grad_year: shareData.settings?.hidePersonalInfo 
            ? ""
            : userProfile.grad_year || "Not specified",
        };

        // Fetch the application data.
        const [
          academicsResponse,
          testScoresResponse,
          extracurricularActivitiesResponse,
          awardsResponse,
          essaysResponse,
          userCollegesResponse,
        ] = await Promise.all([
          supabase.from("courses").select("*").eq("user_id", shareData.user_id),
          supabase.from("test_scores").select("*").eq("user_id", shareData.user_id),
          supabase.from("extracurricular_activities").select("*").eq("user_id", shareData.user_id),
          supabase.from("awards").select("*").eq("user_id", shareData.user_id),
          supabase.from("essays").select("*").eq("user_id", shareData.user_id),
          supabase.from("user_colleges").select("*").eq("user_id", shareData.user_id),
        ])

        // Check for errors in responses and log them, but continue with empty arrays
        if (academicsResponse.error) console.error("Error fetching courses:", academicsResponse.error);
        if (testScoresResponse.error) console.error("Error fetching test scores:", testScoresResponse.error);
        if (extracurricularActivitiesResponse.error) console.error("Error fetching extracurriculars:", extracurricularActivitiesResponse.error);
        if (awardsResponse.error) console.error("Error fetching awards:", awardsResponse.error);
        if (essaysResponse.error) console.error("Error fetching essays:", essaysResponse.error);
        if (userCollegesResponse.error) console.error("Error fetching user colleges:", userCollegesResponse.error);

        // Only use the extracurricular_activities table
        const extracurriculars = extracurricularActivitiesResponse.data || [];

        // After getting user_colleges, fetch the college details for each
        const collegesData = [];
        if (userCollegesResponse.data && userCollegesResponse.data.length > 0) {
          
          // Extract all college IDs
          const collegeIds = userCollegesResponse.data.map(uc => uc.college_id).filter(id => id);
          
          if (collegeIds.length > 0) {
            // Fetch all colleges in one query
            const { data: collegesDetails, error: collegesError } = await supabase
              .from("colleges")
              .select("*")
              .in("id", collegeIds);
              
            if (collegesError) {
              console.error("Error fetching colleges details:", collegesError);
            } else if (collegesDetails && collegesDetails.length > 0) {
              // Map user_colleges to their respective college details
              for (const userCollege of userCollegesResponse.data) {
                const collegeDetail = collegesDetails.find(c => c.id === userCollege.college_id);
                
                if (collegeDetail) {
                  collegesData.push({
                    id: userCollege.id,
                    college_id: collegeDetail.id,
                    name: collegeDetail.name || "Unknown College",
                    location: collegeDetail.location || "",
                    type: collegeDetail.type || "",
                    size: collegeDetail.size || "",
                    acceptance_rate: collegeDetail.acceptance_rate || 0,
                    ranking: collegeDetail.ranking || 0,
                    logo: collegeDetail.logo_url || "",
                    is_reach: userCollege.is_reach || false,
                    is_target: userCollege.is_target || false,
                    is_safety: userCollege.is_safety || false,
                    is_favorite: userCollege.is_favorite || false,
                    application_status: userCollege.application_status || "",
                    notes: userCollege.notes || "",
                  });
                }
              }
            }
          }
        }

        // Calculate GPA.
        let unweightedGPA = 0;
        let weightedGPA = 0;
        let totalCredits = 0;

        if (academicsResponse.data && academicsResponse.data.length > 0) {
          academicsResponse.data.forEach((course) => {
            unweightedGPA += course.grade_points * course.credits;
            weightedGPA += course.weighted_grade_points * course.credits;
            totalCredits += course.credits;
          });

          unweightedGPA = totalCredits > 0 ? unweightedGPA / totalCredits : 0;
          weightedGPA = totalCredits > 0 ? weightedGPA / totalCredits : 0;
        }

        // Prepare the college data.
        const userColleges = userCollegesResponse.data || [];
        const collegeList = userColleges.map((userCollege) => {
          return {
            id: userCollege.id,
            collegeName: userCollege.college_name,
            status: userCollege.status,
            decision: userCollege.decision,
          };
        });

        // Prepare the student data.
        setStudentData({
          userProfile: processedProfile,
          academics: academicsResponse.data || [],
          testScores: testScoresResponse.data || [],
          extracurricularActivities: extracurricularActivitiesResponse.data || [],
          awards: awardsResponse.data || [],
          essays: essaysResponse.data || [],
          colleges: collegesData.length > 0 ? collegesData : (collegeList || []),
          unweightedGPA: totalCredits > 0 ? unweightedGPA.toFixed(2) : "N/A",
          weightedGPA: totalCredits > 0 ? weightedGPA.toFixed(2) : "N/A",
        })
      } catch (error) {
        console.error("Error fetching shared college application:", error)
        setError("An error occurred while loading the shared application.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [shareId, supabase])

  // Helper function to get user initials
  const getUserInitials = (name: string | undefined): string => {
    if (!name) return 'U';
    
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length > 1 ? 1 : 0].charAt(0)).toUpperCase();
  };

  if (loading) {
    return (
      <div className="container py-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="bg-card p-8 rounded-lg shadow-md">
            <div className="flex justify-center mb-4">
              {error.includes("expired") ? (
                <Calendar className="h-12 w-12 text-muted-foreground" />
              ) : error.includes("private") ? (
                <Lock className="h-12 w-12 text-muted-foreground" />
              ) : (
                <AlertTriangle className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
            <h2 className="text-2xl font-bold mb-4">{error}</h2>
            <p className="text-muted-foreground mb-6">
              {error.includes("expired")
                ? "The owner of this content has set an expiration date that has passed."
                : error.includes("private")
                ? "The owner of this content has set this link to private."
                : "Please check the URL or contact the person who shared this link with you."}
            </p>
            <Link href="/" className="text-primary hover:underline inline-flex items-center">
              <ArrowLeft className="h-4 w-4 mr-1" /> Return to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="mb-8">
        <Link href="/" className="text-primary hover:underline inline-flex items-center mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to EduFolio
        </Link>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-lg font-semibold">
            {getUserInitials(studentData.userProfile.full_name)}
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              {studentData.userProfile.full_name}'s College Application
            </h1>
            <div className="flex flex-wrap gap-4 mt-2 text-muted-foreground">
              {studentData.userProfile.school && (
                <div className="flex items-center gap-1">
                  <School className="h-4 w-4" />
                  <span>{studentData.userProfile.school}</span>
                </div>
              )}
              
              {studentData.userProfile.grad_year && (
                <div className="flex items-center gap-1">
                  <GraduationCap className="h-4 w-4" />
                  <span>Class of {studentData.userProfile.grad_year}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        {shareData && shareData.expires_at && (
          <div className="mb-6 p-3 bg-muted rounded-md inline-flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            This shared link will expire on {format(new Date(shareData.expires_at), "MMMM d, yyyy")}
          </div>
        )}
      </div>

      <div className="bg-card shadow rounded-lg overflow-hidden">
        <Tabs defaultValue="academics" className="w-full">
          <div className="px-4 sm:px-6 border-b">
            <TabsList className="flex w-full overflow-x-auto py-2 gap-2 justify-start sm:justify-center">
              {visibleSettings.showColleges && (
                <TabsTrigger value="colleges" className="px-4 py-2 rounded-md whitespace-nowrap">
                  College List
                </TabsTrigger>
              )}
              {visibleSettings.showAcademics && (
                <TabsTrigger value="academics" className="px-4 py-2 rounded-md whitespace-nowrap">
                  Academics
                </TabsTrigger>
              )}
              {visibleSettings.showExtracurriculars && (
                <TabsTrigger value="extracurriculars" className="px-4 py-2 rounded-md whitespace-nowrap">
                  Extracurriculars
                </TabsTrigger>
              )}
              {visibleSettings.showAwards && (
                <TabsTrigger value="awards" className="px-4 py-2 rounded-md whitespace-nowrap">
                  Awards
                </TabsTrigger>
              )}
              {visibleSettings.showEssays && (
                <TabsTrigger value="essays" className="px-4 py-2 rounded-md whitespace-nowrap">
                  Essays
                </TabsTrigger>
              )}
            </TabsList>
          </div>
          <div className="p-4 sm:p-6">
            {visibleSettings.showColleges && (
              <TabsContent value="colleges">
                <div>
                  <h2 className="text-2xl font-semibold mb-4">College List</h2>
                  {!studentData.colleges || studentData.colleges.length === 0 ? (
                    <div className="text-center p-8 border rounded-md">
                      <p className="text-muted-foreground">No colleges added yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {studentData.colleges.map((college: any) => (
                        <Card key={college.id} className="overflow-hidden hover:shadow-md transition-shadow">
                          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 border-b">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-bold text-lg text-primary-foreground">{college.name}</h3>
                                <p className="text-sm text-muted-foreground flex items-center">
                                  <span>{college.location}</span>
                                </p>
                              </div>
                              {college.logo && (
                                <div className="h-14 w-14 rounded-full bg-white p-2 flex items-center justify-center shadow-sm">
                                  <img
                                    src={college.logo || "/placeholder.svg"}
                                    alt={college.name}
                                    className="h-10 w-10 object-contain"
                                  />
                                </div>
                              )}
                              {!college.logo && (
                                <div className="h-14 w-14 rounded-full bg-white p-2 flex items-center justify-center shadow-sm">
                                  <School className="h-8 w-8 text-primary/60" />
                                </div>
                              )}
                            </div>
                          </div>
                          <CardContent className="p-5">
                            <div className="grid grid-cols-2 gap-y-4 gap-x-3 text-sm mb-4">
                              <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Type</span>
                                <span className="font-medium">{college.type || 'Not specified'}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Size</span>
                                <span className="font-medium">{college.size || 'Not specified'}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Acceptance</span>
                                <span className="font-medium">
                                  {college.acceptance_rate ? `${college.acceptance_rate}%` : 'N/A'}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Ranking</span>
                                <span className="font-medium">
                                  {college.ranking ? `#${college.ranking}` : 'N/A'}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 pt-3 border-t">
                              {college.is_reach && <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200">Reach</Badge>}
                              {college.is_target && <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Target</Badge>}
                              {college.is_safety && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">Safety</Badge>}
                              {college.is_favorite && <Badge className="bg-pink-100 text-pink-700 hover:bg-pink-200">Favorite</Badge>}
                              {college.application_status && (
                                <Badge className="ml-auto bg-gray-100 text-gray-700">
                                  {college.application_status}
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            )}
            
            {/* Add the rest of your tabs here */}
            {visibleSettings.showAcademics && (
              <TabsContent value="academics">
                <div className="space-y-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>GPA</CardTitle>
                      <CardDescription>Overall grade point average</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-lg">
                          <span className="text-sm text-muted-foreground mb-1">Unweighted GPA</span>
                          <span className="text-4xl font-bold">{studentData.unweightedGPA}</span>
                          <span className="text-xs text-muted-foreground mt-1">4.0 Scale</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-lg">
                          <span className="text-sm text-muted-foreground mb-1">Weighted GPA</span>
                          <span className="text-4xl font-bold">{studentData.weightedGPA}</span>
                          <span className="text-xs text-muted-foreground mt-1">5.0 Scale</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Courses</CardTitle>
                      <CardDescription>Academic courses and grades</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4 flex flex-wrap gap-2">
                        {React.createElement(() => {
                          const [selectedGrade, setSelectedGrade] = useState<string>("all");
                          
                          // Filter courses based on selected grade level
                          const filteredCourses = studentData.academics.filter((course: any) => {
                            if (selectedGrade === "all") return true;
                            return course.grade_level === selectedGrade;
                          });
                          
                          return (
                            <>
                              <div className="flex flex-wrap items-center gap-2 w-full">
                                <span className="text-sm font-medium">Filter by grade level:</span>
                                <div className="flex flex-wrap gap-1">
                                  <Badge 
                                    variant={selectedGrade === "all" ? "default" : "outline"}
                                    className="cursor-pointer"
                                    onClick={() => setSelectedGrade("all")}
                                  >
                                    All
                                  </Badge>
                                  <Badge 
                                    variant={selectedGrade === "9" ? "default" : "outline"}
                                    className="cursor-pointer"
                                    onClick={() => setSelectedGrade("9")}
                                  >
                                    9th
                                  </Badge>
                                  <Badge 
                                    variant={selectedGrade === "10" ? "default" : "outline"}
                                    className="cursor-pointer"
                                    onClick={() => setSelectedGrade("10")}
                                  >
                                    10th
                                  </Badge>
                                  <Badge 
                                    variant={selectedGrade === "11" ? "default" : "outline"}
                                    className="cursor-pointer"
                                    onClick={() => setSelectedGrade("11")}
                                  >
                                    11th
                                  </Badge>
                                  <Badge 
                                    variant={selectedGrade === "12" ? "default" : "outline"}
                                    className="cursor-pointer"
                                    onClick={() => setSelectedGrade("12")}
                                  >
                                    12th
                                  </Badge>
                                </div>
                              </div>
                              
                              <div className="rounded-md border overflow-hidden overflow-x-auto w-full mt-2">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Course</TableHead>
                                      <TableHead>Grade</TableHead>
                                      <TableHead>Level</TableHead>
                                      <TableHead>Grade Level</TableHead>
                                      <TableHead>Term</TableHead>
                                      <TableHead>School Year</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {filteredCourses.length === 0 ? (
                                      <TableRow>
                                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                                          {selectedGrade === "all" 
                                            ? "No courses added yet" 
                                            : `No courses for ${selectedGrade}th grade`}
                                        </TableCell>
                                      </TableRow>
                                    ) : (
                                      filteredCourses.map((course: any) => (
                                        <TableRow key={course.id}>
                                          <TableCell>{course.name}</TableCell>
                                          <TableCell>{course.grade}</TableCell>
                                          <TableCell>
                                            {course.level === "AP/IB" ? (
                                              <Badge className="bg-blue-500">AP/IB</Badge>
                                            ) : course.level === "Honors" ? (
                                              <Badge className="bg-purple-500">Honors</Badge>
                                            ) : course.level === "College" ? (
                                              <Badge className="bg-green-500">College</Badge>
                                            ) : (
                                              <Badge variant="outline">Regular</Badge>
                                            )}
                                          </TableCell>
                                          <TableCell>{course.grade_level}</TableCell>
                                          <TableCell>{course.term}</TableCell>
                                          <TableCell>{course.school_year || "N/A"}</TableCell>
                                        </TableRow>
                                      ))
                                    )}
                                  </TableBody>
                                </Table>
                              </div>
                            </>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Test Scores</CardTitle>
                      <CardDescription>Standardized test results</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border overflow-hidden overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Test</TableHead>
                              <TableHead>Score</TableHead>
                              <TableHead>Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {studentData.testScores.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                                  No test scores added yet
                                </TableCell>
                              </TableRow>
                            ) : (
                              studentData.testScores.map((score: any) => (
                                <TableRow key={score.id}>
                                  <TableCell>{score.test_name}</TableCell>
                                  <TableCell>{score.score}</TableCell>
                                  <TableCell>{score.test_date_display}</TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            )}

            {visibleSettings.showExtracurriculars && (
              <TabsContent value="extracurriculars">
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Extracurricular Activities</h2>
                  <div className="space-y-4">
                    {studentData.extracurricularActivities.length === 0 ? (
                      <div className="text-center p-8 border rounded-md">
                        <p className="text-muted-foreground">No extracurricular activities added yet</p>
                      </div>
                    ) : (
                      studentData.extracurricularActivities.map((activity: any, index: number) => (
                        <Card key={activity.id || index}>
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle>{activity.organization || activity.position}</CardTitle>
                                <CardDescription>{activity.position || activity.organization}</CardDescription>
                              </div>
                              <Badge>{activity.activity_type || activity.type}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                              <div>
                                <dt className="text-sm font-medium text-muted-foreground">Description</dt>
                                <dd>{activity.description}</dd>
                              </div>
                              <div>
                                <dt className="text-sm font-medium text-muted-foreground">Grade Levels</dt>
                                <dd>{activity.grade_levels || activity.grades || "Not specified"}</dd>
                              </div>
                              <div>
                                <dt className="text-sm font-medium text-muted-foreground">Time Commitment</dt>
                                <dd>
                                  {activity.hours_per_week || 0} hrs/week, {activity.weeks_per_year || 0} weeks/year
                                </dd>
                              </div>
                              <div>
                                <dt className="text-sm font-medium text-muted-foreground">Timing</dt>
                                <dd>{activity.participation_timing || activity.timing || "Not specified"}</dd>
                              </div>
                            </dl>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </TabsContent>
            )}

            {visibleSettings.showAwards && (
              <TabsContent value="awards">
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Awards & Honors</h2>
                  <div className="space-y-4">
                    {studentData.awards.length === 0 ? (
                      <div className="text-center p-8 border rounded-md">
                        <p className="text-muted-foreground">No awards added yet</p>
                      </div>
                    ) : (
                      studentData.awards.map((award: any) => (
                        <Card key={award.id}>
                          <CardHeader>
                            <CardTitle>{award.title}</CardTitle>
                            <CardDescription>{award.issuing_organization}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                              <div>
                                <dt className="text-sm font-medium text-muted-foreground">Recognition Level</dt>
                                <dd>
                                  <Badge>{award.recognition_level}</Badge>
                                </dd>
                              </div>
                              <div>
                                <dt className="text-sm font-medium text-muted-foreground">Date Received</dt>
                                <dd>{award.date_display}</dd>
                              </div>
                              <div className="sm:col-span-2">
                                <dt className="text-sm font-medium text-muted-foreground">Description</dt>
                                <dd>{award.description}</dd>
                              </div>
                            </dl>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </TabsContent>
            )}

            {visibleSettings.showEssays && (
              <TabsContent value="essays">
                <div>
                  <h2 className="text-2xl font-semibold mb-6">Essays</h2>
                  <div className="space-y-5">
                    {studentData.essays.length === 0 ? (
                      <div className="text-center p-8 border rounded-md">
                        <p className="text-muted-foreground">No essays added yet</p>
                      </div>
                    ) : (
                      <>
                        {/* Filter to only show general essays */}
                        {(() => {
                          // Filter general essays (those without college_id)
                          const generalEssays = studentData.essays.filter((essay: any) => !essay.college_id);
                          
                          if (generalEssays.length === 0) {
                            return (
                              <div className="text-center p-8 border rounded-md">
                                <p className="text-muted-foreground">No general essays added yet</p>
                              </div>
                            );
                          }
                          
                          return (
                            <div className="space-y-4 px-1">
                              {generalEssays.map((essay: any) => (
                                <Collapsible key={essay.id} className="mb-3">
                                  <Card className="overflow-hidden border-l-4 border-l-primary/40 shadow-sm hover:shadow transition-shadow duration-200">
                                    <CollapsibleTrigger className="w-full text-left">
                                      <CardHeader className="pb-2 bg-muted/30">
                                        <div className="flex justify-between items-start">
                                          <CardTitle className="text-lg">{essay.title}</CardTitle>
                                          <div className="flex items-center space-x-2">
                                            <div className="text-sm px-2 py-1 rounded bg-muted">
                                              {essay.word_count} words
                                            </div>
                                            {essay.status && (
                                              <Badge variant="outline">
                                                {essay.status}
                                              </Badge>
                                            )}
                                            <ChevronDown className="h-4 w-4 transition-transform duration-200 ease-in-out ui-open:rotate-180" />
                                          </div>
                                        </div>
                                      </CardHeader>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                      <CardContent className="pt-4">
                                        <div className="mb-4">
                                          <h4 className="text-sm font-medium text-muted-foreground mb-2">Prompt</h4>
                                          <div className="p-3 bg-muted/20 rounded-md">
                                            <p className="italic">{essay.prompt}</p>
                                          </div>
                                        </div>
                                        <div className="border-t pt-4">
                                          <h4 className="text-sm font-medium text-muted-foreground mb-2">Essay Content</h4>
                                          <div className="prose prose-sm dark:prose-invert max-w-none p-3 bg-muted/10 rounded-md font-serif">
                                            <p className="text-foreground dark:text-foreground whitespace-pre-wrap leading-relaxed">{essay.content}</p>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </CollapsibleContent>
                                  </Card>
                                </Collapsible>
                              ))}
                            </div>
                          );
                        })()}
                      </>
                    )}
                  </div>
                </div>
              </TabsContent>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  )
} 