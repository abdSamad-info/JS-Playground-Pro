import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const geminiService = {
  async chat(message: string, context: string) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `You are an expert JavaScript developer assistant. 
                Context of current files:
                ${context}
                
                User question: ${message}`
              }
            ]
          }
        ],
        config: {
          systemInstruction: "You are a helpful coding assistant for a JavaScript playground. Provide clear, concise code snippets and explanations. Always wrap code in markdown blocks.",
        }
      });

      return response.text;
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  },

  async explainCode(code: string) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Explain this code briefly and suggest improvements:\n\n${code}`,
      });
      return response.text;
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  }
};
