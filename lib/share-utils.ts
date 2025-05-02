import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export type ShareLinkType = "college_application" | "college_profile" | "portfolio"

export interface ShareSettings {
  showExtracurriculars?: boolean
  showAcademics?: boolean
  showAwards?: boolean
  showEssays?: boolean
  showCourses?: boolean
  showTestScores?: boolean
  showColleges?: boolean
  hideUserName?: boolean
  hidePersonalInfo?: boolean
}

export interface ShareLinkData {
  id?: string
  user_id: string
  share_id: string
  content_type: ShareLinkType
  content_id?: string
  is_public: boolean
  settings?: ShareSettings | null
  expires_at?: string | null
  created_at?: string
  updated_at?: string
}

/**
 * Creates or updates a share link
 */
export async function createOrUpdateShareLink({
  userId,
  contentType,
  contentId,
  isPublic,
  expiresAt,
  existingShareId,
  settings,
}: {
  userId: string
  contentType: ShareLinkType
  contentId?: string | null
  isPublic: boolean
  expiresAt?: Date | null
  existingShareId?: string
  settings?: ShareSettings
}): Promise<{ success: boolean; shareId: string; shareLink?: string; error?: any }> {
  const supabase = createClientComponentClient()

  try {
    // Generate a new share ID if none exists
    const shareId = existingShareId || Math.random().toString(36).substring(2, 10)

    // Check if a share link already exists
    const { data: existingLink, error: fetchError } = await supabase
      .from("shared_links")
      .select("id")
      .eq("user_id", userId)
      .eq("content_type", contentType)
      .eq(contentId ? "college_id" : "share_id", contentId || shareId)
      .maybeSingle()

    if (fetchError) throw fetchError

    if (existingLink) {
      // Update existing share link
      const { error: updateError } = await supabase
        .from("shared_links")
        .update({
          is_public: isPublic,
          expires_at: expiresAt ? expiresAt.toISOString() : null,
          updated_at: new Date().toISOString(),
          settings: settings || {},
        })
        .eq("id", existingLink.id)

      if (updateError) throw updateError

      const shareLink = generateShareUrl(contentType, shareId, contentId as string | undefined)
      return { success: true, shareId, shareLink }
    } else {
      // Create new share link
      const { error: insertError } = await supabase.from("shared_links").insert({
        user_id: userId,
        share_id: shareId,
        content_type: contentType,
        content_id: contentId,
        is_public: isPublic,
        settings: settings || {},
        expires_at: expiresAt ? expiresAt.toISOString() : null,
      })

      if (insertError) throw insertError

      const shareLink = generateShareUrl(contentType, shareId, contentId as string | undefined)
      return { success: true, shareId, shareLink }
    }
  } catch (error) {
    console.error("Error creating/updating share link:", error)
    return { success: false, shareId: "", error }
  }
}

/**
 * Gets a share link by ID
 */
export async function getShareLink(shareId: string): Promise<{ data: ShareLinkData | null; error: any }> {
  const supabase = createClientComponentClient()

  try {
    const { data, error } = await supabase.from("shared_links").select("*").eq("share_id", shareId).maybeSingle()

    if (error) throw error

    // Check if the link has expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return { data: null, error: "This share link has expired." }
    }

    return { data, error: null }
  } catch (error) {
    console.error("Error fetching share link:", error)
    return { data: null, error }
  }
}

/**
 * Generates a share URL
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
