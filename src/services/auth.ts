import { supabase, isSupabaseConfigured } from './supabase';
import { loadOnboardingData, saveOnboardingData, FitnessGoal, Gender, ActivityLevel, ExperienceLevel, WorkoutLocation } from './onboarding';

export interface AuthUser {
  id: string;
  email: string;
  createdAt: string;
}

class SupabaseNotConfiguredError extends Error {
  constructor() {
    super('Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file.');
  }
}

export function isAuthAvailable(): boolean {
  return isSupabaseConfigured;
}

export async function signIn(email: string, password: string): Promise<AuthUser> {
  if (!isSupabaseConfigured) throw new SupabaseNotConfiguredError();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  const user = data.user!;
  return {
    id: user.id,
    email: user.email ?? '',
    createdAt: user.created_at,
  };
}

export async function signUp(email: string, password: string): Promise<AuthUser> {
  if (!isSupabaseConfigured) throw new SupabaseNotConfiguredError();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  const user = data.user!;
  return {
    id: user.id,
    email: user.email ?? '',
    createdAt: user.created_at,
  };
}

export async function signOut(): Promise<void> {
  if (!isSupabaseConfigured) throw new SupabaseNotConfiguredError();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession(): Promise<AuthUser | null> {
  if (!isSupabaseConfigured) return null;
  const { data } = await supabase.auth.getSession();
  if (!data.session?.user) return null;
  return {
    id: data.session.user.id,
    email: data.session.user.email ?? '',
    createdAt: data.session.user.created_at,
  };
}

export async function syncOnboardingToCloud(): Promise<void> {
  if (!isSupabaseConfigured) throw new SupabaseNotConfiguredError();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const localData = await loadOnboardingData();

  const { error } = await supabase.from('profiles').upsert(
    {
      user_id: session.user.id,
      fitness_goal: localData.fitnessGoal,
      age: localData.age ? parseInt(localData.age) : null,
      gender: localData.gender,
      height_cm: localData.heightCm ? parseFloat(localData.heightCm) : null,
      weight_kg: localData.weightKg ? parseFloat(localData.weightKg) : null,
      target_weight_kg: localData.targetWeightKg ? parseFloat(localData.targetWeightKg) : null,
      weekly_goal_kg: localData.weeklyGoalKg ? parseFloat(localData.weeklyGoalKg) : null,
      workout_frequency: localData.workoutFrequency ? parseInt(localData.workoutFrequency) : null,
      activity_level: localData.activityLevel,
      experience_level: localData.experienceLevel,
      workout_location: localData.workoutLocation,
      injuries: localData.injuries || null,
      unit_system: localData.unitSystem,
      onboarding_completed: true,
    },
    { onConflict: 'user_id' }
  );

  if (error) throw error;
}

export async function loadProfileFromCloud(): Promise<Record<string, unknown> | null> {
  if (!isSupabaseConfigured) return null;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  if (error || !data) return null;
  return data;
}

export async function mergeCloudToLocal(): Promise<void> {
  const cloudProfile = await loadProfileFromCloud();
  if (!cloudProfile) return;

  await saveOnboardingData({
    fitnessGoal: (cloudProfile.fitness_goal as FitnessGoal | null) ?? undefined,
    age: cloudProfile.age != null ? String(cloudProfile.age) : undefined,
    gender: (cloudProfile.gender as Gender | null) ?? undefined,
    heightCm: cloudProfile.height_cm != null ? String(cloudProfile.height_cm) : undefined,
    weightKg: cloudProfile.weight_kg != null ? String(cloudProfile.weight_kg) : undefined,
    targetWeightKg: cloudProfile.target_weight_kg != null ? String(cloudProfile.target_weight_kg) : undefined,
    weeklyGoalKg: cloudProfile.weekly_goal_kg != null ? String(cloudProfile.weekly_goal_kg) : undefined,
    workoutFrequency: cloudProfile.workout_frequency != null ? String(cloudProfile.workout_frequency) : undefined,
    activityLevel: (cloudProfile.activity_level as ActivityLevel | null) ?? undefined,
    experienceLevel: (cloudProfile.experience_level as ExperienceLevel | null) ?? undefined,
    workoutLocation: (cloudProfile.workout_location as WorkoutLocation | null) ?? undefined,
    injuries: (cloudProfile.injuries as string | null) ?? undefined,
    unitSystem: (cloudProfile.unit_system as 'metric' | 'imperial' | null) ?? undefined,
    onboardingCompleted: true,
  });
}