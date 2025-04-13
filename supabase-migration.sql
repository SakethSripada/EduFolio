-- Create profiles table with proper constraints if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  email TEXT NOT NULL,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create manual_gpa table for storing manual GPA entries
CREATE TABLE IF NOT EXISTS public.manual_gpa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  unweighted NUMERIC(3,2) NOT NULL DEFAULT 0.0,
  weighted NUMERIC(3,2) NOT NULL DEFAULT 0.0,
  uc_gpa NUMERIC(3,2) NOT NULL DEFAULT 0.0,
  use_manual BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for manual_gpa
ALTER TABLE public.manual_gpa ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view their own manual GPA"
  ON public.manual_gpa
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own manual GPA"
  ON public.manual_gpa
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own manual GPA"
  ON public.manual_gpa
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create college_profiles table for college-specific application data
CREATE TABLE IF NOT EXISTS public.college_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  application_status INTEGER DEFAULT 0,
  application_deadline TEXT,
  application_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, college_id)
);

-- Add RLS policies for college_profiles
ALTER TABLE public.college_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view their own college profiles"
  ON public.college_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own college profiles"
  ON public.college_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own college profiles"
  ON public.college_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete their own college profiles"
  ON public.college_profiles
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create college_academics table for college-specific academic data
CREATE TABLE IF NOT EXISTS public.college_academics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  grade TEXT NOT NULL,
  credits NUMERIC(3,1) NOT NULL DEFAULT 1.0,
  level TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  term TEXT NOT NULL,
  grade_points NUMERIC(3,1) NOT NULL,
  weighted_grade_points NUMERIC(3,1) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for college_academics
ALTER TABLE public.college_academics ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view their own college academics"
  ON public.college_academics
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own college academics"
  ON public.college_academics
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own college academics"
  ON public.college_academics
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete their own college academics"
  ON public.college_academics
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create college_extracurriculars table for college-specific extracurricular data
CREATE TABLE IF NOT EXISTS public.college_extracurriculars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  position TEXT NOT NULL,
  organization TEXT NOT NULL,
  description TEXT NOT NULL,
  grades TEXT NOT NULL,
  timing TEXT NOT NULL,
  hours_per_week INTEGER NOT NULL,
  weeks_per_year INTEGER NOT NULL,
  continue_in_college BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for college_extracurriculars
ALTER TABLE public.college_extracurriculars ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view their own college extracurriculars"
  ON public.college_extracurriculars
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own college extracurriculars"
  ON public.college_extracurriculars
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own college extracurriculars"
  ON public.college_extracurriculars
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete their own college extracurriculars"
  ON public.college_extracurriculars
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create college_awards table for college-specific awards data
CREATE TABLE IF NOT EXISTS public.college_awards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  level TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for college_awards
ALTER TABLE public.college_awards ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view their own college awards"
  ON public.college_awards
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own college awards"
  ON public.college_awards
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own college awards"
  ON public.college_awards
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete their own college awards"
  ON public.college_awards
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS colleges_user_id_idx ON public.colleges(user_id);
CREATE INDEX IF NOT EXISTS academics_user_id_idx ON public.academics(user_id);
CREATE INDEX IF NOT EXISTS test_scores_user_id_idx ON public.test_scores(user_id);
CREATE INDEX IF NOT EXISTS extracurriculars_user_id_idx ON public.extracurriculars(user_id);
CREATE INDEX IF NOT EXISTS awards_user_id_idx ON public.awards(user_id);
CREATE INDEX IF NOT EXISTS essays_user_id_idx ON public.essays(user_id);
CREATE INDEX IF NOT EXISTS college_essays_user_id_idx ON public.college_essays(user_id);
CREATE INDEX IF NOT EXISTS college_essays_college_id_idx ON public.college_essays(college_id);
CREATE INDEX IF NOT EXISTS college_profiles_user_id_idx ON public.college_profiles(user_id);
CREATE INDEX IF NOT EXISTS college_profiles_college_id_idx ON public.college_profiles(college_id);
CREATE INDEX IF NOT EXISTS college_academics_user_id_idx ON public.college_academics(user_id);
CREATE INDEX IF NOT EXISTS college_academics_college_id_idx ON public.college_academics(college_id);
CREATE INDEX IF NOT EXISTS college_extracurriculars_user_id_idx ON public.college_extracurriculars(user_id);
CREATE INDEX IF NOT EXISTS college_extracurriculars_college_id_idx ON public.college_extracurriculars(college_id);
CREATE INDEX IF NOT EXISTS college_awards_user_id_idx ON public.college_awards(user_id);
CREATE INDEX IF NOT EXISTS college_awards_college_id_idx ON public.college_awards(college_id);
CREATE INDEX IF NOT EXISTS manual_gpa_user_id_idx ON public.manual_gpa(user_id);

-- Update existing tables with missing columns if needed
ALTER TABLE public.colleges ADD COLUMN IF NOT EXISTS application_status INTEGER DEFAULT 0;
ALTER TABLE public.colleges ADD COLUMN IF NOT EXISTS application_deadline TEXT;
ALTER TABLE public.colleges ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.colleges ADD COLUMN IF NOT EXISTS is_reach BOOLEAN DEFAULT false;
ALTER TABLE public.colleges ADD COLUMN IF NOT EXISTS is_target BOOLEAN DEFAULT false;
ALTER TABLE public.colleges ADD COLUMN IF NOT EXISTS is_safety BOOLEAN DEFAULT false;
ALTER TABLE public.colleges ADD COLUMN IF NOT EXISTS is_liked BOOLEAN DEFAULT false;

-- Fix any existing constraints
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_key;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);

-- Ensure all tables have proper timestamps
ALTER TABLE public.colleges ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.colleges ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.academics ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.academics ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.test_scores ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.test_scores ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.extracurriculars ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.extracurriculars ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.awards ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.awards ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.essays ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.essays ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.college_essays ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.college_essays ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
