import { OnboardingData } from './onboarding';
import {
  FITNESS_GOAL_LABELS,
  ACTIVITY_LEVEL_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  WORKOUT_LOCATION_LABELS,
} from './onboarding';
import { getGenerativeModel, isGeminiConfigured } from './gemini';
import { incrementCloudAiCount, getCloudAiCount, isAuthAvailable } from './auth';

export const MAX_MESSAGE_LENGTH = 300;
const GUEST_DAILY_LIMIT = 5;
const USER_DAILY_LIMIT = 20;

const LOCAL_AI_COUNT_KEY = '@himsog_ai_count';
const LOCAL_AI_COUNT_DATE_KEY = '@himsog_ai_count_date';

async function getLocalAiCount(): Promise<number> {
  const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
  const storedDate = await AsyncStorage.getItem(LOCAL_AI_COUNT_DATE_KEY);
  const today = new Date().toISOString().slice(0, 10);
  if (storedDate !== today) return 0;
  const count = await AsyncStorage.getItem(LOCAL_AI_COUNT_KEY);
  return count ? parseInt(count, 10) : 0;
}

async function incrementLocalAiCount(): Promise<number> {
  const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
  const today = new Date().toISOString().slice(0, 10);
  const storedDate = await AsyncStorage.getItem(LOCAL_AI_COUNT_DATE_KEY);
  let count = 0;
  if (storedDate === today) {
    const stored = await AsyncStorage.getItem(LOCAL_AI_COUNT_KEY);
    count = stored ? parseInt(stored, 10) : 0;
  }
  count += 1;
  await AsyncStorage.setItem(LOCAL_AI_COUNT_KEY, String(count));
  await AsyncStorage.setItem(LOCAL_AI_COUNT_DATE_KEY, today);
  return count;
}

export async function getRemainingMessages(isLoggedIn: boolean): Promise<number> {
  if (isLoggedIn && isAuthAvailable()) {
    try {
      const cloudCount = await getCloudAiCount();
      return Math.max(0, USER_DAILY_LIMIT - cloudCount);
    } catch {
      // fallback to local
    }
  }
  const localCount = await getLocalAiCount();
  return Math.max(0, GUEST_DAILY_LIMIT - localCount);
}

export async function checkRateLimit(isLoggedIn: boolean): Promise<void> {
  if (isLoggedIn && isAuthAvailable()) {
    const cloudCount = await getCloudAiCount();
    if (cloudCount >= USER_DAILY_LIMIT) {
      throw new Error(`Daily limit reached (${USER_DAILY_LIMIT} messages). Sign in or try again tomorrow.`);
    }
  } else {
    const localCount = await getLocalAiCount();
    if (localCount >= GUEST_DAILY_LIMIT) {
      throw new Error(`Daily limit reached (${GUEST_DAILY_LIMIT} messages for guests). Sign in for ${USER_DAILY_LIMIT} messages/day.`);
    }
  }
}

async function recordUsage(isLoggedIn: boolean): Promise<void> {
  if (isLoggedIn && isAuthAvailable()) {
    try { await incrementCloudAiCount(); } catch {}
  } else {
    await incrementLocalAiCount();
  }
}

export async function resetLocalAiCount(): Promise<void> {
  const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
  await AsyncStorage.removeItem(LOCAL_AI_COUNT_KEY);
  await AsyncStorage.removeItem(LOCAL_AI_COUNT_DATE_KEY);
}

export function isAIAvailable(): boolean {
  return isGeminiConfigured;
}

export function buildUserContext(data: OnboardingData): string {
  const weightKg = parseFloat(data.weightKg) || 0;
  const heightCm = parseFloat(data.heightCm) || 0;
  const age = parseInt(data.age) || 0;

  const locations = data.workoutLocations.length > 0
    ? data.workoutLocations.map((l) => WORKOUT_LOCATION_LABELS[l]).join(', ')
    : 'Not set';

  return `Profile: Goal=${data.fitnessGoal ? FITNESS_GOAL_LABELS[data.fitnessGoal] : '?'}, Age=${age || '?'}, Gender=${data.gender || '?'}, Weight=${weightKg}kg, Height=${heightCm}cm, Activity=${data.activityLevel ? ACTIVITY_LEVEL_LABELS[data.activityLevel] : '?'}, Level=${data.experienceLevel ? EXPERIENCE_LEVEL_LABELS[data.experienceLevel] : '?'}, Location=${locations}, Frequency=${data.workoutFrequency}x/wk, Injuries=${data.injuries || 'None'}`;
}

const SYSTEM_PROMPT = `You are HimsogAI, a personal fitness and health assistant. You ONLY answer questions related to fitness, exercise, nutrition, weight management, injuries, and health motivation.

STRICT RULES:
- If the user asks about anything unrelated (politics, coding, entertainment, general knowledge, etc.), politely decline and redirect them to fitness topics
- Never provide medical diagnoses — always suggest consulting a doctor for serious concerns
- Keep responses SHORT — 2-3 sentences max. Use bullet points only for workout plans.
- Tailor advice to the user's profile when relevant
- Be encouraging but realistic`;

export interface ChatHistoryItem {
  role: 'user' | 'model';
  text: string;
}

const MAX_HISTORY = 6;

export async function askAI(
  userMessage: string,
  userData: OnboardingData,
  history: ChatHistoryItem[] = [],
  isLoggedIn: boolean = false
): Promise<string> {
  if (!isGeminiConfigured) {
    throw new Error('Gemini API key not configured.');
  }

  if (userMessage.length > MAX_MESSAGE_LENGTH) {
    throw new Error(`Message too long. Max ${MAX_MESSAGE_LENGTH} characters.`);
  }

  await checkRateLimit(isLoggedIn);

  const model = getGenerativeModel('gemini-2.5-flash');

  const context = buildUserContext(userData);

  const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [
    {
      role: 'user',
      parts: [{ text: `${SYSTEM_PROMPT}\n\n${context}` }],
    },
    {
      role: 'model',
      parts: [{ text: 'Got it! I\'m ready to help with your fitness questions.' }],
    },
  ];

  const recentHistory = history.slice(-MAX_HISTORY);
  for (const msg of recentHistory) {
    contents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    });
  }

  contents.push({
    role: 'user',
    parts: [{ text: userMessage }],
  });

  const result = await model.generateContent({
    contents,
    generationConfig: {
      temperature: 0.5,
      maxOutputTokens: 512,
    },
  });

  const response = result.response;
  const text = response.text();

  if (!text) {
    throw new Error('No response from AI.');
  }

  await recordUsage(isLoggedIn);

  return text;
}

export interface AIFoodEstimate {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
}

export async function estimateFood(foodDescription: string, isLoggedIn: boolean = false): Promise<AIFoodEstimate> {
  if (!isGeminiConfigured) {
    throw new Error('Gemini API key not configured.');
  }

  await checkRateLimit(isLoggedIn);

  const model = getGenerativeModel('gemini-2.5-flash');

  const prompt = `Estimate the nutrition for this food: "${foodDescription}"

Respond ONLY with valid JSON in this exact format, no other text:
{"name":"Food Name","calories":300,"protein":25,"carbs":30,"fat":10,"servingSize":"1 serving (200g)"}

Use reasonable estimates based on typical portions. If the description includes a quantity, account for it.`;

  const result = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 256,
    },
  });

  const text = result.response.text();

  if (!text) {
    throw new Error('No response from AI.');
  }

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not parse food estimate.');
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      name: String(parsed.name || foodDescription),
      calories: Number(parsed.calories) || 0,
      protein: Number(parsed.protein) || 0,
      carbs: Number(parsed.carbs) || 0,
      fat: Number(parsed.fat) || 0,
      servingSize: String(parsed.servingSize || '1 serving'),
    };
  } catch {
    throw new Error('Could not parse food estimate.');
  }

  await recordUsage(isLoggedIn);
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: number;
}

const CHAT_STORAGE_KEY = '@himsog_ai_chat';

export async function loadChatHistory(): Promise<ChatMessage[]> {
  try {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    const raw = await AsyncStorage.getItem(CHAT_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return [];
}

export async function saveChatHistory(messages: ChatMessage[]): Promise<void> {
  try {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    await AsyncStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  } catch {}
}

export async function clearChatHistory(): Promise<void> {
  try {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    await AsyncStorage.removeItem(CHAT_STORAGE_KEY);
  } catch {}
}