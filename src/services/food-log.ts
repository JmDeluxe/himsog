import AsyncStorage from '@react-native-async-storage/async-storage';

const FOOD_LOG_KEY = '@himsog_food_log';

export interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string | null;
  source: 'barcode' | 'ai' | 'manual';
  timestamp: number;
}

export interface DailySummary {
  date: string;
  consumed: number;
  protein: number;
  carbs: number;
  fat: number;
  entries: FoodEntry[];
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function getDateKey(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getTodayKey(): string {
  return getDateKey(Date.now());
}

export async function loadFoodLog(): Promise<Record<string, FoodEntry[]>> {
  try {
    const raw = await AsyncStorage.getItem(FOOD_LOG_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

export async function addFoodEntry(entry: Omit<FoodEntry, 'id' | 'timestamp'>): Promise<FoodEntry> {
  const log = await loadFoodLog();
  const newEntry: FoodEntry = {
    ...entry,
    id: generateId(),
    timestamp: Date.now(),
  };
  const dateKey = getTodayKey();
  if (!log[dateKey]) log[dateKey] = [];
  log[dateKey].push(newEntry);
  await AsyncStorage.setItem(FOOD_LOG_KEY, JSON.stringify(log));
  return newEntry;
}

export async function removeFoodEntry(entryId: string): Promise<void> {
  const log = await loadFoodLog();
  for (const date of Object.keys(log)) {
    log[date] = log[date].filter((e: FoodEntry) => e.id !== entryId);
    if (log[date].length === 0) delete log[date];
  }
  await AsyncStorage.setItem(FOOD_LOG_KEY, JSON.stringify(log));
}

export async function clearFoodLog(): Promise<void> {
  await AsyncStorage.removeItem(FOOD_LOG_KEY);
}

export function getDailySummary(log: Record<string, FoodEntry[]>, dateKey?: string): DailySummary {
  const key = dateKey ?? getTodayKey();
  const entries = log[key] ?? [];
  return {
    date: key,
    consumed: entries.reduce((sum, e) => sum + e.calories, 0),
    protein: entries.reduce((sum, e) => sum + e.protein, 0),
    carbs: entries.reduce((sum, e) => sum + e.carbs, 0),
    fat: entries.reduce((sum, e) => sum + e.fat, 0),
    entries,
  };
}