import React, { useState } from "react";
import { useStore } from "../../store";
import { motion } from "motion/react";
import {
  Building,
  Award,
  Users,
  FileText,
  ShieldAlert,
  ChartLine as LineChart,
  TrendingUp,
  Check,
  X,
  Megaphone,
  CreditCard,
  Target,
  ShieldOff,
  DollarSign,
} from "lucide-react";

export default function AdminDashboard() {
  const {
    profiles,
    posts,
    approveVerification,
    rejectVerification,
    moderatePost,
    setView,
    payments,
    refundPaymentTransaction,
    disableSubscription,
    ads,
    approveAd,
    rejectAd,
  } = useStore();
  const [activeSegment, setActiveSegment] = useState<
    "analytics" | "verifications" | "moderation" | "payments" | "ads"
  >("analytics");

  // Filter profiles that are verification-pending (in our mock data we can filter mock identities or currently unverified starter users)
  const pendingVerifications = profiles.filter(
    (p) =>
      p.is_verified === false && p.verification_video_url && p.id !== "poly-ai",
  );

  // reported posts calculations checks
  const reportedPostsList = posts.filter((p) => p.is_sensitive === true);

  // pending ads review
  const pendingAds = ads.filter((a) => a.status === "pending");

  const handleApproveVerification = (id: string) => {
    approveVerification(id);
    alert("Profile manual ID matching accepted! verification seal added.");
  };

  const handleDenyVerification = (id: string) => {
    rejectVerification(id);
    alert("Profile manual ID rejected, notification dispatched safely.");
  };

  return (
    <div className="flex-1 p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-62px)] overflow-y-auto pb-c-safe text-left">
      {/* Drawer Segments Selector sidebar */}
      <div className="space-y-4 lg:col-span-1">
        <div className="p-4 rounded-3xl bg-neutral-50 dark:bg-zinc-950/45 border border-neutral-150/45 dark:border-neutral-900 shadow-sm space-y-4">
          <div className="space-y-1">
            <h2 className="text-md font-serif font-bold text-neutral-900 dark:text-white flex items-center gap-1">
              <Building size={16} className="text-red-500" />
              <span>Harbor Administration</span>
            </h2>
            <p className="text-[11px] text-neutral-400 font-mono">
              Operations workspace for auto-admins.
            </p>
          </div>

          <div className="flex flex-col gap-1.5 pt-2">
            {[
              {
                id: "analytics",
                label: "Operations Analytics",
                icon: LineChart,
              },
              {
                id: "verifications",
                label: `Verify ID Reviews (${pendingVerifications.length})`,
                icon: Award,
              },
              {
                id: "moderation",
                label: `Posts Moderation Logs (${reportedPostsList.length})`,
                icon: ShieldAlert,
              },
              {
                id: "payments",
                label: `Revenue & Ledger (${payments.filter((p) => p.status === "successful").length})`,
                icon: CreditCard,
              },
              {
                id: "ads",
                label: `Review Sponsored Ads (${pendingAds.length})`,
                icon: Megaphone,
              },
            ].map((seg) => {
              const Icon = seg.icon;
              const isChosen = activeSegment === seg.id;
              return (
                <button
                  key={seg.id}
                  onClick={() => setActiveSegment(seg.id as any)}
                  className={`flex items-center space-x-2.5 px-4 py-3 rounded-2xl text-xs font-mono font-medium transition outline-none cursor-pointer text-left ${
                    isChosen
                      ? "bg-linear-to-r from-red-500 to-orange-500 text-white font-bold"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  <Icon size={14} />
                  <span>{seg.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main workspace section */}
      <div className="lg:col-span-3 space-y-6">
        {/* SEGMENT 1: OPERATIONS ANALYTICS (simulating lovely responsive charts with CSS/Tailwind) */}
        {activeSegment === "analytics" && (
          <div className="space-y-6">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
              Palrene global workspace telemetry
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-5 border border-neutral-200/50 dark:border-neutral-900 rounded-3xl bg-neutral-50 dark:bg-zinc-950/45">
                <span className="text-[10px] font-mono text-neutral-400 uppercase">
                  Resonating Traffic / hr
                </span>
                <div className="flex items-end space-x-2.5 mt-2">
                  <span className="text-2xl font-bold dark:text-white">
                    41.8K
                  </span>
                  <span className="text-[9px] font-mono text-green-500 flex items-center gap-0.5 mb-1 bg-green-500/10 px-1 rounded font-bold">
                    <TrendingUp size={9} /> +12%
                  </span>
                </div>
              </div>

              <div className="p-5 border border-neutral-200/50 dark:border-neutral-900 rounded-3xl bg-neutral-50 dark:bg-zinc-950/45">
                <span className="text-[10px] font-mono text-neutral-450 uppercase">
                  Subscribed Seekers
                </span>
                <div className="flex items-end space-x-2.5 mt-2">
                  <span className="text-2xl font-bold dark:text-white">
                    5.1K
                  </span>
                  <span className="text-[9px] font-mono text-green-500 flex items-center gap-0.5 mb-1 bg-green-500/10 px-1 rounded font-bold">
                    <TrendingUp size={9} /> +4%
                  </span>
                </div>
              </div>

              <div className="p-5 border border-neutral-200/50 dark:border-neutral-900 rounded-3xl bg-neutral-50 dark:bg-zinc-950/45">
                <span className="text-[10px] font-mono text-neutral-400 uppercase">
                  Poly advice requests
                </span>
                <div className="flex items-end space-x-2.5 mt-2">
                  <span className="text-2xl font-bold dark:text-white">
                    12.9K
                  </span>
                  <span className="text-[9px] font-mono text-orange-500 flex items-center gap-0.5 mb-1 bg-orange-500/10 px-1 rounded font-bold">
                    ACTIVE
                  </span>
                </div>
              </div>

              <div className="p-5 border border-neutral-200/50 dark:border-neutral-900 rounded-3xl bg-neutral-50 dark:bg-zinc-950/45 relative overflow-hidden group hover:border-red-500/30 transition">
                <span className="text-[10px] font-mono text-neutral-400 uppercase">
                  Reported Ripples
                </span>
                <div className="flex items-end space-x-2.5 mt-2">
                  <span className="text-2xl font-bold text-red-500">
                    {reportedPostsList.length}
                  </span>
                  <span className="text-[9px] font-mono text-red-500 flex items-center gap-0.5 mb-1 bg-red-500/10 px-1.5 rounded font-bold uppercase tracking-wider">
                    Unresolved
                  </span>
                </div>
              </div>
            </div>

            {/* Custom high-contrast SVG representation bar layout inside HTML */}
            <div className="p-6 border border-neutral-150/45 dark:border-neutral-900 rounded-3xl bg-neutral-50 dark:bg-zinc-950/30 space-y-4">
              <span className="text-[10px] font-mono text-neutral-450 uppercase block">
                Weekly Active Match Waves
              </span>
              <div className="h-44 flex items-end justify-between gap-2.5 pt-4">
                {[45, 62, 75, 48, 85, 91, 100].map((val, idx) => (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col justify-end items-center"
                  >
                    <div
                      className="w-full bg-linear-to-t from-red-500 to-orange-500 rounded-lg transition-all duration-1000"
                      style={{ height: `${val}%` }}
                    />
                    <span className="text-[8px] font-mono text-neutral-400 mt-2">
                      Day {idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SEGMENT 2: VERIFICATION REQUEST REVIEWS */}
        {activeSegment === "verifications" && (
          <div className="space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
              Identity verification matching review queues
            </h3>

            {pendingVerifications.length === 0 ? (
              <p className="text-xs text-neutral-400 font-mono text-center py-16 bg-neutral-50 dark:bg-neutral-950/35 border border-neutral-105 rounded-3xl">
                Review slate clean. No pending manuals passport submissions.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingVerifications.map((p) => (
                  <div
                    key={p.id}
                    className="p-5 border border-neutral-150/50 dark:border-neutral-900 rounded-3xl bg-neutral-50 dark:bg-zinc-950/45 space-y-4 text-xs"
                  >
                    <div className="flex items-center space-x-3.5">
                      <img
                        src={p.avatar_url}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover border"
                      />
                      <div>
                        <h4 className="font-bold text-neutral-800 dark:text-white">
                          {p.full_name}
                        </h4>
                        <p className="text-[9px] font-mono text-neutral-400">
                          @{p.username}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-neutral-100 dark:bg-zinc-900 rounded-xl space-y-3 mt-2 text-left border border-neutral-150/20 dark:border-zinc-850">
                      <p className="text-[10px] uppercase tracking-wider font-mono font-bold text-orange-500">
                        Identity Files review
                      </p>

                      <div className="space-y-3">
                        {/* 30-Second Verification video segment */}
                        <div>
                          <span className="text-[9px] font-mono text-neutral-400 dark:text-neutral-500 block mb-1">
                            30s Selfie Clip Verification:
                          </span>
                          {p.verification_video_url ? (
                            <div className="rounded-xl overflow-hidden max-h-40 border border-neutral-250 dark:border-zinc-800 bg-neutral-950 aspect-video flex items-center justify-center">
                              <video
                                src={p.verification_video_url}
                                controls
                                className="w-full h-full object-contain"
                              />
                            </div>
                          ) : (
                            <div className="rounded-xl overflow-hidden p-2 bg-zinc-900 border border-zinc-850 text-center space-y-1.5">
                              <p className="text-[9.5px] italic text-neutral-400 font-serif">
                                [Simulated 30s verification video loaded in live
                                sandbox]
                              </p>
                              <video
                                src="https://assets.mixkit.co/videos/preview/mixkit-dramatic-female-portrait-with-red-lighting-40546-large.mp4"
                                controls
                                className="w-full h-32 object-cover rounded-lg border border-zinc-800 bg-neutral-950 mt-1"
                                playsInline
                              />
                            </div>
                          )}
                        </div>

                        {/* ID Document segment */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div>
                            <span className="text-[9px] font-mono text-neutral-400 dark:text-neutral-500 block mb-1">
                              ID Document Front:
                            </span>
                            <img
                              src={
                                p.verification_doc_front_url ||
                                "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=450&auto=format&fit=crop&q=80"
                              }
                              alt="Passport ID Front preview"
                              className="rounded-xl border border-neutral-250 dark:border-zinc-800 w-full object-cover aspect-video bg-neutral-950"
                              referrerPolicy="no-referrer"
                            />
                            {!p.verification_doc_front_url && (
                              <span className="text-[8px] font-mono text-neutral-450 italic mt-0.5 block text-center">
                                [Mock front ID review]
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="text-[9px] font-mono text-neutral-400 dark:text-neutral-500 block mb-1">
                              ID Document Back:
                            </span>
                            <img
                              src={
                                p.verification_doc_back_url ||
                                "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=450&auto=format&fit=crop&q=80"
                              }
                              alt="Passport ID Back preview"
                              className="rounded-xl border border-neutral-250 dark:border-zinc-800 w-full object-cover aspect-video bg-neutral-950"
                              referrerPolicy="no-referrer"
                            />
                            {!p.verification_doc_back_url && (
                              <span className="text-[8px] font-mono text-neutral-455 text-neutral-450 italic mt-0.5 block text-center">
                                [Mock back ID review]
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDenyVerification(p.id)}
                        className="flex-1 py-1.5 font-mono text-[10px] font-bold text-neutral-500 border rounded-lg hover:border-red-500 hover:text-red-500 transition duration-350"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApproveVerification(p.id)}
                        className="flex-1 py-1.5 font-mono text-[10px] font-bold text-white bg-green-500 rounded-lg hover:bg-green-600 transition duration-350 flex items-center justify-center gap-1"
                      >
                        <Check size={12} />
                        <span>Confirm verification</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SEGMENT 3: POSTS MODERATION LOGS */}
        {activeSegment === "moderation" && (
          <div className="space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
              Reported ripples moderation log queue
            </h3>

            <div className="space-y-3">
              {reportedPostsList.length === 0 ? (
                <div className="p-8 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl bg-neutral-50 dark:bg-zinc-950/20 text-center py-12">
                  <p className="text-xs text-neutral-400 font-mono">
                    Moderation queue clean. All connections operate within
                    compliance.
                  </p>
                </div>
              ) : (
                reportedPostsList.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 border border-neutral-150/45 dark:border-neutral-900 rounded-3xl bg-neutral-50 dark:bg-zinc-950/45 flex items-start justify-between text-xs"
                  >
                    <div className="space-y-2">
                      <span className="text-[8px] font-mono bg-red-500/10 text-red-500 px-1.5 rounded uppercase font-bold tracking-widest leading-none">
                        Reported for Sensitive contents
                      </span>
                      <p className="text-neutral-600 dark:text-neutral-400 italic">
                        "{post.content}"
                      </p>
                      <span className="text-[9px] font-mono text-neutral-450 block">
                        By @{post.profile.username}
                      </span>
                    </div>

                    <div className="flex gap-2 pl-4 shrink-0">
                      <button
                        onClick={() => {
                          moderatePost(post.id, "allow");
                          alert("Post marked as safe, reports dismissed.");
                        }}
                        className="p-2 bg-neutral-100 dark:bg-neutral-900 rounded-xl hover:text-green-500 cursor-pointer"
                        title="Clear post status"
                      >
                        <Check size={13} />
                      </button>
                      <button
                        onClick={() => {
                          moderatePost(post.id, "delete");
                          alert("Post deleted from feed successfully.");
                        }}
                        className="p-2 bg-neutral-150 dark:bg-zinc-900 rounded-xl hover:text-red-500 cursor-pointer"
                        title="Ban / Hide post status"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* SEGMENT 4: REVENUE & TRANSACTIONS LEDGER */}
        {activeSegment === "payments" && (
          <div className="space-y-6 animate-fade-in text-left">
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
                Palrene Financial telemetry and secure subscriber ledger
              </h3>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Audit transaction flows, process Flutterwave ledger refunds, and
                enforce safety bans.
              </p>
            </div>

            {/* Micro analytics stats banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl border border-neutral-150/50 dark:border-neutral-900 bg-neutral-50 dark:bg-zinc-950/20 text-xs">
                <span className="text-[10px] uppercase font-mono text-neutral-400 font-bold block">
                  Gross Ledger Sales
                </span>
                <span className="text-xl font-bold font-mono text-green-500 block mt-1">
                  $
                  {payments
                    .filter((p) => p.status === "successful")
                    .reduce((acc, curr) => acc + curr.amount, 0)
                    .toFixed(2)}{" "}
                  USD
                </span>
                <p className="text-[9px] text-neutral-450 mt-0.5">
                  Settled via Flutterwave integrations.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-neutral-150/50 dark:border-neutral-900 bg-neutral-50 dark:bg-zinc-950/20 text-xs">
                <span className="text-[10px] uppercase font-mono text-neutral-400 font-bold block">
                  Total Funds Refunded
                </span>
                <span className="text-xl font-bold font-mono text-red-500 block mt-1">
                  $
                  {payments
                    .filter((p) => p.status === "refunded")
                    .reduce((acc, curr) => acc + curr.amount, 0)
                    .toFixed(2)}{" "}
                  USD
                </span>
                <p className="text-[9px] text-neutral-455 mt-0.5 text-neutral-450">
                  Subscription rights revoked.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-neutral-150/50 dark:border-neutral-900 bg-neutral-50 dark:bg-zinc-950/20 text-xs">
                <span className="text-[10px] uppercase font-mono text-neutral-400 font-bold block">
                  Active Paid Circles
                </span>
                <span className="text-xl font-bold font-mono text-orange-500 block mt-1">
                  {
                    profiles.filter(
                      (p) =>
                        p.subscription_tier && p.subscription_tier !== "Free",
                    ).length
                  }{" "}
                  orbits
                </span>
                <p className="text-[9px] text-neutral-450 mt-0.5">
                  Starter & Pro tiers active.
                </p>
              </div>
            </div>

            {/* Transactions lists table Grid */}
            <div className="space-y-3">
              {payments.length === 0 ? (
                <div className="p-8 border border-neutral-150 rounded-3xl bg-neutral-50 text-center text-xs text-neutral-400">
                  No subscriptions registered in database ledger modules.
                </div>
              ) : (
                <div className="divide-y divide-neutral-150/50 dark:divide-neutral-900/40 border border-neutral-150/50 dark:border-neutral-900/60 rounded-3xl bg-neutral-50 dark:bg-zinc-950/10 overflow-hidden text-xs">
                  {payments.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-neutral-100/45 dark:hover:bg-zinc-950/30 transition text-xs"
                    >
                      <div className="space-y-1.5 text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-neutral-850 dark:text-neutral-100 font-serif">
                            {tx.userName}
                          </span>
                          <span
                            className={`px-2 py-0.2 text-[8px] font-bold tracking-wider rounded font-mono ${
                              tx.plan === "Pro"
                                ? "bg-orange-500/10 text-orange-500"
                                : "bg-yellow-500/10 text-yellow-500"
                            }`}
                          >
                            {tx.plan}
                          </span>
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono space-x-2">
                          <span>Ref: {tx.id}</span>
                          <span>•</span>
                          <span>Settled via {tx.provider}</span>
                          {tx.created_at && (
                            <>
                              <span>•</span>
                              <span>
                                {new Date(tx.created_at).toLocaleDateString()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                        <span className="font-mono font-black text-neutral-800 dark:text-zinc-100 text-xs">
                          ${tx.amount.toFixed(2)} USD
                        </span>

                        <div className="flex gap-1.5">
                          {tx.status === "successful" ? (
                            <>
                              <button
                                onClick={() => {
                                  if (
                                    confirm(
                                      `Revoke premium subscription and trigger Flutterwave refund of $${tx.amount.toFixed(2)} to ${tx.userName}?`,
                                    )
                                  ) {
                                    refundPaymentTransaction(tx.id);
                                    alert(
                                      "Settlement canceled. Subscription downgraded and refund triggered.",
                                    );
                                  }
                                }}
                                className="px-2.5 py-1.5 font-mono text-[9.5px] font-bold text-red-500 bg-red-500/15 hover:bg-red-500 hover:text-white rounded-lg transition shrink-0 cursor-pointer"
                              >
                                Refund
                              </button>
                              <button
                                onClick={() => {
                                  if (
                                    confirm(
                                      `Do you wish to completely disable billing parameters & blacklist ${tx.userName}?`,
                                    )
                                  ) {
                                    disableSubscription(tx.userId);
                                    alert(
                                      "User down-graded and custom constraints active.",
                                    );
                                  }
                                }}
                                className="px-2.5 py-1.5 font-mono text-[9.5px] font-bold text-neutral-450 bg-neutral-200 dark:bg-zinc-900 border border-transparent dark:border-zinc-800 hover:border-red-500 hover:text-red-500 rounded-lg transition shrink-0 cursor-pointer"
                              >
                                Hard Ban
                              </button>
                            </>
                          ) : (
                            <span className="px-2.5 py-1 text-[9px] font-mono font-bold uppercase tracking-widest text-neutral-400 bg-neutral-150 dark:bg-neutral-900 rounded-lg">
                              {tx.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SEGMENT 5: AD PROMOTIONS QUEUE REVIEW */}
        {activeSegment === "ads" && (
          <div className="space-y-4 text-left">
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
                Review Sponsored Advertising Spots
              </h3>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Audit ad graphics and pitches submitted by Pro Seekers before
                placing them live.
              </p>
            </div>

            <div className="space-y-4">
              {ads.length === 0 ? (
                <div className="p-8 border border-dashed border-neutral-200 dark:border-neutral-850 rounded-3xl bg-neutral-50 dark:bg-zinc-950/20 text-center text-xs text-neutral-400">
                  No promotional spots registered in database.
                </div>
              ) : (
                ads.map((ad) => {
                  const creator = profiles.find((p) => p.id === ad.created_by);
                  return (
                    <div
                      key={ad.id}
                      className={`p-4 border rounded-3xl bg-neutral-50 dark:bg-zinc-950/30 flex flex-col sm:flex-row gap-4 text-xs relative overflow-hidden transition-all duration-300 ${
                        ad.status === "pending"
                          ? "border-orange-500/30 ring-1 ring-orange-500/10"
                          : "border-neutral-150/45 dark:border-neutral-900"
                      }`}
                    >
                      {/* Thumbnail frame of standard size */}
                      <div className="w-full sm:w-28 h-20 rounded-2xl overflow-hidden bg-black relative border border-neutral-250 dark:border-zinc-850 shrink-0 select-none">
                        <img
                          src={ad.image_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span
                            className={`text-[8.5px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded border ${
                              ad.status === "approved"
                                ? "bg-green-500/10 text-green-500 border-green-500/10"
                                : ad.status === "rejected"
                                  ? "bg-neutral-150 text-neutral-500 border-neutral-200"
                                  : "bg-orange-500/10 text-orange-500 border-orange-500/15 animate-pulse"
                            }`}
                          >
                            {ad.status === "approved"
                              ? "● Approved & Live"
                              : ad.status === "rejected"
                                ? "● Disallowed"
                                : "● PENDING AUDIT"}
                          </span>

                          <span className="text-[9.5px] font-mono text-neutral-400">
                            Owner: @{creator?.username || "Companion Soul"}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-extrabold text-neutral-850 dark:text-neutral-100 font-serif text-sm leading-tight">
                            {ad.title}
                          </h4>
                          <p className="text-[11px] text-neutral-550 leading-relaxed italic mt-0.5 font-serif">
                            "{ad.description}"
                          </p>
                        </div>

                        <div className="pt-1 flex items-center justify-between text-[10px]">
                          <a
                            href={ad.link_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-orange-500 hover:underline font-mono font-bold"
                          >
                            Destination URL: {ad.link_url} &rarr;
                          </a>

                          {ad.status === "pending" && (
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => {
                                  approveAd(ad.id);
                                  alert(
                                    "Ad approved! Live placement established across core Category headers.",
                                  );
                                }}
                                className="px-2.5 py-1 text-[9.5px] font-mono font-bold uppercase tracking-wider text-white bg-green-600 hover:bg-green-700 rounded-lg cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  rejectAd(ad.id);
                                  alert(
                                    "Ad promotion disallowed and dismissed.",
                                  );
                                }}
                                className="px-2.5 py-1 text-[9.5px] font-mono font-bold uppercase tracking-wider text-neutral-600 border border-neutral-350 bg-white hover:bg-neutral-50 rounded-lg cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
