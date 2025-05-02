-- Additional resume sections schema

-- Publications table for academic papers, articles, etc.
CREATE TABLE IF NOT EXISTS public.resume_publications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  authors TEXT,
  publication_name TEXT,
  publisher TEXT,
  publication_date DATE,
  url TEXT,
  doi TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Volunteer experience for community service, unpaid work
CREATE TABLE IF NOT EXISTS public.resume_volunteer (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  organization TEXT NOT NULL,
  role TEXT NOT NULL,
  location TEXT,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Awards and honors section
CREATE TABLE IF NOT EXISTS public.resume_awards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  issuer TEXT,
  date_received DATE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- References section
CREATE TABLE IF NOT EXISTS public.resume_references (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT,
  company TEXT,
  email TEXT,
  phone TEXT,
  relationship TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for resume_publications
ALTER TABLE public.resume_publications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own resume publications"
  ON public.resume_publications
  FOR SELECT
  USING ((SELECT user_id FROM public.resumes WHERE id = resume_id) = auth.uid());

CREATE POLICY "Users can insert their own resume publications"
  ON public.resume_publications
  FOR INSERT
  WITH CHECK ((SELECT user_id FROM public.resumes WHERE id = resume_id) = auth.uid());

CREATE POLICY "Users can update their own resume publications"
  ON public.resume_publications
  FOR UPDATE
  USING ((SELECT user_id FROM public.resumes WHERE id = resume_id) = auth.uid());

CREATE POLICY "Users can delete their own resume publications"
  ON public.resume_publications
  FOR DELETE
  USING ((SELECT user_id FROM public.resumes WHERE id = resume_id) = auth.uid());

-- Add RLS policies for resume_volunteer
ALTER TABLE public.resume_volunteer ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own resume volunteer experience"
  ON public.resume_volunteer
  FOR SELECT
  USING ((SELECT user_id FROM public.resumes WHERE id = resume_id) = auth.uid());

CREATE POLICY "Users can insert their own resume volunteer experience"
  ON public.resume_volunteer
  FOR INSERT
  WITH CHECK ((SELECT user_id FROM public.resumes WHERE id = resume_id) = auth.uid());

CREATE POLICY "Users can update their own resume volunteer experience"
  ON public.resume_volunteer
  FOR UPDATE
  USING ((SELECT user_id FROM public.resumes WHERE id = resume_id) = auth.uid());

CREATE POLICY "Users can delete their own resume volunteer experience"
  ON public.resume_volunteer
  FOR DELETE
  USING ((SELECT user_id FROM public.resumes WHERE id = resume_id) = auth.uid());

-- Add RLS policies for resume_awards
ALTER TABLE public.resume_awards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own resume awards"
  ON public.resume_awards
  FOR SELECT
  USING ((SELECT user_id FROM public.resumes WHERE id = resume_id) = auth.uid());

CREATE POLICY "Users can insert their own resume awards"
  ON public.resume_awards
  FOR INSERT
  WITH CHECK ((SELECT user_id FROM public.resumes WHERE id = resume_id) = auth.uid());

CREATE POLICY "Users can update their own resume awards"
  ON public.resume_awards
  FOR UPDATE
  USING ((SELECT user_id FROM public.resumes WHERE id = resume_id) = auth.uid());

CREATE POLICY "Users can delete their own resume awards"
  ON public.resume_awards
  FOR DELETE
  USING ((SELECT user_id FROM public.resumes WHERE id = resume_id) = auth.uid());

-- Add RLS policies for resume_references
ALTER TABLE public.resume_references ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own resume references"
  ON public.resume_references
  FOR SELECT
  USING ((SELECT user_id FROM public.resumes WHERE id = resume_id) = auth.uid());

CREATE POLICY "Users can insert their own resume references"
  ON public.resume_references
  FOR INSERT
  WITH CHECK ((SELECT user_id FROM public.resumes WHERE id = resume_id) = auth.uid());

CREATE POLICY "Users can update their own resume references"
  ON public.resume_references
  FOR UPDATE
  USING ((SELECT user_id FROM public.resumes WHERE id = resume_id) = auth.uid());

CREATE POLICY "Users can delete their own resume references"
  ON public.resume_references
  FOR DELETE
  USING ((SELECT user_id FROM public.resumes WHERE id = resume_id) = auth.uid());

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS resume_publications_resume_id_idx ON public.resume_publications(resume_id);
CREATE INDEX IF NOT EXISTS resume_volunteer_resume_id_idx ON public.resume_volunteer(resume_id);
CREATE INDEX IF NOT EXISTS resume_awards_resume_id_idx ON public.resume_awards(resume_id);
CREATE INDEX IF NOT EXISTS resume_references_resume_id_idx ON public.resume_references(resume_id); 