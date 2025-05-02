"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/AuthProvider"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, MoreHorizontal, Trash2, Pencil, Check, X, MoveHorizontal } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

// Types
type Board = {
  id: string
  title: string
  description: string | null
  color: string | null
  is_favorite: boolean
}

type Column = {
  id: string
  board_id: string
  title: string
  description: string | null
  color: string | null
  position: number
}

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
}

export default function KanbanBoard() {
  const { user } = useAuth()
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [boards, setBoards] = useState<Board[]>([])
  const [columns, setColumns] = useState<Column[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null)
  const [isAddBoardOpen, setIsAddBoardOpen] = useState(false)
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false)
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [newBoard, setNewBoard] = useState<Partial<Board>>({
    title: "",
    description: "",
    color: "#3b82f6",
    is_favorite: false,
  })
  const [newColumn, setNewColumn] = useState<Partial<Column>>({
    title: "",
    description: "",
    position: 0,
  })
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    description: "",
    priority: "medium",
    status: "todo",
    position: 0,
  })
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null)

  // Fetch boards
  useEffect(() => {
    const fetchBoards = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from("planner_boards")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
        
        if (error) throw error
        setBoards(data || [])
        
        // Select the first board by default if available
        if (data && data.length > 0 && !selectedBoard) {
          setSelectedBoard(data[0])
        }
      } catch (error) {
        console.error("Error fetching boards:", error)
        toast({
          title: "Error fetching boards",
          description: "Could not load your boards. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchBoards()
  }, [user, supabase, toast, selectedBoard])

  // Fetch columns and tasks for selected board
  useEffect(() => {
    const fetchColumnsAndTasks = async () => {
      if (!user || !selectedBoard) return

      setIsLoading(true)
      try {
        // Fetch columns
        const { data: columnsData, error: columnsError } = await supabase
          .from("planner_columns")
          .select("*")
          .eq("board_id", selectedBoard.id)
          .order("position", { ascending: true })
        
        if (columnsError) throw columnsError
        setColumns(columnsData || [])

        // Fetch tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from("planner_tasks")
          .select("*")
          .eq("board_id", selectedBoard.id)
          .order("position", { ascending: true })
        
        if (tasksError) throw tasksError
        setTasks(tasksData || [])
      } catch (error) {
        console.error("Error fetching columns and tasks:", error)
        toast({
          title: "Error fetching board data",
          description: "Could not load columns and tasks. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchColumnsAndTasks()
  }, [user, supabase, toast, selectedBoard])

  // Add a new board
  const handleAddBoard = async () => {
    if (!user) return
    if (!newBoard.title) {
      toast({
        title: "Title is required",
        description: "Please enter a title for your board.",
        variant: "destructive",
      })
      return
    }

    try {
      const { data, error } = await supabase
        .from("planner_boards")
        .insert([
          {
            user_id: user.id,
            title: newBoard.title,
            description: newBoard.description || null,
            color: newBoard.color || null,
            is_favorite: newBoard.is_favorite || false,
          },
        ])
        .select()

      if (error) throw error

      // Add the new board to state and select it
      if (data && data.length > 0) {
        setBoards([...boards, data[0]])
        setSelectedBoard(data[0])
        setIsAddBoardOpen(false)
        setNewBoard({
          title: "",
          description: "",
          color: "#3b82f6",
          is_favorite: false,
        })
        toast({
          title: "Board created",
          description: "Your new board has been created successfully.",
        })
      }
    } catch (error) {
      console.error("Error adding board:", error)
      toast({
        title: "Error creating board",
        description: "Could not create your board. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Add a new column
  const handleAddColumn = async () => {
    if (!user || !selectedBoard) return
    if (!newColumn.title) {
      toast({
        title: "Title is required",
        description: "Please enter a title for your column.",
        variant: "destructive",
      })
      return
    }

    try {
      // Get the highest position value for the current columns
      const highestPosition = columns.length > 0
        ? Math.max(...columns.map(col => col.position)) + 1
        : 0

      const { data, error } = await supabase
        .from("planner_columns")
        .insert([
          {
            board_id: selectedBoard.id,
            title: newColumn.title,
            description: newColumn.description || null,
            position: highestPosition,
          },
        ])
        .select()

      if (error) throw error

      if (data && data.length > 0) {
        setColumns([...columns, data[0]])
        setIsAddColumnOpen(false)
        setNewColumn({
          title: "",
          description: "",
          position: 0,
        })
        toast({
          title: "Column added",
          description: "Your new column has been added successfully.",
        })
      }
    } catch (error) {
      console.error("Error adding column:", error)
      toast({
        title: "Error adding column",
        description: "Could not add your column. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Add a new task
  const handleAddTask = async () => {
    if (!user || !selectedBoard || !selectedColumnId) return
    if (!newTask.title) {
      toast({
        title: "Title is required",
        description: "Please enter a title for your task.",
        variant: "destructive",
      })
      return
    }

    try {
      // Get tasks in the current column to find the highest position
      const columnTasks = tasks.filter(task => task.column_id === selectedColumnId)
      const highestPosition = columnTasks.length > 0
        ? Math.max(...columnTasks.map(task => task.position)) + 1
        : 0

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
            board_id: selectedBoard.id,
            column_id: selectedColumnId,
            position: highestPosition,
            labels: newTask.labels || null,
            color: newTask.color || null,
          },
        ])
        .select()

      if (error) throw error

      if (data && data.length > 0) {
        setTasks([...tasks, data[0]])
        setIsAddTaskOpen(false)
        setNewTask({
          title: "",
          description: "",
          priority: "medium",
          status: "todo",
          position: 0,
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

  if (isLoading && !selectedBoard) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 overflow-x-auto pb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-72 shrink-0">
                <Skeleton className="h-8 w-full mb-4" />
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((j) => (
                    <Skeleton key={j} className="h-24 w-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Get tasks for a specific column
  const getTasksForColumn = (columnId: string) => {
    return tasks
      .filter(task => task.column_id === columnId)
      .sort((a, b) => a.position - b.position)
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div>
            <select 
              className="border rounded-md p-2"
              value={selectedBoard?.id || ""}
              onChange={(e) => {
                const board = boards.find(b => b.id === e.target.value)
                setSelectedBoard(board || null)
              }}
            >
              {boards.map(board => (
                <option key={board.id} value={board.id}>
                  {board.title}
                </option>
              ))}
            </select>
          </div>
          {selectedBoard && (
            <p className="text-muted-foreground text-sm">
              {selectedBoard.description}
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          <Dialog open={isAddBoardOpen} onOpenChange={setIsAddBoardOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" /> New Board
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a new board</DialogTitle>
                <DialogDescription>
                  Boards help you organize your tasks and projects.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="board-title">Title</Label>
                  <Input
                    id="board-title"
                    value={newBoard.title || ""}
                    onChange={(e) => setNewBoard({ ...newBoard, title: e.target.value })}
                    placeholder="Enter board title"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="board-description">Description (Optional)</Label>
                  <Textarea
                    id="board-description"
                    value={newBoard.description || ""}
                    onChange={(e) => setNewBoard({ ...newBoard, description: e.target.value })}
                    placeholder="Enter board description"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddBoard}>Create Board</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {selectedBoard && (
            <Dialog open={isAddColumnOpen} onOpenChange={setIsAddColumnOpen}>
              <DialogTrigger asChild>
                <Button variant="default" size="sm">
                  <Plus className="h-4 w-4 mr-2" /> Add Column
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add a new column</DialogTitle>
                  <DialogDescription>
                    Columns represent stages in your workflow.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="column-title">Title</Label>
                    <Input
                      id="column-title"
                      value={newColumn.title || ""}
                      onChange={(e) => setNewColumn({ ...newColumn, title: e.target.value })}
                      placeholder="Enter column title"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="column-description">Description (Optional)</Label>
                    <Textarea
                      id="column-description"
                      value={newColumn.description || ""}
                      onChange={(e) => setNewColumn({ ...newColumn, description: e.target.value })}
                      placeholder="Enter column description"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddColumn}>Add Column</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      
      {selectedBoard ? (
        <div className="flex space-x-4 overflow-x-auto pb-6">
          {columns.length === 0 ? (
            <div className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg">
              <p className="text-center text-muted-foreground mb-4">
                This board doesn't have any columns yet. Add a column to get started.
              </p>
              <Button onClick={() => setIsAddColumnOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add Column
              </Button>
            </div>
          ) : (
            columns.map((column) => (
              <div key={column.id} className="w-72 shrink-0">
                <div className="bg-muted p-3 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm">{column.title}</h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit Column</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500">Delete Column</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="text-xs text-muted-foreground">{column.description}</p>
                </div>
                
                <div className="border-l border-r rounded-b-lg bg-background shadow-sm">
                  <ScrollArea className="h-[calc(100vh-250px)]">
                    <div className="p-2 space-y-2">
                      {getTasksForColumn(column.id).map((task) => (
                        <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardHeader className="p-3 pb-0">
                            <CardTitle className="text-sm">{task.title}</CardTitle>
                          </CardHeader>
                          <CardContent className="p-3 pt-1 pb-1">
                            {task.description && (
                              <CardDescription className="text-xs line-clamp-2">
                                {task.description}
                              </CardDescription>
                            )}
                          </CardContent>
                          <CardFooter className="p-3 pt-0 flex justify-between items-center">
                            {task.priority && renderPriorityBadge(task.priority)}
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-muted-foreground hover:text-primary text-sm"
                        onClick={() => {
                          setSelectedColumnId(column.id)
                          setIsAddTaskOpen(true)
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Task
                      </Button>
                    </div>
                  </ScrollArea>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg">
          <p className="text-center text-muted-foreground mb-4">
            You don't have any boards yet. Create your first board to get started.
          </p>
          <Button onClick={() => setIsAddBoardOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Create Board
          </Button>
        </div>
      )}
      
      {/* Add Task Dialog */}
      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a new task</DialogTitle>
            <DialogDescription>
              Add a task to your board.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="task-title">Title</Label>
              <Input
                id="task-title"
                value={newTask.title || ""}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Enter task title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="task-description">Description (Optional)</Label>
              <Textarea
                id="task-description"
                value={newTask.description || ""}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Enter task description"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="task-priority">Priority</Label>
              <select
                id="task-priority"
                className="border rounded-md p-2"
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTaskOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTask}>Add Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 