-- SQL script to add RLS policies for shared tables
-- Run this in Supabase SQL Editor

-- ======================= COLLEGE APPLICATION POLICIES =======================

-- Add policy for public access to academics table via shared links
CREATE POLICY "Anyone can view academics referenced by public shared links"
  ON public.academics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.shared_links
      WHERE shared_links.user_id = academics.user_id
      AND shared_links.is_public = true
      AND (shared_links.expires_at IS NULL OR shared_links.expires_at > NOW())
      AND shared_links.content_type = 'college_application'
    )
  );

-- Add policy for public access to test_scores table via shared links
CREATE POLICY "Anyone can view test scores referenced by public shared links"
  ON public.test_scores
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.shared_links
      WHERE shared_links.user_id = test_scores.user_id
      AND shared_links.is_public = true
      AND (shared_links.expires_at IS NULL OR shared_links.expires_at > NOW())
      AND shared_links.content_type = 'college_application'
    )
  );

-- Add policy for public access to extracurricular_activities table via shared links
CREATE POLICY "Anyone can view extracurricular activities referenced by public shared links"
  ON public.extracurricular_activities
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.shared_links
      WHERE shared_links.user_id = extracurricular_activities.user_id
      AND shared_links.is_public = true
      AND (shared_links.expires_at IS NULL OR shared_links.expires_at > NOW())
      AND shared_links.content_type = 'college_application'
    )
  );

-- Add policy for public access to awards table via shared links
CREATE POLICY "Anyone can view awards referenced by public shared links"
  ON public.awards
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.shared_links
      WHERE shared_links.user_id = awards.user_id
      AND shared_links.is_public = true
      AND (shared_links.expires_at IS NULL OR shared_links.expires_at > NOW())
      AND shared_links.content_type = 'college_application'
    )
  );

-- Add policy for public access to essays table via shared links
CREATE POLICY "Anyone can view essays referenced by public shared links"
  ON public.essays
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.shared_links
      WHERE shared_links.user_id = essays.user_id
      AND shared_links.is_public = true
      AND (shared_links.expires_at IS NULL OR shared_links.expires_at > NOW())
      AND shared_links.content_type = 'college_application'
    )
  );

-- Add policy for public access to user_colleges table via shared links
CREATE POLICY "Anyone can view user colleges referenced by public shared links"
  ON public.user_colleges
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.shared_links
      WHERE shared_links.user_id = user_colleges.user_id
      AND shared_links.is_public = true
      AND (shared_links.expires_at IS NULL OR shared_links.expires_at > NOW())
      AND shared_links.content_type = 'college_application'
    )
  );

-- Add policy for public access to colleges table via shared links
-- This one is different since colleges are referenced by user_colleges
CREATE POLICY "Anyone can view colleges referenced by public shared links"
  ON public.colleges
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_colleges
      JOIN public.shared_links ON shared_links.user_id = user_colleges.user_id
      WHERE user_colleges.college_id = colleges.id
      AND shared_links.is_public = true
      AND (shared_links.expires_at IS NULL OR shared_links.expires_at > NOW())
      AND shared_links.content_type = 'college_application'
    )
  );

-- Add policy for public access to courses table via shared links
CREATE POLICY "Anyone can view courses referenced by public shared links"
  ON public.courses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.shared_links
      WHERE shared_links.user_id = courses.user_id
      AND shared_links.is_public = true
      AND (shared_links.expires_at IS NULL OR shared_links.expires_at > NOW())
      AND shared_links.content_type = 'college_application'
    )
  );

-- Add policy for public access to manual_gpa table via shared links
CREATE POLICY "Anyone can view manual GPA referenced by public shared links"
  ON public.manual_gpa
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.shared_links
      WHERE shared_links.user_id = manual_gpa.user_id
      AND shared_links.is_public = true
      AND (shared_links.expires_at IS NULL OR shared_links.expires_at > NOW())
      AND shared_links.content_type = 'college_application'
    )
  );

-- ========================= PORTFOLIO POLICIES ========================= 

-- Add policy for public access to profiles table via shared links for portfolios
CREATE POLICY "Anyone can view profiles referenced by public portfolio shared links"
  ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.shared_links
      WHERE shared_links.user_id = profiles.user_id
      AND shared_links.is_public = true
      AND (shared_links.expires_at IS NULL OR shared_links.expires_at > NOW())
      AND shared_links.content_type = 'portfolio'
    )
  );

-- Add policy for public access to projects table via shared links for portfolios
CREATE POLICY "Anyone can view projects referenced by public portfolio shared links"
  ON public.projects
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.shared_links
      WHERE shared_links.user_id = projects.user_id
      AND shared_links.is_public = true
      AND (shared_links.expires_at IS NULL OR shared_links.expires_at > NOW())
      AND shared_links.content_type = 'portfolio'
    )
  );

-- Add policy for public access to categories table via shared links for portfolios
CREATE POLICY "Anyone can view categories referenced by public portfolio shared links"
  ON public.categories
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.shared_links
      WHERE shared_links.user_id = categories.user_id
      AND shared_links.is_public = true
      AND (shared_links.expires_at IS NULL OR shared_links.expires_at > NOW())
      AND shared_links.content_type = 'portfolio'
    )
  );

-- ========================= COLLEGE PROFILE POLICIES ========================= 

-- Add policy for public access to profiles table via shared links for college profiles
CREATE POLICY "Anyone can view profiles referenced by public college profile shared links"
  ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.shared_links
      WHERE shared_links.user_id = profiles.user_id
      AND shared_links.is_public = true
      AND (shared_links.expires_at IS NULL OR shared_links.expires_at > NOW())
      AND shared_links.content_type = 'college_profile'
    )
  );

-- Add policy for public access to college_profiles table via shared links
CREATE POLICY "Anyone can view college profiles referenced by public shared links"
  ON public.college_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.shared_links
      WHERE shared_links.user_id = college_profiles.user_id
      AND shared_links.is_public = true
      AND (shared_links.expires_at IS NULL OR shared_links.expires_at > NOW())
      AND shared_links.content_type = 'college_profile'
    )
  );

-- Make sure RLS is enabled for all tables
ALTER TABLE IF EXISTS public.academics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.test_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.extracurricular_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.essays ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.manual_gpa ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.college_profiles ENABLE ROW LEVEL SECURITY;
