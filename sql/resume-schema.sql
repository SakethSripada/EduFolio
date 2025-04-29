-- Resume tables schema

-- Main resume table
CREATE TABLE IF NOT EXISTS public.resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content JSONB DEFAULT '{}',
  style JSONB DEFAULT '{}',
  template TEXT DEFAULT 'standard',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.resume_experience (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  location TEXT,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.resume_education (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  institution TEXT NOT NULL,
  degree TEXT,
  field_of_study TEXT,
  location TEXT,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  gpa NUMERIC(3,2),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.resume_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  level TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.resume_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  technologies TEXT,
  link TEXT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for resumes
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own resumes"
  ON public.resumes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own resumes"
  ON public.resumes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resumes"
  ON public.resumes
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resumes"
  ON public.resumes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add RLS policies for resume_experience
ALTER TABLE public.resume_experience ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own resume experiences"
  ON public.resume_experience
  FOR SELECT
  USING ((SELECT user_id FROM public.resumes WHERE id = resume_id) = auth.uid());

CREATE POLICY "Users can insert their own resume experiences"
  ON public.resume_experience
  FOR INSERT
  WITH CHECK ((SELECT user_id FROM public.resumes WHERE id = resume_id) = auth.uid());

CREATE POLICY "Users can update their own resume experiences"
  ON public.resume_experience
  FOR UPDATE
  USING ((SELECT user_id FROM public.resumes WHERE id = resume_id) = auth.uid());

CREATE POLICY "Users can delete their own resume experiences"
  ON public.resume_experience
  FOR DELETE
  USING ((SELECT user_id FROM public.resumes WHERE id = resume_id) = auth.uid());

-- Add RLS policies for resume_education
ALTER TABLE public.resume_education ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own resume education"
  ON public.resume_education
  FOR SELECT
  USING ((SELECT user_id FROM public.resumes WHERE id = resume_id) = auth.uid());

CREATE POLICY "Users can insert their own resume education"
  ON public.resume_education
  FOR INSERT
  WITH CHECK ((SELECT user_id FROM public.resumes WHERE id = resume_id) = auth.uid());

CREATE POLICY "Users can update their own resume education"
  ON public.resume_education
  FOR UPDATE
  USING ((SELECT user_id FROM public.resumes WHERE id = resume_id) = auth.uid());

CREATE POLICY "Users can delete their own resume education"
  ON public.resume_education
  FOR DELETE
  USING ((SELECT user_id FROM public.resumes WHERE id = resume_id) = auth.uid());

-- Add RLS policies for resume_skills
ALTER TABLE public.resume_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own resume skills"
  ON public.resume_skills
  FOR SELECT
  USING ((SELECT user_id FROM public.resumes WHERE id = resume_id) = auth.uid());

CREATE POLICY "Users can insert their own resume skills"
  ON public.resume_skills
  FOR INSERT
  WITH CHECK ((SELECT user_id FROM public.resumes WHERE id = resume_id) = auth.uid());

CREATE POLICY "Users can update their own resume skills"
  ON public.resume_skills
  FOR UPDATE
  USING ((SELECT user_id FROM public.resumes WHERE id = resume_id) = auth.uid());

CREATE POLICY "Users can delete their own resume skills"
  ON public.resume_skills
  FOR DELETE
  USING ((SELECT user_id FROM public.resumes WHERE id = resume_id) = auth.uid());

-- Add RLS policies for resume_projects
ALTER TABLE public.resume_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own resume projects"
  ON public.resume_projects
  FOR SELECT
  USING ((SELECT user_id FROM public.resumes WHERE id = resume_id) = auth.uid());

CREATE POLICY "Users can insert their own resume projects"
  ON public.resume_projects
  FOR INSERT
  WITH CHECK ((SELECT user_id FROM public.resumes WHERE id = resume_id) = auth.uid());

CREATE POLICY "Users can update their own resume projects"
  ON public.resume_projects
  FOR UPDATE
  USING ((SELECT user_id FROM public.resumes WHERE id = resume_id) = auth.uid());

CREATE POLICY "Users can delete their own resume projects"
  ON public.resume_projects
  FOR DELETE
  USING ((SELECT user_id FROM public.resumes WHERE id = resume_id) = auth.uid());

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS resumes_user_id_idx ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS resume_experience_resume_id_idx ON public.resume_experience(resume_id);
CREATE INDEX IF NOT EXISTS resume_education_resume_id_idx ON public.resume_education(resume_id);
CREATE INDEX IF NOT EXISTS resume_skills_resume_id_idx ON public.resume_skills(resume_id);
CREATE INDEX IF NOT EXISTS resume_projects_resume_id_idx ON public.resume_projects(resume_id); 