import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config({ path: [".env.local", ".env"] });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();

  const PORT = Number(process.env.PORT) || 3000;

  const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;

  app.use(
    cors({
      origin: APP_URL,
      credentials: true,
    }),
  );

  app.use(express.json());

  const apiKey = process.env.GEMINI_API_KEY;

  let ai: GoogleGenAI | null = null;

  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  } else {
    console.warn("GEMINI_API_KEY not found.");
  }

  // ===== HEALTH CHECK =====

  app.get("/api/health", (_, res) => {
    res.json({
      status: "ok",
      appUrl: APP_URL,
      environment: process.env.NODE_ENV,
    });
  });

  // ===== POLY CHAT =====

  app.post("/api/poly/chat", async (req, res) => {
    try {
      if (!ai) {
        return res.status(500).json({
          error: "Gemini AI is not configured.",
        });
      }

      const { message, history } = req.body;

      if (!message) {
        return res.status(400).json({
          error: "Message is required.",
        });
      }

      const systemInstruction =
        "You are Poly, the AI relationship assistant for Palrene.";

      const formattedContents: any[] = [];

      if (Array.isArray(history)) {
        history.forEach((h: any) => {
          formattedContents.push({
            role: h.role === "assistant" ? "model" : "user",
            parts: [{ text: h.content }],
          });
        });
      }

      formattedContents.push({
        role: "user",
        parts: [{ text: message }],
      });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.8,
        },
      });

      return res.json({
        reply: response.text || "I'm reflecting on your thoughts.",
      });
    } catch (error: any) {
      console.error(error);

      return res.status(500).json({
        error: error.message,
      });
    }
  });

  // ===== POLY SUGGEST REPLY =====

  app.post("/api/poly/suggest-reply", async (req, res) => {
    try {
      if (!ai) {
        return res.status(500).json({
          error: "Gemini AI is not configured.",
        });
      }

      const { recipientName, lastMessages } = req.body;

      if (!Array.isArray(lastMessages)) {
        return res.status(400).json({
          error: "lastMessages array is required.",
        });
      }

      const contextText = lastMessages
        .map((m: any) => `${m.sender_name || "Them"}: ${m.content}`)
        .join("\n");

      // Updated: Implemented strict schema mapping to prevent JSON parsing issues
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Analyze the conversation history and suggest exactly 3 engaging, contextually accurate reply variations for ${recipientName || "contact"}.\n\nHistory:\n${contextText}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "ARRAY",
            items: { type: "STRING" },
          },
          temperature: 0.7,
        },
      });

      try {
        const parsedSuggestions = JSON.parse(response.text || "[]");
        return res.json({
          suggestions: Array.isArray(parsedSuggestions)
            ? parsedSuggestions
            : [],
        });
      } catch {
        return res.json({
          suggestions: [
            "That sounds lovely!",
            "Tell me more.",
            "I'd love to hear about it.",
          ],
        });
      }
    } catch (error: any) {
      console.error("SUGGEST REPLY ERROR:", error);
      return res.status(500).json({
        error: error.message,
      });
    }
  });

  // ===== POLY RECOMMEND =====

  app.post("/api/poly/recommend", async (req, res) => {
    try {
      if (!ai) {
        return res.status(500).json({
          error: "Gemini AI is not configured.",
        });
      }

      // Updated: Guarding against empty bodies to prevent initialization failures
      const { interests = [], goals = [], currentBio = "" } = req.body || {};

      const dynamicPrompt = `
        Analyze the following user profile metrics and generate personal community action items.
        Interests: ${interests.length ? interests.join(", ") : "Not specified yet"}
        Goals: ${goals.length ? goals.join(", ") : "Not specified yet"}
        Bio: ${currentBio || "New Palrene Community Member"}
      `;

      // Updated: Implemented robust explicit object structure validation schema
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: dynamicPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              icebreaker: { type: "STRING" },
              recommended_groups: { type: "ARRAY", items: { type: "STRING" } },
              connection_task: { type: "STRING" },
              intro_message: { type: "STRING" },
            },
            required: [
              "icebreaker",
              "recommended_groups",
              "connection_task",
              "intro_message",
            ],
          },
          temperature: 0.7,
        },
      });

      try {
        const parsedRecommendations = JSON.parse(response.text || "{}");
        return res.json(parsedRecommendations);
      } catch {
        return res.json({
          icebreaker: "What's a memory that still makes you smile?",
          recommended_groups: ["Deep Conversations", "Adventure Seekers"],
          connection_task: "Start one meaningful conversation this week.",
          intro_message: "Personal recommendations from Poly.",
        });
      }
    } catch (error: any) {
      console.error("RECOMMEND ERROR:", error);
      return res.status(500).json({
        error: error.message,
      });
    }
  });

  // ===== VITE =====

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },
      appType: "spa",
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");

    app.use(express.static(distPath));

    app.get("*", (_, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`
=================================
Palrene Server Started
=================================
Environment: ${process.env.NODE_ENV}
Port: ${PORT}
URL: ${APP_URL}
=================================
`);
  });
}

startServer().catch(console.error);
