import React, { useState } from "react";
import { useStore } from "../../store";
import { motion, AnimatePresence } from "motion/react";
import {
  Settings as Sliders,
  Shield,
  CreditCard,
  Sparkles,
  Check,
  Mail,
  Award,
  Crown,
  Zap,
  Plus,
  Smartphone,
  Landmark,
  Eye,
} from "lucide-react";
import {
  AppCard,
  Button,
  Badge,
  Input,
  EmptyState,
  SectionHeader,
  TabNav,
} from "../ui";
import TokenWallet from "../tokens/TokenWallet";
import RewardedAdModal from "../tokens/RewardedAdModal";

export default function SettingsPanel() {
  const {
    currentUser,
    setSubscriptionTier,
    triggerEmailAlert,
    addPaymentTransaction,
    ads,
    submitAd,
  } = useStore();

  const [activeTab, setActiveTab] = useState<
    "billing" | "safeguards" | "ads" | "tokens"
  >("billing");
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);

  // Checkout state
  const [payingForTier, setPayingForTier] = useState<any | null>(null);
  const [paymentChannel, setPaymentChannel] = useState<
    "card" | "mobile_money" | "bank_transfer"
  >("card");

  // Card input
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");

  // Mobile money
  const [momoNumber, setMomoNumber] = useState("");
  const [momoNetwork, setMomoNetwork] = useState("MTN");

  // Checkout flow
  const [checkoutStep, setCheckoutStep] = useState<
    "input" | "processing" | "success"
  >("input");
  const [processingStatus, setProcessingStatus] = useState("");

  // Ad builder
  const [showAdBuilder, setShowAdBuilder] = useState(false);
  const [adTitle, setAdTitle] = useState("");
  const [adDesc, setAdDesc] = useState("");
  const [adLink, setAdLink] = useState("");
  const [adBudget, setAdBudget] = useState(25);
  const [customAdImage, setCustomAdImage] = useState("");
  const [selectedPresetImage, setSelectedPresetImage] = useState(
    "https://images.unsplash.com/photo-1518244979147-3b77e9eb2e0d?w=400&auto=format&fit=crop&q=80",
  );

  const presetBannerImages = [
    {
      label: "Sound Therapy",
      url: "https://images.unsplash.com/photo-1518244979147-3b77e9eb2e0d?w=400&auto=format&fit=crop&q=80",
    },
    {
      label: "Coffee",
      url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&auto=format&fit=crop&q=80",
    },
    {
      label: "Retreat",
      url: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&auto=format&fit=crop&q=80",
    },
    {
      label: "Books",
      url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&auto=format&fit=crop&q=80",
    },
  ];

  const formatCardValue = (val: string) => {
    let clean = val.replace(/\D/g, "");
    let matches = clean.match(/.{1,4}/g);
    return matches ? matches.join(" ").slice(0, 19) : clean;
  };

  const formatExpiry = (val: string) => {
    let clean = val.replace(/\D/g, "");
    if (clean.length > 2) return clean.slice(0, 2) + "/" + clean.slice(2, 4);
    return clean;
  };

  const detectCardType = (num: string) => {
    if (num.startsWith("4")) return "Visa";
    if (num.startsWith("5")) return "Mastercard";
    return "Card";
  };

  const prices = isAnnual
    ? {
        Free: "$0",
        Starter: "$7.80/mo",
        Pro: "$18.85/mo",
        noteStarter: "Billed $93.60/year",
        notePro: "Billed $226.20/year",
      }
    : { Free: "$0", Starter: "$12/mo", Pro: "$29/mo" };

  const billingTiers = [
    {
      id: "Free",
      price: prices.Free,
      desc: "Begin seeking companion souls with essential features.",
      badge: "Free",
      features: [
        "10 Messages/day",
        "Essential feed access",
        "Public chat circles",
        "Limited AI advisor",
      ],
    },
    {
      id: "Starter",
      price: prices.Starter,
      billNote: isAnnual ? prices.noteStarter : "Billed monthly",
      desc: "Unlock verification and deeper matching.",
      badge: "Starter",
      features: [
        "Identity verification",
        "50 DMs/day",
        "No sponsored ads",
        "Priority match visibility",
      ],
    },
    {
      id: "Pro",
      price: prices.Pro,
      billNote: isAnnual ? prices.notePro : "Billed monthly",
      desc: "Unlimited access and ad creation tools.",
      badge: "Pro",
      features: [
        "Unlimited DMs",
        "Priority verification < 2 hours",
        "Ad campaign builder",
        "2 Free boosts/month",
        "Premium circles",
      ],
    },
  ];

  const handleOpenCheckout = (tier: any) => {
    setPayingForTier(tier);
    setCheckoutStep("input");
    setCardNumber("");
    setCardExpiry("");
    setCardCvv("");
    setMomoNumber("");
  };

  const triggerPayment = () => {
    if (paymentChannel === "card" && (!cardNumber || !cardExpiry || !cardCvv)) {
      alert("Please provide valid card details.");
      return;
    }
    if (paymentChannel === "mobile_money" && !momoNumber) {
      alert("Please enter a valid mobile money number.");
      return;
    }

    setCheckoutStep("processing");
    const milestones = [
      "Processing payment...",
      "Validating credentials...",
      "Confirming transaction...",
      "Completing upgrade...",
    ];

    let current = 0;
    setProcessingStatus(milestones[0]);
    const interval = setInterval(() => {
      current++;
      if (current < milestones.length) {
        setProcessingStatus(milestones[current]);
      } else {
        clearInterval(interval);
        finalizeUpgrade();
      }
    }, 1200);
  };

  const finalizeUpgrade = () => {
    if (!currentUser || !payingForTier) return;
    const amount =
      payingForTier.id === "Starter"
        ? isAnnual
          ? 93.6
          : 12
        : isAnnual
          ? 226.2
          : 29;
    const transactionId = `tx_${Date.now()}`;

    addPaymentTransaction({
      id: transactionId,
      userId: currentUser.id,
      userName: currentUser.full_name,
      plan: payingForTier.id,
      amount,
      status: "successful",
      provider: "Payment Gateway",
      created_at: new Date().toISOString(),
    });

    setSubscriptionTier(payingForTier.id);
    setCheckoutStep("success");
  };

  const closeCheckout = () => setPayingForTier(null);

  const handleAdPublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adTitle.trim() || !adDesc.trim() || !adLink.trim()) {
      alert("Please fill all fields.");
      return;
    }
    submitAd(
      adTitle.trim(),
      adDesc.trim(),
      adLink.trim(),
      customAdImage.trim() || selectedPresetImage,
    );
    setAdTitle("");
    setAdDesc("");
    setAdLink("");
    setShowAdBuilder(false);
  };

  const userAds = ads.filter((ad) => ad.created_by === currentUser?.id);

  const tabs = [
    {
      id: "billing",
      label: "Billing",
      icon: <CreditCard className="w-3.5 h-3.5" />,
    },
    {
      id: "safeguards",
      label: "Safeguards",
      icon: <Shield className="w-3.5 h-3.5" />,
    },
    { id: "ads", label: "Ads", icon: <Crown className="w-3.5 h-3.5" /> },
    { id: "tokens", label: "Tokens", icon: <Zap className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="flex-1 h-[calc(100vh-62px)] overflow-y-auto pb-24 md:pb-6">
      <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <SectionHeader
          title="Settings"
          subtitle="Manage your account, billing, and preferences"
          icon={<Sliders className="w-5 h-5 text-orange-500" />}
        />

        {/* Tabs */}
        <TabNav
          tabs={tabs}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as any)}
        />

        {/* Billing Tab */}
        {activeTab === "billing" && (
          <div className="space-y-6">
            {/* Billing Cycle Toggle */}
            <AppCard
              variant="outlined"
              padding="md"
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Billing Cycle
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Save 35% with annual billing
                </p>
              </div>
              <div className="flex rounded-xl bg-neutral-100 dark:bg-neutral-800 p-1 gap-1">
                <button
                  onClick={() => setIsAnnual(false)}
                  className={`px-4 py-2 text-xs font-medium rounded-lg transition ${
                    !isAnnual
                      ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow"
                      : "text-neutral-500"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setIsAnnual(true)}
                  className={`px-4 py-2 text-xs font-medium rounded-lg transition flex items-center gap-2 ${
                    isAnnual
                      ? "bg-white dark:bg-neutral-900 text-orange-500 shadow"
                      : "text-neutral-500"
                  }`}
                >
                  Annual
                  <Badge variant="warning" size="sm">
                    Save 35%
                  </Badge>
                </button>
              </div>
            </AppCard>

            {/* Tiers */}
            <div className="space-y-4">
              {billingTiers.map((tier) => {
                const isCurrent =
                  (currentUser?.subscription_tier || "Free") === tier.id;
                const isPremium = tier.id === "Pro";

                return (
                  <AppCard
                    key={tier.id}
                    variant={isCurrent ? "elevated" : "outlined"}
                    padding="lg"
                    className={`relative ${
                      isCurrent
                        ? "ring-2 ring-orange-500 border-transparent"
                        : ""
                    }`}
                  >
                    {isCurrent && (
                      <div className="absolute top-0 right-0 bg-linear-to-r from-red-500 to-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wide flex items-center gap-1">
                        <Check className="w-3 h-3" /> Active
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                      <div>
                        <Badge
                          variant={isPremium ? "warning" : "secondary"}
                          size="sm"
                          className="mb-2"
                        >
                          {tier.badge}
                        </Badge>
                        <h4 className="text-lg font-bold text-neutral-900 dark:text-white">
                          {tier.id} Plan
                        </h4>
                        <p className="text-2xl font-bold text-neutral-900 dark:text-white flex items-baseline gap-1">
                          {tier.price}
                          {tier.billNote && (
                            <span className="text-xs text-neutral-400 font-normal">
                              ({tier.billNote})
                            </span>
                          )}
                        </p>
                      </div>

                      {!isCurrent && (
                        <Button
                          variant="primary"
                          size="md"
                          onClick={() => handleOpenCheckout(tier)}
                        >
                          Upgrade
                        </Button>
                      )}
                    </div>

                    <p className="text-xs text-neutral-500 dark:text-neutral-400 italic mb-4">
                      "{tier.desc}"
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {tier.features.map((feature, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400"
                        >
                          <div className="w-5 h-5 rounded-full bg-orange-500/10 flex items-center justify-center">
                            <Check className="w-3 h-3 text-orange-500" />
                          </div>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </AppCard>
                );
              })}
            </div>
          </div>
        )}

        {/* Safeguards Tab */}
        {activeTab === "safeguards" && (
          <AppCard variant="outlined" padding="lg">
            <SectionHeader
              title="Privacy & Safeguards"
              subtitle="Control your boundaries"
              icon={<Shield className="w-5 h-5 text-orange-500" />}
              className="mb-6"
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900">
                <div>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                    Daylight Blurring
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Blur sensitive content during daytime hours
                  </p>
                </div>
                <input type="checkbox" className="w-5 h-5 accent-orange-500" />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900">
                <div>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                    Email Alerts
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Receive notifications about new messages
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5 accent-orange-500"
                />
              </div>
            </div>
          </AppCard>
        )}

        {/* Ads Tab */}
        {activeTab === "ads" && (
          <div className="space-y-6">
            {currentUser?.subscription_tier !== "Pro" ? (
              <AppCard variant="outlined" padding="lg" className="text-center">
                <Crown className="w-12 h-12 mx-auto text-amber-500 mb-4" />
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                  Ad Campaign Builder
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                  Upgrade to Pro to create and manage ad campaigns.
                </p>
                <Button
                  variant="primary"
                  onClick={() => setActiveTab("billing")}
                >
                  Upgrade to Pro
                </Button>
              </AppCard>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <SectionHeader
                    title="My Campaigns"
                    subtitle="Manage your promoted content"
                    icon={<Crown className="w-5 h-5 text-orange-500" />}
                    className="mb-0"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowAdBuilder(true)}
                    icon={<Plus className="w-4 h-4" />}
                  >
                    Create Ad
                  </Button>
                </div>

                {showAdBuilder ? (
                  <AppCard variant="outlined" padding="lg">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                        New Campaign
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAdBuilder(false)}
                      >
                        Cancel
                      </Button>
                    </div>

                    <form onSubmit={handleAdPublish} className="space-y-4">
                      <Input
                        label="Campaign Title"
                        placeholder="e.g. Guided Solitude Event"
                        value={adTitle}
                        onChange={(e) => setAdTitle(e.target.value)}
                      />

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                          Description
                        </label>
                        <textarea
                          placeholder="Describe your campaign..."
                          value={adDesc}
                          onChange={(e) => setAdDesc(e.target.value)}
                          className="w-full h-20 p-3 text-sm rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white resize-none focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      <Input
                        label="Destination Link"
                        placeholder="https://example.com"
                        value={adLink}
                        onChange={(e) => setAdLink(e.target.value)}
                      />

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                          Banner Image
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {presetBannerImages.map((img) => (
                            <img
                              key={img.label}
                              src={img.url}
                              alt={img.label}
                              onClick={() => {
                                setSelectedPresetImage(img.url);
                                setCustomAdImage("");
                              }}
                              className={`rounded-lg aspect-video object-cover cursor-pointer transition ${
                                selectedPresetImage === img.url &&
                                !customAdImage
                                  ? "ring-2 ring-orange-500"
                                  : "opacity-60 hover:opacity-100"
                              }`}
                            />
                          ))}
                        </div>
                        <Input
                          placeholder="Or enter custom image URL..."
                          value={customAdImage}
                          onChange={(e) => {
                            setCustomAdImage(e.target.value);
                            setSelectedPresetImage("");
                          }}
                        />
                      </div>

                      <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-neutral-700 dark:text-neutral-300">
                            Budget
                          </span>
                          <span className="font-bold text-orange-500">
                            ${adBudget}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={5}
                          max={200}
                          value={adBudget}
                          onChange={(e) =>
                            setAdBudget(parseInt(e.target.value))
                          }
                          className="w-full accent-orange-500"
                        />
                        <p className="text-xs text-neutral-500">
                          ~{adBudget * 900} impressions
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          className="flex-1"
                          onClick={() => setShowAdBuilder(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" className="flex-1">
                          Publish Ad
                        </Button>
                      </div>
                    </form>
                  </AppCard>
                ) : userAds.length === 0 ? (
                  <EmptyState
                    title="No campaigns yet"
                    description="Create your first ad to reach thousands"
                    icon={<Crown className="w-6 h-6" />}
                  />
                ) : (
                  <div className="space-y-4">
                    {userAds.map((ad) => (
                      <AppCard
                        key={ad.id}
                        variant="outlined"
                        padding="md"
                        className="flex gap-4"
                      >
                        <img
                          src={ad.image_url}
                          alt=""
                          className="w-24 h-24 rounded-xl object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <Badge
                            variant={
                              ad.status === "approved"
                                ? "success"
                                : ad.status === "rejected"
                                  ? "error"
                                  : "warning"
                            }
                            size="sm"
                            className="mb-2"
                          >
                            {ad.status}
                          </Badge>
                          <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                            {ad.title}
                          </h4>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1">
                            {ad.description}
                          </p>
                        </div>
                      </AppCard>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Tokens Tab */}
        {activeTab === "tokens" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <SectionHeader
                title="Token Wallet"
                subtitle="Earn and spend PAL tokens"
                icon={<Zap className="w-5 h-5 text-orange-500" />}
                className="mb-0"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={() => setAdModalOpen(true)}
                icon={<Zap className="w-4 h-4" />}
              >
                Watch Ad (+15)
              </Button>
            </div>

            <TokenWallet />
          </div>
        )}

        {/* Rewarded Ad Modal */}
        <RewardedAdModal
          isOpen={adModalOpen}
          onClose={() => setAdModalOpen(false)}
        />

        {/* Checkout Modal */}
        <AnimatePresence>
          {payingForTier && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
              onClick={(e) => e.target === e.currentTarget && closeCheckout()}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-md bg-white dark:bg-neutral-950 rounded-2xl overflow-hidden shadow-2xl border border-neutral-200 dark:border-neutral-800"
              >
                {checkoutStep === "input" && (
                  <div className="p-6 space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-orange-500" />
                        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                          Checkout
                        </h3>
                      </div>
                      <button
                        onClick={closeCheckout}
                        className="text-neutral-400 hover:text-neutral-600"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                      <p className="text-xs text-neutral-500">Upgrading to</p>
                      <h4 className="text-lg font-bold text-neutral-900 dark:text-white">
                        {payingForTier.id} Plan
                      </h4>
                      <p className="text-xl font-bold text-orange-500">
                        {payingForTier.price}
                      </p>
                    </div>

                    {/* Payment channel tabs */}
                    <div className="flex gap-2 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-900">
                      {[
                        {
                          id: "card",
                          label: "Card",
                          icon: <CreditCard className="w-4 h-4" />,
                        },
                        {
                          id: "mobile_money",
                          label: "Mobile",
                          icon: <Smartphone className="w-4 h-4" />,
                        },
                        {
                          id: "bank_transfer",
                          label: "Bank",
                          icon: <Landmark className="w-4 h-4" />,
                        },
                      ].map((ch) => (
                        <button
                          key={ch.id}
                          onClick={() => setPaymentChannel(ch.id as any)}
                          className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium rounded-lg transition ${
                            paymentChannel === ch.id
                              ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow"
                              : "text-neutral-500"
                          }`}
                        >
                          {ch.icon}
                          {ch.label}
                        </button>
                      ))}
                    </div>

                    {paymentChannel === "card" && (
                      <div className="space-y-3">
                        <Input
                          label="Card Number"
                          placeholder="1234 5678 9012 3456"
                          value={cardNumber}
                          onChange={(e) =>
                            setCardNumber(formatCardValue(e.target.value))
                          }
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            label="Expiry"
                            placeholder="MM/YY"
                            value={cardExpiry}
                            onChange={(e) =>
                              setCardExpiry(formatExpiry(e.target.value))
                            }
                          />
                          <Input
                            label="CVV"
                            type="password"
                            placeholder="123"
                            maxLength={3}
                            value={cardCvv}
                            onChange={(e) =>
                              setCardCvv(e.target.value.replace(/\D/g, ""))
                            }
                          />
                        </div>
                        <Input
                          label="Cardholder Name"
                          placeholder="John Doe"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                        />
                      </div>
                    )}

                    {paymentChannel === "mobile_money" && (
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                            Network
                          </label>
                          <select
                            value={momoNetwork}
                            onChange={(e) => setMomoNetwork(e.target.value)}
                            className="w-full px-3 py-2.5 text-sm rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700"
                          >
                            <option>MTN</option>
                            <option>Orange</option>
                            <option>Airtel</option>
                            <option>Vodafone</option>
                            <option>M-Pesa</option>
                          </select>
                        </div>
                        <Input
                          label="Mobile Number"
                          placeholder="+233..."
                          value={momoNumber}
                          onChange={(e) =>
                            setMomoNumber(e.target.value.replace(/[^\d+]/g, ""))
                          }
                        />
                      </div>
                    )}

                    {paymentChannel === "bank_transfer" && (
                      <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Beneficiary</span>
                          <span className="text-neutral-900 dark:text-white font-medium">
                            Palrene Ltd
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Account</span>
                          <span className="text-orange-500 font-bold">
                            3029 4118 7022 4110
                          </span>
                        </div>
                        <p className="text-neutral-400 text-center pt-2 italic">
                          Transfer the amount and click confirm
                        </p>
                      </div>
                    )}

                    <Button
                      variant="primary"
                      size="lg"
                      onClick={triggerPayment}
                      className="w-full"
                    >
                      Complete Payment
                    </Button>
                  </div>
                )}

                {checkoutStep === "processing" && (
                  <div className="p-8 text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {processingStatus}
                    </p>
                  </div>
                )}

                {checkoutStep === "success" && (
                  <div className="p-8 text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                      <Check className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h4 className="text-lg font-bold text-neutral-900 dark:text-white">
                      Upgrade Complete!
                    </h4>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      You're now on the {payingForTier.id} plan.
                    </p>
                    <Button
                      variant="primary"
                      onClick={closeCheckout}
                      className="w-full"
                    >
                      Done
                    </Button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
