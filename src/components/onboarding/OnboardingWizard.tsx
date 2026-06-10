import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, ArrowLeft, Check, Sparkles, User, AtSign, Camera, MapPin, Briefcase, Heart, Link, Target, PartyPopper, RefreshCw, X, Github, Globe, Loader, TriangleAlert as AlertTriangle } from "lucide-react";
import { supabase } from "../../lib/supabase";
import {
  getOnboardingProfile,
  ensureOnboardingProfile,
  upsertOnboardingProfile,
  updateOnboardingStep,
  completeOnboarding,
  checkUsernameAvailable,
  generateUsernameFromName,
  isOnboardingComplete,
  getOnboardingStep,
  OnboardingProfile,
} from "../../lib/onboarding";
import { useStore } from "../../store";

const TOTAL_STEPS = 8;

const ALL_INTERESTS = [
  "relationships", "music", "science", "travel", "nature", "foods",
  "gaming", "spirituality", "entrepreneurship", "memes", "photography",
  "art", "fitness", "reading", "cooking", "hiking", "yoga", "meditation",
  "movies", "technology", "fashion", "sports", "politics", "philosophy",
  "history", "writing", "dancing", "volunteering", "pets", "astronomy",
];

const ALL_SKILLS = [
  "Communication", "Leadership", "Empathy", "Problem Solving", "Creativity",
  "Writing", "Design", "Coding", "Marketing", "Data Analysis", "Teaching",
  "Photography", "Music", "Video Production", "Public Speaking", "Research",
  "Project Management", "Sales", "Finance", "Coaching",
];

const GOALS = [
  { id: "friendship", label: "Friendship", icon: "🤝" },
  { id: "long-term relationship", label: "Long-term Relationship", icon: "💞" },
  { id: "mentorship", label: "Mentorship", icon: "🎓" },
  { id: "emotional support", label: "Emotional Support", icon: "🫂" },
  { id: "networking", label: "Networking", icon: "🌐" },
  { id: "communities", label: "Communities", icon: "👥" },
  { id: "guidance", label: "Guidance", icon: "🧭" },
  { id: "casual connection", label: "Casual Connection", icon: "✨" },
];

function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = Math.round(((step - 1) / (total - 1)) * 100);
  return (
    <div className="w-full space-y-1.5">
      <div className="flex justify-between text-[10px] font-mono text-white/40">
        <span>Step {step} of {total}</span>
        <span>{pct}% complete</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function StepMotion({ children, dir = 1 }: { children: React.ReactNode; dir?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: dir * 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -dir * 40 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}

function MicroCopy({ step }: { step: number }) {
  const copies: Record<number, { title: string; sub: string }> = {
    1: { title: "Welcome to Palrene!", sub: "Let's build your profile — it takes under 2 minutes." },
    2: { title: "Choose your username", sub: "Your unique handle. Make it memorable." },
    3: { title: "Add a profile photo", sub: "Profiles with photos get 10x more connections." },
    4: { title: "Tell your story", sub: "A great bio attracts your kind of people." },
    5: { title: "What are you into?", sub: "Select interests to personalize your experience." },
    6: { title: "Connect your links", sub: "Optional — show your world beyond Palrene." },
    7: { title: "What brings you here?", sub: "Help us match you with the right people." },
    8: { title: "You're all set!", sub: "Welcome to a world of meaningful connections." },
  };
  const c = copies[step] || copies[1];
  return (
    <div className="text-center space-y-1 mb-6">
      <h2 className="text-xl font-serif font-bold text-white">{c.title}</h2>
      <p className="text-sm text-white/50">{c.sub}</p>
    </div>
  );
}

interface OnboardingWizardProps {
  onComplete: () => void;
}

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const { setCurrentUser } = useStore();
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [saving, setSaving] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Step 1 — welcome (from OAuth provider)
  const [oauthName, setOauthName] = useState("");
  const [oauthAvatar, setOauthAvatar] = useState("");

  // Step 2 — username
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const usernameTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Step 3 — avatar
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Step 4 — about
  const [bio, setBio] = useState("");
  const [profession, setProfession] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");

  // Step 5 — interests
  const [interests, setInterests] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [interestSearch, setInterestSearch] = useState("");

  // Step 6 — social links
  const [github, setGithub] = useState("");
  const [twitter, setTwitter] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [website, setWebsite] = useState("");

  // Step 7 — goals
  const [goals, setGoals] = useState<string[]>([]);

  const [error, setError] = useState("");

  // Load initial user data and resume from saved step
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setInitialLoading(false); return; }
      setUserId(user.id);

      const name = user.user_metadata?.full_name || user.user_metadata?.name || "";
      const avatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || "";
      const ghUsername = user.user_metadata?.user_name || user.user_metadata?.preferred_username || "";

      setOauthName(name);
      setOauthAvatar(avatar);
      setDisplayName(name);
      setAvatarUrl(avatar);
      setAvatarPreview(avatar);
      if (ghUsername) setGithub(ghUsername);
      setUsernameSuggestions(generateUsernameFromName(name || "palrene_user"));

      // Fetch or create profile — ensures we always have a DB record
      let profile = await ensureOnboardingProfile(user.id);

      if (!profile) {
        // Could not create profile — show error with retry
        setLoadError("Could not load your profile. Please check your connection and try again.");
        setInitialLoading(false);
        return;
      }

      // If profile is already complete, skip wizard
      if (isOnboardingComplete(profile)) {
        onComplete();
        return;
      }

      // Resume from saved step
      const savedStep = getOnboardingStep(profile);
      if (savedStep > 1) {
        setStep(savedStep);
        setDir(1);
      }

      // Restore all saved data
      if (profile.username) setUsername(profile.username);
      if (profile.full_name) setDisplayName(profile.full_name);
      if (profile.avatar_url && !profile.avatar_url.startsWith("blob:")) {
        setAvatarUrl(profile.avatar_url);
        setAvatarPreview(profile.avatar_url);
      }
      if (profile.bio) setBio(profile.bio);
      if (profile.profession) setProfession(profile.profession);
      if (profile.company) setCompany(profile.company);
      if (profile.location) setLocation(profile.location);
      if (profile.interests?.length) setInterests(profile.interests);
      if (profile.skills?.length) setSkills(profile.skills);
      if (profile.recognition_goals?.length) setGoals(profile.recognition_goals);
      if (profile.social_links) {
        const sl = profile.social_links as any;
        if (sl.github) setGithub(sl.github);
        if (sl.twitter) setTwitter(sl.twitter);
        if (sl.linkedin) setLinkedin(sl.linkedin);
        if (sl.website) setWebsite(sl.website);
      }

      setLoadError(null);
      setInitialLoading(false);
    }
    load();
  }, []);

  // Username check with timeout — won't block indefinitely
  useEffect(() => {
    if (!username || username.length < 3) { setUsernameStatus("idle"); return; }
    setUsernameStatus("checking");
    clearTimeout(usernameTimeout.current);
    usernameTimeout.current = setTimeout(async () => {
      const available = await checkUsernameAvailable(username);
      // Only update if username hasn't changed since we started checking
      setUsernameStatus(available ? "available" : "taken");
    }, 500);

    // Safety timeout: if check takes more than 5s, allow proceed
    const safetyTimeout = setTimeout(() => {
      setUsernameStatus((prev) => prev === "checking" ? "available" : prev);
    }, 5000);

    return () => clearTimeout(safetyTimeout);
  }, [username]);

  const handleAvatarFile = async (file: File) => {
    if (!userId) return;
    setAvatarUploading(true);

    // Show local preview immediately for responsiveness
    const localPreview = URL.createObjectURL(file);
    setAvatarPreview(localPreview);

    try {
      const ext = file.name.split(".").pop();
      const path = `avatars/${userId}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { uperset: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      // Only set the persistent URL — never blob: URLs
      setAvatarUrl(data.publicUrl);
      setAvatarPreview(data.publicUrl);
    } catch {
      // Upload failed — keep the OAuth/default avatar, don't save blob URL
      // User can proceed without custom avatar and add one later
      setAvatarUrl(oauthAvatar || "");
      setAvatarPreview(oauthAvatar || localPreview);
    } finally {
      setAvatarUploading(false);
    }
  };

  const saveStep = async (nextStep: number, extraData: Partial<OnboardingProfile> = {}) => {
    if (!userId) return;
    setSaving(true);
    await updateOnboardingStep(userId, nextStep, extraData);
    setSaving(false);
  };

  const goNext = async () => {
    setError("");
    if (!userId) return;

    if (step === 2) {
      if (!username || username.length < 3) { setError("Username must be at least 3 characters."); return; }
      if (!/^[a-z0-9_]+$/.test(username)) { setError("Username can only contain lowercase letters, numbers, and underscores."); return; }
      if (usernameStatus === "taken") { setError("That username is taken. Please choose another."); return; }
      if (usernameStatus === "checking") { setError("Please wait for username check."); return; }
    }

    if (step === 5 && interests.length < 3) {
      setError("Please select at least 3 interests.");
      return;
    }

    if (step === 7 && goals.length < 1) {
      setError("Please select at least one goal.");
      return;
    }

    const stepDataMap: Record<number, Partial<OnboardingProfile>> = {
      1: { full_name: displayName, avatar_url: oauthAvatar },
      2: { username: username.toLowerCase(), full_name: displayName },
      3: { avatar_url: avatarUrl },
      4: { bio, profession, company, location },
      5: { interests, skills },
      6: { social_links: { github, twitter, linkedin, website }, website },
      7: { recognition_goals: goals },
    };

    const dataToSave = stepDataMap[step] || {};
    const nextS = step + 1;

    // CRITICAL: Save to DB BEFORE updating local step state
    // This ensures progress is persisted even if browser closes mid-save
    setSaving(true);
    const saved = await updateOnboardingStep(userId, nextS, dataToSave);
    setSaving(false);

    if (!saved) {
      // Save failed — still advance UI but warn user
      setError("Could not save your progress. Check your connection — your data will be saved on the next step.");
    }

    setDir(1);
    setStep(nextS);
  };

  const goBack = () => {
    if (step <= 1) return;
    setError("");
    setDir(-1);
    setStep(s => s - 1);
  };

  const handleComplete = async () => {
    if (!userId) return;
    setSaving(true);
    setError("");

    // Never save blob: URLs to the DB
    const safeAvatarUrl = avatarUrl.startsWith("blob:") ? (oauthAvatar || "") : avatarUrl;

    const finalData: Partial<OnboardingProfile> = {
      username: username.toLowerCase(),
      full_name: displayName,
      avatar_url: safeAvatarUrl,
      bio,
      profession,
      company,
      location,
      interests,
      skills,
      recognition_goals: goals,
      social_links: { github, twitter, linkedin, website },
      website,
      token_balance: 100,
    };

    const success = await completeOnboarding(userId, finalData);
    if (success) {
      // Sync into store immediately
      setCurrentUser({
        id: userId,
        email: "",
        full_name: displayName,
        username: username.toLowerCase(),
        avatar_url: safeAvatarUrl,
        bio,
        location,
        interests,
        recognition_goals: goals,
        token_balance: 100,
        subscription_tier: "Free",
      });
      // Call onComplete immediately — no setTimeout delay
      onComplete();
    } else {
      setError("Failed to save profile. Please check your connection and try again.");
    }
    setSaving(false);
  };

  const filteredInterests = ALL_INTERESTS.filter(i =>
    !interestSearch || i.toLowerCase().includes(interestSearch.toLowerCase())
  );

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
            <span className="font-serif text-xl font-bold text-white italic">P</span>
            <div className="absolute inset-0 rounded-xl border-2 border-orange-400/60 animate-ping" />
          </div>
          <p className="text-sm font-mono text-white/40 animate-pulse">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Show error state with retry if initial load failed
  if (loadError) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-6 max-w-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertTriangle size={32} className="text-red-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Something went wrong</h2>
            <p className="text-sm text-white/50 mt-2">{loadError}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-xl hover:from-red-600 hover:to-orange-600 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute w-96 h-96 rounded-full bg-red-500/8 blur-3xl"
          animate={{ x: [-40, 40, -40], y: [-30, 30, -30] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: "10%", left: "-5%" }}
        />
        <motion.div
          className="absolute w-80 h-80 rounded-full bg-orange-500/8 blur-3xl"
          animate={{ x: [30, -30, 30], y: [20, -20, 20] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          style={{ bottom: "10%", right: "-5%" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg shadow-orange-500/30">
            <span className="font-serif text-base font-bold text-white italic">P</span>
          </div>
          <span className="text-lg font-serif font-bold text-white">Palrene</span>
        </div>

        <ProgressBar step={step} total={TOTAL_STEPS} />

        <div className="mt-8 bg-zinc-900/60 border border-white/8 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 flex items-center gap-2"
            >
              <X size={14} className="shrink-0" />
              {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {/* STEP 1: Welcome */}
            {step === 1 && (
              <StepMotion key="step1" dir={dir}>
                <MicroCopy step={1} />
                <div className="flex flex-col items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-orange-500/20 to-red-500/20 border-2 border-orange-500/30">
                      {oauthAvatar ? (
                        <img src={oauthAvatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User size={36} className="text-orange-400/60" />
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center border-2 border-zinc-900">
                      <Sparkles size={12} className="text-white fill-current" />
                    </div>
                  </div>

                  {oauthName ? (
                    <div className="text-center">
                      <p className="text-lg font-bold text-white">Hi, {oauthName.split(" ")[0]}!</p>
                      <p className="text-sm text-white/50 mt-1">
                        Welcome to Palrene. Let's set up your profile so the right people can find you.
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-white/50 text-center">
                      Welcome to Palrene. Let's set up your profile so the right people can find you.
                    </p>
                  )}

                  <div className="grid grid-cols-3 gap-3 w-full text-center">
                    {[
                      { label: "Step 1", sub: "Basic info" },
                      { label: "Step 4", sub: "Your story" },
                      { label: "Step 8", sub: "Done!" },
                    ].map(item => (
                      <div key={item.label} className="p-3 bg-white/5 rounded-xl border border-white/8">
                        <p className="text-xs font-bold text-orange-400">{item.label}</p>
                        <p className="text-[10px] text-white/40 mt-0.5">{item.sub}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </StepMotion>
            )}

            {/* STEP 2: Username */}
            {step === 2 && (
              <StepMotion key="step2" dir={dir}>
                <MicroCopy step={2} />
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Display Name</label>
                    <div className="relative">
                      <User size={15} className="absolute left-3.5 top-3.5 text-white/30" />
                      <input
                        type="text"
                        value={displayName}
                        onChange={e => setDisplayName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full py-3 pl-10 pr-4 text-sm text-white bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-orange-500/50 transition placeholder-white/25"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Username</label>
                    <div className="relative">
                      <AtSign size={15} className="absolute left-3.5 top-3.5 text-white/30" />
                      <input
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                        placeholder="your_unique_handle"
                        maxLength={30}
                        className={`w-full py-3 pl-10 pr-10 text-sm text-white bg-white/5 border rounded-xl focus:outline-none transition placeholder-white/25 ${
                          usernameStatus === "available" ? "border-green-500/50 focus:border-green-500/80" :
                          usernameStatus === "taken" ? "border-red-500/50 focus:border-red-500/80" :
                          "border-white/10 focus:border-orange-500/50"
                        }`}
                      />
                      <div className="absolute right-3 top-3">
                        {usernameStatus === "checking" && <Loader size={14} className="animate-spin text-white/40" />}
                        {usernameStatus === "available" && <Check size={14} className="text-green-400" />}
                        {usernameStatus === "taken" && <X size={14} className="text-red-400" />}
                      </div>
                    </div>

                    {usernameStatus === "taken" && (
                      <p className="text-[11px] text-red-400">Username taken. Try one of these:</p>
                    )}

                    {(usernameStatus === "taken" || usernameSuggestions.length > 0) && (
                      <div className="flex flex-wrap gap-1.5">
                        {usernameSuggestions.map(s => (
                          <button
                            key={s}
                            onClick={() => setUsername(s)}
                            className="px-2.5 py-1 text-[10px] font-mono bg-orange-500/10 border border-orange-500/20 text-orange-300 rounded-lg hover:bg-orange-500/20 transition"
                          >
                            @{s}
                          </button>
                        ))}
                      </div>
                    )}

                    {usernameStatus === "available" && (
                      <p className="text-[11px] text-green-400 flex items-center gap-1">
                        <Check size={10} /> @{username} is available!
                      </p>
                    )}
                  </div>
                </div>
              </StepMotion>
            )}

            {/* STEP 3: Avatar */}
            {step === 3 && (
              <StepMotion key="step3" dir={dir}>
                <MicroCopy step={3} />
                <div className="flex flex-col items-center gap-5">
                  <div className="relative group">
                    <div className="w-28 h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-orange-500/20 to-red-500/20 border-2 border-white/10">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User size={40} className="text-white/20" />
                        </div>
                      )}
                    </div>
                    {avatarUploading && (
                      <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center">
                        <Loader size={20} className="animate-spin text-orange-400" />
                      </div>
                    )}
                  </div>

                  <label className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed border-white/15 rounded-2xl cursor-pointer hover:border-orange-500/40 hover:bg-orange-500/5 transition group">
                    <Camera size={22} className="text-white/30 group-hover:text-orange-400 transition mb-2" />
                    <span className="text-sm text-white/50 group-hover:text-white/70 transition">Upload photo</span>
                    <span className="text-[10px] text-white/25 mt-0.5">PNG, JPG, GIF up to 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleAvatarFile(f); }}
                    />
                  </label>

                  {oauthAvatar && oauthAvatar !== avatarUrl && (
                    <button
                      onClick={() => { setAvatarUrl(oauthAvatar); setAvatarPreview(oauthAvatar); }}
                      className="text-[11px] font-mono text-orange-400 hover:text-orange-300 transition"
                    >
                      Use photo from Google/GitHub instead
                    </button>
                  )}

                  <p className="text-[10px] text-white/30 text-center">
                    You can skip this and add a photo later.
                  </p>
                </div>
              </StepMotion>
            )}

            {/* STEP 4: About */}
            {step === 4 && (
              <StepMotion key="step4" dir={dir}>
                <MicroCopy step={4} />
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Bio</label>
                    <textarea
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      placeholder="What makes you, you? What are you looking for?"
                      maxLength={200}
                      className="w-full h-20 p-3 text-sm text-white bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-orange-500/50 transition placeholder-white/25 resize-none"
                    />
                    <p className="text-right text-[10px] text-white/25">{bio.length}/200</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Profession</label>
                      <div className="relative">
                        <Briefcase size={13} className="absolute left-3 top-3.5 text-white/30" />
                        <input
                          value={profession}
                          onChange={e => setProfession(e.target.value)}
                          placeholder="e.g. Designer"
                          className="w-full py-2.5 pl-9 pr-3 text-sm text-white bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-orange-500/50 transition placeholder-white/25"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Company</label>
                      <input
                        value={company}
                        onChange={e => setCompany(e.target.value)}
                        placeholder="e.g. Acme Inc."
                        className="w-full py-2.5 px-3 text-sm text-white bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-orange-500/50 transition placeholder-white/25"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Location</label>
                    <div className="relative">
                      <MapPin size={13} className="absolute left-3 top-3.5 text-white/30" />
                      <input
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        placeholder="e.g. Nairobi, Kenya"
                        className="w-full py-2.5 pl-9 pr-3 text-sm text-white bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-orange-500/50 transition placeholder-white/25"
                      />
                    </div>
                  </div>
                </div>
              </StepMotion>
            )}

            {/* STEP 5: Interests */}
            {step === 5 && (
              <StepMotion key="step5" dir={dir}>
                <MicroCopy step={5} />
                <div className="space-y-4">
                  <input
                    value={interestSearch}
                    onChange={e => setInterestSearch(e.target.value)}
                    placeholder="Search interests..."
                    className="w-full py-2.5 px-4 text-sm text-white bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-orange-500/50 transition placeholder-white/25"
                  />

                  <div className="max-h-36 overflow-y-auto">
                    <div className="flex flex-wrap gap-2">
                      {filteredInterests.map(interest => {
                        const selected = interests.includes(interest);
                        return (
                          <motion.button
                            key={interest}
                            onClick={() => setInterests(prev =>
                              prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
                            )}
                            className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                              selected
                                ? "bg-gradient-to-r from-red-500 to-orange-500 border-transparent text-white font-semibold"
                                : "bg-white/5 border-white/10 text-white/60 hover:border-white/25"
                            }`}
                            whileTap={{ scale: 0.95 }}
                          >
                            #{interest}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border-t border-white/8 pt-3">
                    <p className="text-[10px] font-mono text-white/40 mb-2 uppercase">Skills (optional)</p>
                    <div className="flex flex-wrap gap-1.5">
                      {ALL_SKILLS.map(skill => {
                        const selected = skills.includes(skill);
                        return (
                          <button
                            key={skill}
                            onClick={() => setSkills(prev =>
                              prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
                            )}
                            className={`px-2.5 py-1 text-[10px] rounded-lg border transition ${
                              selected
                                ? "bg-orange-500/20 border-orange-500/40 text-orange-300"
                                : "bg-white/3 border-white/8 text-white/40 hover:border-white/20"
                            }`}
                          >
                            {skill}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <p className="text-[10px] text-white/30">
                    {interests.length}/3 minimum selected
                    {interests.length >= 3 && <span className="text-green-400 ml-1">✓ Good to go!</span>}
                  </p>
                </div>
              </StepMotion>
            )}

            {/* STEP 6: Social Links */}
            {step === 6 && (
              <StepMotion key="step6" dir={dir}>
                <MicroCopy step={6} />
                <div className="space-y-3">
                  {[
                    { icon: Github, label: "GitHub", value: github, set: setGithub, placeholder: "github_username" },
                    { icon: Heart, label: "X / Twitter", value: twitter, set: setTwitter, placeholder: "@handle" },
                    { icon: Link, label: "LinkedIn", value: linkedin, set: setLinkedin, placeholder: "linkedin.com/in/you" },
                    { icon: Globe, label: "Website", value: website, set: setWebsite, placeholder: "https://yoursite.com" },
                  ].map(({ icon: Icon, label, value, set, placeholder }) => (
                    <div key={label} className="space-y-1">
                      <label className="text-[10px] font-mono text-white/40">{label}</label>
                      <div className="relative">
                        <Icon size={14} className="absolute left-3 top-3 text-white/25" />
                        <input
                          value={value}
                          onChange={e => set(e.target.value)}
                          placeholder={placeholder}
                          className="w-full py-2.5 pl-9 pr-3 text-sm text-white bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-orange-500/50 transition placeholder-white/20"
                        />
                      </div>
                    </div>
                  ))}
                  <p className="text-[10px] text-white/25 text-center pt-1">All optional. You can add these later in settings.</p>
                </div>
              </StepMotion>
            )}

            {/* STEP 7: Goals */}
            {step === 7 && (
              <StepMotion key="step7" dir={dir}>
                <MicroCopy step={7} />
                <div className="grid grid-cols-2 gap-2">
                  {GOALS.map(goal => {
                    const selected = goals.includes(goal.id);
                    return (
                      <motion.button
                        key={goal.id}
                        onClick={() => setGoals(prev =>
                          prev.includes(goal.id) ? prev.filter(g => g !== goal.id) : [...prev, goal.id]
                        )}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          selected
                            ? "bg-gradient-to-br from-red-500/20 to-orange-500/20 border-orange-500/40 text-white"
                            : "bg-white/3 border-white/8 text-white/50 hover:border-white/20"
                        }`}
                        whileTap={{ scale: 0.97 }}
                      >
                        <div className="text-lg mb-1" aria-hidden="true">{goal.icon}</div>
                        <p className="text-xs font-medium capitalize leading-snug">{goal.label}</p>
                        {selected && <div className="mt-1.5 w-3 h-3 rounded-full bg-gradient-to-br from-red-400 to-orange-400 flex items-center justify-center"><Check size={8} className="text-white" /></div>}
                      </motion.button>
                    );
                  })}
                </div>
              </StepMotion>
            )}

            {/* STEP 8: Completion */}
            {step === 8 && (
              <StepMotion key="step8" dir={dir}>
                <div className="flex flex-col items-center text-center gap-6">
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="w-24 h-24 rounded-3xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-2xl shadow-orange-500/40"
                  >
                    <PartyPopper size={40} className="text-white" />
                  </motion.div>

                  <div>
                    <h2 className="text-2xl font-serif font-bold text-white">Profile complete!</h2>
                    <p className="text-sm text-white/50 mt-2 leading-relaxed">
                      Welcome, {displayName.split(" ")[0]}. Your profile is set up and ready to attract meaningful connections.
                    </p>
                  </div>

                  <div className="w-full grid grid-cols-2 gap-2 text-left">
                    {[
                      { label: "Username", value: `@${username}` },
                      { label: "Interests", value: `${interests.length} selected` },
                      { label: "Goals", value: `${goals.length} set` },
                      { label: "Status", value: "Active" },
                    ].map(item => (
                      <div key={item.label} className="p-3 bg-white/5 rounded-xl border border-white/8">
                        <p className="text-[9px] font-mono text-white/30 uppercase">{item.label}</p>
                        <p className="text-sm font-semibold text-white mt-0.5">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/15 border border-amber-500/25 rounded-xl">
                    <span className="text-amber-400 text-lg">⬡</span>
                    <p className="text-sm text-amber-300 font-semibold">+100 Welcome Tokens earned!</p>
                  </div>
                </div>
              </StepMotion>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            {step > 1 ? (
              <button
                onClick={goBack}
                className="flex items-center gap-1.5 px-4 py-2 text-sm text-white/50 hover:text-white/80 transition"
              >
                <ArrowLeft size={14} />
                Back
              </button>
            ) : <div />}

            {step < TOTAL_STEPS ? (
              <motion.button
                onClick={goNext}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-orange-500/20 disabled:opacity-50 transition"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {saving ? <Loader size={14} className="animate-spin" /> : null}
                {step === 3 ? "Continue" : step === 6 ? "Almost done!" : "Continue"}
                <ArrowRight size={14} />
              </motion.button>
            ) : (
              <motion.button
                onClick={handleComplete}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white text-sm font-bold rounded-xl shadow-xl shadow-orange-500/30 disabled:opacity-50 transition"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                {saving ? <Loader size={14} className="animate-spin" /> : <Sparkles size={14} />}
                Enter Palrene
              </motion.button>
            )}
          </div>

          {/* Skip option for optional steps */}
          {(step === 3 || step === 6) && (
            <div className="text-center mt-3">
              <button
                onClick={goNext}
                className="text-[11px] font-mono text-white/25 hover:text-white/50 transition"
              >
                Skip this step
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
