// /lib/supabase/utils.ts
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export type ShareLinkType = "college_application" | "college_profile" | "portfolio"

export interface ShareLinkData {
  id?: string
  user_id: string
  share_id: string
  content_type: ShareLinkType
  content_id?: string | null
  is_public: boolean
  settings?: Record<string, any> | null
  expires_at?: string | null
  created_at?: string
  updated_at?: string
}

/**
 * Creates or updates a share link.
 * Accepts an optional `settings` object to store JSON configuration.
 */
export async function createOrUpdateShareLink({
  userId,
  contentType,
  contentId,
  isPublic,
  expiresAt,
  existingShareId,
  settings, // settings for the share section visibility
}: {
  userId: string
  contentType: ShareLinkType
  contentId?: string | null
  isPublic: boolean
  expiresAt?: Date | null
  existingShareId?: string
  settings?: Record<string, any>
}): Promise<{ success: boolean; shareId: string; error?: any }> {
  try {
    const supabase = createClientComponentClient()
    
    // Use the provided shareId or generate a new one.
    const shareId = existingShareId || Math.random().toString(36).substring(2, 10)

    const payload = {
      user_id: userId,
      share_id: shareId,
      content_type: contentType,
      content_id: contentId || null,
      is_public: isPublic,
      expires_at: expiresAt ? expiresAt.toISOString() : null,
      settings: settings || {},
    }

    // Check if a share link already exists for this user and content type
    const { data: existingRecord, error: findError } = await supabase
      .from("shared_links")
      .select("id, share_id")
      .eq("user_id", userId)
      .eq("content_type", contentType)
      .maybeSingle();
      
    if (findError) {
      console.error("Error checking for existing record:", findError);
      throw findError;
    }
    
    // If we have an existing record, update it
    if (existingRecord) {
      console.log("Updating existing share link");
      
      const { error: updateError } = await supabase
        .from("shared_links")
        .update({
          is_public: isPublic,
          expires_at: payload.expires_at,
          settings: payload.settings,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingRecord.id);
        
      if (updateError) {
        console.error("Error updating share link:", updateError);
        throw updateError;
      }
      
      return { success: true, shareId: existingRecord.share_id };
    } 
    // Otherwise create a new record
    else {
      console.log("Creating new share link");
      
      const { data: insertedData, error: insertError } = await supabase
        .from("shared_links")
        .insert(payload)
        .select("share_id")
        .single();
      
      if (insertError) {
        console.error("Error inserting share link:", insertError);
        throw insertError;
      }
      
      return { success: true, shareId: insertedData.share_id };
    }
  } catch (error: any) {
    console.error("Error creating/updating share link:", error)
    return { success: false, shareId: "", error }
  }
}

/**
 * Gets a share link by ID.
 */
export async function getShareLink(shareId: string): Promise<{ data: ShareLinkData | null; error: any }> {
  const supabase = createClientComponentClient()

  try {
    // First check if we can find the link
    const { data, error } = await supabase.from("shared_links").select("*").eq("share_id", shareId).single()

    if (error) throw error

    // Check for expiry
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return { data: null, error: "This share link has expired." }
    }

    // If the link is not public, verify that the current user is the owner
    if (!data.is_public) {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session || session.user.id !== data.user_id) {
        return { data: null, error: "This is a private link. You need to be the owner to view it." }
      }
    }

    return { data, error: null }
  } catch (error) {
    console.error("Error fetching share link:", error)
    return { data: null, error }
  }
}

/**
 * Generates a share URL.
 */
export function generateShareUrl(contentType: ShareLinkType, shareId: string, contentId?: string): string {
  const baseUrl = typeof window !== "undefined" ? `${window.location.protocol}//${window.location.host}` : ""
  if (contentType === "college_profile" && contentId) {
    return `${baseUrl}/share/college/${contentId}/${shareId}`
  } else if (contentType === "college_application") {
    return `${baseUrl}/share/college-application/${shareId}`
  } else if (contentType === "portfolio") {
    return `${baseUrl}/share/portfolio/${shareId}`
  }
  return `${baseUrl}/share/${contentType}/${shareId}`
}
