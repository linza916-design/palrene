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

export async function getOnboardingProfile(userId: string): Promise<OnboardingProfile | null> {
  const { data, error } = await supabase
    .from("onboarding_profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching onboarding profile:", error);
    return null;
  }
  return data;
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
  const { error } = await supabase
    .from("onboarding_profiles")
    .update({ onboarding_step: step, ...stepData })
    .eq("id", userId);

  if (error) {
    console.error("Error updating onboarding step:", error);
    return false;
  }
  return true;
}

export async function completeOnboarding(userId: string, finalData: Partial<OnboardingProfile>): Promise<boolean> {
  const { error } = await supabase
    .from("onboarding_profiles")
    .update({ profile_completed: true, onboarding_step: 8, ...finalData })
    .eq("id", userId);

  if (error) {
    console.error("Error completing onboarding:", error);
    return false;
  }
  return true;
}

export async function checkUsernameAvailable(username: string): Promise<boolean> {
  const { data } = await supabase
    .from("onboarding_profiles")
    .select("id")
    .eq("username", username.toLowerCase())
    .maybeSingle();

  return !data;
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
