"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Download, ArrowLeft, Save, FileText, Settings, Palette } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import ResumeEditor from "@/components/resume/ResumeEditor"
import ResumePreview from "@/components/resume/ResumePreview"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import React from "react"

// These are needed to fix type errors in the DOCX export
type TextRunOptions = {
  text: string;
  bold?: boolean;
  break?: number;
}

export default function ResumeEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading } = useAuth()
  const [resume, setResume] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [activeTab, setActiveTab] = useState("content")
  const [exporting, setExporting] = useState(false)
  const resumePreviewRef = useRef<HTMLDivElement>(null)
  const supabase = createClientComponentClient()
  
  // Get resumeId directly from params
  const resumeId = React.use(params).id

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // Fetch resume data
  useEffect(() => {
    if (user && resumeId) {
      const fetchResume = async () => {
        setLoading(true)
        
        const { data, error } = await supabase
          .from("resumes")
          .select("*")
          .eq("id", resumeId)
          .eq("user_id", user.id)
          .single()
        
        if (error) {
          console.error("Error fetching resume:", error)
          router.push("/resume")
          return
        }
        
        if (data) {
          // Initialize style if not present
          if (!data.style) {
            data.style = {
              fontFamily: "Inter",
              primaryColor: "#4f46e5",
              fontSize: "medium",
              spacing: "comfortable",
              backgroundColor: "#ffffff",
              textColor: "#000000"
            }
          }
          setResume(data)
        } else {
          router.push("/resume")
        }
        
        setLoading(false)
      }

      fetchResume()
    }
  }, [user, resumeId, supabase, router])

  // Auto-save when resume changes (debounced)
  useEffect(() => {
    if (!resume) return
    
    const saveTimer = setTimeout(async () => {
      await saveResume()
    }, 1000)
    
    return () => clearTimeout(saveTimer)
  }, [resume])

  // Check for export param in URL
  useEffect(() => {
    const shouldExport = searchParams.get('export')
    if (shouldExport === 'true' && resume && !exporting) {
      // Wait for resume data to be loaded
      const timer = setTimeout(() => {
        exportToPdf()
        // Remove the export param from the URL to prevent repeated downloads
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.delete('export')
        window.history.replaceState({}, '', newUrl.toString())
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [resume, searchParams, exporting])

  const updateResume = async (field: string, value: any) => {
    if (!resume) return

    setResume({
      ...resume,
      [field]: value,
      updated_at: new Date().toISOString()
    })
    
    setSaveStatus("idle")
  }

  const updateStyle = (key: string, value: any) => {
    if (!resume) return
    
    const updatedStyle = {
      ...resume.style,
      [key]: value
    }
    
    updateResume("style", updatedStyle)
  }

  const saveResume = async () => {
    if (!resume) return

    setSaveStatus("saving")
    
    const { error } = await supabase
      .from("resumes")
      .update(resume)
      .eq("id", resume.id)
    
    if (error) {
      console.error("Error saving resume:", error)
      setSaveStatus("error")
    } else {
      setSaveStatus("saved")
      
      // Reset save status after 3 seconds
      setTimeout(() => {
        setSaveStatus("idle")
      }, 3000)
    }
  }

  // Export resume to PDF
  const exportToPdf = async () => {
    if (!resumePreviewRef.current) return
    
    try {
      setExporting(true)
      
      // Dynamically import jsPDF and html2canvas
      const { jsPDF } = await import('jspdf')
      const html2canvas = (await import('html2canvas')).default
      
      const canvas = await html2canvas(resumePreviewRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      } as any)
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0)
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`${resume.title || 'resume'}.pdf`)
      
      toast({
        title: "Success",
        description: "PDF exported successfully",
        duration: 3000
      })
    } catch (error) {
      console.error("PDF export error:", error)
      toast({
        title: "Export Failed",
        description: "There was an error exporting your resume to PDF",
        variant: "destructive",
        duration: 3000
      })
    } finally {
      setExporting(false)
    }
  }

  // Export resume to DOCX
  const exportToDocx = async () => {
    if (!resume) return
    
    try {
      setExporting(true)
      
      // Dynamically import docx library
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import('docx')
      
      const content = resume.content || {}
      const personalInfo = content.personalInfo || {}
      const experience = content.experience || []
      const education = content.education || []
      const skills = content.skills || []
      
      // Helper function to create a text run with proper types
      const createTextRun = (options: TextRunOptions) => {
        const { text, bold, break: lineBreak } = options
        return new TextRun({
          text,
          bold,
          break: lineBreak
        })
      }
      
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
                createTextRun({ text: personalInfo.email || "" }),
                personalInfo.phone ? 
                  createTextRun({ 
                    text: ` | ${personalInfo.phone}`, 
                    break: !personalInfo.email ? 1 : 0 
                  }) : 
                  createTextRun({ text: "" }),
                personalInfo.location ? 
                  createTextRun({ 
                    text: ` | ${personalInfo.location}`, 
                    break: (!personalInfo.email && !personalInfo.phone) ? 1 : 0 
                  }) : 
                  createTextRun({ text: "" }),
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
        link.download = `${resume.title || 'resume'}.docx`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        toast({
          title: "Success",
          description: "DOCX exported successfully",
          duration: 3000
        })
      })
    } catch (error) {
      console.error("DOCX export error:", error)
      toast({
        title: "Export Failed",
        description: "There was an error exporting your resume to DOCX",
        variant: "destructive",
        duration: 3000
      })
    } finally {
      setExporting(false)
    }
  }

  if (loading || isLoading) {
    return (
      <div className="container py-10">
        <div className="w-full h-screen flex flex-col items-center justify-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
          <div className="text-xl font-medium">Loading Resume Editor...</div>
          <p className="text-muted-foreground mt-2">Please wait while we prepare your resume</p>
        </div>
      </div>
    )
  }

  if (!resume) {
    return (
      <div className="container py-10">
        <div className="w-full h-screen flex items-center justify-center">
          <div className="text-2xl">Resume not found</div>
        </div>
      </div>
    )
  }

  const style = resume.style || {}

  return (
    <main className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2"
            onClick={() => router.push("/resume")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <Input
            value={resume.title}
            onChange={(e) => updateResume("title", e.target.value)}
            className="text-xl font-bold h-10 w-72 border-none focus-visible:ring-transparent"
          />
        </div>
        <div className="flex gap-2 items-center">
          {saveStatus === "saving" && (
            <span className="flex items-center text-xs text-muted-foreground">
              <div className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full mr-1"></div>
              Saving...
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="flex items-center text-xs text-green-600 dark:text-green-400">
              <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Saved
            </span>
          )}
          {saveStatus === "error" && (
            <span className="flex items-center text-xs text-red-600 dark:text-red-400">
              <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Error saving
            </span>
          )}
          <Button onClick={saveResume} variant="default" disabled={saveStatus === "saving"}>
            {saveStatus === "saving" ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-1"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" /> Save
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={exportToPdf} 
            disabled={exporting}
          >
            {exporting ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-1"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-1" /> Export PDF
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={exportToDocx} 
            disabled={exporting}
          >
            {exporting ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-1"></div>
                Exporting...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-1" /> Export DOCX
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-6 lg:col-span-5 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="content" className="flex items-center gap-1">
                Content
              </TabsTrigger>
              <TabsTrigger value="style" className="flex items-center gap-1">
                <Palette className="h-4 w-4" /> Style
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-1">
                <Settings className="h-4 w-4" /> Settings
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="content" className="space-y-4 pt-4 h-[calc(100vh-250px)] overflow-y-auto pr-2">
              <ResumeEditor resume={resume} onUpdate={updateResume} />
            </TabsContent>
            
            <TabsContent value="style" className="space-y-4 pt-4 h-[calc(100vh-250px)] overflow-y-auto pr-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-medium">Theme & Layout</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="fontFamily">Font Family</Label>
                    <Select 
                      value={style.fontFamily || "Inter"} 
                      onValueChange={(value) => updateStyle("fontFamily", value)}
                    >
                      <SelectTrigger id="fontFamily">
                        <SelectValue placeholder="Select font" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter">Inter (Modern Sans-Serif)</SelectItem>
                        <SelectItem value="Merriweather">Merriweather (Elegant Serif)</SelectItem>
                        <SelectItem value="Roboto">Roboto (Clean Sans-Serif)</SelectItem>
                        <SelectItem value="Playfair Display">Playfair Display (Classic Serif)</SelectItem>
                        <SelectItem value="Montserrat">Montserrat (Contemporary)</SelectItem>
                        <SelectItem value="Lora">Lora (Modern Serif)</SelectItem>
                        <SelectItem value="Source Sans Pro">Source Sans Pro (Professional)</SelectItem>
                        <SelectItem value="Courier New">Courier New (Monospace)</SelectItem>
                        <SelectItem value="Georgia">Georgia (Traditional)</SelectItem>
                        <SelectItem value="Arial">Arial (Standard)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Section Header Style</Label>
                    <Select 
                      value={style.headerStyle || "underline"} 
                      onValueChange={(value) => updateStyle("headerStyle", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Header style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="underline">Underlined</SelectItem>
                        <SelectItem value="bold">Bold</SelectItem>
                        <SelectItem value="colored">Colored</SelectItem>
                        <SelectItem value="uppercase">Uppercase</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Section Dividers</Label>
                    <Select 
                      value={style.sectionDivider || "none"} 
                      onValueChange={(value) => updateStyle("sectionDivider", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Divider style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="line">Thin Line</SelectItem>
                        <SelectItem value="spacer">Spacer</SelectItem>
                        <SelectItem value="dot">Dotted Line</SelectItem>
                        <SelectItem value="dash">Dashed Line</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="grid grid-cols-6 gap-2">
                      {[
                        "#4f46e5", // Indigo
                        "#3b82f6", // Blue
                        "#0ea5e9", // Sky
                        "#10b981", // Emerald 
                        "#22c55e", // Green
                        "#84cc16", // Lime
                        "#eab308", // Yellow
                        "#f59e0b", // Amber
                        "#ef4444", // Red
                        "#ec4899", // Pink
                        "#8b5cf6", // Violet
                        "#6366f1", // Indigo
                        "#06b6d4", // Cyan
                        "#14b8a6", // Teal
                        "#f97316", // Orange
                        "#64748b", // Slate
                        "#334155", // Dark Slate
                        "#000000", // Black
                      ].map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`h-8 w-full rounded-md ${style.primaryColor === color ? 'ring-2 ring-offset-2' : ''}`}
                          style={{ backgroundColor: color }}
                          onClick={() => updateStyle("primaryColor", color)}
                          aria-label={`Color ${color}`}
                        />
                      ))}
                      
                      <div className="col-span-6 flex items-center space-x-2 mt-2">
                        <Label htmlFor="customColor" className="text-sm">Custom</Label>
                        <Input 
                          id="customColor" 
                          type="color" 
                          value={style.primaryColor || "#4f46e5"}
                          onChange={(e) => updateStyle("primaryColor", e.target.value)}
                          className="w-8 h-8 p-0 border-0"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="fontSize" className="text-sm">Font Size: {style.fontSize || "medium"}</Label>
                    </div>
                    <Select 
                      value={style.fontSize || "medium"} 
                      onValueChange={(value) => updateStyle("fontSize", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Font size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="spacing" className="text-sm">Section Spacing: {style.spacing || "comfortable"}</Label>
                    </div>
                    <Select 
                      value={style.spacing || "comfortable"} 
                      onValueChange={(value) => updateStyle("spacing", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Spacing" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compact">Compact</SelectItem>
                        <SelectItem value="comfortable">Comfortable</SelectItem>
                        <SelectItem value="spacious">Spacious</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="lineHeight" className="text-sm">Line Height: {style.lineHeight || "normal"}</Label>
                    </div>
                    <Select 
                      value={style.lineHeight || "normal"} 
                      onValueChange={(value) => updateStyle("lineHeight", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Line height" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tight">Tight</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="relaxed">Relaxed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-medium">Colors & Background</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="backgroundColor">Background Color</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        className={`h-10 w-full rounded-md ${style.backgroundColor === "#ffffff" ? 'ring-2 ring-black/10 ring-offset-2' : ''}`}
                        style={{ backgroundColor: "#ffffff" }}
                        onClick={() => updateStyle("backgroundColor", "#ffffff")}
                      >
                        <span className="sr-only">White</span>
                      </button>
                      <button
                        type="button"
                        className={`h-10 w-full rounded-md ${style.backgroundColor === "#f8f9fa" ? 'ring-2 ring-black/10 ring-offset-2' : ''}`}
                        style={{ backgroundColor: "#f8f9fa" }}
                        onClick={() => updateStyle("backgroundColor", "#f8f9fa")}
                      >
                        <span className="sr-only">Light Gray</span>
                      </button>
                      <button
                        type="button"
                        className={`h-10 w-full rounded-md ${style.backgroundColor === "#1f2937" ? 'ring-2 ring-black/10 ring-offset-2' : ''}`}
                        style={{ backgroundColor: "#1f2937" }}
                        onClick={() => updateStyle("backgroundColor", "#1f2937")}
                      >
                        <span className="sr-only">Dark</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="textColor">Text Color</Label>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <button
                        type="button"
                        className={`h-10 w-full rounded-md ${style.textColor === "#000000" ? 'ring-2 ring-black/10 ring-offset-2' : ''} border border-gray-300`}
                        style={{ backgroundColor: "#ffffff" }}
                        onClick={() => updateStyle("textColor", "#000000")}
                      >
                        <div className="h-full w-full flex items-center justify-center">
                          <span className="text-black">Aa</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        className={`h-10 w-full rounded-md ${style.textColor === "#4b5563" ? 'ring-2 ring-black/10 ring-offset-2' : ''} border border-gray-300`}
                        style={{ backgroundColor: "#ffffff" }}
                        onClick={() => updateStyle("textColor", "#4b5563")}
                      >
                        <div className="h-full w-full flex items-center justify-center">
                          <span className="text-[#4b5563]">Aa</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        className={`h-10 w-full rounded-md ${style.textColor === "#ffffff" ? 'ring-2 ring-black/10 ring-offset-2' : ''} border border-gray-300`}
                        style={{ backgroundColor: "#1f2937" }}
                        onClick={() => updateStyle("textColor", "#ffffff")}
                      >
                        <div className="h-full w-full flex items-center justify-center">
                          <span className="text-white">Aa</span>
                        </div>
                      </button>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="customTextColor" className="text-sm">Custom</Label>
                      <Input 
                        id="customTextColor" 
                        type="color" 
                        value={style.textColor || "#000000"}
                        onChange={(e) => updateStyle("textColor", e.target.value)}
                        className="w-8 h-8 p-0 border-0"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="cursor-pointer">Enable Background Pattern</Label>
                    <Switch 
                      checked={style.backgroundPattern === true}
                      onCheckedChange={(checked) => updateStyle("backgroundPattern", checked)}
                    />
                  </div>
                  
                  {style.backgroundPattern && (
                    <div className="space-y-2">
                      <Label>Pattern Style</Label>
                      <Select 
                        value={style.patternStyle || "dots"} 
                        onValueChange={(value) => updateStyle("patternStyle", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pattern" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dots">Dots</SelectItem>
                          <SelectItem value="lines">Lines</SelectItem>
                          <SelectItem value="grid">Grid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-medium">Section Styling</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Section Layout</Label>
                    <Select 
                      value={style.sectionLayout || "standard"} 
                      onValueChange={(value) => updateStyle("sectionLayout", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Section layout" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="boxed">Boxed Sections</SelectItem>
                        <SelectItem value="bordered">Bordered Sections</SelectItem>
                        <SelectItem value="left-border">Left Border</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Experience Item Style</Label>
                    <Select 
                      value={style.experienceStyle || "standard"} 
                      onValueChange={(value) => updateStyle("experienceStyle", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Experience style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="compact">Compact</SelectItem>
                        <SelectItem value="detailed">Detailed with Bullets</SelectItem>
                        <SelectItem value="cards">Card Style</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Skills Display</Label>
                    <Select 
                      value={style.skillsDisplay || "tags"} 
                      onValueChange={(value) => updateStyle("skillsDisplay", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Skills display" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tags">Tags</SelectItem>
                        <SelectItem value="bullets">Bullet List</SelectItem>
                        <SelectItem value="comma">Comma Separated</SelectItem>
                        <SelectItem value="columns">Multi-Column</SelectItem>
                        <SelectItem value="categories">Categorized</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="cursor-pointer">Enable Section Icons</Label>
                    <Switch 
                      checked={style.sectionIcons === true}
                      onCheckedChange={(checked) => updateStyle("sectionIcons", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="cursor-pointer">Highlight Company Names</Label>
                    <Switch 
                      checked={style.highlightCompany === true}
                      onCheckedChange={(checked) => updateStyle("highlightCompany", checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4 pt-4 h-[calc(100vh-250px)] overflow-y-auto pr-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-medium">Resume Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="template">Template</Label>
                    <Select 
                      value={resume.template || "standard"} 
                      onValueChange={(value) => {
                        // Update the template
                        const updatedResume = {
                          ...resume,
                          template: value,
                          // Update the primary color based on the selected template
                          style: {
                            ...resume.style,
                            primaryColor: value === "professional" ? "#4f46e5" : 
                                          value === "modern" ? "#8b5cf6" : 
                                          value === "academic" ? "#10b981" : 
                                          resume.style.primaryColor
                          }
                        };
                        setResume(updatedResume);
                        setSaveStatus("idle");
                      }}
                    >
                      <SelectTrigger id="template">
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="academic">Academic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showDates" className="cursor-pointer">Show Dates</Label>
                    <Switch 
                      id="showDates" 
                      checked={resume.settings?.showDates !== false}
                      onCheckedChange={(checked) => {
                        const updatedSettings = {
                          ...(resume.settings || {}),
                          showDates: checked
                        }
                        updateResume("settings", updatedSettings)
                      }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showContact" className="cursor-pointer">Show Contact Information</Label>
                    <Switch 
                      id="showContact" 
                      checked={resume.settings?.showContact !== false}
                      onCheckedChange={(checked) => {
                        const updatedSettings = {
                          ...(resume.settings || {}),
                          showContact: checked
                        }
                        updateResume("settings", updatedSettings)
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Section Order</Label>
                    <div className="space-y-4">
                      <div className="flex flex-col space-y-2 p-4 border rounded-md">
                        <Label className="mb-2">Custom Section Order</Label>
                        {resume.settings?.customSectionOrder ? (
                          <div className="space-y-2">
                            {resume.settings.customSectionOrder.map((section: string, index: number) => (
                              <div key={section} className="flex items-center justify-between bg-muted/20 p-2 rounded-md">
                                <div className="flex items-center">
                                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 inline-flex items-center justify-center text-sm mr-2">
                                    {index + 1}
                                  </span>
                                  <span className="capitalize">{section}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8"
                                    disabled={index === 0}
                                    onClick={() => {
                                      const updatedOrder = [...resume.settings.customSectionOrder];
                                      [updatedOrder[index], updatedOrder[index - 1]] = [updatedOrder[index - 1], updatedOrder[index]];
                                      
                                      const updatedSettings = {
                                        ...(resume.settings || {}),
                                        customSectionOrder: updatedOrder,
                                        sectionOrder: 'custom'
                                      };
                                      updateResume("settings", updatedSettings);
                                    }}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m18 15-6-6-6 6"/></svg>
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8"
                                    disabled={index === resume.settings.customSectionOrder.length - 1}
                                    onClick={() => {
                                      const updatedOrder = [...resume.settings.customSectionOrder];
                                      [updatedOrder[index], updatedOrder[index + 1]] = [updatedOrder[index + 1], updatedOrder[index]];
                                      
                                      const updatedSettings = {
                                        ...(resume.settings || {}),
                                        customSectionOrder: updatedOrder,
                                        sectionOrder: 'custom'
                                      };
                                      updateResume("settings", updatedSettings);
                                    }}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m6 9 6 6 6-6"/></svg>
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <Button
                            onClick={() => {
                              // Initialize custom section order based on current template
                              let defaultOrder = ['summary', 'experience', 'education', 'skills'];
                              if (resume.settings?.sectionOrder === 'education-first') {
                                defaultOrder = ['summary', 'education', 'experience', 'skills'];
                              } else if (resume.settings?.sectionOrder === 'skills-first') {
                                defaultOrder = ['summary', 'skills', 'experience', 'education'];
                              }
                              
                              const updatedSettings = {
                                ...(resume.settings || {}),
                                customSectionOrder: defaultOrder,
                                sectionOrder: 'custom'
                              };
                              updateResume("settings", updatedSettings);
                            }}
                            className="w-full"
                            variant="outline"
                          >
                            Enable Custom Section Order
                          </Button>
                        )}
                      </div>
                      
                      <RadioGroup
                        value={resume.settings?.sectionOrder || "standard"}
                        onValueChange={(value) => {
                          const updatedSettings = {
                            ...(resume.settings || {}),
                            sectionOrder: value
                          };
                          updateResume("settings", updatedSettings);
                        }}
                        className="space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="standard" id="standard" />
                          <Label htmlFor="standard">Standard (Summary, Experience, Education, Skills)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="education-first" id="education-first" />
                          <Label htmlFor="education-first">Education First</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="skills-first" id="skills-first" />
                          <Label htmlFor="skills-first">Skills First</Label>
                        </div>
                        {resume.settings?.customSectionOrder && (
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="custom" id="custom" />
                            <Label htmlFor="custom">Custom Order</Label>
                          </div>
                        )}
                      </RadioGroup>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-medium">Privacy Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="publicProfile" className="cursor-pointer">Public Profile</Label>
                    <Switch 
                      id="publicProfile" 
                      checked={resume.settings?.isPublic === true}
                      onCheckedChange={(checked) => {
                        const updatedSettings = {
                          ...(resume.settings || {}),
                          isPublic: checked
                        }
                        updateResume("settings", updatedSettings)
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    When enabled, your resume can be shared with others via a public link.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="md:col-span-6 lg:col-span-7 flex justify-center">
          <div 
            ref={resumePreviewRef}
            className="border rounded-md shadow-sm w-full max-w-[816px] p-10 overflow-auto print:border-none print:shadow-none"
            style={{ 
              backgroundColor: style.backgroundColor || '#ffffff',
              color: style.textColor || (style.backgroundColor === '#1f2937' ? '#ffffff' : '#000000'),
              fontFamily: style.fontFamily || 'Inter, sans-serif',
              height: "1056px",
              aspectRatio: "8.5/11",
              ...(style.backgroundPattern && style.patternStyle ? {
                backgroundImage: style.patternStyle === 'dots' 
                  ? `radial-gradient(${style.primaryColor}10 1px, ${style.backgroundColor || '#ffffff'} 1px)`
                  : style.patternStyle === 'lines'
                  ? `linear-gradient(${style.primaryColor}10 1px, transparent 1px)`
                  : `linear-gradient(${style.primaryColor}10 1px, transparent 1px), 
                     linear-gradient(to right, ${style.primaryColor}10 1px, ${style.backgroundColor || '#ffffff'} 1px)`,
                backgroundSize: style.patternStyle === 'lines' ? '100% 20px' : '20px 20px'
              } : {})
            }}
          >
            <ResumePreview resume={resume} />
          </div>
        </div>
      </div>
    </main>
  )
} 