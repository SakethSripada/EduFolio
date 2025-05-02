"use client"

import { useState, useEffect } from "react"
import { format, addDays, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from "date-fns"
import { useAuth } from "@/components/auth/AuthProvider"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, MapPin, Trash2, Edit, Check, X } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format as formatDate } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

// Define event type
type Event = {
  id: string
  title: string
  description: string | null
  start_date: string
  end_date: string | null
  all_day: boolean
  location: string | null
  color: string | null
}

// Default event colors
const EVENT_COLORS = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#22c55e" },
  { name: "Red", value: "#ef4444" },
  { name: "Purple", value: "#a855f7" },
  { name: "Orange", value: "#f97316" },
  { name: "Teal", value: "#14b8a6" },
]

export default function CalendarView() {
  const { user } = useAuth()
  const supabase = createClientComponentClient()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: "",
    description: "",
    start_date: new Date().toISOString(),
    end_date: new Date().toISOString(),
    all_day: false,
    location: "",
    color: EVENT_COLORS[0].value,
  })
  const [isAddEventOpen, setIsAddEventOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isDeleteEventDialogOpen, setIsDeleteEventDialogOpen] = useState(false)
  const [isEditEventOpen, setIsEditEventOpen] = useState(false)
  const { toast } = useToast()

  // Get days for the current month view
  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  })

  // Fetch events from database
  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from("planner_events")
          .select("*")
          .eq("user_id", user.id)
        
        if (error) throw error
        setEvents(data || [])
      } catch (error) {
        console.error("Error fetching events:", error)
        toast({
          title: "Error fetching events",
          description: "Could not load your events. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [user, supabase, toast])

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const eventStart = parseISO(event.start_date)
      const eventEnd = event.end_date ? parseISO(event.end_date) : eventStart
      
      // Check if the day falls within the event's time range
      const dateToCheck = new Date(day)
      dateToCheck.setHours(0, 0, 0, 0)
      
      const startDate = new Date(eventStart)
      startDate.setHours(0, 0, 0, 0)
      
      const endDate = new Date(eventEnd)
      endDate.setHours(0, 0, 0, 0)
      
      return (dateToCheck >= startDate && dateToCheck <= endDate)
    })
  }

  // Handle adding a new event
  const handleAddEvent = async () => {
    if (!user) return
    if (!newEvent.title) {
      toast({
        title: "Title is required",
        description: "Please enter a title for your event.",
        variant: "destructive",
      })
      return
    }

    try {
      const { data, error } = await supabase
        .from("planner_events")
        .insert([
          {
            user_id: user.id,
            title: newEvent.title,
            description: newEvent.description || null,
            start_date: newEvent.start_date,
            end_date: newEvent.end_date || null,
            all_day: newEvent.all_day || false,
            location: newEvent.location || null,
            color: newEvent.color || EVENT_COLORS[0].value,
          },
        ])
        .select()

      if (error) throw error

      // Add the new event to the local state
      if (data) {
        setEvents([...events, data[0]])
        setIsAddEventOpen(false)
        setNewEvent({
          title: "",
          description: "",
          start_date: new Date().toISOString(),
          end_date: new Date().toISOString(),
          all_day: false,
          location: "",
          color: EVENT_COLORS[0].value,
        })
        toast({
          title: "Event added",
          description: "Your event has been added successfully.",
        })
      }
    } catch (error) {
      console.error("Error adding event:", error)
      toast({
        title: "Error adding event",
        description: "Could not add your event. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle deleting an event
  const handleDeleteEvent = async () => {
    if (!selectedEvent) return

    try {
      const { error } = await supabase
        .from("planner_events")
        .delete()
        .eq("id", selectedEvent.id)

      if (error) throw error

      // Remove the event from local state
      setEvents(events.filter(e => e.id !== selectedEvent.id))
      setIsDeleteEventDialogOpen(false)
      setSelectedEvent(null)
      toast({
        title: "Event deleted",
        description: "Your event has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting event:", error)
      toast({
        title: "Error deleting event",
        description: "Could not delete your event. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle updating an event
  const handleUpdateEvent = async () => {
    if (!selectedEvent) return
    if (!selectedEvent.title) {
      toast({
        title: "Title is required",
        description: "Please enter a title for your event.",
        variant: "destructive",
      })
      return
    }

    try {
      const { data, error } = await supabase
        .from("planner_events")
        .update({
          title: selectedEvent.title,
          description: selectedEvent.description,
          start_date: selectedEvent.start_date,
          end_date: selectedEvent.end_date,
          all_day: selectedEvent.all_day,
          location: selectedEvent.location,
          color: selectedEvent.color,
        })
        .eq("id", selectedEvent.id)
        .select()

      if (error) throw error

      // Update the event in local state
      setEvents(events.map(e => (e.id === selectedEvent.id ? selectedEvent : e)))
      setIsEditEventOpen(false)
      toast({
        title: "Event updated",
        description: "Your event has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating event:", error)
      toast({
        title: "Error updating event",
        description: "Could not update your event. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Navigate to previous month
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  
  // Navigate to next month
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  
  // Navigate to today
  const goToToday = () => setCurrentDate(new Date())

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-8 w-36" />
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {Array(7).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-8" />
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array(35).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-bold">{format(currentDate, "MMMM yyyy")}</h2>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={prevMonth} 
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous month</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
                className="h-8"
              >
                Today
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={nextMonth} 
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next month</span>
              </Button>
              <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="ml-4">
                    <Plus className="h-4 w-4 mr-2" /> Add Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>Add New Event</DialogTitle>
                    <DialogDescription>
                      Create a new event on your calendar.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={newEvent.title || ""}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        placeholder="Event title"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Textarea
                        id="description"
                        value={newEvent.description || ""}
                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                        placeholder="Event description"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {newEvent.start_date
                                ? format(new Date(newEvent.start_date), "PPP")
                                : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={newEvent.start_date ? new Date(newEvent.start_date) : undefined}
                              onSelect={(date) => {
                                if (date) {
                                  setNewEvent({ ...newEvent, start_date: date.toISOString() })
                                }
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {newEvent.end_date
                                ? format(new Date(newEvent.end_date), "PPP")
                                : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={newEvent.end_date ? new Date(newEvent.end_date) : undefined}
                              onSelect={(date) => {
                                if (date) {
                                  setNewEvent({ ...newEvent, end_date: date.toISOString() })
                                }
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="location">Location (Optional)</Label>
                        <Input
                          id="location"
                          value={newEvent.location || ""}
                          onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                          placeholder="Event location"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Color</Label>
                        <div className="flex space-x-2">
                          {EVENT_COLORS.map((color) => (
                            <button
                              key={color.value}
                              type="button"
                              className={cn(
                                "w-6 h-6 rounded-full border-2",
                                newEvent.color === color.value
                                  ? "border-black dark:border-white"
                                  : "border-transparent"
                              )}
                              style={{ backgroundColor: color.value }}
                              onClick={() => setNewEvent({ ...newEvent, color: color.value })}
                              aria-label={`Select ${color.name} color`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="all-day"
                        checked={newEvent.all_day || false}
                        onCheckedChange={(checked) => 
                          setNewEvent({ ...newEvent, all_day: Boolean(checked) })
                        }
                      />
                      <Label htmlFor="all-day">All day event</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddEventOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="button" onClick={handleAddEvent}>
                      Add Event
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-sm font-medium text-muted-foreground">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day) => {
              const dayEvents = getEventsForDay(day)
              return (
                <div
                  key={day.toString()}
                  className={cn(
                    "min-h-32 p-2 border rounded-lg",
                    !isSameMonth(day, currentDate) && "opacity-50 bg-muted",
                    isSameDay(day, new Date()) && "border-blue-500 dark:border-blue-400"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isSameDay(day, new Date()) && 
                          "bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedDate(day)
                        setNewEvent({
                          ...newEvent, 
                          start_date: day.toISOString(),
                          end_date: day.toISOString()
                        })
                        setIsAddEventOpen(true)
                      }}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary h-5 w-5 flex items-center justify-center"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <ScrollArea className="h-24">
                    <div className="space-y-1">
                      {dayEvents.map((event) => (
                        <button
                          key={event.id}
                          className="w-full text-left p-1 px-2 rounded-sm text-xs"
                          style={{ backgroundColor: event.color || EVENT_COLORS[0].value }}
                          onClick={() => {
                            setSelectedEvent(event)
                            setIsEditEventOpen(true)
                          }}
                        >
                          <div className="font-medium text-white truncate">
                            {event.title}
                          </div>
                          {event.location && (
                            <div className="flex items-center text-white/80 text-[0.65rem]">
                              <MapPin className="h-2 w-2 mr-1" /> 
                              <span className="truncate">{event.location}</span>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Edit Event Dialog */}
      <Dialog open={isEditEventOpen} onOpenChange={setIsEditEventOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>
              Make changes to your event.
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={selectedEvent.title || ""}
                  onChange={(e) => setSelectedEvent({ ...selectedEvent, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description (Optional)</Label>
                <Textarea
                  id="edit-description"
                  value={selectedEvent.description || ""}
                  onChange={(e) => setSelectedEvent({ ...selectedEvent, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedEvent.start_date
                          ? format(new Date(selectedEvent.start_date), "PPP")
                          : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={
                          selectedEvent.start_date
                            ? new Date(selectedEvent.start_date)
                            : undefined
                        }
                        onSelect={(date) => {
                          if (date) {
                            setSelectedEvent({
                              ...selectedEvent,
                              start_date: date.toISOString(),
                            })
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedEvent.end_date
                          ? format(new Date(selectedEvent.end_date), "PPP")
                          : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={
                          selectedEvent.end_date
                            ? new Date(selectedEvent.end_date)
                            : undefined
                        }
                        onSelect={(date) => {
                          if (date) {
                            setSelectedEvent({
                              ...selectedEvent,
                              end_date: date.toISOString(),
                            })
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-location">Location (Optional)</Label>
                  <Input
                    id="edit-location"
                    value={selectedEvent.location || ""}
                    onChange={(e) => setSelectedEvent({ ...selectedEvent, location: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex space-x-2">
                    {EVENT_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        className={cn(
                          "w-6 h-6 rounded-full border-2",
                          selectedEvent.color === color.value
                            ? "border-black dark:border-white"
                            : "border-transparent"
                        )}
                        style={{ backgroundColor: color.value }}
                        onClick={() => setSelectedEvent({ ...selectedEvent, color: color.value })}
                        aria-label={`Select ${color.name} color`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-all-day"
                  checked={selectedEvent.all_day || false}
                  onCheckedChange={(checked) =>
                    setSelectedEvent({ ...selectedEvent, all_day: Boolean(checked) })
                  }
                />
                <Label htmlFor="edit-all-day">All day event</Label>
              </div>
            </div>
          )}
          <DialogFooter className="flex justify-between">
            <Button
              variant="destructive"
              onClick={() => {
                setIsEditEventOpen(false)
                setIsDeleteEventDialogOpen(true)
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </Button>
            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsEditEventOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleUpdateEvent}>
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteEventDialogOpen} onOpenChange={setIsDeleteEventDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-start">
            <Button type="button" variant="destructive" onClick={handleDeleteEvent}>
              Delete
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteEventDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 