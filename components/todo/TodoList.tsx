"use client"

import { DialogFooter } from "@/components/ui/dialog"

import { DialogHeader } from "@/components/ui/dialog"

import { DialogContent } from "@/components/ui/dialog"

import { Dialog } from "@/components/ui/dialog"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/AuthProvider"
import { handleSupabaseError } from "@/lib/supabase"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"
import { useToast } from "@/components/ui/use-toast"
import { validateRequired } from "@/lib/validation"
import { performDatabaseOperation } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { Loader2, Calendar, CheckCircle, Circle, PlusCircle, Edit, Trash2, Filter } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RequiredLabel } from "@/components/ui/required-label"
import { FormErrorSummary } from "@/components/ui/form-error-summary"

type TodoItem = {
  id: string
  title: string
  description?: string | null
  due_date?: string | null
  due_date_display?: string | null
  priority: string
  completed: boolean
  category: string
  related_college_id?: string | null
  related_essay_id?: string | null
  completed_at?: string | null
}

export default function TodoList() {
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [isAddingTodo, setIsAddingTodo] = useState(false)
  const [isEditingTodo, setIsEditingTodo] = useState(false)
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null)
  const [categories, setCategories] = useState<string[]>([
    "Essays",
    "Applications",
    "Test Prep",
    "Extracurriculars",
    "Other",
  ])
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = createClientComponentClient<Database>()

  const [newTodo, setNewTodo] = useState<Partial<TodoItem>>({
    title: "",
    description: "",
    due_date_display: "",
    priority: "medium",
    completed: false,
    category: "Other",
  })

  // Add state for confirmation dialog
  const [confirmDeleteTodo, setConfirmDeleteTodo] = useState<string | null>(null)

  const resetTodoForm = () => {
    setNewTodo({
      title: "",
      description: "",
      due_date_display: "",
      priority: "medium",
      completed: false,
      category: "Other",
    })
    setFormErrors({})
  }

  // Load todos from database on component mount
  useEffect(() => {
    if (!user?.id) return  // wait until we have a real user ID
  
    const fetchTodos = async () => {
      await performDatabaseOperation(
        async () => {
          const { data, error } = await supabase
            .from("todos")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
  
          if (error) throw error
          return data || []
        },
        setIsLoading,
        (data) => setTodos(data),
        (error) => {
          toast({
            title: "Error loading tasks",
            description: handleSupabaseError(error, "There was a problem loading your tasks."),
            variant: "destructive",
          })
        },
      )
    }
  
    fetchTodos()
  }, [user?.id])
  

  // Validate todo form
  const validateTodoForm = (isEditing: boolean): boolean => {
    const formData = isEditing ? newTodo : newTodo
    const errors: Record<string, string> = {}

    const titleError = validateRequired(formData.title, "Task title")
    if (titleError) errors.title = titleError

    const priorityError = validateRequired(formData.priority, "Priority")
    if (priorityError) errors.priority = priorityError

    const categoryError = validateRequired(formData.category, "Category")
    if (categoryError) errors.category = categoryError

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const addTodo = async () => {
    if (!user) return
    
    setFormSubmitted(true)
    
    if (!validateTodoForm(false)) {
      return
    }

    await performDatabaseOperation(
      async () => {
        const { data, error } = await supabase
          .from("todos")
          .insert([
            {
              user_id: user.id,
              title: newTodo.title!,
              description: newTodo.description || null,
              due_date: null, // ISO date format if needed
              due_date_display: newTodo.due_date_display || null,
              priority: newTodo.priority as string,
              completed: false,
              category: newTodo.category as string,
            },
          ])
          .select()

        if (error) throw error
        return data
      },
      setIsLoading,
      (data) => {
        if (data && data.length > 0) {
          setTodos([data[0], ...todos])
          resetTodoForm()
          setIsAddingTodo(false)
          setFormSubmitted(false)

          toast({
            title: "Task added",
            description: "Your task has been added successfully.",
          })
        }
      },
      (error) => {
        toast({
          title: "Error adding task",
          description: handleSupabaseError(error, "There was a problem adding the task."),
          variant: "destructive",
        })
      },
    )
  }

  const startEditTodo = (todoId: string) => {
    const todoToEdit = todos.find((t) => t.id === todoId)
    if (todoToEdit) {
      setNewTodo({
        title: todoToEdit.title,
        description: todoToEdit.description || "",
        due_date_display: todoToEdit.due_date_display || "",
        priority: todoToEdit.priority,
        category: todoToEdit.category,
      })
      setEditingTodoId(todoId)
      setIsEditingTodo(true)
    }
  }

  const updateTodo = async () => {
    if (!user || !editingTodoId) return
    
    setFormSubmitted(true)
    
    if (!validateTodoForm(true)) {
      return
    }

    await performDatabaseOperation(
      async () => {
        const { error } = await supabase
          .from("todos")
          .update({
            title: newTodo.title!,
            description: newTodo.description || null,
            due_date_display: newTodo.due_date_display || null,
            priority: newTodo.priority as string,
            category: newTodo.category as string,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingTodoId)

        if (error) throw error
        return { success: true }
      },
      setIsLoading,
      () => {
        setTodos(
          todos.map((todo) => {
            if (todo.id === editingTodoId) {
              return {
                ...todo,
                title: newTodo.title!,
                description: newTodo.description || null,
                due_date_display: newTodo.due_date_display || null,
                priority: newTodo.priority as string,
                category: newTodo.category as string,
              }
            }
            return todo
          }),
        )
        resetTodoForm()
        setIsEditingTodo(false)
        setEditingTodoId(null)
        setFormSubmitted(false)

        toast({
          title: "Task updated",
          description: "Your task has been updated successfully.",
        })
      },
      (error) => {
        toast({
          title: "Error updating task",
          description: handleSupabaseError(error, "There was a problem updating the task."),
          variant: "destructive",
        })
      },
    )
  }

  const toggleTodoCompletion = async (todoId: string) => {
    const todoToToggle = todos.find((t) => t.id === todoId)
    if (!todoToToggle || !user) return

    const newCompletedState = !todoToToggle.completed

    await performDatabaseOperation(
      async () => {
        const { error } = await supabase
          .from("todos")
          .update({
            completed: newCompletedState,
            completed_at: newCompletedState ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", todoId)

        if (error) throw error
        return { success: true }
      },
      setIsLoading,
      () => {
        setTodos(
          todos.map((todo) => {
            if (todo.id === todoId) {
              return {
                ...todo,
                completed: newCompletedState,
                completed_at: newCompletedState ? new Date().toISOString() : null,
              }
            }
            return todo
          }),
        )
      },
      (error) => {
        toast({
          title: "Error updating task",
          description: handleSupabaseError(error, "There was a problem updating the task status."),
          variant: "destructive",
        })
      },
    )
  }

  const deleteTodo = async (todoId: string) => {
    if (!user) return

    await performDatabaseOperation(
      async () => {
        const { error } = await supabase.from("todos").delete().eq("id", todoId)
        if (error) throw error
        return { success: true }
      },
      setIsLoading,
      () => {
        setTodos(todos.filter((todo) => todo.id !== todoId))
        setConfirmDeleteTodo(null)
        toast({
          title: "Task deleted",
          description: "Your task has been deleted successfully.",
        })
      },
      (error) => {
        toast({
          title: "Error deleting task",
          description: handleSupabaseError(error, "There was a problem deleting the task."),
          variant: "destructive",
        })
      },
    )
  }

  // Filter todos based on active filter
  const filteredTodos = todos.filter((todo) => {
    // Apply tab filters (All, Completed, Pending)
    if (activeFilter === "completed" && !todo.completed) return false
    if (activeFilter === "pending" && todo.completed) return false
    
    // Apply category filter
    if (categoryFilter && todo.category !== categoryFilter) return false
    
    // Apply priority filter
    if (priorityFilter && todo.priority !== priorityFilter) return false
    
    return true
  })

  // Clear all filters
  const clearFilters = () => {
    setCategoryFilter(null);
    setPriorityFilter(null);
  }

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-500">High</Badge>
      case "medium":
        return <Badge className="bg-yellow-500">Medium</Badge>
      case "low":
        return <Badge className="bg-green-500">Low</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  if (isLoading && todos.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-semibold">To-Do List</h2>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1">
                <Filter className="h-4 w-4" /> Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72">
              <div className="space-y-4">
                <h3 className="font-medium">Filter Tasks</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="category-filter">Category</Label>
                  <Select 
                    value={categoryFilter || "all"} 
                    onValueChange={(value) => setCategoryFilter(value === "all" ? null : value)}
                  >
                    <SelectTrigger id="category-filter">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="priority-filter">Priority</Label>
                  <Select 
                    value={priorityFilter || "all"} 
                    onValueChange={(value) => setPriorityFilter(value === "all" ? null : value)}
                  >
                    <SelectTrigger id="priority-filter">
                      <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button variant="outline" className="w-full" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <Button className="flex items-center gap-1" onClick={() => setIsAddingTodo(true)}>
            <PlusCircle className="h-4 w-4" /> Add Task
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeFilter} onValueChange={setActiveFilter} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <div className="space-y-4">
          {filteredTodos.length === 0 ? (
            <div className="text-center text-muted-foreground py-12 border rounded-md">
              No tasks found. Add a new task to get started.
            </div>
          ) : (
            filteredTodos.map((todo) => (
              <Card key={todo.id} className={`${todo.completed ? "bg-muted/30" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="pt-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full"
                        onClick={() => toggleTodoCompletion(todo.id)}
                      >
                        {todo.completed ? (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <h3 className={`font-medium ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
                          {todo.title}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {getPriorityBadge(todo.priority)}
                          <Badge variant="outline">{todo.category}</Badge>
                          {todo.due_date_display && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> {todo.due_date_display}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {todo.description && (
                        <p className={`mt-1 text-sm ${todo.completed ? "text-muted-foreground" : ""}`}>
                          {todo.description}
                        </p>
                      )}
                      <div className="mt-3 flex justify-end gap-2">
                        <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => startEditTodo(todo.id)}>
                          <Edit className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2"
                          onClick={() => setConfirmDeleteTodo(todo.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </Tabs>

      {/* Add Task Dialog */}
      <Dialog open={isAddingTodo} onOpenChange={setIsAddingTodo}>
        <DialogContent>
          <DialogHeader>
            <CardTitle>Add New Task</CardTitle>
          </DialogHeader>
          
          <FormErrorSummary errors={formErrors} show={formSubmitted} />
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <RequiredLabel htmlFor="title">Title</RequiredLabel>
              <Input
                id="title"
                value={newTodo.title}
                onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
              />
              {formErrors.title && <p className="text-xs text-destructive">{formErrors.title}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={newTodo.description || ""}
                onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date (Optional)</Label>
              <Input
                id="dueDate"
                placeholder="e.g. Tomorrow, Next Friday, Dec 15"
                value={newTodo.due_date_display || ""}
                onChange={(e) => setNewTodo({ ...newTodo, due_date_display: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <RequiredLabel htmlFor="priority">Priority</RequiredLabel>
                <Select value={newTodo.priority} onValueChange={(value) => setNewTodo({ ...newTodo, priority: value })}>
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.priority && <p className="text-xs text-destructive">{formErrors.priority}</p>}
              </div>

              <div className="grid gap-2">
                <RequiredLabel htmlFor="category">Category</RequiredLabel>
                <Select
                  value={newTodo.category}
                  onValueChange={(value) => setNewTodo({ ...newTodo, category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.category && <p className="text-xs text-destructive">{formErrors.category}</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={addTodo}>
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={isEditingTodo} onOpenChange={setIsEditingTodo}>
        <DialogContent>
          <DialogHeader>
            <CardTitle>Edit Task</CardTitle>
          </DialogHeader>
          
          <FormErrorSummary errors={formErrors} show={formSubmitted} />
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <RequiredLabel htmlFor="editTitle">Title</RequiredLabel>
              <Input
                id="editTitle"
                value={newTodo.title || ""}
                onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
              />
              {formErrors.title && <p className="text-xs text-destructive">{formErrors.title}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editDescription">Description (Optional)</Label>
              <Textarea
                id="editDescription"
                value={newTodo.description || ""}
                onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <RequiredLabel htmlFor="editPriority">Priority</RequiredLabel>
                <Select
                  value={newTodo.priority || "medium"}
                  onValueChange={(value) => setNewTodo({ ...newTodo, priority: value })}
                >
                  <SelectTrigger id="editPriority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.priority && <p className="text-xs text-destructive">{formErrors.priority}</p>}
              </div>
              <div className="grid gap-2">
                <RequiredLabel htmlFor="editCategory">Category</RequiredLabel>
                <Select
                  value={newTodo.category || "Other"}
                  onValueChange={(value) => setNewTodo({ ...newTodo, category: value })}
                >
                  <SelectTrigger id="editCategory">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.category && <p className="text-xs text-destructive">{formErrors.category}</p>}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editDueDate">Due Date (Optional)</Label>
              <Input
                id="editDueDate"
                placeholder="e.g., May 15, 2025"
                value={newTodo.due_date_display || ""}
                onChange={(e) => setNewTodo({ ...newTodo, due_date_display: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={updateTodo}>
              Update Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={!!confirmDeleteTodo}
        onOpenChange={(open) => !open && setConfirmDeleteTodo(null)}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete"
        onConfirm={() => confirmDeleteTodo && deleteTodo(confirmDeleteTodo)}
        variant="destructive"
      />
    </div>
  )
}
