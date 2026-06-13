import { GoogleGenAI } from "@google/genai";
import { rateLimit, getRateLimitHeaders } from "../rate-limit";

export default async function handler(req: any, res: any) {
  // Guard clause for HTTP Methods
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  // Rate limiting: 15 requests per minute per IP
  const clientIp = req.headers["x-forwarded-for"] || req.connection?.remoteAddress || "unknown";
  const { success, remaining, resetAt } = rateLimit(`recommend:${clientIp}`, {
    windowMs: 60000,
    maxRequests: 15,
  });

  if (!success) {
    return res.status(429).json({
      error: "Too many requests. Please wait before continuing.",
      retryAfter: Math.ceil((resetAt - Date.now()) / 1000),
    });
  }

  // Set rate limit headers
  Object.entries(getRateLimitHeaders(remaining, resetAt)).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY not configured",
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Fix: Read profile metadata or userId sent from PolyChat.tsx
    // Provide safe defaults so it never crashes if fields are missing
    const { userId, userProfile = {} } = req.body;

    // Build a structured prompt telling Gemini to act as a system recommender
    const systemPrompt = `
      You are Poly, an AI companion. Based on the user profile data provided, generate 3 highly personalized, engaging, and brief starter recommendations or action items for their dashboard.
      Return the output as a clean text summary or bullet points.
      
      User Profile Context:
      ${JSON.stringify(userProfile)}
      User ID: ${userId || "New User"}
    `;

    // Fix: Pass structured parameters into the SDK generator configuration block
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
      ],
      config: {
        temperature: 0.7,
      },
    });

    // Safeguard missing or truncated responses safely
    const recommendationReply =
      response.text || "Explore the community feed to connect with others!";

    return res.status(200).json({
      reply: recommendationReply,
    });
  } catch (error: any) {
    console.error("POLY RECOMMENDATION ENGINE ERROR:", error);

    return res.status(500).json({
      error: error?.message || "Internal Server Error",
      stack: process.env.NODE_ENV === "development" ? error?.stack : undefined,
    });
  }
}
