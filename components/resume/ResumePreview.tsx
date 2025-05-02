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
  const settings = content || {
    showDates: true,
    showContact: true
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
  
  // Languages
  const languages = content.languages || []
  
  // Certifications
  const certifications = content.certifications || []
  
  // Publications
  const publications = content.publications || []
  
  // Volunteer Experience
  const volunteer = content.volunteer || []
  
  // Awards
  const awards = content.awards || []
  
  // References
  const references = content.references || []
  
  // Custom sections
  const customSections = content.customSections || []
  
  // Log sections for debugging
  console.log('Rendering with sections:', {
    customSections: customSections.map((s: any) => ({ id: s.id, title: s.title })),
    customSectionOrder: content.customSectionOrder,
    customSectionOrderEnabled: content.customSectionOrderEnabled
  })
  
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
  
  // Apply the lineHeight setting
  const lineHeightClass = useMemo(() => {
    const lineHeightOptions: Record<string, string> = {
      'tight': 'leading-tight',
      'normal': 'leading-normal',
      'relaxed': 'leading-relaxed',
    }
    return lineHeightOptions[style.lineHeight as string] || 'leading-normal'
  }, [style.lineHeight])
  
  // Generate class for headings based on style
  const headingClass = useMemo(() => {
    // Apply header style if defined
    const headerStyle = style.headerStyle || 'underline';
    
    let styleClass = '';
    
    switch (headerStyle) {
      case 'underline':
        styleClass = isDarkBackground 
          ? `border-b border-gray-500 mb-3`
          : `border-b mb-3`;
        break;
      case 'bold':
        styleClass = 'font-extrabold mb-3';
        break;  
      case 'colored':
        styleClass = 'mb-3';
        break;
      case 'uppercase':
        styleClass = 'uppercase tracking-wider mb-3';
        break;
      case 'minimal':
        styleClass = 'mb-2'; 
        break;
      default:
        styleClass = isDarkBackground 
          ? `border-b border-gray-500 mb-3`
          : `border-b mb-3`;
    }
    
    return `text-lg font-bold pb-1 ${styleClass}`
  }, [isDarkBackground, style.headerStyle])
  
  // Get heading color
  const headingColorStyle = useMemo(() => {
    // If there's a primary color, use it for headings
    const primaryColor = style.primaryColor || '#4f46e5'
    
    // If header style is 'colored', always use primary color
    if (style.headerStyle === 'colored') {
      return { color: primaryColor };
    }
    
    // If there's a text color setting, prioritize it over default styles
    if (style.textColor) {
      return { color: style.textColor }
    }
    
    // Otherwise, use primary color with conditional dark background handling
    return { 
      color: isDarkBackground ? '#ffffff' : primaryColor 
    }
  }, [style.primaryColor, style.textColor, isDarkBackground, style.headerStyle])
  
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
  
  // Generate background pattern styles
  const backgroundPatternStyle = useMemo(() => {
    if (!style.backgroundPattern) return {};
    
    const patternStyle = style.patternStyle || 'dots';
    const primaryColor = style.primaryColor || '#4f46e5';
    const backgroundColor = style.backgroundColor || '#ffffff';
    
    // Create a very subtle version of the primary color
    const patternColor = isDarkBackground
      ? 'rgba(255, 255, 255, 0.03)'
      : `${primaryColor}10`; // 10% opacity
    
    switch (patternStyle) {
      case 'dots':
        return {
          backgroundImage: `radial-gradient(${patternColor} 1px, ${backgroundColor} 1px)`,
          backgroundSize: '20px 20px'
        };
      case 'lines':
        return {
          backgroundImage: `linear-gradient(${patternColor} 1px, transparent 1px)`,
          backgroundSize: '100% 20px'
        };
      case 'grid':
        return {
          backgroundImage: `linear-gradient(${patternColor} 1px, transparent 1px), 
                            linear-gradient(to right, ${patternColor} 1px, ${backgroundColor} 1px)`,
          backgroundSize: '20px 20px'
        };
      default:
        return {};
    }
  }, [style.backgroundPattern, style.patternStyle, style.primaryColor, style.backgroundColor, isDarkBackground]);
  
  // Get section divider styles
  const getSectionDividerStyle = () => {
    const dividerStyle = style.sectionDivider || 'none';
    const primaryColor = style.primaryColor || '#4f46e5';
    
    switch (dividerStyle) {
      case 'line':
        return <div className="w-full h-px my-4" style={{ backgroundColor: `${primaryColor}40` }}></div>;
      case 'spacer':
        return <div className="h-6"></div>;
      case 'dot':
        return <div className="w-full h-px my-4 border-t border-dotted" style={{ borderColor: `${primaryColor}60` }}></div>;
      case 'dash':
        return <div className="w-full h-px my-4 border-t border-dashed" style={{ borderColor: `${primaryColor}60` }}></div>;
      default:
        return null;
    }
  };
  
  // Determine section order based on settings
  const sections = useMemo(() => {
    // Log all sections for debugging
    console.log('All custom sections:', customSections.map((s: any) => ({ id: s.id, title: s.title })));
    
    // If custom order is defined in content, use it
    if (content.customSectionOrder && content.customSectionOrder.length > 0) {
      console.log('Using custom order:', content.customSectionOrder);
      return content.customSectionOrder;
    }
    
    // Otherwise use the predefined orders
    if (content.sectionOrder === 'education-first') {
      return ['summary', 'education', 'experience', 'skills', 'languages', 'certifications', 'publications', 'volunteer', 'awards', 'references'];
    } else if (content.sectionOrder === 'skills-first') {
      return ['summary', 'skills', 'experience', 'education', 'languages', 'certifications', 'publications', 'volunteer', 'awards', 'references'];
    } else {
      // Standard order
      return ['summary', 'experience', 'education', 'skills', 'languages', 'certifications', 'publications', 'volunteer', 'awards', 'references'];
    }
  }, [content.sectionOrder, content.customSectionOrder, customSections]);
  
  // Apply font family to document
  const fontFamilyStyle = useMemo(() => {
    return {
      fontFamily: style.fontFamily || 'Inter, sans-serif'
    };
  }, [style.fontFamily]);
  
  // Apply section layout styles
  const getSectionContainerClass = () => {
    const sectionLayout = style.sectionLayout || 'standard';
    
    switch (sectionLayout) {
      case 'boxed':
        return 'p-4 bg-gray-50 rounded-md shadow-sm dark:bg-gray-800';
      case 'bordered':
        return 'p-4 border rounded-md';
      case 'left-border':
        return 'pl-4 border-l-2';
      default:
        return '';
    }
  };
  
  // Get section container style
  const getSectionContainerStyle = () => {
    const sectionLayout = style.sectionLayout || 'standard';
    const primaryColor = style.primaryColor || '#4f46e5';
    
    if (sectionLayout === 'left-border') {
      return { borderColor: primaryColor };
    }
    
    if (sectionLayout === 'bordered') {
      return { borderColor: `${primaryColor}30` };
    }
    
    return {};
  };
  
  // Render skills based on display style
  const renderSkills = (skills: any[]) => {
    const skillsDisplay = style.skillsDisplay || 'tags';
    const primaryColor = style.primaryColor || '#4f46e5';
    
    switch (skillsDisplay) {
      case 'bullets':
        return (
          <ul className="list-disc pl-5 space-y-1">
            {skills.map((skill: any) => (
              <li key={skill.id} style={{ color: defaultTextColor }}>
                {skill.name}
              </li>
            ))}
          </ul>
        );
      
      case 'comma':
        return (
          <p style={{ color: defaultTextColor }}>
            {skills.map((skill: any, index: number) => (
              <React.Fragment key={skill.id}>
                {skill.name}{index < skills.length - 1 ? ', ' : ''}
              </React.Fragment>
            ))}
          </p>
        );
      
      case 'columns':
        return (
          <div className="grid grid-cols-2 gap-2">
            {skills.map((skill: any) => (
              <div key={skill.id} style={{ color: defaultTextColor }}>
                {skill.name}
              </div>
            ))}
          </div>
        );
      
      case 'categories':
        // Group skills by category
        const categories: Record<string, any[]> = {};
        skills.forEach((skill: any) => {
          const category = skill.category || 'Other';
          if (!categories[category]) {
            categories[category] = [];
          }
          categories[category].push(skill);
        });
        
        return (
          <div className="space-y-3">
            {Object.entries(categories).map(([category, categorySkills]) => (
              <div key={category}>
                <h3 className="text-sm font-medium mb-1" style={{ color: defaultTextColor }}>{category}</h3>
                <div className="flex flex-wrap gap-2">
                  {categorySkills.map((skill: any) => (
                    <span 
                      key={skill.id}
                      className="px-2 py-1 rounded text-xs"
                      style={{ 
                        color: isDarkBackground ? '#fff' : '#000',
                        backgroundColor: isDarkBackground ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
                      }}
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      
      default: // tags
        return (
          <div className="flex flex-wrap gap-2">
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
        );
    }
  };
  
  // Render experience items based on style
  const renderExperienceItems = (experience: any[]) => {
    const experienceStyle = style.experienceStyle || 'standard';
    const primaryColor = style.primaryColor || '#4f46e5';
    const highlightCompany = style.highlightCompany === true;
    
    switch (experienceStyle) {
      case 'compact':
        return (
          <div className="space-y-2">
            {experience.map((exp: any) => (
              <div key={exp.id} className="flex justify-between">
                <div>
                  <p className="font-semibold" style={{ color: defaultTextColor }}>{exp.position} at {exp.company}</p>
                  {exp.description && (
                    <p className="text-xs truncate max-w-xs" style={{ color: mutedTextColor }}>
                      {exp.description.split('\n')[0]}
                    </p>
                  )}
                </div>
                {settings.showDates !== false && exp.startDate && (
                  <div className="text-xs" style={{ color: mutedTextColor }}>
                    {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      
      case 'detailed':
        return (
          <div className="space-y-4">
            {experience.map((exp: any) => (
              <div key={exp.id} className="mb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold" style={{ color: defaultTextColor }}>{exp.position}</h3>
                    <p style={{ 
                      color: highlightCompany ? primaryColor : defaultTextColor,
                      fontWeight: highlightCompany ? 500 : 'normal'
                    }}>
                      {exp.company}{exp.location ? `, ${exp.location}` : ''}
                    </p>
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
                  <div className="mt-2">
                    {exp.description.split('\n').map((line: string, i: number) => (
                      line.trim() && (
                        <div key={i} className="flex text-xs mb-1">
                          <span className="mr-2" style={{ color: primaryColor }}>•</span>
                          <span style={{ color: defaultTextColor }}>{line}</span>
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      
      case 'cards':
        return (
          <div className="grid gap-3">
            {experience.map((exp: any) => (
              <div 
                key={exp.id} 
                className="p-3 rounded-md" 
                style={{ 
                  backgroundColor: isDarkBackground ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                  borderLeft: `3px solid ${primaryColor}`
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold" style={{ color: defaultTextColor }}>{exp.position}</h3>
                    <p style={{ 
                      color: highlightCompany ? primaryColor : defaultTextColor,
                      fontWeight: highlightCompany ? 500 : 'normal'
                    }}>
                      {exp.company}{exp.location ? `, ${exp.location}` : ''}
                    </p>
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
                  <p className="mt-2 whitespace-pre-line text-xs" style={{ color: defaultTextColor }}>
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        );
      
      default: // standard
        return (
          <div className="space-y-4">
            {experience.map((exp: any) => (
              <div key={exp.id} className="mb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold" style={{ color: defaultTextColor }}>{exp.position}</h3>
                    <p style={{ 
                      color: highlightCompany ? primaryColor : defaultTextColor,
                      fontWeight: highlightCompany ? 500 : 'normal'
                    }}>
                      {exp.company}{exp.location ? `, ${exp.location}` : ''}
                    </p>
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
                  <p className="mt-2 whitespace-pre-line text-xs" style={{ color: defaultTextColor }}>
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        );
    }
  };

  // Render standard section with new styling
  const renderStandardSection = (sectionType: string) => {
    const sectionContainerClass = getSectionContainerClass();
    const sectionContainerStyle = getSectionContainerStyle();
    const sectionIcons = style.sectionIcons === true;
    const primaryColor = style.primaryColor || '#4f46e5';
    
    const getSectionIcon = (type: string) => {
      if (!sectionIcons) return null;
      
      switch (type) {
        case 'summary':
          return <span className="mr-2">📝</span>;
        case 'experience':
          return <span className="mr-2">💼</span>;
        case 'education':
          return <span className="mr-2">🎓</span>;
        case 'skills':
          return <span className="mr-2">⚡</span>;
        case 'languages':
          return <span className="mr-2">🌐</span>;
        case 'certifications':
          return <span className="mr-2">🏅</span>;
        case 'publications':
          return <span className="mr-2">📄</span>;
        case 'volunteer':
          return <span className="mr-2">🤝</span>;
        case 'awards':
          return <span className="mr-2">🏆</span>;
        case 'references':
          return <span className="mr-2">👥</span>;
        default:
          return null;
      }
    };
    
    switch (sectionType) {
      case 'summary':
        return content.summary ? (
          <div className={`mb-4 ${sectionContainerClass}`} key="summary-section" style={sectionContainerStyle}>
            <h2 className={headingClass} style={headingColorStyle}>
              {getSectionIcon('summary')}
              Professional Summary
            </h2>
            <p className={`whitespace-pre-line ${lineHeightClass}`} style={{ color: defaultTextColor }}>{content.summary}</p>
            {style.sectionDivider !== 'none' && getSectionDividerStyle()}
          </div>
        ) : null;
      
      case 'experience':
        return experience.length > 0 ? (
          <div className={`mb-4 ${sectionContainerClass}`} key="experience-section" style={sectionContainerStyle}>
            <h2 className={headingClass} style={headingColorStyle}>
              {getSectionIcon('experience')}
              Work Experience
            </h2>
            
            <div className={`${lineHeightClass}`}>
              {renderExperienceItems(experience)}
            </div>
            {style.sectionDivider !== 'none' && getSectionDividerStyle()}
          </div>
        ) : null;
      
      case 'education':
        return education.length > 0 ? (
          <div className={`mb-4 ${sectionContainerClass}`} key="education-section" style={sectionContainerStyle}>
            <h2 className={headingClass} style={headingColorStyle}>
              {getSectionIcon('education')}
              Education
            </h2>
            
            <div className={`space-y-4 ${lineHeightClass}`}>
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
            {style.sectionDivider !== 'none' && getSectionDividerStyle()}
          </div>
        ) : null;
      
      case 'skills':
        return skills.length > 0 ? (
          <div className={`mb-4 ${sectionContainerClass}`} key="skills-section" style={sectionContainerStyle}>
            <h2 className={headingClass} style={headingColorStyle}>
              {getSectionIcon('skills')}
              Skills
            </h2>
            
            {renderSkills(skills)}
            {style.sectionDivider !== 'none' && getSectionDividerStyle()}
          </div>
        ) : null;
      
      case 'languages':
        return languages.length > 0 ? (
          <div className={`mb-4 ${sectionContainerClass}`} key="languages-section" style={sectionContainerStyle}>
            <h2 className={headingClass} style={headingColorStyle}>
              {getSectionIcon('languages')}
              Languages
            </h2>
            
            <div className="space-y-2">
              {languages.map((language: any) => (
                <div key={language.id} className="flex justify-between items-center">
                  <span style={{ color: defaultTextColor }}>{language.name}</span>
                  <span style={{ color: mutedTextColor }}>{language.proficiency}</span>
                </div>
              ))}
            </div>
            {style.sectionDivider !== 'none' && getSectionDividerStyle()}
          </div>
        ) : null;
      
      case 'certifications':
        return certifications.length > 0 ? (
          <div className={`mb-4 ${sectionContainerClass}`} key="certifications-section" style={sectionContainerStyle}>
            <h2 className={headingClass} style={headingColorStyle}>
              {getSectionIcon('certifications')}
              Certifications
            </h2>
            
            <div className={`space-y-4 ${lineHeightClass}`}>
              {certifications.map((cert: any) => (
                <div key={cert.id} className="mb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold" style={{ color: defaultTextColor }}>{cert.name}</h3>
                      {cert.issuer && <p style={{ color: defaultTextColor }}>{cert.issuer}</p>}
                      {cert.credentialId && <p className="text-xs" style={{ color: mutedTextColor }}>ID: {cert.credentialId}</p>}
                    </div>
                    
                    {settings.showDates !== false && cert.issueDate && (
                      <div className="text-right text-xs" style={{ color: mutedTextColor }}>
                        <span>Issued: {cert.issueDate}</span>
                        {cert.expirationDate && <div>Expires: {cert.expirationDate}</div>}
                      </div>
                    )}
                  </div>
                  
                  {cert.credentialUrl && (
                    <a 
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs hover:underline mt-1 inline-block"
                      style={{ color: primaryColor }}
                    >
                      View Credential
                    </a>
                  )}
                </div>
              ))}
            </div>
            {style.sectionDivider !== 'none' && getSectionDividerStyle()}
          </div>
        ) : null;
      
      case 'publications':
        return publications.length > 0 ? (
          <div className={`mb-4 ${sectionContainerClass}`} key="publications-section" style={sectionContainerStyle}>
            <h2 className={headingClass} style={headingColorStyle}>
              {getSectionIcon('publications')}
              Publications
            </h2>
            
            <div className={`space-y-4 ${lineHeightClass}`}>
              {publications.map((pub: any) => (
                <div key={pub.id} className="mb-3">
                  <div>
                    <h3 className="font-semibold" style={{ color: defaultTextColor }}>{pub.title}</h3>
                    {pub.authors && <p style={{ color: defaultTextColor }}>{pub.authors}</p>}
                    <p className="text-xs" style={{ color: mutedTextColor }}>
                      {pub.publication_name && <span>{pub.publication_name}</span>}
                      {pub.publisher && pub.publication_name && <span>, {pub.publisher}</span>}
                      {pub.publisher && !pub.publication_name && <span>{pub.publisher}</span>}
                      {pub.publication_date && <span> ({pub.publication_date})</span>}
                    </p>
                    {pub.description && (
                      <p className="mt-1 text-xs" style={{ color: defaultTextColor }}>{pub.description}</p>
                    )}
                    {(pub.doi || pub.url) && (
                      <div className="mt-1 text-xs">
                        {pub.doi && <span style={{ color: mutedTextColor }}>DOI: {pub.doi}</span>}
                        {pub.url && (
                          <a 
                            href={pub.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ml-2 hover:underline"
                            style={{ color: primaryColor }}
                          >
                            View Publication
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {style.sectionDivider !== 'none' && getSectionDividerStyle()}
          </div>
        ) : null;
        
      case 'volunteer':
        return volunteer.length > 0 ? (
          <div className={`mb-4 ${sectionContainerClass}`} key="volunteer-section" style={sectionContainerStyle}>
            <h2 className={headingClass} style={headingColorStyle}>
              {getSectionIcon('volunteer')}
              Volunteer Experience
            </h2>
            
            <div className={`space-y-4 ${lineHeightClass}`}>
              {volunteer.map((vol: any) => (
                <div key={vol.id} className="mb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold" style={{ color: defaultTextColor }}>{vol.role}</h3>
                      <p style={{ color: defaultTextColor }}>{vol.organization}{vol.location ? `, ${vol.location}` : ''}</p>
                    </div>
                    
                    {settings.showDates !== false && vol.start_date && (
                      <div className="text-right text-xs" style={{ color: mutedTextColor }}>
                        <span>
                          {vol.start_date} - {vol.is_current ? 'Present' : vol.end_date}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {vol.description && (
                    <p className="mt-2 whitespace-pre-line text-xs" style={{ color: defaultTextColor }}>
                      {vol.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
            {style.sectionDivider !== 'none' && getSectionDividerStyle()}
          </div>
        ) : null;
        
      case 'awards':
        return awards.length > 0 ? (
          <div className={`mb-4 ${sectionContainerClass}`} key="awards-section" style={sectionContainerStyle}>
            <h2 className={headingClass} style={headingColorStyle}>
              {getSectionIcon('awards')}
              Awards & Honors
            </h2>
            
            <div className={`space-y-3 ${lineHeightClass}`}>
              {awards.map((award: any) => (
                <div key={award.id} className="mb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold" style={{ color: defaultTextColor }}>{award.title}</h3>
                      {award.issuer && <p style={{ color: defaultTextColor }}>{award.issuer}</p>}
                    </div>
                    
                    {settings.showDates !== false && award.date_received && (
                      <div className="text-right text-xs" style={{ color: mutedTextColor }}>
                        <span>{award.date_received}</span>
                      </div>
                    )}
                  </div>
                  
                  {award.description && (
                    <p className="mt-1 text-xs" style={{ color: defaultTextColor }}>{award.description}</p>
                  )}
                </div>
              ))}
            </div>
            {style.sectionDivider !== 'none' && getSectionDividerStyle()}
          </div>
        ) : null;
        
      case 'references':
        return references.length > 0 ? (
          <div className={`mb-4 ${sectionContainerClass}`} key="references-section" style={sectionContainerStyle}>
            <h2 className={headingClass} style={headingColorStyle}>
              {getSectionIcon('references')}
              References
            </h2>
            
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${lineHeightClass}`}>
              {references.map((ref: any) => (
                <div key={ref.id} className="p-3 border rounded">
                  <h3 className="font-semibold" style={{ color: defaultTextColor }}>{ref.name}</h3>
                  <p style={{ color: defaultTextColor }}>
                    {ref.title}{ref.company ? `, ${ref.company}` : ''}
                  </p>
                  <p className="text-xs mt-1" style={{ color: mutedTextColor }}>
                    {ref.relationship && <span>{ref.relationship}</span>}
                  </p>
                  <div className="mt-2 text-xs">
                    {ref.email && <div style={{ color: defaultTextColor }}>Email: {ref.email}</div>}
                    {ref.phone && <div style={{ color: defaultTextColor }}>Phone: {ref.phone}</div>}
                  </div>
                </div>
              ))}
            </div>
            {style.sectionDivider !== 'none' && getSectionDividerStyle()}
          </div>
        ) : null;
      
      default:
        return null;
    }
  };

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
      
      case 'languages':
        return languages.length > 0 ? (
          <div className="mb-5" key="languages-section">
            <div className="flex items-center mb-2">
              <div className="h-4 w-4 rounded-full mr-2" style={{ backgroundColor: primaryColor }}></div>
              <h2 className="text-lg font-bold" style={{ color: defaultTextColor }}>Languages</h2>
            </div>
            
            <div className="space-y-2 ml-6">
              {languages.map((language: any) => (
                <div key={language.id} className="flex justify-between items-center">
                  <span style={{ color: defaultTextColor }}>{language.name}</span>
                  <span style={{ color: primaryColor, fontWeight: 500 }}>{language.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null;
      
      case 'certifications':
        return certifications.length > 0 ? (
          <div className="mb-5" key="certifications-section">
            <div className="flex items-center mb-2">
              <div className="h-4 w-4 rounded-full mr-2" style={{ backgroundColor: primaryColor }}></div>
              <h2 className="text-lg font-bold" style={{ color: defaultTextColor }}>Certifications</h2>
            </div>
            
            <div className="space-y-4 ml-6">
              {certifications.map((cert: any) => (
                <div key={cert.id} className="mb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold" style={{ color: defaultTextColor }}>{cert.name}</h3>
                      <p style={{ color: primaryColor, fontWeight: 500 }}>{cert.issuer}</p>
                    </div>
                    
                    {settings.showDates !== false && cert.issueDate && (
                      <div className="text-right text-xs" style={{ color: primaryColor, fontWeight: 500 }}>
                        <span>Issued: {cert.issueDate}</span>
                        {cert.expirationDate && <div>Expires: {cert.expirationDate}</div>}
                      </div>
                    )}
                  </div>
                  
                  {cert.credentialUrl && (
                    <a 
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs hover:underline mt-1 inline-block"
                      style={{ color: primaryColor }}
                    >
                      View Credential
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null;
      
      case 'publications':
        return publications.length > 0 ? (
          <div className="mb-5" key="publications-section">
            <div className="flex items-center mb-2">
              <div className="h-4 w-4 rounded-full mr-2" style={{ backgroundColor: primaryColor }}></div>
              <h2 className="text-lg font-bold" style={{ color: defaultTextColor }}>Publications</h2>
            </div>
            
            <div className="space-y-4 ml-6">
              {publications.map((pub: any) => (
                <div key={pub.id} className="mb-3">
                  <div>
                    <h3 className="font-semibold" style={{ color: defaultTextColor }}>{pub.title}</h3>
                    {pub.authors && <p style={{ color: primaryColor, fontWeight: 500 }}>{pub.authors}</p>}
                    <div className="text-xs" style={{ color: mutedTextColor }}>
                      {pub.publication_name && <span>{pub.publication_name}</span>}
                      {pub.publisher && pub.publication_name && <span>, {pub.publisher}</span>}
                      {pub.publisher && !pub.publication_name && <span>{pub.publisher}</span>}
                      {pub.publication_date && <span> ({pub.publication_date})</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null;
        
      case 'volunteer':
        return volunteer.length > 0 ? (
          <div className="mb-5" key="volunteer-section">
            <div className="flex items-center mb-2">
              <div className="h-4 w-4 rounded-full mr-2" style={{ backgroundColor: primaryColor }}></div>
              <h2 className="text-lg font-bold" style={{ color: defaultTextColor }}>Volunteer Experience</h2>
            </div>
            
            <div className="space-y-4 ml-6">
              {volunteer.map((vol: any) => (
                <div key={vol.id} className="mb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold" style={{ color: defaultTextColor }}>{vol.role}</h3>
                      <p style={{ color: primaryColor, fontWeight: 500 }}>{vol.organization}{vol.location ? ` | ${vol.location}` : ''}</p>
                    </div>
                    
                    {settings.showDates !== false && vol.start_date && (
                      <div className="text-right text-xs" style={{ color: primaryColor, fontWeight: 500 }}>
                        <span>
                          {vol.start_date} - {vol.is_current ? 'Present' : vol.end_date}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {vol.description && (
                    <p className="mt-2 whitespace-pre-line text-xs" style={{ color: defaultTextColor }}>{vol.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null;
        
      case 'awards':
        return awards.length > 0 ? (
          <div className="mb-5" key="awards-section">
            <div className="flex items-center mb-2">
              <div className="h-4 w-4 rounded-full mr-2" style={{ backgroundColor: primaryColor }}></div>
              <h2 className="text-lg font-bold" style={{ color: defaultTextColor }}>Awards & Honors</h2>
            </div>
            
            <div className="space-y-3 ml-6">
              {awards.map((award: any) => (
                <div key={award.id} className="mb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold" style={{ color: defaultTextColor }}>{award.title}</h3>
                      <p style={{ color: primaryColor, fontWeight: 500 }}>{award.issuer}</p>
                    </div>
                    
                    {settings.showDates !== false && award.date_received && (
                      <div className="text-right text-xs" style={{ color: primaryColor, fontWeight: 500 }}>
                        <span>{award.date_received}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null;
        
      case 'references':
        return references.length > 0 ? (
          <div className="mb-5" key="references-section">
            <div className="flex items-center mb-2">
              <div className="h-4 w-4 rounded-full mr-2" style={{ backgroundColor: primaryColor }}></div>
              <h2 className="text-lg font-bold" style={{ color: defaultTextColor }}>References</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-3 ml-6">
              {references.map((ref: any) => (
                <div key={ref.id} className="p-3 border rounded" style={{ borderColor: `${primaryColor}40` }}>
                  <h3 className="font-semibold" style={{ color: defaultTextColor }}>{ref.name}</h3>
                  <p style={{ color: primaryColor, fontWeight: 500 }}>
                    {ref.title}{ref.company ? `, ${ref.company}` : ''}
                  </p>
                  <div className="mt-1 text-xs" style={{ color: defaultTextColor }}>
                    {ref.email && <div>Email: {ref.email}</div>}
                    {ref.phone && <div>Phone: {ref.phone}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null;
      
      default:
        return null
    }
  }

  // Academic template - with serif font and a more formal look
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
      
      case 'languages':
        return languages.length > 0 ? (
          <div className="mb-6" key="languages-section">
            <h2 className="text-lg font-bold border-b-2 mb-3 pb-1" style={{ 
              color: defaultTextColor,
              borderColor: style.primaryColor || '#10b981'
            }}>
              Languages
            </h2>
            
            <ul className="list-disc pl-5 space-y-1">
              {languages.map((language: any) => (
                <li key={language.id} style={{ color: defaultTextColor }}>
                  <span className="font-semibold">{language.name}</span>
                  {language.proficiency && <span> - {language.proficiency}</span>}
                </li>
              ))}
            </ul>
          </div>
        ) : null;
      
      case 'certifications':
        return certifications.length > 0 ? (
          <div className="mb-6" key="certifications-section">
            <h2 className="text-lg font-bold border-b-2 mb-3 pb-1" style={{ 
              color: defaultTextColor,
              borderColor: style.primaryColor || '#10b981'
            }}>
              Certifications
            </h2>
            
            <div className="space-y-3">
              {certifications.map((cert: any) => (
                <div key={cert.id} className="mb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold" style={{ color: defaultTextColor }}>{cert.name}</h3>
                      {cert.issuer && <p style={{ color: style.primaryColor || '#10b981' }}>{cert.issuer}</p>}
                    </div>
                    
                    {settings.showDates !== false && cert.issueDate && (
                      <div className="text-right text-xs" style={{ color: mutedTextColor }}>
                        <span>Issued: {cert.issueDate}</span>
                        {cert.expirationDate && <div>Expires: {cert.expirationDate}</div>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null;
      
      case 'publications':
        return publications.length > 0 ? (
          <div className="mb-6" key="publications-section">
            <h2 className="text-lg font-bold border-b-2 mb-3 pb-1" style={{ 
              color: defaultTextColor,
              borderColor: style.primaryColor || '#10b981'
            }}>
              Publications
            </h2>
            
            <div className="space-y-4">
              {publications.map((pub: any) => (
                <div key={pub.id} className="mb-3">
                  <p className="mb-1" style={{ color: defaultTextColor }}>
                    {pub.authors && <span className="italic">{pub.authors}. </span>}
                    <span className="font-semibold">"{pub.title}." </span>
                    {pub.publication_name && <span className="italic">{pub.publication_name}, </span>}
                    {pub.publisher && <span>{pub.publisher}, </span>}
                    {pub.publication_date && <span>{pub.publication_date}. </span>}
                    {pub.doi && <span>DOI: {pub.doi}</span>}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null;
      
      case 'volunteer':
        return volunteer.length > 0 ? (
          <div className="mb-6" key="volunteer-section">
            <h2 className="text-lg font-bold border-b-2 mb-3 pb-1" style={{ 
              color: defaultTextColor,
              borderColor: style.primaryColor || '#10b981'
            }}>
              Volunteer Experience
            </h2>
            
            <div className="space-y-4">
              {volunteer.map((vol: any) => (
                <div key={vol.id} className="mb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold" style={{ color: defaultTextColor }}>{vol.role}</h3>
                      <p style={{ color: style.primaryColor || '#10b981' }}>{vol.organization}{vol.location ? `, ${vol.location}` : ''}</p>
                    </div>
                    
                    {settings.showDates !== false && vol.start_date && (
                      <div className="text-right text-xs" style={{ color: mutedTextColor }}>
                        <span>
                          {vol.start_date} - {vol.is_current ? 'Present' : vol.end_date}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {vol.description && (
                    <p className="mt-2 whitespace-pre-line text-xs" style={{ color: defaultTextColor }}>{vol.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null;
        
      case 'awards':
        return awards.length > 0 ? (
          <div className="mb-6" key="awards-section">
            <h2 className="text-lg font-bold border-b-2 mb-3 pb-1" style={{ 
              color: defaultTextColor,
              borderColor: style.primaryColor || '#10b981'
            }}>
              Awards & Honors
            </h2>
            
            <ul className="list-disc pl-5 space-y-1">
              {awards.map((award: any) => (
                <li key={award.id} style={{ color: defaultTextColor }}>
                  <span className="font-semibold">{award.title}</span>
                  {award.issuer && <span>, {award.issuer}</span>}
                  {award.date_received && <span> ({award.date_received})</span>}
                  {award.description && <p className="text-xs mt-1">{award.description}</p>}
                </li>
              ))}
            </ul>
          </div>
        ) : null;
        
      case 'references':
        return references.length > 0 ? (
          <div className="mb-6" key="references-section">
            <h2 className="text-lg font-bold border-b-2 mb-3 pb-1" style={{ 
              color: defaultTextColor,
              borderColor: style.primaryColor || '#10b981'
            }}>
              References
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {references.map((ref: any) => (
                <div key={ref.id} className="mb-2">
                  <h3 className="font-semibold" style={{ color: defaultTextColor }}>{ref.name}</h3>
                  <p style={{ color: style.primaryColor || '#10b981' }}>{ref.title}{ref.company ? `, ${ref.company}` : ''}</p>
                  <div className="text-xs mt-1" style={{ color: mutedTextColor }}>
                    {ref.email && <div>Email: {ref.email}</div>}
                    {ref.phone && <div>Phone: {ref.phone}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null;
      
      default:
        return null;
    }
  }

  // Render a custom section
  const renderCustomSection = (sectionId: string) => {
    // Find the custom section by ID
    const section = customSections.find((s: any) => s.id === sectionId);
    if (!section) {
      console.log(`Could not find custom section with ID: ${sectionId}`);
      return null;
    }
    
    // For debugging
    console.log(`Rendering custom section:`, { 
      id: section.id, 
      title: section.title,
      itemsCount: section.items?.length || 0 
    });
    
    const sectionContainerClass = getSectionContainerClass();
    const sectionContainerStyle = getSectionContainerStyle();
    const primaryColor = style.primaryColor || '#4f46e5';
    
    return (
      <div className={`mb-4 ${sectionContainerClass}`} key={`custom-section-${sectionId}`} style={sectionContainerStyle}>
        <h2 className={headingClass} style={headingColorStyle}>
          {style.sectionIcons && <span className="mr-2">📄</span>}
          {section.title || "Custom Section"}
        </h2>
        
        {section.description && (
          <p className="mb-3 text-sm" style={{ color: mutedTextColor }}>{section.description}</p>
        )}
        
        <div className={`space-y-4 ${lineHeightClass}`}>
          {section.items && section.items.map((item: any) => (
            <div key={item.id} className="mb-3">
              {/* Find and display title field if it exists */}
              {item.fields && item.fields.find((f: any) => f.type === 'title' && f.value) && (
                <h3 className="font-semibold" style={{ color: defaultTextColor }}>
                  {item.fields.find((f: any) => f.type === 'title').value}
                </h3>
              )}
              
              {/* Display all non-title fields with values */}
              <div className="space-y-1 mt-1">
                {item.fields && item.fields
                  .filter((f: any) => f.type !== 'title' && f.value)
                  .map((field: any) => (
                    <div key={field.id} className="flex items-start">
                      {field.type === 'date' && (
                        <p className="text-xs" style={{ color: mutedTextColor }}>
                          {field.value}
                        </p>
                      )}
                      
                      {field.type === 'text' && (
                        <p className="text-sm" style={{ color: defaultTextColor }}>
                          {field.value}
                        </p>
                      )}
                      
                      {field.type === 'textarea' && (
                        <p className="text-xs whitespace-pre-line" style={{ color: defaultTextColor }}>
                          {field.value}
                        </p>
                      )}
                      
                      {field.type === 'url' && field.value && (
                        <p className="text-xs" style={{ color: primaryColor }}>
                          {field.value}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
        {style.sectionDivider !== 'none' && getSectionDividerStyle()}
      </div>
    );
  };

  // Select the correct section renderer based on template
  const renderSection = (sectionType: string) => {
    // Skip custom sections
    if (sectionType.startsWith('custom-')) {
      return null;
    }
    
    // Handle standard sections
    switch (sectionType) {
      case 'summary':
      case 'experience':
      case 'education':
      case 'skills':
      case 'languages':
      case 'certifications':
      case 'publications':
      case 'volunteer':
      case 'awards':
      case 'references':
      case 'personalInfo':
        // Render standard section based on template
        switch (template.toLowerCase()) {
          case 'modern':
            return renderModernSection(sectionType);
          case 'academic':
            return renderAcademicSection(sectionType);
          default:
            return renderStandardSection(sectionType);
        }
    }
    
    console.log(`Section not found: ${sectionType}`);
    return null;
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
      {sections.map((section: string, index: number) => (
        <React.Fragment key={`section-${section}-${index}`}>
          {renderSection(section)}
        </React.Fragment>
      ))}
    </div>
  )
} 