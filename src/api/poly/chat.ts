import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
    });

    const { message, history } = req.body;

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
    });

    return res.status(200).json({
      reply: response.text,
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      error: error.message,
    });
  }
}
