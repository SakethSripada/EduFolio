"use client"

/**
 * AIAssistant Component
 * 
 * Note: This component must be defined with arrow function syntax to avoid React Hook errors.
 * Using function declaration syntax would cause "Invalid hook call" errors because
 * hooks must be called from React function components or custom hooks.
 */

import React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { MessageCircle, X, Send, Sparkles, Pencil, Plus, Maximize2, Minimize2, Paperclip, Mic, Bot, User } from 'lucide-react'
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth/AuthProvider"
import { supabase } from "@/lib/supabase"
import ReactMarkdown from "react-markdown"

// For client-side usage of API key
const API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';

// Configure OpenAI
const openaiConfig = {
  apiKey: API_KEY,
};

type Message = {
id: string
role: "user" | "assistant" | "system"
content: string
timestamp: Date
status?: "sending" | "sent" | "error"
context?: {
  type?: "essay" | "extracurricular" | "award" | "academics" | "college"
  id?: string
  title?: string
}
}

type AIAssistantProps = {
initialContext?: {
  type?: "essay" | "extracurricular" | "award" | "academics" | "college"
  id?: string
  title?: string
}
initialPrompt?: string
onClose?: () => void
showOnLoad?: boolean
}

const MessageComponent = React.memo(({ message }: { message: Message }) => (
<div
  className={cn(
    "flex gap-3 max-w-[90%]",
    message.role === "user" ? "ml-auto flex-row-reverse items-end" : "mr-auto",
  )}
>
  <Avatar className="h-8 w-8 mt-1 bg-muted flex-shrink-0">
    {message.role === "user" ? (
      <User className="h-4 w-4" />
    ) : (
      <Bot className="h-4 w-4 text-primary-foreground" />
    )}
  </Avatar>
  <div
    className={cn(
      "rounded-lg p-3",
      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
    )}
  >
    <div className="text-sm whitespace-pre-wrap">
      <ReactMarkdown>{message.content}</ReactMarkdown>
    </div>
    {message.context && (
      <Badge variant="outline" className="mt-2 text-xs">
        {message.context.type}: {message.context.title}
      </Badge>
    )}
  </div>
</div>
))

const AIAssistant = ({ initialContext, initialPrompt, onClose, showOnLoad = false }: AIAssistantProps) => {
const [isOpen, setIsOpen] = useState(showOnLoad)
const [isExpanded, setIsExpanded] = useState(false)
const [activeTab, setActiveTab] = useState<string>("chat")
const [input, setInput] = useState(initialPrompt || "")
const [isTyping, setIsTyping] = useState(false)
const messagesEndRef = useRef<HTMLDivElement>(null)
const inputRef = useRef<HTMLInputElement>(null)
const { toast } = useToast()
const { user } = useAuth()
const [profileData, setProfileData] = useState<any>(null)

// Start with empty messages, no default welcome message
const [messages, setMessages] = useState<Message[]>([])

// Counter to ensure unique IDs even when Date.now() is the same
const [idCounter, setIdCounter] = useState(0);

// Function to generate unique IDs
const generateUniqueId = () => {
  // Use Date.now() combined with a random number and the counter for true uniqueness
  const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${idCounter}`;
  setIdCounter(idCounter + 1);
  return uniqueId;
};

// Fetch user profile data
useEffect(() => {
  const fetchProfileData = async () => {
    if (!user) return

    try {
      // Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (profileError) {
        console.error("Error fetching profile:", profileError)
        toast({
          title: "Error fetching profile",
          description: "Failed to load your profile information.",
          variant: "destructive",
        })
        return
      }

      // Fetch all user data from relevant tables
      const [
        courses, 
        academics, 
        testScores, 
        extracurricularActivities,
        extracurriculars, 
        awards, 
        essays, 
        manualGpa,
        projects,
        todos
      ] = await Promise.all([
        // Try both courses and academics tables
        supabase.from("courses").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("academics").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("test_scores").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        // Try both extracurricular tables
        supabase.from("extracurricular_activities").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("extracurriculars").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("awards").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("essays").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("manual_gpa").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("projects").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("todos").select("*").eq("user_id", user.id).order("due_date", { ascending: true }),
      ])

      // Check for errors but continue with partial data if some tables fail
      const fetchErrors = [
        courses.error, academics.error, testScores.error, 
        extracurricularActivities.error, extracurriculars.error, 
        awards.error, essays.error, manualGpa.error,
        projects.error, todos.error
      ].filter(Boolean);

      if (fetchErrors.length > 0) {
        console.error("Error fetching user data:", fetchErrors)
        toast({
          title: "Partial data loaded",
          description: "Some of your profile information couldn't be loaded.",
          variant: "destructive",
        })
      }

      // Fetch college-specific data
      const userCollegesResult = await supabase.from("user_colleges")
        .select(`
          *,
          college:colleges(*)
        `)
        .eq("user_id", user.id);
      
      // Prepare to collect college-specific data
      const collegeData = [];
      
      // If user has colleges, fetch specific data for each
      if (!userCollegesResult.error && userCollegesResult.data?.length > 0) {
        for (const userCollege of userCollegesResult.data) {
          try {
            // For each college, fetch all college-specific data
            const [collegeEssays, collegeAcademics, collegeExtracurriculars, collegeAwards, collegeTodos] = await Promise.all([
              supabase.from("college_essays").select("*").eq("college_id", userCollege.college_id).eq("user_id", user.id),
              supabase.from("college_academics").select("*").eq("college_id", userCollege.college_id).eq("user_id", user.id),
              supabase.from("college_extracurriculars").select("*").eq("college_id", userCollege.college_id).eq("user_id", user.id),
              supabase.from("college_awards").select("*").eq("college_id", userCollege.college_id).eq("user_id", user.id),
              supabase.from("college_todos").select("*").eq("college_id", userCollege.college_id).eq("user_id", user.id),
            ]);
            
            // Add college with its related data
            collegeData.push({
              user_college: userCollege,
              college: userCollege.college,
              essays: collegeEssays.data || [],
              academics: collegeAcademics.data || [],
              extracurriculars: collegeExtracurriculars.data || [],
              awards: collegeAwards.data || [],
              todos: collegeTodos.data || [],
            });
          } catch (collegeError) {
            console.error("Error fetching college-specific data:", collegeError);
            // Continue with next college
          }
        }
      }

      // Build a comprehensive profile data object
      const comprehensiveProfileData = {
        profile: profile,
        // Use courses if available, fall back to academics
        courses: courses.data?.length ? courses.data : academics.data || [],
        academics: academics.data || [],
        test_scores: testScores.data || [],
        // Use extracurricularActivities if available, fall back to extracurriculars
        extracurricular_activities: extracurricularActivities.data?.length 
          ? extracurricularActivities.data 
          : extracurriculars.data || [],
        extracurriculars: extracurriculars.data || [],
        awards: awards.data || [],
        essays: essays.data || [],
        manual_gpa: manualGpa.data || null,
        projects: projects.data || [],
        todos: todos.data || [],
        colleges: collegeData,
      }

      setProfileData(comprehensiveProfileData)
    } catch (error) {
      console.error("Error fetching profile data:", error)
      toast({
        title: "Error fetching profile data",
        description: "Failed to load your profile information.",
        variant: "destructive",
      })
    }
  }

  fetchProfileData()
}, [user, toast])

// If initialContext is provided, add a contextual message ONLY if there's no initialPrompt
useEffect(() => {
  // Skip adding context message if we have an initialPrompt - avoid duplicates
  if (initialPrompt) return;
  
  // Only add contextual message once and only if it doesn't already exist
  if (initialContext && messages.length === 0) {
    let contextMessage = ""

    switch (initialContext.type) {
      case "essay":
        contextMessage = `How can I help with your essay "${initialContext.title}"?`
        break
      case "extracurricular":
        contextMessage = `How can I help with your "${initialContext.title}" activity?`
        break
      case "award":
        contextMessage = `How can I help with your "${initialContext.title}" award?`
        break
      case "academics":
        contextMessage = `How can I help with your academics?`
        break
      case "college":
        contextMessage = `How can I help with your application to ${initialContext.title || "college"}?`
        break
      default:
        contextMessage = "How can I help with your college application today?"
    }

    setMessages([
      {
        id: generateUniqueId(),
        role: "assistant",
        content: contextMessage,
        timestamp: new Date(),
        context: initialContext,
      },
    ])
  }
}, [initialContext, initialPrompt])

// Use useCallback for handleSendMessage to prevent unnecessary re-renders
const handleSendMessage = useCallback(async () => {
  if (!input.trim()) return

  const userMessage: Message = {
    id: generateUniqueId(),
    role: "user",
    content: input,
    timestamp: new Date(),
    status: "sending",
  }

  // Add user message to the conversation
  setMessages((prev) => [...prev, userMessage])
  setInput("")
  setIsTyping(true)

  try {
    // Determine if this is a specific task based on the input
    const isSpecificTask = 
      input.includes("feedback on this essay") || 
      input.includes("grammar") || 
      input.includes("rephrase") ||
      input.includes("check this essay");
    
    // Format messages for the API
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    // Add the current user message
    formattedMessages.push({
      role: "user",
      content: input
    });
    
    // Append profile data as structured system message if available
    if (profileData) {
      // Create a more structured representation of the profile data
      const structuredProfileData = {
        user_info: profileData.profile || {},
        academics: {
          courses: profileData.courses || [],
          gpa: profileData.manual_gpa || null,
          test_scores: profileData.test_scores || []
        },
        activities: profileData.extracurricular_activities || profileData.extracurriculars || [],
        awards: profileData.awards || [],
        essays: profileData.essays || [],
        colleges: profileData.colleges || [],
        todos: profileData.todos || [],
        projects: profileData.projects || []
      };

      // Create a formatted context message
      let profileContext = "USER PROFILE INFORMATION\n\n";
      
      // Basic user info
      if (profileData.profile) {
        profileContext += `Name: ${profileData.profile.full_name || 'Not provided'}\n`;
        profileContext += `School: ${profileData.profile.school || 'Not provided'}\n`;
        profileContext += `Graduation Year: ${profileData.profile.grad_year || 'Not provided'}\n`;
        profileContext += `Interests: ${profileData.profile.interests || 'Not provided'}\n\n`;
      }
      
      // Add GPA information
      if (profileData.manual_gpa) {
        profileContext += `GPA: Unweighted ${profileData.manual_gpa.unweighted || 'N/A'}, Weighted ${profileData.manual_gpa.weighted || 'N/A'}\n\n`;
      }
      
      // Add test score summary
      if (profileData.test_scores?.length) {
        profileContext += `Test Scores: ${profileData.test_scores.length} scores recorded\n`;
        profileData.test_scores.forEach((score: any) => {
          profileContext += `- ${score.test_name}: ${score.score}${score.max_score ? `/${score.max_score}` : ''} ${score.test_date_display ? `(${score.test_date_display})` : ''}\n`;
        });
        profileContext += "\n";
      }
      
      // Add activity summary
      const activities = profileData.extracurricular_activities?.length ? 
        profileData.extracurricular_activities : profileData.extracurriculars || [];
      
      if (activities.length) {
        profileContext += `Activities: ${activities.length} activities recorded\n`;
        activities.slice(0, 5).forEach((activity: any, i: number) => { // Show top 5 activities
          profileContext += `- ${activity.position || activity.role || 'Member'} at ${activity.organization}, ${activity.hours_per_week || '?'} hrs/week\n`;
        });
        if (activities.length > 5) {
          profileContext += `- ... and ${activities.length - 5} more activities\n`;
        }
        profileContext += "\n";
      }
      
      // Add essay summary
      if (profileData.essays?.length) {
        profileContext += `Essays: ${profileData.essays.length} essays in progress\n`;
        profileContext += "\n";
      }
      
      // Add college applications summary
      if (profileData.colleges?.length) {
        profileContext += `College Applications: ${profileData.colleges.length} colleges\n`;
        profileData.colleges.forEach((college: any) => {
          profileContext += `- ${college.college?.name || 'Unnamed College'}\n`;
        });
        profileContext += "\n";
      }
      
      // Send both the structured data and the formatted summary
      formattedMessages.push({
        role: "system",
        content: profileContext + "\nFull profile data in JSON format:\n" + JSON.stringify(structuredProfileData)
      });
    }

    // Call our secure API route with conversation history
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        messages: formattedMessages,
        max_tokens: isSpecificTask ? 700 : 500, // Allow more tokens for specific tasks
        temperature: isSpecificTask ? 0.5 : 0.7 // Lower temperature for more focused responses on specific tasks
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    const text = data.text;

    const assistantMessage: Message = {
      id: generateUniqueId(),
      role: "assistant",
      content: text,
      timestamp: new Date(),
    }

    setMessages((prevMessages) => [...prevMessages, assistantMessage])
  } catch (error: any) {
    console.error("Error generating text:", error)
    toast({
      title: "Error generating response",
      description: "There was a problem generating a response from the AI.",
      variant: "destructive",
    })
  } finally {
    setIsTyping(false)
  }
}, [input, toast, profileData, messages, idCounter, generateUniqueId])

// Update isOpen when showOnLoad or initialPrompt changes
useEffect(() => {
  // If showOnLoad is true, or we have an initialPrompt that explicitly requires showing (from EssaysTab for example)
  const shouldOpen = showOnLoad || (initialPrompt !== undefined && initialPrompt.includes("feedback on this essay"));
  if (shouldOpen) {
    setIsOpen(true);
  }
}, [showOnLoad, initialPrompt]);

// If initialPrompt is provided, send message automatically only if assistant is open
useEffect(() => {
  // Only auto-send if the assistant is already open (or just got opened) and we have a prompt
  if (initialPrompt && input === initialPrompt && isOpen) {
    // Add small delay to ensure component is fully mounted
    const timer = setTimeout(() => {
      handleSendMessage();
    }, 300);
    
    return () => clearTimeout(timer);
  }
}, [initialPrompt, input, handleSendMessage, isOpen, messages]);

// Use useCallback for handleKeyDown to prevent unnecessary re-renders
const handleKeyDown = useCallback(
  (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  },
  [handleSendMessage],
)

// Use useCallback for toggleExpand to prevent unnecessary re-renders
const toggleExpand = useCallback(() => {
  setIsExpanded(!isExpanded)
}, [isExpanded])

// Use useCallback for closeChat to prevent unnecessary re-renders
const closeChat = useCallback(() => {
  setIsOpen(false)
  if (onClose) {
    onClose()
  }
}, [onClose])

useEffect(() => {
  // Scroll to bottom when messages change
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
}, [messages])

// Focus input when chat opens
useEffect(() => {
  if (isOpen && inputRef.current) {
    inputRef.current.focus()
  }
}, [isOpen])

const suggestions = [
  "Help me brainstorm essay ideas for my Common App personal statement",
  "Review my extracurricular activities and suggest improvements",
  "What colleges would be a good match for my profile?",
  "How can I improve my chances at Ivy League schools?",
  "Help me calculate my UC GPA",
]

return (
  <>
    {/* Floating Chat Button */}
    {!isOpen && (
      <Button
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 p-0 shadow-lg z-50 bg-primary hover:bg-primary/90"
        onClick={() => setIsOpen(true)}
      >
        <Sparkles className="h-6 w-6" />
      </Button>
    )}

    {/* Chat Panel */}
    {isOpen && (
      <div
        className={cn(
          "fixed z-50 bg-card border rounded-lg shadow-lg transition-all duration-300 overflow-hidden flex flex-col",
          isExpanded
            ? "inset-2 sm:inset-4 md:inset-10 lg:inset-20"
            : "bottom-6 right-6 w-[90vw] sm:w-[380px] h-[80vh] max-h-[600px]",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b bg-muted/50">
          <div className="flex items-center gap-2">
            {/* Temporarily using div instead of Avatar */}
            <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">EduFolio AI Assistant</h2>
              <p className="text-xs text-muted-foreground">Powered by advanced AI</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={toggleExpand} className="h-8 w-8">
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={closeChat} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 overflow-hidden">
          <TabsList className="px-3 pt-2 justify-start bg-transparent border-b rounded-none flex-shrink-0">
            <TabsTrigger
              value="chat"
              className="rounded-t-md rounded-b-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              Chat
            </TabsTrigger>
            <TabsTrigger
              value="suggestions"
              className="rounded-t-md rounded-b-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              Suggestions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 flex flex-col p-0 m-0 data-[state=inactive]:hidden overflow-hidden">
            {/* Messages */}
            <ScrollArea className="flex-1 h-[calc(100%-80px)]">
              <div className="p-4 space-y-4">
                {messages.map((message) => (
                  <MessageComponent key={message.id} message={message} />
                ))}
                {isTyping && (
                  <div className="flex gap-3 max-w-[90%]">
                    {/* Temporarily using div instead of Avatar */}
                    <div className="h-8 w-8 mt-1 bg-primary rounded-full flex-shrink-0 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="rounded-lg p-3 bg-muted">
                      <div className="flex items-center gap-1">
                        <div
                          className="h-2 w-2 rounded-full bg-primary animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="h-2 w-2 rounded-full bg-primary animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></div>
                        <div
                          className="h-2 w-2 rounded-full bg-primary animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-3 border-t">
              <div className="flex items-center gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about your application..."
                  className="flex-1"
                />
                <Button size="icon" onClick={handleSendMessage} disabled={!input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Paperclip className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Mic className="h-3 w-3" />
                  </Button>
                </div>
                <div className="hidden sm:block">
                  Press <kbd className="px-1 py-0.5 bg-muted-foreground/20 rounded text-[10px]">Enter</kbd> to send
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="suggestions" className="flex-1 p-4 m-0 data-[state=inactive]:hidden">
            <h3 className="text-sm font-medium mb-3">Try asking about:</h3>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start text-sm h-auto py-3 px-4"
                  onClick={() => {
                    setInput(suggestion)
                    setActiveTab("chat")
                    setTimeout(() => inputRef.current?.focus(), 100)
                  }}
                >
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 mt-0.5 text-primary" />
                    <span className="text-left">{suggestion}</span>
                  </div>
                </Button>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    )}
  </>
)
}

export default AIAssistant
