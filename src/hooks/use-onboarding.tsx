import React, { createContext, useContext, useEffect, useState } from 'react';

import {
  OnboardingData,
  defaultOnboardingData,
  loadOnboardingData,
  saveOnboardingData,
  completeOnboarding as persistComplete,
} from '@/services/onboarding';

interface OnboardingContextValue {
  data: OnboardingData;
  loading: boolean;
  updateData: (partial: Partial<OnboardingData>) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
  refreshData: () => Promise<void>;
  markSynced: () => Promise<void>;
  isOnboarded: boolean;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<OnboardingData>(defaultOnboardingData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOnboardingData().then((loaded) => {
      setData(loaded);
      setLoading(false);
    });
  }, []);

  const updateData = async (partial: Partial<OnboardingData>) => {
    const needUnsync = Object.keys(partial).some((k) => k !== 'isSynced');
    const next = { ...data, ...partial, ...(needUnsync ? { isSynced: false } : {}) };
    setData(next);
    await saveOnboardingData({ ...partial, ...(needUnsync ? { isSynced: false } : {}) });
  };

  const completeOnboarding = async () => {
    const next = { ...data, onboardingCompleted: true, isSynced: false };
    setData(next);
    await persistComplete();
  };

  const markSynced = async () => {
    const next = { ...data, isSynced: true };
    setData(next);
    await saveOnboardingData({ isSynced: true });
  };

  const resetOnboarding = async () => {
    setData({ ...defaultOnboardingData });
    const { clearOnboardingData } = await import('@/services/onboarding');
    await clearOnboardingData();
  };

  const refreshData = async () => {
    const loaded = await loadOnboardingData();
    setData(loaded);
  };

  return (
    <OnboardingContext.Provider
      value={{
        data,
        loading,
        updateData,
        completeOnboarding,
        resetOnboarding,
        refreshData,
        markSynced,
        isOnboarded: data.onboardingCompleted,
      }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    return {
      data: defaultOnboardingData,
      loading: true,
      updateData: async () => {},
      completeOnboarding: async () => {},
      resetOnboarding: async () => {},
      refreshData: async () => {},
      markSynced: async () => {},
      isOnboarded: false,
    };
  }
  return ctx;
}