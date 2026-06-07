import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';

export const isGeminiConfigured = !!apiKey;

const genAI = isGeminiConfigured ? new GoogleGenerativeAI(apiKey) : null;

export function getGenerativeModel(modelName: string = 'gemini-2.5-flash') {
  if (!genAI) {
    throw new Error('Gemini API key not configured. Set EXPO_PUBLIC_GEMINI_API_KEY in your .env file.');
  }
  return genAI.getGenerativeModel({ model: modelName });
}