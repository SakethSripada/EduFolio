import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

/**
 * Creates and returns a Supabase client for use in component code
 */
export function createClient() {
  return createClientComponentClient<Database>();
} 