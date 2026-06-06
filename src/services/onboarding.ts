import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@himsog_onboarding';

export type FitnessGoal = 'lose_weight' | 'gain_muscle' | 'stay_fit' | 'improve_endurance' | 'gain_weight';
export type Gender = 'male' | 'female' | 'other';
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'athlete';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export type UnitSystem = 'metric' | 'imperial';

export interface OnboardingData {
  unitSystem: UnitSystem;
  fitnessGoal: FitnessGoal | null;
  age: string;
  gender: Gender | null;
  heightCm: string;
  weightKg: string;
  targetWeightKg: string;
  weeklyGoalKg: string;
  workoutFrequency: string;
  activityLevel: ActivityLevel | null;
  experienceLevel: ExperienceLevel | null;
  onboardingCompleted: boolean;
}

export const defaultOnboardingData: OnboardingData = {
  unitSystem: 'metric',
  fitnessGoal: null,
  age: '',
  gender: null,
  heightCm: '',
  weightKg: '',
  targetWeightKg: '',
  weeklyGoalKg: '0.5',
  workoutFrequency: '3',
  activityLevel: null,
  experienceLevel: null,
  onboardingCompleted: false,
};

export function cmToImperial(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12 * 10) / 10;
  return { feet, inches };
}

export function imperialToCm(feet: number, inches: number): number {
  return Math.round((feet * 12 + inches) * 2.54 * 10) / 10;
}

export function cmToIn(cm: number): number {
  return Math.round(cm / 2.54 * 10) / 10;
}

export function inToCm(inches: number): number {
  return Math.round(inches * 2.54 * 10) / 10;
}

export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10;
}

export function lbsToKg(lbs: number): number {
  return Math.round(lbs / 2.20462 * 10) / 10;
}

export async function loadOnboardingData(): Promise<OnboardingData> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...defaultOnboardingData, ...JSON.parse(raw) };
    }
  } catch {}
  return { ...defaultOnboardingData };
}

export async function saveOnboardingData(data: Partial<OnboardingData>): Promise<void> {
  try {
    const current = await loadOnboardingData();
    const merged = { ...current, ...data };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {}
}

export async function completeOnboarding(): Promise<void> {
  await saveOnboardingData({ onboardingCompleted: true });
}

export async function clearOnboardingData(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {}
}

export function calculateBMI(weightKg: number, heightCm: number): number {
  if (heightCm <= 0 || weightKg <= 0) return 0;
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

export function calculateDailyCalories(
  gender: Gender,
  age: number,
  weightKg: number,
  heightCm: number,
  activityLevel: ActivityLevel,
  fitnessGoal: FitnessGoal
): number {
  let bmr: number;
  if (gender === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }

  const activityMultipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    athlete: 1.9,
  };

  const tdee = bmr * activityMultipliers[activityLevel];

  const goalAdjustments: Record<FitnessGoal, number> = {
    lose_weight: -500,
    gain_muscle: 300,
    stay_fit: 0,
    improve_endurance: 200,
    gain_weight: 500,
  };

  return Math.round(tdee + goalAdjustments[fitnessGoal]);
}

export function getFitnessRecommendation(
  fitnessGoal: FitnessGoal,
  experienceLevel: ExperienceLevel,
  workoutFrequency: number
): string {
  const goalMap: Record<FitnessGoal, string> = {
    lose_weight: 'Focus on a mix of cardio and strength training to burn fat while preserving muscle.',
    gain_muscle: 'Prioritize progressive overload strength training with adequate protein intake.',
    stay_fit: 'Maintain a balanced routine of cardio and strength workouts throughout the week.',
    improve_endurance: 'Gradually increase cardio duration and intensity to build your stamina.',
    gain_weight: 'Combine strength training with a caloric surplus for healthy weight gain.',
  };

  const levelMap: Record<ExperienceLevel, string> = {
    beginner: 'Start with 3 days a week and gradually increase as your body adapts.',
    intermediate: 'Aim for 4-5 sessions weekly with varied intensity and recovery days.',
    advanced: 'Push for 5-6 sessions weekly with periodization for peak performance.',
  };

  return `${goalMap[fitnessGoal]} ${levelMap[experienceLevel]}`;
}

export const FITNESS_GOAL_LABELS: Record<FitnessGoal, string> = {
  lose_weight: 'Lose Weight',
  gain_muscle: 'Gain Muscle',
  stay_fit: 'Stay Fit',
  improve_endurance: 'Improve Endurance',
  gain_weight: 'Gain Weight',
};

export const FITNESS_GOAL_ICONS: Record<FitnessGoal, string> = {
  lose_weight: 'flame',
  gain_muscle: 'dumbbell',
  stay_fit: 'heart',
  improve_endurance: 'wind',
  gain_weight: 'fork.knife',
};

export const ACTIVITY_LEVEL_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Sedentary',
  lightly_active: 'Lightly Active',
  moderately_active: 'Moderately Active',
  very_active: 'Very Active',
  athlete: 'Athlete',
};

export const ACTIVITY_LEVEL_DESCRIPTIONS: Record<ActivityLevel, string> = {
  sedentary: 'Little or no exercise',
  lightly_active: 'Light exercise 1-3 days/week',
  moderately_active: 'Moderate exercise 3-5 days/week',
  very_active: 'Hard exercise 6-7 days/week',
  athlete: 'Very hard exercise, physical job',
};

export const EXPERIENCE_LEVEL_LABELS: Record<ExperienceLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export const EXPERIENCE_LEVEL_DESCRIPTIONS: Record<ExperienceLevel, string> = {
  beginner: 'New to fitness, just starting out',
  intermediate: 'Exercise regularly, comfortable with basics',
  advanced: 'Experienced, looking to optimize performance',
};

export const GENDER_LABELS: Record<Gender, string> = {
  male: 'Male',
  female: 'Female',
  other: 'Other',
};