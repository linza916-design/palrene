
-- Create connections table
CREATE TABLE IF NOT EXISTS connections (
  id TEXT PRIMARY KEY,
  requester_id TEXT NOT NULL,
  recipient_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_connections" ON connections FOR SELECT
  TO authenticated USING (auth.uid()::text = requester_id OR auth.uid()::text = recipient_id);

CREATE POLICY "insert_connections" ON connections FOR INSERT
  TO authenticated WITH CHECK (auth.uid()::text = requester_id);

CREATE POLICY "update_connections" ON connections FOR UPDATE
  TO authenticated USING (auth.uid()::text = requester_id OR auth.uid()::text = recipient_id)
  WITH CHECK (auth.uid()::text = requester_id OR auth.uid()::text = recipient_id);

CREATE POLICY "delete_connections" ON connections FOR DELETE
  TO authenticated USING (auth.uid()::text = requester_id OR auth.uid()::text = recipient_id);

-- Create token_transactions table
CREATE TABLE IF NOT EXISTS token_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earn', 'spend')),
  source TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_token_transactions" ON token_transactions FOR SELECT
  TO authenticated USING (auth.uid()::text = user_id);

CREATE POLICY "insert_own_token_transactions" ON token_transactions FOR INSERT
  TO authenticated WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "update_own_token_transactions" ON token_transactions FOR UPDATE
  TO authenticated USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "delete_own_token_transactions" ON token_transactions FOR DELETE
  TO authenticated USING (auth.uid()::text = user_id);
