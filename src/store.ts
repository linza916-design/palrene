import { create } from "zustand";
import {
  Profile,
  Post,
  Group,
  Comment,
  Conversation,
  Message,
  Notification,
  Ad,
  PaymentTransaction,
  Connection,
  TokenTransaction,
  RelationshipStatus,
} from "./types";
import { supabase } from "./lib/supabase";

interface PalreneState {
  currentUser: Profile | null;
  profiles: Profile[];
  posts: Post[];
  groups: Group[];
  conversations: Conversation[];
  messages: Message[];
  notifications: Notification[];
  ads: Ad[];
  payments: PaymentTransaction[];
  connections: Connection[];
  tokenTransactions: TokenTransaction[];
  theme: "dark" | "light";
  currentView: string;
  activeConversationId: string | null;
  selectedPostId: string | null;
  searchQuery: string;
  searchFilter: string;
  registrationStep: number;
  registrationData: Partial<Profile>;
  lastDailyReward: string | null;

  // Actions
  setTheme: (theme: "dark" | "light") => void;
  setView: (view: string) => void;
  selectPostId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSearchFilter: (filter: string) => void;
  setCurrentUser: (user: Profile | null) => void;

  // Auth & Onboarding Flow
  login: (email: string, password?: string) => Promise<boolean>;
  signup: (email: string, password?: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  startRegistration: () => void;
  nextRegistrationStep: (data: Partial<Profile>) => void;
  prevRegistrationStep: () => void;
  finishRegistration: () => void;
  logout: () => void;

  // Post Actions
  createPost: (
    content: string,
    mediaUrls?: string[],
    giphyUrl?: string,
    videoUrl?: string,
    isSensitive?: boolean,
    quiz?: { question: string; options: string[] },
  ) => void;
  likePost: (postId: string) => void;
  repostPost: (postId: string) => void;
  boostPost: (postId: string) => void;
  voteInQuiz: (postId: string, optionIndex: number) => void;
  addComment: (postId: string, content: string) => void;

  // Profile Actions
  toggleFollow: (profileId: string) => void;
  viewProfileCount: (profileId: string) => void;
  updateProfileSettings: (data: Partial<Profile>) => void;
  updateRelationshipStatus: (status: RelationshipStatus) => void;

  // Connection Actions
  sendConnectionRequest: (recipientId: string) => void;
  acceptConnection: (connectionId: string) => void;
  declineConnection: (connectionId: string) => void;
  blockUser: (userId: string) => void;
  getConnectionStatus: (
    profileId: string,
  ) => import("./types").ConnectionStatus;

  // Token Actions
  earnTokens: (
    amount: number,
    source: TokenTransaction["source"],
    description: string,
  ) => Promise<void>;
  spendTokens: (
    amount: number,
    source: TokenTransaction["source"],
    description: string,
  ) => Promise<boolean>;
  claimDailyReward: () => Promise<boolean>;
  watchRewardedAd: () => void;

  // Chat Actions
  startConversation: (profileId: string) => Promise<string>;
  sendMessage: (
    conversationId: string,
    content: string,
    mediaUrl?: string,
    GiphyUrl?: string,
  ) => Promise<void>;
  setActiveConversation: (id: string | null) => void;

  // Group Actions
  joinGroup: (groupId: string) => void;
  createGroup: (
    name: string,
    description: string,
    category: string,
    avatarUrl: string,
    isPrivate: boolean,
  ) => void;

  // Admin & Verification Actions
  submitVerification: (
    videoUrl: string,
    docFront: string,
    docBack: string,
  ) => void;
  submitAd: (
    title: string,
    description: string,
    linkUrl: string,
    imageUrl: string,
  ) => void;
  approveAd: (adId: string) => void;
  rejectAd: (adId: string) => void;
  approveVerification: (profileId: string) => void;
  rejectVerification: (profileId: string) => void;
  moderatePost: (postId: string, action: "allow" | "delete") => void;
  banUser: (profileId: string) => void;
  makeAdmin: (profileId: string) => void;
  setSubscriptionTier: (tier: "Free" | "Starter" | "Pro") => void;
  addPaymentTransaction: (tx: PaymentTransaction) => void;
  refundPaymentTransaction: (txId: string) => void;
  disableSubscription: (userId: string) => void;

  triggerEmailAlert: (subject: string, body: string) => void;
  deleteNotification: (id: string) => void;
  initializeDynamicData: () => Promise<void>;
}

const getStoredData = (key: string, fallback: any) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export const useStore = create<PalreneState>((set, get) => ({
  currentUser: null,
  profiles: [],
  posts: [],
  groups: [],
  conversations: [],
  messages: [],
  notifications: [],
  ads: [],
  payments: [],
  connections: [],
  tokenTransactions: [],
  lastDailyReward: null,
  theme: getStoredData("palrene_theme", "dark"),
  currentView: "home",
  activeConversationId: null,
  selectedPostId: null,
  searchQuery: "",
  searchFilter: "all",
  registrationStep: 0,
  registrationData: {},

  setTheme: (theme) => {
    set({ theme });
    localStorage.setItem("palrene_theme", JSON.stringify(theme));
    // Apply theme to document
    const root = document.documentElement;
    const body = document.body;
    if (theme === "dark") {
      root.classList.add("dark");
      body.classList.add("dark");
    } else {
      root.classList.remove("dark");
      body.classList.remove("dark");
    }
  },

  setView: (currentView) => set({ currentView }),

  selectPostId: (id) => {
    set({ selectedPostId: id });
    if (id) {
      supabase.rpc("increment_post_views", { post_id: id }).catch(() => {});
      const updatedPosts = get().posts.map((post) => {
        if (post.id === id)
          return { ...post, views_count: (post.views_count ?? 0) + 1 };
        return post;
      });
      set({ posts: updatedPosts, currentView: "post-detail" });
      window.history.pushState(null, "", `#/post/${id}`);
    } else {
      set({ currentView: "home" });
      window.history.pushState(null, "", `#`);
    }
  },

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSearchFilter: (searchFilter) => set({ searchFilter }),
  setCurrentUser: (currentUser) => set({ currentUser }),

  getConnectionStatus: (profileId) => {
    const user = get().currentUser;
    if (!user) return "none";
    const connection = get().connections.find(
      (c) =>
        (c.requester_id === user.id && c.recipient_id === profileId) ||
        (c.requester_id === profileId && c.recipient_id === user.id),
    );
    if (!connection) return "none";
    if (connection.status === "accepted") return "connected";
    if (connection.status === "blocked") return "blocked";
    if (connection.status === "declined") return "declined";
    if (connection.status === "pending") {
      return connection.requester_id === user.id
        ? "pending_sent"
        : "pending_received";
    }
    return "none";
  },

  sendConnectionRequest: async (recipientId) => {
    const user = get().currentUser;
    if (!user || user.id === recipientId) return;
    const existing = get().connections.find(
      (c) =>
        (c.requester_id === user.id && c.recipient_id === recipientId) ||
        (c.requester_id === recipientId && c.recipient_id === user.id),
    );
    if (existing) return;

    const newConn: Connection = {
      id: crypto.randomUUID(),
      requester_id: user.id,
      recipient_id: recipientId,
      status: "pending",
      created_at: new Date().toISOString(),
    };

    try {
      await supabase.from("connections").insert([newConn]);
      const updatedConnections = [...get().connections, newConn];
      set({ connections: updatedConnections });
    } catch (e) {
      console.error("Connection request error:", e);
    }
  },

  acceptConnection: async (connectionId) => {
    const user = get().currentUser;
    if (!user) return;

    try {
      await supabase
        .from("connections")
        .update({ status: "accepted" })
        .eq("id", connectionId);
      const updatedConnections = get().connections.map((c) =>
        c.id === connectionId ? { ...c, status: "accepted" as const } : c,
      );
      set({ connections: updatedConnections });
      get().earnTokens(10, "engagement", "Connection accepted — social reward");
    } catch (e) {
      console.error("Accept connection error:", e);
    }
  },

  declineConnection: async (connectionId) => {
    try {
      await supabase
        .from("connections")
        .update({ status: "declined" })
        .eq("id", connectionId);
      const updatedConnections = get().connections.map((c) =>
        c.id === connectionId ? { ...c, status: "declined" as const } : c,
      );
      set({ connections: updatedConnections });
    } catch (e) {
      console.error("Decline connection error:", e);
    }
  },

  blockUser: async (userId) => {
    const user = get().currentUser;
    if (!user) return;

    const existing = get().connections.find(
      (c) =>
        (c.requester_id === user.id && c.recipient_id === userId) ||
        (c.requester_id === userId && c.recipient_id === user.id),
    );

    if (existing) {
      try {
        await supabase
          .from("connections")
          .update({ status: "blocked" })
          .eq("id", existing.id);
        const updatedConnections = get().connections.map((c) =>
          c.id === existing.id ? { ...c, status: "blocked" as const } : c,
        );
        set({ connections: updatedConnections });
      } catch (e) {
        console.error("Block user error:", e);
      }
    } else {
      const newConn: Connection = {
        id: crypto.randomUUID(),
        requester_id: user.id,
        recipient_id: userId,
        status: "blocked",
        created_at: new Date().toISOString(),
      };
      try {
        await supabase.from("connections").insert([newConn]);
        const updatedConnections = [...get().connections, newConn];
        set({ connections: updatedConnections });
      } catch (e) {
        console.error("Block user error:", e);
      }
    }
  },

  earnTokens: async (amount, source, description) => {
    const user = get().currentUser;
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc("add_user_tokens", {
        target_user_id: user.id,
        token_amount: amount,
        token_source: source,
        token_description: description,
      });

      if (error) {
        console.error("Error earning tokens:", error);
        return;
      }

      if (data?.success) {
        const updatedUser = { ...user, token_balance: data.new_balance };
        set({ currentUser: updatedUser });
      }
    } catch (err) {
      console.error("Token operation failed:", err);
    }
  },

  spendTokens: async (amount, source, description) => {
    const user = get().currentUser;
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc("spend_user_tokens", {
        target_user_id: user.id,
        token_amount: amount,
        token_source: source,
        token_description: description,
      });

      if (error) {
        console.error("Error spending tokens:", error);
        return false;
      }

      if (data?.success) {
        const updatedUser = { ...user, token_balance: data.new_balance };
        set({ currentUser: updatedUser });
        return true;
      }
      return false;
    } catch (err) {
      console.error("Token spend failed:", err);
      return false;
    }
  },

  claimDailyReward: async () => {
    const user = get().currentUser;
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc("update_daily_streak", {
        target_user_id: user.id,
      });

      if (error || !data?.success) return false;

      get().earnTokens(10, "daily_login", "Daily login reward");
      return true;
    } catch (err) {
      console.error("Daily reward failed:", err);
      return false;
    }
  },

  watchRewardedAd: () => {
    get().earnTokens(15, "rewarded_ad", "Watched rewarded advertisement");
  },

  updateRelationshipStatus: async (status) => {
    const user = get().currentUser;
    if (!user) return;

    try {
      await supabase
        .from("profiles")
        .update({ relationship_status: status })
        .eq("id", user.id);
      const updatedUser = { ...user, relationship_status: status };
      set({ currentUser: updatedUser });
    } catch (e) {
      console.error("Update relationship status error:", e);
    }
  },

  initializeDynamicData: async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const sessionUser = sessionData?.session?.user;

      if (!sessionUser) {
        console.log("Palrene: No active session, skipping data fetch.");
        return;
      }

      const { data: dbProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", sessionUser.id)
        .maybeSingle();

      let activeUser: Profile | null = null;
      if (dbProfile) {
        activeUser = {
          id: dbProfile.id,
          email: dbProfile.email || sessionUser.email,
          full_name: dbProfile.full_name || "",
          username: dbProfile.username || "",
          avatar_url: dbProfile.avatar_url || "",
          banner_url: dbProfile.banner_url,
          bio: dbProfile.bio,
          location: dbProfile.location,
          dob: dbProfile.dob,
          gender: dbProfile.gender,
          gender_preference: dbProfile.gender_preference,
          race: dbProfile.race,
          preferred_race: dbProfile.preferred_race,
          age_range_min: dbProfile.age_range_min,
          age_range_max: dbProfile.age_range_max,
          recognition_goals: dbProfile.recognition_goals || [],
          interests: dbProfile.interests || [],
          is_verified: dbProfile.is_verified,
          is_admin: dbProfile.is_admin,
          followers_count: dbProfile.followers_count || 0,
          following_count: dbProfile.following_count || 0,
          views_count: dbProfile.views_count || 0,
          is_active: dbProfile.is_active,
          subscription_tier: dbProfile.subscription_tier || "Free",
          relationship_status: dbProfile.relationship_status || "Private",
          token_balance: dbProfile.token_balance || 100,
        };
      }

      const { data: dbPosts } = await supabase
        .from("posts")
        .select(
          "*, profiles!posts_user_id_fkey(id, full_name, username, avatar_url, is_verified)",
        )
        .order("created_at", { ascending: false })
        .limit(50);

      const postsData: Post[] = (dbPosts || []).map((post: any) => ({
        id: post.id,
        userId: post.user_id,
        profile: post.profiles || {
          id: post.user_id,
          full_name: "User",
          username: "user",
          avatar_url: "",
          is_verified: false,
        },
        content: post.content,
        giphy_url: post.giphy_url,
        video_url: post.video_url,
        media_urls: post.media_urls || [],
        likes_count: post.likes_count || 0,
        comments_count: post.comments_count || 0,
        reposts_count: post.reposts_count || 0,
        views_count: post.views_count || 0,
        boosted: post.boosted,
        is_sensitive: post.is_sensitive,
        quiz: post.quiz,
        category: post.category || "General",
        created_at: post.created_at,
      }));

      const { data: dbGroups } = await supabase.from("groups").select("*");
      const groupsData: Group[] = (dbGroups || []).map((g: any) => ({
        id: g.id,
        name: g.name,
        description: g.description,
        category: g.category,
        avatar_url: g.avatar_url,
        banner_url: g.banner_url,
        members_count: g.members_count || 1,
        posts_count: g.posts_count || 0,
        created_by: g.created_by,
        created_at: g.created_at,
        is_private: g.is_private || false,
      }));

      const { data: dbConversations } = await supabase
        .from("conversations")
        .select("*")
        .contains("participants", [sessionUser.id])
        .order("last_message_at", { ascending: false });

      const allParticipantIds = (dbConversations || []).flatMap(
        (c: any) => c.participants || [],
      );
      const uniqueParticipantIds = [...new Set(allParticipantIds)].filter(
        (id) => id !== sessionUser.id,
      );

      const { data: participantProfiles } =
        uniqueParticipantIds.length > 0
          ? await supabase
              .from("profiles")
              .select(
                "id, full_name, username, avatar_url, is_verified, is_active",
              )
              .in("id", uniqueParticipantIds)
          : { data: [] };

      const conversationsData: Conversation[] = (dbConversations || []).map(
        (c: any) => ({
          id: c.id,
          participants: (c.participants || [])
            .filter((pId: string) => pId !== sessionUser.id)
            .map((pId: string) => {
              const p = participantProfiles?.find(
                (prof: any) => prof.id === pId,
              );
              return {
                id: p?.id || pId,
                full_name: p?.full_name || "User",
                username: p?.username || "user",
                avatar_url: p?.avatar_url || "",
                is_active: p?.is_active,
                is_verified: p?.is_verified,
              };
            }),
          last_message: c.last_message,
          last_message_at: c.last_message_at,
          unread_count: c.unread_count || 0,
        }),
      );

      const conversationIds = (dbConversations || []).map((c: any) => c.id);
      const { data: dbMessages } =
        conversationIds.length > 0
          ? await supabase
              .from("messages")
              .select("*")
              .in("conversation_id", conversationIds)
              .order("created_at", { ascending: true })
          : { data: [] };

      const messagesData: Message[] = (dbMessages || []).map((m: any) => ({
        id: m.id,
        conversation_id: m.conversation_id,
        sender_id: m.sender_id,
        content: m.content,
        media_url: m.media_url,
        giphy_url: m.giphy_url,
        is_ai: m.is_ai || false,
        created_at: m.created_at,
      }));

      const { data: dbNotifications } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", sessionUser.id)
        .order("created_at", { ascending: false })
        .limit(50);

      const senderIds = (dbNotifications || [])
        .filter((n: any) => n.sender_id)
        .map((n: any) => n.sender_id);
      const uniqueSenderIds = [...new Set(senderIds)];
      const { data: senderProfiles } =
        uniqueSenderIds.length > 0
          ? await supabase
              .from("profiles")
              .select("id, full_name, username, avatar_url")
              .in("id", uniqueSenderIds)
          : { data: [] };

      const notificationsData: Notification[] = (dbNotifications || []).map(
        (n: any) => ({
          id: n.id,
          type: n.type as any,
          sender: n.sender_id
            ? {
                id: n.sender_id,
                full_name:
                  senderProfiles?.find((p: any) => p.id === n.sender_id)
                    ?.full_name || "Someone",
                username:
                  senderProfiles?.find((p: any) => p.id === n.sender_id)
                    ?.username || "",
                avatar_url:
                  senderProfiles?.find((p: any) => p.id === n.sender_id)
                    ?.avatar_url || "",
              }
            : undefined,
          content: n.content,
          read: n.read || false,
          created_at: n.created_at,
          action_url: n.action_url,
        }),
      );

      const { data: dbAds } = await supabase
        .from("ads")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      const adsData: Ad[] = (dbAds || []).map((ad: any) => ({
        id: ad.id,
        title: ad.title,
        description: ad.description,
        link_url: ad.link_url,
        image_url: ad.image_url,
        status: ad.status,
        created_by: ad.created_by,
        created_at: ad.created_at,
      }));

      const { data: dbPayments } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", sessionUser.id)
        .order("created_at", { ascending: false });
      const paymentsData: PaymentTransaction[] = (dbPayments || []).map(
        (tx: any) => ({
          id: tx.id,
          userId: tx.user_id,
          userName: tx.user_name,
          plan: tx.plan,
          amount: Number(tx.amount || 0),
          status: tx.status,
          provider: tx.provider,
          created_at: tx.created_at,
        }),
      );

      const { data: dbConns } = await supabase
        .from("connections")
        .select("*")
        .or(
          `requester_id.eq.${sessionUser.id},recipient_id.eq.${sessionUser.id}`,
        );
      const connectionsData: Connection[] = (dbConns || []).map((c: any) => ({
        id: c.id,
        requester_id: c.requester_id,
        recipient_id: c.recipient_id,
        status: c.status,
        created_at: c.created_at,
      }));

      set({
        currentUser: activeUser,
        posts: postsData,
        groups: groupsData,
        conversations: conversationsData,
        messages: messagesData,
        notifications: notificationsData,
        ads: adsData,
        payments: paymentsData,
        connections: connectionsData,
      });

      console.log("Palrene: Data initialized successfully.");
    } catch (e) {
      console.error("Palrene: Error initializing data:", e);
    }
  },

  login: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: password || "temp1234%",
      });

      if (error) throw error;

      const userId = data?.user?.id;
      if (!userId) return false;

      const { data: dbProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      let profile: Profile;
      if (dbProfile) {
        profile = {
          id: dbProfile.id,
          email: dbProfile.email || email,
          full_name: dbProfile.full_name || "",
          username: dbProfile.username || "",
          avatar_url: dbProfile.avatar_url || "",
          banner_url: dbProfile.banner_url,
          bio: dbProfile.bio,
          location: dbProfile.location,
          dob: dbProfile.dob,
          gender: dbProfile.gender,
          gender_preference: dbProfile.gender_preference,
          race: dbProfile.race,
          preferred_race: dbProfile.preferred_race,
          age_range_min: dbProfile.age_range_min,
          age_range_max: dbProfile.age_range_max,
          recognition_goals: dbProfile.recognition_goals || [],
          interests: dbProfile.interests || [],
          is_verified: dbProfile.is_verified,
          is_admin: dbProfile.is_admin,
          followers_count: dbProfile.followers_count || 0,
          following_count: dbProfile.following_count || 0,
          views_count: dbProfile.views_count || 0,
          is_active: dbProfile.is_active,
          subscription_tier: dbProfile.subscription_tier || "Free",
          relationship_status: dbProfile.relationship_status || "Private",
          token_balance: dbProfile.token_balance || 100,
        };
      } else {
        const username = email
          .split("@")[0]
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "_");
        const { data: newProfile } = await supabase
          .from("profiles")
          .insert([
            {
              id: userId,
              email,
              full_name: email.split("@")[0].split(".")[0],
              username,
              avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`,
              banner_url:
                "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
              is_admin: email.toLowerCase() === "kamyavince@gmail.com",
              is_verified: false,
              subscription_tier: "Free",
              relationship_status: "Private",
              token_balance: 100,
            },
          ])
          .select()
          .single();

        profile = {
          id: userId,
          email,
          full_name: newProfile?.full_name || email.split("@")[0].split(".")[0],
          username,
          avatar_url:
            newProfile?.avatar_url ||
            `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`,
          banner_url: newProfile?.banner_url,
          followers_count: 0,
          following_count: 0,
          views_count: 0,
          is_active: true,
          is_verified: false,
          relationship_status: "Private",
          token_balance: 100,
          is_admin: email.toLowerCase() === "kamyavince@gmail.com",
        };
      }

      set({ currentUser: profile, currentView: "home" });
      get().initializeDynamicData();
      return true;
    } catch (e) {
      console.error("Login error:", e);
      return false;
    }
  },

  signup: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: password || "temp1234%",
      });
      if (error) throw error;
      set({ registrationStep: 1, registrationData: { email } });
      return true;
    } catch (e) {
      console.error("Signup error:", e);
      return false;
    }
  },

  resetPassword: async (email) => {
    try {
      await supabase.auth.resetPasswordForEmail(email);
      return true;
    } catch {
      return true;
    }
  },

  startRegistration: () => set({ registrationStep: 1, registrationData: {} }),

  nextRegistrationStep: (data) => {
    const updatedData = { ...get().registrationData, ...data };
    const currentStep = get().registrationStep;
    if (currentStep < 8) {
      set({ registrationStep: currentStep + 1, registrationData: updatedData });
    } else {
      set({ registrationData: updatedData });
      get().finishRegistration();
    }
  },

  prevRegistrationStep: () => {
    const currentStep = get().registrationStep;
    if (currentStep > 1) set({ registrationStep: currentStep - 1 });
  },

  finishRegistration: async () => {
    const finalData = get().registrationData;
    const { data: sessionData } = await supabase.auth.getSession();
    const authId = sessionData?.session?.user?.id;

    if (!authId) {
      console.error("No auth session found for registration");
      return;
    }

    const newProfile: Profile = {
      id: authId,
      email: finalData.email || "user@palrene.com",
      full_name: finalData.full_name || "Warm Hearted",
      username: finalData.username || `human_${Date.now()}`,
      avatar_url:
        finalData.avatar_url ||
        `https://api.dicebear.com/7.x/adventurer/svg?seed=${authId}`,
      banner_url:
        finalData.banner_url ||
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
      bio: finalData.bio || "Searching for connections without boundaries.",
      location: finalData.location || "Earth",
      dob: finalData.dob || "1998-01-01",
      gender: finalData.gender || "Any",
      gender_preference: finalData.gender_preference || "Any",
      race: finalData.race || "Any",
      preferred_race: finalData.preferred_race || "Any",
      age_range_min: finalData.age_range_min || 18,
      age_range_max: finalData.age_range_max || 99,
      recognition_goals: finalData.recognition_goals || ["friendship"],
      interests: finalData.interests || ["relationships", "music", "science"],
      is_verified: false,
      is_admin: finalData.email?.toLowerCase() === "kamyavince@gmail.com",
      followers_count: 0,
      following_count: 0,
      views_count: 0,
      is_active: true,
      relationship_status: "Single",
      token_balance: 100,
    };

    try {
      await supabase.from("profiles").upsert([
        {
          id: newProfile.id,
          email: newProfile.email,
          full_name: newProfile.full_name,
          username: newProfile.username,
          avatar_url: newProfile.avatar_url,
          banner_url: newProfile.banner_url,
          bio: newProfile.bio,
          location: newProfile.location,
          dob: newProfile.dob,
          gender: newProfile.gender,
          gender_preference: newProfile.gender_preference,
          race: newProfile.race,
          preferred_race: newProfile.preferred_race,
          age_range_min: newProfile.age_range_min,
          age_range_max: newProfile.age_range_max,
          recognition_goals: newProfile.recognition_goals,
          interests: newProfile.interests,
          is_verified: false,
          is_admin: newProfile.is_admin,
          subscription_tier: "Free",
          is_active: true,
          relationship_status: "Single",
          token_balance: 100,
        },
      ]);

      await supabase
        .from("onboarding_profiles")
        .update({ profile_completed: true })
        .eq("id", authId);
      await supabase.from("user_tokens").upsert([
        {
          user_id: authId,
          balance: 200,
          lifetime_earned: 200,
          current_streak: 1,
          longest_streak: 1,
        },
      ]);

      await supabase.from("token_transactions").insert([
        {
          user_id: authId,
          amount: 100,
          type: "earn",
          source: "welcome_bonus",
          description: "Welcome to Palrene — enjoy 100 bonus tokens!",
        },
      ]);
    } catch (e) {
      console.error("Error finishing registration:", e);
    }

    set({ currentUser: newProfile, registrationStep: 0, registrationData: {} });
    get().initializeDynamicData();
  },

  logout: async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error("Logout error:", e);
    }
    set({
      currentUser: null,
      currentView: "home",
      activeConversationId: null,
      posts: [],
      conversations: [],
      messages: [],
      notifications: [],
      connections: [],
      payments: [],
      tokenTransactions: [],
    });
  },

  createPost: async (
    content,
    mediaUrls,
    giphyUrl,
    videoUrl,
    isSensitive,
    quiz,
  ) => {
    const user = get().currentUser;
    if (!user) return;

    const newPost: Post = {
      id: crypto.randomUUID(),
      userId: user.id,
      profile: {
        full_name: user.full_name,
        username: user.username,
        avatar_url: user.avatar_url,
        is_verified: user.is_verified,
      },
      content,
      created_at: new Date().toISOString(),
      media_urls: mediaUrls,
      giphy_url: giphyUrl,
      video_url: videoUrl,
      likes_count: 0,
      comments_count: 0,
      reposts_count: 0,
      is_sensitive: isSensitive || false,
      quiz: quiz
        ? {
            question: quiz.question,
            options: quiz.options,
            votes: new Array(quiz.options.length).fill(0),
            voted_index: undefined,
          }
        : undefined,
    };

    try {
      await supabase.from("posts").insert([
        {
          id: newPost.id,
          user_id: user.id,
          content: newPost.content,
          giphy_url: newPost.giphy_url,
          video_url: newPost.video_url,
          media_urls: newPost.media_urls,
          likes_count: 0,
          comments_count: 0,
          reposts_count: 0,
          is_sensitive: newPost.is_sensitive,
          quiz: newPost.quiz,
          category: "General",
        },
      ]);
    } catch (e) {
      console.error("Create post error:", e);
    }

    set({ posts: [newPost, ...get().posts] });
    get().earnTokens(5, "engagement", "Posted new content");
  },

  likePost: async (postId) => {
    const user = get().currentUser;
    if (!user) return;

    try {
      await supabase
        .from("likes")
        .insert([{ user_id: user.id, post_id: postId }]);
      await supabase.rpc("increment_post_likes", { post_id: postId });
    } catch (e) {
      console.error("Like post error:", e);
    }

    const updatedPosts = get().posts.map((post) =>
      post.id === postId
        ? { ...post, likes_count: post.likes_count + 1 }
        : post,
    );
    set({ posts: updatedPosts });
  },

  repostPost: async (postId) => {
    const user = get().currentUser;
    if (!user) return;

    try {
      await supabase
        .from("reposts")
        .insert([{ user_id: user.id, post_id: postId }]);
    } catch (e) {
      console.error("Repost error:", e);
    }

    const updatedPosts = get().posts.map((post) =>
      post.id === postId
        ? { ...post, reposts_count: post.reposts_count + 1 }
        : post,
    );
    set({ posts: updatedPosts });
  },

  boostPost: async (postId) => {
    const user = get().currentUser;
    if (!user) return;

    try {
      await supabase.from("posts").update({ boosted: true }).eq("id", postId);
    } catch (e) {
      console.error("Boost post error:", e);
    }

    const updatedPosts = get().posts.map((post) =>
      post.id === postId
        ? { ...post, boosted: true, likes_count: post.likes_count + 15 }
        : post,
    );
    set({ posts: updatedPosts });
  },

  voteInQuiz: async (postId, optionIndex) => {
    const updatedPosts = get().posts.map((post) => {
      if (post.id === postId && post.quiz) {
        const votes = [...(post.quiz.votes || [])];
        votes[optionIndex] = (votes[optionIndex] || 0) + 1;
        const updatedQuiz = { ...post.quiz, votes, voted_index: optionIndex };
        try {
          supabase.from("posts").update({ quiz: updatedQuiz }).eq("id", postId);
        } catch (e) {
          console.error("Vote quiz error:", e);
        }
        return { ...post, quiz: updatedQuiz };
      }
      return post;
    });
    set({ posts: updatedPosts });
  },

  addComment: async (postId, content) => {
    const user = get().currentUser;
    if (!user) return;

    try {
      await supabase
        .from("comments")
        .insert([{ post_id: postId, user_id: user.id, content }]);
    } catch (e) {
      console.error("Add comment error:", e);
    }

    const updatedPosts = get().posts.map((post) =>
      post.id === postId
        ? { ...post, comments_count: post.comments_count + 1 }
        : post,
    );
    set({ posts: updatedPosts });
  },

  toggleFollow: async (profileId) => {
    const user = get().currentUser;
    if (!user) return;

    try {
      await supabase
        .from("follows")
        .insert([{ follower_id: user.id, following_id: profileId }]);
    } catch (e) {
      console.error("Follow error:", e);
    }
  },

  viewProfileCount: (profileId) => {
    supabase
      .rpc("increment_profile_views", { profile_id: profileId })
      .catch(() => {});
  },

  updateProfileSettings: async (data) => {
    const user = get().currentUser;
    if (!user) return;

    try {
      await supabase.from("profiles").update(data).eq("id", user.id);
      const updatedUser = { ...user, ...data };
      set({ currentUser: updatedUser });
    } catch (e) {
      console.error("Update profile error:", e);
    }
  },

  startConversation: async (profileId) => {
    const user = get().currentUser;
    if (!user) return "";

    const existing = get().conversations.find((c) =>
      c.participants.some((p) => p.id === profileId),
    );
    if (existing) {
      set({ activeConversationId: existing.id, currentView: "messages" });
      return existing.id;
    }

    const recipient = get().profiles.find((p) => p.id === profileId);
    if (!recipient) return "";

    const newConvId = crypto.randomUUID();
    const newConv: Conversation = {
      id: newConvId,
      participants: [
        {
          id: recipient.id,
          full_name: recipient.full_name,
          username: recipient.username,
          avatar_url: recipient.avatar_url,
          is_verified: recipient.is_verified,
          is_active: recipient.is_active,
        },
      ],
      last_message: "Conversation has begun.",
      last_message_at: new Date().toISOString(),
      unread_count: 0,
    };

    try {
      await supabase.from("conversations").insert([
        {
          id: newConvId,
          participants: [user.id, recipient.id],
          last_message: "Conversation has begun.",
          last_message_at: newConv.last_message_at,
        },
      ]);
    } catch (e) {
      console.error("Start conversation error:", e);
    }

    set({
      conversations: [newConv, ...get().conversations],
      activeConversationId: newConvId,
      currentView: "messages",
    });
    return newConvId;
  },

  sendMessage: async (conversationId, content, mediaUrl, giphyUrl) => {
    const user = get().currentUser;
    if (!user) return;

    const newMsg: Message = {
      id: crypto.randomUUID(),
      conversation_id: conversationId,
      sender_id: user.id,
      content,
      created_at: new Date().toISOString(),
      media_url: mediaUrl,
      giphy_url: giphyUrl,
    };

    try {
      await supabase.from("messages").insert([
        {
          id: newMsg.id,
          conversation_id: conversationId,
          sender_id: user.id,
          content: newMsg.content,
          media_url: newMsg.media_url,
          giphy_url: newMsg.giphy_url,
          is_ai: false,
        },
      ]);
      await supabase
        .from("conversations")
        .update({
          last_message: content || "Shared attachment",
          last_message_at: newMsg.created_at,
        })
        .eq("id", conversationId);
    } catch (e) {
      console.error("Send message error:", e);
    }

    const updatedMessages = [...get().messages, newMsg];
    const updatedConversations = get().conversations.map((conv) =>
      conv.id === conversationId
        ? {
            ...conv,
            last_message: content || "Shared attachment",
            last_message_at: new Date().toISOString(),
          }
        : conv,
    );
    set({ messages: updatedMessages, conversations: updatedConversations });

    const activeConv = get().conversations.find((c) => c.id === conversationId);
    if (activeConv?.participants[0]?.id === "poly-ai") {
      try {
        const relevantHistory = get()
          .messages.filter((m) => m.conversation_id === conversationId)
          .slice(-8)
          .map((m) => ({
            role: m.sender_id === "poly-ai" ? "assistant" : "user",
            content: m.content,
          }));

        const res = await fetch("/api/poly/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: content, history: relevantHistory }),
        });
        const data = await res.json();

        if (data.reply) {
          const aiMsg: Message = {
            id: crypto.randomUUID(),
            conversation_id: conversationId,
            sender_id: "poly-ai",
            content: data.reply,
            created_at: new Date().toISOString(),
            is_ai: true,
          };

          try {
            await supabase.from("messages").insert([
              {
                id: aiMsg.id,
                conversation_id: conversationId,
                sender_id: "poly-ai",
                content: aiMsg.content,
                is_ai: true,
              },
            ]);
          } catch (e) {
            console.error("AI message insert error:", e);
          }

          set({ messages: [...get().messages, aiMsg] });
        }
      } catch (err) {
        console.error("Poly AI error:", err);
      }
    }
  },

  setActiveConversation: (activeConversationId) =>
    set({ activeConversationId }),

  joinGroup: async (groupId) => {
    try {
      await supabase.rpc("increment_group_members", { group_id: groupId });
    } catch (e) {
      console.error("Join group error:", e);
    }

    const updatedGroups = get().groups.map((group) =>
      group.id === groupId
        ? { ...group, members_count: group.members_count + 1 }
        : group,
    );
    set({ groups: updatedGroups });
    get().earnTokens(5, "engagement", "Joined a community group");
  },

  createGroup: async (name, description, category, avatarUrl, isPrivate) => {
    const user = get().currentUser;
    if (!user) return;

    const newGroup: Group = {
      id: crypto.randomUUID(),
      name,
      description,
      category,
      avatar_url:
        avatarUrl ||
        "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=150&auto=format&fit=crop&q=80",
      banner_url:
        "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&auto=format&fit=crop&q=80",
      members_count: 1,
      posts_count: 0,
      created_by: user.id,
      created_at: new Date().toISOString(),
      is_private: isPrivate,
    };

    try {
      await supabase.from("groups").insert([newGroup]);
    } catch (e) {
      console.error("Create group error:", e);
    }

    set({ groups: [...get().groups, newGroup] });
  },

  submitVerification: async (videoUrl, docFront, docBack) => {
    const user = get().currentUser;
    if (!user) return;

    try {
      await supabase
        .from("profiles")
        .update({
          bio: `${user.bio || ""} (Verification Pending)`,
          verification_video_url: videoUrl,
          verification_doc_front_url: docFront,
          verification_doc_back_url: docBack,
        })
        .eq("id", user.id);
    } catch (e) {
      console.error("Submit verification error:", e);
    }
  },

  submitAd: async (title, description, linkUrl, imageUrl) => {
    const user = get().currentUser;
    if (!user) return;

    const newAd: Ad = {
      id: crypto.randomUUID(),
      title,
      description,
      link_url: linkUrl,
      image_url:
        imageUrl ||
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&auto=format&fit=crop&q=80",
      status: "pending",
      created_by: user.id,
      created_at: new Date().toISOString(),
    };

    try {
      await supabase.from("ads").insert([newAd]);
    } catch (e) {
      console.error("Submit ad error:", e);
    }

    set({ ads: [...get().ads, newAd] });
  },

  approveAd: async (adId) => {
    try {
      await supabase.from("ads").update({ status: "approved" }).eq("id", adId);
    } catch (e) {
      console.error("Approve ad error:", e);
    }

    const updatedAds = get().ads.map((ad) =>
      ad.id === adId ? { ...ad, status: "approved" as const } : ad,
    );
    set({ ads: updatedAds });
  },

  rejectAd: async (adId) => {
    try {
      await supabase.from("ads").update({ status: "rejected" }).eq("id", adId);
    } catch (e) {
      console.error("Reject ad error:", e);
    }

    const updatedAds = get().ads.map((ad) =>
      ad.id === adId ? { ...ad, status: "rejected" as const } : ad,
    );
    set({ ads: updatedAds });
  },

  approveVerification: async (profileId) => {
    try {
      await supabase
        .from("profiles")
        .update({ is_verified: true })
        .eq("id", profileId);
    } catch (e) {
      console.error("Approve verification error:", e);
    }
  },

  rejectVerification: async (profileId) => {
    try {
      await supabase
        .from("profiles")
        .update({ is_verified: false })
        .eq("id", profileId);
    } catch (e) {
      console.error("Reject verification error:", e);
    }
  },

  moderatePost: async (postId, action) => {
    try {
      if (action === "delete") {
        await supabase.from("posts").delete().eq("id", postId);
      } else {
        await supabase
          .from("posts")
          .update({ is_sensitive: false })
          .eq("id", postId);
      }
    } catch (e) {
      console.error("Moderate post error:", e);
    }

    const updatedPosts =
      action === "delete"
        ? get().posts.filter((p) => p.id !== postId)
        : get().posts.map((p) =>
            p.id === postId ? { ...p, is_sensitive: false } : p,
          );
    set({ posts: updatedPosts });
  },

  banUser: async (profileId) => {
    try {
      await supabase
        .from("profiles")
        .update({ is_active: false })
        .eq("id", profileId);
    } catch (e) {
      console.error("Ban user error:", e);
    }
  },

  makeAdmin: async (profileId) => {
    try {
      await supabase
        .from("profiles")
        .update({ is_admin: true })
        .eq("id", profileId);
    } catch (e) {
      console.error("Make admin error:", e);
    }
  },

  setSubscriptionTier: async (tier) => {
    const user = get().currentUser;
    if (!user) return;

    try {
      await supabase
        .from("profiles")
        .update({ subscription_tier: tier })
        .eq("id", user.id);
      const updatedUser = { ...user, subscription_tier: tier };
      set({ currentUser: updatedUser });
    } catch (e) {
      console.error("Set subscription tier error:", e);
    }

    const bonuses: Record<string, number> = { Starter: 200, Pro: 500 };
    if (bonuses[tier]) {
      get().earnTokens(
        bonuses[tier],
        "subscription",
        `${tier} subscription token bonus`,
      );
    }
  },

  addPaymentTransaction: async (tx) => {
    try {
      await supabase.from("payments").insert([
        {
          id: tx.id,
          user_id: tx.userId,
          user_name: tx.userName,
          plan: tx.plan,
          amount: tx.amount,
          status: tx.status,
          provider: tx.provider,
        },
      ]);
    } catch (e) {
      console.error("Add payment transaction error:", e);
    }

    set({ payments: [tx, ...get().payments] });
  },

  refundPaymentTransaction: async (txId) => {
    try {
      await supabase
        .from("payments")
        .update({ status: "refunded" })
        .eq("id", txId);
      const tx = get().payments.find((p) => p.id === txId);
      if (tx) {
        await supabase
          .from("profiles")
          .update({ subscription_tier: "Free" })
          .eq("id", tx.userId);
      }
    } catch (e) {
      console.error("Refund payment error:", e);
    }

    const updatedPayments = get().payments.map((tx) =>
      tx.id === txId ? { ...tx, status: "refunded" as const } : tx,
    );
    set({ payments: updatedPayments });
  },

  disableSubscription: async (userId) => {
    try {
      await supabase
        .from("profiles")
        .update({ subscription_tier: "Free" })
        .eq("id", userId);
    } catch (e) {
      console.error("Disable subscription error:", e);
    }
  },

  triggerEmailAlert: async (subject, body) => {
    const user = get().currentUser;
    if (!user) return;

    console.log(
      `%c[EMAIL TO: ${user.email}]\nSubject: ${subject}\nBody: ${body}`,
      "background: #f43f5e; color: white; padding: 6px; border-radius: 4px;",
    );

    try {
      await supabase.from("notifications").insert([
        {
          user_id: user.id,
          type: "system",
          content: subject,
        },
      ]);
    } catch (e) {
      console.error("Trigger email alert error:", e);
    }
  },

  deleteNotification: async (id) => {
    const user = get().currentUser;
    if (!user) return;

    try {
      await supabase
        .from("notifications")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
    } catch (e) {
      console.error("Delete notification error:", e);
    }

    const remaining = get().notifications.filter((notif) => notif.id !== id);
    set({ notifications: remaining });
  },
}));
