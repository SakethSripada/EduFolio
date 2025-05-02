"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Code, 
  FileText, 
  Briefcase, 
  Lightbulb, 
  ImageIcon, 
  Camera, 
  ExternalLink, 
  Github, 
  ArrowLeft, 
  Loader2,
  Calendar,
  Lock,
  AlertTriangle
} from "lucide-react"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { getShareLink } from "@/lib/supabase/utils"
import { format } from "date-fns"
import * as React from 'react'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Define types for portfolio data
type Project = {
  id: string
  title: string
  description: string
  category: string
  tags?: string[]
  link?: string
  image?: string
  gallery?: string[]
  date?: string
  user_id?: string
  created_at?: string
}

type Category = {
  id: string
  name: string
  icon: React.ReactNode
  user_id?: string
}

type PortfolioData = {
  owner: {
    name: string
    avatar: string
  }
  projects: Project[]
  categories: Category[]
}

// Define a type for the params
interface PageParams {
  id: string;
}

export default function SharedPortfolioPage({ params }: { params: PageParams }) {
  // Properly use React.use to unwrap the params object
  // This addresses the Next.js warning about accessing params directly
  const unwrappedParams = React.use(params as any) as PageParams;
  const shareId = unwrappedParams.id;
  
  const [activeTab, setActiveTab] = useState("all")
  const [viewingGallery, setViewingGallery] = useState<{
    isOpen: boolean
    project: Project | null
    activeIndex: number
  }>({
    isOpen: false,
    project: null,
    activeIndex: 0,
  })
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [shareData, setShareData] = useState<any>(null)

  // Initialize portfolio data structure
  const [portfolio, setPortfolio] = useState<PortfolioData>({
    owner: {
      name: "",
      avatar: "/placeholder.svg?height=100&width=100",
    },
    projects: [],
    categories: [
      { id: "coding", name: "Coding", icon: <Code className="h-4 w-4 mr-2" /> },
      { id: "research", name: "Research", icon: <FileText className="h-4 w-4 mr-2" /> },
      { id: "business", name: "Business", icon: <Briefcase className="h-4 w-4 mr-2" /> },
      { id: "engineering", name: "Engineering", icon: <Lightbulb className="h-4 w-4 mr-2" /> },
      { id: "art", name: "Art & Design", icon: <ImageIcon className="h-4 w-4 mr-2" /> },
      { id: "photography", name: "Photography", icon: <Camera className="h-4 w-4 mr-2" /> },
    ],
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClientComponentClient()
        
        // Fetch share link data
        const { data: shareData, error: shareError } = await getShareLink(shareId)
        
        if (shareError || !shareData) {
          setError(typeof shareError === 'string' ? shareError : "Invalid or expired share link.")
          setLoading(false)
          return
        }
        
        setShareData(shareData)
        
        // If the link is not public or has expired
        if (!shareData.is_public) {
          setError("This portfolio is set to private.")
          setLoading(false)
          return
        }
        
        if (shareData.expires_at && new Date(shareData.expires_at) < new Date()) {
          setError("This share link has expired.")
          setLoading(false)
          return
        }
        
        // Fetch owner profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", shareData.user_id)
          .maybeSingle()
          
        if (profileError || !profileData) {
          setError("User profile not found.")
          setLoading(false)
          return
        }
        
        // Apply share privacy settings
        const displayName = shareData.settings?.hideUserName 
          ? "Anonymous"
          : profileData.full_name || "Portfolio Owner";
        
        // Fetch projects
        const { data: projectsData, error: projectsError } = await supabase
          .from("projects")
          .select("*")
          .eq("user_id", shareData.user_id)
          .order("created_at", { ascending: false })
          
        if (projectsError) {
          console.error("Error fetching projects:", projectsError)
          setError("Error fetching projects.")
          setLoading(false)
          return
        }
        
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select("*")
          .eq("user_id", shareData.user_id)
          
        // Update portfolio data
        setPortfolio({
          owner: {
            name: displayName,
            avatar: profileData.avatar_url || "/placeholder.svg?height=100&width=100",
          },
          projects: projectsData as Project[] || [],
          categories: categoriesData && categoriesData.length > 0 
            ? categoriesData.map((cat: any) => ({
                id: cat.id,
                name: cat.name,
                icon: getCategoryIcon(cat.icon),
                user_id: cat.user_id
              }))
            : [
                { id: "coding", name: "Coding", icon: <Code className="h-4 w-4 mr-2" /> },
                { id: "research", name: "Research", icon: <FileText className="h-4 w-4 mr-2" /> },
                { id: "business", name: "Business", icon: <Briefcase className="h-4 w-4 mr-2" /> },
                { id: "engineering", name: "Engineering", icon: <Lightbulb className="h-4 w-4 mr-2" /> },
                { id: "art", name: "Art & Design", icon: <ImageIcon className="h-4 w-4 mr-2" /> },
                { id: "photography", name: "Photography", icon: <Camera className="h-4 w-4 mr-2" /> },
              ]
        })
        
        setLoading(false)
      } catch (error) {
        console.error("Error fetching portfolio data:", error)
        setError("An error occurred while loading the shared portfolio.")
        setLoading(false)
      }
    }
    
    fetchData()
  }, [shareId])

  const filteredProjects =
    activeTab === "all" ? portfolio.projects : portfolio.projects.filter((project) => project.category === activeTab)

  // Helper function to convert icon string to component
  const getCategoryIcon = (iconName: string): React.ReactNode => {
    switch (iconName) {
      case "Code":
        return <Code className="h-4 w-4 mr-2" />
      case "FileText":
        return <FileText className="h-4 w-4 mr-2" />
      case "Briefcase":
        return <Briefcase className="h-4 w-4 mr-2" />
      case "Lightbulb":
        return <Lightbulb className="h-4 w-4 mr-2" />
      case "ImageIcon":
        return <ImageIcon className="h-4 w-4 mr-2" />
      case "Camera":
        return <Camera className="h-4 w-4 mr-2" />
      default:
        return <FileText className="h-4 w-4 mr-2" />
    }
  }
  
  const getCategoryName = (categoryId: string): string => {
    const category = portfolio.categories.find((c) => c.id === categoryId)
    return category?.name || categoryId.charAt(0).toUpperCase() + categoryId.slice(1)
  }

  const getCategoryIconFromId = (categoryId: string): React.ReactNode => {
    const category = portfolio.categories.find((c) => c.id === categoryId)
    return category?.icon || <FileText className="h-5 w-5" />
  }

  const openGallery = (project: Project, index = 0) => {
    setViewingGallery({
      isOpen: true,
      project,
      activeIndex: index,
    })
  }

  const nextImage = () => {
    if (!viewingGallery.project || !viewingGallery.project.gallery) return
    setViewingGallery({
      ...viewingGallery,
      activeIndex: (viewingGallery.activeIndex + 1) % viewingGallery.project.gallery.length,
    })
  }

  const prevImage = () => {
    if (!viewingGallery.project || !viewingGallery.project.gallery) return
    setViewingGallery({
      ...viewingGallery,
      activeIndex:
        (viewingGallery.activeIndex - 1 + (viewingGallery.project.gallery?.length || 0)) %
        (viewingGallery.project.gallery?.length || 1),
    })
  }

  // Helper function to get user initials
  const getUserInitials = (name: string | undefined): string => {
    if (!name) return 'U';
    
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length > 1 ? 1 : 0].charAt(0)).toUpperCase();
  };

  // Loading state
  if (loading) {
    return (
      <div className="container py-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="container py-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="bg-card p-8 rounded-lg shadow-md">
            <div className="flex justify-center mb-4">
              {error.includes("expired") ? (
                <Calendar className="h-12 w-12 text-muted-foreground" />
              ) : error.includes("private") ? (
                <Lock className="h-12 w-12 text-muted-foreground" />
              ) : (
                <AlertTriangle className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
            <h2 className="text-2xl font-bold mb-4">{error}</h2>
            <p className="text-muted-foreground mb-6">
              {error.includes("expired")
                ? "The owner of this content has set an expiration date that has passed."
                : error.includes("private")
                ? "The owner of this content has set this portfolio to private."
                : "Please check the URL or contact the person who shared this link with you."}
            </p>
            <Link href="/" className="text-primary hover:underline inline-flex items-center">
              <ArrowLeft className="h-4 w-4 mr-1" /> Return to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="mb-8">
        <Link href="/" className="text-primary hover:underline inline-flex items-center mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to EduFolio
        </Link>

        <div className="flex items-center gap-4 mb-6">
          {/* Temporarily disabled avatar in favor of initials */}
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-lg font-semibold">
            {getUserInitials(portfolio.owner.name)}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{portfolio.owner.name}'s Portfolio</h1>
            <p className="text-muted-foreground">Shared portfolio</p>
          </div>
        </div>
        
        {shareData && shareData.expires_at && (
          <div className="mb-6 p-3 bg-muted rounded-md inline-flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            This shared link will expire on {format(new Date(shareData.expires_at), "MMMM d, yyyy")}
          </div>
        )}
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b mb-8">
          <TabsList className="flex w-full overflow-x-auto py-2 gap-2 justify-start sm:justify-center">
            <TabsTrigger
              value="all"
              className="px-4 py-2 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              All Projects
            </TabsTrigger>
            {portfolio.categories
              .filter((cat) => portfolio.projects.some((p) => p.category === cat.id))
              .map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="px-4 py-2 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap"
                >
                  {category.icon}
                  {category.name}
                </TabsTrigger>
              ))}
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.length === 0 ? (
              <div className="col-span-full text-center py-12 border rounded-lg bg-muted/30">
                <div className="flex flex-col items-center justify-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No projects in this category</h3>
                </div>
              </div>
            ) : (
              filteredProjects.map((project) => (
                <Card
                  key={project.id}
                  className="overflow-hidden group hover:shadow-lg transition-all duration-300 flex flex-col h-full"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={project.image || "/placeholder.svg"}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                      <div className="p-4 w-full">
                        <Badge variant="outline" className="bg-background/80 text-foreground">
                          {getCategoryName(project.category)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <CardContent className="flex flex-col flex-grow p-5">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                      {getCategoryIconFromId(project.category)}
                      <span>{project.date}</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 line-clamp-1">{project.title}</h3>
                    <Popover>
                      <PopoverTrigger asChild>
                        <p className="text-muted-foreground mb-4 line-clamp-2 cursor-pointer hover:text-primary transition-colors">
                          {project.description}
                        </p>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 max-h-60 overflow-y-auto">
                        <div className="font-medium mb-2">Description</div>
                        <p className="text-sm text-muted-foreground">{project.description}</p>
                      </PopoverContent>
                    </Popover>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags && project.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="font-normal">
                          {tag}
                        </Badge>
                      ))}
                      {project.tags && project.tags.length > 3 && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Badge variant="outline" className="font-normal cursor-pointer hover:bg-accent transition-colors">
                              +{project.tags.length - 3} more
                            </Badge>
                          </PopoverTrigger>
                          <PopoverContent className="w-80 max-h-60 overflow-y-auto">
                            <div className="font-medium mb-2">All Tags</div>
                            <div className="flex flex-wrap gap-2">
                              {project.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="font-normal">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>

                    {/* Photography Gallery Preview */}
                    {project.category === "photography" && project.gallery && project.gallery.length > 0 && (
                      <div className="mb-4">
                        <div className="text-sm font-medium mb-2">Gallery ({project.gallery.length} photos)</div>
                        <div className="grid grid-cols-3 gap-1 cursor-pointer" onClick={() => openGallery(project)}>
                          {project.gallery.slice(0, 3).map((image, index) => (
                            <div key={index} className="relative h-16 rounded-md overflow-hidden">
                              <img
                                src={image || "/placeholder.svg"}
                                alt={`Gallery ${index}`}
                                className="w-full h-full object-cover"
                              />
                              {index === 2 && project.gallery && project.gallery.length > 3 && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-medium">
                                  +{project.gallery.length - 3}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-auto">
                      {project.link && (
                        <Button variant="outline" className="w-full" asChild>
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center"
                          >
                            {project.link.includes("github") ? (
                              <Github className="h-4 w-4 mr-2" />
                            ) : (
                              <ExternalLink className="h-4 w-4 mr-2" />
                            )}
                            View Project
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Gallery Dialog */}
      <Dialog open={viewingGallery.isOpen} onOpenChange={(isOpen) => !isOpen && setViewingGallery({ ...viewingGallery, isOpen: false })}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{viewingGallery.project?.title} Gallery</DialogTitle>
          </DialogHeader>
          {viewingGallery.project && viewingGallery.project.gallery && (
            <div className="relative">
              <div className="aspect-video overflow-hidden rounded-lg">
                <img
                  src={viewingGallery.project.gallery[viewingGallery.activeIndex] || "/placeholder.svg"}
                  alt={`Gallery image ${viewingGallery.activeIndex + 1}`}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex justify-between mt-4">
                <Button variant="outline" size="sm" onClick={prevImage}>
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  {viewingGallery.activeIndex + 1} of {viewingGallery.project.gallery.length}
                </span>
                <Button variant="outline" size="sm" onClick={nextImage}>
                  Next
                </Button>
              </div>
              <div className="grid grid-cols-5 gap-2 mt-4">
                {viewingGallery.project.gallery.map((image, index) => (
                  <div
                    key={index}
                    className={`aspect-square rounded-md overflow-hidden cursor-pointer ${
                      index === viewingGallery.activeIndex ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setViewingGallery({ ...viewingGallery, activeIndex: index })}
                  >
                    <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
