
import { GoogleGenAI, Type } from "@google/genai";
import { PersonaResponse } from "../types.ts";

export class GeminiService {
  async generatePersona(name: string): Promise<PersonaResponse> {
    // 动态获取 API KEY，处理浏览器环境 process 可能未定义的情况
    const apiKey = (window as any).process?.env?.API_KEY || (typeof process !== 'undefined' ? process.env.API_KEY : '');
    
    if (!apiKey) {
      throw new Error("API_KEY 未配置，请在 Netlify 环境变量中设置 API_KEY");
    }

    // 每次请求时创建实例，确保获取最新的环境配置
    const ai = new GoogleGenAI({ apiKey });
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              {
                text: `分析名字 "${name}" 的性格与气质，为它挑选 2 到 3 种匹配的渐变色（以十六进制代码形式），并生成一句能够触动人心、契合这个名字独特韵味的座右铭或优美语句。请以 JSON 格式返回，包含 colors (数组), quote (字符串), mood (字符串)。请务必使用中文。`
              }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              colors: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "2-3个十六进制颜色代码",
              },
              quote: {
                type: Type.STRING,
                description: "契合名字的优美句子",
              },
              mood: {
                type: Type.STRING,
                description: "名字代表的一两个词的性格气质",
              },
            },
            required: ["colors", "quote", "mood"],
          },
        },
      });

      const text = response.text;
      if (!text) throw new Error("AI 返回内容为空");
      
      return JSON.parse(text) as PersonaResponse;
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      // 提取更具体的错误信息
      if (error.message?.includes("403") || error.message?.includes("API_KEY_INVALID")) {
        throw new Error("API Key 无效或权限不足");
      }
      throw new Error(error.message || "获取灵感时发生意外");
    }
  }
}

export const geminiService = new GeminiService();
