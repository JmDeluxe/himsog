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
    const next = { ...data, ...partial };
    setData(next);
    await saveOnboardingData(partial);
  };

  const completeOnboarding = async () => {
    const next = { ...data, onboardingCompleted: true };
    setData(next);
    await persistComplete();
  };

  const resetOnboarding = async () => {
    setData({ ...defaultOnboardingData });
    const { clearOnboardingData } = await import('@/services/onboarding');
    await clearOnboardingData();
  };

  return (
    <OnboardingContext.Provider
      value={{
        data,
        loading,
        updateData,
        completeOnboarding,
        resetOnboarding,
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
      isOnboarded: false,
    };
  }
  return ctx;
}