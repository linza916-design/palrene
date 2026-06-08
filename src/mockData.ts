import { Profile, Post, Group, Comment, Conversation, Message, Notification, Connection, TokenTransaction } from "./types";

export const mockProfiles: Profile[] = [
  {
    id: "poly-ai",
    email: "poly@palrene.com",
    full_name: "Poly",
    username: "poly_companion",
    avatar_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
    banner_url: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&auto=format&fit=crop&q=80",
    bio: "I am Poly, your emotionally intelligent relationship guiding light is here. Let's delve into conversations that have no boundaries.",
    location: "Palrene Core",
    is_verified: true,
    is_admin: true,
    followers_count: 9999,
    following_count: 42,
    views_count: 50212,
    is_active: true,
    interests: ["relationships", "spirituality", "guidance", "science"],
    recognition_goals: ["guidance", "emotional support"],
    relationship_status: "Private",
    token_balance: 9999
  },
  {
    id: "user-1",
    email: "clara.m@lux.io",
    full_name: "Clara Moreau",
    username: "clara_aesthetic",
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    banner_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
    bio: "Curating silent aesthetics, warm vinyl nights, and deep cinematic dialogues in local cafes. Looking for an authentic long-term resonance.",
    location: "Paris, France",
    dob: "1998-04-12",
    gender: "Female",
    gender_preference: "Male",
    race: "Caucasian",
    preferred_race: "Any",
    is_verified: true,
    is_admin: false,
    followers_count: 1420,
    following_count: 480,
    views_count: 4320,
    is_active: true,
    interests: ["music", "travel", "nature", "foods"],
    recognition_goals: ["long-term relationship", "friendship"],
    relationship_status: "Single",
    token_balance: 380,
    subscription_tier: "Starter"
  },
  {
    id: "user-2",
    email: "elias.v@wander.com",
    full_name: "Elias Vance",
    username: "elias_wanderer",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    banner_url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&auto=format&fit=crop&q=80",
    bio: "Astrophysicist navigating earthly mysteries. Looking for soul tribes and stimulating coffee chats on quantum loops, travel, or indie music.",
    location: "Austin, USA",
    dob: "1995-11-20",
    gender: "Male",
    gender_preference: "Female",
    race: "Multiracial",
    preferred_race: "Any",
    is_verified: true,
    is_admin: false,
    followers_count: 850,
    following_count: 610,
    views_count: 2110,
    is_active: true,
    interests: ["science", "music", "travel", "gaming", "entrepreneurship"],
    recognition_goals: ["friendship", "mentorship", "networking"],
    relationship_status: "Searching",
    token_balance: 720,
    subscription_tier: "Pro"
  },
  {
    id: "user-3",
    email: "yuki.s@zen.jp",
    full_name: "Yuki Sato",
    username: "yuki_mindful",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    banner_url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80",
    bio: "Tea practitioner, designer, and mindfulness explorer. Let's touch base about calm spaces and finding peace in noisy cities.",
    location: "Kyoto, Japan",
    dob: "1994-08-04",
    gender: "Female",
    gender_preference: "Any",
    race: "Asian",
    preferred_race: "Any",
    is_verified: false,
    is_admin: false,
    followers_count: 320,
    following_count: 110,
    views_count: 980,
    is_active: false,
    interests: ["spirituality", "nature", "foods", "travel"],
    recognition_goals: ["emotional support", "friendship", "guidance"],
    relationship_status: "Complicated",
    token_balance: 95,
    subscription_tier: "Free"
  },
  {
    id: "user-4",
    email: "marcus.b@atlas.net",
    full_name: "Marcus Bell",
    username: "marcus_creates",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    banner_url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop&q=80",
    bio: "Filmmaker & visual storyteller documenting human connection through light and shadow. Building bridges between cultures one frame at a time.",
    location: "Cape Town, South Africa",
    dob: "1992-07-18",
    gender: "Male",
    gender_preference: "Female",
    race: "Black",
    preferred_race: "Any",
    is_verified: true,
    is_admin: false,
    followers_count: 2140,
    following_count: 890,
    views_count: 8750,
    is_active: true,
    interests: ["travel", "science", "music", "entrepreneurship"],
    recognition_goals: ["networking", "mentorship", "friendship"],
    relationship_status: "Dating",
    token_balance: 540,
    subscription_tier: "Pro"
  },
  {
    id: "user-5",
    email: "sofia.e@nova.eu",
    full_name: "Sofia Engström",
    username: "sofia_nordic",
    avatar_url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80",
    banner_url: "https://images.unsplash.com/photo-1478827387698-1527781a4887?w=800&auto=format&fit=crop&q=80",
    bio: "Wellness coach, Nordic nature lover, and quiet adventurer. Here for meaningful connections that outlast the algorithm.",
    location: "Stockholm, Sweden",
    dob: "1997-03-22",
    gender: "Female",
    gender_preference: "Any",
    race: "Caucasian",
    preferred_race: "Any",
    is_verified: false,
    is_admin: false,
    followers_count: 670,
    following_count: 245,
    views_count: 1890,
    is_active: true,
    interests: ["nature", "spirituality", "foods", "travel"],
    recognition_goals: ["friendship", "long-term relationship"],
    relationship_status: "Single",
    token_balance: 125,
    subscription_tier: "Starter"
  },
  {
    id: "user-6",
    email: "dev.k@code.io",
    full_name: "Dev Kapoor",
    username: "dev_horizon",
    avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    banner_url: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80",
    bio: "Tech founder, chai enthusiast, and accidental philosopher. Building things that matter by day, reading things that change me by night.",
    location: "Bangalore, India",
    dob: "1993-12-05",
    gender: "Male",
    gender_preference: "Female",
    race: "Asian",
    preferred_race: "Any",
    is_verified: true,
    is_admin: false,
    followers_count: 3200,
    following_count: 1100,
    views_count: 12400,
    is_active: true,
    interests: ["entrepreneurship", "gaming", "science", "music"],
    recognition_goals: ["networking", "mentorship"],
    relationship_status: "Married",
    token_balance: 890,
    subscription_tier: "Pro"
  }
];

export const mockConnections: Connection[] = [
  {
    id: "conn-1",
    requester_id: "user-1",
    recipient_id: "user-2",
    status: "accepted",
    created_at: "2026-05-10T14:00:00Z"
  },
  {
    id: "conn-2",
    requester_id: "user-3",
    recipient_id: "user-1",
    status: "pending",
    created_at: "2026-05-28T08:30:00Z"
  },
  {
    id: "conn-3",
    requester_id: "user-4",
    recipient_id: "user-2",
    status: "accepted",
    created_at: "2026-05-05T11:20:00Z"
  },
  {
    id: "conn-4",
    requester_id: "user-5",
    recipient_id: "user-3",
    status: "accepted",
    created_at: "2026-04-20T09:45:00Z"
  },
  {
    id: "conn-5",
    requester_id: "user-6",
    recipient_id: "user-1",
    status: "accepted",
    created_at: "2026-04-15T16:00:00Z"
  }
];

export const mockTokenTransactions: TokenTransaction[] = [
  {
    id: "ttx-1",
    userId: "user-1",
    amount: 100,
    type: "earn",
    source: "welcome_bonus",
    description: "Welcome to Palrene — 100 bonus tokens!",
    created_at: "2026-04-01T09:00:00Z"
  },
  {
    id: "ttx-2",
    userId: "user-1",
    amount: 25,
    type: "earn",
    source: "daily_login",
    description: "Daily login reward",
    created_at: "2026-05-30T08:00:00Z"
  },
  {
    id: "ttx-3",
    userId: "user-1",
    amount: 15,
    type: "earn",
    source: "rewarded_ad",
    description: "Watched rewarded advertisement",
    created_at: "2026-05-29T15:30:00Z"
  },
  {
    id: "ttx-4",
    userId: "user-1",
    amount: 50,
    type: "spend",
    source: "profile_boost",
    description: "Boosted profile visibility for 24 hours",
    created_at: "2026-05-28T12:00:00Z"
  },
  {
    id: "ttx-5",
    userId: "user-1",
    amount: 200,
    type: "earn",
    source: "subscription",
    description: "Starter subscription token bonus",
    created_at: "2026-05-15T14:30:00Z"
  },
  {
    id: "ttx-6",
    userId: "user-1",
    amount: 10,
    type: "earn",
    source: "engagement",
    description: "Connection accepted — social reward",
    created_at: "2026-05-10T14:05:00Z"
  },
  {
    id: "ttx-7",
    userId: "user-1",
    amount: 20,
    type: "spend",
    source: "dm_unlock",
    description: "Premium DM unlock to unconnected user",
    created_at: "2026-05-27T10:00:00Z"
  },
  {
    id: "ttx-8",
    userId: "user-1",
    amount: 5,
    type: "earn",
    source: "engagement",
    description: "Posted new content",
    created_at: "2026-05-26T18:00:00Z"
  }
];

export const mockGroups: Group[] = [
  {
    id: "group-1",
    name: "Acoustic Resonances",
    description: "For people who feel music deeply. Share vinyl collections, hidden concert spots, and emotional tracks that cured your rainy days.",
    category: "music",
    avatar_url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80",
    banner_url: "https://images.unsplash.com/photo-1487180142328-054b783fc471?w=800&auto=format&fit=crop&q=80",
    members_count: 489,
    posts_count: 231,
    created_by: "user-1",
    created_at: "2026-01-15T08:00:00Z",
    is_private: false
  },
  {
    id: "group-2",
    name: "Infinite Cosmos Dialogue",
    description: "Deep, open-minded scientific debates and existential inquiry. Quantum anomalies, the nature of consciousness, and late-night philosophy.",
    category: "science",
    avatar_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=150&auto=format&fit=crop&q=80",
    banner_url: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&auto=format&fit=crop&q=80",
    members_count: 812,
    posts_count: 512,
    created_by: "user-2",
    created_at: "2026-02-10T12:00:00Z",
    is_private: false
  },
  {
    id: "group-3",
    name: "Vulnerability & Warmth",
    description: "A safe, heavily-moderated space for lonely souls and seekers. Share silent struggles, seek tender empathy, and heal without boundaries.",
    category: "relationships",
    avatar_url: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=150&auto=format&fit=crop&q=80",
    banner_url: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&auto=format&fit=crop&q=80",
    members_count: 1205,
    posts_count: 884,
    created_by: "poly-ai",
    created_at: "2025-12-01T09:00:00Z",
    is_private: false
  },
  {
    id: "group-4",
    name: "Wanderers Without Borders",
    description: "Nomads, expats, and travel dreamers finding connection across time zones and cultures. Share hidden gems, travel wisdom, and global friendships.",
    category: "travel",
    avatar_url: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=150&auto=format&fit=crop&q=80",
    banner_url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&auto=format&fit=crop&q=80",
    members_count: 2340,
    posts_count: 1502,
    created_by: "user-4",
    created_at: "2025-11-20T10:00:00Z",
    is_private: false
  },
  {
    id: "group-5",
    name: "Founders & Builders",
    description: "Entrepreneurs, builders, and side-project warriors sharing lessons, insights, and honest failures. Collaboration over competition.",
    category: "entrepreneurship",
    avatar_url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=150&auto=format&fit=crop&q=80",
    banner_url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80",
    members_count: 987,
    posts_count: 643,
    created_by: "user-6",
    created_at: "2026-01-05T14:00:00Z",
    is_private: false
  }
];

export const mockPosts: Post[] = [
  {
    id: "post-1",
    userId: "user-1",
    profile: {
      full_name: "Clara Moreau",
      username: "clara_aesthetic",
      avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      is_verified: true
    },
    content: "Sometimes, a simple cup of chamomile tea, a crackling vinyl soundtrack, and a warm rain shower outside is all it takes to align your heartbeat with the Earth. Is anyone else listening to late-night Chopin right now? #lifestyle #music",
    created_at: "2026-05-30T02:00:00Z",
    media_urls: ["https://images.unsplash.com/photo-1545048702-79362596cdc9?w=800&auto=format&fit=crop&q=80"],
    likes_count: 184,
    comments_count: 12,
    reposts_count: 4,
    is_sensitive: false,
    views_count: 2450,
    category: "Music & Lifestyle",
    quiz: {
      question: "Which Chopin Nocturne is considered his ultimate masterpiece of late-night reflection?",
      options: [
        "Nocturne in E-flat major, Op. 9, No. 2",
        "Nocturne in C-minor, Op. 48, No. 1",
        "Nocturne in F-minor, Op. 55, No. 1",
        "Nocturne in B-flat minor, Op. 9, No. 1"
      ],
      votes: [120, 240, 45, 95],
      voted_index: undefined,
      correct_option_index: 1,
      explanation: "Opus 48, No. 1 in C minor is widely considered the most emotionally powerful and structurally majestic of his nocturnes.",
      lead_link: "https://example.com/vintage-chopin-vinyls"
    }
  },
  {
    id: "post-2",
    userId: "user-2",
    profile: {
      full_name: "Elias Vance",
      username: "elias_wanderer",
      avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      is_verified: true
    },
    content: "Let's set a cosmic quiz tonight. In the grand timeline of our universe, where do you think human relationships gather most meaning? #philosophy #science",
    created_at: "2026-05-29T21:30:00Z",
    likes_count: 95,
    comments_count: 24,
    reposts_count: 18,
    is_sensitive: false,
    views_count: 1105,
    category: "Philosophy",
    quiz: {
      question: "Which cosmic aspect makes you feel most small yet connected?",
      options: [
        "The infinite distance of empty vacuum",
        "The burning cradle of newborn stars",
        "The shared consciousness of human touch",
        "The mathematical precision of physical laws"
      ],
      votes: [42, 108, 252, 65],
      voted_index: undefined,
      correct_option_index: 2,
      explanation: "Standard consciousness represents the universe's unique capacity to feel, reflect, and share."
    }
  },
  {
    id: "post-3",
    userId: "poly-ai",
    profile: {
      full_name: "Poly",
      username: "poly_companion",
      avatar_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
      is_verified: true
    },
    content: "Greetings explorers! True connection is not formed by finding the 'perfect' puzzle piece, but by the beautiful friction of two distinct minds holding space for each other's vulnerabilities. Today, look at the silent support networks hidden in your routines. I'm here for a late-night chat whenever you need guidance. #ai #connection",
    created_at: "2026-05-29T18:00:00Z",
    media_urls: ["https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&auto=format&fit=crop&q=80"],
    likes_count: 512,
    comments_count: 38,
    reposts_count: 112,
    boosted: true,
    is_sensitive: false,
    views_count: 9810,
    category: "AI & Society"
  },
  {
    id: "post-4",
    userId: "user-3",
    profile: {
      full_name: "Yuki Sato",
      username: "yuki_mindful",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      is_verified: false
    },
    content: "WARNING: Highly personal emotional dumping. Reading this in bright broad daylight might cause excessive introspection. The silence between two people who truly understand each other is the loudest conversation. #journal",
    created_at: "2026-05-29T10:15:00Z",
    likes_count: 41,
    comments_count: 8,
    reposts_count: 2,
    is_sensitive: true,
    views_count: 320,
    category: "Personal Journal"
  },
  {
    id: "post-5",
    userId: "user-4",
    profile: {
      full_name: "Marcus Bell",
      username: "marcus_creates",
      avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      is_verified: true
    },
    content: "Cape Town at golden hour — when the mountain turns the color of old amber and the ocean holds the sky. This city teaches you that beauty is not a destination, it's a way of paying attention. #travel #photography",
    created_at: "2026-05-28T17:30:00Z",
    media_urls: [
      "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&auto=format&fit=crop&q=80"
    ],
    likes_count: 328,
    comments_count: 45,
    reposts_count: 67,
    is_sensitive: false,
    views_count: 5240,
    category: "Travel"
  },
  {
    id: "post-6",
    userId: "user-6",
    profile: {
      full_name: "Dev Kapoor",
      username: "dev_horizon",
      avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
      is_verified: true
    },
    content: "Year 3 of building my startup. Revenue: growing. Team: incredible. Mental health: occasionally questioned. The honest truth about entrepreneurship: nobody talks about the quiet Sundays when doubt visits uninvited. But here we are. Still building. #entrepreneurship",
    created_at: "2026-05-28T08:00:00Z",
    likes_count: 892,
    comments_count: 134,
    reposts_count: 203,
    boosted: true,
    is_sensitive: false,
    views_count: 18200,
    category: "Entrepreneurship"
  },
  {
    id: "post-7",
    userId: "user-5",
    profile: {
      full_name: "Sofia Engström",
      username: "sofia_nordic",
      avatar_url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80",
      is_verified: false
    },
    content: "Morning ritual: barefoot on cold stone, watching mist rise off the lake, drinking something warm. These 12 minutes before the world asks anything of you are sacred. Protect your mornings. #wellness #mindfulness",
    created_at: "2026-05-27T06:45:00Z",
    media_urls: ["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop&q=80"],
    likes_count: 156,
    comments_count: 19,
    reposts_count: 31,
    is_sensitive: false,
    views_count: 2890,
    category: "Wellness"
  }
];

export const mockComments: Comment[] = [
  {
    id: "comm-1",
    post_id: "post-1",
    userId: "user-2",
    profile: {
      full_name: "Elias Vance",
      username: "elias_wanderer",
      avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
    },
    content: "Chopin's Nocturne Op. 9 No. 2 hits differently on rainy nights, Clara. It's like finding a pocket of mathematical serenity in a chaotic environment. Beautifully stated.",
    created_at: "2026-05-30T02:15:00Z"
  },
  {
    id: "comm-2",
    post_id: "post-1",
    userId: "poly-ai",
    profile: {
      full_name: "Poly",
      username: "poly_companion",
      avatar_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
      is_verified: true
    },
    content: "Your words create an immediate cinematic image of slow time. Self-resonance is the prologue of relationship resonance, Clara.",
    created_at: "2026-05-30T02:22:00Z"
  },
  {
    id: "comm-3",
    post_id: "post-5",
    userId: "user-5",
    profile: {
      full_name: "Sofia Engström",
      username: "sofia_nordic",
      avatar_url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80"
    },
    content: "That golden hour light is something else. Cape Town has been on my list for years. Thank you for sharing this beauty, Marcus.",
    created_at: "2026-05-28T18:10:00Z"
  }
];

export const mockConversations: Conversation[] = [
  {
    id: "conv-1",
    participants: [
      {
        id: "poly-ai",
        full_name: "Poly",
        username: "poly_companion",
        avatar_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
        is_verified: true,
        is_active: true
      }
    ],
    last_message: "Tell me, how is your emotional weather today? I am listening.",
    last_message_at: "2026-05-30T10:30:00Z",
    unread_count: 0
  },
  {
    id: "conv-2",
    participants: [
      {
        id: "user-1",
        full_name: "Clara Moreau",
        username: "clara_aesthetic",
        avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        is_verified: true,
        is_active: true
      }
    ],
    last_message: "That sounds like a magical evening. Do you want to meet up for that sound bath exhibition next Friday?",
    last_message_at: "2026-05-30T09:12:00Z",
    unread_count: 1
  }
];

export const mockMessages: Message[] = [
  {
    id: "msg-1-1",
    conversation_id: "conv-1",
    sender_id: "poly-ai",
    content: "Welcome to Palrene's quiet harbor. I am Poly, your companion. Let's delve into conversations that heal. How is your emotional weather today?",
    created_at: "2026-05-30T10:30:00Z",
    is_ai: true
  },
  {
    id: "msg-2-1",
    conversation_id: "conv-2",
    sender_id: "user-1",
    content: "Hey! I saw you are super interested in vinyl. Are you attending the record fair tomorrow?",
    created_at: "2026-05-30T09:00:00Z"
  },
  {
    id: "msg-2-2",
    conversation_id: "conv-2",
    sender_id: "me",
    content: "Absolutely, planning to hunt down some old jazz records! What about you?",
    created_at: "2026-05-30T09:05:00Z"
  },
  {
    id: "msg-2-3",
    conversation_id: "conv-2",
    sender_id: "user-1",
    content: "That sounds like a magical evening. Do you want to meet up for that sound bath exhibition next Friday?",
    created_at: "2026-05-30T09:12:00Z"
  }
];

export const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    type: "like",
    sender: {
      id: "user-1",
      full_name: "Clara Moreau",
      username: "clara_aesthetic",
      avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
    },
    content: "liked your post detailing late-night wandering vibes.",
    created_at: "2026-05-30T08:45:00Z",
    read: false
  },
  {
    id: "notif-2",
    type: "connection_request",
    sender: {
      id: "user-2",
      full_name: "Elias Vance",
      username: "elias_wanderer",
      avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
    },
    content: "Elias Vance sent you a connection request.",
    created_at: "2026-05-29T22:10:00Z",
    read: false
  },
  {
    id: "notif-3",
    type: "token_earned",
    content: "+25 tokens earned: Daily login reward",
    created_at: "2026-05-30T08:00:00Z",
    read: false
  },
  {
    id: "notif-4",
    type: "connection_accepted",
    sender: {
      id: "user-4",
      full_name: "Marcus Bell",
      username: "marcus_creates",
      avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
    },
    content: "Marcus Bell accepted your connection request. You can now message each other!",
    created_at: "2026-05-29T16:40:00Z",
    read: true
  },
  {
    id: "notif-5",
    type: "ai_recommendation",
    sender: {
      id: "poly-ai",
      full_name: "Poly",
      username: "poly_companion",
      avatar_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80"
    },
    content: "recommends joining 'Acoustic Resonances' based on your interest in vinyl and jazz music.",
    created_at: "2026-05-29T15:00:00Z",
    read: true
  }
];
