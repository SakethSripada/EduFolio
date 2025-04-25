export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
          full_name: string | null
          avatar_url: string | null
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          avatar_url?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string
          avatar_url: string | null
          email: string
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          avatar_url?: string | null
          email: string
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          avatar_url?: string | null
          email?: string
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      colleges: {
        Row: {
          id: string
          user_id: string
          name: string
          location: string
          type: string
          size: string
          acceptance: number
          ranking: number
          tuition: number
          logo: string
          status: string
          application_deadline: string | null
          application_status: number | null
          notes: string | null
          is_reach: boolean
          is_target: boolean
          is_safety: boolean
          is_liked: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          location: string
          type: string
          size: string
          acceptance: number
          ranking: number
          tuition: number
          logo: string
          status: string
          application_deadline?: string | null
          application_status?: number | null
          notes?: string | null
          is_reach?: boolean
          is_target?: boolean
          is_safety?: boolean
          is_liked?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          location?: string
          type?: string
          size?: string
          acceptance?: number
          ranking?: number
          tuition?: number
          logo?: string
          status?: string
          application_deadline?: string | null
          application_status?: number | null
          notes?: string | null
          is_reach?: boolean
          is_target?: boolean
          is_safety?: boolean
          is_liked?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      academics: {
        Row: {
          id: string
          user_id: string
          name: string
          grade: string
          credits: number
          level: string
          grade_level: string
          term: string
          grade_points: number
          weighted_grade_points: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          grade: string
          credits: number
          level: string
          grade_level: string
          term: string
          grade_points: number
          weighted_grade_points: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          grade?: string
          credits?: number
          level?: string
          grade_level?: string
          term?: string
          grade_points?: number
          weighted_grade_points?: number
          created_at?: string
          updated_at?: string
        }
      }
      test_scores: {
        Row: {
          id: string
          user_id: string
          test: string
          score: number
          date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          test: string
          score: number
          date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          test?: string
          score?: number
          date?: string
          created_at?: string
          updated_at?: string
        }
      }
      extracurriculars: {
        Row: {
          id: string
          user_id: string
          type: string
          position: string
          organization: string
          description: string
          grades: string
          timing: string
          hours_per_week: number
          weeks_per_year: number
          continue_in_college: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          position: string
          organization: string
          description: string
          grades: string
          timing: string
          hours_per_week: number
          weeks_per_year: number
          continue_in_college: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          position?: string
          organization?: string
          description?: string
          grades?: string
          timing?: string
          hours_per_week?: number
          weeks_per_year?: number
          continue_in_college?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      awards: {
        Row: {
          id: string
          user_id: string
          title: string
          grade_level: string
          level: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          grade_level: string
          level: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          grade_level?: string
          level?: string
          created_at?: string
          updated_at?: string
        }
      }
      essays: {
        Row: {
          id: string
          user_id: string
          prompt: string
          content: string
          word_count: number
          last_edited: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          prompt: string
          content: string
          word_count: number
          last_edited: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          prompt?: string
          content?: string
          word_count?: number
          last_edited?: string
          created_at?: string
          updated_at?: string
        }
      }
      college_essays: {
        Row: {
          id: string
          user_id: string
          college_id: string
          prompt: string
          content: string
          word_count: number
          last_edited: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          college_id: string
          prompt: string
          content: string
          word_count: number
          last_edited: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          college_id?: string
          prompt?: string
          content?: string
          word_count?: number
          last_edited?: string
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          category: string
          tags: string[]
          link: string | null
          image: string
          gallery: string[]
          date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          category: string
          tags: string[]
          link?: string | null
          image: string
          gallery?: string[]
          date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          category?: string
          tags?: string[]
          link?: string | null
          image?: string
          gallery?: string[]
          date?: string
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          icon: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          icon: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          icon?: string
          created_at?: string
          updated_at?: string
        }
      }
      todos: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          due_date: string | null
          priority: string
          completed: boolean
          category: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          due_date?: string | null
          priority: string
          completed: boolean
          category: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          due_date?: string | null
          priority?: string
          completed?: boolean
          category?: string
          created_at?: string
          updated_at?: string
        }
      }
      manual_gpa: {
        Row: {
          id: string
          user_id: string
          unweighted: number
          weighted: number
          uc_gpa: number
          use_manual: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          unweighted: number
          weighted: number
          uc_gpa: number
          use_manual: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          unweighted?: number
          weighted?: number
          uc_gpa?: number
          use_manual?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_colleges: {
        Row: {
          id: string
          user_id: string
          college_id: string
          application_status: string
          application_deadline: string | null
          application_deadline_display: string | null
          is_reach: boolean
          is_target: boolean
          is_safety: boolean
          is_favorite: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          college_id: string
          application_status?: string
          application_deadline?: string | null
          application_deadline_display?: string | null
          is_reach?: boolean
          is_target?: boolean
          is_safety?: boolean
          is_favorite?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          college_id?: string
          application_status?: string
          application_deadline?: string | null
          application_deadline_display?: string | null
          is_reach?: boolean
          is_target?: boolean
          is_safety?: boolean
          is_favorite?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      college_profiles: {
        Row: {
          id: string
          user_id: string
          college_id: string
          application_status: number | null
          application_deadline: string | null
          application_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          college_id: string
          application_status?: number | null
          application_deadline?: string | null
          application_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          college_id?: string
          application_status?: number | null
          application_deadline?: string | null
          application_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      college_academics: {
        Row: {
          id: string
          user_id: string
          college_id: string
          name: string
          grade: string
          credits: number
          level: string
          grade_level: string
          term: string
          grade_points: number
          weighted_grade_points: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          college_id: string
          name: string
          grade: string
          credits: number
          level: string
          grade_level: string
          term: string
          grade_points: number
          weighted_grade_points: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          college_id?: string
          name?: string
          grade?: string
          credits?: number
          level?: string
          grade_level?: string
          term?: string
          grade_points?: number
          weighted_grade_points?: number
          created_at?: string
          updated_at?: string
        }
      }
      college_extracurriculars: {
        Row: {
          id: string
          user_id: string
          college_id: string
          type: string
          position: string
          organization: string
          description: string
          grades: string
          timing: string
          hours_per_week: number
          weeks_per_year: number
          continue_in_college: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          college_id: string
          type: string
          position: string
          organization: string
          description: string
          grades: string
          timing: string
          hours_per_week: number
          weeks_per_year: number
          continue_in_college: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          college_id?: string
          type?: string
          position?: string
          organization?: string
          description?: string
          grades?: string
          timing?: string
          hours_per_week?: number
          weeks_per_year?: number
          continue_in_college?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      college_awards: {
        Row: {
          id: string
          user_id: string
          college_id: string
          title: string
          grade_level: string
          level: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          college_id: string
          title: string
          grade_level: string
          level: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          college_id?: string
          title?: string
          grade_level?: string
          level?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
