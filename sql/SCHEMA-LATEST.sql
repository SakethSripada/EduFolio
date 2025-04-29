-- Table: academics
CREATE TABLE academics (
  id uuid,
  user_id uuid,
  name text,
  grade text,
  credits numeric,
  level text,
  grade_level text,
  term text,
  grade_points numeric,
  weighted_grade_points numeric,
  created_at timestamptz,
  updated_at timestamptz
);

-- Table: awards
CREATE TABLE awards (
  id uuid,
  user_id uuid,
  title text,
  grade_level text,
  recognition_level text,
  date_received date,
  date_display text,
  description text,
  issuing_organization text,
  created_at timestamptz,
  updated_at timestamptz
);

-- Table: categories
CREATE TABLE categories (
  id text,
  user_id uuid,
  name text,
  icon text,
  created_at timestamptz,
  updated_at timestamptz
);

-- Table: chat_conversations
CREATE TABLE chat_conversations (
  id uuid,
  user_id uuid,
  title text,
  created_at timestamptz,
  updated_at timestamptz,
  is_favorite bool
);

-- Table: chat_messages
CREATE TABLE chat_messages (
  id uuid,
  conversation_id uuid,
  role text,
  content text,
  timestamp timestamptz,
  context jsonb
);

-- Table: college_academics
CREATE TABLE college_academics (
  id uuid,
  user_id uuid,
  college_id uuid,
  name text,
  grade text,
  credits numeric,
  level text,
  grade_level text,
  term text,
  grade_points numeric,
  weighted_grade_points numeric,
  created_at timestamptz,
  updated_at timestamptz
);

-- Table: college_awards
CREATE TABLE college_awards (
  id uuid,
  user_id uuid,
  college_id uuid,
  title text,
  grade_level text,
  recognition_level text,
  date_received date,
  date_display text,
  description text,
  issuing_organization text,
  created_at timestamptz,
  updated_at timestamptz
);

-- Table: college_courses
CREATE TABLE college_courses (
  id uuid,
  user_id uuid,
  college_id uuid,
  name text,
  grade text,
  credits numeric,
  level text,
  grade_level text,
  term text,
  grade_points numeric,
  weighted_grade_points numeric,
  school_year text,
  notes text,
  created_at timestamptz,
  updated_at timestamptz
);

-- Table: college_essay_versions
CREATE TABLE college_essay_versions (
  id uuid,
  essay_id uuid,
  content text,
  word_count int4,
  character_count int4,
  version_name text,
  created_at timestamptz
);

-- Table: college_essays
CREATE TABLE college_essays (
  id uuid,
  user_id uuid,
  college_id uuid,
  title text,
  prompt text,
  content text,
  word_count int4,
  character_count int4,
  target_word_count int4,
  last_edited text,
  status text,
  created_at timestamptz,
  updated_at timestamptz,
  character_limit int4,
  word_limit int4,
  enforce_limits bool,
  folder_id uuid,
  external_link text
);

-- Table: college_extracurricular_activities
CREATE TABLE college_extracurricular_activities (
  id uuid,
  user_id uuid,
  college_id uuid,
  activity_type text,
  position text,
  organization text,
  description text,
  grade_levels text,
  participation_timing text,
  hours_per_week int4,
  weeks_per_year int4,
  continue_in_college bool,
  impact_statement text,
  start_date date,
  end_date date,
  is_current bool,
  created_at timestamptz,
  updated_at timestamptz
);

-- Table: college_extracurriculars
CREATE TABLE college_extracurriculars (
  id uuid,
  user_id uuid,
  college_id uuid,
  type text,
  position text,
  organization text,
  description text,
  grades text,
  timing text,
  hours_per_week int4,
  weeks_per_year int4,
  continue_in_college bool,
  created_at timestamptz,
  updated_at timestamptz
);

-- Table: college_profiles
CREATE TABLE college_profiles (
  id uuid,
  user_id uuid,
  college_id uuid,
  application_status int4,
  application_deadline text,
  application_notes text,
  created_at timestamptz,
  updated_at timestamptz
);

-- Table: college_todos
CREATE TABLE college_todos (
  id uuid,
  user_id uuid,
  college_id uuid,
  title text,
  description text,
  due_date date,
  due_date_display text,
  priority text,
  completed bool,
  category text,
  related_essay_id uuid,
  completed_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
);

-- Table: colleges
CREATE TABLE colleges (
  id uuid,
  name text,
  location text,
  type text,
  size text,
  acceptance_rate numeric,
  ranking int4,
  tuition numeric,
  logo_url text,
  website_url text,
  created_at timestamptz,
  updated_at timestamptz
);

-- Table: courses
CREATE TABLE courses (
  id uuid,
  user_id uuid,
  name text,
  grade text,
  credits numeric,
  level text,
  grade_level text,
  term text,
  grade_points numeric,
  weighted_grade_points numeric,
  school_year text,
  notes text,
  created_at timestamptz,
  updated_at timestamptz
);

-- Table: essay_folders
CREATE TABLE essay_folders (
  id uuid,
  name text,
  description text,
  parent_folder_id uuid,
  college_id uuid,
  user_id uuid,
  created_at timestamptz,
  updated_at timestamptz
);

-- Table: essay_versions
CREATE TABLE essay_versions (
  id uuid,
  essay_id uuid,
  content text,
  word_count int4,
  character_count int4,
  version_name text,
  created_at timestamptz
);

-- Table: essays
CREATE TABLE essays (
  id uuid,
  user_id uuid,
  title text,
  prompt text,
  content text,
  word_count int4,
  character_count int4,
  target_word_count int4,
  last_edited text,
  college_id uuid,
  is_common_app bool,
  status text,
  created_at timestamptz,
  updated_at timestamptz,
  character_limit int4,
  word_limit int4,
  enforce_limits bool,
  folder_id uuid,
  external_link text
);

-- Table: extracurricular_activities
CREATE TABLE extracurricular_activities (
  id uuid,
  user_id uuid,
  activity_type text,
  position text,
  organization text,
  description text,
  grade_levels text,
  participation_timing text,
  hours_per_week int4,
  weeks_per_year int4,
  continue_in_college bool,
  impact_statement text,
  start_date date,
  end_date date,
  is_current bool,
  created_at timestamptz,
  updated_at timestamptz
);

-- Table: extracurriculars
CREATE TABLE extracurriculars (
  id uuid,
  user_id uuid,
  type text,
  position text,
  organization text,
  description text,
  grades text,
  timing text,
  hours_per_week int4,
  weeks_per_year int4,
  continue_in_college bool,
  created_at timestamptz,
  updated_at timestamptz
);

-- Table: manual_gpa
CREATE TABLE manual_gpa (
  id uuid,
  user_id uuid,
  unweighted numeric,
  weighted numeric,
  uc_gpa numeric,
  use_manual bool,
  created_at timestamptz,
  updated_at timestamptz
);

-- Table: profiles
CREATE TABLE profiles (
  id uuid,
  user_id uuid,
  full_name text,
  avatar_url text,
  email text,
  bio text,
  created_at timestamptz,
  updated_at timestamptz,
  grad_year text,
  school text,
  interests text,
  privacy_settings jsonb
);

-- Table: projects
CREATE TABLE projects (
  id uuid,
  user_id uuid,
  title text,
  description text,
  category text,
  tags _text,
  link text,
  image text,
  gallery _text,
  date text,
  created_at timestamptz,
  updated_at timestamptz
);

-- Table: shared_links
CREATE TABLE shared_links (
  id uuid,
  user_id uuid,
  share_id text,
  content_type text,
  content_id uuid,
  is_public bool,
  settings jsonb,
  expires_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
);

-- Table: test_scores
CREATE TABLE test_scores (
  id uuid,
  user_id uuid,
  test_name text,
  score numeric,
  max_score numeric,
  test_date date,
  test_date_display text,
  notes text,
  created_at timestamptz,
  updated_at timestamptz
);

-- Table: todos
CREATE TABLE todos (
  id uuid,
  user_id uuid,
  title text,
  description text,
  due_date date,
  due_date_display text,
  priority text,
  completed bool,
  category text,
  related_college_id uuid,
  related_essay_id uuid,
  completed_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
);

-- Table: user_colleges
CREATE TABLE user_colleges (
  id uuid,
  user_id uuid,
  college_id uuid,
  application_status text,
  application_deadline date,
  application_deadline_display text,
  is_reach bool,
  is_target bool,
  is_safety bool,
  is_favorite bool,
  notes text,
  created_at timestamptz,
  updated_at timestamptz
);
