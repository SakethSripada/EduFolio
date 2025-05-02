"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { 
  PlusCircle, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  GripVertical,
  AlignJustify
} from "lucide-react"

type ResumeEditorProps = {
  resume: any
  onUpdate: (key: string, value: any) => void
}

// Standard section types for better type safety
type StandardSectionType = 'personalInfo' | 'education' | 'experience' | 'skills';

// All section types including custom sections
type SectionType = StandardSectionType | string;

export default function ResumeEditor({ resume, onUpdate }: ResumeEditorProps) {
  // Get content or initialize empty object if it doesn't exist
  const content = resume.content || {}
  
  // Initialize various sections if they don't exist
  const personalInfo = content.personalInfo || {
    fullName: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedIn: ""
  }
  
  const summary = content.summary || ""
  const experience = content.experience || []
  const education = content.education || []
  const skills = content.skills || []
  
  // State to track expanded sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    personalInfo: true,
    education: true,
    experience: true,
    skills: true
  });
  
  // State to track the order of sections
  const [sectionOrder, setSectionOrder] = useState<string[]>(() => {
    // Check if there's a custom order in content
    if (content.customSectionOrder && content.customSectionOrder.length > 0) {
      return content.customSectionOrder.filter((id: string) => !id.startsWith('custom-'));
    }
    
    // Default order
    return ['personalInfo', 'summary', 'experience', 'education', 'skills'];
  });
  
  // Function to get human-readable section title
  const getSectionTitle = (sectionId: string): string => {
    // Get the human-readable title
    if (sectionId === 'personalInfo') return 'Personal Information';
    if (sectionId === 'experience') return 'Work Experience';
    if (sectionId === 'education') return 'Education';
    if (sectionId === 'skills') return 'Skills';
    if (sectionId === 'summary') return 'Summary';
    
    // Fallback for any unknown section
    return "Section";
  };
  
  // Toggle section expansion
  const toggleSectionExpansion = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Function to update the section order and save to content
  const updateSectionOrder = (newOrder: string[]) => {
    setSectionOrder(newOrder);
    
    // Save to content
    onUpdate("content", {
      ...content,
      customSectionOrder: newOrder,
      customSectionOrderEnabled: true
    });
  };
  
  // Move section up in order
  const moveSectionUp = (sectionId: string) => {
    const currentIndex = sectionOrder.indexOf(sectionId);
    if (currentIndex > 0) {
      const newOrder = [...sectionOrder];
      const temp = newOrder[currentIndex - 1];
      newOrder[currentIndex - 1] = newOrder[currentIndex];
      newOrder[currentIndex] = temp;
      updateSectionOrder(newOrder);
    }
  };
  
  // Move section down in order
  const moveSectionDown = (sectionId: string) => {
    const currentIndex = sectionOrder.indexOf(sectionId);
    if (currentIndex < sectionOrder.length - 1) {
      const newOrder = [...sectionOrder];
      const temp = newOrder[currentIndex + 1];
      newOrder[currentIndex + 1] = newOrder[currentIndex];
      newOrder[currentIndex] = temp;
      updateSectionOrder(newOrder);
    }
  };
  
  // Remove a section from the section order (but don't delete the content)
  const removeSectionFromOrder = (sectionId: string) => {
    // Don't allow removing personalInfo as it's required
    if (sectionId === 'personalInfo') return;
    
    const newOrder = sectionOrder.filter(id => id !== sectionId);
    updateSectionOrder(newOrder);
  };

  // Add a section back to the section order
  const addSectionToOrder = (sectionId: string) => {
    // Check if it's already in the order
    if (sectionOrder.includes(sectionId)) return;
    
    const newOrder = [...sectionOrder, sectionId];
    updateSectionOrder(newOrder);
  };

  // Get sections not currently in the order that can be added
  const getAvailableSections = () => {
    const standardSections = ['summary', 'experience', 'education', 'skills'];
    const allSections = [...standardSections, ...sectionOrder];
    
    return allSections.filter(id => !sectionOrder.includes(id));
  };
  
  // Handle updating personal info
  const updatePersonalInfo = (key: string, value: string) => {
    const updatedPersonalInfo = {
      ...personalInfo,
      [key]: value
    }
    
    onUpdate("content", {
      ...content,
      personalInfo: updatedPersonalInfo
    })
  }
  
  // Handle updating summary
  const updateSummary = (value: string) => {
    onUpdate("content", {
      ...content,
      summary: value
    })
  }
  
  // Add new work experience
  const addWorkExperience = () => {
    const newExperience = {
      id: crypto.randomUUID(),
      company: "",
      position: "",
      location: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      description: ""
    }
    
    onUpdate("content", {
      ...content,
      experience: [...experience, newExperience]
    })

    // Automatically expand the experience section when adding a new entry
    setExpandedSections(prev => ({
      ...prev,
      experience: true
    }));
  }
  
  // Update existing work experience
  const updateWorkExperience = (id: string, key: string, value: any) => {
    const updatedExperience = experience.map((exp: any) => 
      exp.id === id ? { ...exp, [key]: value } : exp
    )
    
    onUpdate("content", {
      ...content,
      experience: updatedExperience
    })
  }
  
  // Remove work experience
  const removeWorkExperience = (id: string) => {
    const updatedExperience = experience.filter((exp: any) => exp.id !== id)
    
    onUpdate("content", {
      ...content,
      experience: updatedExperience
    })
  }
  
  // Add new education
  const addEducation = () => {
    const newEducation = {
      id: crypto.randomUUID(),
      institution: "",
      degree: "",
      fieldOfStudy: "",
      location: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      gpa: "",
      description: ""
    }
    
    onUpdate("content", {
      ...content,
      education: [...education, newEducation]
    })

    // Automatically expand the education section when adding a new entry
    setExpandedSections(prev => ({
      ...prev,
      education: true
    }));
  }
  
  // Update existing education
  const updateEducation = (id: string, key: string, value: any) => {
    const updatedEducation = education.map((edu: any) => 
      edu.id === id ? { ...edu, [key]: value } : edu
    )
    
    onUpdate("content", {
      ...content,
      education: updatedEducation
    })
  }
  
  // Remove education
  const removeEducation = (id: string) => {
    const updatedEducation = education.filter((edu: any) => edu.id !== id)
    
    onUpdate("content", {
      ...content,
      education: updatedEducation
    })
  }
  
  // Add new skill
  const addSkill = () => {
    const newSkill = {
      id: crypto.randomUUID(),
      name: "",
      level: "Intermediate",
      category: ""
    }
    
    onUpdate("content", {
      ...content,
      skills: [...skills, newSkill]
    })

    // Automatically expand the skills section when adding a new entry
    setExpandedSections(prev => ({
      ...prev,
      skills: true
    }));
  }
  
  // Update existing skill
  const updateSkill = (id: string, key: string, value: any) => {
    const updatedSkills = skills.map((skill: any) => 
      skill.id === id ? { ...skill, [key]: value } : skill
    )
    
    onUpdate("content", {
      ...content,
      skills: updatedSkills
    })
  }
  
  // Remove skill
  const removeSkill = (id: string) => {
    const updatedSkills = skills.filter((skill: any) => skill.id !== id)
    
    onUpdate("content", {
      ...content,
      skills: updatedSkills
    })
  }

  return (
    <div className="space-y-8">
      {/* Personal Information */}
      <Card className="border shadow-sm">
        <CardHeader className="bg-muted/30 pb-3 cursor-pointer" onClick={() => toggleSectionExpansion('personalInfo')}>
          <CardTitle className="text-lg font-medium flex items-center justify-between">
            <div className="flex items-center">
              <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 inline-flex items-center justify-center text-sm mr-2">1</span>
              Personal Information
            </div>
            {expandedSections.personalInfo ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </CardTitle>
        </CardHeader>
        {expandedSections.personalInfo && (
          <CardContent className="pt-6 space-y-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
                <Input 
                  id="fullName" 
                  placeholder="John Doe" 
                  value={personalInfo.fullName}
                  onChange={(e) => updatePersonalInfo("fullName", e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="title" className="text-sm font-medium">Professional Title</Label>
                <Input 
                  id="title" 
                  placeholder="Software Engineer" 
                  value={personalInfo.title}
                  onChange={(e) => updatePersonalInfo("title", e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="pt-2">
              <Label htmlFor="summary" className="text-sm font-medium">Professional Summary</Label>
              <Textarea 
                id="summary" 
                placeholder="Brief professional summary..." 
                className="mt-1.5 min-h-[100px]" 
                value={summary}
                onChange={(e) => updateSummary(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input 
                  id="email" 
                  placeholder="john@example.com" 
                  type="email" 
                  value={personalInfo.email}
                  onChange={(e) => updatePersonalInfo("email", e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
                <Input 
                  id="phone" 
                  placeholder="(123) 456-7890" 
                  value={personalInfo.phone}
                  onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location" className="text-sm font-medium">Location</Label>
              <Input 
                id="location" 
                placeholder="New York, NY" 
                value={personalInfo.location}
                onChange={(e) => updatePersonalInfo("location", e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <Label htmlFor="website" className="text-sm font-medium">Website (Optional)</Label>
                <Input 
                  id="website" 
                  placeholder="https://yourwebsite.com" 
                  value={personalInfo.website}
                  onChange={(e) => updatePersonalInfo("website", e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="linkedIn" className="text-sm font-medium">LinkedIn (Optional)</Label>
                <Input 
                  id="linkedIn" 
                  placeholder="linkedin.com/in/username" 
                  value={personalInfo.linkedIn}
                  onChange={(e) => updatePersonalInfo("linkedIn", e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>
      
      {/* Education Section */}
      <Card className="border shadow-sm">
        <CardHeader className="bg-muted/30 pb-3 cursor-pointer" onClick={() => toggleSectionExpansion('education')}>
          <CardTitle className="text-lg font-medium flex items-center justify-between">
            <div className="flex items-center">
              <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 inline-flex items-center justify-center text-sm mr-2">2</span>
              Education
            </div>
            {expandedSections.education ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </CardTitle>
        </CardHeader>
        {expandedSections.education && (
          <CardContent className="pt-6 space-y-4">
            {education.length === 0 ? (
              <div className="text-center py-8 bg-muted/10 rounded-lg border border-dashed">
                <p className="text-muted-foreground mb-4">
                  Add your educational background
                </p>
                <Button onClick={addEducation} size="sm" className="gap-1">
                  <PlusCircle className="h-4 w-4" />
                  Add Education
                </Button>
              </div>
            ) : (
              <>
                <Accordion type="multiple" className="w-full">
                  {education.map((edu: any, index: number) => (
                    <AccordionItem key={edu.id} value={edu.id} className="border rounded-md mb-3 overflow-hidden">
                      <AccordionTrigger className="hover:no-underline px-4 py-2 bg-muted/20 hover:bg-muted/30">
                        <div className="flex justify-between w-full pr-4 text-left">
                          <span>{edu.institution || edu.degree || `Education ${index + 1}`}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pt-4 pb-1">
                        <div className="space-y-4">
                          <div className="grid gap-4">
                            <div>
                              <Label htmlFor={`institution-${edu.id}`} className="text-sm font-medium">Institution</Label>
                              <Input 
                                id={`institution-${edu.id}`} 
                                placeholder="University/School Name" 
                                value={edu.institution}
                                onChange={(e) => updateEducation(edu.id, "institution", e.target.value)}
                                className="mt-1.5"
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor={`degree-${edu.id}`} className="text-sm font-medium">Degree</Label>
                                <Input 
                                  id={`degree-${edu.id}`} 
                                  placeholder="Bachelor of Science" 
                                  value={edu.degree}
                                  onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                                  className="mt-1.5"
                                />
                              </div>
                              <div>
                                <Label htmlFor={`fieldOfStudy-${edu.id}`} className="text-sm font-medium">Field of Study</Label>
                                <Input 
                                  id={`fieldOfStudy-${edu.id}`} 
                                  placeholder="Computer Science" 
                                  value={edu.fieldOfStudy}
                                  onChange={(e) => updateEducation(edu.id, "fieldOfStudy", e.target.value)}
                                  className="mt-1.5"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <Label htmlFor={`location-${edu.id}`} className="text-sm font-medium">Location</Label>
                              <Input 
                                id={`location-${edu.id}`} 
                                placeholder="City, State" 
                                value={edu.location}
                                onChange={(e) => updateEducation(edu.id, "location", e.target.value)}
                                className="mt-1.5"
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor={`startDate-${edu.id}`} className="text-sm font-medium">Start Date</Label>
                                <Input 
                                  id={`startDate-${edu.id}`} 
                                  placeholder="MM/YYYY" 
                                  value={edu.startDate}
                                  onChange={(e) => updateEducation(edu.id, "startDate", e.target.value)}
                                  className="mt-1.5"
                                />
                              </div>
                              <div>
                                <Label htmlFor={`endDate-${edu.id}`} className="text-sm font-medium">End Date</Label>
                                <Input 
                                  id={`endDate-${edu.id}`} 
                                  placeholder="MM/YYYY or Present" 
                                  value={edu.endDate}
                                  onChange={(e) => updateEducation(edu.id, "endDate", e.target.value)}
                                  disabled={edu.isCurrent}
                                  className="mt-1.5"
                                />
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`isCurrent-${edu.id}`}
                                checked={edu.isCurrent}
                                onChange={(e) => updateEducation(edu.id, "isCurrent", e.target.checked)}
                                className="rounded border-gray-300"
                              />
                              <Label htmlFor={`isCurrent-${edu.id}`} className="text-sm">I'm currently studying here</Label>
                            </div>
                            
                            <div>
                              <Label htmlFor={`gpa-${edu.id}`} className="text-sm font-medium">GPA (Optional)</Label>
                              <Input 
                                id={`gpa-${edu.id}`} 
                                placeholder="3.8/4.0" 
                                value={edu.gpa}
                                onChange={(e) => updateEducation(edu.id, "gpa", e.target.value)}
                                className="mt-1.5"
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor={`description-${edu.id}`} className="text-sm font-medium">Description (Optional)</Label>
                              <Textarea 
                                id={`description-${edu.id}`} 
                                placeholder="Relevant coursework, achievements, etc." 
                                className="mt-1.5 min-h-[100px]" 
                                value={edu.description}
                                onChange={(e) => updateEducation(edu.id, "description", e.target.value)}
                              />
                            </div>
                          </div>
                          
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => removeEducation(edu.id)}
                            className="mb-3"
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Remove
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                
                <Button onClick={addEducation} className="w-full gap-1" variant="outline">
                  <PlusCircle className="h-4 w-4" /> Add More Education
                </Button>
              </>
            )}
          </CardContent>
        )}
      </Card>
      
      {/* Work Experience Section */}
      <Card className="border shadow-sm">
        <CardHeader className="bg-muted/30 pb-3 cursor-pointer" onClick={() => toggleSectionExpansion('experience')}>
          <CardTitle className="text-lg font-medium flex items-center justify-between">
            <div className="flex items-center">
              <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 inline-flex items-center justify-center text-sm mr-2">3</span>
              Work Experience
            </div>
            {expandedSections.experience ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </CardTitle>
        </CardHeader>
        {expandedSections.experience && (
          <CardContent className="pt-6 space-y-4">
            {experience.length === 0 ? (
              <div className="text-center py-8 bg-muted/10 rounded-lg border border-dashed">
                <p className="text-muted-foreground mb-4">
                  Add your work experience history
                </p>
                <Button onClick={addWorkExperience} size="sm" className="gap-1">
                  <PlusCircle className="h-4 w-4" />
                  Add Work Experience
                </Button>
              </div>
            ) : (
              <>
                <Accordion type="multiple" className="w-full">
                  {experience.map((exp: any, index: number) => (
                    <AccordionItem key={exp.id} value={exp.id} className="border rounded-md mb-3 overflow-hidden">
                      <AccordionTrigger className="hover:no-underline px-4 py-2 bg-muted/20 hover:bg-muted/30">
                        <div className="flex justify-between w-full pr-4 text-left">
                          <span>{exp.position || exp.company || `Work Experience ${index + 1}`}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pt-4 pb-1">
                        <div className="space-y-4">
                          <div className="grid gap-4">
                            <div>
                              <Label htmlFor={`company-${exp.id}`} className="text-sm font-medium">Company</Label>
                              <Input 
                                id={`company-${exp.id}`} 
                                placeholder="Company Name" 
                                value={exp.company}
                                onChange={(e) => updateWorkExperience(exp.id, "company", e.target.value)}
                                className="mt-1.5"
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor={`position-${exp.id}`} className="text-sm font-medium">Position</Label>
                              <Input 
                                id={`position-${exp.id}`} 
                                placeholder="Your Title" 
                                value={exp.position}
                                onChange={(e) => updateWorkExperience(exp.id, "position", e.target.value)}
                                className="mt-1.5"
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor={`location-${exp.id}`} className="text-sm font-medium">Location</Label>
                              <Input 
                                id={`location-${exp.id}`} 
                                placeholder="City, State" 
                                value={exp.location}
                                onChange={(e) => updateWorkExperience(exp.id, "location", e.target.value)}
                                className="mt-1.5"
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor={`startDate-${exp.id}`} className="text-sm font-medium">Start Date</Label>
                                <Input 
                                  id={`startDate-${exp.id}`} 
                                  placeholder="MM/YYYY" 
                                  value={exp.startDate}
                                  onChange={(e) => updateWorkExperience(exp.id, "startDate", e.target.value)}
                                  className="mt-1.5"
                                />
                              </div>
                              <div>
                                <Label htmlFor={`endDate-${exp.id}`} className="text-sm font-medium">End Date</Label>
                                <Input 
                                  id={`endDate-${exp.id}`} 
                                  placeholder="MM/YYYY or Present" 
                                  value={exp.endDate}
                                  onChange={(e) => updateWorkExperience(exp.id, "endDate", e.target.value)}
                                  disabled={exp.isCurrent}
                                  className="mt-1.5"
                                />
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`isCurrent-${exp.id}`}
                                checked={exp.isCurrent}
                                onChange={(e) => updateWorkExperience(exp.id, "isCurrent", e.target.checked)}
                                className="rounded border-gray-300"
                              />
                              <Label htmlFor={`isCurrent-${exp.id}`} className="text-sm">I currently work here</Label>
                            </div>
                            
                            <div>
                              <Label htmlFor={`description-${exp.id}`} className="text-sm font-medium">Description</Label>
                              <Textarea 
                                id={`description-${exp.id}`} 
                                placeholder="Describe your responsibilities and achievements..." 
                                className="mt-1.5 min-h-[100px]" 
                                value={exp.description}
                                onChange={(e) => updateWorkExperience(exp.id, "description", e.target.value)}
                              />
                            </div>
                          </div>
                          
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => removeWorkExperience(exp.id)}
                            className="mb-3"
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Remove
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                
                <Button onClick={addWorkExperience} className="w-full gap-1" variant="outline">
                  <PlusCircle className="h-4 w-4" /> Add More Experience
                </Button>
              </>
            )}
          </CardContent>
        )}
      </Card>
      
      {/* Skills Section */}
      <Card className="border shadow-sm">
        <CardHeader className="bg-muted/30 pb-3 cursor-pointer" onClick={() => toggleSectionExpansion('skills')}>
          <CardTitle className="text-lg font-medium flex items-center justify-between">
            <div className="flex items-center">
              <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 inline-flex items-center justify-center text-sm mr-2">4</span>
              Skills
            </div>
            {expandedSections.skills ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </CardTitle>
        </CardHeader>
        {expandedSections.skills && (
          <CardContent className="pt-6 space-y-4">
            {skills.length === 0 ? (
              <div className="text-center py-8 bg-muted/10 rounded-lg border border-dashed">
                <p className="text-muted-foreground mb-4">
                  Add skills relevant to your resume
                </p>
                <Button onClick={addSkill} size="sm" className="gap-1">
                  <PlusCircle className="h-4 w-4" />
                  Add Skill
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-4">
                  {skills.map((skill: any, index: number) => (
                    <div key={skill.id} className="flex items-center space-x-2 bg-muted/10 p-3 rounded-md border">
                      <Input 
                        placeholder="Skill name (e.g. JavaScript, Project Management, etc.)"
                        value={skill.name}
                        onChange={(e) => updateSkill(skill.id, "name", e.target.value)}
                        className="flex-grow"
                      />
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeSkill(skill.id)}
                        className="h-9 w-9 rounded-full hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                <Button onClick={addSkill} className="w-full gap-1" variant="outline">
                  <PlusCircle className="h-4 w-4" /> Add More Skills
                </Button>
              </>
            )}
          </CardContent>
        )}
      </Card>
      
      {/* Section Reordering */}
      <Card className="border shadow-sm">
        <CardHeader className="bg-muted/30 pb-3">
          <CardTitle className="text-lg font-medium flex items-center">
            <AlignJustify className="h-5 w-5 mr-2" />
            Section Order
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground mb-4">
              Reorder sections to customize how they appear in your resume.
            </p>
            
            <div className="space-y-2">
              {sectionOrder.map((sectionId, index) => {
                let sectionTitle = getSectionTitle(sectionId);
                
                return (
                  <div 
                    key={sectionId} 
                    className="flex items-center justify-between p-3 bg-background border rounded-md"
                  >
                    <div className="flex items-center space-x-2">
                      <GripVertical className="h-5 w-5 text-muted-foreground" />
                      <span>{index + 1}. {sectionTitle}</span>
                    </div>
                    <div className="flex space-x-1">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => moveSectionUp(sectionId)}
                        disabled={index === 0}
                        className="h-8 w-8"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => moveSectionDown(sectionId)}
                        disabled={index === sectionOrder.length - 1}
                        className="h-8 w-8"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      {sectionId !== 'personalInfo' && (
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => removeSectionFromOrder(sectionId)}
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Add available sections back */}
            {getAvailableSections().length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Available Sections</h4>
                <div className="space-y-2">
                  {getAvailableSections().map(sectionId => (
                    <div 
                      key={`available-${sectionId}`} 
                      className="flex items-center justify-between p-3 bg-muted/20 border-dashed border rounded-md"
                    >
                      <span>{getSectionTitle(sectionId)}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => addSectionToOrder(sectionId)}
                        className="h-8"
                      >
                        <PlusCircle className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 