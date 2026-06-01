import React, { useState } from "react";
import { useStore } from "../../store";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sliders, 
  Shield, 
  CreditCard, 
  Sparkles, 
  AlertCircle, 
  Check, 
  Mail, 
  Award, 
  Crown, 
  Zap, 
  Plus, 
  Trash2, 
  Globe, 
  Smartphone, 
  Landmark, 
  HelpCircle,
  Eye,
  Info
} from "lucide-react";

export default function SettingsPanel() {
  const { currentUser, setSubscriptionTier, triggerEmailAlert, addPaymentTransaction, ads, submitAd } = useStore();
  const [allowAdult, setAllowAdult] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  
  // Tabs: "billing" | "safeguards" | "ads"
  const [activeTab, setActiveTab] = useState<"billing" | "safeguards" | "ads">("billing");
  
  // Annual toggle
  const [isAnnual, setIsAnnual] = useState(false);

  // checkout state
  const [payingForTier, setPayingForTier] = useState<any | null>(null);
  const [paymentChannel, setPaymentChannel] = useState<"card" | "mobile_money" | "bank_transfer">("card");
  
  // card input state
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  
  // mobile money state
  const [momoNumber, setMomoNumber] = useState("");
  const [momoNetwork, setMomoNetwork] = useState("MTN");

  // checkout status flow
  const [checkoutStep, setCheckoutStep] = useState<"input" | "processing" | "success">("input");
  const [processingStatus, setProcessingStatus] = useState("");

  // ad builder state
  const [showAdBuilder, setShowAdBuilder] = useState(false);
  const [adTitle, setAdTitle] = useState("");
  const [adDesc, setAdDesc] = useState("");
  const [adLink, setAdLink] = useState("");
  const [adCategory, setAdCategory] = useState("relationships");
  const [adBudget, setAdBudget] = useState(25);
  const [customAdImage, setCustomAdImage] = useState("");
  const [selectedPresetImage, setSelectedPresetImage] = useState("https://images.unsplash.com/photo-1518244979147-3b77e9eb2e0d?w=400&auto=format&fit=crop&q=80");

  const [payingForAd, setPayingForAd] = useState<boolean>(false);

  // Success Toast state
  const [successToast, setSuccessToast] = useState<{
    tierId: string;
    subject: string;
    body: string;
  } | null>(null);

  // Preset Unsplash links for easy high-fidelity ad building
  const presetBannerImages = [
    { label: "Sound Therapy", url: "https://images.unsplash.com/photo-1518244979147-3b77e9eb2e0d?w=400&auto=format&fit=crop&q=80" },
    { label: "Candlelit Coffee", url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&auto=format&fit=crop&q=80" },
    { label: "Summit Retreat", url: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&auto=format&fit=crop&q=80" },
    { label: "Cozy Books", url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&auto=format&fit=crop&q=80" }
  ];

  const getFormatOptionValue = (val: string) => {
    // Expiry input formatter 12/26
    let clean = val.replace(/\D/g, "");
    if (clean.length > 2) {
      return clean.slice(0, 2) + "/" + clean.slice(2, 4);
    }
    return clean;
  };

  const getFormatCardValue = (val: string) => {
    // Spaced card formatting 4440 2341 2345 5122
    let clean = val.replace(/\D/g, "");
    let matches = clean.match(/.{1,4}/g);
    return matches ? matches.join(" ").slice(0, 19) : clean;
  };

  const detectCardType = (num: string) => {
    if (num.startsWith("4")) return "Visa Platinum Signature";
    if (num.startsWith("5")) return "Mastercard Infinite";
    if (num.startsWith("2") || num.startsWith("6")) return "Verve Global Secured";
    return "Flutterwave Safe Channel";
  };

  const billingCycles = {
    Monthly: {
      Free: "$0",
      Starter: "$12/mo",
      Pro: "$29/mo",
      rawStarter: 12.00,
      rawPro: 29.00
    },
    Annual: {
      Free: "$0",
      Starter: "$7.80/mo",
      Pro: "$18.85/mo",
      rawStarter: 7.80,
      rawPro: 18.85,
      noteStarter: "Billed annually at $93.60/year",
      notePro: "Billed annually at $226.20/year"
    }
  };

  const getPrices = () => {
    return isAnnual ? billingCycles.Annual : billingCycles.Monthly;
  };

  const prices = getPrices();

  const billingTiers = [
    {
      id: "Free",
      price: prices.Free,
      desc: "Begin seeking companion souls with essential, simple boundaries.",
      badge: "Free Soul",
      color: "border-neutral-200 dark:border-zinc-900",
      features: [
        "10 Messages/day inbox threshold",
        "Essential feed access & search mechanics",
        "Public chat circles participation",
        "Limited AI advisor inquiries"
      ]
    },
    {
      id: "Starter",
      price: prices.Starter,
      billNote: isAnnual ? (billingCycles.Annual as any).noteStarter : "Billed monthly",
      desc: "Unlock manual verification seals and secure deeper matching tunnels.",
      badge: "Prestige Seeker",
      color: "border-yellow-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)] bg-gradient-to-br from-yellow-500/[0.01]",
      features: [
        "Identity verification upload approval eligibility",
        "50 Whispers direct messages/day",
        "No sponsored ads on feed and threads",
        "Specialist sub-group filtering options",
        "Priority match visibility"
      ]
    },
    {
      id: "Pro",
      price: prices.Pro,
      billNote: isAnnual ? (billingCycles.Annual as any).notePro : "Billed monthly",
      desc: "Unbound creative influence, community forge templates, and ad placements.",
      badge: "Cosmic Architect",
      color: "border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.08)] bg-gradient-to-br from-orange-500/[0.02]",
      features: [
        "Unlimited direct whispers & companion connections",
        "Auto-priority identity reviews < 2 hours",
        "In-App smart category ad campaign builder",
        "2 Free Feed resonance boosts/month",
        "Create premium restricted community circles",
        "Advanced Poly AI chat memory access"
      ]
    }
  ];

  const handleOpenCheckout = (tier: any) => {
    setPayingForTier(tier);
    setCheckoutStep("input");
    setCardNumber("");
    setCardExpiry("");
    setCardCvv("");
    setMomoNumber("");
  };

  const triggerPaymentProcessing = () => {
    if (paymentChannel === "card" && (!cardNumber || !cardExpiry || !cardCvv)) {
      alert("Please provide valid credit card particulars.");
      return;
    }
    if (paymentChannel === "mobile_money" && !momoNumber) {
      alert("Please enter a valid active mobile money phone connection.");
      return;
    }

    setCheckoutStep("processing");

    // Cycle simulated ledger operations
    const milestones = [
      "Contacting Flutterwave gateway ledgers...",
      "Validating dynamic payment token authorization...",
      "Dispatching credentials to merchant bank settlement...",
      "Palrene secure consensus locked. Handshaking..."
    ];

    let currentMilestone = 0;
    setProcessingStatus(milestones[0]);

    const interval = setInterval(() => {
      currentMilestone++;
      if (currentMilestone < milestones.length) {
        setProcessingStatus(milestones[currentMilestone]);
      } else {
        clearInterval(interval);
        finalizeUpgrade();
      }
    }, 1200);
  };

  const finalizeUpgrade = () => {
    if (!currentUser || !payingForTier) return;

    const amount = payingForTier.id === "Starter" 
      ? (isAnnual ? 93.60 : 12.00) 
      : (isAnnual ? 226.20 : 29.00);

    const transactionId = `tx_fw_${Date.now()}`;
    
    // Add transaction to store payments list
    addPaymentTransaction({
      id: transactionId,
      userId: currentUser.id,
      userName: currentUser.full_name,
      plan: payingForTier.id as any,
      amount: amount,
      status: "successful",
      provider: "Flutterwave",
      created_at: new Date().toISOString()
    });

    // Update subscription tier
    setSubscriptionTier(payingForTier.id as any);

    setCheckoutStep("success");
  };

  const handleCloseSuccess = () => {
    setPayingForTier(null);
    setCheckoutStep("input");
  };

  // Submit dynamic Ad
  const handleAdPublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adTitle.trim() || !adDesc.trim() || !adLink.trim()) {
      alert("Please fill out all promotion items.");
      return;
    }

    setPayingForAd(true);
    setCheckoutStep("input");
    // Trigger simulated checkout modal for the ad budget
    setProcessingStatus("Registering promotional campaign payload...");
  };

  const triggerAdPaymentProcessing = () => {
    if (paymentChannel === "card" && (!cardNumber || !cardExpiry || !cardCvv)) {
      alert("Please provide valid card particulars.");
      return;
    }
    setCheckoutStep("processing");
    setProcessingStatus("Charging ad budget via Flutterwave...");

    setTimeout(() => {
      if (!currentUser) return;
      // Add transaction
      const transactionId = `tx_fw_ad_${Date.now()}`;
      addPaymentTransaction({
        id: transactionId,
        userId: currentUser.id,
        userName: currentUser.full_name,
        plan: "Pro", // Ads belong to Pro budget
        amount: adBudget,
        status: "successful",
        provider: "Flutterwave",
        created_at: new Date().toISOString()
      });

      // Submit ad to store
      submitAd(
        adTitle.trim(),
        adDesc.trim(),
        adLink.trim(),
        customAdImage.trim() || selectedPresetImage
      );

      setCheckoutStep("success");
    }, 3000);
  };

  const userAds = ads.filter(ad => ad.created_by === currentUser?.id);

  return (
    <div className="flex-1 max-w-xl mx-auto p-4 sm:p-5 h-[calc(100vh-62px)] overflow-y-auto pb-c-safe text-left space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-150/40 dark:border-neutral-900 pb-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Sliders className="text-orange-500" size={20} />
            <span>Harbor Tuning</span>
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Manage payment plans, smart ad campaigns, and Safeguards configurations.</p>
        </div>
      </div>

      {/* Segment Pill Switcher */}
      <div className="flex border border-neutral-200 dark:border-neutral-850 p-1 rounded-2xl bg-neutral-100 dark:bg-zinc-950/40">
        {[
          { id: "billing", label: "Billing Plans", icon: CreditCard },
          { id: "safeguards", label: "Tying Protections", icon: Shield },
          { id: "ads", label: "Promote & Ads", icon: GlowIcon(activeTab === "ads" ? Crown : Globe) }
        ].map((tab) => {
          const Icon = tab.icon;
          const isChosen = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setShowAdBuilder(false);
              }}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-mono font-bold transition outline-none cursor-pointer ${
                isChosen 
                  ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md shadow-orange-950/10" 
                  : "text-neutral-500 hover:text-neutral-850 dark:hover:text-neutral-200"
              }`}
            >
              <Icon size={13} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ======================= TAB 1: BILLING PLANS ======================= */}
      {activeTab === "billing" && (
        <div className="space-y-6">
          {/* Monthly / Annual cycle pill slider */}
          <div className="flex items-center justify-between p-4 rounded-3xl border border-neutral-150/50 dark:border-neutral-900 bg-neutral-50 dark:bg-zinc-950/20">
            <div>
              <span className="text-xs font-bold text-neutral-800 dark:text-white block font-sans">Flexible Billing Cycles</span>
              <p className="text-[10.5px] text-neutral-400">Save 35% on standard fees when committing to annual soul orbits.</p>
            </div>

            <div className="flex items-center space-x-2 bg-neutral-100 dark:bg-zinc-900 p-1 rounded-2xl border border-neutral-200 dark:border-neutral-850 relative shrink-0">
              <button 
                onClick={() => setIsAnnual(false)}
                className={`px-3 py-1.5 text-[10px] font-mono font-bold rounded-xl transition ${!isAnnual ? "bg-white dark:bg-black text-neutral-850 dark:text-white shadow" : "text-neutral-400"}`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setIsAnnual(true)}
                className={`px-3 py-1.5 text-[10px] font-mono font-bold rounded-xl transition flex items-center gap-1 ${isAnnual ? "bg-white dark:bg-black text-orange-500 shadow" : "text-neutral-400"}`}
              >
                <span>Annual</span>
                <span className="bg-orange-500 text-white font-bold px-1 rounded-[4px] text-[7.5px] leading-3 uppercase tracking-wider scale-95 origin-right">Save 35%</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {billingTiers.map((tier) => {
              const isChosen = ((currentUser?.subscription_tier || "Free") === tier.id);
              const isPro = tier.id === "Pro";
              const isStarter = tier.id === "Starter";
              
              return (
                <div 
                  key={tier.id}
                  className={`p-5 rounded-3xl border relative overflow-hidden transition-all duration-300 ${tier.color} ${
                    isChosen 
                      ? "ring-2 ring-orange-500 border-transparent bg-orange-500/[0.01]" 
                      : "border-neutral-150/45 dark:border-neutral-900/60 hover:border-orange-500/25"
                  }`}
                >
                  {/* Glowing auras for premium plans */}
                  {isPro && (
                    <div className="absolute -top-32 -right-32 w-64 h-64 bg-orange-500/5 blur-[80px] rounded-full pointer-events-none" />
                  )}
                  {isStarter && (
                    <div className="absolute -top-32 -right-32 w-64 h-64 bg-yellow-500/5 blur-[80px] rounded-full pointer-events-none" />
                  )}

                  {/* Shimmery borders for Pro members */}
                  {isChosen && isPro && (
                    <div className="absolute inset-x-0 top-0 h-[2.5px] bg-gradient-to-r from-red-500 via-yellow-400 to-orange-500 animate-pulse" />
                  )}

                  {/* Active Badge banner */}
                  {isChosen && (
                    <span className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white font-mono text-[8px] uppercase tracking-wider font-bold rounded-bl-xl select-none leading-none flex items-center gap-1 z-10 shadow">
                      <Check size={8} className="stroke-[3.5]" /> Active Resonance
                    </span>
                  )}

                  <div className="flex items-start justify-between relative z-10">
                    <div className="text-left space-y-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-orange-400 bg-orange-500/10 dark:bg-orange-400/5 px-2 py-0.5 rounded-lg border border-orange-500/15">
                          {tier.badge}
                        </span>
                      </div>
                      <h4 className="text-md font-serif font-black dark:text-white pt-2 leading-none">{tier.id} Plan</h4>
                      <p className="text-2xl font-black text-neutral-850 dark:text-neutral-100 flex items-baseline gap-1 mt-1">
                        <span>{tier.price}</span>
                        {tier.billNote && (
                          <span className="text-[10px] font-mono text-neutral-400 font-medium">({tier.billNote})</span>
                        )}
                      </p>
                    </div>

                    {!isChosen && (
                      <button
                        onClick={() => handleOpenCheckout(tier)}
                        className="px-4 py-2.5 text-[10px] font-mono font-bold uppercase tracking-wider text-white bg-gradient-to-r from-red-500 via-orange-500 to-rose-600 hover:scale-[1.03] active:scale-97 rounded-xl transition shadow shadow-orange-950/10 leading-none cursor-pointer flex items-center"
                      >
                        Resonate Orbit
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-neutral-500 dark:text-neutral-400 italic font-serif pt-3 border-t border-neutral-100/50 dark:border-neutral-900/40 mt-3">
                    "{tier.desc}"
                  </p>

                  {/* Features List */}
                  <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-[10.5px] text-neutral-500">
                    {tier.features.map((feature, fIdx) => (
                      <div key={fIdx} className="flex items-center space-x-2 min-w-0 font-serif leading-tight">
                        <div className="p-0.5 bg-orange-500/10 text-orange-500 rounded-full shrink-0">
                          <Check size={8} className="stroke-[3.5]" />
                        </div>
                        <span className="truncate">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================= TAB 2: PRIVACY SAFEGUARDS ======================= */}
      {activeTab === "safeguards" && (
        <div className="space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
            <Shield size={14} className="text-orange-500" />
            <span>Harmonic Boundary Control</span>
          </h3>

          <div className="p-5 bg-neutral-50 dark:bg-zinc-950/25 border border-neutral-150/45 dark:border-neutral-900 rounded-3xl space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="font-bold text-neutral-800 dark:text-white block font-sans text-xs">Daylight Blurring Safeguard</span>
                <p className="text-[11px] text-neutral-400 leading-normal">Ensures sensitive feed media uploads and profile elements start blurred between 6 AM and 6 PM. Requires a simple double-click to resolve.</p>
              </div>
              <input 
                type="checkbox" 
                checked={allowAdult} 
                onChange={() => setAllowAdult(!allowAdult)}
                className="w-4 h-4 mt-1 accent-orange-500 cursor-pointer"
              />
            </div>

            <div className="flex items-start justify-between gap-4 pt-4 border-t border-neutral-100/60 dark:border-neutral-900/45">
              <div className="space-y-1">
                <span className="font-bold text-neutral-800 dark:text-white block font-sans text-xs">Simulated Dispatch Digests</span>
                <p className="text-[11px] text-neutral-400 leading-normal">Allows the Palrene server mock system to trigger safe notifications and email simulation transcripts whenever people message or request matches.</p>
              </div>
              <input 
                type="checkbox" 
                checked={emailAlerts} 
                onChange={() => setEmailAlerts(!emailAlerts)}
                className="w-4 h-4 mt-1 accent-orange-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* ======================= TAB 3: SMART AD PROMOTIONS ======================= */}
      {activeTab === "ads" && (
        <div className="space-y-4">
          {currentUser && currentUser.subscription_tier !== "Pro" ? (
            <div className="p-8 text-center bg-gradient-to-br from-red-500/15 via-orange-500/10 to-rose-500/15 border border-orange-500/15 dark:border-orange-500/10 rounded-3xl space-y-4 h-80 flex flex-col justify-center text-left">
              <div className="flex items-center gap-2">
                <Crown className="text-yellow-500 animate-bounce" size={24} />
                <h3 className="text-base font-serif font-black text-neutral-800 dark:text-white">Smart Category Ad Builder</h3>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm leading-relaxed font-serif">
                Reach thousands of like-minded humans! Ad creation, custom budget estimators, demographics filtering, visual carousel banners, and Smart Category matchmaking are strictly unlocked for **Pro Tier Cosmic Architects**.
              </p>
              <div className="pt-2">
                <button 
                  onClick={() => setActiveTab("billing")} 
                  className="px-5 py-2.5 text-xs font-mono font-bold text-white bg-gradient-to-r from-red-500 to-orange-500 rounded-xl cursor-pointer"
                >
                  Acquire Pro Master Tier &rarr;
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-neutral-50 dark:bg-zinc-950/20 border border-neutral-150/45 dark:border-neutral-900/60 p-4 rounded-3xl">
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
                    <Crown size={14} className="text-orange-500" />
                    <span>My Promoted Campaigns</span>
                  </h3>
                  <p className="text-[10px] text-neutral-450 mt-1">Submit high-prestige sponsored slots into category dashboards.</p>
                </div>
                {!showAdBuilder && (
                  <button
                    onClick={() => setShowAdBuilder(true)}
                    className="px-3.5 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider border border-orange-500/30 hover:bg-orange-500 hover:text-white text-orange-500 rounded-xl cursor-pointer transition flex items-center gap-1"
                  >
                    <Plus size={12} />
                    <span>Forge Ad</span>
                  </button>
                )}
              </div>

              {showAdBuilder ? (
                <form onSubmit={handleAdPublish} className="p-5 bg-neutral-50 dark:bg-zinc-950/25 border border-neutral-150/50 dark:border-neutral-900 rounded-3xl space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-850 pb-2">
                    <span className="text-xs font-mono font-bold text-neutral-800 dark:text-zinc-200 uppercase tracking-wider">New Campaign Parameters</span>
                    <button 
                      type="button"
                      onClick={() => setShowAdBuilder(false)}
                      className="text-neutral-400 hover:text-neutral-200 text-xs"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 uppercase block font-bold">Campaign Catchy Title</label>
                    <input 
                      type="text"
                      placeholder="e.g. Guided Solitude Bathing Event"
                      value={adTitle}
                      onChange={(e) => setAdTitle(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-neutral-250 bg-white dark:bg-black dark:border-neutral-850 dark:text-white font-serif outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 uppercase block font-bold">Concept Pitch / Call to Action Description</label>
                    <textarea 
                      placeholder="Give users a compelling reason why their spirits should resonate with your offering..."
                      value={adDesc}
                      onChange={(e) => setAdDesc(e.target.value)}
                      className="w-full h-20 text-xs p-2.5 rounded-xl border border-neutral-250 bg-white dark:bg-black dark:border-neutral-850 dark:text-white font-serif resize-none outline-none leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 uppercase block font-bold">Destination URL Link</label>
                      <input 
                        type="url"
                        placeholder="https://example.com/retreat"
                        value={adLink}
                        onChange={(e) => setAdLink(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-neutral-250 bg-white dark:bg-black dark:border-neutral-850 dark:text-white font-mono outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 uppercase block font-bold">Target Hub Category</label>
                      <select 
                        value={adCategory}
                        onChange={(e) => setAdCategory(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-neutral-250 bg-white dark:bg-black dark:border-neutral-850 dark:text-white font-sans outline-none cursor-pointer"
                      >
                        <option value="relationships">Relationships & Matches (Premium Feed)</option>
                        <option value="entertainment">Entertainment & Parties</option>
                        <option value="music">Music & Frequency Bathes</option>
                        <option value="science">Deep Science & Psychology</option>
                        <option value="travel">Travel & Solitude Retreats</option>
                        <option value="foods">Foods & Intimate Cooks</option>
                      </select>
                    </div>
                  </div>

                  {/* Preset Banner Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-neutral-450 dark:text-neutral-500 uppercase block font-bold">Promo High-Res Creative Banner</label>
                    <div className="grid grid-cols-4 gap-2 pt-0.5">
                      {presetBannerImages.map((b) => (
                        <div 
                          key={b.label}
                          onClick={() => {
                            setSelectedPresetImage(b.url);
                            setCustomAdImage("");
                          }}
                          className={`rounded-xl overflow-hidden aspect-video relative border-2 cursor-pointer transition-all ${
                            selectedPresetImage === b.url && !customAdImage 
                              ? "border-orange-500 opacity-100 scale-102" 
                              : "border-neutral-200 dark:border-neutral-850 opacity-60 hover:opacity-85"
                          }`}
                        >
                          <img src={b.url} alt={b.label} className="w-full h-full object-cover" />
                          <span className="absolute bottom-0 inset-x-0 text-center bg-black/60 text-[7.5px] text-white font-mono leading-3 py-0.5 uppercase truncate">{b.label}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-2">
                      <input 
                        type="url"
                        placeholder="Or input custom web image address/URL link..."
                        value={customAdImage}
                        onChange={(e) => {
                          setCustomAdImage(e.target.value);
                          setSelectedPresetImage("");
                        }}
                        className="w-full text-xs p-2.5 rounded-xl border border-neutral-250 bg-white dark:bg-black dark:border-neutral-850 dark:text-white font-mono outline-none"
                      />
                    </div>
                  </div>

                  {/* Budget Slider */}
                  <div className="p-3.5 bg-neutral-100 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-850 rounded-2xl space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-neutral-700 dark:text-zinc-300">Campaign Promotion Budget</span>
                      <span className="font-mono font-bold text-orange-500">${adBudget} USD total</span>
                    </div>
                    <input 
                      type="range"
                      min={5}
                      max={200}
                      value={adBudget}
                      onChange={(e) => setAdBudget(parseInt(e.target.value))}
                      className="w-full accent-orange-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] font-mono text-neutral-400">
                      <span>Reach: ~{adBudget * 900} impressions</span>
                      <span>Targeting: {adCategory} category placements</span>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button 
                      type="button" 
                      onClick={() => setShowAdBuilder(false)}
                      className="flex-1 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-500 border rounded-xl"
                    >
                      Bail Out
                    </button>
                    <button 
                      type="submit" 
                      className="flex-1 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-white bg-gradient-to-r from-red-500 to-orange-500 rounded-xl"
                    >
                      Process Checkout & Pay
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  {userAds.length === 0 ? (
                    <div className="p-10 border border-neutral-150/50 dark:border-neutral-900 rounded-3xl bg-neutral-50 dark:bg-zinc-950/20 text-center">
                      <Crown size={24} className="mx-auto text-neutral-350 dark:text-zinc-800" />
                      <p className="text-xs text-neutral-400 mt-2 font-mono">No promotions registered. Press Forge Ad to establish your first pitch!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {userAds.map((ad) => (
                        <div 
                          key={ad.id}
                          className="p-4 border border-neutral-150/45 dark:border-neutral-900 rounded-3xl bg-neutral-50 dark:bg-zinc-150/[0.01] flex flex-col sm:flex-row gap-4 text-xs relative"
                        >
                          <div className="w-full sm:w-28 rounded-2xl overflow-hidden aspect-video sm:aspect-square bg-zinc-900 relative border border-neutral-200/50 dark:border-zinc-850 shrink-0">
                            <img src={ad.image_url} alt="" className="w-full h-full object-cover" />
                          </div>

                          <div className="flex-1 space-y-2 text-left leading-normal">
                            <div className="flex items-center justify-between">
                              <span className={`text-[8.5px] font-mono font-bold px-2 py-0.5 rounded border ${
                                ad.status === "approved" 
                                  ? "bg-green-500/10 text-green-500 border-green-500/20"
                                  : ad.status === "rejected"
                                    ? "bg-red-500/10 text-red-500 border-red-500/20"
                                    : "bg-orange-500/10 text-orange-500 border-orange-500/20 animate-pulse"
                              }`}>
                                {ad.status === "approved" ? "● ACTIVE AD" : ad.status === "rejected" ? "● DISALLOWED" : "● PENDING REVIEW"}
                              </span>
                              <span className="text-[9px] font-mono text-neutral-400">Placements: Category ads</span>
                            </div>

                            <div>
                              <h4 className="font-bold text-neutral-800 dark:text-white">{ad.title}</h4>
                              <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-2 italic">"{ad.description}"</p>
                            </div>

                            <a 
                              href={ad.link_url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="inline-block text-[9px] font-semibold text-orange-500 hover:underline font-mono"
                            >
                              Destination: {ad.link_url.replace("https://", "").replace("www.", "")} &rarr;
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ======================= FLUTTERWAVE CHECKOUT MODAL overlay ======================= */}
      <AnimatePresence>
        {payingForTier && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-md"
            id="flutterwave-ledger-modal"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white dark:bg-zinc-950 border border-neutral-100 dark:border-neutral-900 rounded-[32px] w-full max-w-sm overflow-hidden text-left relative shadow-2xl"
            >
              {checkoutStep === "input" && (
                <div className="p-5 sm:p-6 space-y-5">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-orange-500 font-bold bg-orange-100/10 px-2.5 py-1 border border-orange-500/20 rounded-xl">
                      <CreditCard size={11} className="animate-pulse" />
                      <span>Flutterwave Secure</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setPayingForTier(null)}
                      className="text-neutral-400 hover:text-neutral-550 dark:hover:text-neutral-100 text-xs py-1"
                    >
                      ✕ Cancel
                    </button>
                  </div>

                  <div className="p-4 bg-neutral-50 dark:bg-zinc-900/60 rounded-2.5xl space-y-1 relative overflow-hidden text-xs">
                    <span className="text-[10px] text-neutral-400 font-mono block">UPGRADE TARGET ORBIT LEVEL</span>
                    <h4 className="text-sm font-serif font-black dark:text-white leading-none pt-0.5">{payingForTier.id} Plan</h4>
                    <p className="text-xl font-bold text-orange-500 font-mono pt-1.5">
                      {payingForTier.price === "$12/mo"
                        ? (isAnnual ? "$93.60 USD total" : "$12.00 USD")
                        : (isAnnual ? "$226.20 USD total" : "$29.00 USD")}
                    </p>
                    <span className="text-[9px] text-neutral-450 block font-mono italic">
                      {isAnnual ? "*Billed once for 365 days lock" : "*Billed relative to monthly cadence"}
                    </span>
                  </div>

                  {/* Payment Channel tabs */}
                  <div className="flex gap-1.5 p-1 rounded-xl bg-neutral-100 dark:bg-zinc-900 border border-neutral-150/45 dark:border-zinc-850">
                    {[
                      { id: "card", label: "Credit Cards", icon: CreditCard },
                      { id: "mobile_money", label: "Mobile Monies", icon: Smartphone },
                      { id: "bank_transfer", label: "Bank Transfer", icon: Landmark }
                    ].map((chan) => {
                      const Icon = chan.icon;
                      const isSel = paymentChannel === chan.id;
                      return (
                        <button
                          key={chan.id}
                          type="button"
                          onClick={() => setPaymentChannel(chan.id as any)}
                          className={`flex-1 flex flex-col items-center justify-center py-2 rounded-lg text-[9px] font-mono leading-none transition cursor-pointer ${
                            isSel 
                              ? "bg-white dark:bg-black text-orange-500 shadow border border-neutral-200/50 dark:border-neutral-850 font-bold" 
                              : "text-neutral-400"
                          }`}
                        >
                          <Icon size={12} className="mb-1" />
                          <span>{chan.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {paymentChannel === "card" && (
                    <div className="space-y-3.5 text-xs">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] text-neutral-400 font-mono uppercase font-bold">
                          <span>Card Details</span>
                          <span className="text-orange-400 font-black tracking-wider">
                            {cardNumber ? detectCardType(cardNumber) : "Verified Core Lock"}
                          </span>
                        </div>
                        <input 
                          type="text"
                          placeholder="e.g. 4012 3456 7890 1234"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(getFormatCardValue(e.target.value))}
                          className="w-full text-xs p-2.5 rounded-xl border border-neutral-250 bg-white dark:bg-black dark:border-neutral-850 dark:text-white font-mono outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-neutral-400 uppercase block font-bold">Expiry Date</label>
                          <input 
                            type="text"
                            placeholder="MM/YY"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(getFormatOptionValue(e.target.value))}
                            className="w-full text-xs p-2.5 rounded-xl border border-neutral-250 bg-white dark:bg-black dark:border-neutral-850 dark:text-white font-mono outline-none text-center"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-neutral-400 uppercase block font-bold">Secured CVV</label>
                          <input 
                            type="password"
                            placeholder="123"
                            maxLength={3}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                            className="w-full text-xs p-2.5 rounded-xl border border-neutral-250 bg-white dark:bg-black dark:border-neutral-850 dark:text-white font-mono outline-none text-center"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-neutral-400 uppercase block font-bold">Cardholder Name</label>
                        <input 
                          type="text"
                          placeholder="Honorable Intimate"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-neutral-250 bg-white dark:bg-black dark:border-neutral-850 dark:text-white font-serif outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {paymentChannel === "mobile_money" && (
                    <div className="space-y-4 text-xs">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-neutral-400 uppercase block font-bold">Operator Network Carrier</label>
                        <select 
                          value={momoNetwork}
                          onChange={(e) => setMomoNetwork(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-neutral-250 bg-white dark:bg-black dark:border-neutral-850 dark:text-white font-sans outline-none cursor-pointer"
                        >
                          <option value="MTN">MTN Mobile Money MoMo</option>
                          <option value="Orange">Orange Money Carrier</option>
                          <option value="Airtel">Airtel Money Ledger</option>
                          <option value="Vodafone">Vodafone Cash Ledger</option>
                          <option value="M-Pesa">M-Pesa Direct</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-neutral-400 uppercase block font-bold">Active Mobile Account Connection</label>
                        <input 
                          type="tel"
                          placeholder="+233 / +234 Mobile Phone Number"
                          value={momoNumber}
                          onChange={(e) => setMomoNumber(e.target.value.replace(/[^\d+]/g, ""))}
                          className="w-full text-xs p-2.5 rounded-xl border border-neutral-250 bg-white dark:bg-black dark:border-neutral-850 dark:text-white font-mono outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {paymentChannel === "bank_transfer" && (
                    <div className="space-y-4 text-xs">
                      <div className="p-4 bg-neutral-100 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-850 rounded-2.5xl space-y-2 font-mono text-[10.5px] leading-relaxed text-neutral-550 dark:text-neutral-350">
                        <div className="flex justify-between border-b dark:border-neutral-850 pb-1.5">
                          <span className="font-bold">Beneficiary Entity:</span>
                          <span className="text-neutral-800 dark:text-white">Palrene Safe Ledger</span>
                        </div>
                        <div className="flex justify-between border-b dark:border-neutral-850 pb-1.5">
                          <span className="font-bold">Receiving Bank:</span>
                          <span className="text-neutral-800 dark:text-white">Standford Ledger Trust</span>
                        </div>
                        <div className="flex justify-between border-b dark:border-neutral-850 pb-1.5">
                          <span className="font-bold">Assigned Account No:</span>
                          <span className="text-orange-500 font-bold">3029 4118 7022 4110</span>
                        </div>
                        <div className="text-[9px] text-neutral-400 text-center pt-1 italic font-serif">
                          *A unique settlement address created for your intimate security. Transfer settles immediately.
                        </div>
                      </div>

                      <div className="text-[10px] text-center font-serif text-neutral-400 flex items-center justify-center gap-1">
                        <Info size={11} className="text-orange-500" />
                        <span>After transferring matching sum, press Confirm below.</span>
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={triggerPaymentProcessing}
                      className="w-full py-3.5 bg-gradient-to-r from-red-500 via-orange-500 to-rose-600 hover:scale-[1.01] active:scale-99 text-white font-mono text-[10px] font-bold uppercase tracking-wider rounded-2xl cursor-pointer shadow-lg leading-none"
                    >
                      Authorize secure upgrade
                    </button>
                  </div>
                </div>
              )}

              {checkoutStep === "processing" && (
                <div className="p-8 text-center space-y-5">
                  <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <div className="space-y-2">
                    <h4 className="text-sm font-mono font-bold uppercase tracking-wider text-neutral-800 dark:text-zinc-200">Payment Authorization active</h4>
                    <p className="text-xs text-neutral-405 text-neutral-400 font-serif leading-relaxed dark:text-neutral-400 px-2 animate-pulse">
                      "{processingStatus}"
                    </p>
                  </div>
                </div>
              )}

              {checkoutStep === "success" && (
                <div className="p-6 text-center space-y-6">
                  <div className="w-14 h-14 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full flex items-center justify-center mx-auto shadow-md">
                    <Check size={28} className="stroke-[3.5] animate-bounce" />
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-md font-serif font-black text-neutral-800 dark:text-white">Resonance Level Synchronized!</h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-350 leading-relaxed font-serif px-2">
                      Your ledger transactions completed successfully. Your profile parameters now list at level **{payingForTier.id}** with full matching credentials.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleCloseSuccess}
                      className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-mono text-[10px] font-bold uppercase tracking-wider rounded-2xl cursor-pointer"
                    >
                      Return to Tuning
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Subcomponent Glow icons logic
function GlowIcon(Icon: any) {
  return function(props: any) {
    return <Icon {...props} className={`${props.className || ""} text-orange-500`} />;
  };
}
