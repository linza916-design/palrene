-- User tokens table
CREATE TABLE IF NOT EXISTS public.user_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  balance integer DEFAULT 100,
  lifetime_earned integer DEFAULT 100,
  lifetime_spent integer DEFAULT 0,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_streak_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Token transactions table
CREATE TABLE IF NOT EXISTS public.token_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  type text NOT NULL CHECK (type IN ('earn', 'spend')),
  source text NOT NULL CHECK (source IN (
    'rewarded_ad', 'daily_login', 'daily_streak', 'post_creation', 
    'helpful_comment', 'referral', 'engagement_reward', 'welcome_bonus',
    'boost_post', 'dm_unlock', 'ai_chat', 'profile_boost', 
    'premium_reaction', 'creator_tip', 'purchase', 'admin_grant'
  )),
  description text,
  reference_id uuid,
  created_at timestamptz DEFAULT now()
);

-- Ad events table for tracking rewarded ads
CREATE TABLE IF NOT EXISTS public.ad_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ad_type text NOT NULL DEFAULT 'rewarded',
  ad_provider text DEFAULT 'adsense',
  reward_amount integer DEFAULT 10,
  completed boolean DEFAULT false,
  verification_token text,
  ip_hash text,
  created_at timestamptz DEFAULT now()
);

-- Daily ad limits tracking
CREATE TABLE IF NOT EXISTS public.daily_ad_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ad_date date NOT NULL DEFAULT CURRENT_DATE,
  ads_watched integer DEFAULT 0,
  tokens_earned integer DEFAULT 0,
  CONSTRAINT unique_user_daily_ad UNIQUE (user_id, ad_date)
);

-- Referrals table
CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_claimed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_referral UNIQUE (referrer_id, referred_id)
);

-- Achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type text NOT NULL,
  unlocked_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_achievement UNIQUE (user_id, achievement_type)
);

-- Enable RLS
ALTER TABLE public.user_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_ad_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- User tokens policies
CREATE POLICY "select_own_tokens" ON public.user_tokens FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "insert_own_tokens" ON public.user_tokens FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_tokens" ON public.user_tokens FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Token transactions policies
CREATE POLICY "select_own_transactions" ON public.token_transactions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "insert_own_transactions" ON public.token_transactions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Ad events policies
CREATE POLICY "select_own_ad_events" ON public.ad_events FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "insert_own_ad_events" ON public.ad_events FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_ad_events" ON public.ad_events FOR UPDATE
  TO authenticated USING (auth.uid() = user_id);

-- Daily ad limits policies
CREATE POLICY "select_own_daily_limits" ON public.daily_ad_limits FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "insert_own_daily_limits" ON public.daily_ad_limits FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_daily_limits" ON public.daily_ad_limits FOR UPDATE
  TO authenticated USING (auth.uid() = user_id);

-- Referrals policies
CREATE POLICY "select_own_referrals" ON public.referrals FOR SELECT
  TO authenticated USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "insert_own_referrals" ON public.referrals FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = referrer_id);

-- Achievements policies
CREATE POLICY "select_own_achievements" ON public.achievements FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "insert_own_achievements" ON public.achievements FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_tokens_user_id ON public.user_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_user_id ON public.token_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_created_at ON public.token_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ad_events_user_id ON public.ad_events(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_events_created_at ON public.ad_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_ad_limits_user_date ON public.daily_ad_limits(user_id, ad_date);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON public.achievements(user_id);

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_user_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_tokens_timestamp
  BEFORE UPDATE ON public.user_tokens
  FOR EACH ROW EXECUTE FUNCTION update_user_tokens_updated_at();

-- Function to get or create user tokens
CREATE OR REPLACE FUNCTION get_or_create_user_tokens(target_user_id uuid)
RETURNS public.user_tokens AS $$
DECLARE
  tokens_record public.user_tokens;
BEGIN
  SELECT * INTO tokens_record FROM public.user_tokens WHERE user_id = target_user_id;
  
  IF NOT FOUND THEN
    INSERT INTO public.user_tokens (user_id, balance, lifetime_earned, current_streak, longest_streak)
    VALUES (target_user_id, 100, 100, 1, 1)
    RETURNING * INTO tokens_record;
  END IF;
  
  RETURN tokens_record;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Function to add tokens with validation
CREATE OR REPLACE FUNCTION add_user_tokens(
  target_user_id uuid,
  token_amount integer,
  token_source text,
  token_description text DEFAULT NULL,
  ref_id uuid DEFAULT NULL
)
RETURNS json AS $$
DECLARE
  new_balance integer;
  tokens_record public.user_tokens;
  daily_record public.daily_ad_limits;
  today_date date := CURRENT_DATE;
BEGIN
  -- Check daily limits for rewarded ads
  IF token_source = 'rewarded_ad' THEN
    SELECT * INTO daily_record FROM public.daily_ad_limits 
    WHERE user_id = target_user_id AND ad_date = today_date;
    
    IF daily_record IS NOT NULL AND daily_record.ads_watched >= 20 THEN
      RETURN json_build_object('success', false, 'error', 'Daily ad limit reached');
    END IF;
  END IF;
  
  -- Get or create tokens record
  tokens_record := get_or_create_user_tokens(target_user_id);
  
  -- Add tokens
  UPDATE public.user_tokens 
  SET 
    balance = balance + token_amount,
    lifetime_earned = lifetime_earned + token_amount,
    updated_at = now()
  WHERE user_id = target_user_id
  RETURNING balance INTO new_balance;
  
  -- Create transaction record
  INSERT INTO public.token_transactions (user_id, amount, type, source, description, reference_id)
  VALUES (target_user_id, token_amount, 'earn', token_source, token_description, ref_id);
  
  -- Update daily ad limits
  IF token_source = 'rewarded_ad' THEN
    INSERT INTO public.daily_ad_limits (user_id, ad_date, ads_watched, tokens_earned)
    VALUES (target_user_id, today_date, 1, token_amount)
    ON CONFLICT (user_id, ad_date) DO UPDATE SET
      ads_watched = daily_ad_limits.ads_watched + 1,
      tokens_earned = daily_ad_limits.tokens_earned + token_amount;
  END IF;
  
  RETURN json_build_object('success', true, 'new_balance', new_balance, 'amount_added', token_amount);
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Function to spend tokens
CREATE OR REPLACE FUNCTION spend_user_tokens(
  target_user_id uuid,
  token_amount integer,
  token_source text,
  token_description text DEFAULT NULL,
  ref_id uuid DEFAULT NULL
)
RETURNS json AS $$
DECLARE
  current_balance integer;
BEGIN
  SELECT balance INTO current_balance FROM public.user_tokens WHERE user_id = target_user_id;
  
  IF current_balance IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User tokens not found');
  END IF;
  
  IF current_balance < token_amount THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient balance', 'current_balance', current_balance);
  END IF;
  
  -- Deduct tokens
  UPDATE public.user_tokens 
  SET 
    balance = balance - token_amount,
    lifetime_spent = lifetime_spent + token_amount,
    updated_at = now()
  WHERE user_id = target_user_id;
  
  -- Create transaction record
  INSERT INTO public.token_transactions (user_id, amount, type, source, description, reference_id)
  VALUES (target_user_id, -token_amount, 'spend', token_source, token_description, ref_id);
  
  RETURN json_build_object('success', true, 'new_balance', current_balance - token_amount);
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Function to update daily streak
CREATE OR REPLACE FUNCTION update_daily_streak(target_user_id uuid)
RETURNS json AS $$
DECLARE
  tokens_record public.user_tokens;
  today_date date := CURRENT_DATE;
  streak_bonus integer := 0;
BEGIN
  SELECT * INTO tokens_record FROM public.user_tokens WHERE user_id = target_user_id;
  
  IF tokens_record IS NULL THEN
    tokens_record := get_or_create_user_tokens(target_user_id);
  END IF;
  
  -- Check if already logged in today
  IF tokens_record.last_streak_date = today_date THEN
    RETURN json_build_object('success', true, 'streak', tokens_record.current_streak, 'bonus', 0);
  END IF;
  
  -- Check if streak continues (yesterday or first day)
  IF tokens_record.last_streak_date = today_date - 1 OR tokens_record.last_streak_date IS NULL THEN
    -- Streak continues
    UPDATE public.user_tokens
    SET 
      current_streak = current_streak + 1,
      longest_streak = GREATEST(longest_streak, current_streak + 1),
      last_streak_date = today_date,
      updated_at = now()
    WHERE user_id = target_user_id;
    
    -- Bonus increases with streak (cap at 50)
    streak_bonus := LEAST((tokens_record.current_streak + 1) * 2, 50);
  ELSE
    -- Streak broken, reset
    streak_bonus := 10; -- Base daily login bonus
    UPDATE public.user_tokens
    SET 
      current_streak = 1,
      last_streak_date = today_date,
      updated_at = now()
    WHERE user_id = target_user_id;
  END IF;
  
  -- Add streak bonus tokens
  IF streak_bonus > 0 THEN
    PERFORM add_user_tokens(target_user_id, streak_bonus, 'daily_streak', 
      'Daily streak bonus - Day ' || (tokens_record.current_streak + 1));
  END IF;
  
  SELECT * INTO tokens_record FROM public.user_tokens WHERE user_id = target_user_id;
  
  RETURN json_build_object('success', true, 'streak', tokens_record.current_streak, 'bonus', streak_bonus);
END;
$$ language 'plpgsql' SECURITY DEFINER;