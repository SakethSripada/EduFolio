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
          extracurricularsResponse,
          awardsResponse,
          essaysResponse,
          collegesResponse,
        ] = await Promise.all([
          supabase.from("academics").select("*").eq("user_id", shareData.user_id),
          supabase.from("test_scores").select("*").eq("user_id", shareData.user_id),
          supabase.from("extracurricular_activities").select("*").eq("user_id", shareData.user_id),
          supabase.from("awards").select("*").eq("user_id", shareData.user_id),
          supabase.from("essays").select("*").eq("user_id", shareData.user_id),
          supabase
            .from("user_colleges")
            .select(`
              *,
              college:colleges(*)
            `)
            .eq("user_id", shareData.user_id),
        ])

        // Calculate GPA.
        let unweightedGPA = 0
        let weightedGPA = 0
        let totalCredits = 0

        if (academicsResponse.data && academicsResponse.data.length > 0) {
          academicsResponse.data.forEach((course) => {
            unweightedGPA += course.grade_points * course.credits
            weightedGPA += course.weighted_grade_points * course.credits
            totalCredits += course.credits
          })

          unweightedGPA = totalCredits > 0 ? unweightedGPA / totalCredits : 0
          weightedGPA = totalCredits > 0 ? weightedGPA / totalCredits : 0
        }

        // Process the college data to make it easier to use
        const colleges = collegesResponse.data?.map(userCollege => {
          return {
            id: userCollege.id,
            name: userCollege.college?.name || "Unknown College",
            location: userCollege.college?.location || "",
            type: userCollege.college?.type || "",
            size: userCollege.college?.size || "",
            acceptance_rate: userCollege.college?.acceptance_rate || 0,
            ranking: userCollege.college?.ranking || 0,
            logo: userCollege.college?.logo_url || "",
            is_reach: userCollege.is_reach || false,
            is_target: userCollege.is_target || false,
            is_safety: userCollege.is_safety || false,
            is_favorite: userCollege.is_favorite || false,
          };
        }) || [];

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
          extracurriculars: extracurricularsResponse.data || [],
          awards: awardsResponse.data || [],
          essays: essaysResponse.data || [],
          colleges: colleges,
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
          <img
            src={studentData.avatar || "/placeholder.svg?height=64&width=64"}
            alt={studentData.name}
            className="w-16 h-16 rounded-full object-cover"
          />
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
            
          </div>
        </Tabs>
      </div>
    </div>
  )
} 