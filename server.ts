import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini Client
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  } else {
    console.warn("GEMINI_API_KEY not found in environment variables.");
  }

  // API Route: Poly AI Chat
  app.post("/api/poly/chat", async (req, res) => {
    try {
      if (!ai) {
        return res
          .status(500)
          .json({ error: "Gemini AI is not configured on this server." });
      }

      const { message, history } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required." });
      }

      // Convert history to components suitable for Gemini API
      // If history is provided, compile them nicely
      const systemInstruction =
        "You are 'Poly', the warm, luxurious, highly emotionally intelligent, and deeply supportive AI Relationship Assistant for the Palrene platform. " +
        "Palrene is a relationship, friendship, dating, and community discovery platform. " +
        "Your mission is to offer highly empathetic, thoughtful relationship advice, emotional support, and recommendations to help humans form authentic connections. " +
        "Always sound warm, deeply genuine, wise, slightly poetic, and intelligent. " +
        "You should help users communicate better, suggest creative ideas for dates or friend hangouts, and offer healing or calming support if they are feeling lonely or down. " +
        "Keep your responses beautifully formatted in Markdown, focused, and conversational (avoid overly long explanations unless asked).";

      const formattedContents: any[] = [];

      // Append history
      if (history && Array.isArray(history)) {
        history.forEach((h: any) => {
          formattedContents.push({
            role: h.role === "assistant" ? "model" : "user",
            parts: [{ text: h.content }],
          });
        });
      }

      // Append current message
      formattedContents.push({
        role: "user",
        parts: [{ text: message }],
      });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.8,
        },
      });

      const responseText =
        response.text || "I am reflecting on your thoughts. Let's dig deeper.";
      res.json({ reply: responseText });
    } catch (error: any) {
      console.error("Error in /api/poly/chat:", error);
      res
        .status(500)
        .json({ error: error.message || "An error occurred with Poly AI." });
    }
  });

  // API Route: AI Reply Suggester for messenger
  app.post("/api/poly/suggest-reply", async (req, res) => {
    try {
      if (!ai) {
        return res
          .status(500)
          .json({ error: "Gemini AI is not configured on this server." });
      }

      const { recipientName, lastMessages } = req.body;
      if (!lastMessages || !Array.isArray(lastMessages)) {
        return res
          .status(400)
          .json({ error: "List of last messages is required." });
      }

      const contextText = lastMessages
        .map((m: any) => `${m.sender_name || "Them"}: ${m.content}`)
        .join("\n");
      const prompt = `Based on the following short message history with ${recipientName || "a contact"}, suggest 3 diverse, highly charming, and tailored reply options that sound natural, witty, or supportive. Format the response as a JSON array of strings only.
      
Messages:
${contextText}

Return JSON of form: ["Option 1", "Option 2", "Option 3"]`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      const text = response.text || "[]";
      try {
        const parsed = JSON.parse(text);
        res.json({ suggestions: parsed });
      } catch {
        res.json({
          suggestions: [
            "That sounds lovely!",
            "Wow, tell me more about it!",
            "I'd love to chat more!",
          ],
        });
      }
    } catch (error: any) {
      console.error("Error in /api/poly/suggest-reply:", error);
      res.status(500).json({
        error: error.message || "An error occurred generating sugestions.",
      });
    }
  });

  // API Route: Relationship match recommendations based on interests and goals
  app.post("/api/poly/recommend", async (req, res) => {
    try {
      if (!ai) {
        return res
          .status(500)
          .json({ error: "Gemini AI is not configured on this server." });
      }

      const { interests, goals, currentBio } = req.body;
      const prompt = `Given a user with interests: [${(interests || []).join(", ")}], connection goals: [${(goals || []).join(", ")}], and bio: "${currentBio || ""}", generate a warm, premium list of custom relationship/interaction recommendations.
      This includes:
      1. One custom creative prompt/icebreaker to use on their profile.
      2. Recommended types of subgroups or communities to seek.
      3. A weekly "connection goal" or mindfully-spirited task.
      
      Respond directly in a clean JSON object format:
      {
        "icebreaker": "string",
        "recommended_groups": ["string 1", "string 2"],
        "connection_task": "string",
        "intro_message": "string"
      }`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      const text = response.text || "{}";
      try {
        const parsed = JSON.parse(text);
        res.json(parsed);
      } catch {
        res.json({
          icebreaker:
            "What's a song that immediately takes you back to a specific sunset in your life?",
          recommended_groups: [
            "Acoustic Sessions",
            "Deep Dialogue",
            "Wanderlust Chronicles",
          ],
          connection_task:
            "Ask someone about a skill they have that they're secretly proud of, rather than what they do for a living.",
          intro_message:
            "Here are some personal connection rituals curated by Poly.",
        });
      }
    } catch (error: any) {
      console.error("Error in /api/poly/recommend:", error);
      res.status(500).json({
        error: error.message || "An error occurred with recommendations.",
      });
    }
  });

  // Vite development server setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Palrene Startup] Server running on http://localhost:${PORT}`);
  });
}

startServer();
