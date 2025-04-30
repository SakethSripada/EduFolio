"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  DropdownMenu,
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { PlusCircle, Download, Eye, MoreHorizontal, Pencil, Trash2, Check, X, Copy, FileText } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

function getColorClass(color: string | undefined): string {
  if (!color) return "border-indigo-600 dark:border-indigo-400"
  
  const colorMap: Record<string, string> = {
    "#4f46e5": "border-indigo-600 dark:border-indigo-400",
    "#ef4444": "border-red-600 dark:border-red-400",
    "#10b981": "border-emerald-600 dark:border-emerald-400",
    "#6366f1": "border-violet-600 dark:border-violet-400",
    "#f59e0b": "border-amber-600 dark:border-amber-400",
    "#3b82f6": "border-blue-600 dark:border-blue-400"
  }
  
  return colorMap[color] || "border-indigo-600 dark:border-indigo-400"
}

export default function ResumePage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [resumes, setResumes] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("editor")
  const [editingResumeId, setEditingResumeId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")
  const editInputRef = useRef<HTMLInputElement>(null)
  const [exportingResumeId, setExportingResumeId] = useState<string | null>(null)
  const [exportingFormat, setExportingFormat] = useState<"pdf" | "docx" | null>(null)
  const supabase = createClientComponentClient()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // Fetch user's resumes
  useEffect(() => {
    if (user) {
      fetchResumes()
    }
  }, [user])

  // Focus input when editing title
  useEffect(() => {
    if (editingResumeId && editInputRef.current) {
      editInputRef.current.focus()
    }
  }, [editingResumeId])

  const fetchResumes = async () => {
    if (!user) return
    
    const { data, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })

    if (!error && data) {
      setResumes(data)
    }
  }

  // Create a new resume
  const createNewResume = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        title: "New Resume",
        content: {},
        style: {
          fontFamily: "Inter",
          primaryColor: "#4f46e5",
          fontSize: "medium",
          spacing: "comfortable"
        },
        template: "standard"
      })
      .select()

    if (!error && data) {
      router.push(`/resume/${data[0].id}`)
    } else {
      toast({
        title: "Error",
        description: "Failed to create a new resume",
        variant: "destructive"
      })
    }
  }

  // Start editing resume title
  const startEditingTitle = (resumeId: string, title: string) => {
    setEditingResumeId(resumeId)
    setEditingTitle(title)
  }

  // Save edited resume title
  const saveResumeTitle = async (resumeId: string) => {
    if (!editingTitle.trim()) {
      setEditingTitle("Untitled Resume")
    }
    
    const { error } = await supabase
      .from("resumes")
      .update({ title: editingTitle.trim() })
      .eq("id", resumeId)
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to update resume title",
        variant: "destructive"
      })
    } else {
      fetchResumes()
    }
    
    setEditingResumeId(null)
  }

  // Cancel editing resume title
  const cancelEditingTitle = () => {
    setEditingResumeId(null)
  }

  // Delete a resume
  const deleteResume = async (resumeId: string) => {
    const { error } = await supabase
      .from("resumes")
      .delete()
      .eq("id", resumeId)
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete resume",
        variant: "destructive"
      })
    } else {
      fetchResumes()
      toast({
        title: "Success",
        description: "Resume deleted successfully",
        variant: "default"
      })
    }
  }

  // Handle keydown event when editing title
  const handleKeyDown = (e: React.KeyboardEvent, resumeId: string) => {
    if (e.key === 'Enter') {
      saveResumeTitle(resumeId)
    } else if (e.key === 'Escape') {
      cancelEditingTitle()
    }
  }

  // Create resume with specific template
  const createResumeWithTemplate = async (template: string) => {
    if (!user) return

    const { data, error } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        title: `${template} Resume`,
        content: {},
        style: {
          fontFamily: "Inter",
          primaryColor: template === "Professional" ? "#4f46e5" : 
                       template === "Modern" ? "#8b5cf6" : 
                       "#10b981",
          fontSize: "medium",
          spacing: "comfortable"
        },
        template: template.toLowerCase()
      })
      .select()

    if (!error && data) {
      router.push(`/resume/${data[0].id}`)
    }
  }

  // Make a copy of an existing resume
  const duplicateResume = async (resumeId: string) => {
    // Find the resume to duplicate
    const resumeToCopy = resumes.find(r => r.id === resumeId)
    if (!resumeToCopy || !user) return
    
    try {
      // Create a new title with " (Copy)" appended
      const newTitle = `${resumeToCopy.title} (Copy)`
      
      // Create a copy with the same content and style
      const { data, error } = await supabase
        .from("resumes")
        .insert({
          user_id: user.id,
          title: newTitle,
          content: resumeToCopy.content || {},
          style: resumeToCopy.style || {
            fontFamily: "Inter",
            primaryColor: "#4f46e5",
            fontSize: "medium",
            spacing: "comfortable"
          },
          template: resumeToCopy.template || "standard",
          settings: resumeToCopy.settings || {}
        })
        .select()

      if (error) {
        throw error
      }
      
      toast({
        title: "Resume Duplicated",
        description: "A copy of your resume has been created",
        duration: 3000
      })
      
      // Refresh the list
      fetchResumes()
    } catch (error) {
      console.error("Error duplicating resume:", error)
      toast({
        title: "Error",
        description: "Failed to duplicate the resume",
        variant: "destructive",
        duration: 3000
      })
    }
  }

  // Export resume
  const exportResume = async (resumeId: string, format: "pdf" | "docx") => {
    setExportingResumeId(resumeId)
    setExportingFormat(format)
    
    try {
      if (format === "pdf") {
        // For PDF, use html2canvas and jsPDF
        const { jsPDF } = await import('jspdf')
        const html2canvas = (await import('html2canvas')).default
        
        // Create a hidden div for the resume to render
        const resumeContainer = document.createElement('div')
        resumeContainer.style.position = 'absolute'
        resumeContainer.style.left = '-9999px'
        resumeContainer.style.width = '816px' // Standard page width
        resumeContainer.style.backgroundColor = 'white'
        resumeContainer.style.padding = '40px'
        document.body.appendChild(resumeContainer)
        
        // Find the resume to export
        const resumeToExport = resumes.find(r => r.id === resumeId)
        if (!resumeToExport) throw new Error("Resume not found")
        
        // Render the resume preview in the hidden div
        // We're using a simple version since we can't use React components directly
        resumeContainer.innerHTML = `
          <div style="font-family: ${resumeToExport.style?.fontFamily || 'Arial'}; text-align: center; margin-bottom: 24px;">
            <h1 style="font-size: 24px; font-weight: bold;">${resumeToExport.content?.personalInfo?.fullName || 'Resume'}</h1>
            ${resumeToExport.content?.personalInfo?.title ? `<p style="color: #666;">${resumeToExport.content.personalInfo.title}</p>` : ''}
            <div style="display: flex; justify-content: center; flex-wrap: wrap; gap: 16px; margin-top: 12px; font-size: 12px;">
              ${resumeToExport.content?.personalInfo?.email ? `<span>${resumeToExport.content.personalInfo.email}</span>` : ''}
              ${resumeToExport.content?.personalInfo?.phone ? `<span>${resumeToExport.content.personalInfo.phone}</span>` : ''}
              ${resumeToExport.content?.personalInfo?.location ? `<span>${resumeToExport.content.personalInfo.location}</span>` : ''}
            </div>
          </div>
          ${resumeToExport.content?.summary ? `
            <div style="margin-bottom: 16px;">
              <h2 style="font-size: 18px; font-weight: bold; padding-bottom: 4px; border-bottom: 1px solid #ccc; margin-bottom: 12px;">Professional Summary</h2>
              <p>${resumeToExport.content.summary}</p>
            </div>
          ` : ''}
          ${resumeToExport.content?.experience?.length ? `
            <div style="margin-bottom: 16px;">
              <h2 style="font-size: 18px; font-weight: bold; padding-bottom: 4px; border-bottom: 1px solid #ccc; margin-bottom: 12px;">Work Experience</h2>
              <div>
                ${resumeToExport.content.experience.map((exp: any) => `
                  <div style="margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between;">
                      <div>
                        <h3 style="font-weight: 600;">${exp.position}</h3>
                        <p>${exp.company}${exp.location ? `, ${exp.location}` : ''}</p>
                      </div>
                      <div style="text-align: right; font-size: 12px; color: #666;">
                        ${exp.startDate ? `${exp.startDate} - ${exp.isCurrent ? 'Present' : exp.endDate}` : ''}
                      </div>
                    </div>
                    ${exp.description ? `<p style="margin-top: 8px; font-size: 12px;">${exp.description}</p>` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
          ${resumeToExport.content?.skills?.length ? `
            <div style="margin-bottom: 16px;">
              <h2 style="font-size: 18px; font-weight: bold; padding-bottom: 4px; border-bottom: 1px solid #ccc; margin-bottom: 12px;">Skills</h2>
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${resumeToExport.content.skills.map((skill: any) => `
                  <span style="padding: 4px 8px; background-color: #f1f1f1; border-radius: 4px; font-size: 12px;">${skill.name}</span>
                `).join('')}
              </div>
            </div>
          ` : ''}
        `
        
        // Wait for fonts to load
        await document.fonts.ready
        
        // Convert to PDF
        const canvas = await html2canvas(resumeContainer, {
          scale: 2,
          useCORS: true,
          logging: false
        } as any)
        
        document.body.removeChild(resumeContainer)
        
        const imgData = canvas.toDataURL('image/jpeg', 1.0)
        const pdf = new jsPDF('p', 'mm', 'a4')
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = pdf.internal.pageSize.getHeight()
        
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight)
        pdf.save(`${resumeToExport.title || 'resume'}.pdf`)
      } else if (format === "docx") {
        // For DOCX, use docx library
        const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import('docx')
        
        // Find the resume to export
        const resumeToExport = resumes.find(r => r.id === resumeId)
        if (!resumeToExport) throw new Error("Resume not found")
        
        const content = resumeToExport.content || {}
        const personalInfo = content.personalInfo || {}
        const experience = content.experience || []
        const education = content.education || []
        const skills = content.skills || []
        
        // Create document
        const doc = new Document({
          sections: [{
            properties: {},
            children: [
              // Name
              new Paragraph({
                text: personalInfo.fullName || "Resume",
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER,
              }),
              
              // Title
              personalInfo.title ? new Paragraph({
                text: personalInfo.title,
                alignment: AlignmentType.CENTER,
              }) : new Paragraph({}),
              
              // Contact info
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun(personalInfo.email || ""),
                  personalInfo.phone ? new TextRun({ text: ` | ${personalInfo.phone}`, break: !personalInfo.email as any }) : new TextRun(""),
                  personalInfo.location ? new TextRun({ text: ` | ${personalInfo.location}`, break: (!personalInfo.email && !personalInfo.phone) as any }) : new TextRun(""),
                ]
              }),
              
              // Summary
              content.summary ? new Paragraph({
                text: "Professional Summary",
                heading: HeadingLevel.HEADING_2,
                thematicBreak: true,
                spacing: {
                  before: 400,
                  after: 200
                }
              }) : new Paragraph({}),
              
              content.summary ? new Paragraph({
                text: content.summary
              }) : new Paragraph({}),
              
              // Experience
              experience.length > 0 ? new Paragraph({
                text: "Work Experience",
                heading: HeadingLevel.HEADING_2,
                thematicBreak: true,
                spacing: {
                  before: 400,
                  after: 200
                }
              }) : new Paragraph({}),
              
              // Experience items
              ...experience.flatMap((exp: any) => [
                new Paragraph({
                  text: exp.position,
                  heading: HeadingLevel.HEADING_3,
                  spacing: {
                    before: 300
                  }
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: exp.company, bold: true }),
                    exp.location ? new TextRun({ text: `, ${exp.location}` }) : new TextRun(""),
                    exp.startDate ? new TextRun({ text: ` | ${exp.startDate} - ${exp.isCurrent ? 'Present' : exp.endDate}` }) : new TextRun("")
                  ]
                }),
                exp.description ? new Paragraph({
                  text: exp.description,
                  spacing: {
                    before: 100,
                    after: 200
                  }
                }) : new Paragraph({})
              ]),
              
              // Education
              education.length > 0 ? new Paragraph({
                text: "Education",
                heading: HeadingLevel.HEADING_2,
                thematicBreak: true,
                spacing: {
                  before: 400,
                  after: 200
                }
              }) : new Paragraph({}),
              
              // Education items
              ...education.flatMap((edu: any) => [
                new Paragraph({
                  text: edu.institution,
                  heading: HeadingLevel.HEADING_3,
                  spacing: {
                    before: 300
                  }
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: edu.degree, bold: true }),
                    edu.fieldOfStudy ? new TextRun({ text: ` in ${edu.fieldOfStudy}` }) : new TextRun(""),
                    edu.startDate ? new TextRun({ text: ` | ${edu.startDate} - ${edu.isCurrent ? 'Present' : edu.endDate}` }) : new TextRun("")
                  ]
                }),
                edu.description ? new Paragraph({
                  text: edu.description,
                  spacing: {
                    before: 100,
                    after: 200
                  }
                }) : new Paragraph({})
              ]),
              
              // Skills
              skills.length > 0 ? new Paragraph({
                text: "Skills",
                heading: HeadingLevel.HEADING_2,
                thematicBreak: true,
                spacing: {
                  before: 400,
                  after: 200
                }
              }) : new Paragraph({}),
              
              // Skills items (comma-separated)
              skills.length > 0 ? new Paragraph({
                text: skills.map((skill: any) => skill.name).join(", "),
              }) : new Paragraph({})
            ]
          }]
        })
        
        // Generate and save document
        Packer.toBlob(doc).then((blob: Blob) => {
          const link = document.createElement('a')
          const url = URL.createObjectURL(blob)
          link.href = url
          link.download = `${resumeToExport.title || 'resume'}.docx`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        })
      }
      
      toast({
        title: "Export Successful",
        description: `Resume exported as ${format.toUpperCase()}`,
        duration: 3000
      })
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Export Failed",
        description: "There was an error exporting your resume",
        variant: "destructive",
        duration: 3000
      })
    } finally {
      setExportingResumeId(null)
      setExportingFormat(null)
    }
  }

  // Handle dialog close
  const handleDialogClose = () => {
    setExportingResumeId(null)
    setExportingFormat(null)
  }

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="w-full h-screen flex items-center justify-center">
          <div className="animate-pulse text-2xl">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <main className="container py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resume Builder</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your professional resumes
          </p>
        </div>
        <Button onClick={createNewResume} size="lg" className="gap-1">
          <PlusCircle className="h-4 w-4" />
          Create New Resume
        </Button>
      </div>

      <Tabs defaultValue="resumes" className="space-y-6">
        <div className="border-b">
          <div className="container mx-auto">
            <TabsList className="mx-auto justify-start -mb-px h-10">
              <TabsTrigger value="resumes" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">My Resumes</TabsTrigger>
              <TabsTrigger value="templates" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Templates</TabsTrigger>
            </TabsList>
          </div>
        </div>
        
        <TabsContent value="resumes" className="space-y-4">
          {resumes.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 bg-muted/20 rounded-lg border border-dashed">
              <div className="w-16 h-16 bg-muted flex items-center justify-center rounded-full mb-4">
                <PlusCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">No resumes yet</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                Create your first professional resume and easily customize it for different job applications.
              </p>
              <Button onClick={createNewResume} size="lg" className="gap-1">
                <PlusCircle className="h-4 w-4" />
                Create Your First Resume
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resumes.map((resume) => (
                <Card key={resume.id} className="overflow-hidden border group hover:border-primary/50 transition-all hover:shadow-md">
                  <CardHeader className="p-5 space-y-0 flex flex-row items-start justify-between">
                    {editingResumeId === resume.id ? (
                      <div className="flex items-center gap-2 flex-grow">
                        <Input 
                          ref={editInputRef}
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, resume.id)}
                          className="h-8"
                        />
                        <div className="flex items-center">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-green-600"
                            onClick={() => saveResumeTitle(resume.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-red-600"
                            onClick={cancelEditingTitle}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <CardTitle className="text-lg mb-1 flex items-center gap-2">
                            {resume.title}
                          </CardTitle>
                          <CardDescription>
                            Last updated: {new Date(resume.updated_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              className="cursor-pointer gap-2"
                              onClick={() => startEditingTitle(resume.id, resume.title)}
                            >
                              <Pencil className="h-4 w-4" /> Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer gap-2"
                              onClick={() => duplicateResume(resume.id)}
                            >
                              <Copy className="h-4 w-4" /> Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive cursor-pointer gap-2"
                              onClick={() => deleteResume(resume.id)}
                            >
                              <Trash2 className="h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    )}
                  </CardHeader>
                  <div className="px-5 pb-5">
                    <div className="h-40 bg-muted/20 border rounded-md flex items-center justify-center cursor-pointer"
                         onClick={() => router.push(`/resume/${resume.id}`)}>
                      <div 
                        className="w-full max-w-[160px] h-32 rounded shadow-sm mx-auto"
                        style={{ 
                          backgroundColor: resume.style?.backgroundColor || 'white',
                          color: resume.style?.backgroundColor === '#1f2937' ? 'white' : 'inherit'
                        }}
                      >
                        {/* Preview thumbnail with actual resume content */}
                        <div className="p-2 overflow-hidden text-[6px] max-h-full" style={{ fontFamily: resume.style?.fontFamily || 'Inter' }}>
                          {resume.content?.personalInfo?.fullName && (
                            <div className="text-center">
                              <div className="font-bold text-[8px]">{resume.content.personalInfo.fullName}</div>
                              {resume.content.personalInfo.title && (
                                <div className="text-muted-foreground text-[5px]">{resume.content.personalInfo.title}</div>
                              )}
                            </div>
                          )}
                          
                          {resume.content?.summary && (
                            <>
                              <div className={`font-bold mt-1 pb-[2px] text-[7px] border-b ${getColorClass(resume.style?.primaryColor)}`}>
                                Summary
                              </div>
                              <div className="truncate text-[5px]">{resume.content.summary}</div>
                            </>
                          )}
                          
                          {resume.content?.experience && resume.content.experience.length > 0 && (
                            <>
                              <div className={`font-bold mt-1 pb-[2px] text-[7px] border-b ${getColorClass(resume.style?.primaryColor)}`}>
                                Experience
                              </div>
                              {resume.content.experience.slice(0, 1).map((exp: any) => (
                                <div key={exp.id} className="text-[5px]">
                                  <div className="font-semibold truncate">{exp.position}</div>
                                  <div className="truncate">{exp.company}</div>
                                </div>
                              ))}
                            </>
                          )}
                          
                          {resume.content?.education && resume.content.education.length > 0 && (
                            <>
                              <div className={`font-bold mt-1 pb-[2px] text-[7px] border-b ${getColorClass(resume.style?.primaryColor)}`}>
                                Education
                              </div>
                              {resume.content.education.slice(0, 1).map((edu: any) => (
                                <div key={edu.id} className="text-[5px]">
                                  <div className="font-semibold truncate">{edu.institution}</div>
                                  <div className="truncate">{edu.degree}</div>
                                </div>
                              ))}
                            </>
                          )}
                          
                          {resume.content?.skills && resume.content.skills.length > 0 && (
                            <>
                              <div className={`font-bold mt-1 pb-[2px] text-[7px] border-b ${getColorClass(resume.style?.primaryColor)}`}>
                                Skills
                              </div>
                              <div className="flex flex-wrap gap-[2px]">
                                {resume.content.skills.slice(0, 3).map((skill: any) => (
                                  <span key={skill.id} className="px-1 bg-muted rounded text-[4px]">{skill.name}</span>
                                ))}
                                {resume.content.skills.length > 3 && <span className="text-[4px]">...</span>}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardFooter className="bg-muted/10 py-3 px-5 flex justify-between">
                    <Button size="sm" variant="ghost" onClick={() => router.push(`/resume/${resume.id}`)} className="gap-1">
                      <Eye className="h-4 w-4" /> Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="gap-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        setExportingResumeId(resume.id)
                      }}
                    >
                      <Download className="h-4 w-4" /> Export
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="overflow-hidden border hover:border-primary/50 transition-all hover:shadow-md">
              <CardHeader className="p-5">
                <CardTitle className="text-lg">Professional</CardTitle>
                <CardDescription>A clean, traditional resume format</CardDescription>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="h-52 bg-muted/20 border rounded-md flex items-center justify-center">
                  <div className="w-full max-w-[180px] h-40 bg-white dark:bg-gray-800 rounded shadow-sm mx-auto p-3">
                    <div className="border-b border-indigo-500 pb-2 mb-2">
                      <div className="w-20 h-2.5 bg-indigo-500/80 mb-2 rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full h-1 bg-gray-400/50 rounded"></div>
                      <div className="w-full h-1 bg-gray-400/50 rounded"></div>
                      <div className="w-3/4 h-1 bg-gray-400/50 rounded"></div>
                    </div>
                    <div className="border-b border-indigo-500 pb-1 pt-3 mb-2">
                      <div className="w-20 h-2.5 bg-indigo-500/80 rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full h-1 bg-gray-400/50 rounded"></div>
                      <div className="w-full h-1 bg-gray-400/50 rounded"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/10 p-5 flex justify-center">
                <Button onClick={() => createResumeWithTemplate("Professional")} className="w-full">Use Template</Button>
              </CardFooter>
            </Card>
            
            <Card className="overflow-hidden border hover:border-primary/50 transition-all hover:shadow-md">
              <CardHeader className="p-5">
                <CardTitle className="text-lg">Modern</CardTitle>
                <CardDescription>A creative, contemporary design</CardDescription>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="h-52 bg-muted/20 border rounded-md flex items-center justify-center">
                  <div className="w-full max-w-[180px] h-40 bg-white dark:bg-gray-800 rounded shadow-sm mx-auto p-3 relative">
                    <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-purple-500/70"></div>
                    <div>
                      <div className="w-20 h-2.5 bg-purple-500/80 mb-1 rounded"></div>
                      <div className="w-16 h-1.5 bg-gray-500/70 mb-3 rounded"></div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="w-full flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500/70 mt-0.5"></div>
                        <div className="w-full h-1 bg-gray-400/50 rounded my-auto"></div>
                      </div>
                      <div className="w-full flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500/70 mt-0.5"></div>
                        <div className="w-full h-1 bg-gray-400/50 rounded my-auto"></div>
                      </div>
                      <div className="w-full flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500/70 mt-0.5"></div>
                        <div className="w-3/4 h-1 bg-gray-400/50 rounded my-auto"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/10 p-5 flex justify-center">
                <Button onClick={() => createResumeWithTemplate("Modern")} className="w-full">Use Template</Button>
              </CardFooter>
            </Card>
            
            <Card className="overflow-hidden border hover:border-primary/50 transition-all hover:shadow-md">
              <CardHeader className="p-5">
                <CardTitle className="text-lg">Academic</CardTitle>
                <CardDescription>Ideal for educational backgrounds</CardDescription>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="h-52 bg-muted/20 border rounded-md flex items-center justify-center">
                  <div className="w-full max-w-[180px] h-40 bg-white dark:bg-gray-800 rounded shadow-sm mx-auto p-3">
                    <div className="flex justify-between mb-2">
                      <div className="w-20 h-2.5 bg-emerald-600/70 rounded"></div>
                      <div className="w-10 h-2.5 bg-emerald-600/70 rounded"></div>
                    </div>
                    <div className="border-l-2 border-emerald-600/70 pl-2 mb-2">
                      <div className="w-full h-1 bg-gray-400/50 mb-1 rounded"></div>
                      <div className="w-full h-1 bg-gray-400/50 mb-1 rounded"></div>
                      <div className="w-3/4 h-1 bg-gray-400/50 rounded"></div>
                    </div>
                    <div className="border-l-2 border-emerald-600/70 pl-2 mt-3">
                      <div className="w-full h-1 bg-gray-400/50 mb-1 rounded"></div>
                      <div className="w-full h-1 bg-gray-400/50 mb-1 rounded"></div>
                      <div className="w-1/2 h-1 bg-gray-400/50 rounded"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/10 p-5 flex justify-center">
                <Button onClick={() => createResumeWithTemplate("Academic")} className="w-full">Use Template</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!exportingResumeId} onOpenChange={(open) => {
        if (!open) {
          handleDialogClose()
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export Resume</DialogTitle>
            <DialogDescription>
              Choose a format to export your resume
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button 
              variant="outline" 
              className="flex flex-col items-center justify-center h-24 p-4"
              onClick={() => exportingResumeId && exportResume(exportingResumeId, "pdf")}
              disabled={!!exportingFormat}
            >
              <Download className="h-8 w-8 mb-2" />
              <span>PDF</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center justify-center h-24 p-4"
              onClick={() => exportingResumeId && exportResume(exportingResumeId, "docx")}
              disabled={!!exportingFormat}
            >
              <FileText className="h-8 w-8 mb-2" />
              <span>DOCX</span>
            </Button>
          </div>
          {exportingFormat && (
            <div className="flex items-center justify-center py-2">
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
              <span>Preparing {exportingFormat.toUpperCase()}...</span>
            </div>
          )}
          <DialogFooter className="sm:justify-center">
            <Button 
              variant="ghost" 
              onClick={handleDialogClose}
              disabled={!!exportingFormat}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
} 