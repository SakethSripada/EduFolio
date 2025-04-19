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
import { AIFeatureGate } from "@/components/subscription/AIFeatureGate"

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

// Message component (separate component for readability)
function MessageComponent({ message }: { message: Message }) {
  return (
    <div
      className={cn(
        "flex gap-3 max-w-[90%]",
        message.role === "user" ? "ml-auto flex-row-reverse" : ""
      )}
    >
      {/* User or Assistant Avatar */}
      <div
        className={cn(
          "h-8 w-8 mt-1 rounded-full flex-shrink-0 flex items-center justify-center",
          message.role === "user" ? "bg-secondary" : "bg-primary"
        )}
      >
        {message.role === "user" ? (
          <User className="h-4 w-4 text-secondary-foreground" />
        ) : (
          <Bot className="h-4 w-4 text-primary-foreground" />
        )}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          "rounded-lg p-3",
          message.role === "user"
            ? "bg-secondary text-secondary-foreground"
            : "bg-muted",
          message.status === "error" ? "border-red-500 border" : ""
        )}
      >
        <div className="prose prose-sm max-w-none dark:prose-invert break-words">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

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
        title: "Error",
        description: "Failed to load your profile information.",
        variant: "destructive",
      })
    }
  }

  fetchProfileData()
}, [user, toast])

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

    // Update the message with the AI response
    const aiMessage: Message = {
      id: generateUniqueId(),
      role: "assistant",
      content: text.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, aiMessage])
  } catch (error) {
    console.error("Error sending message:", error)
    
    // Add an error message
    const errorMessage: Message = {
      id: generateUniqueId(),
      role: "assistant",
      content: "I'm sorry, I encountered an error processing your request. Please try again.",
      timestamp: new Date(),
      status: "error",
    }
    
    setMessages((prev) => [...prev, errorMessage])
    
    toast({
      title: "Error",
      description: "Failed to get a response from the AI.",
      variant: "destructive",
    })
  } finally {
    setIsTyping(false)
  }
}, [input, profileData, toast, generateUniqueId])

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

// Update isOpen when showOnLoad or initialPrompt changes
useEffect(() => {
  if (showOnLoad || initialPrompt) {
    setIsOpen(true)
  }
}, [showOnLoad, initialPrompt])

const suggestions = [
  "Help me brainstorm essay ideas for my Common App personal statement",
  "Review my extracurricular activities and suggest improvements",
  "What colleges would be a good match for my profile?",
  "How can I improve my chances at Ivy League schools?",
  "Help me calculate my UC GPA",
]

return (
  <AIFeatureGate>
    {({ startAIFeature, isProcessing: isAIProcessing }) => (
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
              "fixed bottom-0 right-0 z-50 flex flex-col bg-background border rounded-t-lg shadow-lg",
              isExpanded ? "w-full h-full rounded-none" : "w-[400px] h-[600px]"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">AI Assistant</h2>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={closeChat}
                >
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

              <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden p-0 m-0">
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
                <div className="p-3 border-t flex gap-2">
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (!isTyping && !isAIProcessing) {
                          startAIFeature().then(success => {
                            if (success) {
                              handleSendMessage();
                            }
                          });
                        }
                      }
                    }}
                    className="flex-1"
                    disabled={isTyping || isAIProcessing}
                  />
                  <Button
                    size="icon"
                    disabled={!input.trim() || isTyping || isAIProcessing}
                    onClick={() => {
                      startAIFeature().then(success => {
                        if (success) {
                          handleSendMessage();
                        }
                      });
                    }}
                  >
                    {isTyping || isAIProcessing ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </TabsContent>

              {/* Suggestions Tab */}
              <TabsContent value="suggestions" className="p-4 space-y-3 m-0">
                <p className="text-sm text-muted-foreground mb-2">Try asking about:</p>
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start h-auto py-2 px-3 text-left"
                    onClick={() => {
                      setInput(suggestion);
                      setActiveTab("chat");
                      setTimeout(() => {
                        inputRef.current?.focus();
                      }, 100);
                    }}
                  >
                    <span>{suggestion}</span>
                  </Button>
                ))}
              </TabsContent>

              {/* Context Tab */}
              <TabsContent value="context" className="p-4 m-0">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Active Context</h3>
                    {initialContext ? (
                      <Card>
                        <CardContent className="p-3">
                          <p className="text-sm">
                            {initialContext.type}: {initialContext.title}
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      <p className="text-sm text-muted-foreground">No specific context active.</p>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Available Profile Data</h3>
                    <div className="space-y-2">
                      {profileData ? (
                        <>
                          {profileData.academics && profileData.academics.length > 0 && (
                            <Badge variant="outline" className="mr-1">
                              Academics
                            </Badge>
                          )}
                          {profileData.extracurriculars && profileData.extracurriculars.length > 0 && (
                            <Badge variant="outline" className="mr-1">
                              Extracurriculars
                            </Badge>
                          )}
                          {profileData.awards && profileData.awards.length > 0 && (
                            <Badge variant="outline" className="mr-1">
                              Awards
                            </Badge>
                          )}
                          {profileData.essays && profileData.essays.length > 0 && (
                            <Badge variant="outline">Essays</Badge>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">Loading profile data...</p>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </>
    )}
  </AIFeatureGate>
);
}

