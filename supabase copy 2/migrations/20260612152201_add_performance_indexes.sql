
-- ============================================================
-- Performance indexes for 10k+ users
-- ============================================================

-- conversations.participants is a uuid[] — array queries do full table scans.
-- GIN index allows O(log n) lookup for ANY() operator
CREATE INDEX IF NOT EXISTS idx_conversations_participants_gin
  ON conversations USING GIN (participants);

-- follows: individual index on following_id for "who follows user X" queries
CREATE INDEX IF NOT EXISTS idx_follows_following_id
  ON follows (following_id);

-- connections: individual index on recipient_id
CREATE INDEX IF NOT EXISTS idx_connections_recipient_id
  ON connections (recipient_id);

-- connections: status filter for active connections
CREATE INDEX IF NOT EXISTS idx_connections_status
  ON connections (status);

-- messages: sender_id for profile message history
CREATE INDEX IF NOT EXISTS idx_messages_sender_id
  ON messages (sender_id);

-- messages: composite (conversation_id, created_at) for paginated DM loads
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
  ON messages (conversation_id, created_at DESC);

-- posts: composite (user_id, created_at) for profile timeline queries
CREATE INDEX IF NOT EXISTS idx_posts_user_created
  ON posts (user_id, created_at DESC);

-- posts: boosted posts for discovery ranking
CREATE INDEX IF NOT EXISTS idx_posts_boosted
  ON posts (boosted) WHERE boosted = true;

-- posts: sensitive content filter
CREATE INDEX IF NOT EXISTS idx_posts_is_sensitive
  ON posts (is_sensitive) WHERE is_sensitive = true;

-- notifications: composite (user_id, read) for unread badge counts
CREATE INDEX IF NOT EXISTS idx_notifications_user_read
  ON notifications (user_id, read) WHERE read = false;

-- profiles: is_active for online user discovery
CREATE INDEX IF NOT EXISTS idx_profiles_is_active
  ON profiles (is_active) WHERE is_active = true;

-- profiles: is_verified for filter queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_verified
  ON profiles (is_verified) WHERE is_verified = true;

-- profiles: subscription_tier for premium user queries
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier
  ON profiles (subscription_tier);

-- profiles: full text search on (full_name, username)
CREATE INDEX IF NOT EXISTS idx_profiles_search
  ON profiles USING GIN (to_tsvector('english', coalesce(full_name, '') || ' ' || coalesce(username, '')));

-- posts: full text search on content
CREATE INDEX IF NOT EXISTS idx_posts_content_search
  ON posts USING GIN (to_tsvector('english', coalesce(content, '')));

-- token_transactions: (user_id, type) for filtered history
CREATE INDEX IF NOT EXISTS idx_token_transactions_user_type
  ON token_transactions (user_id, type);

-- reposts: post_id for repost counts
CREATE INDEX IF NOT EXISTS idx_reposts_post_id
  ON reposts (post_id);

-- reposts: user_id for user's repost history
CREATE INDEX IF NOT EXISTS idx_reposts_user_id
  ON reposts (user_id);

-- likes: (post_id) for post like counts
CREATE INDEX IF NOT EXISTS idx_likes_post_id
  ON likes (post_id) WHERE post_id IS NOT NULL;

-- reactions: user_id for user's reaction history
CREATE INDEX IF NOT EXISTS idx_reactions_user_id
  ON reactions (user_id);

-- comments: created_at for time-ordered comment loading
CREATE INDEX IF NOT EXISTS idx_comments_created_at
  ON comments (created_at DESC);

-- groups: category for filtered group discovery
CREATE INDEX IF NOT EXISTS idx_groups_category
  ON groups (category);
