import { supabase } from "./supabase";

export interface OnboardingProfile {
  id: string;
  username?: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  banner_url?: string;
  website?: string;
  location?: string;
  profession?: string;
  company?: string;
  interests?: string[];
  skills?: string[];
  social_links?: Record<string, string>;
  gender?: string;
  gender_preference?: string;
  race?: string;
  preferred_race?: string;
  dob?: string;
  age_range_min?: number;
  age_range_max?: number;
  recognition_goals?: string[];
  relationship_status?: string;
  profile_completed?: boolean;
  onboarding_step?: number;
  email?: string;
  email_provider?: string;
}

const DB_TIMEOUT = 8000;

function withTimeout<T>(promise: Promise<T>, ms: number = DB_TIMEOUT): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Database request timed out")), ms)
    ),
  ]);
}

export async function getOnboardingProfile(userId: string): Promise<OnboardingProfile | null> {
  try {
    const { data, error } = await withTimeout(
      supabase
        .from("onboarding_profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle()
    );

    if (error) {
      console.error("Error fetching onboarding profile:", error);
      return null;
    }
    return data;
  } catch (err) {
    console.error("Timeout/error fetching onboarding profile:", err);
    return null;
  }
}

export async function ensureOnboardingProfile(userId: string, initialData?: Partial<OnboardingProfile>): Promise<OnboardingProfile | null> {
  // Try to fetch existing profile first
  const existing = await getOnboardingProfile(userId);
  if (existing) return existing;

  // No profile exists — create one via upsert
  const { data: user } = await supabase.auth.getUser();
  const name = user?.user_metadata?.full_name || user?.user_metadata?.name || initialData?.full_name || "";
  const avatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || initialData?.avatar_url || "";
  const email = user?.email || initialData?.email || "";
  const provider = user?.app_metadata?.provider || "email";

  try {
    const { data: profile, error } = await withTimeout(
      supabase
        .from("onboarding_profiles")
        .upsert(
          {
            id: userId,
            full_name: name,
            avatar_url: avatar,
            email,
            email_provider: provider,
            onboarding_step: 1,
            profile_completed: false,
            ...initialData,
          },
          { onConflict: "id" }
        )
        .select()
        .single()
    );

    if (error) {
      console.error("Error creating onboarding profile:", error);
      return null;
    }
    return profile;
  } catch (err) {
    console.error("Timeout/error creating onboarding profile:", err);
    return null;
  }
}

export async function createOnboardingProfile(userId: string, data: Partial<OnboardingProfile>): Promise<OnboardingProfile | null> {
  const { data: profile, error } = await supabase
    .from("onboarding_profiles")
    .insert({ id: userId, ...data })
    .select()
    .single();

  if (error) {
    console.error("Error creating onboarding profile:", error);
    return null;
  }
  return profile;
}

export async function upsertOnboardingProfile(userId: string, data: Partial<OnboardingProfile>): Promise<OnboardingProfile | null> {
  const { data: profile, error } = await supabase
    .from("onboarding_profiles")
    .upsert({ id: userId, ...data }, { onConflict: "id" })
    .select()
    .single();

  if (error) {
    console.error("Error upserting onboarding profile:", error);
    return null;
  }
  return profile;
}

export async function updateOnboardingStep(userId: string, step: number, stepData: Partial<OnboardingProfile>): Promise<boolean> {
  try {
    const { error } = await withTimeout(
      supabase
        .from("onboarding_profiles")
        .update({ onboarding_step: step, ...stepData })
        .eq("id", userId)
    );

    if (error) {
      console.error("Error updating onboarding step:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Timeout/error updating onboarding step:", err);
    return false;
  }
}

export async function completeOnboarding(userId: string, finalData: Partial<OnboardingProfile>): Promise<boolean> {
  try {
    const { error } = await withTimeout(
      supabase
        .from("onboarding_profiles")
        .update({ profile_completed: true, onboarding_step: 8, ...finalData })
        .eq("id", userId)
    );

    if (error) {
      console.error("Error completing onboarding:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Timeout/error completing onboarding:", err);
    return false;
  }
}

export async function checkUsernameAvailable(username: string): Promise<boolean> {
  try {
    const { data } = await withTimeout(
      supabase
        .from("onboarding_profiles")
        .select("id")
        .eq("username", username.toLowerCase())
        .maybeSingle()
    );
    return !data;
  } catch (err) {
    console.error("Timeout checking username:", err);
    // On timeout, assume available to avoid blocking the user
    return true;
  }
}

export function generateUsernameFromName(name: string): string[] {
  const base = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const suggestions = [
    `${base}${Math.floor(Math.random() * 9999)}`,
    `${base}_official`,
    `the_${base}`,
    `${base}world`,
    `${base}${new Date().getFullYear()}`,
  ];
  return suggestions.filter(s => s.length >= 3 && s.length <= 30);
}

export function isOnboardingComplete(profile: OnboardingProfile | null): boolean {
  if (!profile) return false;
  return profile.profile_completed === true;
}

export function getOnboardingStep(profile: OnboardingProfile | null): number {
  if (!profile) return 1;
  if (profile.profile_completed) return 8;
  return profile.onboarding_step ?? 1;
}
