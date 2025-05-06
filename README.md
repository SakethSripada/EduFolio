# EduFolio: Your Educational Journey, Beautifully Organized

<div align="center">
  <img src="public/EduFolioLogo.png" alt="EduFolio Logo" width="120" />
  
  <p>
    <strong>AI-powered platform for organizing and optimizing your college application process</strong>
  </p>
  
  <p>
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#installation">Installation</a> •
    <a href="#usage">Usage</a>
  </p>
</div>

## 🚀 Overview

EduFolio is a comprehensive web application designed to help students organize and optimize their college application journey. It provides a centralized platform to manage academics, extracurricular activities, awards, essays, and college applications with AI-powered assistance at every step.

## ✨ Features

### 📚 Academics Management
- Track courses, grades, and GPA calculations
- Store and analyze standardized test scores (SAT, ACT, AP, etc.)
- Calculate weighted and unweighted GPA automatically
- Visualize academic performance trends

### 🏆 Extracurricular Activities
- Document activities with detailed information (position, hours, description)
- Organize by type, grade level, and impact
- Track leadership roles and responsibilities
- Highlight activities to include in college applications

### 🥇 Awards and Honors
- Record academic and non-academic achievements
- Categorize by level (school, regional, national, international)
- Document award details and significance
- Link awards to relevant activities

### 📝 Essay Workshop
- Craft and edit application essays with AI assistance
- Organize essays by prompt and college
- Receive feedback on writing style, structure, and content
- Compare different versions of essays

### 🎓 College List Builder
- Create and manage a list of target colleges
- Track application status and deadlines
- Store college-specific requirements and notes
- Customize application materials for each school

### 🤖 AI Assistant
- Get personalized recommendations based on your profile
- Receive feedback on essays and application components
- Ask questions about college applications and admissions
- Generate ideas for essays and activity descriptions

### 📊 Progress Tracking
- Visualize application completion status
- Set and monitor application-related tasks and deadlines
- Track document submissions and requirements

### 🔗 Sharing and Collaboration
- Share your portfolio or specific components with counselors
- Control privacy settings for shared content
- Set expiration dates for shared links
- Customize which sections are visible in shared views

### 📄 Resume Builder
- Fill out personal details, professional summary, work experience, education, skills, and projects
- Choose from multiple templates and customize styles (fonts, colors, spacing)
- Live resume preview component for seamless editing
- Export resumes as PDF or DOCX with customizable formats

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI Integration**: OpenAI API (@ai-sdk/openai)
- **UI Components**: Radix UI primitives, Shadcn/UI component system
- **State Management**: React Context, React Hooks
- **Forms**: React Hook Form, Zod validation
- **Styling**: Tailwind CSS, tailwindcss-animate, class-variance-authority
- **Markdown**: React Markdown with DOMPurify for sanitization
- **Date Handling**: date-fns
- **Data Visualization**: Recharts
- **Icons**: Lucide React
- **Notifications**: Sonner toast notifications
- **PDF Generation**: jsPDF, html2canvas
- **Word Document Generation**: docx

## 🔧 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/edufolio.git
   cd edufolio
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Set up environment variables:
   ```
   # Create a .env.local file with the following
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

## 📋 Database Structure

EduFolio uses a PostgreSQL database with the following main tables:

- **profiles**: User profiles and personal information
- **academics**: Academic courses, grades, and GPA data
- **test_scores**: Standardized test results
- **extracurricular_activities**: Clubs, sports, volunteering, etc.
- **awards**: Honors and recognitions
- **essays**: Application essays and personal statements
- **colleges**: College information and application status
- **college_essays**: Essays specifically for college applications
- **shared_links**: Sharing settings and permissions
- **resumes**: Resume metadata, templates, and styles
- **resume_experience**: Work experience entries
- **resume_education**: Education history entries
- **resume_skills**: Skills entries
- **resume_projects**: Project entries

## 🔒 Authentication and Security

- Secure authentication using Supabase Auth
- Row-level security policies for data protection
- User-specific data isolation
- Secure sharing with customizable permissions
- Password reset and recovery flow

## 📱 Key Application Modules

1. **College Application Dashboard**: Central hub for monitoring all application components
2. **Academic Profile**: GPA calculator and course management
3. **Activity Tracker**: Extracurricular documentation
4. **Essay Workshop**: Writing and editing environment
5. **College Research**: College search and application tracking
6. **AI Assistance**: Smart recommendations and feedback system
7. **Portfolio Sharing**: Controlled sharing with counselors and mentors
8. **Resume Builder**: Create, edit, and export professional resumes in PDF and DOCX formats

## 🚀 Future Enhancements

- Mobile application
- Document upload and management
- Integration with Common Application
- Recommendation letter tracking
- Interview preparation resources
- Scholarship finder and application tracking
- College visit planner

