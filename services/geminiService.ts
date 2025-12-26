
import { GoogleGenAI, Type } from "@google/genai";
import { PersonaResponse } from "../types.ts";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async generatePersona(name: string): Promise<PersonaResponse> {
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `分析名字 "${name}" 的性格与气质，为它挑选 2 到 3 种匹配的渐变色（以十六进制代码形式），并生成一句能够触动人心、契合这个名字独特韵味的座右铭或优美语句。请使用中文。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            colors: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            quote: {
              type: Type.STRING,
            },
            mood: {
              type: Type.STRING,
            },
          },
          required: ["colors", "quote", "mood"],
        },
      },
    });

    try {
      const result = JSON.parse(response.text || '{}');
      return result as PersonaResponse;
    } catch (error) {
      console.error("Failed to parse Gemini response", error);
      throw new Error("AI 响应解析失败");
    }
  }
}

export const geminiService = new GeminiService();
