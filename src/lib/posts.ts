import { supabase } from "./supabase";

export interface DbPost {
  id: string;
  user_id: string;
  content: string;
  media_urls: string[];
  giphy_url?: string;
  video_url?: string;
  likes_count: number;
  comments_count: number;
  reposts_count: number;
  views_count: number;
  boosted: boolean;
  is_sensitive: boolean;
  category: string;
  quiz?: {
    question: string;
    options: string[];
    votes: number[];
    voted_index?: number;
    correct_option_index?: number;
    explanation?: string;
    lead_link?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface DbComment {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id?: string;
  content: string;
  likes_count: number;
  replies_count: number;
  created_at: string;
  updated_at: string;
}

export interface DbReaction {
  id: string;
  user_id: string;
  post_id?: string;
  comment_id?: string;
  reaction_type: string;
  created_at: string;
}

export interface PostWithProfile extends DbPost {
  profiles: {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string;
    is_verified: boolean;
  };
}

export interface CommentWithProfile extends DbComment {
  profiles: {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string;
    is_verified: boolean;
  };
}

const COMMENTS_BATCH_SIZE = 5;
const REPLIES_BATCH_SIZE = 3;

export async function getFeedPosts(
  limit = 20,
  offset = 0,
  category?: string,
): Promise<PostWithProfile[]> {
  let query = supabase
    .from("posts")
    .select(
      `
      *,
      profiles!posts_user_id_fkey (
        id,
        full_name,
        username,
        avatar_url,
        is_verified
      )
    `,
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching posts:", error);
    return [];
  }

  return (data || []).map((post: PostWithProfile) => ({
    ...post,
    media_urls: post.media_urls || [],
  }));
}

export async function getPostById(
  postId: string,
): Promise<PostWithProfile | null> {
  // Fix: Check if the string matches a standard UUID structure
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  // Guard Clause: If it's a dummy text string like "post-4", exit immediately
  if (!uuidRegex.test(postId)) {
    console.warn(
      `getPostById cancelled: "${postId}" is a placeholder text string, not a valid UUID.`,
    );
    return null;
  }

  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      *,
      profiles!posts_user_id_fkey (
        id,
        full_name,
        username,
        avatar_url,
        is_verified:verified
      )
    `,
    ) // Fix: Map database 'verified' column to frontend 'is_verified' property
    .eq("id", postId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching post:", error);
    return null;
  }

  if (!data) return null;

  return {
    ...data,
    media_urls: data.media_urls || [],
  };
}

export async function createPost(
  userId: string,
  content: string,
  options?: {
    media_urls?: string[];
    giphy_url?: string;
    video_url?: string;
    is_sensitive?: boolean;
    category?: string;
    quiz?: DbPost["quiz"];
    group_id?: string;
  },
): Promise<PostWithProfile | null> {
  const { data, error } = await supabase
    .from("posts")
    .insert({
      user_id: userId,
      content,
      media_urls: options?.media_urls || [],
      giphy_url: options?.giphy_url,
      video_url: options?.video_url,
      is_sensitive: options?.is_sensitive || false,
      category: options?.category || "General",
      quiz: options?.quiz,
      group_id: options?.group_id || null,
    })
    .select(
      `
      *,
      profiles!posts_user_id_fkey (
        id,
        full_name,
        username,
        avatar_url,
        is_verified
      )
    `,
    )
    .single();

  if (error) {
    console.error("Error creating post:", error);
    return null;
  }

  return {
    ...data,
    media_urls: data.media_urls || [],
  };
}

export async function incrementPostViews(postId: string): Promise<void> {
  const { error } = await supabase.rpc("increment_views", { post_id: postId });
  if (error) {
    await supabase
      .from("posts")
      .update({ views_count: supabase.rpc("increment") as unknown as number })
      .eq("id", postId);
  }
}

export async function toggleReaction(
  userId: string,
  postId?: string,
  commentId?: string,
  reactionType = "like",
): Promise<{ reacted: boolean; reaction?: DbReaction }> {
  const existingQuery = supabase
    .from("reactions")
    .select("*")
    .eq("user_id", userId);

  if (postId) {
    existingQuery.eq("post_id", postId);
  } else if (commentId) {
    existingQuery.eq("comment_id", commentId);
  }

  const { data: existing } = await existingQuery.maybeSingle();

  if (existing) {
    await supabase.from("reactions").delete().eq("id", existing.id);
    return { reacted: false };
  }

  const { data, error } = await supabase
    .from("reactions")
    .insert({
      user_id: userId,
      post_id: postId || null,
      comment_id: commentId || null,
      reaction_type: reactionType,
    })
    .select()
    .single();

  if (error) {
    console.error("Error toggling reaction:", error);
    return { reacted: false };
  }

  return { reacted: true, reaction: data };
}

export async function getUserReaction(
  userId: string,
  postId?: string,
  commentId?: string,
): Promise<DbReaction | null> {
  let query = supabase.from("reactions").select("*").eq("user_id", userId);

  if (postId) {
    query = query.eq("post_id", postId);
  } else if (commentId) {
    query = query.eq("comment_id", commentId);
  }

  const { data } = await query.maybeSingle();
  return data;
}

export async function getComments(
  postId: string,
  offset = 0,
  limit = COMMENTS_BATCH_SIZE,
): Promise<CommentWithProfile[]> {
  const { data, error } = await supabase
    .from("comments")
    .select(
      `
      *,
      profiles!comments_user_id_fkey (
        id,
        full_name,
        username,
        avatar_url,
        is_verified
      )
    `,
    )
    .eq("post_id", postId)
    .is("parent_comment_id", null)
    .order("likes_count", { ascending: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching comments:", error);
    return [];
  }

  return data || [];
}

export async function getReplies(
  parentCommentId: string,
  offset = 0,
  limit = REPLIES_BATCH_SIZE,
): Promise<CommentWithProfile[]> {
  const { data, error } = await supabase
    .from("comments")
    .select(
      `
      *,
      profiles!comments_user_id_fkey (
        id,
        full_name,
        username,
        avatar_url,
        is_verified
      )
    `,
    )
    .eq("parent_comment_id", parentCommentId)
    .order("created_at", { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching replies:", error);
    return [];
  }

  return data || [];
}

export async function createComment(
  userId: string,
  postId: string,
  content: string,
  parentCommentId?: string,
): Promise<CommentWithProfile | null> {
  const { data, error } = await supabase
    .from("comments")
    .insert({
      user_id: userId,
      post_id: postId,
      content,
      parent_comment_id: parentCommentId || null,
    })
    .select(
      `
      *,
      profiles!comments_user_id_fkey (
        id,
        full_name,
        username,
        avatar_url,
        is_verified
      )
    `,
    )
    .single();

  if (error) {
    console.error("Error creating comment:", error);
    return null;
  }

  return data;
}

export async function deleteComment(
  commentId: string,
  userId: string,
): Promise<boolean> {
  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", userId);

  if (error) {
    console.error("Error deleting comment:", error);
    return false;
  }

  return true;
}

export async function toggleBookmark(
  userId: string,
  postId: string,
): Promise<{ bookmarked: boolean }> {
  const { data: existing } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", userId)
    .eq("post_id", postId)
    .maybeSingle();

  if (existing) {
    await supabase.from("bookmarks").delete().eq("id", existing.id);
    return { bookmarked: false };
  }

  const { error } = await supabase.from("bookmarks").insert({
    user_id: userId,
    post_id: postId,
  });

  if (error) {
    console.error("Error toggling bookmark:", error);
    return { bookmarked: false };
  }

  return { bookmarked: true };
}

export async function isBookmarked(
  userId: string,
  postId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", userId)
    .eq("post_id", postId)
    .maybeSingle();

  return !!data;
}

export async function toggleFollowDiscussion(
  userId: string,
  postId: string,
): Promise<{ following: boolean }> {
  const { data: existing } = await supabase
    .from("discussion_followers")
    .select("id")
    .eq("user_id", userId)
    .eq("post_id", postId)
    .maybeSingle();

  if (existing) {
    await supabase.from("discussion_followers").delete().eq("id", existing.id);
    return { following: false };
  }

  const { error } = await supabase.from("discussion_followers").insert({
    user_id: userId,
    post_id: postId,
  });

  if (error) {
    console.error("Error toggling discussion follow:", error);
    return { following: false };
  }

  return { following: true };
}

export async function isFollowingDiscussion(
  userId: string,
  postId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("discussion_followers")
    .select("id")
    .eq("user_id", userId)
    .eq("post_id", postId)
    .maybeSingle();

  return !!data;
}

export function subscribeToPostUpdates(
  postId: string,
  callback: (payload: { eventType: string; new: DbPost }) => void,
) {
  return supabase
    .channel(`post:${postId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "posts",
        filter: `id=eq.${postId}`,
      },
      (payload: { eventType: string; new: DbPost }) => {
        callback(payload);
      },
    )
    .subscribe();
}

export function subscribeToComments(
  postId: string,
  callback: (payload: { eventType: string; new: DbComment }) => void,
) {
  return supabase
    .channel(`comments:${postId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "comments",
        filter: `post_id=eq.${postId}`,
      },
      (payload: { eventType: string; new: DbComment }) => {
        callback(payload);
      },
    )
    .subscribe();
}

export function subscribeToReactions(
  postId: string,
  callback: (payload: { eventType: string; new: DbReaction }) => void,
) {
  return supabase
    .channel(`reactions:${postId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "reactions",
        filter: `post_id=eq.${postId}`,
      },
      (payload: { eventType: string; new: DbReaction }) => {
        callback(payload);
      },
    )
    .subscribe();
}

export function getPostShareUrl(postId: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}#/post/${postId}`;
}

export async function sharePost(
  postId: string,
  title?: string,
): Promise<boolean> {
  const shareUrl = getPostShareUrl(postId);
  const shareTitle = title || "Check out this post on Palrene";

  if (navigator.share) {
    try {
      await navigator.share({
        title: shareTitle,
        url: shareUrl,
      });
      return true;
    } catch (err) {
      // User cancelled or share failed
      console.log("Share cancelled or failed:", err);
    }
  }

  // Fallback: copy to clipboard
  try {
    await navigator.clipboard.writeText(shareUrl);
    return true;
  } catch (err) {
    console.error("Failed to copy:", err);
    return false;
  }
}

let cachedViews = new Map<string, Set<string>>();

export async function incrementViewCount(
  postId: string,
  userId?: string,
): Promise<void> {
  // Create a unique view key - either by user ID or session
  const viewKey =
    userId ||
    sessionStorage.getItem("palrene_session_id") ||
    (() => {
      const id = crypto.randomUUID();
      sessionStorage.setItem("palrene_session_id", id);
      return id;
    })();

  // Check if we've already tracked this view
  if (!cachedViews.has(postId)) {
    cachedViews.set(postId, new Set());
  }

  const postViews = cachedViews.get(postId)!;
  if (postViews.has(viewKey)) {
    return; // Already viewed
  }

  // Mark as viewed
  postViews.add(viewKey);

  // Increment in database
  const { error } = await supabase.rpc("increment_post_views", {
    post_id: postId,
  });

  if (error) {
    // Fallback: direct update
    await supabase
      .from("posts")
      .update({ views_count: supabase.rpc("increment") as unknown as number })
      .eq("id", postId);
  }
}

export async function getGroupPosts(groupId: string, limit = 20): Promise<PostWithProfile[]> {
  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      profiles!posts_user_id_fkey (
        id, full_name, username, avatar_url, is_verified
      )
    `)
    .eq("group_id", groupId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((p: any) => ({
    id: p.id,
    userId: p.user_id,
    profile: p.profiles || {},
    content: p.content,
    created_at: p.created_at,
    media_urls: p.media_urls,
    giphy_url: p.giphy_url,
    video_url: p.video_url,
    likes_count: p.likes_count,
    comments_count: p.comments_count,
    reposts_count: p.reposts_count,
    views_count: p.views_count,
    boosted: p.boosted,
    is_sensitive: p.is_sensitive,
    category: p.category,
    group_id: groupId,
  }));
}
