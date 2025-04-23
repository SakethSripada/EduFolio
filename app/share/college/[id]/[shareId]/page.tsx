// Update the component to fetch data from the database
"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default function SharedCollegeProfilePage({ params }: { params: { id: string; shareId: string } }) {
  const [collegeData, setCollegeData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // First, verify the share link is valid
        const { data: shareData, error: shareError } = await supabase
          .from("shared_links")
          .select("*")
          .eq("share_id", params.shareId)
          .eq("content_type", "college_profile")
          .eq("content_id", params.id)
          .maybeSingle()

        if (shareError || !shareData) {
          setError("This share link is invalid or has expired.")
          setLoading(false)
          return
        }

        // Fetch the college data
        const { data: collegeData, error: collegeError } = await supabase
          .from("colleges")
          .select("*")
          .eq("id", params.id)
          .maybeSingle()

        if (collegeError || !collegeData) {
          setError("College not found.")
          setLoading(false)
          return
        }

        // Fetch college-specific data
        const [academicsResponse, extracurricularsResponse, awardsResponse, essaysResponse] = await Promise.all([
          supabase.from("college_academics").select("*").eq("college_id", params.id),
          supabase.from("college_extracurriculars").select("*").eq("college_id", params.id),
          supabase.from("college_awards").select("*").eq("college_id", params.id),
          supabase.from("college_essays").select("*").eq("college_id", params.id),
        ])

        setCollegeData({
          collegeName: collegeData.name,
          academics: academicsResponse.data || [],
          extracurriculars: extracurricularsResponse.data || [],
          awards: awardsResponse.data || [],
          essays: essaysResponse.data || [],
        })
      } catch (error) {
        console.error("Error fetching shared college profile:", error)
        setError("An error occurred while loading the shared profile.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id, params.shareId])

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
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p className="text-muted-foreground">{error}</p>
        <Link href="/" className="text-primary hover:underline mt-4 inline-block">
          Return to Home
        </Link>
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
          <div>
            <h1 className="text-3xl font-bold">College Profile: {collegeData.collegeName || "University"}</h1>
            <p className="text-muted-foreground">Shared college-specific application materials</p>
          </div>
        </div>
      </div>

      <div className="bg-card shadow rounded-lg overflow-hidden">
        <Tabs defaultValue="academics" className="w-full">
          <div className="px-4 sm:px-6 border-b">
            <TabsList className="flex w-full overflow-x-auto py-2 gap-2 justify-start sm:justify-center">
              <TabsTrigger value="academics" className="px-4 py-2 rounded-md whitespace-nowrap">
                Academics
              </TabsTrigger>
              <TabsTrigger value="extracurriculars" className="px-4 py-2 rounded-md whitespace-nowrap">
                Extracurriculars
              </TabsTrigger>
              <TabsTrigger value="awards" className="px-4 py-2 rounded-md whitespace-nowrap">
                Awards
              </TabsTrigger>
              <TabsTrigger value="essays" className="px-4 py-2 rounded-md whitespace-nowrap">
                Essays
              </TabsTrigger>
            </TabsList>
          </div>
          <div className="p-4 sm:p-6">
            <TabsContent value="academics">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Academic Profile</CardTitle>
                    <CardDescription>Courses and achievements highlighted for this college</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border overflow-hidden overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Course Name</TableHead>
                            <TableHead>Grade</TableHead>
                            <TableHead>Level</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {collegeData.academics && collegeData.academics.length > 0 ? (
                            collegeData.academics.map((course: any, index: number) => (
                              <TableRow key={index}>
                                <TableCell>{course.name}</TableCell>
                                <TableCell>{course.grade}</TableCell>
                                <TableCell>
                                  {course.level === "AP/IB" ? (
                                    <Badge className="bg-blue-500">AP/IB</Badge>
                                  ) : course.level === "Honors" ? (
                                    <Badge className="bg-purple-500">Honors</Badge>
                                  ) : (
                                    <Badge variant="outline">Regular</Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                                No courses highlighted for this college
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="extracurriculars">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Extracurricular Activities</CardTitle>
                    <CardDescription>Activities highlighted for this college</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {collegeData.extracurriculars && collegeData.extracurriculars.length > 0 ? (
                        collegeData.extracurriculars.map((activity: any, index: number) => (
                          <Card key={index} className="overflow-hidden">
                            <div className="p-4">
                              <h3 className="font-medium">{activity.organization}</h3>
                              <p className="text-sm text-muted-foreground">{activity.position}</p>
                              {activity.description && <p className="mt-2 text-sm">{activity.description}</p>}
                            </div>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center text-muted-foreground py-6 border rounded-md">
                          No activities highlighted for this college
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="awards">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Awards and Honors</CardTitle>
                    <CardDescription>Achievements highlighted for this college</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border overflow-hidden overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Honor Title</TableHead>
                            <TableHead>Grade Level</TableHead>
                            <TableHead>Level of Recognition</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {collegeData.awards && collegeData.awards.length > 0 ? (
                            collegeData.awards.map((award: any, index: number) => (
                              <TableRow key={index}>
                                <TableCell>{award.title}</TableCell>
                                <TableCell>{award.grade_level}</TableCell>
                                <TableCell>{award.level}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                                No awards highlighted for this college
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="essays">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>College-Specific Essays</CardTitle>
                    <CardDescription>Essays tailored for this college</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {collegeData.essays && collegeData.essays.length > 0 ? (
                        collegeData.essays.map((essay: any, index: number) => (
                          <div key={index} className="space-y-2">
                            <h3 className="font-medium mb-2">{essay.prompt}</h3>
                            <div className="p-4 bg-muted/50 rounded-md font-serif text-foreground">{essay.content}</div>
                            <p className="text-xs text-muted-foreground">Word Count: {essay.word_count}</p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-muted-foreground py-6 border rounded-md">
                          No essays added for this college
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
