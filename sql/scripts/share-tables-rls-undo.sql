-- SQL script to undo/remove all share-related RLS policies
-- Run this in Supabase SQL Editor if you need to revert the changes

-- ======================= DROP COLLEGE APPLICATION POLICIES =======================

-- Remove policy for academics table
DROP POLICY IF EXISTS "Anyone can view academics referenced by public shared links" ON public.academics;

-- Remove policy for test_scores table
DROP POLICY IF EXISTS "Anyone can view test scores referenced by public shared links" ON public.test_scores;

-- Remove policy for extracurricular_activities table
DROP POLICY IF EXISTS "Anyone can view extracurricular activities referenced by public shared links" ON public.extracurricular_activities;

-- Remove policy for awards table
DROP POLICY IF EXISTS "Anyone can view awards referenced by public shared links" ON public.awards;

-- Remove policy for essays table
DROP POLICY IF EXISTS "Anyone can view essays referenced by public shared links" ON public.essays;

-- Remove policy for user_colleges table
DROP POLICY IF EXISTS "Anyone can view user colleges referenced by public shared links" ON public.user_colleges;

-- Remove policy for colleges table
DROP POLICY IF EXISTS "Anyone can view colleges referenced by public shared links" ON public.colleges;

-- Remove policy for courses table
DROP POLICY IF EXISTS "Anyone can view courses referenced by public shared links" ON public.courses;

-- Remove policy for manual_gpa table
DROP POLICY IF EXISTS "Anyone can view manual GPA referenced by public shared links" ON public.manual_gpa;

-- ======================= DROP PORTFOLIO POLICIES =======================

-- Remove policy for profiles table (portfolio)
DROP POLICY IF EXISTS "Anyone can view profiles referenced by public portfolio shared links" ON public.profiles;

-- Remove policy for projects table
DROP POLICY IF EXISTS "Anyone can view projects referenced by public portfolio shared links" ON public.projects;

-- Remove policy for categories table
DROP POLICY IF EXISTS "Anyone can view categories referenced by public portfolio shared links" ON public.categories;

-- ======================= DROP COLLEGE PROFILE POLICIES =======================

-- Remove policy for profiles table (college profile)
DROP POLICY IF EXISTS "Anyone can view profiles referenced by public college profile shared links" ON public.profiles;

-- Remove policy for college_profiles table
DROP POLICY IF EXISTS "Anyone can view college profiles referenced by public shared links" ON public.college_profiles;

-- Note: This script does not disable RLS on any tables since you might have other policies in place.
-- If you want to disable RLS completely on a table, use: ALTER TABLE public.table_name DISABLE ROW LEVEL SECURITY; 