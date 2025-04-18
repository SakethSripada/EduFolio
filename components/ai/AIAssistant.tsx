"use client"

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
role: "user" | "assistant"
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

export default function AIAssistant({ initialContext, initialPrompt, onClose, showOnLoad = false }: AIAssistantProps) {
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
  const uniqueId = `${Date.now()}-${idCounter}`;
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

      // Fetch related data
      const [academics, extracurriculars, awards, essays] = await Promise.all([
        supabase.from("academics").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase
          .from("extracurricular_activities")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase.from("awards").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("essays").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      ])

      if (academics.error || extracurriculars.error || awards.error || essays.error) {
        console.error(
          "Error fetching related data:",
          academics.error,
          extracurriculars.error,
          awards.error,
          essays.error,
        )
        toast({
          title: "Error fetching related data",
          description: "Failed to load some of your profile information.",
          variant: "destructive",
        })
        return
      }

      setProfileData({
        ...profile,
        academics: academics.data,
        extracurriculars: extracurriculars.data,
        awards: awards.data,
        essays: essays.data,
      })
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
  if (initialContext && !messages.some((m) => m.context?.id === initialContext.id)) {
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
        contextMessage = `How can I help with your application to ${initialContext.title}?`
        break
      default:
        contextMessage = "How can I help with your college application today?"
    }

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: generateUniqueId(),
        role: "assistant",
        content: contextMessage,
        timestamp: new Date(),
        context: initialContext,
      },
    ])
    
    // Do not automatically open the chat when context is provided
    // Let the user click to open it when they want assistance
  }
}, [initialContext, messages, idCounter, initialPrompt])

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
    
    // Construct a prompt with instructions to keep the AI concise
    let prompt = `${input}\n\n` +
      `IMPORTANT: Provide a concise, direct response that addresses the query efficiently. ` +
      `Avoid unnecessary explanations, lengthy introductions, or redundant content. ` +
      `Focus on providing precise, valuable information in as few words as possible while still being helpful and complete.`;

    // Append profile data to the prompt if applicable
    if (profileData) {
      prompt += `\n\nUser Profile Data:\n${JSON.stringify(profileData, null, 2)}`
    }

    // Call our secure API route instead of directly using OpenAI
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        prompt: prompt,
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
}, [input, toast, profileData, idCounter, generateUniqueId])

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
}, [initialPrompt, input, handleSendMessage, isOpen]);

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
            <TabsTrigger
              value="context"
              className="rounded-t-md rounded-b-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              Context
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

          <TabsContent value="context" className="flex-1 p-4 m-0 data-[state=inactive]:hidden">
            <h3 className="text-sm font-medium mb-3">AI can access:</h3>
            <div className="space-y-3">
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded">
                      <Pencil className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">Your Essays</h4>
                      <p className="text-xs text-muted-foreground">
                        {profileData?.essays?.length || 0} essays in progress
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 gap-1">
                      <Plus className="h-3 w-3" /> Add
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded">
                      <MessageCircle className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">Your Extracurriculars</h4>
                      <p className="text-xs text-muted-foreground">
                        {profileData?.extracurriculars?.length || 0} activities added
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 gap-1">
                      <Plus className="h-3 w-3" /> Add
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">Your Academics</h4>
                      <p className="text-xs text-muted-foreground">
                        GPA: {profileData?.academics?.unweighted || "N/A"} (Weighted:{" "}
                        {profileData?.academics?.weighted || "N/A"})
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7">
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    )}
  </>
)
}
