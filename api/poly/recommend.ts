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

    const { interests = [], goals = [], currentBio = "" } = req.body;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
Interests: ${interests.join(", ")}
Goals: ${goals.join(", ")}
Bio: ${currentBio}

Return JSON recommendations.
`,
      config: {
        responseMimeType: "application/json",
      },
    });

    return res.status(200).json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    return res.status(500).json({
      error: error.message,
    });
  }
}
