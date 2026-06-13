-- Create groups table
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'General',
  avatar_url TEXT DEFAULT '',
  banner_url TEXT DEFAULT '',
  members_count INTEGER DEFAULT 1,
  posts_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_groups" ON groups FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "insert_own_group" ON groups FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = created_by);

-- Create connections table
CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(requester_id, recipient_id)
);

ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_connections" ON connections FOR SELECT
  TO authenticated USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

CREATE POLICY "insert_own_connection" ON connections FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "update_own_connection" ON connections FOR UPDATE
  TO authenticated USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

-- Create follows table
CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_follows" ON follows FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "insert_own_follow" ON follows FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "delete_own_follow" ON follows FOR DELETE
  TO authenticated USING (auth.uid() = follower_id);

-- Create likes table (separate from reactions for legacy compatibility)
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id),
  CHECK (post_id IS NOT NULL OR comment_id IS NOT NULL)
);

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_likes" ON likes FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "insert_own_like" ON likes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_like" ON likes FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Create reposts table
CREATE TABLE IF NOT EXISTS reposts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

ALTER TABLE reposts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_reposts" ON reposts FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "insert_own_repost" ON reposts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_repost" ON reposts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
