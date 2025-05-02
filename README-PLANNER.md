# EduFolio - Planner Feature

The Planner feature is a comprehensive planning solution for managing personal schedules, tasks, projects, and job applications.

## Database Schema

The planner functionality is supported by the following database tables:

1. `planner_events` - For calendar events
2. `planner_tasks` - For tasks and to-do items
3. `planner_boards` - For Kanban boards 
4. `planner_columns` - For Kanban board columns
5. `planner_application_tracker` - For job/internship application tracking
6. `planner_notes` - For storing user notes

See the SQL schema in `sql/planner-schema.sql`.

## Features

### Calendar View
- Monthly calendar with day, week, and month views
- Create, edit, and delete events
- Event color coding and categorization
- View events for specific days
- Recurring event support

### Task Management
- Create and organize tasks
- Set priorities and due dates
- Filter and search tasks
- Mark tasks as complete
- Organize tasks by status (To Do, In Progress, Done)

### Kanban Boards
- Create multiple boards for different projects
- Define custom columns for your workflow
- Drag and drop tasks between columns
- Set task priorities and due dates
- Visual progress tracking

### Application Tracker
- Track job and internship applications
- Record company details, position, application status
- Manage application statuses (Interested, Applied, Interviewing, Offer, etc.)
- Store contact information and interview details
- Record salary information and notes
- Track next steps and follow-ups

## Technical Implementation

### Frontend
- Built with Next.js and React
- UI components from shadcn/ui library
- Responsive design for all device sizes

### Backend
- Uses Supabase for database and authentication
- Real-time data synchronization
- Row-level security for data privacy

### Key Components
- `/app/planner/page.tsx` - Main planner page with tab navigation
- `/components/planner/CalendarView.tsx` - Calendar component
- `/components/planner/KanbanBoard.tsx` - Kanban boards component
- `/components/planner/TasksList.tsx` - Tasks list component
- `/components/planner/ApplicationTracker.tsx` - Job application tracker

## How to Run

1. Run the database migrations:
   ```
   psql -d your_database_name -f sql/planner-schema.sql
   ```

2. Start the application:
   ```
   npm run dev
   ```

3. Navigate to the Planner feature in the app's navigation menu. 