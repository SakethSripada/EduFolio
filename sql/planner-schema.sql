-- Table: planner_events
CREATE TABLE planner_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  all_day boolean DEFAULT false,
  location text,
  color text,
  reminder_time timestamptz,
  recurring_pattern text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table: planner_tasks
CREATE TABLE planner_tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  due_date timestamptz,
  priority text CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status text DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done', 'archived')),
  board_id uuid,
  column_id uuid,
  position int DEFAULT 0,
  labels text[],
  color text,
  related_event_id uuid REFERENCES planner_events(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table: planner_boards (for Kanban boards)
CREATE TABLE planner_boards (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  color text,
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table: planner_columns (for Kanban columns)
CREATE TABLE planner_columns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  board_id uuid REFERENCES planner_boards(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  color text,
  position int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table: planner_application_tracker (for job/internship applications)
CREATE TABLE planner_application_tracker (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  position text NOT NULL,
  application_url text,
  status text DEFAULT 'interested' CHECK (status IN ('interested', 'applied', 'interviewing', 'offer', 'rejected', 'declined', 'archived')),
  application_date date,
  notes text,
  salary_range text,
  location text,
  contact_name text,
  contact_email text,
  contact_phone text,
  next_steps text,
  next_steps_date date,
  related_tasks uuid[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table: planner_notes
CREATE TABLE planner_notes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  category text,
  color text,
  is_pinned boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add RLS (Row Level Security) policies
ALTER TABLE planner_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE planner_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE planner_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE planner_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE planner_application_tracker ENABLE ROW LEVEL SECURITY;
ALTER TABLE planner_notes ENABLE ROW LEVEL SECURITY;

-- Create policies (only allow users to see their own data)
CREATE POLICY "Users can view their own events" ON planner_events
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own events" ON planner_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own events" ON planner_events
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own events" ON planner_events
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own tasks" ON planner_tasks
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own tasks" ON planner_tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tasks" ON planner_tasks
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tasks" ON planner_tasks
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own boards" ON planner_boards
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own boards" ON planner_boards
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own boards" ON planner_boards
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own boards" ON planner_boards
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own columns" ON planner_columns
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM planner_boards pb WHERE pb.id = board_id AND pb.user_id = auth.uid()
  ));
CREATE POLICY "Users can insert their own columns" ON planner_columns
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM planner_boards pb WHERE pb.id = board_id AND pb.user_id = auth.uid()
  ));
CREATE POLICY "Users can update their own columns" ON planner_columns
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM planner_boards pb WHERE pb.id = board_id AND pb.user_id = auth.uid()
  ));
CREATE POLICY "Users can delete their own columns" ON planner_columns
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM planner_boards pb WHERE pb.id = board_id AND pb.user_id = auth.uid()
  ));

CREATE POLICY "Users can view their own applications" ON planner_application_tracker
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own applications" ON planner_application_tracker
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own applications" ON planner_application_tracker
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own applications" ON planner_application_tracker
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own notes" ON planner_notes
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own notes" ON planner_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notes" ON planner_notes
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notes" ON planner_notes
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX planner_events_user_id_idx ON planner_events(user_id);
CREATE INDEX planner_events_start_date_idx ON planner_events(start_date);
CREATE INDEX planner_tasks_user_id_idx ON planner_tasks(user_id);
CREATE INDEX planner_tasks_board_id_idx ON planner_tasks(board_id);
CREATE INDEX planner_tasks_column_id_idx ON planner_tasks(column_id);
CREATE INDEX planner_boards_user_id_idx ON planner_boards(user_id);
CREATE INDEX planner_columns_board_id_idx ON planner_columns(board_id);
CREATE INDEX planner_application_tracker_user_id_idx ON planner_application_tracker(user_id);
CREATE INDEX planner_notes_user_id_idx ON planner_notes(user_id); 