"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Edit, Trash2, Copy, Loader2, Calendar, CheckCircle2, Sparkles } from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { validateRequired } from "@/lib/validation"
import { useSupabaseQuery } from "@/lib/hooks/use-supabase-query"
import { useSupabaseMutation } from "@/lib/hooks/use-supabase-mutation"
import AIAssistant from "@/components/ai/AIAssistant"
// Import the safeSupabaseCall utility
import { safeSupabaseCall } from "@/lib/safe-supabase"

type CollegeTodosProps = {
  collegeId: string
  collegeName: string
}

type Todo = {
  id: string
  title: string
  description: string | null
  due_date: string | null
  due_date_display: string | null
  priority: string
  completed: boolean
  category: string
  related_essay_id: string | null
  completed_at: string | null
}

export default function CollegeTodos({ collegeId, collegeName }: CollegeTodosProps) {
  const [isAddingTodo, setIsAddingTodo] = useState(false)
  const [isEditingTodo, setIsEditingTodo] = useState(false)
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null)
  const [isImportingTodos, setIsImportingTodos] = useState(false)
  const [selectedTodos, setSelectedTodos] = useState<Record<string, boolean>>({})
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [confirmDeleteTodo, setConfirmDeleteTodo] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<"all" | "pending" | "completed">("all")
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  // Initialize with empty values to avoid undefined errors
  const [newTodo, setNewTodo] = useState<Partial<Todo>>({
    title: "",
    description: "",
    due_date_display: "",
    priority: "medium",
    category: "Applications",
    completed: false,
  })

  // Use our custom hook for fetching college todos
  const {
    data: collegeTodos,
    isLoading: isLoadingTodos,
    refetch: refetchTodos,
  } = useSupabaseQuery<Todo[]>({
    queryKey: ["college-todos", collegeId, user?.id ?? ""],
    queryFn: async () => {
      if (!user || !collegeId) return []

      return safeSupabaseCall(async () => {
        const { data, error } = await supabase
          .from("college_todos")
          .select("*")
          .eq("user_id", user.id)
          .eq("college_id", collegeId)
          .order("created_at", { ascending: false })

        if (error) throw error
        return data || []
      })
    },
    enabled: !!user && !!collegeId,
  })

  // Update the general todos query
  const { data: generalTodos, isLoading: isLoadingGeneralTodos } = useSupabaseQuery<Todo[]>({
    queryKey: ["general-todos", user?.id ?? ""],
    queryFn: async () => {
      if (!user) return []

      return safeSupabaseCall(async () => {
        const { data, error } = await supabase
          .from("todos")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error) throw error
        return data || []
      })
    },
    enabled: !!user,
  })

  // Add todo mutation
  const addTodoMutation = useSupabaseMutation<Partial<Todo>, Todo>({
    mutationFn: async (todo) => {
      if (!user || !collegeId) throw new Error("User or college ID not available")

      const { data, error } = await supabase
        .from("college_todos")
        .insert([
          {
            user_id: user.id,
            college_id: collegeId,
            title: todo.title,
            description: todo.description || null,
            due_date_display: todo.due_date_display || null,
            priority: todo.priority,
            category: todo.category,
            completed: false,
          },
        ])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      setNewTodo({
        title: "",
        description: "",
        due_date_display: "",
        priority: "medium",
        category: "Applications",
        completed: false,
      })
      setIsAddingTodo(false)
      refetchTodos()

      toast({
        title: "Task added",
        description: "Your task has been added successfully.",
      })
    },
  })

  // Update todo mutation
  const updateTodoMutation = useSupabaseMutation<{ id: string; todo: Partial<Todo> }, any>({
    mutationFn: async ({ id, todo }) => {
      if (!user || !collegeId) throw new Error("User or college ID not available")

      const { error } = await supabase
        .from("college_todos")
        .update({
          title: todo.title,
          description: todo.description || null,
          due_date_display: todo.due_date_display || null,
          priority: todo.priority,
          category: todo.category,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("college_id", collegeId)

      if (error) throw error
      return { success: true }
    },
    onSuccess: () => {
      setIsEditingTodo(false)
      setEditingTodoId(null)
      setNewTodo({
        title: "",
        description: "",
        due_date_display: "",
        priority: "medium",
        category: "Applications",
        completed: false,
      })
      refetchTodos()

      toast({
        title: "Task updated",
        description: "Your task has been updated successfully.",
      })
    },
  })

  // Toggle todo completion mutation
  const toggleTodoMutation = useSupabaseMutation<{ id: string; completed: boolean }, any>({
    mutationFn: async ({ id, completed }) => {
      if (!user || !collegeId) throw new Error("User or college ID not available")

      const { error } = await supabase
        .from("college_todos")
        .update({
          completed: completed,
          completed_at: completed ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("college_id", collegeId)

      if (error) throw error
      return { success: true }
    },
    onSuccess: () => {
      refetchTodos()
    },
  })

  // Delete todo mutation
  const deleteTodoMutation = useSupabaseMutation<string, any>({
    mutationFn: async (todoId) => {
      if (!user || !collegeId) throw new Error("User or college ID not available")

      const { error } = await supabase.from("college_todos").delete().eq("id", todoId).eq("college_id", collegeId)

      if (error) throw error
      return { success: true }
    },
    onSuccess: () => {
      setConfirmDeleteTodo(null)
      refetchTodos()

      toast({
        title: "Task deleted",
        description: "Your task has been deleted successfully.",
      })
    },
  })

  // Import todos mutation
  const importTodosMutation = useSupabaseMutation<string[], Todo[]>({
    mutationFn: async (selectedTodoIds) => {
      if (!user || !collegeId) throw new Error("User or college ID not available")
      if (!generalTodos) throw new Error("General todos not available")

      const todosToImport = generalTodos.filter((todo) => selectedTodoIds.includes(todo.id))

      const todosData = todosToImport.map((todo) => ({
        user_id: user.id,
        college_id: collegeId,
        title: todo.title,
        description: todo.description,
        due_date: todo.due_date,
        due_date_display: todo.due_date_display,
        priority: todo.priority,
        category: todo.category,
        completed: false,
        completed_at: null,
      }))

      const { data, error } = await supabase.from("college_todos").insert(todosData).select()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      setSelectedTodos({})
      setIsImportingTodos(false)
      refetchTodos()

      toast({
        title: "Tasks imported",
        description: "Selected tasks have been imported successfully.",
      })
    },
  })

  // Validate todo form
  const validateTodoForm = (): boolean => {
    const errors: Record<string, string> = {}

    const titleError = validateRequired(newTodo.title, "Task title")
    if (titleError) errors.title = titleError

    const priorityError = validateRequired(newTodo.priority, "Priority")
    if (priorityError) errors.priority = priorityError

    const categoryError = validateRequired(newTodo.category, "Category")
    if (categoryError) errors.category = categoryError

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const addTodo = async () => {
    if (!validateTodoForm()) return
    addTodoMutation.mutate(newTodo)
  }

  const startEditTodo = (todoId: string) => {
    const todoToEdit = collegeTodos?.find((t) => t.id === todoId)
    if (todoToEdit) {
      setNewTodo({
        title: todoToEdit.title,
        description: todoToEdit.description || "",
        due_date_display: todoToEdit.due_date_display || "",
        priority: todoToEdit.priority,
        category: todoToEdit.category,
        completed: todoToEdit.completed,
      })
      setEditingTodoId(todoId)
      setIsEditingTodo(true)
    }
  }

  const updateTodo = async () => {
    if (!editingTodoId || !validateTodoForm()) return
    updateTodoMutation.mutate({ id: editingTodoId, todo: newTodo })
  }

  const toggleTodoCompletion = async (todoId: string, currentStatus: boolean) => {
    toggleTodoMutation.mutate({ id: todoId, completed: !currentStatus })
  }

  const deleteTodo = async (todoId: string) => {
    deleteTodoMutation.mutate(todoId)
  }

  const importTodos = async () => {
    const selectedTodoIds = Object.entries(selectedTodos)
      .filter(([_, isSelected]) => isSelected)
      .map(([id, _]) => id)

    if (selectedTodoIds.length === 0) {
      toast({
        title: "No tasks selected",
        description: "Please select at least one task to import.",
        variant: "destructive",
      })
      return
    }

    importTodosMutation.mutate(selectedTodoIds)
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-800">High</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
      case "low":
        return <Badge className="bg-green-100 text-green-800">Low</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  // Filter todos based on active filter
  const filteredTodos =
    collegeTodos?.filter((todo) => {
      if (activeFilter === "all") return true
      if (activeFilter === "pending") return !todo.completed
      if (activeFilter === "completed") return todo.completed
      return true
    }) || []

  // Cleanup function for mutations on component unmount
  useEffect(() => {
    return () => {
      addTodoMutation.cleanup()
      updateTodoMutation.cleanup()
      toggleTodoMutation.cleanup()
      deleteTodoMutation.cleanup()
      importTodosMutation.cleanup()
    }
  }, [])

  const isLoading =
    isLoadingTodos ||
    addTodoMutation.isLoading ||
    updateTodoMutation.isLoading ||
    toggleTodoMutation.isLoading ||
    deleteTodoMutation.isLoading ||
    importTodosMutation.isLoading

  if (isLoadingTodos && !collegeTodos) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-semibold">College Application To-Do List</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-1"
            onClick={() => setShowAIAssistant(true)}
          >
            <Sparkles className="h-4 w-4" /> AI Assistance
          </Button>
          <Button variant="outline" className="flex items-center gap-1" onClick={() => setIsImportingTodos(true)}>
            <Copy className="h-4 w-4" /> Import Tasks
          </Button>
          <Button className="flex items-center gap-1" onClick={() => setIsAddingTodo(true)}>
            <PlusCircle className="h-4 w-4" /> Add Task
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Tasks for {collegeName}</CardTitle>
          <CardDescription>Manage your application tasks for this college</CardDescription>
          <div className="flex space-x-2 mt-2">
            <Button
              variant={activeFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter("all")}
            >
              All
            </Button>
            <Button
              variant={activeFilter === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter("pending")}
            >
              Pending
            </Button>
            <Button
              variant={activeFilter === "completed" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter("completed")}
            >
              Completed
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTodos.length === 0 ? (
            <div className="text-center text-muted-foreground py-6 border rounded-md">
              No tasks added yet for {collegeName}
            </div>
          ) : filteredTodos.length === 0 ? (
            <div className="text-center text-muted-foreground py-6 border rounded-md">
              No {activeFilter === "pending" ? "pending" : activeFilter === "completed" ? "completed" : ""} tasks found
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTodos.map((todo) => (
                <div
                  key={todo.id}
                  className={`p-4 border rounded-lg flex items-start justify-between ${
                    todo.completed ? "bg-muted/50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => toggleTodoCompletion(todo.id, todo.completed)}
                      className="mt-1"
                    />
                    <div>
                      <h3 className={`font-medium ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
                        {todo.title}
                      </h3>
                      {todo.description && <p className="text-sm text-muted-foreground mt-1">{todo.description}</p>}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {getPriorityBadge(todo.priority)}
                        <Badge variant="outline">{todo.category}</Badge>
                        {todo.due_date_display && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            {todo.due_date_display}
                          </div>
                        )}
                        {todo.completed && todo.completed_at && (
                          <div className="flex items-center text-xs text-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Completed {new Date(todo.completed_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => startEditTodo(todo.id)} disabled={isLoading}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setConfirmDeleteTodo(todo.id)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Todo Dialog */}
      <Dialog open={isAddingTodo} onOpenChange={setIsAddingTodo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                value={newTodo.title || ""}
                onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
              />
              {formErrors.title && <p className="text-sm text-red-500">{formErrors.title}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Add details about this task..."
                value={newTodo.description || ""}
                onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date (Optional)</Label>
              <Input
                id="dueDate"
                placeholder="e.g., May 15, 2025"
                value={newTodo.due_date_display || ""}
                onChange={(e) => setNewTodo({ ...newTodo, due_date_display: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={newTodo.priority || "medium"}
                  onValueChange={(value) => setNewTodo({ ...newTodo, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.priority && <p className="text-sm text-red-500">{formErrors.priority}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newTodo.category || "Applications"}
                  onValueChange={(value) => setNewTodo({ ...newTodo, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Applications">Applications</SelectItem>
                    <SelectItem value="Essays">Essays</SelectItem>
                    <SelectItem value="Test Prep">Test Prep</SelectItem>
                    <SelectItem value="Extracurriculars">Extracurriculars</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.category && <p className="text-sm text-red-500">{formErrors.category}</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={addTodo} disabled={addTodoMutation.isLoading}>
              {addTodoMutation.isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                "Add Task"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Todo Dialog */}
      <Dialog
        open={isEditingTodo}
        onOpenChange={(open) => {
          if (!open) {
            setIsEditingTodo(false)
            setEditingTodoId(null)
            setFormErrors({})
            setNewTodo({
              title: "",
              description: "",
              due_date_display: "",
              priority: "medium",
              category: "Applications",
              completed: false,
            })
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                value={newTodo.title || ""}
                onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
              />
              {formErrors.title && <p className="text-sm text-red-500">{formErrors.title}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Add details about this task..."
                value={newTodo.description || ""}
                onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date (Optional)</Label>
              <Input
                id="dueDate"
                placeholder="e.g., May 15, 2025"
                value={newTodo.due_date_display || ""}
                onChange={(e) => setNewTodo({ ...newTodo, due_date_display: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={newTodo.priority || "medium"}
                  onValueChange={(value) => setNewTodo({ ...newTodo, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.priority && <p className="text-sm text-red-500">{formErrors.priority}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newTodo.category || "Applications"}
                  onValueChange={(value) => setNewTodo({ ...newTodo, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Applications">Applications</SelectItem>
                    <SelectItem value="Essays">Essays</SelectItem>
                    <SelectItem value="Test Prep">Test Prep</SelectItem>
                    <SelectItem value="Extracurriculars">Extracurriculars</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.category && <p className="text-sm text-red-500">{formErrors.category}</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={updateTodo} disabled={updateTodoMutation.isLoading}>
              {updateTodoMutation.isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Todos Dialog */}
      <Dialog
        open={isImportingTodos}
        onOpenChange={(open) => {
          if (!open) {
            setIsImportingTodos(false)
            setSelectedTodos({})
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Import Tasks</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Select tasks from your general to-do list to import for this college application.
            </p>
            {!generalTodos || generalTodos.length === 0 ? (
              <div className="text-center py-6 border rounded-md">
                <p className="text-muted-foreground">No general tasks found to import.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {generalTodos.map((todo) => (
                  <div key={todo.id} className="flex items-start space-x-3 p-3 border rounded-md">
                    <input
                      type="checkbox"
                      checked={!!selectedTodos[todo.id]}
                      onChange={(e) => setSelectedTodos({ ...selectedTodos, [todo.id]: e.target.checked })}
                      className="h-4 w-4 mt-1 rounded border-gray-300"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{todo.title}</h4>
                      {todo.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{todo.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-1">
                        {getPriorityBadge(todo.priority)}
                        <Badge variant="outline">{todo.category}</Badge>
                        {todo.due_date_display && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            {todo.due_date_display}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsImportingTodos(false)}
              disabled={importTodosMutation.isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={importTodos}
              disabled={importTodosMutation.isLoading || !generalTodos || generalTodos.length === 0}
            >
              {importTodosMutation.isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Importing...
                </>
              ) : (
                "Import Selected"
              )}
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
        onConfirm={() => {
          if (confirmDeleteTodo) {
            deleteTodoMutation.mutate(confirmDeleteTodo)
          }
        }}
        variant="destructive"
      />

      {/* AI Assistant */}
      {showAIAssistant && (
        <AIAssistant
          initialContext={{
            type: "college",
            title: `${collegeName} To-Do List`,
          }}
          onClose={() => setShowAIAssistant(false)}
        />
      )}
    </div>
  )
}
