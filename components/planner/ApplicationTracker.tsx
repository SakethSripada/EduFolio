"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/AuthProvider"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Search, MoreHorizontal, Briefcase, Building, Calendar, User, Phone, Mail, ExternalLink, MapPin } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Define application type
type Application = {
  id: string
  company_name: string
  position: string
  application_url: string | null
  status: string
  application_date: string | null
  notes: string | null
  salary_range: string | null
  location: string | null
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  next_steps: string | null
  next_steps_date: string | null
  created_at: string
  updated_at: string
}

export default function ApplicationTracker() {
  const { user } = useAuth()
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isAddApplicationOpen, setIsAddApplicationOpen] = useState(false)
  const [newApplication, setNewApplication] = useState<Partial<Application>>({
    company_name: "",
    position: "",
    application_url: "",
    status: "interested",
    application_date: new Date().toISOString().split('T')[0],
    notes: "",
    salary_range: "",
    location: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    next_steps: "",
    next_steps_date: null,
  })

  // Fetch all applications
  useEffect(() => {
    const fetchApplications = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from("planner_application_tracker")
          .select("*")
          .eq("user_id", user.id)
          .order("application_date", { ascending: false })
        
        if (error) throw error
        setApplications(data || [])
      } catch (error) {
        console.error("Error fetching applications:", error)
        toast({
          title: "Error fetching applications",
          description: "Could not load your applications. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchApplications()
  }, [user, supabase, toast])

  // Apply filters and search
  useEffect(() => {
    let result = [...applications]
    
    // Apply tab filter
    if (activeTab !== "all") {
      result = result.filter(app => app.status === activeTab)
    }
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(app => 
        app.company_name.toLowerCase().includes(query) || 
        app.position.toLowerCase().includes(query) ||
        (app.location && app.location.toLowerCase().includes(query))
      )
    }
    
    setFilteredApplications(result)
  }, [applications, activeTab, searchQuery])

  // Add a new application
  const handleAddApplication = async () => {
    if (!user) return
    if (!newApplication.company_name || !newApplication.position) {
      toast({
        title: "Required fields missing",
        description: "Company name and position are required.",
        variant: "destructive",
      })
      return
    }

    try {
      const { data, error } = await supabase
        .from("planner_application_tracker")
        .insert([
          {
            user_id: user.id,
            company_name: newApplication.company_name,
            position: newApplication.position,
            application_url: newApplication.application_url || null,
            status: newApplication.status || "interested",
            application_date: newApplication.application_date || null,
            notes: newApplication.notes || null,
            salary_range: newApplication.salary_range || null,
            location: newApplication.location || null,
            contact_name: newApplication.contact_name || null,
            contact_email: newApplication.contact_email || null,
            contact_phone: newApplication.contact_phone || null,
            next_steps: newApplication.next_steps || null,
            next_steps_date: newApplication.next_steps_date || null,
          },
        ])
        .select()

      if (error) throw error

      if (data && data.length > 0) {
        setApplications([data[0], ...applications])
        setIsAddApplicationOpen(false)
        setNewApplication({
          company_name: "",
          position: "",
          application_url: "",
          status: "interested",
          application_date: new Date().toISOString().split('T')[0],
          notes: "",
          salary_range: "",
          location: "",
          contact_name: "",
          contact_email: "",
          contact_phone: "",
          next_steps: "",
          next_steps_date: null,
        })
        toast({
          title: "Application added",
          description: "Your new application has been added successfully.",
        })
      }
    } catch (error) {
      console.error("Error adding application:", error)
      toast({
        title: "Error adding application",
        description: "Could not add your application. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Update application status
  const handleUpdateStatus = async (application: Application, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("planner_application_tracker")
        .update({ status: newStatus })
        .eq("id", application.id)

      if (error) throw error

      // Update the application in local state
      setApplications(applications.map(app => 
        app.id === application.id ? { ...app, status: newStatus } : app
      ))
      
      toast({
        title: "Status updated",
        description: `Application status has been updated to ${newStatus}`,
      })
    } catch (error) {
      console.error("Error updating application:", error)
      toast({
        title: "Error updating status",
        description: "Could not update the application status. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Render status badge
  const renderStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      interested: "bg-blue-500/10 text-blue-500",
      applied: "bg-yellow-500/10 text-yellow-500",
      interviewing: "bg-purple-500/10 text-purple-500",
      offer: "bg-green-500/10 text-green-500",
      rejected: "bg-red-500/10 text-red-500",
      declined: "bg-orange-500/10 text-orange-500",
      archived: "bg-gray-500/10 text-gray-500",
    }
    
    return (
      <Badge variant="outline" className={cn("capitalize", variants[status] || "")}>
        {status}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Application Tracker</CardTitle>
        <CardDescription>
          Keep track of your job applications, interviews, and offers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="interested">Interested</TabsTrigger>
                <TabsTrigger value="applied">Applied</TabsTrigger>
                <TabsTrigger value="interviewing">Interviewing</TabsTrigger>
                <TabsTrigger value="offer">Offers</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search applications..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <Dialog open={isAddApplicationOpen} onOpenChange={setIsAddApplicationOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Add Application
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Application</DialogTitle>
                <DialogDescription>
                  Track a new job application in your job search process.
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[70vh]">
                <div className="grid gap-4 py-4 px-1">
                  <div className="grid gap-2">
                    <Label htmlFor="company-name" className="font-medium">Company Name *</Label>
                    <Input
                      id="company-name"
                      value={newApplication.company_name || ""}
                      onChange={(e) => setNewApplication({ ...newApplication, company_name: e.target.value })}
                      placeholder="Company name"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="position" className="font-medium">Position *</Label>
                    <Input
                      id="position"
                      value={newApplication.position || ""}
                      onChange={(e) => setNewApplication({ ...newApplication, position: e.target.value })}
                      placeholder="Job title/position"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="status" className="font-medium">Status</Label>
                      <select
                        id="status"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={newApplication.status || "interested"}
                        onChange={(e) => setNewApplication({ ...newApplication, status: e.target.value })}
                      >
                        <option value="interested">Interested</option>
                        <option value="applied">Applied</option>
                        <option value="interviewing">Interviewing</option>
                        <option value="offer">Offer</option>
                        <option value="rejected">Rejected</option>
                        <option value="declined">Declined</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="application-date" className="font-medium">Application Date</Label>
                      <Input
                        id="application-date"
                        type="date"
                        value={newApplication.application_date || ""}
                        onChange={(e) => setNewApplication({ ...newApplication, application_date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="application-url" className="font-medium">Application URL</Label>
                    <Input
                      id="application-url"
                      type="url"
                      value={newApplication.application_url || ""}
                      onChange={(e) => setNewApplication({ ...newApplication, application_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="location" className="font-medium">Location</Label>
                      <Input
                        id="location"
                        value={newApplication.location || ""}
                        onChange={(e) => setNewApplication({ ...newApplication, location: e.target.value })}
                        placeholder="Remote, City, State, etc."
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="salary-range" className="font-medium">Salary Range</Label>
                      <Input
                        id="salary-range"
                        value={newApplication.salary_range || ""}
                        onChange={(e) => setNewApplication({ ...newApplication, salary_range: e.target.value })}
                        placeholder="e.g. $80K-$100K"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes" className="font-medium">Notes</Label>
                    <Textarea
                      id="notes"
                      value={newApplication.notes || ""}
                      onChange={(e) => setNewApplication({ ...newApplication, notes: e.target.value })}
                      placeholder="Additional notes about this application..."
                      rows={3}
                    />
                  </div>
                  <h3 className="text-lg font-semibold mt-2">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="contact-name" className="font-medium">Contact Name</Label>
                      <Input
                        id="contact-name"
                        value={newApplication.contact_name || ""}
                        onChange={(e) => setNewApplication({ ...newApplication, contact_name: e.target.value })}
                        placeholder="Contact person name"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="contact-email" className="font-medium">Contact Email</Label>
                      <Input
                        id="contact-email"
                        type="email"
                        value={newApplication.contact_email || ""}
                        onChange={(e) => setNewApplication({ ...newApplication, contact_email: e.target.value })}
                        placeholder="contact@company.com"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="contact-phone" className="font-medium">Contact Phone</Label>
                    <Input
                      id="contact-phone"
                      type="tel"
                      value={newApplication.contact_phone || ""}
                      onChange={(e) => setNewApplication({ ...newApplication, contact_phone: e.target.value })}
                      placeholder="(123) 456-7890"
                    />
                  </div>
                  <h3 className="text-lg font-semibold mt-2">Next Steps</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="next-steps" className="font-medium">Next Steps</Label>
                      <Input
                        id="next-steps"
                        value={newApplication.next_steps || ""}
                        onChange={(e) => setNewApplication({ ...newApplication, next_steps: e.target.value })}
                        placeholder="e.g. Phone Interview"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="next-steps-date" className="font-medium">Date</Label>
                      <Input
                        id="next-steps-date"
                        type="date"
                        value={newApplication.next_steps_date || ""}
                        onChange={(e) => setNewApplication({ ...newApplication, next_steps_date: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </ScrollArea>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddApplicationOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddApplication}>
                  Add Application
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {filteredApplications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg">
            <p className="text-center text-muted-foreground mb-4">
              {applications.length === 0
                ? "You haven't tracked any job applications yet. Start tracking your job search!"
                : "No applications match your current filters."}
            </p>
            {applications.length === 0 ? (
              <Button onClick={() => setIsAddApplicationOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add Your First Application
              </Button>
            ) : (
              <Button variant="outline" onClick={() => {
                setActiveTab("all")
                setSearchQuery("")
              }}>
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredApplications.map((application) => (
              <Card key={application.id} className="overflow-hidden">
                <CardHeader className="p-4 pb-0 flex flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle className="text-base font-bold">{application.company_name}</CardTitle>
                    <CardDescription className="line-clamp-1">{application.position}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <div>{renderStatusBadge(application.status)}</div>
                      <div className="text-muted-foreground">
                        {application.application_date && 
                          format(new Date(application.application_date), "MMM d, yyyy")}
                      </div>
                    </div>
                    {application.location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{application.location}</span>
                      </div>
                    )}
                    {application.salary_range && (
                      <div className="text-muted-foreground">
                        {application.salary_range}
                      </div>
                    )}
                    {application.application_url && (
                      <a
                        href={application.application_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>View Application</span>
                      </a>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex flex-col items-start gap-2">
                  <div className="text-sm font-medium">Update Status:</div>
                  <div className="flex flex-wrap gap-2">
                    {["interested", "applied", "interviewing", "offer", "rejected"].map((status) => (
                      application.status !== status && (
                        <Button
                          key={status}
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => handleUpdateStatus(application, status)}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Button>
                      )
                    ))}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {filteredApplications.length} of {applications.length} applications
        </div>
      </CardFooter>
    </Card>
  )
} 