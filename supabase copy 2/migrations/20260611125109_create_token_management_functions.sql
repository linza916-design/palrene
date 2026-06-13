-- Helper functions for token management

-- Function to add tokens to user
CREATE OR REPLACE FUNCTION add_user_tokens(
  target_user_id UUID,
  token_amount INTEGER,
  token_source TEXT,
  token_description TEXT DEFAULT NULL,
  ref_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance INTEGER;
  new_balance INTEGER;
BEGIN
  -- Get current balance or create if not exists
  SELECT balance INTO current_balance
  FROM user_tokens
  WHERE user_id = target_user_id;
  
  IF current_balance IS NULL THEN
    INSERT INTO user_tokens (user_id, balance, lifetime_earned, current_streak, longest_streak)
    VALUES (target_user_id, 100 + token_amount, 100 + token_amount, 0, 0);
    new_balance := 100 + token_amount;
  ELSE
    UPDATE user_tokens
    SET 
      balance = balance + token_amount,
      lifetime_earned = lifetime_earned + token_amount,
      updated_at = NOW()
    WHERE user_id = target_user_id
    RETURNING balance INTO new_balance;
  END IF;
  
  -- Record transaction
  INSERT INTO token_transactions (user_id, amount, type, source, description, reference_id)
  VALUES (target_user_id, token_amount, 'earn', token_source, token_description, ref_id);
  
  RETURN jsonb_build_object(
    'success', true,
    'new_balance', new_balance
  );
END;
$$;

-- Function to spend tokens
CREATE OR REPLACE FUNCTION spend_user_tokens(
  target_user_id UUID,
  token_amount INTEGER,
  token_source TEXT,
  token_description TEXT DEFAULT NULL,
  ref_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance INTEGER;
  new_balance INTEGER;
BEGIN
  -- Get current balance
  SELECT balance INTO current_balance
  FROM user_tokens
  WHERE user_id = target_user_id;
  
  IF current_balance IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient balance'
    );
  END IF;
  
  IF current_balance < token_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient balance'
    );
  END IF;
  
  -- Deduct tokens
  UPDATE user_tokens
  SET 
    balance = balance - token_amount,
    lifetime_spent = lifetime_spent + token_amount,
    updated_at = NOW()
  WHERE user_id = target_user_id
  RETURNING balance INTO new_balance;
  
  -- Record transaction
  INSERT INTO token_transactions (user_id, amount, type, source, description, reference_id)
  VALUES (target_user_id, token_amount, 'spend', token_source, token_description, ref_id);
  
  RETURN jsonb_build_object(
    'success', true,
    'new_balance', new_balance
  );
END;
$$;

-- Function to update daily streak
CREATE OR REPLACE FUNCTION update_daily_streak(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_streak INTEGER;
  longest_streak INTEGER;
  last_date DATE;
  new_streak INTEGER;
  bonus INTEGER := 0;
BEGIN
  SELECT current_streak, longest_streak, last_streak_date
  INTO current_streak, longest_streak, last_date
  FROM user_tokens
  WHERE user_id = target_user_id;
  
  IF last_date IS NULL OR last_date < CURRENT_DATE - 1 THEN
    new_streak := 1;
  ELSIF last_date = CURRENT_DATE - 1 THEN
    new_streak := current_streak + 1;
    -- Streak bonuses
    IF new_streak % 7 = 0 THEN
      bonus := 50;
    ELSIF new_streak % 30 = 0 THEN
      bonus := 200;
    ELSE
      bonus := 10;
    END IF;
  ELSIF last_date = CURRENT_DATE THEN
    -- Already logged in today
    RETURN jsonb_build_object(
      'success', true,
      'streak', current_streak,
      'bonus', 0
    );
  END IF;
  
  -- Update streak
  UPDATE user_tokens
  SET 
    current_streak = new_streak,
    longest_streak = GREATEST(longest_streak, new_streak),
    last_streak_date = CURRENT_DATE,
    updated_at = NOW()
  WHERE user_id = target_user_id;
  
  -- Add streak bonus if any
  IF bonus > 0 THEN
    PERFORM add_user_tokens(target_user_id, bonus, 'daily_streak', 'Daily streak bonus');
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'streak', new_streak,
    'bonus', bonus
  );
END;
$$;

-- Function to increment post views
CREATE OR REPLACE FUNCTION increment_post_views(post_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE posts 
  SET views_count = views_count + 1,
      updated_at = NOW()
  WHERE id = post_id;
END;
$$;

-- Function to increment profile views
CREATE OR REPLACE FUNCTION increment_profile_views(profile_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET views_count = views_count + 1,
      updated_at = NOW()
  WHERE id = profile_id;
END;
$$;
