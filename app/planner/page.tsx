"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Kanban, Briefcase, ListTodo, CalendarDays } from "lucide-react"
import CalendarView from "@/components/planner/CalendarView"
import KanbanBoard from "@/components/planner/KanbanBoard"
import ApplicationTracker from "@/components/planner/ApplicationTracker"
import TasksList from "@/components/planner/TasksList"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export default function PlannerPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("calendar")

  // Redirect to login if not authenticated
  if (!isLoading && !user) {
    router.push("/login")
    return null
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Skeleton className="h-48 rounded-lg" />
            <Skeleton className="h-48 rounded-lg" />
            <Skeleton className="h-48 rounded-lg" />
            <Skeleton className="h-48 rounded-lg" />
          </div>
          <Skeleton className="h-[600px] rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Planner</h1>
          <p className="text-muted-foreground">
            Organize your schedule, tasks, and applications all in one place.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                +2 compared to last week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tasks Due Soon</CardTitle>
              <ListTodo className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">4 due today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Kanban Boards</CardTitle>
              <Kanban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                7 tasks in progress
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Job Applications</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">
                2 interviews scheduled
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="calendar" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex items-center gap-2">
                <ListTodo className="h-4 w-4" />
                Tasks
              </TabsTrigger>
              <TabsTrigger value="kanban" className="flex items-center gap-2">
                <Kanban className="h-4 w-4" />
                Kanban Boards
              </TabsTrigger>
              <TabsTrigger value="applications" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Applications
              </TabsTrigger>
            </TabsList>

            {/* Conditional action button based on active tab */}
            {activeTab === "calendar" && (
              <Button size="sm">Add Event</Button>
            )}
            {activeTab === "tasks" && (
              <Button size="sm">Add Task</Button>
            )}
            {activeTab === "kanban" && (
              <Button size="sm">New Board</Button>
            )}
            {activeTab === "applications" && (
              <Button size="sm">New Application</Button>
            )}
          </div>

          <TabsContent value="calendar" className="p-0">
            <CalendarView />
          </TabsContent>
          <TabsContent value="tasks" className="p-0">
            <TasksList />
          </TabsContent>
          <TabsContent value="kanban" className="p-0">
            <KanbanBoard />
          </TabsContent>
          <TabsContent value="applications" className="p-0">
            <ApplicationTracker />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 