import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY not configured",
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
    });

    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

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
        temperature: 0.8,
      },
    });

    return res.status(200).json({
      reply: response.text || "I'm reflecting on your thoughts.",
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      error: error.message,
    });
  }
}
