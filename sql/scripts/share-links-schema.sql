-- Create shared_links table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.shared_links (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 share_id TEXT NOT NULL UNIQUE,
 content_type TEXT NOT NULL, -- 'college_application', 'college_profile', 'portfolio', etc.
 content_id UUID, -- Optional reference to specific content (e.g., college_id)
 is_public BOOLEAN NOT NULL DEFAULT false,
 expires_at TIMESTAMP WITH TIME ZONE, -- Optional expiration date
 created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS shared_links_user_id_idx ON public.shared_links(user_id);
CREATE INDEX IF NOT EXISTS shared_links_share_id_idx ON public.shared_links(share_id);
CREATE INDEX IF NOT EXISTS shared_links_content_type_idx ON public.shared_links(content_type);

-- Add RLS policies for shared_links
ALTER TABLE public.shared_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view their own shared links"
 ON public.shared_links
 FOR SELECT
 USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own shared links"
 ON public.shared_links
 FOR INSERT
 WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own shared links"
 ON public.shared_links
 FOR UPDATE
 USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete their own shared links"
 ON public.shared_links
 FOR DELETE
 USING (auth.uid() = user_id);

-- Add policy for public access to shared links
CREATE POLICY IF NOT EXISTS "Anyone can view public shared links"
 ON public.shared_links
 FOR SELECT
 USING (is_public = true);

-- Add columns to profiles table if they don't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS grad_year TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS school TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS interests TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{"publicProfile": false, "showEmail": false}'::jsonb;

-- Add policy for public access to profiles referenced by public shared links
CREATE POLICY IF NOT EXISTS "Anyone can view profiles referenced by public shared links"
 ON public.profiles
 FOR SELECT
 USING (
   EXISTS (
     SELECT 1 FROM public.shared_links
     WHERE shared_links.user_id = profiles.user_id
     AND shared_links.is_public = true
     AND (shared_links.expires_at IS NULL OR shared_links.expires_at > NOW())
   )
 );
