"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { PlusCircle, Trash2 } from "lucide-react"

type ResumeEditorProps = {
  resume: any
  onUpdate: (key: string, value: any) => void
}

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
  const projects = content.projects || []
  
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
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Personal Information</h3>
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input 
                id="fullName" 
                placeholder="John Doe" 
                value={personalInfo.fullName}
                onChange={(e) => updatePersonalInfo("fullName", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="title">Professional Title</Label>
              <Input 
                id="title" 
                placeholder="Software Engineer" 
                value={personalInfo.title}
                onChange={(e) => updatePersonalInfo("title", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                placeholder="john@example.com" 
                type="email" 
                value={personalInfo.email}
                onChange={(e) => updatePersonalInfo("email", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone" 
                placeholder="(123) 456-7890" 
                value={personalInfo.phone}
                onChange={(e) => updatePersonalInfo("phone", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input 
                id="location" 
                placeholder="New York, NY" 
                value={personalInfo.location}
                onChange={(e) => updatePersonalInfo("location", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="website">Website (Optional)</Label>
              <Input 
                id="website" 
                placeholder="https://yourwebsite.com" 
                value={personalInfo.website}
                onChange={(e) => updatePersonalInfo("website", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="linkedIn">LinkedIn (Optional)</Label>
              <Input 
                id="linkedIn" 
                placeholder="https://linkedin.com/in/username" 
                value={personalInfo.linkedIn}
                onChange={(e) => updatePersonalInfo("linkedIn", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Professional Summary</h3>
        <Card>
          <CardContent className="pt-4">
            <div className="grid gap-2">
              <Label htmlFor="summary">Summary</Label>
              <Textarea 
                id="summary" 
                placeholder="Brief professional summary..." 
                className="min-h-[100px]" 
                value={summary}
                onChange={(e) => updateSummary(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Work Experience</h3>
        <Card>
          <CardContent className="pt-4 space-y-4">
            {experience.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No work experience added yet. Add your first work experience.
              </p>
            ) : (
              <Accordion type="multiple" className="w-full">
                {experience.map((exp: any, index: number) => (
                  <AccordionItem key={exp.id} value={exp.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex justify-between w-full pr-4">
                        <span>{exp.position || exp.company || `Work Experience ${index + 1}`}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3 pb-4">
                      <div className="grid gap-2">
                        <Label htmlFor={`company-${exp.id}`}>Company</Label>
                        <Input 
                          id={`company-${exp.id}`} 
                          placeholder="Company Name" 
                          value={exp.company}
                          onChange={(e) => updateWorkExperience(exp.id, "company", e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor={`position-${exp.id}`}>Position</Label>
                        <Input 
                          id={`position-${exp.id}`} 
                          placeholder="Your Title" 
                          value={exp.position}
                          onChange={(e) => updateWorkExperience(exp.id, "position", e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor={`location-${exp.id}`}>Location</Label>
                        <Input 
                          id={`location-${exp.id}`} 
                          placeholder="City, State" 
                          value={exp.location}
                          onChange={(e) => updateWorkExperience(exp.id, "location", e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor={`startDate-${exp.id}`}>Start Date</Label>
                          <Input 
                            id={`startDate-${exp.id}`} 
                            placeholder="MM/YYYY" 
                            value={exp.startDate}
                            onChange={(e) => updateWorkExperience(exp.id, "startDate", e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor={`endDate-${exp.id}`}>End Date</Label>
                          <Input 
                            id={`endDate-${exp.id}`} 
                            placeholder="MM/YYYY or Present" 
                            value={exp.endDate}
                            onChange={(e) => updateWorkExperience(exp.id, "endDate", e.target.value)}
                            disabled={exp.isCurrent}
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`isCurrent-${exp.id}`}
                          checked={exp.isCurrent}
                          onChange={(e) => updateWorkExperience(exp.id, "isCurrent", e.target.checked)}
                        />
                        <Label htmlFor={`isCurrent-${exp.id}`}>I currently work here</Label>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor={`description-${exp.id}`}>Description</Label>
                        <Textarea 
                          id={`description-${exp.id}`} 
                          placeholder="Describe your responsibilities and achievements..." 
                          className="min-h-[100px]" 
                          value={exp.description}
                          onChange={(e) => updateWorkExperience(exp.id, "description", e.target.value)}
                        />
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => removeWorkExperience(exp.id)}
                        className="mt-2"
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Remove
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
            <Button className="w-full" onClick={addWorkExperience}>
              <PlusCircle className="h-4 w-4 mr-1" /> Add Work Experience
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Education</h3>
        <Card>
          <CardContent className="pt-4 space-y-4">
            {education.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No education added yet. Add your educational background.
              </p>
            ) : (
              <Accordion type="multiple" className="w-full">
                {education.map((edu: any, index: number) => (
                  <AccordionItem key={edu.id} value={edu.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex justify-between w-full pr-4">
                        <span>{edu.institution || edu.degree || `Education ${index + 1}`}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3 pb-4">
                      <div className="grid gap-2">
                        <Label htmlFor={`institution-${edu.id}`}>Institution</Label>
                        <Input 
                          id={`institution-${edu.id}`} 
                          placeholder="University/School Name" 
                          value={edu.institution}
                          onChange={(e) => updateEducation(edu.id, "institution", e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor={`degree-${edu.id}`}>Degree</Label>
                        <Input 
                          id={`degree-${edu.id}`} 
                          placeholder="Bachelor of Science" 
                          value={edu.degree}
                          onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor={`fieldOfStudy-${edu.id}`}>Field of Study</Label>
                        <Input 
                          id={`fieldOfStudy-${edu.id}`} 
                          placeholder="Computer Science" 
                          value={edu.fieldOfStudy}
                          onChange={(e) => updateEducation(edu.id, "fieldOfStudy", e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor={`location-${edu.id}`}>Location</Label>
                        <Input 
                          id={`location-${edu.id}`} 
                          placeholder="City, State" 
                          value={edu.location}
                          onChange={(e) => updateEducation(edu.id, "location", e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor={`startDate-${edu.id}`}>Start Date</Label>
                          <Input 
                            id={`startDate-${edu.id}`} 
                            placeholder="MM/YYYY" 
                            value={edu.startDate}
                            onChange={(e) => updateEducation(edu.id, "startDate", e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor={`endDate-${edu.id}`}>End Date</Label>
                          <Input 
                            id={`endDate-${edu.id}`} 
                            placeholder="MM/YYYY or Present" 
                            value={edu.endDate}
                            onChange={(e) => updateEducation(edu.id, "endDate", e.target.value)}
                            disabled={edu.isCurrent}
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`isCurrent-${edu.id}`}
                          checked={edu.isCurrent}
                          onChange={(e) => updateEducation(edu.id, "isCurrent", e.target.checked)}
                        />
                        <Label htmlFor={`isCurrent-${edu.id}`}>I'm currently studying here</Label>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor={`gpa-${edu.id}`}>GPA (Optional)</Label>
                        <Input 
                          id={`gpa-${edu.id}`} 
                          placeholder="3.8/4.0" 
                          value={edu.gpa}
                          onChange={(e) => updateEducation(edu.id, "gpa", e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor={`description-${edu.id}`}>Description (Optional)</Label>
                        <Textarea 
                          id={`description-${edu.id}`} 
                          placeholder="Relevant coursework, achievements, etc." 
                          className="min-h-[100px]" 
                          value={edu.description}
                          onChange={(e) => updateEducation(edu.id, "description", e.target.value)}
                        />
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => removeEducation(edu.id)}
                        className="mt-2"
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Remove
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
            <Button className="w-full" onClick={addEducation}>
              <PlusCircle className="h-4 w-4 mr-1" /> Add Education
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Skills</h3>
        <Card>
          <CardContent className="pt-4 space-y-4">
            {skills.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No skills added yet. Add skills relevant to your resume.
              </p>
            ) : (
              <div className="space-y-4">
                {skills.map((skill: any, index: number) => (
                  <div key={skill.id} className="flex items-center space-x-2">
                    <Input 
                      placeholder="Skill name"
                      value={skill.name}
                      onChange={(e) => updateSkill(skill.id, "name", e.target.value)}
                      className="flex-grow"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => removeSkill(skill.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <Button className="w-full" onClick={addSkill}>
              <PlusCircle className="h-4 w-4 mr-1" /> Add Skill
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 