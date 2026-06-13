import { supabase } from "./supabase";

export interface UserTokens {
  id: string;
  user_id: string;
  balance: number;
  lifetime_earned: number;
  lifetime_spent: number;
  current_streak: number;
  longest_streak: number;
  last_streak_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface TokenTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: "earn" | "spend";
  source: string;
  description: string | null;
  reference_id: string | null;
  created_at: string;
}

export interface DailyAdLimits {
  id: string;
  user_id: string;
  ad_date: string;
  ads_watched: number;
  tokens_earned: number;
}

export type TokenSource =
  | "rewarded_ad"
  | "daily_login"
  | "daily_streak"
  | "post_creation"
  | "helpful_comment"
  | "referral"
  | "engagement_reward"
  | "welcome_bonus"
  | "boost_post"
  | "dm_unlock"
  | "ai_chat"
  | "profile_boost"
  | "premium_reaction"
  | "creator_tip"
  | "profile_audit"
  | "purchase"
  | "admin_grant";

export const REWARD_AMOUNTS: Record<string, number> = {
  rewarded_ad: 10,
  daily_login: 10,
  post_creation: 5,
  helpful_comment: 15,
  referral: 100,
  welcome_bonus: 100,
  boost_post: -20,
  dm_unlock: -5,
  ai_chat: -1,
  profile_boost: -50,
  premium_reaction: -2,
};

export const DAILY_AD_LIMIT = 20;

export async function getUserTokens(
  userId: string,
): Promise<UserTokens | null> {
  const { data, error } = await supabase
    .from("user_tokens")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching user tokens:", error);
    return null;
  }

  return data;
}

export async function getOrCreateUserTokens(
  userId: string,
): Promise<UserTokens> {
  let tokens = await getUserTokens(userId);

  if (!tokens) {
    const { data, error } = await supabase
      .from("user_tokens")
      .insert({
        user_id: userId,
        balance: 100,
        lifetime_earned: 100,
        current_streak: 1,
        longest_streak: 1,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating user tokens:", error);
      throw error;
    }

    tokens = data;
  }

  return tokens as UserTokens;
}

export async function addTokens(
  userId: string,
  amount: number,
  source: TokenSource,
  description?: string,
  referenceId?: string,
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  const { data, error } = await supabase.rpc("add_user_tokens", {
    target_user_id: userId,
    token_amount: amount,
    token_source: source,
    token_description: description || null,
    ref_id: referenceId || null,
  });

  if (error) {
    console.error("Error adding tokens:", error);
    return { success: false, error: error.message };
  }

  return {
    success: data.success,
    newBalance: data.new_balance,
    error: data.error,
  };
}

export async function spendTokens(
  userId: string,
  amount: number,
  source: TokenSource,
  description?: string,
  referenceId?: string,
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  const { data, error } = await supabase.rpc("spend_user_tokens", {
    target_user_id: userId,
    token_amount: amount,
    token_source: source,
    token_description: description || null,
    ref_id: referenceId || null,
  });

  if (error) {
    console.error("Error spending tokens:", error);
    return { success: false, error: error.message };
  }

  return {
    success: data.success,
    newBalance: data.new_balance,
    error: data.error,
  };
}

export async function updateDailyStreak(userId: string): Promise<{
  success: boolean;
  streak?: number;
  bonus?: number;
  error?: string;
}> {
  const { data, error } = await supabase.rpc("update_daily_streak", {
    target_user_id: userId,
  });

  if (error) {
    console.error("Error updating streak:", error);
    return { success: false, error: error.message };
  }

  return {
    success: data.success,
    streak: data.streak,
    bonus: data.bonus,
    error: data.error,
  };
}

export async function getTokenTransactions(
  userId: string,
  limit = 50,
  offset = 0,
): Promise<TokenTransaction[]> {
  const { data, error } = await supabase
    .from("token_transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }

  return data || [];
}

export async function getDailyAdLimits(
  userId: string,
): Promise<DailyAdLimits | null> {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("daily_ad_limits")
    .select("*")
    .eq("user_id", userId)
    .eq("ad_date", today)
    .maybeSingle();

  if (error) {
    console.error("Error fetching daily limits:", error);
    return null;
  }

  return data;
}

export async function canWatchAd(
  userId: string,
): Promise<{ canWatch: boolean; adsWatched: number; remaining: number }> {
  const limits = await getDailyAdLimits(userId);
  const adsWatched = limits?.ads_watched || 0;
  const canWatch = adsWatched < DAILY_AD_LIMIT;

  return {
    canWatch,
    adsWatched,
    remaining: DAILY_AD_LIMIT - adsWatched,
  };
}

export async function recordAdEvent(
  userId: string,
  completed: boolean,
  rewardAmount = REWARD_AMOUNTS.rewarded_ad,
): Promise<{ success: boolean; reward?: number; error?: string }> {
  const verificationToken = crypto.randomUUID();

  const { data: adEvent, error: insertError } = await supabase
    .from("ad_events")
    .insert({
      user_id: userId,
      ad_type: "rewarded",
      ad_provider: "adsense",
      reward_amount: rewardAmount,
      completed,
      verification_token: verificationToken,
    })
    .select()
    .single();

  if (insertError) {
    console.error("Error recording ad event:", insertError);
    return { success: false, error: insertError.message };
  }

  if (!completed) {
    return { success: true };
  }

  // Add tokens for completed ad
  const result = await addTokens(
    userId,
    rewardAmount,
    "rewarded_ad",
    "Watched rewarded ad",
    adEvent.id,
  );

  if (!result.success) {
    return { success: false, error: result.error };
  }

  return { success: true, reward: rewardAmount };
}

export async function rewardPostCreation(
  userId: string,
  postId: string,
): Promise<boolean> {
  const result = await addTokens(
    userId,
    REWARD_AMOUNTS.post_creation,
    "post_creation",
    "Created a new post",
    postId,
  );
  return result.success;
}

export async function rewardComment(
  userId: string,
  commentId: string,
): Promise<boolean> {
  const result = await addTokens(
    userId,
    REWARD_AMOUNTS.helpful_comment,
    "helpful_comment",
    "Helpful comment received",
    commentId,
  );
  return result.success;
}

export async function spendForBoost(
  userId: string,
  postId: string,
): Promise<{ success: boolean; error?: string }> {
  const result = await spendTokens(
    userId,
    Math.abs(REWARD_AMOUNTS.boost_post),
    "boost_post",
    "Boosted post for visibility",
    postId,
  );
  return { success: result.success, error: result.error };
}

type RealtimePayload<T> = {
  new?: T;
  old?: T;
  [key: string]: any;
};

export function subscribeToTokenUpdates(
  userId: string,
  callback: (tokens: UserTokens) => void,
) {
  return supabase
    .channel(`tokens:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "user_tokens",
        filter: `user_id=eq.${userId}`,
      },
      (payload: RealtimePayload<UserTokens>) => {
        callback(payload.new as UserTokens);
      },
    )
    .subscribe();
}
