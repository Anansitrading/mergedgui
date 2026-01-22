import { GoogleGenAI } from "@google/genai";

// Initialize the client
// In a real implementation, API_KEY would come from process.env or a secure store
// const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || 'mock-key' });

export async function generateContent(prompt: string, model: string = "gemini-3-flash-preview") {
  // Placeholder for actual API call
  // const response = await ai.models.generateContent({
  //   model: model,
  //   contents: prompt,
  // });
  // return response.text;
  
  return `[Mock Response for: ${prompt}]`;
}