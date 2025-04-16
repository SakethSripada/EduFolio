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
  // Create Supabase client
  const supabase = createClientComponentClient()

  try {
    const shareId = existingShareId || Math.random().toString(36).substring(2, 10)
    // Build payload for debugging
    const payload = {
      user_id: userId,
      share_id: shareId,
      content_type: contentType,
      content_id: contentId || null,
      is_public: isPublic,
      expires_at: expiresAt ? expiresAt.toISOString() : null,
      settings: settings || {},
    }
    console.log("Insert/Update Payload for shared_links:", payload)

    // First, verify that the current user is authenticated and matches the userId
    const { data: { session } } = await supabase.auth.getSession()
    if (!session || session.user.id !== userId) {
      console.error("Authentication mismatch or missing session:", { 
        hasSession: !!session, 
        sessionUserId: session?.user.id, 
        requestedUserId: userId 
      })
      return { success: false, shareId: "", error: "Authentication required. Please sign in again." }
    }

    // Check if a share link already exists.
    const { data: existingLink, error: fetchError } = await supabase
      .from("shared_links")
      .select("id")
      .eq("user_id", userId)
      .eq("content_type", contentType)
      .eq(contentId ? "content_id" : "share_id", contentId || shareId)
      .maybeSingle()

    if (fetchError) {
      throw fetchError
    }

    if (existingLink) {
      // Update existing link.
      const { error: updateError } = await supabase
        .from("shared_links")
        .update({
          is_public: isPublic,
          expires_at: payload.expires_at,
          settings: payload.settings,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingLink.id)

      if (updateError) {
        throw updateError
      }

      return { success: true, shareId }
    } else {
      // Create new share link record.
      const { error: insertError } = await supabase.from("shared_links").insert(payload)

      if (insertError) {
        throw insertError
      }
      return { success: true, shareId }
    }
  } catch (error: any) {
    console.error("Error creating/updating share link:", error)
    if (error && error.message) {
      console.error("Error message:", error.message)
    } else {
      console.error("Error object:", error)
    }
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
