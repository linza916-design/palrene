-- Create ads table
CREATE TABLE IF NOT EXISTS ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  link_url TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_ads" ON ads FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "insert_own_ad" ON ads FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "update_ad_status" ON ads FOR UPDATE
  TO authenticated USING (true);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT,
  plan TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'successful', 'failed', 'refunded')),
  provider TEXT DEFAULT 'Flutterwave',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_payments" ON payments FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "insert_own_payment" ON payments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_payments_user ON payments(user_id);
