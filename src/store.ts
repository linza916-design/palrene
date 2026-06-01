import { create } from "zustand";
import { Profile, Post, Group, Comment, Conversation, Message, Notification, Ad, PaymentTransaction } from "./types";
import { mockProfiles, mockPosts, mockGroups, mockComments, mockConversations, mockMessages, mockNotifications } from "./mockData";
import { supabase } from "./supabaseClient";

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
  theme: "dark" | "light";
  currentView: string; // home, discover, messages, groups, profile, settings, notifications, search, admin, ai-poly, landing, post-detail
  activeConversationId: string | null;
  selectedPostId: string | null;
  searchQuery: string;
  searchFilter: string; // all, profiles, posts, groups
  registrationStep: number; // 0 means not in flow
  registrationData: Partial<Profile>;
  
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
  createPost: (content: string, mediaUrls?: string[], giphyUrl?: string, videoUrl?: string, isSensitive?: boolean, quiz?: { question: string, options: string[] }) => void;
  likePost: (postId: string) => void;
  repostPost: (postId: string) => void;
  boostPost: (postId: string) => void;
  voteInQuiz: (postId: string, optionIndex: number) => void;
  addComment: (postId: string, content: string) => void;
  
  // Profile Actions
  toggleFollow: (profileId: string) => void;
  viewProfileCount: (profileId: string) => void;
  updateProfileSettings: (data: Partial<Profile>) => void;
  
  // Chat Actions
  startConversation: (profileId: string) => Promise<string>;
  sendMessage: (conversationId: string, content: string, mediaUrl?: string, GiphyUrl?: string) => Promise<void>;
  setActiveConversation: (id: string | null) => void;
  
  // Group Actions
  joinGroup: (groupId: string) => void;
  createGroup: (name: string, description: string, category: string, avatarUrl: string, isPrivate: boolean) => void;
  
  // Admin & Verification Actions
  submitVerification: (videoUrl: string, docFront: string, docBack: string) => void;
  submitAd: (title: string, description: string, linkUrl: string, imageUrl: string) => void;
  approveAd: (adId: string) => void;
  rejectAd: (adId: string) => void;
  approveVerification: (profileId: string) => void;
  rejectVerification: (profileId: string) => void;
  moderatePost: (postId: string, action: 'allow' | 'delete') => void;
  banUser: (profileId: string) => void;
  makeAdmin: (profileId: string) => void;
  setSubscriptionTier: (tier: 'Free' | 'Starter' | 'Pro') => void;
  addPaymentTransaction: (tx: PaymentTransaction) => void;
  refundPaymentTransaction: (txId: string) => void;
  disableSubscription: (userId: string) => void;
  
  // Email Simulation Notification Trigger
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

const setStoredData = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Local storage sync error", e);
  }
};

export const useStore = create<PalreneState>((set, get) => ({
  currentUser: getStoredData("palrene_current_user", null),
  profiles: getStoredData("palrene_profiles", mockProfiles),
  posts: getStoredData("palrene_posts", mockPosts),
  groups: getStoredData("palrene_groups", mockGroups),
  conversations: getStoredData("palrene_conversations", mockConversations),
  messages: getStoredData("palrene_messages", mockMessages),
  notifications: getStoredData("palrene_notifications", mockNotifications),
  ads: getStoredData("palrene_ads", [
    {
      id: "ad-1",
      title: "Resonance Sound Therapy",
      description: "Experience absolute peace with guided frequency bathing. Get 20% off for Palrene members.",
      link_url: "https://example.com/resonance",
      image_url: "https://images.unsplash.com/photo-1518244979147-3b77e9eb2e0d?w=300&auto=format&fit=crop&q=80",
      status: "approved",
      created_by: "user-1",
      created_at: "2026-05-28T09:00:00Z"
    }
  ]),
  payments: getStoredData("palrene_payments", [
    {
      id: "tx-mock-1",
      userId: "user-1",
      userName: "Clara Moreau",
      plan: "Starter",
      amount: 12.00,
      status: "successful",
      provider: "Flutterwave",
      created_at: "2026-05-15T14:30:00Z"
    },
    {
      id: "tx-mock-2",
      userId: "user-2",
      userName: "Elias Vance",
      plan: "Pro",
      amount: 226.20,
      status: "successful",
      provider: "Flutterwave",
      created_at: "2026-05-20T10:15:00Z"
    }
  ]),
  theme: getStoredData("palrene_theme", "dark"),
  currentView: getStoredData("palrene_current_view", "landing"),
  activeConversationId: null,
  selectedPostId: getStoredData("palrene_selected_post_id", null),
  searchQuery: "",
  searchFilter: "all",
  registrationStep: 0,
  registrationData: {},

  // Actions
  setTheme: (theme) => {
    set({ theme });
    setStoredData("palrene_theme", theme);
  },
  
  setView: (currentView) => {
    set({ currentView });
    setStoredData("palrene_current_view", currentView);
  },

  selectPostId: (id) => {
    set({ selectedPostId: id });
    setStoredData("palrene_selected_post_id", id);
    if (id) {
      // 1. Process behind-the-scenes view stats increments
      const updatedPosts = get().posts.map(post => {
        if (post.id === id) {
          const authorId = post.userId;
          
          // Increment author profile's total view count
          const updatedProfiles = get().profiles.map(p => {
            if (p.id === authorId) {
              return { ...p, views_count: (p.views_count || 0) + 1 };
            }
            return p;
          });
          set({ profiles: updatedProfiles });
          setStoredData("palrene_profiles", updatedProfiles);
          
          // Add post category to user's interest matrix (Updates your feed!)
          const user = get().currentUser;
          if (user && post.category) {
            const currentInterests = user.interests || [];
            if (!currentInterests.includes(post.category)) {
              const updatedUser = {
                ...user,
                interests: [...currentInterests, post.category]
              };
              set({ currentUser: updatedUser });
              setStoredData("palrene_current_user", updatedUser);
            }
          }
          
          return { ...post, views_count: (post.views_count || 0) + 1 };
        }
        return post;
      });
      set({ posts: updatedPosts, currentView: "post-detail" });
      setStoredData("palrene_posts", updatedPosts);
      setStoredData("palrene_current_view", "post-detail");
      
      // Simulate URL Change (Loads URL unique web link)
      window.history.pushState(null, "", `#/post/${id}`);
    } else {
      set({ currentView: "home" });
      setStoredData("palrene_current_view", "home");
      window.history.pushState(null, "", `#`);
    }
  },
  
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSearchFilter: (searchFilter) => set({ searchFilter }),
  setCurrentUser: (currentUser) => {
    set({ currentUser });
    setStoredData("palrene_current_user", currentUser);
  },

  initializeDynamicData: async () => {
    try {
      // 1. Check if we have an active session
      const { data: sessionData } = await supabase.auth.getSession();
      const sessionUser = sessionData?.session?.user;
      
      // 2. Fetch profiles from database
      const { data: dbProfiles, error: profileErr } = await supabase
        .from("profiles")
        .select("*");
        
      if (profileErr) throw profileErr;
      
      const pData: Profile[] = (dbProfiles || []).map(p => ({
        id: p.id,
        email: p.email,
        full_name: p.full_name || "",
        username: p.username,
        avatar_url: p.avatar_url,
        banner_url: p.banner_url,
        bio: p.bio,
        location: p.location,
        dob: p.dob,
        gender: p.gender,
        gender_preference: p.gender_preference,
        race: p.race,
        preferred_race: p.preferred_race,
        age_range_min: p.age_range_min,
        age_range_max: p.age_range_max,
        recognition_goals: p.recognition_goals || [],
        interests: p.interests || [],
        is_verified: p.is_verified,
        is_admin: p.is_admin,
        followers_count: p.followers_count || 0,
        following_count: p.following_count || 0,
        views_count: p.views_count || 0,
        is_active: p.is_active,
        subscription_tier: p.subscription_tier || "Free",
        verification_video_url: p.verification_video_url,
        verification_doc_front_url: p.verification_doc_front_url,
        verification_doc_back_url: p.verification_doc_back_url,
      }));

      // Find current user's profile
      let activeUser: Profile | null = null;
      if (sessionUser) {
        activeUser = pData.find(p => p.id === sessionUser.id) || null;
      } else {
        const lsUser = get().currentUser;
        if (lsUser) {
          activeUser = pData.find(p => p.id === lsUser.id) || lsUser;
        }
      }

      // 3. Fetch Posts
      const { data: dbPosts } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
      const postsData: Post[] = (dbPosts || []).map(post => {
        const u = pData.find(prof => prof.id === post.user_id) || {
          id: "",
          full_name: "",
          username: "",
          avatar_url: "",
          is_verified: false
        };
        return {
          id: post.id,
          userId: post.user_id,
          profile: {
            id: u.id,
            full_name: u.full_name,
            username: u.username,
            avatar_url: u.avatar_url,
            is_verified: u.is_verified,
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
          category: post.category || "relationships",
          created_at: post.created_at,
        };
      });

      // 4. Fetch Groups
      const { data: dbGroups } = await supabase.from("groups").select("*");
      const groupsData: Group[] = (dbGroups || []).map(dbGroup => ({
        id: dbGroup.id,
        name: dbGroup.name,
        description: dbGroup.description,
        category: dbGroup.category,
        avatar_url: dbGroup.avatar_url,
        banner_url: dbGroup.banner_url,
        members_count: dbGroup.members_count || 1,
        posts_count: dbGroup.posts_count || 0,
        created_by: dbGroup.created_by,
        created_at: dbGroup.created_at,
        is_private: dbGroup.is_private || false,
      }));

      // 5. Fetch Conversations
      const { data: dbConversations } = await supabase.from("conversations").select("*").order("last_message_at", { ascending: false });
      const conversationsData: Conversation[] = (dbConversations || []).map(dbConv => ({
        id: dbConv.id,
        participants: (dbConv.participants || []).map((pId: string) => {
          const p = pData.find(user => user.id === pId);
          return {
            id: p?.id || pId,
            full_name: p?.full_name || "User",
            username: p?.username || "user",
            avatar_url: p?.avatar_url || "",
            is_active: p?.is_active,
            is_verified: p?.is_verified,
          };
        }),
        last_message: dbConv.last_message,
        last_message_at: dbConv.last_message_at,
        unread_count: dbConv.unread_count || 0,
      }));

      // 6. Fetch Messages
      const { data: dbMessages } = await supabase.from("messages").select("*").order("created_at", { ascending: true });
      const messagesData: Message[] = (dbMessages || []).map(m => ({
        id: m.id,
        conversation_id: m.conversation_id,
        sender_id: m.sender_id,
        content: m.content,
        media_url: m.media_url,
        giphy_url: m.giphy_url,
        is_ai: m.is_ai || false,
        created_at: m.created_at,
      }));

      // 7. Fetch Notifications
      const { data: dbNotifications } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });
      const notificationsData: Notification[] = (dbNotifications || []).map(dbNotif => ({
        id: dbNotif.id,
        type: dbNotif.type as any,
        sender: dbNotif.sender_id ? {
          id: dbNotif.sender_id,
          full_name: pData.find(p => p.id === dbNotif.sender_id)?.full_name || "Someone",
          username: pData.find(p => p.id === dbNotif.sender_id)?.username || "",
          avatar_url: pData.find(p => p.id === dbNotif.sender_id)?.avatar_url || "",
        } : undefined,
        content: dbNotif.content,
        read: dbNotif.read || false,
        created_at: dbNotif.created_at,
        action_url: dbNotif.action_url,
      }));

      // 8. Fetch Ads
      const { data: dbAds } = await supabase.from("ads").select("*").order("created_at", { ascending: false });
      const adsData: Ad[] = (dbAds || []).map(ad => ({
        id: ad.id,
        title: ad.title,
        description: ad.description,
        link_url: ad.link_url,
        image_url: ad.image_url,
        status: ad.status,
        created_by: ad.created_by,
        created_at: ad.created_at,
      }));

      // 9. Fetch Payments
      const { data: dbPayments } = await supabase.from("payments").select("*").order("created_at", { ascending: false });
      const paymentsData: PaymentTransaction[] = (dbPayments || []).map(tx => ({
        id: tx.id,
        userId: tx.user_id,
        userName: tx.user_name,
        plan: tx.plan,
        amount: Number(tx.amount || 0),
        status: tx.status,
        provider: tx.provider,
        created_at: tx.created_at,
      }));

      // Update states
      set({
        profiles: pData.length ? pData : get().profiles,
        currentUser: activeUser || get().currentUser,
        posts: postsData.length ? postsData : get().posts,
        groups: groupsData.length ? groupsData : get().groups,
        conversations: conversationsData.length ? conversationsData : get().conversations,
        messages: messagesData.length ? messagesData : get().messages,
        notifications: notificationsData.length ? notificationsData : get().notifications,
        ads: adsData.length ? adsData : get().ads,
        payments: paymentsData.length ? paymentsData : get().payments,
      });
      
      console.log("Palrene: Supabase active data sync completed successfully. Dynamic back-end integrated.");
    } catch (e) {
      console.warn("Palrene: Supabase tables not found/offline. Seamlessly falling back to robust local simulation storage.", e);
    }
  },

  // Auth Simulation & Real Connection
  login: async (email, password) => {
    try {
      // Attempt real Supabase Auth login as a feature
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: password || "temp1234%"
      });

      if (error) throw error;

      // Find profile in Supabase
      const { data: dbProfile, error: profErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data?.user?.id)
        .single();

      let profile: Profile;
      if (dbProfile) {
        profile = {
          id: dbProfile.id,
          email: dbProfile.email,
          full_name: dbProfile.full_name || "",
          username: dbProfile.username,
          avatar_url: dbProfile.avatar_url,
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
        };
      } else {
        // Fallback or trigger delay - create and insert manually
        const username = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "_");
        profile = {
          id: data?.user?.id || `user_${Date.now()}`,
          email,
          full_name: email.split("@")[0].split(".")[0],
          username: username,
          avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`,
          banner_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
          followers_count: 0,
          following_count: 0,
          views_count: 1,
          is_active: true,
          is_verified: false,
          is_admin: get().profiles.filter(p => !["poly-ai", "user-1", "user-2", "user-3"].includes(p.id)).length < 3 || email.toLowerCase() === "kamyavince@gmail.com" || email.toLowerCase().includes("admin")
        };
        await supabase.from("profiles").insert([{
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          username: profile.username,
          avatar_url: profile.avatar_url,
          banner_url: profile.banner_url,
          is_admin: profile.is_admin,
          is_verified: false,
          subscription_tier: "Free"
        }]);
      }

      set({ currentUser: profile, currentView: "home" });
      setStoredData("palrene_current_user", profile);
      
      get().triggerEmailAlert(
        "Welcome Back to Palrene",
        `Hello ${profile.full_name}, we are delighted to welcome you back to your emotional support and relationship harbor without boundaries.`
      );
      
      get().initializeDynamicData(); // refresh and sync all tables
      return true;
    } catch (e) {
      console.warn("Supabase Auth error. Proceeding with robust local session.", e);
      // Fail-proof local authentication fallback
      const existingProfiles = get().profiles;
      let profile = existingProfiles.find(p => p.email.toLowerCase() === email.toLowerCase());
      if (!profile) {
        const username = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "_");
        profile = {
          id: `user_${Date.now()}`,
          email,
          full_name: email.split("@")[0].split(".")[0],
          username,
          avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`,
          banner_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
          followers_count: 0,
          following_count: 0,
          views_count: 1,
          is_active: true,
          is_verified: false,
          is_admin: existingProfiles.filter(p => !["poly-ai", "user-1", "user-2", "user-3"].includes(p.id)).length < 3 || email.toLowerCase() === "kamyavince@gmail.com" || email.toLowerCase().includes("admin")
        };
        const updatedProfiles = [...existingProfiles, profile];
        set({ profiles: updatedProfiles });
        setStoredData("palrene_profiles", updatedProfiles);
      }
      set({ currentUser: profile, currentView: "home" });
      setStoredData("palrene_current_user", profile);
      return true;
    }
  },

  signup: async (email, password) => {
    try {
      // Connect Auth
      await supabase.auth.signUp({
        email,
        password: password || "temp1234%"
      });
      
      // Let's create a partial profile and begin the 8-step onboarding flow
      set({
        registrationStep: 1,
        registrationData: { email },
        currentView: "landing" // Remain on landing but launch the Progressive Registration Modal
      });
      return true;
    } catch (e) {
      console.warn("Supabase signup error, utilizing robust safe local onboarding", e);
      set({
        registrationStep: 1,
        registrationData: { email },
        currentView: "landing"
      });
      return true;
    }
  },

  resetPassword: async (email) => {
    try {
      await supabase.auth.resetPasswordForEmail(email);
      get().triggerEmailAlert("Palrene - Password Reset Requested", "We received a request to reset your password. Please complete it inside your client window.");
      return true;
    } catch {
      get().triggerEmailAlert("Palrene - Password Reset Requested", "We received a request to reset your password. Please complete it inside your client window.");
      return true;
    }
  },

  startRegistration: () => {
    set({ registrationStep: 1, registrationData: {} });
  },

  nextRegistrationStep: (data) => {
    const updatedData = { ...get().registrationData, ...data };
    const currentStep = get().registrationStep;
    
    if (currentStep < 8) {
      set({
        registrationStep: currentStep + 1,
        registrationData: updatedData
      });
    } else {
      // If completed all steps
      set({ registrationData: updatedData });
      get().finishRegistration();
    }
  },

  prevRegistrationStep: () => {
    const currentStep = get().registrationStep;
    if (currentStep > 1) {
      set({ registrationStep: currentStep - 1 });
    }
  },

  finishRegistration: async () => {
    const finalData = get().registrationData;
    const existingProfiles = get().profiles;
    
    let authId = `user_${Date.now()}`;
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user?.id) {
        authId = sessionData.session.user.id;
      }
    } catch {}

    const newProfile: Profile = {
      id: authId,
      email: finalData.email || "user@palrene.com",
      full_name: finalData.full_name || "Warm Hearted",
      username: finalData.username || `human_${Date.now()}`,
      avatar_url: finalData.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      banner_url: finalData.banner_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
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
      is_admin: existingProfiles.filter(p => !["poly-ai", "user-1", "user-2", "user-3"].includes(p.id)).length < 3 || (finalData.email && (finalData.email.toLowerCase() === "kamyavince@gmail.com" || finalData.email.toLowerCase().includes("admin"))),
      followers_count: 0,
      following_count: 0,
      views_count: 1,
      is_active: true
    };

    // Attempt actual database registration
    try {
      await supabase.from("profiles").upsert([{
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
        is_active: true
      }]);
    } catch (e) {
      console.warn("Supabase profiles insert error, persisting locally.", e);
    }

    const updatedProfiles = [...existingProfiles, newProfile];
    set({
      profiles: updatedProfiles,
      currentUser: newProfile,
      registrationStep: 0,
      registrationData: {},
      currentView: "home"
    });

    setStoredData("palrene_profiles", updatedProfiles);
    setStoredData("palrene_current_user", newProfile);

    // Send confirmation email
    get().triggerEmailAlert(
      "Palrene Registration Successful 🎉",
      `Welcome to Palrene, ${newProfile.full_name}! Your profile is fully ready. Poly is waiting to help connect you with incredible people.`
    );

    get().initializeDynamicData();
  },

  logout: async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    set({ currentUser: null, currentView: "landing", activeConversationId: null });
    localStorage.removeItem("palrene_current_user");
  },

  // Post Actions
  createPost: async (content, mediaUrls, giphyUrl, videoUrl, isSensitive, quiz) => {
    const user = get().currentUser;
    if (!user) return;

    const newPost: Post = {
      id: `post_${Date.now()}`,
      userId: user.id,
      profile: {
        full_name: user.full_name,
        username: user.username,
        avatar_url: user.avatar_url,
        is_verified: user.is_verified
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
      quiz: quiz ? {
        question: quiz.question,
        options: quiz.options,
        votes: new Array(quiz.options.length).fill(0),
        voted_index: undefined
      } : undefined
    };

    // Try Supabase insert
    try {
      await supabase.from("posts").insert([{
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
        category: 'relationships'
      }]);
    } catch (e) {
      console.warn("Supabase posts insert error", e);
    }

    const updatedPosts = [newPost, ...get().posts];
    set({ posts: updatedPosts });
    setStoredData("palrene_posts", updatedPosts);
  },

  likePost: async (postId) => {
    const user = get().currentUser;
    if (!user) return;

    try {
      await supabase.from("likes").insert([{ user_id: user.id, post_id: postId }]);
      
      const p = get().posts.find(pst => pst.id === postId);
      if (p) {
        await supabase.from("posts").update({ likes_count: (p.likes_count || 0) + 1 }).eq("id", postId);
      }
    } catch (e) {
      console.warn("Supabase like insert error", e);
    }

    const updatedPosts = get().posts.map(post => {
      if (post.id === postId) {
        // Trigger notification to host if it's not self
        if (post.userId !== user.id) {
          const newNotif: Notification = {
            id: `notif_${Date.now()}`,
            type: "like",
            sender: {
              id: user.id,
              full_name: user.full_name,
              username: user.username,
              avatar_url: user.avatar_url
            },
            content: "liked your post with emotional connection.",
            created_at: new Date().toISOString(),
            read: false
          };
          set({ notifications: [newNotif, ...get().notifications] });
          setStoredData("palrene_notifications", get().notifications);
          
          try {
            supabase.from("notifications").insert([{
              id: newNotif.id,
              user_id: post.userId,
              type: "like",
              sender_id: user.id,
              content: newNotif.content
            }]);
          } catch {}

          // Trigger Email simulation
          get().triggerEmailAlert(
            "New Like on Palrene",
            `${user.full_name} liked your cinematic post: "${post.content.slice(0, 30)}..."`
          );
        }
        return { ...post, likes_count: post.likes_count + 1 };
      }
      return post;
    });

    set({ posts: updatedPosts });
    setStoredData("palrene_posts", updatedPosts);
  },

  repostPost: async (postId) => {
    const user = get().currentUser;
    if (!user) return;

    try {
      await supabase.from("reposts").insert([{ user_id: user.id, post_id: postId }]);
      const p = get().posts.find(pst => pst.id === postId);
      if (p) {
        await supabase.from("posts").update({ reposts_count: (p.reposts_count || 0) + 1 }).eq("id", postId);
      }
    } catch (e) {
      console.warn("Supabase repost insert error", e);
    }

    const updatedPosts = get().posts.map(post => {
      if (post.id === postId) {
        if (post.userId !== user.id) {
          const newNotif: Notification = {
            id: `notif_${Date.now()}`,
            type: "comment",
            sender: {
              id: user.id,
              full_name: user.full_name,
              username: user.username,
              avatar_url: user.avatar_url
            },
            content: "reposted (rewound) your story to their timeline.",
            created_at: new Date().toISOString(),
            read: false
          };
          set({ notifications: [newNotif, ...get().notifications] });
          setStoredData("palrene_notifications", get().notifications);

          try {
            supabase.from("notifications").insert([{
              id: newNotif.id,
              user_id: post.userId,
              type: "comment",
              sender_id: user.id,
              content: newNotif.content
            }]);
          } catch {}
        }
        return { ...post, reposts_count: post.reposts_count + 1 };
      }
      return post;
    });

    set({ posts: updatedPosts });
    setStoredData("palrene_posts", updatedPosts);
  },

  boostPost: (postId) => {
    const user = get().currentUser;
    if (!user) return;

    // Simulate database booster update
    try {
      supabase.from("posts").update({ boosted: true }).eq("id", postId);
    } catch {}

    const updatedPosts = get().posts.map(post => {
      if (post.id === postId) {
        return { ...post, boosted: true, likes_count: post.likes_count + 15 };
      }
      return post;
    });

    set({ posts: updatedPosts });
    setStoredData("palrene_posts", updatedPosts);
  },

  voteInQuiz: (postId, optionIndex) => {
    console.log(`[Store Action] voteInQuiz called for post ${postId}, option ${optionIndex}`);
    
    const updatedPosts = get().posts.map(post => {
      if (post.id === postId && post.quiz) {
        const quiz = post.quiz;
        const optionsLength = quiz.options ? quiz.options.length : 0;
        
        // Ensure votes array exists and has correct length
        let currentVotes = Array.isArray(quiz.votes) ? [...quiz.votes] : [];
        if (currentVotes.length !== optionsLength) {
          currentVotes = new Array(optionsLength).fill(0);
        }

        // Increment the selected option
        currentVotes[optionIndex] = (currentVotes[optionIndex] || 0) + 1;
        
        const updatedQuiz = {
          ...quiz,
          votes: currentVotes,
          voted_index: optionIndex
        };

        // Try to update post quiz in Supabase
        try {
          supabase.from("posts").update({ quiz: updatedQuiz }).eq("id", postId);
        } catch {}

        console.log(`[Store Action] Updated quiz state:`, updatedQuiz);

        return {
          ...post,
          quiz: updatedQuiz
        };
      }
      return post;
    });
    set({ posts: updatedPosts });
    setStoredData("palrene_posts", updatedPosts);
  },

  addComment: async (postId, content) => {
    const user = get().currentUser;
    if (!user) return;

    try {
      await supabase.from("comments").insert([{
        post_id: postId,
        user_id: user.id,
        content: content
      }]);
      const p = get().posts.find(pst => pst.id === postId);
      if (p) {
        await supabase.from("posts").update({ comments_count: (p.comments_count || 0) + 1 }).eq("id", postId);
      }
    } catch (e) {
      console.warn("Supabase comment insert error", e);
    }

    const updatedPosts = get().posts.map(post => {
      if (post.id === postId) {
        if (post.userId !== user.id) {
          const newNotif: Notification = {
            id: `notif_${Date.now()}`,
            type: "comment",
            sender: {
              id: user.id,
              full_name: user.full_name,
              username: user.username,
              avatar_url: user.avatar_url
            },
            content: `commented: "${content.slice(0, 40)}"`,
            created_at: new Date().toISOString(),
            read: false
          };
          set({ notifications: [newNotif, ...get().notifications] });
          setStoredData("palrene_notifications", get().notifications);
          
          try {
            supabase.from("notifications").insert([{
              id: newNotif.id,
              user_id: post.userId,
              type: "comment",
              sender_id: user.id,
              content: newNotif.content
            }]);
          } catch {}

          get().triggerEmailAlert(
            "New Comment on Palrene",
            `${user.full_name} commented on your post: "${content}"`
          );
        }
        return { ...post, comments_count: post.comments_count + 1 };
      }
      return post;
    });

    set({ posts: updatedPosts });
    setStoredData("palrene_posts", updatedPosts);
  },

  // Profile Actions
  toggleFollow: async (profileId) => {
    const user = get().currentUser;
    if (!user) return;

    try {
      await supabase.from("follows").insert([{ follower_id: user.id, following_id: profileId }]);
      
      const u = get().profiles.find(prof => prof.id === user.id);
      const t = get().profiles.find(prof => prof.id === profileId);
      if (u) {
        await supabase.from("profiles").update({ following_count: (u.following_count || 0) + 1 }).eq("id", user.id);
      }
      if (t) {
        await supabase.from("profiles").update({ followers_count: (t.followers_count || 0) + 1 }).eq("id", profileId);
      }
    } catch (e) {
      console.warn("Supabase follow insert error", e);
    }

    let targetProfileName = "";
    const updatedProfiles = get().profiles.map(p => {
      if (p.id === profileId) {
        targetProfileName = p.full_name;
        const currentFollowers = p.followers_count || 0;
        return { ...p, followers_count: currentFollowers + 1 };
      }
      return p;
    });

    const updatedUser = {
      ...user,
      following_count: (user.following_count || 0) + 1
    };

    // Notification
    const newNotif: Notification = {
      id: `notif_${Date.now()}`,
      type: "follow",
      sender: {
        id: user.id,
        full_name: user.full_name,
        username: user.username,
        avatar_url: user.avatar_url
      },
      content: "started following your journey without boundaries.",
      created_at: new Date().toISOString(),
      read: false
    };

    try {
      await supabase.from("notifications").insert([{
        id: newNotif.id,
        user_id: profileId,
        type: "follow",
        sender_id: user.id,
        content: newNotif.content
      }]);
    } catch {}

    set({
      profiles: updatedProfiles,
      currentUser: updatedUser,
      notifications: [newNotif, ...get().notifications]
    });

    setStoredData("palrene_profiles", updatedProfiles);
    setStoredData("palrene_current_user", updatedUser);
    setStoredData("palrene_notifications", get().notifications);

    get().triggerEmailAlert(
      "You have a new Follower! ⚡",
      `${user.full_name} (@${user.username}) is now following you on Palrene.`
    );
  },

  viewProfileCount: (profileId) => {
    try {
      supabase.rpc("increment_profile_views", { profile_id: profileId });
    } catch {}

    const updatedProfiles = get().profiles.map(p => {
      if (p.id === profileId) {
        return { ...p, views_count: (p.views_count || 0) + 1 };
      }
      return p;
    });
    set({ profiles: updatedProfiles });
    setStoredData("palrene_profiles", updatedProfiles);
  },

  updateProfileSettings: async (data) => {
    const user = get().currentUser;
    if (!user) return;

    try {
      await supabase.from("profiles").update({
        full_name: data.full_name,
        username: data.username,
        avatar_url: data.avatar_url,
        banner_url: data.banner_url,
        bio: data.bio,
        location: data.location,
        dob: data.dob,
        gender: data.gender,
        gender_preference: data.gender_preference,
        race: data.race,
        preferred_race: data.preferred_race,
        age_range_min: data.age_range_min,
        age_range_max: data.age_range_max,
        recognition_goals: data.recognition_goals,
        interests: data.interests
      }).eq("id", user.id);
    } catch (e) {
      console.warn("Supabase profiles update error", e);
    }

    const updatedUser = { ...user, ...data };
    const updatedProfiles = get().profiles.map(p => {
      if (p.id === user.id) {
        return { ...p, ...data };
      }
      return p;
    });

    set({
      currentUser: updatedUser,
      profiles: updatedProfiles
    });
    setStoredData("palrene_current_user", updatedUser);
    setStoredData("palrene_profiles", updatedProfiles);
  },

  // Chat Actions
  startConversation: async (profileId) => {
    const conversations = get().conversations;
    const profiles = get().profiles;
    const user = get().currentUser;
    if (!user) return "";
    
    // Check if conversation already exists
    const existing = conversations.find(c => c.participants.some(p => p.id === profileId));
    if (existing) {
      set({ activeConversationId: existing.id, currentView: "messages" });
      return existing.id;
    }

    const recipient = profiles.find(p => p.id === profileId);
    if (!recipient) return "";

    const newConvId = `conv_${Date.now()}`;
    const newConv: Conversation = {
      id: newConvId,
      participants: [
        {
          id: recipient.id,
          full_name: recipient.full_name,
          username: recipient.username,
          avatar_url: recipient.avatar_url,
          is_verified: recipient.is_verified,
          is_active: recipient.is_active
        }
      ],
      last_message: "Conversating has begun.",
      last_message_at: new Date().toISOString(),
      unread_count: 0
    };

    try {
      await supabase.from("conversations").insert([{
        id: newConvId,
        participants: [user.id, recipient.id],
        last_message: "Conversating has begun.",
        last_message_at: newConv.last_message_at
      }]);
    } catch (e) {
      console.warn("Supabase conversation insert error", e);
    }

    set({
      conversations: [newConv, ...conversations],
      activeConversationId: newConvId,
      currentView: "messages"
    });
    setStoredData("palrene_conversations", [newConv, ...conversations]);
    return newConvId;
  },

  sendMessage: async (conversationId, content, mediaUrl, giphyUrl) => {
    const user = get().currentUser;
    if (!user) return;

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      conversation_id: conversationId,
      sender_id: user.id,
      content,
      created_at: new Date().toISOString(),
      media_url: mediaUrl,
      giphy_url: giphyUrl
    };

    try {
      await supabase.from("messages").insert([{
        id: newMsg.id,
        conversation_id: conversationId,
        sender_id: user.id,
        content: newMsg.content,
        media_url: newMsg.media_url,
        giphy_url: newMsg.giphy_url,
        is_ai: false
      }]);
      
      await supabase.from("conversations").update({
        last_message: content || "Shared attachment",
        last_message_at: newMsg.created_at
      }).eq("id", conversationId);
    } catch (e) {
      console.warn("Supabase message insert error", e);
    }

    const updatedMessages = [...get().messages, newMsg];
    
    // Update last message in Conversation
    const updatedConversations = get().conversations.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          last_message: content || "Shared attachment",
          last_message_at: new Date().toISOString()
        };
      }
      return conv;
    });

    set({
      messages: updatedMessages,
      conversations: updatedConversations
    });
    setStoredData("palrene_messages", updatedMessages);
    setStoredData("palrene_conversations", updatedConversations);

    // Active conversation
    const activeConv = get().conversations.find(c => c.id === conversationId);
    if (!activeConv) return;
    
    const recipient = activeConv.participants[0];

    // If recipient is Poly-AI assistant, fetch response server-side!
    if (recipient && recipient.id === "poly-ai") {
      try {
        // Fetch matching chat history
        const relevantHistory = get().messages
          .filter(m => m.conversation_id === conversationId)
          .slice(-8)
          .map(m => ({
            role: m.sender_id === "poly-ai" ? "assistant" : "user",
            content: m.content
          }));

        const res = await fetch("/api/poly/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content,
            history: relevantHistory
          })
        });
        const data = await res.json();
        
        if (data.reply) {
          const aiMsg: Message = {
            id: `msg_ai_${Date.now()}`,
            conversation_id: conversationId,
            sender_id: "poly-ai",
            content: data.reply,
            created_at: new Date().toISOString(),
            is_ai: true
          };

          try {
            await supabase.from("messages").insert([{
              id: aiMsg.id,
              conversation_id: conversationId,
              sender_id: "poly-ai",
              content: aiMsg.content,
              is_ai: true
            }]);
          } catch {}

          const doubleUpdatedMessages = [...get().messages, aiMsg];
          const doubleUpdatedConversations = get().conversations.map(c => {
            if (c.id === conversationId) {
              return {
                ...c,
                last_message: data.reply,
                last_message_at: new Date().toISOString()
              };
            }
            return c;
          });

          set({
            messages: doubleUpdatedMessages,
            conversations: doubleUpdatedConversations
          });
          setStoredData("palrene_messages", doubleUpdatedMessages);
          setStoredData("palrene_conversations", doubleUpdatedConversations);
        }
      } catch (err) {
        console.error("Poly AI error", err);
        // Empathetic hardcoded fallback if server is offline
        const fallbackMsg: Message = {
          id: `msg_ai_${Date.now()}`,
          conversation_id: conversationId,
          sender_id: "poly-ai",
          content: "I feel your frequency deeply, but my core socket experienced a miniature solar flare. Let's breathe, and tell me more about what is on your heart.",
          created_at: new Date().toISOString(),
          is_ai: true
        };
        const doubleUpdatedMessages = [...get().messages, fallbackMsg];
        set({ messages: doubleUpdatedMessages });
        setStoredData("palrene_messages", doubleUpdatedMessages);
      }
    } else {
      // Send an simulated email/notification to real user about new message
      get().triggerEmailAlert(
        "New Private Message on Palrene",
        `You've received a secure message from ${user.full_name}: "${content.slice(0, 50)}..."`
      );
    }
  },

  setActiveConversation: (activeConversationId) => set({ activeConversationId }),

  // Group Actions
  joinGroup: async (groupId) => {
    try {
      const g = get().groups.find(group => group.id === groupId);
      if (g) {
        await supabase.from("groups").update({ members_count: (g.members_count || 1) + 1 }).eq("id", groupId);
      }
    } catch (e) {
      console.warn("Supabase joinGroup update error", e);
    }

    const updatedGroups = get().groups.map(group => {
      if (group.id === groupId) {
        return { ...group, members_count: group.members_count + 1 };
      }
      return group;
    });
    set({ groups: updatedGroups });
    setStoredData("palrene_groups", updatedGroups);
  },

  createGroup: async (name, description, category, avatarUrl, isPrivate) => {
    const user = get().currentUser;
    if (!user) return;

    const newGroup: Group = {
      id: `group_${Date.now()}`,
      name,
      description,
      category,
      avatar_url: avatarUrl || "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=150&auto=format&fit=crop&q=80",
      banner_url: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&auto=format&fit=crop&q=80",
      members_count: 1,
      posts_count: 0,
      created_by: user.id,
      created_at: new Date().toISOString(),
      is_private: isPrivate
    };

    try {
      await supabase.from("groups").insert([{
        id: newGroup.id,
        name,
        description,
        category,
        avatar_url: newGroup.avatar_url,
        banner_url: newGroup.banner_url,
        members_count: 1,
        posts_count: 0,
        created_by: user.id,
        is_private: isPrivate
      }]);
    } catch (e) {
      console.warn("Supabase group insert error", e);
    }

    const updatedGroups = [...get().groups, newGroup];
    set({ groups: updatedGroups });
    setStoredData("palrene_groups", updatedGroups);
  },

  // Admin & Verification flow
  submitVerification: async (videoUrl, docFront, docBack) => {
    const user = get().currentUser;
    if (!user) return;

    const updatedUser = {
      ...user,
      bio: `${user.bio || ''} (Verification Pending)`,
      verification_video_url: videoUrl,
      verification_doc_front_url: docFront,
      verification_doc_back_url: docBack
    };

    try {
      await supabase.from("profiles").update({
        bio: updatedUser.bio,
        verification_video_url: videoUrl,
        verification_doc_front_url: docFront,
        verification_doc_back_url: docBack
      }).eq("id", user.id);
    } catch (e) {
      console.warn("Supabase verif submit update profile error", e);
    }

    const updatedProfiles = get().profiles.map(p => {
      if (p.id === user.id) {
        return { 
          ...p, 
          bio: `${p.bio || ''} (Verification Pending)`,
          verification_video_url: videoUrl,
          verification_doc_front_url: docFront,
          verification_doc_back_url: docBack
        };
      }
      return p;
    });

    const verifyNotif: Notification = {
      id: `verify_${Date.now()}`,
      type: "verification",
      content: "Your 30-second verification video and documentation has been received. Admin is manually reviewing.",
      created_at: new Date().toISOString(),
      read: false
    };

    try {
      await supabase.from("notifications").insert([{
        id: verifyNotif.id,
        user_id: user.id,
        type: "verification",
        content: verifyNotif.content
      }]);
    } catch {}

    set({
      currentUser: updatedUser,
      profiles: updatedProfiles,
      notifications: [verifyNotif, ...get().notifications]
    });
    setStoredData("palrene_current_user", updatedUser);
    setStoredData("palrene_profiles", updatedProfiles);
    setStoredData("palrene_notifications", get().notifications);

    get().triggerEmailAlert(
      "Palrene Verification Request Received",
      "We have safely received your verification logs (30s video, ID document). Verification usually wraps up within 24 hours."
    );
  },

  submitAd: async (title, description, linkUrl, imageUrl) => {
    const user = get().currentUser;
    if (!user) return;

    const newAd: Ad = {
      id: `ad_${Date.now()}`,
      title,
      description,
      link_url: linkUrl,
      image_url: imageUrl || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&auto=format&fit=crop&q=80",
      status: "pending",
      created_by: user.id,
      created_at: new Date().toISOString()
    };

    try {
      await supabase.from("ads").insert([{
        id: newAd.id,
        title,
        description,
        link_url: linkUrl,
        image_url: newAd.image_url,
        status: "pending",
        created_by: user.id
      }]);
    } catch (e) {
      console.warn("Supabase ad insert error", e);
    }

    const updatedAds = [newAd, ...get().ads];
    set({ ads: updatedAds });
    setStoredData("palrene_ads", updatedAds);

    get().triggerEmailAlert("Ad Submitted for Review", `Your ad campaign "${title}" is pending. Admin will approve soon.`);
  },

  approveAd: async (adId) => {
    try {
      await supabase.from("ads").update({ status: "approved" }).eq("id", adId);
    } catch (e) {
      console.warn("Supabase ad approve error", e);
    }

    const updatedAds = get().ads.map(ad => {
      if (ad.id === adId) {
        get().triggerEmailAlert("Ad Approved! 🚀", `Your Palrene ad campaign "${ad.title}" has been reviewed and approved.`);
        return { ...ad, status: "approved" as const };
      }
      return ad;
    });
    set({ ads: updatedAds });
    setStoredData("palrene_ads", updatedAds);
  },

  rejectAd: async (adId) => {
    try {
      await supabase.from("ads").update({ status: "rejected" }).eq("id", adId);
    } catch (e) {
      console.warn("Supabase ad reject error", e);
    }

    const updatedAds = get().ads.map(ad => {
      if (ad.id === adId) {
        get().triggerEmailAlert("Ad Rejected", `Your Palrene ad campaign "${ad.title}" did not match creative policies direction.`);
        return { ...ad, status: "rejected" as const };
      }
      return ad;
    });
    set({ ads: updatedAds });
    setStoredData("palrene_ads", updatedAds);
  },

  approveVerification: async (profileId) => {
    try {
      const targetUser = get().profiles.find(p => p.id === profileId);
      const cleanedBio = targetUser?.bio?.replace(" (Verification Pending)", "") || "";
      await supabase.from("profiles").update({ is_verified: true, bio: cleanedBio }).eq("id", profileId);
    } catch (e) {
      console.warn("Supabase approve verification error", e);
    }

    const updatedProfiles = get().profiles.map(p => {
      if (p.id === profileId) {
        return { ...p, is_verified: true, bio: p.bio?.replace(" (Verification Pending)", "") };
      }
      return p;
    });
    set({ profiles: updatedProfiles });
    setStoredData("palrene_profiles", updatedProfiles);

    const match = updatedProfiles.find(p => p.id === profileId);
    if (match) {
      get().triggerEmailAlert(
        "Verification Successful! ✨",
        `Congratulations ${match.full_name}, your official verification badge is now active. Your profile lists with high-prestige credibility.`
      );
    }
  },

  rejectVerification: async (profileId) => {
    try {
      const targetUser = get().profiles.find(p => p.id === profileId);
      const cleanedBio = targetUser?.bio?.replace(" (Verification Pending)", "") || "";
      await supabase.from("profiles").update({ is_verified: false, bio: cleanedBio }).eq("id", profileId);
    } catch (e) {
      console.warn("Supabase reject verification error", e);
    }

    const updatedProfiles = get().profiles.map(p => {
      if (p.id === profileId) {
        return { ...p, is_verified: false, bio: p.bio?.replace(" (Verification Pending)", "") };
      }
      return p;
    });
    set({ profiles: updatedProfiles });
    setStoredData("palrene_profiles", updatedProfiles);
  },

  moderatePost: async (postId, action) => {
    try {
      if (action === "delete") {
        await supabase.from("posts").delete().eq("id", postId);
      } else {
        await supabase.from("posts").update({ is_sensitive: false }).eq("id", postId);
      }
    } catch (e) {
      console.warn("Supabase moderatePost error", e);
    }

    const currentPosts = get().posts;
    let updatedPosts;
    if (action === "delete") {
      updatedPosts = currentPosts.filter(p => p.id !== postId);
    } else {
      updatedPosts = currentPosts.map(p => {
        if (p.id === postId) {
          return { ...p, is_sensitive: false };
        }
        return p;
      });
    }
    set({ posts: updatedPosts });
    setStoredData("palrene_posts", updatedPosts);
  },

  banUser: async (profileId) => {
    try {
      await supabase.from("profiles").update({ is_active: false }).eq("id", profileId);
    } catch (e) {
      console.warn("Supabase banUser error", e);
    }

    const updatedProfiles = get().profiles.filter(p => p.id !== profileId);
    set({ profiles: updatedProfiles });
    setStoredData("palrene_profiles", updatedProfiles);
  },

  makeAdmin: async (profileId) => {
    try {
      await supabase.from("profiles").update({ is_admin: true }).eq("id", profileId);
    } catch (e) {
      console.warn("Supabase makeAdmin error", e);
    }

    const updatedProfiles = get().profiles.map(p => {
      if (p.id === profileId) return { ...p, is_admin: true };
      return p;
    });
    set({ profiles: updatedProfiles });
    setStoredData("palrene_profiles", updatedProfiles);
  },

  setSubscriptionTier: async (tier) => {
    const user = get().currentUser;
    if (!user) return;

    try {
      await supabase.from("profiles").update({ subscription_tier: tier }).eq("id", user.id);
    } catch (e) {
      console.warn("Supabase setSubscriptionTier error", e);
    }

    const updatedUser = { ...user, subscription_tier: tier };
    const updatedProfiles = get().profiles.map(p => {
      if (p.id === user.id) return { ...p, subscription_tier: tier };
      return p;
    });
    set({ currentUser: updatedUser, profiles: updatedProfiles });
    setStoredData("palrene_current_user", updatedUser);
    setStoredData("palrene_profiles", updatedProfiles);

    get().triggerEmailAlert(
      "Subscription Wave Aligned! 💳",
      `Your account has been successfully upgraded to the "${tier}" billing plan. Intimacy boundaries resolved.`
    );
  },

  addPaymentTransaction: async (tx) => {
    try {
      await supabase.from("payments").insert([{
        id: tx.id,
        user_id: tx.userId,
        user_name: tx.userName,
        plan: tx.plan,
        amount: tx.amount,
        status: tx.status,
        provider: tx.provider
      }]);
    } catch (e) {
      console.warn("Supabase addPaymentTransaction error", e);
    }

    const updatedPayments = [tx, ...get().payments];
    set({ payments: updatedPayments });
    setStoredData("palrene_payments", updatedPayments);
  },

  refundPaymentTransaction: async (txId) => {
    try {
      await supabase.from("payments").update({ status: "refunded" }).eq("id", txId);
      
      const tx = get().payments.find(p => p.id === txId);
      if (tx) {
        await supabase.from("profiles").update({ subscription_tier: "Free" }).eq("id", tx.userId);
      }
    } catch (e) {
      console.warn("Supabase refundPaymentTransaction error", e);
    }

    const updatedPayments = get().payments.map(tx => {
      if (tx.id === txId) {
        const updatedProfiles = get().profiles.map(p => {
          if (p.id === tx.userId) {
            get().triggerEmailAlert(
              "Subscription Refunded/Downgraded 💸",
              `Hello ${p.full_name}, your billing transaction for the ${tx.plan} Plan has been refunded. Your subscription has been set back to Free.`
            );
            return { ...p, subscription_tier: 'Free' as const };
          }
          return p;
        });

        const currUser = get().currentUser;
        let updatedUser = currUser;
        if (currUser && currUser.id === tx.userId) {
          updatedUser = { ...currUser, subscription_tier: 'Free' as const };
          setStoredData("palrene_current_user", updatedUser);
        }

        set({ profiles: updatedProfiles, currentUser: updatedUser });
        setStoredData("palrene_profiles", updatedProfiles);

        return { ...tx, status: 'refunded' as const };
      }
      return tx;
    });
    set({ payments: updatedPayments });
    setStoredData("palrene_payments", updatedPayments);
  },

  disableSubscription: async (userId) => {
    try {
      await supabase.from("profiles").update({ subscription_tier: "Free" }).eq("id", userId);
    } catch (e) {
      console.warn("Supabase disableSubscription error", e);
    }

    const updatedProfiles = get().profiles.map(p => {
      if (p.id === userId) {
        get().triggerEmailAlert(
          "Subscription Flagged & Paused 🚫",
          `Hello ${p.full_name}, your active subscription has been flagged as fraudulent by our ledger compliance review and has been disabled.`
        );
        return { ...p, subscription_tier: 'Free' as const };
      }
      return p;
    });

    const currUser = get().currentUser;
    let updatedUser = currUser;
    if (currUser && currUser.id === userId) {
      updatedUser = { ...currUser, subscription_tier: 'Free' as const };
      setStoredData("palrene_current_user", updatedUser);
    }

    set({ profiles: updatedProfiles, currentUser: updatedUser });
    setStoredData("palrene_profiles", updatedProfiles);
  },

  // Email System Simulation
  triggerEmailAlert: (subject, body) => {
    console.log(`%c[SIMULATED EMAIL SENT]\nSubject: ${subject}\nBody: ${body}`, "background: #f43f5e; color: white; padding: 6px; border-radius: 4px;");
    // Show email alert modal or trigger toast in frontend!
    const newNotif: Notification = {
      id: `email_notif_${Date.now()}`,
      type: "verification",
      content: `📬 [Simulated Email]: ${subject}`,
      created_at: new Date().toISOString(),
      read: false
    };
    set({ notifications: [newNotif, ...get().notifications] });
    setStoredData("palrene_notifications", get().notifications);
  },

  deleteNotification: (id) => {
    const remaining = get().notifications.filter(notif => notif.id !== id);
    set({ notifications: remaining });
    setStoredData("palrene_notifications", remaining);
  }
}));
