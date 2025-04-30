"use client"

import { useMemo } from "react"
import React from "react"

type ResumePreviewProps = {
  resume: any
}

type ColorMap = {
  [key: string]: string
}

type SpacingMap = {
  [key: string]: string
}

type FontSizeMap = {
  [key: string]: string
}

export default function ResumePreview({ resume }: ResumePreviewProps) {
  const content = resume?.content || {}
  const style = resume?.style || {
    fontFamily: 'Inter',
    primaryColor: '#4f46e5',
    fontSize: 'medium',
    spacing: 'comfortable',
    backgroundColor: '#ffffff',
    textColor: '#000000'
  }
  const settings = resume?.settings || {
    showDates: true,
    showContact: true,
    sectionOrder: 'standard'
  }
  
  // Personal info
  const personalInfo = content.personalInfo || {}
  
  // Experience
  const experience = content.experience || []
  
  // Education
  const education = content.education || []
  
  // Skills
  const skills = content.skills || []
  
  // Determine text color based on background
  const textMutedClass = useMemo(() => {
    return style.backgroundColor === '#1f2937' ? 'text-gray-300' : 'text-gray-600'
  }, [style.backgroundColor])
  
  // Determine if we're using a dark background
  const isDarkBackground = useMemo(() => {
    return style.backgroundColor === '#1f2937'
  }, [style.backgroundColor])
  
  // Generate class for headings based on style
  const headingClass = useMemo(() => {
    const colorClass: ColorMap = {
      '#4f46e5': 'text-indigo-600 dark:text-indigo-400',
      '#ef4444': 'text-red-600 dark:text-red-400',
      '#10b981': 'text-emerald-600 dark:text-emerald-400',
      '#6366f1': 'text-violet-600 dark:text-violet-400',
      '#f59e0b': 'text-amber-600 dark:text-amber-400',
      '#3b82f6': 'text-blue-600 dark:text-blue-400',
    }
    
    // If background is dark, adjust the text color to be lighter
    const textColorClass = isDarkBackground 
      ? `text-white border-b border-gray-500 mb-3`
      : `${colorClass[style.primaryColor as string] || 'text-indigo-600'} border-b mb-3`
    
    return `text-lg font-bold pb-1 ${textColorClass}`
  }, [style.primaryColor, isDarkBackground])
  
  // Generate spacing class based on style
  const spacingClass = useMemo(() => {
    const spacingOptions: SpacingMap = {
      'compact': 'space-y-2',
      'comfortable': 'space-y-4',
      'spacious': 'space-y-6'
    }
    
    return spacingOptions[style.spacing as string] || 'space-y-4'
  }, [style.spacing])
  
  // Generate font size class based on style
  const fontSizeClass = useMemo(() => {
    const sizeOptions: FontSizeMap = {
      'small': 'text-xs',
      'medium': 'text-sm',
      'large': 'text-base',
    }
    
    return sizeOptions[style.fontSize as string] || 'text-sm'
  }, [style.fontSize])
  
  // Determine section order based on settings
  const sections = useMemo(() => {
    const sectionOrder = settings.sectionOrder || 'standard'
    
    if (sectionOrder === 'education-first') {
      return ['summary', 'education', 'experience', 'skills']
    } else if (sectionOrder === 'skills-first') {
      return ['summary', 'skills', 'experience', 'education']
    } else {
      // Standard order
      return ['summary', 'experience', 'education', 'skills']
    }
  }, [settings.sectionOrder])
  
  // Render section based on type
  const renderSection = (sectionType: string) => {
    switch (sectionType) {
      case 'summary':
        return content.summary ? (
          <div className="mb-4" key="summary-section">
            <h2 className={headingClass}>Professional Summary</h2>
            <p className="whitespace-pre-line">{content.summary}</p>
          </div>
        ) : null
      
      case 'experience':
        return experience.length > 0 ? (
          <div className="mb-4" key="experience-section">
            <h2 className={headingClass}>Work Experience</h2>
            
            <div className="space-y-4">
              {experience.map((exp: any) => (
                <div key={exp.id} className="mb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{exp.position}</h3>
                      <p>{exp.company}{exp.location ? `, ${exp.location}` : ''}</p>
                    </div>
                    
                    {settings.showDates !== false && exp.startDate && (
                      <div className={`text-right text-xs ${textMutedClass}`}>
                        <span>
                          {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {exp.description && (
                    <p className="mt-2 whitespace-pre-line text-xs">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null
      
      case 'education':
        return education.length > 0 ? (
          <div className="mb-4" key="education-section">
            <h2 className={headingClass}>Education</h2>
            
            <div className="space-y-4">
              {education.map((edu: any) => (
                <div key={edu.id} className="mb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{edu.institution}</h3>
                      <p>{edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}</p>
                      {edu.location && <p className={`text-xs ${textMutedClass}`}>{edu.location}</p>}
                    </div>
                    
                    {settings.showDates !== false && (
                      <div className={`text-right text-xs ${textMutedClass}`}>
                        {edu.startDate && (
                          <span>
                            {edu.startDate} - {edu.isCurrent ? 'Present' : edu.endDate}
                          </span>
                        )}
                        {edu.gpa && <div>GPA: {edu.gpa}</div>}
                      </div>
                    )}
                  </div>
                  
                  {edu.description && (
                    <p className="mt-2 whitespace-pre-line text-xs">{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null
      
      case 'skills':
        return skills.length > 0 ? (
          <div className="mb-4" key="skills-section">
            <h2 className={headingClass}>Skills</h2>
            
            <div className="flex flex-wrap gap-2">
              {skills.map((skill: any) => (
                <span 
                  key={skill.id}
                  className="px-2 py-1 bg-muted rounded text-xs"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        ) : null
      
      default:
        return null
    }
  }
  
  return (
    <div 
      className={`${fontSizeClass} ${spacingClass}`}
      style={{ 
        fontFamily: `"${style.fontFamily}", sans-serif` || '"Inter", sans-serif',
        color: style.textColor || (isDarkBackground ? '#ffffff' : '#000000'),
        '--primary-color': style.primaryColor || '#4f46e5'
      } as React.CSSProperties}
    >
      {/* Header / Personal Info */}
      <div className="text-center mb-6">
        {personalInfo.fullName && (
          <h1 className="text-2xl font-bold" style={{ color: style.primaryColor || '#4f46e5' }}>{personalInfo.fullName}</h1>
        )}
        
        {personalInfo.title && (
          <p className={`${textMutedClass} mt-1`}>{personalInfo.title}</p>
        )}
        
        {/* Contact Information */}
        {settings.showContact !== false && (
          <div className="flex justify-center flex-wrap gap-x-4 gap-y-1 mt-3 text-xs">
            {personalInfo.email && (
              <span>{personalInfo.email}</span>
            )}
            
            {personalInfo.phone && (
              <span>{personalInfo.phone}</span>
            )}
            
            {personalInfo.location && (
              <span>{personalInfo.location}</span>
            )}
            
            {personalInfo.website && (
              <span>{personalInfo.website}</span>
            )}
            
            {personalInfo.linkedIn && (
              <span>{personalInfo.linkedIn}</span>
            )}
          </div>
        )}
      </div>
      
      {/* Render sections in order */}
      {sections.map((section, index) => (
        <React.Fragment key={`section-${section}-${index}`}>
          {renderSection(section)}
        </React.Fragment>
      ))}
    </div>
  )
} 