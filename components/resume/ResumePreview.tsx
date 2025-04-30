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
  const template = resume?.template || 'professional'
  
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
  
  // Default text color for the document
  const defaultTextColor = useMemo(() => {
    return style.textColor || (isDarkBackground ? '#ffffff' : '#000000')
  }, [style.textColor, isDarkBackground])
  
  // Muted text color for secondary elements
  const mutedTextColor = useMemo(() => {
    // If there's a text color set, create a slightly muted version
    if (style.textColor) {
      return style.textColor + '99'; // Add 60% opacity
    }
    return isDarkBackground ? '#cccccc' : '#666666'
  }, [style.textColor, isDarkBackground])
  
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
      ? `border-b border-gray-500 mb-3`
      : `border-b mb-3`
    
    return `text-lg font-bold pb-1 ${textColorClass}`
  }, [isDarkBackground])
  
  // Get heading color
  const headingColorStyle = useMemo(() => {
    // If there's a primary color, use it for headings
    const primaryColor = style.primaryColor || '#4f46e5'
    
    // If there's a text color setting, prioritize it over default styles
    if (style.textColor) {
      return { color: style.textColor }
    }
    
    // Otherwise, use primary color with conditional dark background handling
    return { 
      color: isDarkBackground ? '#ffffff' : primaryColor 
    }
  }, [style.primaryColor, style.textColor, isDarkBackground])
  
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
  const renderStandardSection = (sectionType: string) => {
    switch (sectionType) {
      case 'summary':
        return content.summary ? (
          <div className="mb-4" key="summary-section">
            <h2 className={headingClass} style={headingColorStyle}>Professional Summary</h2>
            <p className="whitespace-pre-line" style={{ color: defaultTextColor }}>{content.summary}</p>
          </div>
        ) : null
      
      case 'experience':
        return experience.length > 0 ? (
          <div className="mb-4" key="experience-section">
            <h2 className={headingClass} style={headingColorStyle}>Work Experience</h2>
            
            <div className="space-y-4">
              {experience.map((exp: any) => (
                <div key={exp.id} className="mb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold" style={{ color: defaultTextColor }}>{exp.position}</h3>
                      <p style={{ color: defaultTextColor }}>{exp.company}{exp.location ? `, ${exp.location}` : ''}</p>
                    </div>
                    
                    {settings.showDates !== false && exp.startDate && (
                      <div className={`text-right text-xs`} style={{ color: mutedTextColor }}>
                        <span>
                          {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {exp.description && (
                    <p className="mt-2 whitespace-pre-line text-xs" style={{ color: defaultTextColor }}>{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null
      
      case 'education':
        return education.length > 0 ? (
          <div className="mb-4" key="education-section">
            <h2 className={headingClass} style={headingColorStyle}>Education</h2>
            
            <div className="space-y-4">
              {education.map((edu: any) => (
                <div key={edu.id} className="mb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold" style={{ color: defaultTextColor }}>{edu.institution}</h3>
                      <p style={{ color: defaultTextColor }}>{edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}</p>
                      {edu.location && <p className={`text-xs`} style={{ color: mutedTextColor }}>{edu.location}</p>}
                    </div>
                    
                    {settings.showDates !== false && (
                      <div className={`text-right text-xs`} style={{ color: mutedTextColor }}>
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
                    <p className="mt-2 whitespace-pre-line text-xs" style={{ color: defaultTextColor }}>{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null
      
      case 'skills':
        return skills.length > 0 ? (
          <div className="mb-4" key="skills-section">
            <h2 className={headingClass} style={headingColorStyle}>Skills</h2>
            
            <div className="flex flex-wrap gap-2">
              {skills.map((skill: any) => (
                <span 
                  key={skill.id}
                  className="px-2 py-1 rounded text-xs"
                  style={{ 
                    color: defaultTextColor,
                    backgroundColor: isDarkBackground ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
                  }}
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

  // Modern template - with bullet points and a different layout
  const renderModernSection = (sectionType: string) => {
    const primaryColor = style.primaryColor || "#8b5cf6";
    
    switch (sectionType) {
      case 'summary':
        return content.summary ? (
          <div className="mb-5" key="summary-section">
            <div className="flex items-center mb-2">
              <div className="h-4 w-4 rounded-full mr-2" style={{ backgroundColor: primaryColor }}></div>
              <h2 className="text-lg font-bold" style={{ color: defaultTextColor }}>Professional Summary</h2>
            </div>
            <p className="whitespace-pre-line ml-6" style={{ color: defaultTextColor }}>{content.summary}</p>
          </div>
        ) : null
      
      case 'experience':
        return experience.length > 0 ? (
          <div className="mb-5" key="experience-section">
            <div className="flex items-center mb-2">
              <div className="h-4 w-4 rounded-full mr-2" style={{ backgroundColor: primaryColor }}></div>
              <h2 className="text-lg font-bold" style={{ color: defaultTextColor }}>Work Experience</h2>
            </div>
            
            <div className="space-y-4 ml-6">
              {experience.map((exp: any) => (
                <div key={exp.id} className="mb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold" style={{ color: defaultTextColor }}>{exp.position}</h3>
                      <p style={{ color: primaryColor, fontWeight: 500 }}>{exp.company}{exp.location ? ` | ${exp.location}` : ''}</p>
                    </div>
                    
                    {settings.showDates !== false && exp.startDate && (
                      <div className="text-right text-xs" style={{ color: primaryColor, fontWeight: 500 }}>
                        <span>
                          {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {exp.description && (
                    <p className="mt-2 whitespace-pre-line text-xs" style={{ color: defaultTextColor }}>{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null
      
      case 'education':
        return education.length > 0 ? (
          <div className="mb-5" key="education-section">
            <div className="flex items-center mb-2">
              <div className="h-4 w-4 rounded-full mr-2" style={{ backgroundColor: primaryColor }}></div>
              <h2 className="text-lg font-bold" style={{ color: defaultTextColor }}>Education</h2>
            </div>
            
            <div className="space-y-4 ml-6">
              {education.map((edu: any) => (
                <div key={edu.id} className="mb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold" style={{ color: defaultTextColor }}>{edu.institution}</h3>
                      <p style={{ color: primaryColor, fontWeight: 500 }}>{edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}</p>
                    </div>
                    
                    {settings.showDates !== false && (
                      <div className="text-right text-xs" style={{ color: primaryColor, fontWeight: 500 }}>
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
                    <p className="mt-2 whitespace-pre-line text-xs" style={{ color: defaultTextColor }}>{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null
      
      case 'skills':
        return skills.length > 0 ? (
          <div className="mb-5" key="skills-section">
            <div className="flex items-center mb-2">
              <div className="h-4 w-4 rounded-full mr-2" style={{ backgroundColor: primaryColor }}></div>
              <h2 className="text-lg font-bold" style={{ color: defaultTextColor }}>Skills</h2>
            </div>
            
            <div className="flex flex-wrap gap-2 ml-6">
              {skills.map((skill: any) => (
                <span 
                  key={skill.id}
                  className="px-2 py-1 rounded text-xs"
                  style={{ 
                    color: '#fff',
                    backgroundColor: primaryColor
                  }}
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

  // Academic template - focuses on education and publications
  const renderAcademicSection = (sectionType: string) => {
    const primaryColor = style.primaryColor || "#10b981";
    
    switch (sectionType) {
      case 'summary':
        return content.summary ? (
          <div className="mb-5" key="summary-section">
            <h2 className="text-lg font-bold border-b-2 pb-1 mb-3" style={{ color: defaultTextColor, borderColor: primaryColor }}>Professional Summary</h2>
            <p className="whitespace-pre-line" style={{ color: defaultTextColor }}>{content.summary}</p>
          </div>
        ) : null
      
      case 'experience':
        return experience.length > 0 ? (
          <div className="mb-5" key="experience-section">
            <h2 className="text-lg font-bold border-b-2 pb-1 mb-3" style={{ color: defaultTextColor, borderColor: primaryColor }}>Work Experience</h2>
            
            <div className="space-y-4 border-l-2 pl-4" style={{ borderColor: primaryColor }}>
              {experience.map((exp: any) => (
                <div key={exp.id} className="mb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold" style={{ color: defaultTextColor }}>{exp.position}</h3>
                      <p style={{ color: defaultTextColor }}>{exp.company}{exp.location ? `, ${exp.location}` : ''}</p>
                    </div>
                    
                    {settings.showDates !== false && exp.startDate && (
                      <div className="text-right text-xs" style={{ color: mutedTextColor }}>
                        <span>
                          {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {exp.description && (
                    <p className="mt-2 whitespace-pre-line text-xs" style={{ color: defaultTextColor }}>{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null
      
      case 'education':
        return education.length > 0 ? (
          <div className="mb-5" key="education-section">
            <h2 className="text-lg font-bold border-b-2 pb-1 mb-3" style={{ color: defaultTextColor, borderColor: primaryColor }}>Education</h2>
            
            <div className="space-y-4 border-l-2 pl-4" style={{ borderColor: primaryColor }}>
              {education.map((edu: any) => (
                <div key={edu.id} className="mb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold" style={{ color: defaultTextColor }}>{edu.institution}</h3>
                      <p style={{ color: defaultTextColor }}>{edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}</p>
                      {edu.location && <p className="text-xs" style={{ color: mutedTextColor }}>{edu.location}</p>}
                    </div>
                    
                    {settings.showDates !== false && (
                      <div className="text-right text-xs" style={{ color: mutedTextColor }}>
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
                    <p className="mt-2 whitespace-pre-line text-xs" style={{ color: defaultTextColor }}>{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null
      
      case 'skills':
        return skills.length > 0 ? (
          <div className="mb-5" key="skills-section">
            <h2 className="text-lg font-bold border-b-2 pb-1 mb-3" style={{ color: defaultTextColor, borderColor: primaryColor }}>Skills</h2>
            
            <div className="border-l-2 pl-4" style={{ borderColor: primaryColor }}>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: any) => (
                  <span 
                    key={skill.id}
                    className="px-2 py-1 rounded text-xs"
                    style={{ 
                      color: defaultTextColor,
                      backgroundColor: isDarkBackground ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
                    }}
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : null
      
      default:
        return null
    }
  }

  // Select the correct section renderer based on template
  const renderSection = (sectionType: string) => {
    switch (template.toLowerCase()) {
      case 'modern':
        return renderModernSection(sectionType);
      case 'academic':
        return renderAcademicSection(sectionType);
      case 'professional':
      case 'standard':
      default:
        return renderStandardSection(sectionType);
    }
  }

  // Template-specific header styles
  const renderHeader = () => {
    switch (template.toLowerCase()) {
      case 'modern':
        return (
          <div className="mb-6 relative">
            {personalInfo.fullName && (
              <>
                <h1 className="text-2xl font-bold" style={{ 
                  color: style.textColor || defaultTextColor 
                }}>{personalInfo.fullName}</h1>
                {personalInfo.title && (
                  <p className="text-sm" style={{ color: style.primaryColor || "#8b5cf6" }}>{personalInfo.title}</p>
                )}
              </>
            )}
            
            {/* Contact Information */}
            {settings.showContact !== false && (
              <div className="flex flex-wrap gap-2 mt-2 text-xs" style={{ color: defaultTextColor }}>
                {personalInfo.email && <span>{personalInfo.email}</span>}
                {personalInfo.phone && <span>{personalInfo.phone}</span>}
                {personalInfo.location && <span>{personalInfo.location}</span>}
                {personalInfo.website && <span>{personalInfo.website}</span>}
                {personalInfo.linkedIn && <span>{personalInfo.linkedIn}</span>}
              </div>
            )}
          </div>
        );
      
      case 'academic':
        return (
          <div className="flex items-center justify-between mb-6">
            <div>
              {personalInfo.fullName && (
                <>
                  <h1 className="text-2xl font-bold" style={{ 
                    color: style.textColor || defaultTextColor 
                  }}>{personalInfo.fullName}</h1>
                  {personalInfo.title && (
                    <p className="text-sm" style={{ color: style.primaryColor || "#10b981" }}>{personalInfo.title}</p>
                  )}
                </>
              )}
            </div>
            
            {/* Contact Information */}
            {settings.showContact !== false && (
              <div className="text-right text-xs" style={{ color: defaultTextColor }}>
                {personalInfo.email && <div>{personalInfo.email}</div>}
                {personalInfo.phone && <div>{personalInfo.phone}</div>}
                {personalInfo.location && <div>{personalInfo.location}</div>}
                {personalInfo.website && <div>{personalInfo.website}</div>}
                {personalInfo.linkedIn && <div>{personalInfo.linkedIn}</div>}
              </div>
            )}
          </div>
        );
      
      case 'professional':
      case 'standard':
      default:
        return (
          <div className="text-center mb-6">
            {personalInfo.fullName && (
              <h1 className="text-2xl font-bold" style={{ 
                color: style.textColor ? style.textColor : (style.primaryColor || '#4f46e5')
              }}>{personalInfo.fullName}</h1>
            )}
            
            {personalInfo.title && (
              <p className="mt-1" style={{ color: mutedTextColor }}>{personalInfo.title}</p>
            )}
            
            {/* Contact Information */}
            {settings.showContact !== false && (
              <div className="flex justify-center flex-wrap gap-x-4 gap-y-1 mt-3 text-xs" style={{ color: defaultTextColor }}>
                {personalInfo.email && <span>{personalInfo.email}</span>}
                {personalInfo.phone && <span>{personalInfo.phone}</span>}
                {personalInfo.location && <span>{personalInfo.location}</span>}
                {personalInfo.website && <span>{personalInfo.website}</span>}
                {personalInfo.linkedIn && <span>{personalInfo.linkedIn}</span>}
              </div>
            )}
          </div>
        );
    }
  };
  
  return (
    <div 
      className={`${fontSizeClass} ${spacingClass}`}
      style={{ 
        fontFamily: `"${style.fontFamily}", sans-serif` || '"Inter", sans-serif',
        color: defaultTextColor,
        '--primary-color': style.primaryColor || '#4f46e5'
      } as React.CSSProperties}
    >
      {/* Header / Personal Info */}
      {renderHeader()}
      
      {/* Render sections in order */}
      {sections.map((section, index) => (
        <React.Fragment key={`section-${section}-${index}`}>
          {renderSection(section)}
        </React.Fragment>
      ))}
    </div>
  )
} 