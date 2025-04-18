"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2, Lock, Calendar, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { format } from "date-fns"

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
        console.log("Fetching data for share ID:", shareId);
        // Verify the share link is valid.
        const { data: shareData, error: shareError } = await supabase
          .from("shared_links")
          .select("*")
          .eq("share_id", shareId) // Use the shareId from useParams
          .eq("content_type", "college_application")
          .single()

        if (shareError) {
          console.error("Share link error:", shareError);
          setError("This share link is invalid or has expired.")
          setLoading(false)
          return
        }

        if (!shareData) {
          console.error("No share data found");
          setError("This share link is invalid or has expired.")
          setLoading(false)
          return
        }

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
          .single()

        if (profileError) {
          console.error("Profile error:", profileError);
          setError("User profile not found.")
          setLoading(false)
          return
        }

        if (!profileData) {
          console.error("No profile data found");
          setError("User profile not found.")
          setLoading(false)
          return
        }

        // Fetch the application data.
        const [
          academicsResponse,
          testScoresResponse,
          extracurricularActivitiesResponse,
          awardsResponse,
          essaysResponse,
          userCollegesResponse,
        ] = await Promise.all([
          supabase.from("academics").select("*").eq("user_id", shareData.user_id),
          supabase.from("test_scores").select("*").eq("user_id", shareData.user_id),
          supabase.from("extracurricular_activities").select("*").eq("user_id", shareData.user_id),
          supabase.from("awards").select("*").eq("user_id", shareData.user_id),
          supabase.from("essays").select("*").eq("user_id", shareData.user_id),
          supabase.from("user_colleges").select("*").eq("user_id", shareData.user_id),
        ])

        // Log responses to debug what's coming back
        console.log("User colleges data:", userCollegesResponse);
        console.log("Extracurricular activities:", extracurricularActivitiesResponse);

        // Only use the extracurricular_activities table
        const extracurriculars = extracurricularActivitiesResponse.data || [];
        console.log("Filtered extracurriculars:", extracurriculars);

        // After getting user_colleges, fetch the college details for each
        const collegesData = [];
        if (userCollegesResponse.data && userCollegesResponse.data.length > 0) {
          console.log("User colleges found:", userCollegesResponse.data.length);
          
          // Extract all college IDs
          const collegeIds = userCollegesResponse.data.map(uc => uc.college_id).filter(id => id);
          console.log("College IDs to fetch:", collegeIds);
          
          if (collegeIds.length > 0) {
            // Fetch all colleges in one query
            const { data: collegesDetails, error: collegesError } = await supabase
              .from("colleges")
              .select("*")
              .in("id", collegeIds);
              
            console.log("Colleges details result:", collegesDetails?.length || 0, "colleges found");
            
            if (collegesError) {
              console.error("Error fetching colleges details:", collegesError);
            } else if (collegesDetails && collegesDetails.length > 0) {
              // Map user_colleges to their respective college details
              for (const userCollege of userCollegesResponse.data) {
                const collegeDetail = collegesDetails.find(c => c.id === userCollege.college_id);
                
                if (collegeDetail) {
                  collegesData.push({
                    id: userCollege.id,
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
                } else {
                  console.log("Could not find college details for ID:", userCollege.college_id);
                }
              }
            }
          }
        }

        console.log("Final colleges data prepared:", collegesData.length, "colleges");

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

        console.log("Processed colleges data:", collegesData);

        setStudentData({
          name: profileData.full_name,
          avatar: profileData.avatar_url,
          school: profileData.school || "Not specified",
          gradYear: profileData.grad_year || "Not specified",
          academics: {
            courses: academicsResponse.data || [],
            gpa: {
              unweighted: unweightedGPA.toFixed(2),
              weighted: weightedGPA.toFixed(2),
            },
            testScores: testScoresResponse.data || [],
          },
          extracurriculars: extracurriculars,
          awards: awardsResponse.data || [],
          essays: essaysResponse.data || [],
          colleges: collegesData,
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
          {/* Temporarily disabled avatar in favor of initials */}
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-lg font-semibold">
            {getUserInitials(studentData.name)}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{studentData.name}'s College Application</h1>
            <p className="text-muted-foreground">
              {studentData.school} • Class of {studentData.gradYear}
            </p>
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
                        <Card key={college.id}>
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle>{college.name}</CardTitle>
                                <CardDescription>{college.location}</CardDescription>
                              </div>
                              {college.logo && (
                                <img
                                  src={college.logo || "/placeholder.svg"}
                                  alt={college.name}
                                  className="h-10 w-10 object-contain"
                                />
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <p className="text-muted-foreground">Type</p>
                                <p>{college.type}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Size</p>
                                <p>{college.size}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Acceptance</p>
                                <p>{college.acceptance_rate}%</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Ranking</p>
                                <p>#{college.ranking}</p>
                              </div>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {college.is_reach && <Badge variant="secondary">Reach</Badge>}
                              {college.is_target && <Badge variant="secondary">Target</Badge>}
                              {college.is_safety && <Badge variant="secondary">Safety</Badge>}
                              {college.is_favorite && <Badge variant="secondary">Favorite</Badge>}
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
                          <span className="text-4xl font-bold">{studentData.academics.gpa.unweighted}</span>
                          <span className="text-xs text-muted-foreground mt-1">4.0 Scale</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-lg">
                          <span className="text-sm text-muted-foreground mb-1">Weighted GPA</span>
                          <span className="text-4xl font-bold">{studentData.academics.gpa.weighted}</span>
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
                      <div className="rounded-md border overflow-hidden overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Course</TableHead>
                              <TableHead>Grade</TableHead>
                              <TableHead>Level</TableHead>
                              <TableHead>Grade Level</TableHead>
                              <TableHead>Term</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {studentData.academics.courses.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                  No courses added yet
                                </TableCell>
                              </TableRow>
                            ) : (
                              studentData.academics.courses.map((course: any) => (
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
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
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
                            {studentData.academics.testScores.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                                  No test scores added yet
                                </TableCell>
                              </TableRow>
                            ) : (
                              studentData.academics.testScores.map((score: any) => (
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
                    {studentData.extracurriculars.length === 0 ? (
                      <div className="text-center p-8 border rounded-md">
                        <p className="text-muted-foreground">No extracurricular activities added yet</p>
                      </div>
                    ) : (
                      studentData.extracurriculars.map((activity: any, index: number) => (
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
                                <dd>{activity.grade_levels || activity.grades}</dd>
                              </div>
                              <div>
                                <dt className="text-sm font-medium text-muted-foreground">Time Commitment</dt>
                                <dd>
                                  {activity.hours_per_week} hrs/week, {activity.weeks_per_year} weeks/year
                                </dd>
                              </div>
                              <div>
                                <dt className="text-sm font-medium text-muted-foreground">Timing</dt>
                                <dd>{activity.participation_timing || activity.timing}</dd>
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
                  <h2 className="text-2xl font-semibold mb-4">Essays</h2>
                  <div className="space-y-4">
                    {studentData.essays.length === 0 ? (
                      <div className="text-center p-8 border rounded-md">
                        <p className="text-muted-foreground">No essays added yet</p>
                      </div>
                    ) : (
                      studentData.essays.map((essay: any) => (
                        <Card key={essay.id}>
                          <CardHeader>
                            <CardTitle>{essay.title}</CardTitle>
                            <CardDescription>
                              {essay.word_count} words
                              {essay.status && (
                                <Badge className="ml-2" variant="outline">
                                  {essay.status}
                                </Badge>
                              )}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-muted-foreground mb-1">Prompt</h4>
                              <p>{essay.prompt}</p>
                            </div>
                            <div className="border-t pt-4">
                              <h4 className="text-sm font-medium text-muted-foreground mb-1">Essay Content</h4>
                              <div className="prose prose-sm dark:prose-invert max-w-none">
                                <p className="text-foreground dark:text-foreground whitespace-pre-wrap">{essay.content}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
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