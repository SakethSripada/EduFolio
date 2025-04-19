-- Create or recreate shared_links table with improved schema
DROP TABLE IF EXISTS public.shared_links;

-- Create shared_links table with improved schema
CREATE TABLE IF NOT EXISTS public.shared_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  share_id TEXT NOT NULL UNIQUE,
  content_type TEXT NOT NULL, -- e.g., 'college_application', 'college_profile', 'portfolio', etc.
  content_id UUID, -- Optional reference to specific content (e.g., college_id)
  is_public BOOLEAN NOT NULL DEFAULT true, -- Default to public for better UX
  settings JSONB DEFAULT '{"showExtracurriculars": true, "showAcademics": true, "showAwards": true, "showEssays": true, "showCourses": true, "showTestScores": true}', -- Granular visibility
  expires_at TIMESTAMP WITH TIME ZONE, -- Optional expiration date
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS shared_links_user_id_idx ON public.shared_links(user_id);
CREATE INDEX IF NOT EXISTS shared_links_share_id_idx ON public.shared_links(share_id);
CREATE INDEX IF NOT EXISTS shared_links_content_type_idx ON public.shared_links(content_type);

-- Enable Row Level Security on the table
ALTER TABLE public.shared_links ENABLE ROW LEVEL SECURITY;

-- Users can view, insert, update, and delete their own shared links
DROP POLICY IF EXISTS "Users can view their own shared links" ON public.shared_links;
CREATE POLICY "Users can view their own shared links"
  ON public.shared_links
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own shared links" ON public.shared_links;
CREATE POLICY "Users can insert their own shared links"
  ON public.shared_links
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own shared links" ON public.shared_links;
CREATE POLICY "Users can update their own shared links"
  ON public.shared_links
  FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own shared links" ON public.shared_links;
CREATE POLICY "Users can delete their own shared links"
  ON public.shared_links
  FOR DELETE
  USING (auth.uid() = user_id);

-- Policy for public access to shared links (when they're public)
DROP POLICY IF EXISTS "Anyone can view public shared links" ON public.shared_links;
CREATE POLICY "Anyone can view public shared links"
  ON public.shared_links
  FOR SELECT
  USING (is_public = true);

-- Function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to update updated_at on every update
DROP TRIGGER IF EXISTS update_shared_links_updated_at ON public.shared_links;
CREATE TRIGGER update_shared_links_updated_at
BEFORE UPDATE ON public.shared_links
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
