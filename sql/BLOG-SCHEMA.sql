-- Blog Schema for EduFolio
-- This schema defines the tables for the blog functionality

-- Table: blog_posts
CREATE TABLE blog_posts (
  id uuid PRIMARY KEY,
  title text NOT NULL,
  subtitle text,
  slug text NOT NULL UNIQUE,
  content text NOT NULL,
  excerpt text,
  author_id uuid NOT NULL,
  category_id uuid,
  status text NOT NULL DEFAULT 'draft', -- draft, published, scheduled
  featured boolean DEFAULT false,
  allow_comments boolean DEFAULT true,
  cover_image_url text,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  seo_title text,
  seo_description text,
  views_count integer DEFAULT 0,
  reading_time integer -- in minutes
);

-- Table: blog_categories
CREATE TABLE blog_categories (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  parent_id uuid REFERENCES blog_categories(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Table: blog_tags
CREATE TABLE blog_tags (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Junction table for posts and tags (many-to-many)
CREATE TABLE blog_post_tags (
  post_id uuid REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Table: blog_authors
CREATE TABLE blog_authors (
  id uuid PRIMARY KEY,
  user_id uuid, -- can be linked to users table if author is also a user
  name text NOT NULL,
  email text,
  bio text,
  avatar_url text,
  website_url text,
  twitter_handle text,
  linkedin_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Table: blog_comments
CREATE TABLE blog_comments (
  id uuid PRIMARY KEY,
  post_id uuid REFERENCES blog_posts(id) ON DELETE CASCADE,
  parent_comment_id uuid REFERENCES blog_comments(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_email text NOT NULL,
  author_website text,
  content text NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- pending, approved, spam, rejected
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  ip_address text,
  user_agent text
);

-- Table: blog_subscribers
CREATE TABLE blog_subscribers (
  id uuid PRIMARY KEY,
  email text NOT NULL UNIQUE,
  name text,
  status text NOT NULL DEFAULT 'active', -- active, inactive, unsubscribed
  confirmation_token text,
  confirmed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Table: blog_media
CREATE TABLE blog_media (
  id uuid PRIMARY KEY,
  filename text NOT NULL,
  original_filename text NOT NULL,
  file_size integer NOT NULL,
  file_type text NOT NULL,
  url text NOT NULL,
  alt_text text,
  caption text,
  width integer,
  height integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  uploaded_by_id uuid
);

-- Table: blog_post_revisions
CREATE TABLE blog_post_revisions (
  id uuid PRIMARY KEY,
  post_id uuid REFERENCES blog_posts(id) ON DELETE CASCADE,
  content text NOT NULL,
  title text NOT NULL,
  subtitle text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by_id uuid
);

-- Table: blog_analytics
CREATE TABLE blog_analytics (
  id uuid PRIMARY KEY,
  post_id uuid REFERENCES blog_posts(id) ON DELETE CASCADE,
  view_date date NOT NULL,
  views_count integer NOT NULL DEFAULT 0,
  unique_views_count integer NOT NULL DEFAULT 0,
  referrer_sources jsonb -- JSON structure to store referrers and their counts
);

-- Table: blog_settings
CREATE TABLE blog_settings (
  id uuid PRIMARY KEY,
  setting_key text NOT NULL UNIQUE,
  setting_value text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX blog_posts_slug_idx ON blog_posts(slug);
CREATE INDEX blog_posts_status_idx ON blog_posts(status);
CREATE INDEX blog_posts_category_id_idx ON blog_posts(category_id);
CREATE INDEX blog_posts_author_id_idx ON blog_posts(author_id);
CREATE INDEX blog_posts_published_at_idx ON blog_posts(published_at);
CREATE INDEX blog_categories_slug_idx ON blog_categories(slug);
CREATE INDEX blog_tags_slug_idx ON blog_tags(slug);
CREATE INDEX blog_comments_post_id_idx ON blog_comments(post_id);
CREATE INDEX blog_post_tags_post_id_idx ON blog_post_tags(post_id);
CREATE INDEX blog_post_tags_tag_id_idx ON blog_post_tags(tag_id);
CREATE INDEX blog_analytics_post_id_idx ON blog_analytics(post_id);
CREATE INDEX blog_analytics_view_date_idx ON blog_analytics(view_date);

-- Comments:
-- 1. All UUIDs should be generated using gen_random_uuid() function
-- 2. The timestamps (created_at, updated_at) should be managed by triggers or application code
-- 3. Slug columns should be generated based on the name/title and must be unique
-- 4. For blog_posts.status: 'draft' means not published yet, 'published' means live, 'scheduled' means will go live at published_at 