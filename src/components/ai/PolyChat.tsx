import React, { useState, useEffect, useRef } from "react";
import { useStore } from "../../store";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Send,
  RefreshCw,
  Compass,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Zap,
  MessageSquarePlus,
  ChartBar as BarChart3,
  User,
  FlameKindling,
} from "lucide-react";
import { AppCard, Avatar, Button, Badge, SectionHeader } from "../ui";
import { spendTokens, getUserTokens } from "../../lib/tokens";

export default function PolyChat() {
  const { currentUser, profiles, groups } = useStore();
  const [messages, setMessages] = useState<any[]>([
    {
      role: "assistant",
      content:
        "Greetings seeker. I am Poly, your companion. Let's delve into conversations that have no boundaries. How is your emotional weather today?",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(false);
  const [hasSpeechSupport, setHasSpeechSupport] = useState(false);
  const [transcribingText, setTranscribingText] = useState("");
  const [recDetails, setRecDetails] = useState<any | null>(null);
  const [recLoading, setRecLoading] = useState(false);

  const [toolLoading, setToolLoading] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const POLY_TOOLS = [
    {
      id: "resuscitator",
      label: "Resuscitator",
      description: "Revive a dead conversation",
      cost: 5,
      icon: FlameKindling,
      prompt: `I need help reviving a conversation that has gone cold. Analyze common patterns in stalled conversations and give me 3 specific, personalized openers I can use to restart things naturally. Make them warm, not desperate.`,
    },
    {
      id: "profile_optimization",
      label: "Profile Optimizer",
      description: "Improve your profile quality",
      cost: 10,
      icon: User,
      prompt: `Please analyze my current profile and give me specific, actionable improvements. My bio: "${currentUser?.bio || "(no bio set)"}". My interests: ${(currentUser?.interests || []).join(", ") || "none set"}. My goals: ${(currentUser?.recognition_goals || []).join(", ") || "none set"}. Give me a rewritten bio and 5 specific improvements.`,
    },
    {
      id: "message_analysis",
      label: "Message Analysis",
      description: "Improve your communication",
      cost: 5,
      icon: BarChart3,
      prompt: `I want to improve my messaging skills. Analyze the common communication patterns in my recent conversations and give me: 1) My communication strengths, 2) Areas to improve, 3) Three specific techniques to make my messages more engaging and connection-building.`,
    },
    {
      id: "deep_alignment",
      label: "Deep Alignment",
      description: "Full compatibility report",
      cost: 30,
      icon: MessageSquarePlus,
      prompt: `Create a comprehensive compatibility and relationship alignment report for me based on my profile: interests: ${(currentUser?.interests || []).join(", ") || "none"}, goals: ${(currentUser?.recognition_goals || []).join(", ") || "none"}, relationship status: ${currentUser?.relationship_status || "not set"}. Include: ideal connection types, communication style, red flags to watch, green flags I offer, and how to present my authentic self while connecting.`,
    },
  ];

  const handleUseTool = async (tool: (typeof POLY_TOOLS)[0]) => {
    if (!currentUser || toolLoading) return;

    const tokens = await getUserTokens(currentUser.id);
    if (!tokens || tokens.balance < tool.cost) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `You need ${tool.cost} PAL tokens to use ${tool.label}, but you only have ${tokens?.balance || 0}. Earn more through daily login, watching ads, or creating posts.`,
        },
      ]);
      return;
    }

    setToolLoading(tool.id);
    const result = await spendTokens(
      currentUser.id,
      tool.cost,
      "ai_chat",
      `Poly ${tool.label}`,
      tool.id,
    );
    if (!result.success) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `I couldn't process that tool right now. ${result.error || "Please try again."}`,
        },
      ]);
      setToolLoading(null);
      return;
    }
    setTokenBalance(result.newBalance ?? null);

    const userMsg = { role: "user", content: `[${tool.label}] ${tool.prompt}` };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setToolLoading(null);

    try {
      const res = await fetch("/api/poly/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: tool.prompt, history: [] }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply },
        ]);
        if (voiceOutputEnabled) speakText(data.reply);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I encountered an issue processing that request. Your tokens have been refunded in spirit — please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      getUserTokens(currentUser.id).then((t) =>
        setTokenBalance(t?.balance ?? null),
      );
    }
  }, [currentUser?.id]);

  const fetchRecommendations = async () => {
    if (!currentUser) return;
    setRecLoading(true);
    try {
      const res = await fetch("/api/poly/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interests: currentUser.interests || ["music", "relationships"],
          goals: currentUser.recognition_goals || ["friendship"],
          currentBio: currentUser.bio || "",
        }),
      });
      const data = await res.json();
      setRecDetails(data);
    } catch (e) {
      setRecDetails({
        icebreaker:
          "What's a song that immediately takes you back to a specific sunset in your life?",
        recommended_groups: [
          "Acoustic Sessions",
          "Deep Dialogue",
          "Wanderlust Chronicles",
        ],
        connection_task:
          "Ask someone about a skill they have that they're secretly proud of, rather than what they do for a living.",
      });
    } finally {
      setRecLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setHasSpeechSupport(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
        setTranscribingText("");
      };

      rec.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join("");
        setTranscribingText(transcript);
        setInputText(transcript);
      };

      rec.onerror = (err: any) => {
        console.error("Speech Recognition Error:", err);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentUser]);

  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[\*\_#`~]/g, "").trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;

      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) =>
          v.name.toLowerCase().includes("google") ||
          v.name.toLowerCase().includes("female") ||
          v.name.toLowerCase().includes("natural") ||
          v.name.toLowerCase().includes("samantha") ||
          v.lang.startsWith("en"),
      );
      if (preferred) {
        utterance.voice = preferred;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Speech Synthesis Error:", e);
    }
  };

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Microphone activation failed", e);
      }
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = { role: "user", content: inputText.trim() };
    setMessages([...messages, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      const contextHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/poly/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.content,
          history: contextHistory,
        }),
      });
      const data = await res.json();

      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply },
        ]);
        if (voiceOutputEnabled) {
          speakText(data.reply);
        }
      }
    } catch (err: any) {
      const fallbackText =
        "Wait, I feel a tiny static interference in our resonance tunnel. Take a slow, quiet breath with me.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: fallbackText },
      ]);
      if (voiceOutputEnabled) {
        speakText(fallbackText);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 h-[calc(100vh-62px)] overflow-y-auto pb-24 md:pb-6">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chat Panel */}
        <div className="lg:col-span-2 flex flex-col">
          <AppCard
            variant="elevated"
            padding="none"
            className="flex-1 flex flex-col overflow-hidden bg-linear-to-br from-neutral-900 to-neutral-950 border-neutral-800"
          >
            {/* Header */}
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar
                    src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80"
                    alt="Poly AI"
                    size="lg"
                    verified
                    online
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center border-2 border-neutral-900">
                    <Sparkles className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    Poly
                    <Badge variant="warning" size="sm">
                      Active
                    </Badge>
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Empathetic relationship companion
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={voiceOutputEnabled ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setVoiceOutputEnabled(!voiceOutputEnabled);
                    if (!voiceOutputEnabled) {
                      speakText("Voice readout enabled.");
                    } else {
                      window.speechSynthesis?.cancel();
                    }
                  }}
                  icon={
                    voiceOutputEnabled ? (
                      <Volume2 className="w-4 h-4" />
                    ) : (
                      <VolumeX className="w-4 h-4" />
                    )
                  }
                >
                  {voiceOutputEnabled ? "Voice On" : "Voice Off"}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setMessages([
                      {
                        role: "assistant",
                        content:
                          "Greetings seeker! Our conversation slate is cleansed. How are you?",
                      },
                    ]);
                    window.speechSynthesis?.cancel();
                  }}
                  icon={<RefreshCw className="w-4 h-4" />}
                />
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[50vh]">
              {messages.map((m, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-start gap-3 max-w-[85%] ${
                    m.role === "user" ? "ml-auto flex-row-reverse" : ""
                  }`}
                >
                  {m.role !== "user" && (
                    <Avatar
                      src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80"
                      alt="Poly"
                      size="sm"
                    />
                  )}

                  <div
                    className={`p-4 rounded-2xl ${
                      m.role === "user"
                        ? "bg-linear-to-r from-red-500 to-orange-500 text-white rounded-br-none"
                        : "bg-neutral-800 text-white rounded-bl-none border border-neutral-700"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {m.content}
                    </p>

                    {m.role !== "user" && (
                      <button
                        onClick={() => speakText(m.content)}
                        className="mt-2 p-1 rounded hover:bg-neutral-700 transition"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-neutral-400" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div className="flex items-start gap-3">
                  <Avatar
                    src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80"
                    alt="Poly"
                    size="sm"
                  />
                  <div className="p-4 bg-neutral-800 rounded-2xl rounded-bl-none border border-neutral-700 flex items-center gap-2">
                    <span className="text-sm text-neutral-400">
                      Poly is thinking
                    </span>
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" />
                    </span>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Voice indicator */}
            {isListening && (
              <div className="px-4 py-2 bg-linear-to-r from-red-500/10 to-orange-500/10 border-t border-orange-500/20 flex items-center gap-3">
                <span className="flex items-center gap-2 text-xs text-orange-400">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                  Listening:
                </span>
                <span className="text-xs text-neutral-300 italic truncate">
                  {transcribingText || "Speak now..."}
                </span>
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={handleSend}
              className="p-4 border-t border-neutral-800 flex gap-3"
            >
              {hasSpeechSupport ? (
                <Button
                  type="button"
                  variant={isListening ? "danger" : "secondary"}
                  size="md"
                  onClick={toggleListening}
                  icon={
                    isListening ? (
                      <MicOff className="w-4 h-4" />
                    ) : (
                      <Mic className="w-4 h-4" />
                    )
                  }
                />
              ) : null}

              <input
                type="text"
                placeholder={
                  isListening ? "Listening..." : "Ask Poly for advice..."
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isListening}
                className="flex-1 py-3 px-4 text-sm rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 transition disabled:opacity-60"
              />

              <Button
                type="submit"
                disabled={!inputText.trim() || isListening}
                icon={<Send className="w-4 h-4" />}
              />
            </form>
          </AppCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Recommendations */}
          <AppCard
            variant="elevated"
            padding="lg"
            className="bg-linear-to-br from-neutral-900 to-neutral-950 border-neutral-800"
          >
            <SectionHeader
              title="Connection Alignment"
              subtitle="Personalized recommendations"
              icon={<Compass className="w-5 h-5 text-orange-500" />}
              className="text-white mb-4"
            />

            {recLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 text-orange-500 animate-spin" />
              </div>
            ) : recDetails ? (
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-orange-400 uppercase font-bold tracking-wider mb-1">
                    Daily Icebreaker
                  </p>
                  <p className="text-xs text-neutral-300 italic">
                    "{recDetails.icebreaker}"
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-orange-400 uppercase font-bold tracking-wider mb-1">
                    Connection Task
                  </p>
                  <p className="text-xs text-neutral-300">
                    {recDetails.connection_task}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-orange-400 uppercase font-bold tracking-wider mb-2">
                    Recommended Tribes
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {(recDetails.recommended_groups || []).map(
                      (tribe: string) => (
                        <Badge key={tribe} variant="secondary" size="sm">
                          {tribe}
                        </Badge>
                      ),
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-neutral-500">
                Set up your interests to get personalized recommendations.
              </p>
            )}
          </AppCard>

          {/* Poly Tools */}
          {currentUser && (
            <AppCard
              variant="elevated"
              padding="md"
              className="bg-linear-to-br from-neutral-900 to-neutral-950 border-neutral-800"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Poly Tools
                </h4>
                {tokenBalance !== null && (
                  <div className="flex items-center gap-1 text-xs text-amber-400">
                    <Zap className="w-3 h-3" />
                    {tokenBalance} PAL
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {POLY_TOOLS.map((tool) => {
                  const Icon = tool.icon;
                  const isLoading = toolLoading === tool.id;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => handleUseTool(tool)}
                      disabled={!!toolLoading || loading}
                      className="w-full text-left p-3 rounded-xl bg-neutral-800/50 hover:bg-neutral-700/50 border border-neutral-700/50 hover:border-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5 text-orange-400" />
                          <span className="text-xs font-semibold text-neutral-200 group-hover:text-white transition">
                            {isLoading ? "Processing..." : tool.label}
                          </span>
                        </div>
                        <span className="text-[10px] text-amber-400 flex items-center gap-0.5">
                          <Zap className="w-2.5 h-2.5" />
                          {tool.cost}
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-500 mt-0.5 ml-5">
                        {tool.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </AppCard>
          )}

          {/* Bio Alignment */}
          {currentUser && (
            <AppCard variant="outlined" padding="md">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
                Your Alignment
              </h4>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] text-neutral-500 uppercase">
                    Interests
                  </p>
                  <p className="text-xs text-neutral-300">
                    {(currentUser.interests || [])
                      .map((i) => `#${i}`)
                      .join(", ") || "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-neutral-500 uppercase">
                    Goals
                  </p>
                  <p className="text-xs text-neutral-300">
                    {(currentUser.recognition_goals || []).join(", ") ||
                      "Not set"}
                  </p>
                </div>
              </div>
            </AppCard>
          )}
        </div>
      </div>
    </div>
  );
}
