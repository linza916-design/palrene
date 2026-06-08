import React, { useState, useEffect, useRef } from "react";
import { useStore } from "../../store";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Send, RefreshCw, Compass, Bookmark, MessageSquare, CircleAlert as AlertCircle, Mic, MicOff, Volume2, VolumeX } from "lucide-react";

export default function PolyChat() {
  const { currentUser, profiles, groups } = useStore();
  const [messages, setMessages] = useState<any[]>([
    {
      role: "assistant",
      content: "Greetings seeker. I am Poly, your companion. Let's delve into conversations that have no boundaries. How is your emotional weather today?"
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);

  // Voice Mode States
  const [isListening, setIsListening] = useState(false);
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(false);
  const [hasSpeechSupport, setHasSpeechSupport] = useState(false);
  const [transcribingText, setTranscribingText] = useState("");

  const recognitionRef = useRef<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Recommendations state
  const [recDetails, setRecDetails] = useState<any | null>(null);
  const [recLoading, setRecLoading] = useState(false);

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
          currentBio: currentUser.bio || ""
        })
      });
      const data = await res.json();
      setRecDetails(data);
    } catch (e) {
      console.error(e);
      setRecDetails({
        icebreaker: "What's a song that immediately takes you back to a specific sunset in your life?",
        recommended_groups: ["Acoustic Sessions", "Deep Dialogue", "Wanderlust Chronicles"],
        connection_task: "Ask someone about a skill they have that they're secretly proud of, rather than what they do for a living."
      });
    } finally {
      setRecLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();

    // Voice recognition initiation
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setHasSpeechSupport(true);
      const rec = new SpeechRecognition();
      rec.continuous = false; // Stop when the user stops speaking
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
    } else {
      setHasSpeechSupport(false);
    }

    // voices preloaded check
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
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

  // Audio Read aloud engine Text-To-Speech
  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      // Remove any markdown characters
      const cleanText = text.replace(/[\*\_#`~]/g, "").trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;

      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => 
        v.name.toLowerCase().includes("google") || 
        v.name.toLowerCase().includes("female") || 
        v.name.toLowerCase().includes("natural") ||
        v.name.toLowerCase().includes("samantha") ||
        v.lang.startsWith("en")
      );
      if (preferred) {
        utterance.voice = preferred;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Speech Synthesis Error:", e);
    }
  };

  // Auto-scroll messages to bottom
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
        content: m.content
      }));

      const res = await fetch("/api/poly/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.content,
          history: contextHistory
        })
      });
      const data = await res.json();
      
      if (data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
        if (voiceOutputEnabled) {
          speakText(data.reply);
        }
      }
    } catch (err: any) {
      const fallbackText = "Wait, I feel a tiny static interference in our resonance tunnel. Take a slow, quiet breath with me.";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: fallbackText
        }
      ]);
      if (voiceOutputEnabled) {
        speakText(fallbackText);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 sm:p-6 h-[calc(100vh-112px)] overflow-y-auto">

      {/* LEFT & CENTER: Futuristic Poly chat panel */}
      <div className="lg:col-span-2 flex flex-col h-full bg-zinc-950 border border-white/5 rounded-3xl overflow-hidden relative shadow-2xl justify-between">

        {/* Ambient background gradients */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-orange-500/5 blur-3xl rounded-full" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-rose-500/5 blur-3xl rounded-full" />
          {/* Floating particles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-orange-400/20"
              style={{ left: `${10 + i * 11}%`, top: `${15 + (i % 3) * 25}%` }}
              animate={{ y: [0, -20, 0], opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
            />
          ))}
        </div>

        {/* Header */}
        <div className="relative border-b border-white/5 pb-3.5 px-5 pt-5 flex items-center justify-between">
          <div className="flex items-center space-x-3.5 text-left">
            <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-red-650 via-orange-500 to-rose-700/80 p-0.5 shadow shadow-orange-950/30 shrink-0">
              <img
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80"
                alt="Poly AI avatar"
                className="w-full h-full rounded-full object-cover"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gradient-to-tr from-yellow-300 to-yellow-500 rounded-full border border-zinc-950 flex items-center justify-center">
                <Sparkles size={8} className="text-black fill-current animate-pulse" />
              </span>
            </div>
            <div>
              <h3 className="text-sm font-serif font-bold text-white flex items-center gap-1.5">
                Poly
                <span className="text-[8px] bg-yellow-300/10 text-yellow-300 px-1.5 rounded uppercase font-mono font-bold tracking-widest leading-none border border-yellow-300/20">Active Resonance</span>
              </h3>
              <p className="text-[10px] text-neutral-400 font-mono">Empathetic relationship socket.</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Audio Voice Output Toggler */}
            <button
              onClick={() => {
                const newState = !voiceOutputEnabled;
                setVoiceOutputEnabled(newState);
                if (newState) {
                  speakText("Voice readout enabled. Hands-free alignment initialized.");
                } else {
                  if (typeof window !== "undefined" && "speechSynthesis" in window) {
                    window.speechSynthesis.cancel();
                  }
                }
              }}
              className={`p-1.5 rounded-full border transition flex items-center space-x-1 cursor-pointer ${
                voiceOutputEnabled
                  ? "bg-orange-500/10 text-orange-450 border-orange-500/30"
                  : "bg-transparent text-neutral-300 border-transparent hover:bg-white/5 hover:text-white"
              }`}
              title={voiceOutputEnabled ? "Mute Voice guidance output" : "Enable voice read-aloud guidance"}
              aria-label={voiceOutputEnabled ? "Mute Voice guidance output" : "Enable voice read-aloud guidance"}
            >
              {voiceOutputEnabled ? <Volume2 size={14} className="animate-pulse text-orange-400" /> : <VolumeX size={14} />}
              <span className="text-[9px] font-mono hidden sm:inline-block pr-1">
                {voiceOutputEnabled ? "Voice Output Active" : "Voice Output Off"}
              </span>
            </button>

            <button
              onClick={() => {
                setMessages([{ role: "assistant", content: "Greetings seeker! Our conversation slate is cleansed, ready to trace new bounds. How are you?" }]);
                if (typeof window !== "undefined" && "speechSynthesis" in window) {
                  window.speechSynthesis.cancel();
                }
              }}
              className="p-1.5 rounded-full hover:bg-white/5 text-neutral-300 hover:text-white transition cursor-pointer"
              title="Clean Slate"
              aria-label="Clean conversation slate"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Message Flow Area */}
        <div className="flex-1 overflow-y-auto my-4 px-5 space-y-4 pr-5 relative max-h-[calc(100vh-320px)]">
          {messages.map((m, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-3 text-xs leading-relaxed max-w-[85%] ${
                m.role === "user" ? "ml-auto flex-row-reverse text-right" : "text-left"
              }`}
            >
              {m.role !== "user" ? (
                <img
                  src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80"
                  alt="Poly"
                  className="w-7 h-7 rounded-full object-cover border border-zinc-800"
                />
              ) : null}

              <div className="space-y-1 relative group max-w-full">
                <div className={`p-3.5 pr-8 rounded-2xl relative ${
                  m.role === "user"
                    ? "bg-gradient-to-br from-red-500 to-orange-500 text-white rounded-br-none"
                    : "bg-zinc-900/80 text-zinc-100 rounded-bl-none border border-zinc-850"
                }`}>
                  <p className="whitespace-pre-wrap breakdown-words">{m.content}</p>
                  
                  {m.role !== "user" && (
                    <button
                      type="button"
                      onClick={() => speakText(m.content)}
                      className="absolute right-2.5 bottom-2.5 p-1 rounded bg-zinc-950/90 border border-zinc-800 text-zinc-300 hover:text-orange-400 hover:border-orange-500/30 transition opacity-100 sm:opacity-0 group-hover:opacity-100 group-focus:opacity-100 focus:opacity-100 focus:ring-1 focus:ring-orange-500 outline-none duration-200 cursor-pointer"
                      title="Read Message Aloud"
                      aria-label="Read message aloud"
                    >
                      <Volume2 size={12} />
                    </button>
                  )}
                </div>
                <span className="text-[9px] font-mono text-zinc-300 block">
                  {m.role === "user" ? "Me" : "Poly guide"}
                </span>
              </div>
            </motion.div>
          ))}

          {/* Poly streaming/typing indicator */}
          {loading && (
            <div className="flex items-start gap-3 text-left max-w-[85%] animate-pulse">
              <img
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80"
                alt="Poly typing"
                className="w-7 h-7 rounded-full object-cover"
              />
              <div className="p-3.5 bg-zinc-900 text-zinc-400 rounded-2xl rounded-bl-none border border-zinc-850 flex items-center space-x-1.5">
                <span className="text-[10px] font-mono">Poly is gathering cosmic dust</span>
                <span className="flex space-x-1 items-center">
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" />
                </span>
              </div>
            </div>
          )}
          {/* Scroll anchor */}
          <div ref={bottomRef} />
        </div>

        {/* Voice listening */}
        {isListening && (
          <div className="px-5 py-2.5 bg-gradient-to-r from-red-500/10 to-orange-500/10 border-t border-orange-500/20 flex items-center justify-between animate-pulse" role="status" aria-live="polite">
            <span className="text-[10px] font-mono text-orange-400 flex items-center gap-2 max-w-[85%]">
              <span className="flex space-x-1 items-center shrink-0">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" aria-hidden="true" />
                <span>Listening:</span>
              </span>
              <span className="text-zinc-300 italic truncate font-sans">
                {transcribingText || "Speak now..."}
              </span>
            </span>
            <div className="flex items-end space-x-0.5 h-3" aria-hidden="true">
              {[1, 2, 3, 2, 1].map((h, i) => (
                <span key={i} className="w-0.5 bg-orange-500 animate-bounce" style={{ height: `${h * 4}px`, animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          </div>
        )}

        {/* Chat input box */}
        <form onSubmit={handleSend} className="relative mt-2 px-5 pb-5 flex gap-2">
          {hasSpeechSupport ? (
            <button
              type="button"
              onClick={toggleListening}
              className={`p-3.5 rounded-2xl transition duration-300 transform active:scale-95 shrink-0 flex items-center justify-center cursor-pointer ${
                isListening
                  ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse"
                  : "bg-zinc-900 text-zinc-300 border border-zinc-850 hover:bg-zinc-850 hover:text-white"
              }`}
              title={isListening ? "Stop Listening" : "Start Hands-Free Voice Alignment"}
              aria-label={isListening ? "Stop voice listening" : "Start Hands-Free Voice Alignment"}
            >
              {isListening ? <MicOff size={15} /> : <Mic size={15} />}
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="p-3.5 bg-zinc-950 border border-zinc-900 text-zinc-750 rounded-2xl shrink-0 flex items-center justify-center cursor-not-allowed animate-fade-in"
              title="Voice Input requires Chrome, Safari, or Edge"
              aria-label="Voice Input not supported by current browser"
            >
              <MicOff size={15} className="opacity-30" />
            </button>
          )}

          <label htmlFor="poly-chat-input" className="sr-only">
            Ask Poly AI relationship question
          </label>
          <input
            id="poly-chat-input"
            name="poly-chat-input"
            type="text"
            placeholder={isListening ? "Listening... Speak naturally" : "Ask Poly for relationship advice, communication help, or date suggestions..."}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isListening}
            className="w-full py-3.5 px-4 text-xs text-white placeholder-zinc-400 bg-zinc-950 border border-zinc-850 rounded-2xl focus:outline-none focus:border-orange-500 transition shadow-inner disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isListening}
            className="px-5 py-3.5 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl font-mono text-xs font-bold uppercase tracking-wider hover:from-red-650 hover:to-orange-550 transition disabled:opacity-40 cursor-pointer flex items-center justify-center"
            aria-label="Send message to Poly AI"
          >
            <Send size={15} />
          </button>
        </form>

      </div>

      {/* RIGHT columns: Poly recommendations card details, date prompts */}
      <div className="space-y-5 h-full">
        {/* Recommendation Goals panel */}
        <div className="p-5 bg-gradient-to-br from-zinc-900 to-black border border-zinc-850 rounded-3xl shadow-xl text-left font-serif relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/5 blur-2xl rounded-full" />
          <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-1.5">
            <Compass size={16} className="text-orange-500" />
            <span>Connection Alignment</span>
          </h4>

          {recLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-2">
              <RefreshCw size={20} className="text-orange-500 animate-spin" />
              <p className="text-[10px] font-mono text-zinc-350">Consulting cosmic charts...</p>
            </div>
          ) : recDetails ? (
            <div className="space-y-4">
              {/* Daily icebreaker */}
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-orange-400 uppercase tracking-wider font-bold">1. Daily Icebreaker Ritual</span>
                <p className="text-xs text-zinc-300 bg-zinc-950 p-3 rounded-xl border border-zinc-900 leading-relaxed italic">
                  "{recDetails.icebreaker}"
                </p>
              </div>

              {/* Weekly connection task */}
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-orange-400 uppercase tracking-wider font-bold">2. Weekly Connection Task</span>
                <p className="text-xs text-zinc-300 bg-zinc-950 p-3 rounded-xl border border-zinc-900 leading-relaxed">
                  {recDetails.connection_task}
                </p>
              </div>

              {/* Recommended subgroups */}
              <div className="space-y-2">
                <span className="text-[9px] font-mono text-orange-400 uppercase tracking-wider font-bold">3. Recommended Tribes</span>
                <div className="flex gap-2 flex-wrap">
                  {(recDetails.recommended_groups || []).map((tribe: string) => (
                    <span 
                      key={tribe}
                      className="px-2.5 py-1 text-[10px] font-mono bg-zinc-900 text-zinc-400 rounded-lg border border-zinc-850"
                    >
                      {tribe}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <p className="text-xs text-neutral-500 font-sans">Setup interests inside dashboard to allow Poly aligning recommendations.</p>
          )}
        </div>

        {/* Guidance tip and bio alignment summary */}
        <div className="p-5 bg-zinc-900/60 border border-zinc-900 rounded-3xl shadow-lg text-left">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 mb-3 block">Seeker Bio alignment</h4>
          {currentUser ? (
            <div className="space-y-3">
              <div className="text-xs text-zinc-300">
                <span className="text-neutral-500 font-mono text-[9px] block">Current Interests Bound:</span>
                <p className="font-semibold">{(currentUser.interests || []).map(i => `#${i}`).join(", ")}</p>
              </div>
              <div className="text-xs text-zinc-300">
                <span className="text-neutral-500 font-mono text-[9px] block">Current Goals Resonating:</span>
                <p className="font-semibold">{(currentUser.recognition_goals || []).join(", ")}</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>

    </div>
  );
}

function Loader({ size = 16, className = "" }) {
  return <RefreshCw size={size} className={`animate-spin ${className}`} />;
}
