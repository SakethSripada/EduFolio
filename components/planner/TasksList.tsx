"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/AuthProvider"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, Check, Search, Plus, ArrowUpDown, Filter, CheckCircle2, Circle, Clock, CalendarDays, ListFilter } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Types
type Task = {
  id: string
  title: string
  description: string | null
  due_date: string | null
  priority: string | null
  status: string
  board_id: string | null
  column_id: string | null
  position: number
  labels: string[] | null
  color: string | null
  created_at: string
  updated_at: string
}

export default function TasksList() {
  const { user } = useAuth()
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    description: "",
    due_date: null,
    priority: "medium",
    status: "todo",
  })
  const [sort, setSort] = useState<{ field: string, direction: "asc" | "desc" }>({ 
    field: "created_at", 
    direction: "desc" 
  })
  const [filters, setFilters] = useState<{
    status: string[],
    priority: string[]
  }>({
    status: ["todo", "in_progress"],
    priority: []
  })

  // Fetch all tasks
  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from("planner_tasks")
          .select("*")
          .eq("user_id", user.id)
          .order(sort.field, { ascending: sort.direction === "asc" })
        
        if (error) throw error
        setTasks(data || [])
      } catch (error) {
        console.error("Error fetching tasks:", error)
        toast({
          title: "Error fetching tasks",
          description: "Could not load your tasks. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTasks()
  }, [user, supabase, toast, sort])

  // Apply filters and search
  useEffect(() => {
    let result = [...tasks]
    
    // Apply status filter
    if (filters.status.length > 0) {
      result = result.filter(task => filters.status.includes(task.status))
    }
    
    // Apply priority filter
    if (filters.priority.length > 0) {
      result = result.filter(task => task.priority && filters.priority.includes(task.priority))
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(task => 
        task.title.toLowerCase().includes(query) || 
        (task.description && task.description.toLowerCase().includes(query))
      )
    }
    
    setFilteredTasks(result)
  }, [tasks, filters, searchQuery])

  // Add a new task
  const handleAddTask = async () => {
    if (!user) return
    if (!newTask.title) {
      toast({
        title: "Title is required",
        description: "Please enter a title for your task.",
        variant: "destructive",
      })
      return
    }

    try {
      const { data, error } = await supabase
        .from("planner_tasks")
        .insert([
          {
            user_id: user.id,
            title: newTask.title,
            description: newTask.description || null,
            due_date: newTask.due_date || null,
            priority: newTask.priority || "medium",
            status: "todo",
            position: 0,
            labels: newTask.labels || null,
            color: newTask.color || null,
          },
        ])
        .select()

      if (error) throw error

      if (data && data.length > 0) {
        setTasks([data[0], ...tasks])
        setIsAddTaskOpen(false)
        setNewTask({
          title: "",
          description: "",
          due_date: null,
          priority: "medium",
          status: "todo",
        })
        toast({
          title: "Task added",
          description: "Your new task has been added successfully.",
        })
      }
    } catch (error) {
      console.error("Error adding task:", error)
      toast({
        title: "Error adding task",
        description: "Could not add your task. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Update task status
  const handleToggleTask = async (task: Task) => {
    const newStatus = task.status === "done" ? "todo" : "done"
    
    try {
      const { error } = await supabase
        .from("planner_tasks")
        .update({ status: newStatus })
        .eq("id", task.id)

      if (error) throw error

      // Update the task in local state
      setTasks(tasks.map(t => 
        t.id === task.id ? { ...t, status: newStatus } : t
      ))
      
      toast({
        title: `Task ${newStatus === "done" ? "completed" : "reopened"}`,
        description: `Task has been ${newStatus === "done" ? "marked as done" : "reopened"}`,
      })
    } catch (error) {
      console.error("Error updating task:", error)
      toast({
        title: "Error updating task",
        description: "Could not update the task status. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Sort tasks by a specific field
  const handleSort = (field: string) => {
    if (sort.field === field) {
      // Toggle direction if same field
      setSort({
        field,
        direction: sort.direction === "asc" ? "desc" : "asc"
      })
    } else {
      // New field, default to ascending
      setSort({
        field,
        direction: "asc"
      })
    }
  }

  // Get sort direction icon
  const getSortIcon = (field: string) => {
    if (sort.field !== field) return null
    
    return sort.direction === "asc" ? 
      <ArrowUpDown className="ml-2 h-4 w-4" /> : 
      <ArrowUpDown className="ml-2 h-4 w-4 transform rotate-180" />
  }

  // Render priority badge
  const renderPriorityBadge = (priority: string | null) => {
    if (!priority) return null
    
    const variants: Record<string, string> = {
      low: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
      medium: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
      high: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20",
      urgent: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
    }
    
    return (
      <Badge variant="outline" className={cn("capitalize", variants[priority])}>
        {priority}
      </Badge>
    )
  }
  
  // Render status badge
  const renderStatusBadge = (status: string) => {
    const variants: Record<string, { icon: React.ReactNode, class: string }> = {
      todo: { 
        icon: <Circle className="h-3 w-3 mr-1" />, 
        class: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100" 
      },
      in_progress: { 
        icon: <Clock className="h-3 w-3 mr-1" />, 
        class: "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100" 
      },
      done: { 
        icon: <CheckCircle2 className="h-3 w-3 mr-1" />, 
        class: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100" 
      },
      archived: { 
        icon: <CalendarDays className="h-3 w-3 mr-1" />, 
        class: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100" 
      },
    }
    
    const variant = variants[status] || variants.todo
    
    return (
      <Badge className={cn("flex items-center gap-1 capitalize", variant.class)}>
        {variant.icon}{status.replace("_", " ")}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Tasks</CardTitle>
        <CardDescription>
          Manage all your tasks in one place. Track progress and stay organized.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" /> Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={filters.status.includes("todo")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFilters({...filters, status: [...filters.status, "todo"]})
                    } else {
                      setFilters({...filters, status: filters.status.filter(s => s !== "todo")})
                    }
                  }}
                >
                  To Do
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.status.includes("in_progress")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFilters({...filters, status: [...filters.status, "in_progress"]})
                    } else {
                      setFilters({...filters, status: filters.status.filter(s => s !== "in_progress")})
                    }
                  }}
                >
                  In Progress
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.status.includes("done")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFilters({...filters, status: [...filters.status, "done"]})
                    } else {
                      setFilters({...filters, status: filters.status.filter(s => s !== "done")})
                    }
                  }}
                >
                  Done
                </DropdownMenuCheckboxItem>
                <DropdownMenuLabel className="mt-2">Filter by Priority</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={filters.priority.includes("low")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFilters({...filters, priority: [...filters.priority, "low"]})
                    } else {
                      setFilters({...filters, priority: filters.priority.filter(p => p !== "low")})
                    }
                  }}
                >
                  Low
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.priority.includes("medium")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFilters({...filters, priority: [...filters.priority, "medium"]})
                    } else {
                      setFilters({...filters, priority: filters.priority.filter(p => p !== "medium")})
                    }
                  }}
                >
                  Medium
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.priority.includes("high")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFilters({...filters, priority: [...filters.priority, "high"]})
                    } else {
                      setFilters({...filters, priority: filters.priority.filter(p => p !== "high")})
                    }
                  }}
                >
                  High
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.priority.includes("urgent")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFilters({...filters, priority: [...filters.priority, "urgent"]})
                    } else {
                      setFilters({...filters, priority: filters.priority.filter(p => p !== "urgent")})
                    }
                  }}
                >
                  Urgent
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" /> Add Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add a new task</DialogTitle>
                  <DialogDescription>
                    Create a new task with details and due date.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newTask.title || ""}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      placeholder="Task title"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={newTask.description || ""}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      placeholder="Task description"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Due Date (Optional)</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newTask.due_date
                              ? format(new Date(newTask.due_date), "PPP")
                              : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={newTask.due_date ? new Date(newTask.due_date) : undefined}
                            onSelect={(date) => {
                              if (date) {
                                setNewTask({ ...newTask, due_date: date.toISOString() })
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <select
                        id="priority"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={newTask.priority || "medium"}
                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddTaskOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddTask}>
                    Add Task
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg">
            <p className="text-center text-muted-foreground mb-4">
              {tasks.length === 0
                ? "You don't have any tasks yet. Add your first task to get started."
                : "No tasks match your current filters."}
            </p>
            {tasks.length === 0 ? (
              <Button onClick={() => setIsAddTaskOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add Your First Task
              </Button>
            ) : (
              <Button variant="outline" onClick={() => {
                setSearchQuery("")
                setFilters({ status: [], priority: [] })
              }}>
                <ListFilter className="h-4 w-4 mr-2" /> Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("title")}>
                  <div className="flex items-center">
                    Title {getSortIcon("title")}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("priority")}>
                  <div className="flex items-center">
                    Priority {getSortIcon("priority")}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("due_date")}>
                  <div className="flex items-center">
                    Due Date {getSortIcon("due_date")}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
                  <div className="flex items-center">
                    Status {getSortIcon("status")}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.id} className={task.status === "done" ? "opacity-60" : ""}>
                  <TableCell>
                    <Checkbox
                      checked={task.status === "done"}
                      onCheckedChange={() => handleToggleTask(task)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{task.title}</div>
                    {task.description && (
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {task.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{task.priority && renderPriorityBadge(task.priority)}</TableCell>
                  <TableCell>
                    {task.due_date && format(new Date(task.due_date), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>{renderStatusBadge(task.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {filteredTasks.length} of {tasks.length} tasks
        </div>
      </CardFooter>
    </Card>
  )
} 