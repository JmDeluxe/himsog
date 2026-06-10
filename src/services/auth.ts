import { supabase, isSupabaseConfigured } from './supabase';
import { loadOnboardingData, saveOnboardingData, FitnessGoal, Gender, ActivityLevel, ExperienceLevel, WorkoutLocation } from './onboarding';

export interface AuthUser {
  id: string;
  email: string;
  createdAt: string;
}

export interface UserProfile {
  username: string | null;
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

  try {
    await syncOnboardingToCloud();
  } catch (e) {
    console.warn('Failed to sync onboarding data after sign up:', (e as Error).message);
  }

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

  const { error } = await supabase.rpc('sync_onboarding_data', {
    p_fitness_goal: localData.fitnessGoal,
    p_age: localData.age ? parseInt(localData.age) : null,
    p_gender: localData.gender,
    p_height_cm: localData.heightCm ? parseFloat(localData.heightCm) : null,
    p_weight_kg: localData.weightKg ? parseFloat(localData.weightKg) : null,
    p_target_weight_kg: localData.targetWeightKg ? parseFloat(localData.targetWeightKg) : null,
    p_weekly_goal_kg: localData.weeklyGoalKg ? parseFloat(localData.weeklyGoalKg) : null,
    p_workout_frequency: localData.workoutFrequency ? parseInt(localData.workoutFrequency) : null,
    p_activity_level: localData.activityLevel,
    p_experience_level: localData.experienceLevel,
    p_workout_location: localData.workoutLocations,
    p_injuries: localData.injuries || null,
    p_unit_system: localData.unitSystem,
    p_username: localData.username || null,
  });

  if (error) throw error;
}

export async function updateUsername(username: string): Promise<void> {
  if (!isSupabaseConfigured) throw new SupabaseNotConfiguredError();
  const { error } = await supabase.rpc('UPDATE_USERNAME', { p_username: username });
  if (error) throw error;
}

export async function getProfile(): Promise<UserProfile | null> {
  if (!isSupabaseConfigured) return null;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from('profile')
    .select('username')
    .eq('user_id', session.user.id)
    .single();

  if (error || !data) return null;
  return { username: data.username as string | null };
}

export async function loadProfileFromCloud(): Promise<Record<string, unknown> | null> {
  if (!isSupabaseConfigured) return null;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from('profile')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  if (error || !data) return null;
  return data;
}

export async function hasCloudProfile(): Promise<boolean> {
  const profile = await loadProfileFromCloud();
  return profile !== null && (profile as any).onboarding_completed === true;
}

export function cloudProfileToLocal(cloudProfile: Record<string, unknown>): Partial<import('@/services/onboarding').OnboardingData> {
  return {
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
    workoutLocations: Array.isArray(cloudProfile.workout_location) ? cloudProfile.workout_location as WorkoutLocation[] : [],
    injuries: (cloudProfile.injuries as string | null) ?? undefined,
    username: (cloudProfile.username as string | null) ?? undefined,
    unitSystem: (cloudProfile.unit_system as 'metric' | 'imperial' | null) ?? undefined,
    onboardingCompleted: true,
  };
}

export async function mergeCloudToLocal(): Promise<void> {
  const cloudProfile = await loadProfileFromCloud();
  if (!cloudProfile) return;
  await saveOnboardingData(cloudProfileToLocal(cloudProfile));
}

export async function incrementCloudAiCount(): Promise<number> {
  if (!isSupabaseConfigured) throw new SupabaseNotConfiguredError();
  const { data, error } = await supabase.rpc('increment_ai_count');
  if (error) throw error;
  return (data as number) ?? 0;
}

export async function getCloudAiCount(): Promise<number> {
  if (!isSupabaseConfigured) return 0;
  const { data, error } = await supabase.rpc('get_ai_count');
  if (error) throw error;
  return (data as number) ?? 0;
}