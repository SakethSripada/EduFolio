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
              spacing: "comfortable"
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
        <div className="w-full h-screen flex items-center justify-center">
          <div className="animate-pulse text-2xl">Loading...</div>
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
            <span className="text-xs text-muted-foreground">Saving...</span>
          )}
          {saveStatus === "saved" && (
            <span className="text-xs text-green-600 dark:text-green-400">Saved</span>
          )}
          {saveStatus === "error" && (
            <span className="text-xs text-red-600 dark:text-red-400">Error saving</span>
          )}
          <Button onClick={saveResume} variant="default">
            <Save className="h-4 w-4 mr-1" /> Save
          </Button>
          <Button 
            variant="outline" 
            onClick={exportToPdf} 
            disabled={exporting}
          >
            <Download className="h-4 w-4 mr-1" /> Export PDF
          </Button>
          <Button 
            variant="outline" 
            onClick={exportToDocx} 
            disabled={exporting}
          >
            <FileText className="h-4 w-4 mr-1" /> Export DOCX
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
                  <CardTitle className="text-lg font-medium">Font & Typography</CardTitle>
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
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="Roboto">Roboto</SelectItem>
                        <SelectItem value="Open Sans">Open Sans</SelectItem>
                        <SelectItem value="Merriweather">Merriweather</SelectItem>
                        <SelectItem value="Lora">Lora</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fontSize">Font Size</Label>
                    <Select 
                      value={style.fontSize || "medium"} 
                      onValueChange={(value) => updateStyle("fontSize", value)}
                    >
                      <SelectTrigger id="fontSize">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-medium">Color Scheme</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex gap-2 flex-wrap">
                      {[
                        { name: "Indigo", value: "#4f46e5" },
                        { name: "Red", value: "#ef4444" },
                        { name: "Green", value: "#10b981" },
                        { name: "Violet", value: "#6366f1" },
                        { name: "Amber", value: "#f59e0b" },
                        { name: "Blue", value: "#3b82f6" }
                      ].map(color => (
                        <button
                          key={color.value}
                          type="button"
                          className={`w-8 h-8 rounded-full border-2 ${style.primaryColor === color.value ? 'ring-2 ring-offset-2 ring-black dark:ring-white' : ''}`}
                          style={{ backgroundColor: color.value }}
                          onClick={() => updateStyle("primaryColor", color.value)}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="colorInput">Custom Color</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        id="colorInput"
                        value={style.primaryColor || "#4f46e5"}
                        onChange={(e) => updateStyle("primaryColor", e.target.value)}
                        className="h-10 w-10 p-0 border-0"
                      />
                      <Input
                        value={style.primaryColor || "#4f46e5"}
                        onChange={(e) => updateStyle("primaryColor", e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="backgroundColor">Background Color</Label>
                    <div className="flex gap-2 flex-wrap">
                      {[
                        { name: "White", value: "#ffffff" },
                        { name: "Light Gray", value: "#f5f5f5" },
                        { name: "Cream", value: "#f9f5eb" },
                        { name: "Light Blue", value: "#f0f4f8" },
                        { name: "Light Green", value: "#f0f7f4" },
                        { name: "Dark Mode", value: "#1f2937" }
                      ].map(color => (
                        <button
                          key={color.value}
                          type="button"
                          className={`w-8 h-8 rounded-full border-2 ${style.backgroundColor === color.value ? 'ring-2 ring-offset-2 ring-black dark:ring-white' : ''}`}
                          style={{ backgroundColor: color.value }}
                          onClick={() => updateStyle("backgroundColor", color.value)}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="backgroundColorInput">Custom Background</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        id="backgroundColorInput"
                        value={style.backgroundColor || "#ffffff"}
                        onChange={(e) => updateStyle("backgroundColor", e.target.value)}
                        className="h-10 w-10 p-0 border-0"
                      />
                      <Input
                        value={style.backgroundColor || "#ffffff"}
                        onChange={(e) => updateStyle("backgroundColor", e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-medium">Layout</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="spacing">Content Spacing</Label>
                    <Select 
                      value={style.spacing || "comfortable"} 
                      onValueChange={(value) => updateStyle("spacing", value)}
                    >
                      <SelectTrigger id="spacing">
                        <SelectValue placeholder="Select spacing" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compact">Compact</SelectItem>
                        <SelectItem value="comfortable">Comfortable</SelectItem>
                        <SelectItem value="spacious">Spacious</SelectItem>
                      </SelectContent>
                    </Select>
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
                      onValueChange={(value) => updateResume("template", value)}
                    >
                      <SelectTrigger id="template">
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
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
                    <RadioGroup
                      value={resume.settings?.sectionOrder || "standard"}
                      onValueChange={(value) => {
                        const updatedSettings = {
                          ...(resume.settings || {}),
                          sectionOrder: value
                        }
                        updateResume("settings", updatedSettings)
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
                    </RadioGroup>
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
            className="border rounded-md shadow-sm min-h-[1056px] w-full max-w-[816px] p-10 overflow-auto print:border-none print:shadow-none"
            style={{ 
              backgroundColor: style.backgroundColor || '#ffffff',
              color: style.backgroundColor === '#1f2937' ? '#ffffff' : '#000000'
            }}
          >
            <ResumePreview resume={resume} />
          </div>
        </div>
      </div>
    </main>
  )
} 