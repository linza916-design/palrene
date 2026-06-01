export interface Profile {
  id: string;
  email: string;
  full_name: string;
  username: string;
  avatar_url: string;
  banner_url?: string;
  bio?: string;
  location?: string;
  dob?: string;
  gender?: string;
  gender_preference?: string;
  race?: string;
  preferred_race?: string;
  age_range_min?: number;
  age_range_max?: number;
  recognition_goals?: string[]; // friendship, mentorship, etc.
  interests?: string[];
  is_verified?: boolean;
  is_admin?: boolean | "" | undefined;
  followers_count?: number;
  following_count?: number;
  views_count?: number;
  is_active?: boolean;
  subscription_tier?: 'Free' | 'Starter' | 'Pro';
  verification_video_url?: string;
  verification_doc_front_url?: string;
  verification_doc_back_url?: string;
}

export interface Post {
  id: string;
  userId: string;
  profile: Partial<Profile>;
  content: string;
  created_at: string;
  media_urls?: string[];
  giphy_url?: string;
  video_url?: string;
  likes_count: number;
  comments_count: number;
  reposts_count: number;
  boosted?: boolean;
  is_sensitive?: boolean;
  quiz?: {
    question: string;
    options: string[];
    votes: number[];
    voted_index?: number;
    correct_option_index?: number;
    explanation?: string;
    lead_link?: string;
  };
  views_count?: number;
  category?: string;
}

export interface Comment {
  id: string;
  post_id: string;
  userId: string;
  profile: Partial<Profile>;
  content: string;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  category: string; // entertainment, relationships, music, science, travel, memes, foods, outdoors
  avatar_url: string;
  banner_url?: string;
  members_count: number;
  posts_count: number;
  created_by: string;
  created_at: string;
  is_private: boolean;
}

export interface Conversation {
  id: string;
  participants: Partial<Profile>[];
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  media_url?: string;
  giphy_url?: string;
  is_ai?: boolean;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'ai_recommendation' | 'message' | 'verification';
  sender?: Partial<Profile>;
  content: string;
  created_at: string;
  read: boolean;
  action_url?: string;
}

export interface Ad {
  id: string;
  title: string;
  description: string;
  link_url: string;
  image_url: string;
  status: 'pending' | 'approved' | 'rejected';
  created_by: string;
  created_at: string;
}

export interface PaymentTransaction {
  id: string;
  userId: string;
  userName: string;
  plan: 'Free' | 'Starter' | 'Pro';
  amount: number;
  status: 'successful' | 'pending' | 'refunded' | 'failed';
  provider: string;
  created_at: string;
  renewal_date?: string;
}

