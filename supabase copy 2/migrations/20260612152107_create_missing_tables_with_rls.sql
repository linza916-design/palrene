
-- ============================================================
-- Create group_members table
-- Required for tracking group membership and roles
-- ============================================================
CREATE TABLE IF NOT EXISTS group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'moderator', 'member')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);

CREATE POLICY "select_group_members" ON group_members
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "insert_own_group_member" ON group_members
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_group_member" ON group_members
  FOR DELETE TO authenticated USING (auth.uid() = user_id OR is_admin());

-- ============================================================
-- Create connection_requests table
-- Required for pending connection request flow
-- ============================================================
CREATE TABLE IF NOT EXISTS connection_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message text DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(sender_id, receiver_id)
);

ALTER TABLE connection_requests ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_connection_requests_sender ON connection_requests(sender_id);
CREATE INDEX idx_connection_requests_receiver ON connection_requests(receiver_id);
CREATE INDEX idx_connection_requests_status ON connection_requests(status);

CREATE POLICY "select_own_connection_requests" ON connection_requests
  FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "insert_own_connection_request" ON connection_requests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "update_received_connection_request" ON connection_requests
  FOR UPDATE TO authenticated
  USING (auth.uid() = receiver_id);

CREATE POLICY "delete_own_connection_request" ON connection_requests
  FOR DELETE TO authenticated
  USING (auth.uid() = sender_id);

-- ============================================================
-- Create reports table
-- Required for abuse prevention and content moderation
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reported_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reported_post_id uuid REFERENCES posts(id) ON DELETE SET NULL,
  reported_comment_id uuid REFERENCES comments(id) ON DELETE SET NULL,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);

CREATE POLICY "insert_own_report" ON reports
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "select_own_reports" ON reports
  FOR SELECT TO authenticated
  USING (auth.uid() = reporter_id OR is_admin());

CREATE POLICY "update_report_admin" ON reports
  FOR UPDATE TO authenticated
  USING (is_admin());

-- ============================================================
-- Create verifications table
-- Required for identity verification flow
-- ============================================================
CREATE TABLE IF NOT EXISTS verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  document_front text,
  document_back text,
  selfie_video text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_verifications_user_id ON verifications(user_id);
CREATE INDEX idx_verifications_status ON verifications(status);

CREATE POLICY "select_own_verification" ON verifications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "insert_own_verification" ON verifications
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_verification" ON verifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR is_admin());

-- ============================================================
-- Create rewarded_ads table
-- Required for the token reward ad system
-- ============================================================
CREATE TABLE IF NOT EXISTS rewarded_ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  advertiser text,
  media_url text,
  reward_tokens integer DEFAULT 10,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE rewarded_ads ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_rewarded_ads_active ON rewarded_ads(active);

CREATE POLICY "select_active_rewarded_ads" ON rewarded_ads
  FOR SELECT TO authenticated
  USING (active = true);

CREATE POLICY "insert_rewarded_ad_admin" ON rewarded_ads
  FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "update_rewarded_ad_admin" ON rewarded_ads
  FOR UPDATE TO authenticated
  USING (is_admin());

-- Seed one default ad so the system works immediately
INSERT INTO rewarded_ads (title, advertiser, reward_tokens, active)
VALUES ('Watch & Earn — Premium Content', 'Palrene', 10, true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- Create watched_ads table
-- Tracks which rewarded ads a user has watched (abuse prevention)
-- ============================================================
CREATE TABLE IF NOT EXISTS watched_ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ad_id uuid REFERENCES rewarded_ads(id) ON DELETE SET NULL,
  reward_given boolean DEFAULT false,
  watched_at timestamptz DEFAULT now()
);

ALTER TABLE watched_ads ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_watched_ads_user_id ON watched_ads(user_id);
CREATE INDEX idx_watched_ads_watched_at ON watched_ads(watched_at DESC);

CREATE POLICY "select_own_watched_ads" ON watched_ads
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "insert_own_watched_ad" ON watched_ads
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
