import type { Database } from "./supabase"

// Define common types that are derived from Database types
export type UserCollege = Database["public"]["Tables"]["user_colleges"]["Row"]
export type College = Database["public"]["Tables"]["colleges"]["Row"]
export type Essay = Database["public"]["Tables"]["essays"]["Row"]
export type Extracurricular = Database["public"]["Tables"]["extracurriculars"]["Row"]
export type Award = Database["public"]["Tables"]["awards"]["Row"]
export type UserProfile = Database["public"]["Tables"]["profiles"]["Row"] 