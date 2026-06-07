import { OnboardingData } from './onboarding';
import {
  FITNESS_GOAL_LABELS,
  ACTIVITY_LEVEL_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  WORKOUT_LOCATION_LABELS,
  calculateBMI,
  getBMICategory,
  calculateDailyCalories,
  kgToLbs,
  cmToImperial,
} from './onboarding';
import { getGenerativeModel, isGeminiConfigured } from './gemini';

export function isAIAvailable(): boolean {
  return isGeminiConfigured;
}

export function buildUserContext(data: OnboardingData): string {
  const weightKg = parseFloat(data.weightKg) || 0;
  const heightCm = parseFloat(data.heightCm) || 0;
  const age = parseInt(data.age) || 0;
  const targetKg = parseFloat(data.targetWeightKg) || 0;
  const freq = parseInt(data.workoutFrequency) || 3;
  const weeklyGoal = parseFloat(data.weeklyGoalKg) || 0.5;

  const bmi = weightKg && heightCm ? calculateBMI(weightKg, heightCm) : null;
  const bmiCategory = bmi ? getBMICategory(bmi) : '';
  const calories =
    data.gender && data.fitnessGoal && data.activityLevel
      ? calculateDailyCalories(data.gender, age, weightKg, heightCm, data.activityLevel, data.fitnessGoal)
      : null;

  const heightDisplay =
    data.unitSystem === 'imperial' && heightCm
      ? (() => { const { feet, inches } = cmToImperial(heightCm); return `${feet}'${inches}"`; })()
      : heightCm ? `${heightCm} cm` : '';

  const weightDisplay = data.unitSystem === 'imperial' && weightKg ? `${kgToLbs(weightKg)} lbs` : weightKg ? `${weightKg} kg` : '';
  const targetDisplay = data.unitSystem === 'imperial' && targetKg ? `${kgToLbs(targetKg)} lbs` : targetKg ? `${targetKg} kg` : '';
  const weeklyDisplay = data.unitSystem === 'imperial' ? `${(weeklyGoal * 2.20462).toFixed(1)} lbs/wk` : `${weeklyGoal} kg/wk`;

  const locations = data.workoutLocations.length > 0
    ? data.workoutLocations.map((l) => WORKOUT_LOCATION_LABELS[l]).join(', ')
    : 'Not set';

  return `User Profile:
- Username: ${data.username || 'Not set'}
- Goal: ${data.fitnessGoal ? FITNESS_GOAL_LABELS[data.fitnessGoal] : 'Not set'}
- Age: ${age || 'Not set'}
- Gender: ${data.gender || 'Not set'}
- Height: ${heightDisplay}
- Current Weight: ${weightDisplay}
- Target Weight: ${targetDisplay}
- Weekly Pace: ${weeklyDisplay}
- BMI: ${bmi ? `${bmi} (${bmiCategory})` : 'Not available'}
- Estimated Daily Calories: ${calories || 'Not available'}
- Activity Level: ${data.activityLevel ? ACTIVITY_LEVEL_LABELS[data.activityLevel] : 'Not set'}
- Experience Level: ${data.experienceLevel ? EXPERIENCE_LEVEL_LABELS[data.experienceLevel] : 'Not set'}
- Workout Location: ${locations}
- Workout Frequency: ${freq}x per week
- Injuries/Limitations: ${data.injuries || 'None'}`;
}

const SYSTEM_PROMPT = `You are HimsogAI, a personal fitness and health assistant. You ONLY answer questions related to fitness, exercise, nutrition, weight management, workout plans, and health motivation.

STRICT RULES:
- If the user asks about anything unrelated (politics, coding, entertainment, general knowledge, etc.), politely decline and redirect them to fitness topics
- Say something like: "I'm your fitness assistant! I can only help with workouts, nutrition, and health topics. Ask me about your training plan, diet, or fitness goals!"
- Never provide medical diagnoses — always suggest consulting a doctor for health concerns
- Keep responses concise and practical
- Use bullet points or numbered lists for workout plans
- Tailor all advice to the user's profile (fitness level, goals, injuries, available equipment)
- Be encouraging but realistic`;

export async function askAI(userMessage: string, userData: OnboardingData): Promise<string> {
  if (!isGeminiConfigured) {
    throw new Error('Gemini API key not configured.');
  }

  const model = getGenerativeModel('gemini-2.5-flash');

  const context = buildUserContext(userData);

  const result = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [{ text: `${SYSTEM_PROMPT}\n\n${context}\n\nUser: ${userMessage}` }],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  });

  const response = result.response;
  const text = response.text();

  if (!text) {
    throw new Error('No response from AI.');
  }

  return text;
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