import React, { createContext, useContext, useEffect, useState } from 'react';

import {
  FoodEntry,
  DailySummary,
  loadFoodLog,
  addFoodEntry as persistAddEntry,
  removeFoodEntry as persistRemoveEntry,
  clearFoodLog as persistClearLog,
  getDailySummary,
} from '@/services/food-log';

interface FoodLogContextValue {
  log: Record<string, FoodEntry[]>;
  today: DailySummary;
  loading: boolean;
  addEntry: (entry: Omit<FoodEntry, 'id' | 'timestamp'>) => Promise<void>;
  removeEntry: (entryId: string) => Promise<void>;
  refreshLog: () => Promise<void>;
  clearLog: () => Promise<void>;
}

const FoodLogContext = createContext<FoodLogContextValue | null>(null);

export function FoodLogProvider({ children }: { children: React.ReactNode }) {
  const [log, setLog] = useState<Record<string, FoodEntry[]>>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const loaded = await loadFoodLog();
    setLog(loaded);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const today = getDailySummary(log);

  const addEntry = async (entry: Omit<FoodEntry, 'id' | 'timestamp'>) => {
    await persistAddEntry(entry);
    await load();
  };

  const removeEntry = async (entryId: string) => {
    await persistRemoveEntry(entryId);
    await load();
  };

  const refreshLog = async () => {
    await load();
  };

  const clearLog = async () => {
    await persistClearLog();
    setLog({});
  };

  return (
    <FoodLogContext.Provider value={{ log, today, loading, addEntry, removeEntry, refreshLog, clearLog }}>
      {children}
    </FoodLogContext.Provider>
  );
}

export function useFoodLog() {
  const ctx = useContext(FoodLogContext);
  if (!ctx) {
    return {
      log: {} as Record<string, FoodEntry[]>,
      today: { date: '', consumed: 0, protein: 0, carbs: 0, fat: 0, entries: [] } as DailySummary,
      loading: true,
      addEntry: async () => {},
      removeEntry: async () => {},
      refreshLog: async () => {},
      clearLog: async () => {},
    };
  }
  return ctx;
}