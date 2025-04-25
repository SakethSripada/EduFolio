"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Loader2, Sparkles } from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { handleSupabaseError } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import CollegeAcademics from "@/components/college-application/college-specific/CollegeAcademics"
import CollegeExtracurriculars from "@/components/college-application/college-specific/CollegeExtracurriculars"
import CollegeAwards from "@/components/college-application/college-specific/CollegeAwards"
import CollegeEssays from "@/components/college-application/college-specific/CollegeEssays"
import CollegeTodos from "@/components/college-application/college-specific/CollegeTodos"
import AIAssistant from "@/components/ai/AIAssistant"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"
import type { UserCollege } from "@/types"

type College = {
  id: string
  name: string
  location: string
  type: string
  size: string
  acceptance_rate: number
  ranking: number
  tuition: number
  logo_url: string
  website_url?: string
}

export default function CollegeApplicationPage() {
  const params = useParams()
  const router = useRouter()
  const collegeId = params.id as string
  const [college, setCollege] = useState<College | null>(null)
  const [userCollege, setUserCollege] = useState<UserCollege | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("academics")
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    if (!user || !collegeId) return

    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch college details
        const { data: collegeData, error: collegeError } = await supabase
          .from("colleges")
          .select("*")
          .eq("id", collegeId)
          .maybeSingle()

        if (collegeError) throw collegeError
        
        console.log('College data:', collegeData, 'College ID:', collegeId)

        if (!collegeData) {
          throw new Error("College not found")
        }

        // Fetch user's college relationship
        const { data: userCollegeData, error: userCollegeError } = await supabase
          .from("user_colleges")
          .select("*")
          .eq("user_id", user.id)
          .eq("college_id", collegeId)
          .maybeSingle()

        console.log('User college data:', userCollegeData, 'User ID:', user.id)
        
        if (userCollegeError && userCollegeError.code !== "PGRST116") throw userCollegeError

        setCollege(collegeData)
        setUserCollege(userCollegeData)
      } catch (error) {
        console.error("Error fetching college data:", error)
        toast({
          title: "Error loading college",
          description: handleSupabaseError(error, "There was a problem loading the college information."),
          variant: "destructive",
        })
        // Navigate back to college list if college not found
        router.push("/college-application")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user, collegeId, router, toast, supabase])

  const getStatusBadge = () => {
    if (!userCollege) return null

    const statusColors = {
      Researching: "bg-gray-200 text-gray-800",
      Applying: "bg-blue-100 text-blue-800",
      Applied: "bg-purple-100 text-purple-800",
      Waitlisted: "bg-yellow-100 text-yellow-800",
      Accepted: "bg-green-100 text-green-800",
      Rejected: "bg-red-100 text-red-800",
      Committed: "bg-primary/20 text-primary",
    }

    const status = userCollege.application_status as keyof typeof statusColors
    const colorClass = statusColors[status] || "bg-gray-200 text-gray-800"

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {userCollege.application_status}
      </span>
    )
  }

  const getCategoryBadges = () => {
    if (!userCollege) return null

    return (
      <div className="flex flex-wrap gap-1">
        {userCollege.is_reach && (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Reach</span>
        )}
        {userCollege.is_target && (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Target</span>
        )}
        {userCollege.is_safety && (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Safety</span>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </ProtectedRoute>
    )
  }

  if ((!college || !userCollege) && user) {
    console.log('Not found condition triggered - College:', college, 'UserCollege:', userCollege, 'User:', user)
    return (
      <ProtectedRoute>
        <div className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center mb-8">
              <Button variant="ghost" onClick={() => router.push("/college-application")} className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to College List
              </Button>
            </div>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <h2 className="text-xl font-semibold mb-2">College Not Found</h2>
                  <p className="text-muted-foreground">
                    This college is not in your list. Please add it to your list first.
                  </p>
                  <Button className="mt-4" onClick={() => router.push("/college-application")}>
                    Go to College List
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <Toaster />
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-8">
            <Button variant="ghost" onClick={() => router.push("/college-application")} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to College List
            </Button>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle className="text-2xl">{college!.name}</CardTitle>
                  <CardDescription>{college!.location}</CardDescription>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    {getStatusBadge()}
                    {userCollege!.application_deadline_display && (
                      <span className="text-sm text-muted-foreground">
                        Deadline: {userCollege!.application_deadline_display}
                      </span>
                    )}
                  </div>
                  {getCategoryBadges()}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">College Type</h3>
                  <p>{college!.type}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Size</h3>
                  <p>{college!.size}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Acceptance Rate</h3>
                  <p>{(college!.acceptance_rate * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Ranking</h3>
                  <p>#{college!.ranking}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Tuition</h3>
                  <p>${college!.tuition.toLocaleString()}/year</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Website</h3>
                  <p>
                    {college!.website_url ? (
                      <a
                        href={college!.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Visit Website
                      </a>
                    ) : (
                      "Not available"
                    )}
                  </p>
                </div>
              </div>

              {userCollege!.notes && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Notes</h3>
                    <p className="text-sm">{userCollege!.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Application Materials</h2>
          </div>

          <Card>
            <Tabs defaultValue="academics" value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                  <TabsTrigger value="todos" className="px-4 py-2 rounded-md whitespace-nowrap">
                    To-Do List
                  </TabsTrigger>
                </TabsList>
              </div>
              <div className="p-4 sm:p-6">
                <TabsContent value="academics">
                  <CollegeAcademics collegeId={collegeId} />
                </TabsContent>
                <TabsContent value="extracurriculars">
                  <CollegeExtracurriculars collegeId={collegeId} />
                </TabsContent>
                <TabsContent value="awards">
                  <CollegeAwards collegeId={collegeId} />
                </TabsContent>
                <TabsContent value="essays">
                  <CollegeEssays collegeId={collegeId} collegeName={college!.name} />
                </TabsContent>
                <TabsContent value="todos">
                  <CollegeTodos collegeId={collegeId} collegeName={college!.name} />
                </TabsContent>
              </div>
            </Tabs>
          </Card>
        </div>

        {/* AI Assistant Button - Always visible */}
        <Button
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 p-0 shadow-lg z-50 bg-primary hover:bg-primary/90"
          onClick={() => setShowAIAssistant(true)}
        >
          <Sparkles className="h-6 w-6" />
        </Button>

        {/* AI Assistant Dialog */}
        {showAIAssistant && (
          <AIAssistant
            initialContext={{
              type: "college",
              id: collegeId,
              title: `${college!.name} Application`,
            }}
            showOnLoad={true}
            onClose={() => setShowAIAssistant(false)}
          />
        )}
      </div>
    </ProtectedRoute>
  )
}
