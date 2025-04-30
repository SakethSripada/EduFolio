"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  PlusCircle,
  Upload,
  Code,
  FileText,
  Briefcase,
  Lightbulb,
  Trash2,
  ExternalLink,
  Github,
  Edit,
  ImageIcon,
  Camera,
  Share2,
  Settings,
  Copy,
  Check,
  MoreHorizontal,
  Plus,
  Loader2,
  Calendar,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useAuth } from "@/components/auth/AuthProvider"
import { handleSupabaseError, performDatabaseOperation } from "@/lib/supabase"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"
import { useToast } from "@/components/ui/use-toast"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { createOrUpdateShareLink, generateShareUrl, ShareSettings } from "@/lib/share-utils"
import { Separator } from "@/components/ui/separator"
import { RequiredLabel } from "@/components/ui/required-label"
import { FormErrorSummary } from "@/components/ui/form-error-summary"
import { validateRequired } from "@/lib/validation"

type PortfolioContentProps = {
  // ... existing code ...
}

export const PortfolioContent = ({ 
  // ... existing code ...
}: PortfolioContentProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [isAddingProject, setIsAddingProject] = useState(false)
  const [isEditingProject, setIsEditingProject] = useState(false)
  const [isManagingCategories, setIsManagingCategories] = useState(false)
  const [isSharingPortfolio, setIsSharingPortfolio] = useState(false)
  const [isPublic, setIsPublic] = useState(false)
  const [shareLink, setShareLink] = useState("")
  const [shareId, setShareId] = useState("")
  const [copied, setCopied] = useState(false)
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  const [newCategory, setNewCategory] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [existingShareLink, setExistingShareLink] = useState<any>(null)
  const [expiryOption, setExpiryOption] = useState("never")
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined)
  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = createClientComponentClient<Database>()

  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    category: "",
    tags: "",
    link: "",
    image: null as File | null,
    imagePreview: "",
    gallery: [] as { file: File; preview: string }[],
  })

  const [categories, setCategories] = useState([
    { id: "coding", name: "Coding", icon: "Code" },
    { id: "research", name: "Research", icon: "FileText" },
    { id: "business", name: "Business", icon: "Briefcase" },
    { id: "engineering", name: "Engineering", icon: "Lightbulb" },
    { id: "art", name: "Art & Design", icon: "ImageIcon" },
    { id: "photography", name: "Photography", icon: "Camera" },
  ])

  const [projects, setProjects] = useState<any[]>([])

  // Add state for confirmation dialogs
  const [confirmDeleteProject, setConfirmDeleteProject] = useState<string | null>(null)
  const [confirmDeleteCategory, setConfirmDeleteCategory] = useState<string | null>(null)

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [formSubmitted, setFormSubmitted] = useState(false)

  // Check for existing share link on component mount
  useEffect(() => {
    if (!user?.id) return;
  
    const checkExistingShareLink = async () => {
      try {
        const baseUrl = typeof window !== "undefined"
          ? `${window.location.protocol}//${window.location.host}`
          : "";
  
        // Fetch all portfolio share links for this user
        const { data: existingRecords, error } = await supabase
          .from("shared_links")
          .select("*")
          .eq("user_id", user.id)
          .eq("content_type", "portfolio");
  
        if (error) {
          console.error("Error checking share link:", error);
          return;
        }
  
        let record = existingRecords?.[0];
        if (existingRecords.length > 1) {
          // delete duplicates, keep the first
          const idsToDelete = existingRecords.slice(1).map(r => r.id);
          await supabase.from("shared_links").delete().in("id", idsToDelete);
        }
  
        if (!record) {
          // create a new one
          const newShareId = Math.random().toString(36).substring(2, 10);
          const { data: inserted, error: insertErr } = await supabase
            .from("shared_links")
            .insert({
              user_id: user.id,
              share_id: newShareId,
              content_type: "portfolio",
              content_id: null,
              is_public: false,
              expires_at: null,
            })
            .select("*")
            .single();
          if (insertErr) throw insertErr;
          record = inserted;
        }
  
        // now record is either the fetched or the newly created
        setExistingShareLink(record);
        setShareId(record.share_id);
        setShareLink(`${baseUrl}/share/portfolio/${record.share_id}`);
        setIsPublic(record.is_public);
        if (record.expires_at) {
          setExpiryOption("date");
          setExpiryDate(new Date(record.expires_at));
        } else {
          setExpiryOption("never");
          setExpiryDate(undefined);
        }
      } catch (err) {
        console.error("Error in checkExistingShareLink:", err);
      }
    };
  
    checkExistingShareLink();
  }, [user?.id]);
  

  // Fetch projects and categories from Supabase
  useEffect(() => {
    if (!user?.id) return;
  
    const fetchData = async () => {
      performDatabaseOperation(
        async () => {
          const [{ data: catData, error: catErr }, { data: projData, error: projErr }] = await Promise.all([
            supabase
              .from("categories")
              .select("*")
              .eq("user_id", user.id)
              .order("created_at", { ascending: true }),
            supabase
              .from("projects")
              .select("*")
              .eq("user_id", user.id)
              .order("created_at", { ascending: false }),
          ]);
  
          if (catErr) throw catErr;
          if (projErr) throw projErr;
  
          return {
            categories: catData || [],
            projects: projData || [],
          };
        },
        setIsLoading,
        (data) => {
          if (data.categories.length) {
            setCategories(data.categories);
          } else {
            // insert your defaults...
          }
          setProjects(data.projects);
        },
        (err) =>
          toast({
            title: "Error loading portfolio data",
            description: handleSupabaseError(err, "There was a problem loading your portfolio data."),
            variant: "destructive",
          })
      );
    };
  
    fetchData();
  }, [user?.id]);
  

  // Update portfolio share link
  const handleCreateShareLink = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a share link.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      let expiresAt: Date | null = null;
      if (expiryOption === "date" && expiryDate) {
        expiresAt = expiryDate;
      }
      
      // Use existing share ID if available
      const currentShareId = existingShareLink?.share_id || shareId;
      
      const result = await createOrUpdateShareLink({
        userId: user.id,
        contentType: "portfolio",
        contentId: null,
        isPublic,
        expiresAt,
        existingShareId: currentShareId,
      });
      
      if (!result.success) {
        throw result.error;
      }
      
      // Update the share link if one was returned
      if ('shareLink' in result && result.shareLink) {
        setShareLink(result.shareLink);
      } else {
        // Otherwise generate one from the share ID
        const baseUrl = typeof window !== "undefined" ? `${window.location.protocol}//${window.location.host}` : "";
        setShareLink(`${baseUrl}/share/portfolio/${result.shareId}`);
      }

      toast({
        title: "Share link saved",
        description: "Your portfolio share settings have been updated.",
      });
    } catch (error) {
      console.error("Error creating/updating share link:", error);
      toast({
        title: "Error with share link",
        description: "There was a problem updating your share settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = () => {
        setNewProject({
          ...newProject,
          image: file,
          imagePreview: reader.result as string,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((file) => {
        return new Promise<{ file: File; preview: string }>((resolve) => {
          const reader = new FileReader()
          reader.onload = () => {
            resolve({
              file,
              preview: reader.result as string,
            })
          }
          reader.readAsDataURL(file)
        })
      })

      Promise.all(newFiles).then((galleryFiles) => {
        setNewProject({
          ...newProject,
          gallery: [...newProject.gallery, ...galleryFiles],
        })
      })
    }
  }

  const removeGalleryImage = (index: number) => {
    const updatedGallery = [...newProject.gallery]
    updatedGallery.splice(index, 1)
    setNewProject({
      ...newProject,
      gallery: updatedGallery,
    })
  }

  const validateProjectForm = (): boolean => {
    const errors: Record<string, string> = {}

    const titleError = validateRequired(newProject.title, "Project title")
    if (titleError) errors.title = titleError

    const descriptionError = validateRequired(newProject.description, "Description")
    if (descriptionError) errors.description = descriptionError

    const categoryError = validateRequired(newProject.category, "Category")
    if (categoryError) errors.category = categoryError

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAddProject = async () => {
    if (!user) return
    
    setFormSubmitted(true)
    
    if (!validateProjectForm()) {
      return
    }

    performDatabaseOperation(
      async () => {
        // Upload image if exists
        let imagePath = "/placeholder.svg?height=400&width=600"
        if (newProject.image) {
          const fileExt = newProject.image.name.split(".").pop()
          const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
          const filePath = `${user.id}/projects/${fileName}`

          const { error: uploadError } = await supabase.storage
            .from("project-images")
            .upload(filePath, newProject.image)

          if (uploadError) throw uploadError

          const { data } = supabase.storage.from("project-images").getPublicUrl(filePath)
          imagePath = data.publicUrl
        }

        // Upload gallery images if exist
        const galleryPaths: string[] = []
        if (newProject.gallery.length > 0) {
          for (const item of newProject.gallery) {
            if (item.file) {
              const fileExt = item.file.name.split(".").pop()
              const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
              const filePath = `${user.id}/gallery/${fileName}`

              const { error: uploadError } = await supabase.storage.from("project-images").upload(filePath, item.file)

              if (uploadError) throw uploadError

              const { data } = supabase.storage.from("project-images").getPublicUrl(filePath)
              galleryPaths.push(data.publicUrl)
            }
          }
        }

        // Create project in database
        const projectToAdd = {
          user_id: user.id,
          title: newProject.title,
          description: newProject.description,
          category: newProject.category,
          tags: newProject.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
          link: newProject.link,
          image: imagePath,
          gallery: galleryPaths.length > 0 ? galleryPaths : [],
          date: new Date().toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          }),
        }

        const { data, error } = await supabase.from("projects").insert(projectToAdd).select()

        if (error) throw error

        return data
      },
      setIsLoading,
      (data) => {
        if (data) {
          // First update the data
          setProjects([data[0], ...projects])
          
          // Then reset form and close the modal with a small delay to prevent reopening
          resetProjectForm()
          
          // Use a timeout to ensure state updates don't conflict
          setTimeout(() => {
            setIsAddingProject(false)
            setFormSubmitted(false)
          }, 0)
          
          toast({
            title: "Project added",
            description: "Your project has been added successfully.",
          })
        }
      },
      (error) => {
        console.error("Error adding project:", error)
        toast({
          title: "Error adding project",
          description: handleSupabaseError(error, "There was a problem adding your project."),
          variant: "destructive",
        })
      },
    )
  }

  const handleEditProject = async () => {
    if (!user || !editingProjectId) return
    
    setFormSubmitted(true)
    
    if (!validateProjectForm()) {
      return
    }

    performDatabaseOperation(
      async () => {
        const projectToUpdate = projects.find((p) => p.id === editingProjectId)

        // Upload image if changed
        let imagePath = projectToUpdate.image
        if (newProject.image) {
          const fileExt = newProject.image.name.split(".").pop()
          const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
          const filePath = `${user.id}/projects/${fileName}`

          const { error: uploadError } = await supabase.storage
            .from("project-images")
            .upload(filePath, newProject.image)

          if (uploadError) throw uploadError

          const { data } = supabase.storage.from("project-images").getPublicUrl(filePath)
          imagePath = data.publicUrl
        }

        // Upload new gallery images if exist
        let galleryPaths = projectToUpdate.gallery || []
        if (newProject.gallery.length > 0) {
          // Only upload new images (those with file property)
          const newImages = newProject.gallery.filter((item) => item.file)

          if (newImages.length > 0) {
            galleryPaths = [] // Reset if we have new images

            for (const item of newProject.gallery) {
              if (item.file) {
                const fileExt = item.file.name.split(".").pop()
                const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
                const filePath = `${user.id}/gallery/${fileName}`

                const { error: uploadError } = await supabase.storage
                  .from("project-images")
                  .upload(filePath, item.file)

                if (uploadError) throw uploadError

                const { data } = supabase.storage.from("project-images").getPublicUrl(filePath)
                galleryPaths.push(data.publicUrl)
              } else if (item.preview.startsWith("http")) {
                // Keep existing gallery images
                galleryPaths.push(item.preview)
              }
            }
          }
        }

        // Update project in database
        const projectUpdates = {
          title: newProject.title,
          description: newProject.description,
          category: newProject.category,
          tags: newProject.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
          link: newProject.link,
          image: imagePath,
          gallery: galleryPaths,
          updated_at: new Date().toISOString(),
        }

        const { error } = await supabase.from("projects").update(projectUpdates).eq("id", editingProjectId)

        if (error) throw error

        return { projectUpdates }
      },
      setIsLoading,
      (data) => {
        // First update the projects data
        setProjects(
          projects.map((project) => {
            if (project.id === editingProjectId) {
              return { ...project, ...data.projectUpdates }
            }
            return project
          }),
        )

        // Reset form first
        resetProjectForm()
        
        // Use a timeout to ensure state updates don't conflict
        setTimeout(() => {
          setIsEditingProject(false)
          setEditingProjectId(null)
        }, 0)
        
        toast({
          title: "Project updated",
          description: "Your project has been updated successfully.",
        })
      },
      (error) => {
        console.error("Error updating project:", error)
        toast({
          title: "Error updating project",
          description: handleSupabaseError(error, "There was a problem updating your project."),
          variant: "destructive",
        })
      },
    )
  }

  const startEditProject = (projectId: string) => {
    const projectToEdit = projects.find((p) => p.id === projectId)
    if (projectToEdit) {
      setNewProject({
        title: projectToEdit.title,
        description: projectToEdit.description,
        category: projectToEdit.category,
        tags: projectToEdit.tags.join(", "),
        link: projectToEdit.link || "",
        image: null,
        imagePreview: projectToEdit.image,
        gallery: (projectToEdit.gallery || []).map((url: string) => ({ file: null, preview: url })),
      })
      setEditingProjectId(projectId)
      setIsEditingProject(true)
    }
  }

  // Update the deleteProject function
  const deleteProject = async (projectId: string) => {
    if (!user) return

    performDatabaseOperation(
      async () => {
        const { error } = await supabase.from("projects").delete().eq("id", projectId)

        if (error) throw error
      },
      setIsLoading,
      () => {
        setProjects(projects.filter((p) => p.id !== projectId))
        toast({
          title: "Project deleted",
          description: "Your project has been deleted.",
        })
        setConfirmDeleteProject(null)
      },
      (error) => {
        console.error("Error deleting project:", error)
        toast({
          title: "Error deleting project",
          description: handleSupabaseError(error, "There was a problem deleting your project."),
          variant: "destructive",
        })
        setConfirmDeleteProject(null)
      },
    )
  }

  const resetProjectForm = () => {
    setNewProject({
      title: "",
      description: "",
      category: "",
      tags: "",
      link: "",
      image: null,
      imagePreview: "",
      gallery: [],
    })
    setFormErrors({})
    setFormSubmitted(false)
  }

  const handleAddCategory = async () => {
    if (!user || !newCategory.trim()) return

    const categoryId = newCategory.toLowerCase().replace(/\s+/g, "-")
    if (categories.some((c) => c.id === categoryId)) {
      toast({
        title: "Category already exists",
        description: "Please use a different name for your category.",
        variant: "destructive",
      })
      return
    }

    performDatabaseOperation(
      async () => {
        const newCategoryData = {
          id: categoryId,
          user_id: user.id,
          name: newCategory.trim(),
          icon: "FileText", // Default icon
        }

        const { data, error } = await supabase.from("categories").insert(newCategoryData).select()

        if (error) throw error

        return data
      },
      setIsLoading,
      (data) => {
        if (data) {
          setCategories([...categories, data[0]])
          setNewCategory("")
          toast({
            title: "Category added",
            description: `"${newCategory.trim()}" has been added to your categories.`,
          })
        }
      },
      (error) => {
        console.error("Error adding category:", error)
        toast({
          title: "Error adding category",
          description: handleSupabaseError(error, "There was a problem adding your category."),
          variant: "destructive",
        })
      },
    )
  }

  // Update the deleteCategory function
  const deleteCategory = async (categoryId: string) => {
    if (!user) return

    // Don't delete if there are projects using this category
    if (projects.some((p) => p.category === categoryId)) {
      toast({
        title: "Cannot delete category",
        description: "There are projects using this category. Please reassign or delete those projects first.",
        variant: "destructive",
      })
      setConfirmDeleteCategory(null)
      return
    }

    performDatabaseOperation(
      async () => {
        const { error } = await supabase.from("categories").delete().eq("id", categoryId).eq("user_id", user.id)

        if (error) throw error
      },
      setIsLoading,
      () => {
        setCategories(categories.filter((c) => c.id !== categoryId))
        toast({
          title: "Category deleted",
          description: "The category has been deleted.",
        })
        setConfirmDeleteCategory(null)
      },
      (error) => {
        console.error("Error deleting category:", error)
        toast({
          title: "Error deleting category",
          description: handleSupabaseError(error, "There was a problem deleting the category."),
          variant: "destructive",
        })
        setConfirmDeleteCategory(null)
      },
    )
  }

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({
      title: "Link copied",
      description: "Share link has been copied to clipboard.",
    })
  }

  const togglePortfolioVisibility = () => {
    setIsPublic(!isPublic)
    toast({
      title: isPublic ? "Portfolio is now private" : "Portfolio is now public",
      description: isPublic
        ? "Your portfolio is only visible to you."
        : "Your portfolio is now visible to anyone with the link.",
    })
  }

  const filteredProjects = activeTab === "all" ? projects : projects.filter((project) => project.category === activeTab)

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    const iconName = category?.icon || "FileText"

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

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    return category?.name || categoryId.charAt(0).toUpperCase() + categoryId.slice(1)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <>
      <div className="container py-8 md:py-12">
        <Toaster />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Portfolio</h1>
            <p className="text-muted-foreground mt-1">Showcase your projects, research, and achievements</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="flex items-center gap-2" onClick={() => setIsManagingCategories(true)}>
              <Settings className="h-4 w-4" /> Manage Categories
            </Button>
            <Button variant="outline" className="flex items-center gap-2" onClick={() => setIsSharingPortfolio(true)}>
              <Share2 className="h-4 w-4" /> Share Portfolio
            </Button>
            <Button className="flex items-center gap-2" onClick={() => setIsAddingProject(true)}>
              <PlusCircle className="h-4 w-4" /> Add Project
            </Button>
          </div>
        </div>

        {/* Category Management Dialog */}
        <Dialog open={isManagingCategories} onOpenChange={setIsManagingCategories}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Manage Categories</DialogTitle>
              <DialogDescription>Add, edit, or remove project categories.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-end gap-2">
                <div className="flex-grow">
                  <Label htmlFor="newCategory" className="mb-2">
                    New Category
                  </Label>
                  <Input
                    id="newCategory"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Enter category name"
                  />
                </div>
                <Button onClick={handleAddCategory}>Add</Button>
              </div>

              <div className="border rounded-md">
                <div className="py-2 px-4 border-b bg-muted/50">
                  <h3 className="font-medium">Current Categories</h3>
                </div>
                <ul className="divide-y">
                  {categories.map((category) => (
                    <li key={category.id} className="flex items-center justify-between py-3 px-4">
                      <div className="flex items-center">
                        {getCategoryIcon(category.id)}
                        <span>{category.name}</span>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setConfirmDeleteCategory(category.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsManagingCategories(false)}>Done</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Share Portfolio Dialog - REPLACE the existing one with this enhanced version */}
        <Dialog open={isSharingPortfolio} onOpenChange={setIsSharingPortfolio}>
          <DialogContent className="w-full max-w-[90vw] sm:max-w-[500px]">
            <DialogHeader className="pt-6">
              <DialogTitle>Share Your Portfolio</DialogTitle>
              <DialogDescription>
                Create a shareable link to your portfolio projects
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4 overflow-y-auto max-h-[60vh] pr-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="font-medium">Portfolio Visibility</h3>
                  <p className="text-sm text-muted-foreground">
                    {isPublic ? "Your portfolio is visible to anyone with the link" : "Your portfolio is private"}
                  </p>
                </div>
                <Switch checked={isPublic} onCheckedChange={togglePortfolioVisibility} />
              </div>

              <Separator className="my-4" />

              <div className="space-y-3">
                <Label>Link Expiration</Label>
                <RadioGroup value={expiryOption} onValueChange={setExpiryOption}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="never" id="never" />
                    <Label htmlFor="never">Never expires</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="date" id="date" />
                    <Label htmlFor="date">Expires on specific date</Label>
                  </div>
                </RadioGroup>
                {expiryOption === "date" && (
                  <div className="pt-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !expiryDate && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {expiryDate ? format(expiryDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={expiryDate}
                          onSelect={setExpiryDate}
                          initialFocus
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input value={shareLink} readOnly className="flex-grow" />
                  <Button variant="outline" size="icon" onClick={copyShareLink}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {isPublic
                    ? "Anyone with this link can view your portfolio"
                    : "Enable public visibility to share your portfolio"}
                </p>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t">
              <p className="text-xs text-amber-500 mr-4 hidden sm:block">
                Remember to click "Update Share Link" to save visibility settings
              </p>
              <Button onClick={handleCreateShareLink} disabled={isLoading}>
                {isLoading ? "Processing..." : "Update Share Link"}
              </Button>
              <Button variant="outline" onClick={() => setIsSharingPortfolio(false)}>
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add/Edit Project Dialog */}
        <Dialog
          open={isAddingProject || isEditingProject}
          onOpenChange={(open) => {
            if (!open) {
              // Only handle close events here - don't set to true
              resetProjectForm()
              setIsAddingProject(false)
              setIsEditingProject(false)
              setEditingProjectId(null)
              setFormSubmitted(false)
            }
          }}
        >
          <DialogContent className="w-full max-w-[90vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isEditingProject ? "Edit Project" : "Add New Project"}</DialogTitle>
            </DialogHeader>
            
            <FormErrorSummary errors={formErrors} show={formSubmitted} />
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <RequiredLabel htmlFor="title">Project Title</RequiredLabel>
                <Input
                  id="title"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                />
                {formErrors.title && <p className="text-xs text-destructive">{formErrors.title}</p>}
              </div>
              <div className="grid gap-2">
                <RequiredLabel htmlFor="description">Description</RequiredLabel>
                <Textarea
                  id="description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                />
                {formErrors.description && <p className="text-xs text-destructive">{formErrors.description}</p>}
              </div>
              <div className="grid gap-2">
                <RequiredLabel htmlFor="category">Category</RequiredLabel>
                <Select
                  value={newProject.category}
                  onValueChange={(value) => setNewProject({ ...newProject, category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center">
                          {getCategoryIcon(category.id)}
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.category && <p className="text-xs text-destructive">{formErrors.category}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  placeholder="React, Web Development, UI/UX"
                  value={newProject.tags}
                  onChange={(e) => setNewProject({ ...newProject, tags: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="link">Project Link (optional)</Label>
                <Input
                  id="link"
                  placeholder="https://github.com/yourusername/project"
                  value={newProject.link}
                  onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Project Cover Image</Label>
                <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-md p-6 bg-muted/50">
                  {newProject.imagePreview ? (
                    <div className="relative w-full">
                      <img
                        src={newProject.imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-md"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => setNewProject({ ...newProject, image: null, imagePreview: "" })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">Drag and drop or click to upload</p>
                      <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                        Select Image
                      </Button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Gallery Upload (only shown for Photography category) */}
              {newProject.category === "photography" && (
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label>Photo Gallery</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => galleryInputRef.current?.click()}
                      className="text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add Photos
                    </Button>
                    <input
                      type="file"
                      ref={galleryInputRef}
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryUpload}
                    />
                  </div>

                  {newProject.gallery.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {newProject.gallery.map((item, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={item.preview || "/placeholder.svg"}
                            alt={`Gallery ${index}`}
                            className="w-full h-24 object-cover rounded-md"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeGalleryImage(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed rounded-md p-4 bg-muted/30 text-center">
                      <p className="text-sm text-muted-foreground">
                        No photos added yet. Click "Add Photos" to upload.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  resetProjectForm()
                  setIsAddingProject(false)
                  setIsEditingProject(false)
                  setEditingProjectId(null)
                }}
              >
                Cancel
              </Button>
              <Button onClick={isEditingProject ? handleEditProject : handleAddProject} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditingProject ? "Saving..." : "Adding..."}
                  </>
                ) : isEditingProject ? (
                  "Save Changes"
                ) : (
                  "Add Project"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b mb-8">
            <TabsList className="flex w-full overflow-x-auto py-2 gap-2 justify-start bg-transparent">
              <TabsTrigger
                value="all"
                className="px-4 py-2 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                All Projects
              </TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="px-4 py-2 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap"
                >
                  {getCategoryIcon(category.id)}
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
                    <h3 className="text-lg font-medium mb-2">No projects found</h3>
                    <p className="text-muted-foreground mb-4">Add your first project to get started</p>
                    <Button onClick={() => setIsAddingProject(true)}>
                      <PlusCircle className="h-4 w-4 mr-2" /> Add Project
                    </Button>
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
                          <div className="flex justify-between items-center">
                            <Badge variant="outline" className="bg-background/80 text-foreground">
                              {getCategoryName(project.category)}
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 bg-background/80 text-foreground hover:bg-background"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => startEditProject(project.id)}>
                                  <Edit className="h-4 w-4 mr-2" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => setConfirmDeleteProject(project.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </div>
                    <CardContent className="flex flex-col flex-grow p-5">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                        {getCategoryIcon(project.category)}
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
                        {project.tags.slice(0, 3).map((tag: string, index: number) => (
                          <Badge key={index} variant="secondary" className="font-normal">
                            {tag}
                          </Badge>
                        ))}
                        {project.tags.length > 3 && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Badge variant="outline" className="font-normal cursor-pointer hover:bg-accent transition-colors">
                                +{project.tags.length - 3} more
                              </Badge>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 max-h-60 overflow-y-auto">
                              <div className="font-medium mb-2">All Tags</div>
                              <div className="flex flex-wrap gap-2">
                                {project.tags.map((tag: string, index: number) => (
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
                          <div className="grid grid-cols-3 gap-1">
                            {project.gallery.slice(0, 3).map((image: string, index: number) => (
                              <div key={index} className="relative h-16 rounded-md overflow-hidden">
                                <img
                                  src={image || "/placeholder.svg"}
                                  alt={`Gallery ${index}`}
                                  className="w-full h-24 object-cover rounded-md"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Add Confirmation Dialogs */}
      <ConfirmationDialog
        open={!!confirmDeleteProject}
        onOpenChange={() => setConfirmDeleteProject(null)}
        title="Delete Project"
        description="Are you sure you want to delete this project? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel" 
        onConfirm={() => confirmDeleteProject && deleteProject(confirmDeleteProject)}
      />

      <ConfirmationDialog
        open={!!confirmDeleteCategory}
        onOpenChange={() => setConfirmDeleteCategory(null)}
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => confirmDeleteCategory && deleteCategory(confirmDeleteCategory)}
      />
    </>
  )
}