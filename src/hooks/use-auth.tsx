import React, { createContext, useContext, useEffect, useState } from 'react';

import { AuthUser, getSession, signIn as authSignIn, signUp as authSignUp, signOut as authSignOut, syncOnboardingToCloud, hasCloudProfile } from '@/services/auth';
import { clearOnboardingData } from '@/services/onboarding';
import { resetLocalAiCount } from '@/services/ai-coach';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  syncToCloud: () => Promise<void>;
  clearLocalData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSession().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    const u = await authSignIn(email, password);
    setUser(u);
    const hasCloud = await hasCloudProfile();
    return hasCloud;
  };

  const signUp = async (email: string, password: string) => {
    const u = await authSignUp(email, password);
    setUser(u);
  };

  const signOut = async () => {
    await authSignOut();
    setUser(null);
    await resetLocalAiCount();
  };

  const syncToCloud = async () => {
    await syncOnboardingToCloud();
  };

  const clearLocalData = async () => {
    await clearOnboardingData();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, syncToCloud, clearLocalData }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    return {
      user: null,
      loading: true,
      signIn: async () => false as boolean,
      signUp: async () => {},
      signOut: async () => {},
      syncToCloud: async () => {},
      clearLocalData: async () => {},
    };
  }
  return ctx;
}