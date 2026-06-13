-- Create profiles table (main user profile separate from onboarding_profiles)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT DEFAULT '',
  username TEXT UNIQUE,
  avatar_url TEXT DEFAULT '',
  banner_url TEXT DEFAULT '',
  bio TEXT,
  location TEXT,
  dob DATE,
  gender TEXT,
  gender_preference TEXT,
  race TEXT,
  preferred_race TEXT,
  age_range_min INTEGER DEFAULT 18,
  age_range_max INTEGER DEFAULT 45,
  recognition_goals TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  subscription_tier TEXT DEFAULT 'Free',
  relationship_status TEXT DEFAULT 'Private',
  token_balance INTEGER DEFAULT 100,
  verification_video_url TEXT,
  verification_doc_front_url TEXT,
  verification_doc_back_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_profiles" ON profiles FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_email ON profiles(email);
