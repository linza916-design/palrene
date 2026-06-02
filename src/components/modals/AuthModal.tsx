import React, { useState } from "react";
import { useStore } from "../../store";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Lock,
  Mail,
  User,
  ShieldCheck,
  Heart,
  AlertCircle,
  Sparkles,
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const {
    login,
    signup,
    resetPassword,
    registrationStep,
    registrationData,
    nextRegistrationStep,
    prevRegistrationStep,
    finishRegistration,
  } = useStore();

  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Form states for onboarding steps
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [dob, setDob] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [gender, setGender] = useState("");
  const [genderPreference, setGenderPreference] = useState("");
  const [race, setRace] = useState("");
  const [preferredRace, setPreferredRace] = useState("");
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(45);
  const [goals, setGoals] = useState<string[]>([]);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email) {
      setError("Email is required.");
      setLoading(false);
      return;
    }

    try {
      if (mode === "login") {
        const success = await login(email, password);
        if (success) onClose();
      } else if (mode === "signup") {
        await signup(email, password);
        // Do not close, we will enter registrationStep 1!
      } else {
        await resetPassword(email);
        alert(
          "If that email resonance matches, check your inbox for instructions!",
        );
        setMode("login");
      }
    } catch (err: any) {
      setError(err.message || "An authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleInterestToggle = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleGoalToggle = (goal: string) => {
    if (goals.includes(goal)) {
      setGoals(goals.filter((g) => g !== goal));
    } else {
      setGoals([...goals, goal]);
    }
  };

  // Helper username generator from Full Name
  const generateUsername = (name: string) => {
    const clean = name.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const suffix = Math.floor(1000 + Math.random() * 9000);
    return `${clean || "human"}_${suffix}`;
  };

  // Validation DOBS to protect minors (Only 18+ allowed!)
  const validateAge = (dateString: string) => {
    if (!dateString) return false;
    const birthday = new Date(dateString);
    const today = new Date();
    // Milliseconds in a year calculation
    const age =
      (today.getTime() - birthday.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return age >= 18;
  };

  // Onboarding Step Handlers
  const handleStepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    switch (registrationStep) {
      case 1:
        if (!fullName.trim()) {
          setError("Full name is required.");
          return;
        }
        nextRegistrationStep({
          full_name: fullName,
          username: generateUsername(fullName),
        });
        break;

      case 2:
        // Set default values if empty
        const finalAvatar =
          avatarUrl ||
          `https://api.dicebear.com/7.x/adventurer/svg?seed=${fullName || "onboarding"}`;
        const finalBanner =
          bannerUrl ||
          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80";
        nextRegistrationStep({
          avatar_url: finalAvatar,
          banner_url: finalBanner,
        });
        break;

      case 3:
        if (selectedInterests.length < 3) {
          setError("Please select at least 3 emotional interests.");
          return;
        }
        nextRegistrationStep({ interests: selectedInterests });
        break;

      case 4:
        if (!dob) {
          setError("Date of birth is required.");
          return;
        }
        if (!validateAge(dob)) {
          setError(
            "Boundary rules: Only individuals 18+ are permitted on Palrene.",
          );
          return;
        }
        nextRegistrationStep({
          bio: bio || "Navigating earthly mysteries in high spirits.",
          location: location || "Cosmopolis",
          dob: dob,
        });
        break;

      case 5:
        if (!gender) {
          setError("Please select your gender identification.");
          return;
        }
        nextRegistrationStep({
          gender,
          gender_preference: genderPreference || "Any",
        });
        break;

      case 6:
        if (!race) {
          setError("Please define your identification.");
          return;
        }
        nextRegistrationStep({
          race,
          preferred_race: preferredRace || "Any",
        });
        break;

      case 7:
        nextRegistrationStep({
          age_range_min: ageMin,
          age_range_max: ageMax,
        });
        break;

      case 8:
        if (goals.length < 1) {
          setError("Please select at least one connection goal.");
          return;
        }
        // Save goals to state and trigger final completion
        nextRegistrationStep({ recognition_goals: goals });
        break;

      default:
        break;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="w-full max-w-md overflow-hidden bg-white dark:bg-zinc-950 border border-neutral-200 dark:border-neutral-900 rounded-3xl shadow-2xl relative"
          >
            {/* Close Button - hide during progressive onboarding to avoid intermediate states */}
            {registrationStep === 0 && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-full transition text-neutral-450 hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 z-10"
              >
                <X size={18} />
              </button>
            )}

            {/* ERROR ALERTS */}
            {error && (
              <div className="absolute top-4 inset-x-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-3 rounded-xl flex items-center space-x-2 text-xs z-20">
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* STEP 0: STANDARD LOGIN/SIGNUP/RESET */}
            {registrationStep === 0 && (
              <div className="p-6 sm:p-8 space-y-6">
                <div className="text-center space-y-1 mt-2">
                  <span className="text-[9px] font-mono font-bold tracking-widest uppercase bg-linear-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                    Palrene Core API Secure Link
                  </span>
                  <h3 className="text-xl font-serif font-bold text-neutral-900 dark:text-white">
                    {mode === "login"
                      ? "Resonance Log In"
                      : mode === "signup"
                        ? "Create Infinite Connection"
                        : "Mend Connection Socket"}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {mode === "login"
                      ? "Enter your harbor credentials."
                      : mode === "signup"
                        ? "Begin progressive profile registration."
                        : "Retrieve email access link safely."}
                  </p>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 capitalize">
                      Email harbor
                    </label>
                    <div className="relative">
                      <Mail
                        size={15}
                        className="absolute left-3.5 top-3.5 text-neutral-400"
                      />
                      <input
                        type="email"
                        placeholder="your@resonance.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full py-2.5 pl-10 pr-4 text-xs rounded-xl border border-neutral-200 dark:border-neutral-850 bg-neutral-50 dark:bg-black placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:border-orange-500 dark:text-white transition"
                      />
                    </div>
                  </div>

                  {mode !== "reset" && (
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                          Secret credential
                        </label>
                        {mode === "login" && (
                          <button
                            type="button"
                            onClick={() => setMode("reset")}
                            className="text-[9px] font-mono text-orange-500 hover:underline cursor-pointer"
                          >
                            Lost socket?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Lock
                          size={15}
                          className="absolute left-3.5 top-3.5 text-neutral-400"
                        />
                        <input
                          type="password"
                          placeholder="••••••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full py-2.5 pl-10 pr-4 text-xs rounded-xl border border-neutral-200 dark:border-neutral-850 bg-neutral-50 dark:bg-black placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:border-orange-500 dark:text-white transition"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 font-mono text-xs font-bold tracking-wider uppercase text-white bg-linear-to-r from-red-500 to-orange-500 rounded-xl hover:from-red-600 hover:to-orange-600 transition duration-300 disabled:opacity-50"
                  >
                    {loading
                      ? "Aligning channels..."
                      : mode === "login"
                        ? "Establish connection"
                        : mode === "signup"
                          ? "Initialize socket"
                          : "Recover channel"}
                  </button>
                </form>

                <div className="border-t border-neutral-100 dark:border-neutral-900 pt-4 text-center">
                  {mode === "login" ? (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      New to Palrene?{" "}
                      <button
                        type="button"
                        onClick={() => setMode("signup")}
                        className="text-orange-500 hover:underline font-bold"
                      >
                        Register harbor
                      </button>
                    </p>
                  ) : (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Already have access?{" "}
                      <button
                        type="button"
                        onClick={() => setMode("login")}
                        className="text-orange-500 hover:underline font-bold"
                      >
                        Sign in here
                      </button>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* STEP 1-8 PROGRESSIVE REGISTRATION MODAL ONBOARDING */}
            {registrationStep > 0 && (
              <form
                onSubmit={handleStepSubmit}
                className="p-6 sm:p-8 space-y-6"
              >
                {/* Onboarding step progress indicator count */}
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-900">
                  <div className="flex items-center space-x-1.5 text-[10px] font-mono text-orange-500 dark:text-orange-400">
                    <Sparkles size={11} className="animate-spin" />
                    <span className="font-bold">Progressive Profiling</span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400">
                    Step {registrationStep} of 8
                  </span>
                </div>

                {/* STEP 1: Basic Information */}
                {registrationStep === 1 && (
                  <div className="space-y-4">
                    <div className="text-center space-y-1">
                      <h4 className="text-base font-serif font-semibold text-neutral-800 dark:text-white">
                        Basic Identification
                      </h4>
                      <p className="text-[11px] text-neutral-400">
                        How should our human circles address you? We'll generate
                        a unique handle for anonymity.
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                        What is your Full Name?
                      </label>
                      <div className="relative">
                        <User
                          size={15}
                          className="absolute left-3.5 top-3.5 text-neutral-400"
                        />
                        <input
                          type="text"
                          placeholder="e.g. Juliet Rosales"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full py-2.5 pl-10 pr-4 text-xs rounded-xl border border-neutral-200 dark:border-neutral-850 bg-neutral-50 dark:bg-black placeholder-neutral-400 focus:outline-none focus:border-orange-500 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Profile setup (Profiling avatar/banner links or selections) */}
                {registrationStep === 2 && (
                  <div className="space-y-4">
                    <div className="text-center space-y-1">
                      <h4 className="text-base font-serif font-semibold text-neutral-800 dark:text-white">
                        Profile Customization
                      </h4>
                      <p className="text-[11px] text-neutral-400">
                        Visual aesthetics define resonance. Add custom URLs or
                        utilize premium presets.
                      </p>
                    </div>
                    <div className="space-y-3 px-1 text-left">
                      <div className="flex items-center space-x-3 bg-neutral-50 dark:bg-zinc-900/50 p-2.5 rounded-2xl border border-neutral-150 dark:border-neutral-850">
                        <img
                          src={
                            avatarUrl ||
                            `https://api.dicebear.com/7.x/adventurer/svg?seed=${fullName || "onboarding"}`
                          }
                          alt="Avatar preview"
                          className="w-12 h-12 rounded-full object-cover border-2 border-orange-500"
                        />
                        <div className="flex-1">
                          <label className="text-[9px] font-mono text-neutral-500 dark:text-neutral-450 block font-bold uppercase tracking-wider">
                            Avatar Image URL (Optional)
                          </label>
                          <input
                            type="url"
                            placeholder="https://images.unsplash.com/... (or left blank for vector)"
                            value={avatarUrl}
                            onChange={(e) => setAvatarUrl(e.target.value)}
                            className="w-full mt-1 p-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black focus:outline-none focus:border-orange-500 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 bg-neutral-50 dark:bg-zinc-900/50 p-2.5 rounded-2xl border border-neutral-150 dark:border-neutral-850">
                        <img
                          src={
                            bannerUrl ||
                            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80"
                          }
                          alt="Banner preview"
                          className="w-12 h-12 rounded-lg object-cover border border-neutral-350 dark:border-neutral-800"
                        />
                        <div className="flex-1">
                          <label className="text-[9px] font-mono text-neutral-500 dark:text-neutral-450 block font-bold uppercase tracking-wider">
                            Banner Image URL (Optional)
                          </label>
                          <input
                            type="url"
                            placeholder="https://images.unsplash.com/banner-art..."
                            value={bannerUrl}
                            onChange={(e) => setBannerUrl(e.target.value)}
                            className="w-full mt-1 p-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black focus:outline-none focus:border-orange-500 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="text-center space-y-1">
                        <span className="text-[10px] font-mono text-neutral-400">
                          Precompiled Avatar Preset Vectors Selection:
                        </span>
                        <div className="flex items-center justify-center gap-2 pt-1">
                          {[
                            "juliet",
                            "aesthetic",
                            "resonance",
                            "starlight",
                          ].map((seed) => (
                            <button
                              key={seed}
                              type="button"
                              onClick={() => {
                                setAvatarUrl(
                                  `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`,
                                );
                              }}
                              className="px-2.5 py-1 text-[9px] font-mono rounded bg-neutral-200 dark:bg-zinc-850 text-neutral-700 dark:text-neutral-300 hover:bg-orange-500 hover:text-white transition cursor-pointer"
                            >
                              {seed}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Interest selection (Minimum 3 selectable tags) */}
                {registrationStep === 3 && (
                  <div className="space-y-4">
                    <div className="text-center space-y-1">
                      <h4 className="text-base font-serif font-semibold text-neutral-800 dark:text-white">
                        Interests Discovery
                      </h4>
                      <p className="text-[11px] text-neutral-400">
                        We'll algorithmically channel you into subgroups. Select
                        a minimum of 3 interests.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1.5">
                      {[
                        "relationships",
                        "music",
                        "science",
                        "memes",
                        "foods",
                        "travel",
                        "nature",
                        "gaming",
                        "spirituality",
                        "entrepreneurship",
                      ].map((interest) => {
                        const isChosen = selectedInterests.includes(interest);
                        return (
                          <button
                            key={interest}
                            type="button"
                            onClick={() => handleInterestToggle(interest)}
                            className={`p-2.5 rounded-xl border text-[11px] font-mono text-left outline-none transition capitalize ${
                              isChosen
                                ? "bg-orange-500/10 dark:bg-orange-950/20 border-orange-500 text-orange-600 dark:text-orange-400"
                                : "bg-neutral-50 dark:bg-black/30 border-neutral-200 dark:border-neutral-850 text-neutral-650 dark:text-neutral-450 hover:border-neutral-300"
                            }`}
                          >
                            #{interest}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 4: Bio Information (short bio, location, DOB with 18+ guard) */}
                {registrationStep === 4 && (
                  <div className="space-y-4">
                    <div className="text-center space-y-1">
                      <h4 className="text-base font-serif font-semibold text-neutral-800 dark:text-white">
                        Bio & Alignment info
                      </h4>
                      <p className="text-[11px] text-neutral-400">
                        Tell other seekers what drives your vibration. Only
                        individuals 18+ allowed.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                          Short Bio
                        </label>
                        <textarea
                          placeholder="I am walking along quiet twilight paths..."
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          className="w-full h-16 p-2 rounded-xl border border-neutral-200 dark:border-neutral-850 bg-neutral-50 dark:bg-black text-xs text-neutral-800 dark:text-white placeholder-neutral-450 focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                          Your Current City/Location
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Kyoto, Japan"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="w-full py-2 px-3 text-xs rounded-xl border border-neutral-200 dark:border-neutral-850 bg-neutral-50 dark:bg-black text-neutral-850 dark:text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-neutral-500 dark:text-neutral-450 flex items-center justify-between">
                          <span>Date of Birth</span>
                          <span className="text-[8px] bg-red-500/10 text-red-500 px-1.5 rounded uppercase font-bold tracking-wider leading-none select-none">
                            18+ strictly mandatory
                          </span>
                        </label>
                        <input
                          type="date"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          className="w-full py-2 px-3 text-xs rounded-xl border border-neutral-200 dark:border-neutral-850 bg-neutral-50 dark:bg-black text-neutral-850 dark:text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 5: Identity preferences (gender details) */}
                {registrationStep === 5 && (
                  <div className="space-y-4">
                    <div className="text-center space-y-1">
                      <h4 className="text-base font-serif font-semibold text-neutral-800 dark:text-white">
                        Identity Identification
                      </h4>
                      <p className="text-[11px] text-neutral-400">
                        Choose gender identification and matching configuration
                        values.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                          Select Gender identification
                        </span>
                        <div className="flex gap-2">
                          {["Female", "Male", "Non-binary", "fluid"].map(
                            (g) => (
                              <button
                                key={g}
                                type="button"
                                onClick={() => setGender(g)}
                                className={`flex-1 py-2 text-xs font-mono rounded-lg border transition ${
                                  gender === g
                                    ? "bg-orange-500 text-white border-transparent"
                                    : "bg-neutral-50 dark:bg-black/40 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-350"
                                }`}
                              >
                                {g}
                              </button>
                            ),
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                          Matching Preferences
                        </span>
                        <div className="flex gap-2">
                          {["Female", "Male", "Any"].map((g) => (
                            <button
                              key={g}
                              type="button"
                              onClick={() => setGenderPreference(g)}
                              className={`flex-1 py-2 text-xs font-mono rounded-lg border transition ${
                                genderPreference === g
                                  ? "bg-orange-500 text-white border-transparent"
                                  : "bg-neutral-50 dark:bg-black/40 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-350"
                              }`}
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 6: Race details and preferences */}
                {registrationStep === 6 && (
                  <div className="space-y-4">
                    <div className="text-center space-y-1">
                      <h4 className="text-base font-serif font-semibold text-neutral-800 dark:text-white">
                        Race preferences values
                      </h4>
                      <p className="text-[11px] text-neutral-400">
                        Palrene celebrates all ethnic frequencies. Matching
                        configuration.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                          Select Identity roots
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            "African",
                            "Asian",
                            "Caucasian",
                            "Hispanic",
                            "Middle Eastern",
                            "Multiracial",
                          ].map((r) => (
                            <button
                              key={r}
                              type="button"
                              onClick={() => setRace(r)}
                              className={`py-2 text-[10px] font-mono rounded-lg border transition ${
                                race === r
                                  ? "bg-orange-500 text-white border-transparent"
                                  : "bg-neutral-50 dark:bg-black/40 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-350"
                              }`}
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                          Preferred match background
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                          {["Asian", "Caucasian", "Any"].map((r) => (
                            <button
                              key={r}
                              type="button"
                              onClick={() => setPreferredRace(r)}
                              className={`py-1.5 text-[10px] font-mono rounded-lg border transition ${
                                preferredRace === r
                                  ? "bg-orange-500 text-white border-transparent"
                                  : "bg-neutral-50 dark:bg-black/40 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-350"
                              }`}
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 7: Age preferences range slider */}
                {registrationStep === 7 && (
                  <div className="space-y-4">
                    <div className="text-center space-y-1">
                      <h4 className="text-base font-serif font-semibold text-neutral-800 dark:text-white">
                        Age target boundaries
                      </h4>
                      <p className="text-[11px] text-neutral-400">
                        Define search bounds for matching. Range selection.
                      </p>
                    </div>

                    <div className="space-y-5 py-2">
                      <div className="space-y-1">
                        <div className="flex justify-between font-mono text-[10px] text-neutral-500">
                          <span>Minimum Age Limit</span>
                          <span className="font-bold text-orange-500">
                            {ageMin} yrs
                          </span>
                        </div>
                        <input
                          type="range"
                          min="18"
                          max="80"
                          value={ageMin}
                          onChange={(e) => setAgeMin(parseInt(e.target.value))}
                          className="w-full accent-orange-500 hover:accent-orange-600 transition"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between font-mono text-[10px] text-neutral-500">
                          <span>Maximum Age Limit</span>
                          <span className="font-bold text-orange-500">
                            {ageMax} yrs
                          </span>
                        </div>
                        <input
                          type="range"
                          min="18"
                          max="100"
                          value={ageMax}
                          onChange={(e) =>
                            setAgeMax(
                              Math.max(ageMin + 1, parseInt(e.target.value)),
                            )
                          }
                          className="w-full accent-orange-500 hover:accent-orange-600 transition"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 8: Recognition Goals */}
                {registrationStep === 8 && (
                  <div className="space-y-4">
                    <div className="text-center space-y-1">
                      <h4 className="text-base font-serif font-semibold text-neutral-800 dark:text-white">
                        Connection Goals
                      </h4>
                      <p className="text-[11px] text-neutral-400">
                        What are you seeking? Select matching values (can select
                        multiple).
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1.5">
                      {[
                        "friendship",
                        "long-term relationship",
                        "mentorship",
                        "emotional support",
                        "guidance",
                        "networking",
                        "communities",
                      ].map((goalOption) => {
                        const isChosen = goals.includes(goalOption);
                        return (
                          <button
                            key={goalOption}
                            type="button"
                            onClick={() => handleGoalToggle(goalOption)}
                            className={`p-2.5 rounded-xl border text-[11px] font-mono text-left outline-none transition capitalize ${
                              isChosen
                                ? "bg-orange-500/10 dark:bg-orange-950/20 border-orange-500 text-orange-600 dark:text-orange-400"
                                : "bg-neutral-50 dark:bg-black/30 border-neutral-200 dark:border-neutral-850 text-neutral-650 dark:text-neutral-450 hover:border-neutral-300"
                            }`}
                          >
                            ⭐ {goalOption}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Footer Controls for Onboarding Steps */}
                <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-900 pt-4">
                  {registrationStep > 1 ? (
                    <button
                      type="button"
                      onClick={prevRegistrationStep}
                      className="text-xs font-mono font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition"
                    >
                      Back
                    </button>
                  ) : (
                    <div />
                  )}

                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-mono font-bold uppercase tracking-wider text-white bg-linear-to-r from-red-500 to-orange-500 rounded-xl hover:from-red-600 hover:to-orange-600 transition"
                  >
                    {registrationStep === 8 ? "Unlock Palrene!" : "Continue"}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
