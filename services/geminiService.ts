import { GoogleGenAI, Type } from "@google/genai";
import { Thought } from "../types";

// 初始化 Gemini 客户端
// 注意：API Key 必须通过环境变量注入
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// 模型常量
const TAGGING_MODEL = "gemini-2.5-flash";
const SUMMARY_MODEL = "gemini-2.5-flash"; // 使用 Flash 保证速度，如果需要深度推理可用 gemini-3-pro-preview

/**
 * 自动为用户的灵感生成 1-3 个标签
 */
export const generateTagsForThought = async (text: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: TAGGING_MODEL,
      contents: `请分析以下用户的灵感片段，并给出 1 到 3 个最相关的中文分类标签（例如：工作、生活、创意、学习、健身等）。直接返回标签列表，不要废话。
      
      内容：${text}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    const jsonStr = response.text;
    if (!jsonStr) return ["未分类"];
    
    return JSON.parse(jsonStr) as string[];
  } catch (error) {
    console.error("Tag generation failed:", error);
    return ["未分类"];
  }
};

/**
 * 将一天的所有灵感整理成结构化的 Markdown 日报
 */
export const generateDailySummary = async (thoughts: Thought[]): Promise<string> => {
  if (thoughts.length === 0) return "今日暂无记录。";

  // 构建 prompt context
  const thoughtsText = thoughts.map(t => `- [${new Date(t.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}] ${t.content} (标签: ${t.tags.join(', ')})`).join('\n');
  const dateStr = new Date().toLocaleDateString();

  const prompt = `
  你是一个专业的个人知识管理助手。请根据以下用户今天记录的碎片化灵感，生成一份结构清晰的“今日总结”。
  
  日期：${dateStr}
  
  原始记录：
  ${thoughtsText}
  
  要求：
  1. 使用 Markdown 格式。
  2. 将内容按主题进行聚类（例如：## 💡 产品想法、## 💼 工作事项、## 🧘 生活感悟）。
  3. 提取核心洞察，不要只是罗列。
  4. 在最后包含一个 ### 🔑 关键词总结 部分。
  5. 语气专业、简洁、令人愉悦。
  `;

  try {
    const response = await ai.models.generateContent({
      model: SUMMARY_MODEL,
      contents: prompt,
      config: {
        // 使用 Thinking Config 稍微增加一点推理深度，使总结更有条理
        thinkingConfig: { thinkingBudget: 1024 }, 
        maxOutputTokens: 2048
      }
    });

    return response.text || "生成总结失败，请稍后重试。";
  } catch (error) {
    console.error("Summary generation failed:", error);
    return "生成总结时遇到问题，请检查网络或 API 配额。";
  }
};