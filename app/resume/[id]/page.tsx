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
          
          // Initialize content if not present
          if (!data.content) {
            data.content = {};
          }
          
          // Ensure customSections array exists
          if (!data.content.customSections) {
            data.content.customSections = [];
          }
          
          // Fix titles for custom sections
          if (data.content.customSections) {
            data.content.customSections = data.content.customSections.map((section: any) => {
              // Check if title is missing or looks like a UUID
              const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
              if (!section.title || section.title === section.id || uuidPattern.test(section.title) || section.title.includes('-')) {
                section.title = "Custom Section";
              }
              
              // Ensure items array exists
              if (!section.items) {
                section.items = [];
              } else {
                // Ensure each item has fields array
                section.items = section.items.map((item: any) => {
                  if (!item.fields) {
                    item.fields = [];
                  }
                  return item;
                });
              }
              
              console.log("Processed custom section:", { id: section.id, title: section.title });
              return section;
            });
          }
          
          // Initialize custom section order if needed
          if (!data.content.customSectionOrder || data.content.customSectionOrder.length === 0) {
            const standardSections = ['personalInfo', 'summary', 'experience', 'education', 'skills'];
            data.content.customSectionOrder = [...standardSections];
          } else {
            // Filter out any custom sections from the order
            data.content.customSectionOrder = data.content.customSectionOrder.filter(
              (id: string) => !id.startsWith('custom-')
            );
          }
          
          // Remove the customSections array
          if (data.content.customSections) {
            delete data.content.customSections;
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
    setExporting(true);
    try {
      const element = resumePreviewRef.current;
      if (!element) return;
      
      // Create a clone of the resume element with fixed dimensions for PDF generation
      const clone = element.cloneNode(true) as HTMLElement;
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.width = '816px'; // 8.5 inches at 96 DPI
      container.style.height = '1056px'; // 11 inches at 96 DPI
      container.style.overflow = 'hidden';
      
      // Apply the same styles as the original but with fixed dimensions
      Object.assign(clone.style, {
        width: '816px',
        height: '1056px',
        position: 'relative',
        transform: 'none',
        maxWidth: 'none',
        maxHeight: 'none'
      });
      
      // Append to DOM temporarily
      container.appendChild(clone);
      document.body.appendChild(container);
      
      // Dynamically import jsPDF and html2canvas
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;
      
      // Use html2canvas to capture the resume
      const canvas = await html2canvas(clone, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        width: 816, // 8.5 inches at 96 DPI
        height: 1056, // 11 inches at 96 DPI
      });
      
      // Clean up
      document.body.removeChild(container);
      
      // Create PDF with exact 8.5x11 dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: 'letter' // 8.5 x 11 inches
      });
      
      // Add the canvas image to the PDF
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, 8.5, 11);
      
      // Save the PDF
      pdf.save(`${resume.title || 'Resume'}.pdf`);
      
      toast({
        title: "PDF exported successfully",
        description: "Your resume has been exported to PDF",
      });
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      toast({
        title: "Error exporting to PDF",
        description: "There was a problem exporting your resume",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 xl:col-span-5 space-y-6">
          <div className="sticky top-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-3 mb-4">
                <TabsTrigger value="content" className="flex items-center gap-1">
                  <FileText className="h-4 w-4" /> Content
                </TabsTrigger>
                <TabsTrigger value="style" className="flex items-center gap-1">
                  <Palette className="h-4 w-4" /> Style
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-1">
                  <Settings className="h-4 w-4" /> Settings
                </TabsTrigger>
              </TabsList>
              
              <div className="h-[800px]">
                <TabsContent value="content" className="h-full space-y-6 pt-4 overflow-y-auto pr-2">
                  <ResumeEditor resume={resume} onUpdate={updateResume} />
                </TabsContent>
                
                <TabsContent value="style" className="h-full space-y-6 pt-4 overflow-y-auto pr-2">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-medium">Theme & Layout</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      <div className="space-y-3">
                        <Label htmlFor="fontFamily" className="text-sm font-medium">Font Family</Label>
                        <Select 
                          value={style.fontFamily || "Inter"} 
                          onValueChange={(value) => updateStyle("fontFamily", value)}
                        >
                          <SelectTrigger id="fontFamily" className="w-full">
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
                      
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Section Header Style</Label>
                        <Select 
                          value={style.headerStyle || "underline"} 
                          onValueChange={(value) => updateStyle("headerStyle", value)}
                        >
                          <SelectTrigger className="w-full">
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
                      
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Section Layout</Label>
                        <Select 
                          value={style.sectionLayout || "standard"} 
                          onValueChange={(value) => updateStyle("sectionLayout", value)}
                        >
                          <SelectTrigger className="w-full">
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
                      
                      {style.sectionLayout === "boxed" && (
                        <div className="space-y-3 pl-6 border-l-2 border-muted-foreground/20">
                          <Label className="text-sm font-medium">Box Background Color</Label>
                          <div className="grid grid-cols-4 gap-3">
                            {[
                              "#f9fafb", // Light Gray
                              "#f3f4f6", // Gray 100
                              "#e5e7eb", // Gray 200
                              "#f1f5f9", // Slate 100
                              "#ecfdf5", // Light Green
                              "#eff6ff", // Light Blue
                              "#faf5ff", // Light Purple
                              "#fff7ed", // Light Orange
                              "#1f2937", // Dark Gray
                              "#334155", // Dark Slate
                            ].map((color) => (
                              <button
                                key={color}
                                type="button"
                                className={`h-9 w-full rounded-md ${style.boxBgColor === color ? 'ring-2 ring-offset-2' : ''}`}
                                style={{ backgroundColor: color }}
                                onClick={() => updateStyle("boxBgColor", color)}
                                aria-label={`Box background color ${color}`}
                              />
                            ))}
                            
                            <div className="col-span-4 flex items-center space-x-2 mt-2">
                              <Label htmlFor="customBoxBgColor" className="text-sm font-medium">Custom</Label>
                              <Input 
                                id="customBoxBgColor" 
                                type="color" 
                                value={style.boxBgColor || "#f3f4f6"}
                                onChange={(e) => updateStyle("boxBgColor", e.target.value)}
                                className="w-10 h-10 p-0 border-0"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Column Layout</Label>
                        <Select 
                          value={style.columnLayout || "single"} 
                          onValueChange={(value) => updateStyle("columnLayout", value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Column layout" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single">Single Column</SelectItem>
                            <SelectItem value="double">Double Column</SelectItem>
                            <SelectItem value="triple">Triple Column</SelectItem>
                            <SelectItem value="double-left-sidebar">Left Sidebar</SelectItem>
                            <SelectItem value="double-right-sidebar">Right Sidebar</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Section Dividers</Label>
                        <Select 
                          value={style.sectionDivider || "none"} 
                          onValueChange={(value) => updateStyle("sectionDivider", value)}
                        >
                          <SelectTrigger className="w-full">
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
                      
                      <div className="space-y-3">
                        <Label htmlFor="primaryColor" className="text-sm font-medium">Primary Color</Label>
                        <div className="grid grid-cols-6 gap-3">
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
                              className={`h-9 w-full rounded-md ${style.primaryColor === color ? 'ring-2 ring-offset-2' : ''}`}
                              style={{ backgroundColor: color }}
                              onClick={() => updateStyle("primaryColor", color)}
                              aria-label={`Color ${color}`}
                            />
                          ))}
                          
                          <div className="col-span-6 flex items-center space-x-2 mt-2">
                            <Label htmlFor="customColor" className="text-sm font-medium">Custom</Label>
                            <Input 
                              id="customColor" 
                              type="color" 
                              value={style.primaryColor || "#4f46e5"}
                              onChange={(e) => updateStyle("primaryColor", e.target.value)}
                              className="w-10 h-10 p-0 border-0"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="fontSize" className="text-sm font-medium">Font Size: {style.fontSize || "medium"}</Label>
                        <Select 
                          value={style.fontSize || "medium"} 
                          onValueChange={(value) => updateStyle("fontSize", value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Font size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="spacing" className="text-sm font-medium">Section Spacing: {style.spacing || "comfortable"}</Label>
                        <Select 
                          value={style.spacing || "comfortable"} 
                          onValueChange={(value) => updateStyle("spacing", value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Spacing" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="compact">Compact</SelectItem>
                            <SelectItem value="comfortable">Comfortable</SelectItem>
                            <SelectItem value="spacious">Spacious</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="lineHeight" className="text-sm font-medium">Line Height: {style.lineHeight || "normal"}</Label>
                        <Select 
                          value={style.lineHeight || "normal"} 
                          onValueChange={(value) => updateStyle("lineHeight", value)}
                        >
                          <SelectTrigger className="w-full">
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
                      <CardTitle className="text-lg font-medium">Color & Background</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      <div className="space-y-3">
                        <Label htmlFor="backgroundColor" className="text-sm font-medium">Background Color</Label>
                        <div className="grid grid-cols-4 gap-3">
                          {[
                            "#ffffff", // White
                            "#f9fafb", // Gray 50
                            "#f3f4f6", // Gray 100
                            "#e5e7eb", // Gray 200
                            "#d1d5db", // Gray 300
                            "#f1f5f9", // Slate 100
                            "#e2e8f0", // Slate 200
                            "#f8fafc", // Slate 50
                            "#1f2937", // Gray 800 (Dark)
                          ].map((color) => (
                            <button
                              key={color}
                              type="button"
                              className={`h-9 w-full rounded-md ${color === '#ffffff' ? 'border' : ''} ${style.backgroundColor === color ? 'ring-2 ring-offset-2' : ''}`}
                              style={{ backgroundColor: color }}
                              onClick={() => updateStyle("backgroundColor", color)}
                              aria-label={`Background color ${color}`}
                            />
                          ))}
                          
                          <div className="col-span-4 flex items-center space-x-2 mt-2">
                            <Label htmlFor="customBgColor" className="text-sm font-medium">Custom</Label>
                            <Input 
                              id="customBgColor" 
                              type="color" 
                              value={style.backgroundColor || "#ffffff"}
                              onChange={(e) => updateStyle("backgroundColor", e.target.value)}
                              className="w-10 h-10 p-0 border-0"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="textColor" className="text-sm font-medium">Text Color</Label>
                        <div className="grid grid-cols-4 gap-3">
                          {[
                            "#000000", // Black
                            "#1f2937", // Gray 800
                            "#374151", // Gray 700
                            "#4b5563", // Gray 600
                            "#6b7280", // Gray 500
                            "#ffffff", // White (for dark backgrounds)
                          ].map((color) => (
                            <button
                              key={color}
                              type="button"
                              className={`h-9 w-full rounded-md ${color === '#ffffff' ? 'border' : ''} ${style.textColor === color ? 'ring-2 ring-offset-2' : ''}`}
                              style={{ backgroundColor: color }}
                              onClick={() => updateStyle("textColor", color)}
                              aria-label={`Text color ${color}`}
                            />
                          ))}
                          
                          <div className="col-span-4 flex items-center space-x-2 mt-2">
                            <Label htmlFor="customTextColor" className="text-sm font-medium">Custom</Label>
                            <Input 
                              id="customTextColor" 
                              type="color" 
                              value={style.textColor || "#000000"}
                              onChange={(e) => updateStyle("textColor", e.target.value)}
                              className="w-10 h-10 p-0 border-0"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-5 pt-4 border-t">
                        <Label className="text-sm font-medium">Element-specific Colors</Label>
                        
                        <div className="space-y-3">
                          <Label htmlFor="headingColor" className="text-xs font-medium ml-4">Heading Color</Label>
                          <div className="flex items-center space-x-2 ml-4">
                            <Input 
                              id="headingColor" 
                              type="color" 
                              value={style.headingColor || style.textColor || "#000000"}
                              onChange={(e) => updateStyle("headingColor", e.target.value)}
                              className="w-8 h-8 p-0 border-0"
                            />
                            <span className="text-xs text-muted-foreground">Section headings</span>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <Label htmlFor="mutedTextColor" className="text-xs font-medium ml-4">Secondary Text Color</Label>
                          <div className="flex items-center space-x-2 ml-4">
                            <Input 
                              id="mutedTextColor" 
                              type="color" 
                              value={style.mutedTextColor || (style.textColor ? `${style.textColor}99` : "#6b7280")}
                              onChange={(e) => updateStyle("mutedTextColor", e.target.value)}
                              className="w-8 h-8 p-0 border-0"
                            />
                            <span className="text-xs text-muted-foreground">Dates, locations, subtitles</span>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <Label htmlFor="linkColor" className="text-xs font-medium ml-4">Link Color</Label>
                          <div className="flex items-center space-x-2 ml-4">
                            <Input 
                              id="linkColor" 
                              type="color" 
                              value={style.linkColor || style.primaryColor || "#4f46e5"}
                              onChange={(e) => updateStyle("linkColor", e.target.value)}
                              className="w-8 h-8 p-0 border-0"
                            />
                            <span className="text-xs text-muted-foreground">URLs and linked elements</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium cursor-pointer">Enable Background Pattern</Label>
                          <Switch 
                            checked={style.backgroundPattern === true}
                            onCheckedChange={(checked) => updateStyle("backgroundPattern", checked)}
                          />
                        </div>
                        
                        {style.backgroundPattern && (
                          <div className="pl-6 pt-2">
                            <Label className="text-sm font-medium">Pattern Style</Label>
                            <Select 
                              value={style.patternStyle || "dots"}
                              onValueChange={(value) => updateStyle("patternStyle", value)}
                            >
                              <SelectTrigger className="w-full mt-2">
                                <SelectValue placeholder="Pattern style" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="dots">Dots</SelectItem>
                                <SelectItem value="lines">Lines</SelectItem>
                                <SelectItem value="grid">Grid</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-medium">Section Display Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Skills Display</Label>
                        <Select 
                          value={style.skillsDisplay || "tags"} 
                          onValueChange={(value) => updateStyle("skillsDisplay", value)}
                        >
                          <SelectTrigger className="w-full">
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

                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Education Style</Label>
                        <Select 
                          value={style.educationStyle || "standard"} 
                          onValueChange={(value) => updateStyle("educationStyle", value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Education style" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="minimal">Minimal</SelectItem>
                            <SelectItem value="detailed">Detailed</SelectItem>
                            <SelectItem value="cards">Card Style</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center justify-between py-2">
                        <Label className="cursor-pointer text-sm font-medium">Enable Section Icons</Label>
                        <Switch 
                          checked={style.sectionIcons === true}
                          onCheckedChange={(checked) => updateStyle("sectionIcons", checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between py-2">
                        <Label className="cursor-pointer text-sm font-medium">Highlight Company Names</Label>
                        <Switch 
                          checked={style.highlightCompany === true}
                          onCheckedChange={(checked) => updateStyle("highlightCompany", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between py-2">
                        <Label className="cursor-pointer text-sm font-medium">Bold Section Titles</Label>
                        <Switch 
                          checked={style.boldSectionTitles === true}
                          onCheckedChange={(checked) => updateStyle("boldSectionTitles", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between py-2">
                        <Label className="cursor-pointer text-sm font-medium">Show Bullet Points</Label>
                        <Switch 
                          checked={style.showBullets !== false}
                          onCheckedChange={(checked) => updateStyle("showBullets", checked)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        // Reset to default style settings
                        const defaultStyle = {
                          fontFamily: "Inter",
                          primaryColor: resume.template === "professional" ? "#4f46e5" : 
                                       resume.template === "modern" ? "#8b5cf6" : 
                                       resume.template === "academic" ? "#10b981" : "#4f46e5",
                          fontSize: "medium",
                          spacing: "comfortable",
                          backgroundColor: "#ffffff",
                          textColor: "#000000",
                          columnLayout: "single",
                          sectionLayout: "standard",
                          headerStyle: "underline",
                          lineHeight: "normal",
                          sectionDivider: "none",
                          skillsDisplay: "tags"
                        };
                        
                        updateResume("style", defaultStyle);
                        
                        toast({
                          title: "Style reset",
                          description: "Resume style has been reset to default",
                        });
                      }}
                      className="w-full"
                    >
                      Reset to Default Style
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="settings" className="h-full space-y-6 pt-4 overflow-y-auto pr-2">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-medium">Resume Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      <div className="space-y-3">
                        <Label htmlFor="template" className="text-sm font-medium">Template</Label>
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
                          <SelectTrigger id="template" className="w-full">
                            <SelectValue placeholder="Select template" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="professional">Professional</SelectItem>
                            <SelectItem value="modern">Modern</SelectItem>
                            <SelectItem value="academic">Academic</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="resumeTitle" className="text-sm font-medium">Resume Title</Label>
                        <Input 
                          id="resumeTitle" 
                          placeholder="My Resume" 
                          value={resume.title || ""}
                          onChange={(e) => updateResume("title", e.target.value)}
                          className="w-full"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between py-2">
                        <Label htmlFor="showDates" className="cursor-pointer text-sm font-medium">Show Dates</Label>
                        <Switch 
                          id="showDates" 
                          checked={resume.content?.showDates !== false}
                          onCheckedChange={(checked) => {
                            const updatedContent = {
                              ...resume.content,
                              showDates: checked
                            }
                            updateResume("content", updatedContent)
                          }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between py-2">
                        <Label htmlFor="showContact" className="cursor-pointer text-sm font-medium">Show Contact Information</Label>
                        <Switch 
                          id="showContact" 
                          checked={resume.content?.showContact !== false}
                          onCheckedChange={(checked) => {
                            const updatedContent = {
                              ...resume.content,
                              showContact: checked
                            }
                            updateResume("content", updatedContent)
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-medium">Privacy Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="publicProfile" className="cursor-pointer text-sm font-medium">Public Profile</Label>
                        <Switch 
                          id="publicProfile" 
                          checked={resume.content?.isPublic === true}
                          onCheckedChange={(checked) => {
                            const updatedContent = {
                              ...resume.content,
                              isPublic: checked
                            }
                            updateResume("content", updatedContent)
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        When enabled, your resume can be shared with others via a public link.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
        
        <div className="lg:col-span-6 xl:col-span-7 flex justify-center">
          <div 
            className="relative w-full h-auto max-w-full"
            style={{
              maxWidth: "816px", // Maximum width of 8.5 inches at 96 DPI
            }}
          >
            <div
              ref={resumePreviewRef}
              className="border rounded-md shadow-sm w-full overflow-hidden print:border-none print:shadow-none"
              style={{ 
                backgroundColor: style.backgroundColor || '#ffffff',
                color: style.textColor || (style.backgroundColor === '#1f2937' ? '#ffffff' : '#000000'),
                fontFamily: style.fontFamily || 'Inter, sans-serif',
                aspectRatio: "8.5/11", // Maintain 8.5x11 aspect ratio
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
              <div className="scale-container w-full h-full p-10 overflow-hidden">
                <ResumePreview resume={resume} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* Responsive resume styles */
        @media (max-width: 1023px) {
          .scale-container {
            transform: scale(0.9);
            transform-origin: top center;
            padding: 5px !important;
          }
        }
        
        @media (max-width: 767px) {
          .scale-container {
            transform: scale(0.8);
            transform-origin: top center;
            padding: 0 !important;
          }
        }
        
        @media (max-width: 639px) {
          .scale-container {
            transform: scale(0.7);
            transform-origin: top center;
          }
        }
        
        /* Print-specific styles */
        @media print {
          .scale-container {
            transform: none !important;
            padding: 0 !important;
          }
        }

        /* Column layout improvements */
        .resume-content .break-inside-avoid {
          break-inside: avoid !important;
          page-break-inside: avoid !important;
          display: inline-block;
          width: 100%;
        }

        .has-columns {
          column-fill: auto !important;
        }

        /* Boxed section styles */
        .resume-content div[style*="backgroundColor"] {
          margin-bottom: 1rem;
        }
      `}</style>
    </main>
  )
} 