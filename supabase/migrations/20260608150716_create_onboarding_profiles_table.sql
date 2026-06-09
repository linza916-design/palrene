
-- Create onboarding_profiles table to track user onboarding state
-- This extends the existing auth.users with Palrene-specific profile data

CREATE TABLE IF NOT EXISTS public.onboarding_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  full_name text,
  bio text,
  avatar_url text,
  banner_url text,
  website text,
  location text,
  profession text,
  company text,
  interests text[] DEFAULT '{}',
  skills text[] DEFAULT '{}',
  social_links jsonb DEFAULT '{}',
  gender text,
  gender_preference text,
  race text,
  preferred_race text,
  dob date,
  age_range_min integer DEFAULT 18,
  age_range_max integer DEFAULT 45,
  recognition_goals text[] DEFAULT '{}',
  relationship_status text DEFAULT 'Private',
  profile_completed boolean DEFAULT false,
  onboarding_step integer DEFAULT 1,
  subscription_tier text DEFAULT 'Free',
  token_balance integer DEFAULT 100,
  is_verified boolean DEFAULT false,
  is_admin boolean DEFAULT false,
  followers_count integer DEFAULT 0,
  following_count integer DEFAULT 0,
  views_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.onboarding_profiles ENABLE ROW LEVEL SECURITY;

-- Select policy: users can view public profiles
CREATE POLICY "select_onboarding_profiles"
  ON public.onboarding_profiles FOR SELECT
  TO authenticated
  USING (true);

-- Insert policy: users can only insert their own profile
CREATE POLICY "insert_own_onboarding_profile"
  ON public.onboarding_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Update policy: users can only update their own profile
CREATE POLICY "update_own_onboarding_profile"
  ON public.onboarding_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Delete policy: users can only delete their own profile
CREATE POLICY "delete_own_onboarding_profile"
  ON public.onboarding_profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.onboarding_profiles (id, full_name, avatar_url, email_provider)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add email_provider column for tracking oauth provider
ALTER TABLE public.onboarding_profiles ADD COLUMN IF NOT EXISTS email_provider text;
ALTER TABLE public.onboarding_profiles ADD COLUMN IF NOT EXISTS email text;

-- Re-create function with email column
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.onboarding_profiles (id, full_name, avatar_url, email, email_provider)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.app_metadata->>'provider', 'email')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_onboarding_profiles_updated_at ON public.onboarding_profiles;
CREATE TRIGGER update_onboarding_profiles_updated_at
  BEFORE UPDATE ON public.onboarding_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Index for fast username lookups
CREATE INDEX IF NOT EXISTS idx_onboarding_profiles_username ON public.onboarding_profiles(username);
CREATE INDEX IF NOT EXISTS idx_onboarding_profiles_completed ON public.onboarding_profiles(profile_completed);
