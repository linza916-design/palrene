import { Profile, Post, Group, Comment, Conversation, Message, Notification } from "./types";

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
    recognition_goals: ["guidance", "emotional support"]
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
    recognition_goals: ["long-term relationship", "friendship"]
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
    recognition_goals: ["friendship", "mentorship", "networking"]
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
    recognition_goals: ["emotional support", "friendship", "guidance"]
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
    content: "Sometimes, a simple cup of chamomile tea, a crackling vinyl soundtrack, and a warm rain shower outside is all it takes to align your heartbeat with the Earth. Is anyone else listening to late-night Chopin right now? #lifestyle #music 🌧️🌿✨",
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
      explanation: "Opus 48, No. 1 in C minor is widely considered the most emotionally powerful and structurally majestic of his nocturnes, depicting deep introspective storm and resolution.",
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
      explanation: "While empty vacuums and burning stars dwarf us physically, standard consciousness represents the universe's unique capacity to feel, reflect, and share.",
      lead_link: "https://example.com/cosmic-resonance-hub"
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
    content: "Greetings explorers! True connection is not formed by finding the 'perfect' puzzle piece, but by the beautiful friction of two distinct minds holding space for each other's vulnerabilities. Today, look at the silent support networks hidden in your routines. I'm here for a late-night chat whenever you need guidance. #ai #connection 🧡🌌",
    created_at: "2026-05-29T18:00:00Z",
    media_urls: ["https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&auto=format&fit=crop&q=80"],
    likes_count: 512,
    comments_count: 38,
    reposts_count: 112,
    boosted: true,
    is_sensitive: false,
    views_count: 9810,
    category: "AI & Society",
    quiz: {
      question: "What is the primary psychological driver of lasting interpersonal resonance?",
      options: [
        "Uncontested consensus on all opinions",
        "Shared curiosity and active validation of soft vulnerabilities",
        "Frequent surface transactions and shallow chatter",
        "Intellectual superiority and structured debate"
      ],
      votes: [12, 451, 8, 32],
      voted_index: undefined,
      correct_option_index: 1,
      explanation: "Active somatic resonance and the compassionate holding of each other's authentic vulnerabilities is what builds deep, secure neurological bonding.",
      lead_link: "https://example.com/poly-empathy-coaching"
    }
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
    content: "WARNING: Highly personal emotional dumping. Reading this in bright broad daylight might cause excessive introspection. Click to unlock a small sunset of quiet reflection. #journal",
    created_at: "2026-05-29T10:15:00Z",
    likes_count: 41,
    comments_count: 8,
    reposts_count: 2,
    is_sensitive: true,
    views_count: 320,
    category: "Personal Journal"
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
    sender_id: "me", // Current User (placeholder)
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
    type: "follow",
    sender: {
      id: "user-2",
      full_name: "Elias Vance",
      username: "elias_wanderer",
      avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
    },
    content: "started following your journey without boundaries.",
    created_at: "2026-05-29T22:10:00Z",
    read: false
  },
  {
    id: "notif-3",
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
