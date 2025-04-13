"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Code, FileText, Briefcase, Lightbulb, ImageIcon, Camera, ExternalLink, Github, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function SharedPortfolioPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("all")
  const [viewingGallery, setViewingGallery] = useState<{
    isOpen: boolean
    project: any
    activeIndex: number
  }>({
    isOpen: false,
    project: null,
    activeIndex: 0,
  })

  // This would normally be fetched from an API using the share ID
  const [portfolio, setPortfolio] = useState({
    owner: {
      name: "Jane Smith",
      avatar: "/placeholder.svg?height=100&width=100",
    },
    projects: [
      {
        id: "1",
        title: "Machine Learning Research Paper",
        description: "Published research on neural networks for image recognition with 95% accuracy.",
        category: "research",
        tags: ["Machine Learning", "Neural Networks", "Computer Vision"],
        link: "https://example.com/paper",
        image: "/placeholder.svg?height=400&width=600",
        gallery: [],
        date: "March 2025",
      },
      {
        id: "2",
        title: "E-commerce Website",
        description: "Developed a full-stack e-commerce platform with React, Node.js, and MongoDB.",
        category: "coding",
        tags: ["React", "Node.js", "MongoDB", "Full-Stack"],
        link: "https://github.com/username/ecommerce",
        image: "/placeholder.svg?height=400&width=600",
        gallery: [],
        date: "February 2025",
      },
      {
        id: "5",
        title: "Nature Photography Collection",
        description: "A series of landscape and wildlife photographs taken during travels across national parks.",
        category: "photography",
        tags: ["Nature", "Wildlife", "Landscape", "Photography"],
        link: "",
        image: "/placeholder.svg?height=400&width=600",
        gallery: [
          "/placeholder.svg?height=800&width=1200",
          "/placeholder.svg?height=800&width=1200",
          "/placeholder.svg?height=800&width=1200",
          "/placeholder.svg?height=800&width=1200",
          "/placeholder.svg?height=800&width=1200",
        ],
        date: "November 2024",
      },
    ],
    categories: [
      { id: "coding", name: "Coding", icon: <Code className="h-4 w-4 mr-2" /> },
      { id: "research", name: "Research", icon: <FileText className="h-4 w-4 mr-2" /> },
      { id: "business", name: "Business", icon: <Briefcase className="h-4 w-4 mr-2" /> },
      { id: "engineering", name: "Engineering", icon: <Lightbulb className="h-4 w-4 mr-2" /> },
      { id: "art", name: "Art & Design", icon: <ImageIcon className="h-4 w-4 mr-2" /> },
      { id: "photography", name: "Photography", icon: <Camera className="h-4 w-4 mr-2" /> },
    ],
  })

  const filteredProjects =
    activeTab === "all" ? portfolio.projects : portfolio.projects.filter((project) => project.category === activeTab)

  const getCategoryIcon = (categoryId: string) => {
    const category = portfolio.categories.find((c) => c.id === categoryId)
    return category?.icon || <FileText className="h-5 w-5" />
  }

  const getCategoryName = (categoryId: string) => {
    const category = portfolio.categories.find((c) => c.id === categoryId)
    return category?.name || categoryId.charAt(0).toUpperCase() + categoryId.slice(1)
  }

  const openGallery = (project: any, index = 0) => {
    setViewingGallery({
      isOpen: true,
      project,
      activeIndex: index,
    })
  }

  const nextImage = () => {
    if (!viewingGallery.project) return
    setViewingGallery({
      ...viewingGallery,
      activeIndex: (viewingGallery.activeIndex + 1) % viewingGallery.project.gallery.length,
    })
  }

  const prevImage = () => {
    if (!viewingGallery.project) return
    setViewingGallery({
      ...viewingGallery,
      activeIndex:
        (viewingGallery.activeIndex - 1 + viewingGallery.project.gallery.length) %
        viewingGallery.project.gallery.length,
    })
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="mb-8">
        <Link href="/" className="text-primary hover:underline inline-flex items-center mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to EduFolio
        </Link>

        <div className="flex items-center gap-4 mb-6">
          <img
            src={portfolio.owner.avatar || "/placeholder.svg"}
            alt={portfolio.owner.name}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <h1 className="text-3xl font-bold">{portfolio.owner.name}'s Portfolio</h1>
            <p className="text-muted-foreground">Shared portfolio</p>
          </div>
        </div>
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
                      {getCategoryIcon(project.category)}
                      <span>{project.date}</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 line-clamp-1">{project.title}</h3>
                    <p className="text-muted-foreground mb-4 line-clamp-2">{project.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="font-normal">
                          {tag}
                        </Badge>
                      ))}
                      {project.tags.length > 3 && (
                        <Badge variant="outline" className="font-normal">
                          +{project.tags.length - 3} more
                        </Badge>
                      )}
                    </div>

                    {/* Photography Gallery Preview */}
                    {project.category === "photography" && project.gallery.length > 0 && (
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
                              {index === 2 && project.gallery.length > 3 && (
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

      {/* Gallery Viewer Dialog */}
      <Dialog
        open={viewingGallery.isOpen}
        onOpenChange={(open) => {
          if (!open) setViewingGallery({ ...viewingGallery, isOpen: false })
        }}
      >
        <DialogContent className="w-full max-w-[90vw] sm:max-w-[800px] p-0 overflow-hidden">
          <DialogHeader className="p-4 absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent">
            <DialogTitle className="text-white">{viewingGallery.project?.title}</DialogTitle>
          </DialogHeader>
          {viewingGallery.project && (
            <div className="relative">
              <img
                src={viewingGallery.project.gallery[viewingGallery.activeIndex] || "/placeholder.svg"}
                alt={`Gallery image ${viewingGallery.activeIndex + 1}`}
                className="w-full h-[70vh] object-contain"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex justify-between items-center">
                  <Button variant="ghost" className="text-white hover:bg-white/20" onClick={prevImage}>
                    Previous
                  </Button>
                  <span className="text-white">
                    {viewingGallery.activeIndex + 1} / {viewingGallery.project.gallery.length}
                  </span>
                  <Button variant="ghost" className="text-white hover:bg-white/20" onClick={nextImage}>
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
