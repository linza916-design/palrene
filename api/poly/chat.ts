import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  // Guard clause for HTTP Methods
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    // Ensure API Key exists securely before loading the instance
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res
        .status(500)
        .json({ error: "Missing GEMINI_API_KEY environment variable." });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Fix: Provide defaults for body destructuring to avoid crashes on blank payloads
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message parameter is required." });
    }

    const formattedContents: any[] = [];

    // Map conversation history to canonical Gemini layout structures
    if (Array.isArray(history)) {
      history.forEach((h: any) => {
        if (h.content) {
          formattedContents.push({
            role: h.role === "assistant" ? "model" : "user",
            parts: [{ text: h.content }],
          });
        }
      });
    }

    // Append the final user message to the stack
    formattedContents.push({
      role: "user",
      parts: [{ text: message }],
    });

    // Fix: Correct SDK casing invocation pattern for Node runtime packages
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: formattedContents,
    });

    return res.status(200).json({
      reply: response.text || "No response text generated.",
    });
  } catch (error: any) {
    console.error("Gemini API handler error:", error);

    return res.status(500).json({
      error: error.message || "Internal Server Error",
    });
  }
}
