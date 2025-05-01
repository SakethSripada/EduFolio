import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from '@/lib/supabase/client';

/**
 * Checks if the shared_links table exists and creates it if it doesn't
 * This helps ensure that the necessary database structure is in place
 * before attempting to use share functionality
 */
export async function ensureSharedLinksTable(): Promise<boolean> {
  const supabase = createClient();
  
  try {
    // First check if the shared_links table exists
    const { data: tables, error: tableCheckError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'shared_links');
    
    if (tableCheckError) {
      console.error('Error checking for shared_links table:', tableCheckError);
      return false;
    }
    
    // If table doesn't exist, create it
    if (!tables || tables.length === 0) {
      
      // Call the function we've created in Supabase
      const { error: createError } = await supabase.rpc('create_shared_links_table');
      
      if (createError) {
        console.error('Error creating shared_links table:', createError);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error ensuring shared_links table exists:', error);
    return false;
  }
}

/**
 * Creates the exec_sql function if it doesn't exist
 * This is needed to execute arbitrary SQL for migrations
 */
export async function createExecSqlFunction(): Promise<{
  success: boolean;
  error?: string;
}> {
  const supabase = createClient();

  try {
    // Try to create the exec_sql function
    const { error } = await supabase.rpc(
      "exec_sql",
      {
        sql_query: `
        -- This is a test query to see if the function exists
        SELECT 1;
        `
      }
    );

    // If the function exists, we're good
    if (!error || error.code !== "42883") {
      return { success: true };
    }

    // Function doesn't exist, create it
    // This needs to be executed by a superuser or via the Supabase dashboard SQL editor
    const createFunctionSql = `
    -- You need to execute this SQL in the Supabase SQL Editor as a superuser
    CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE sql_query;
    END;
    $$;

    -- Grant execute permission to authenticated users
    GRANT EXECUTE ON FUNCTION exec_sql(TEXT) TO authenticated;
    `;

    return { 
      success: false, 
      error: "The exec_sql function needs to be created manually. Please run the following SQL in the Supabase SQL Editor:\n\n" + createFunctionSql 
    };
  } catch (error: any) {
    console.error("Error creating exec_sql function:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
} 