import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { StepLayout } from '@/components/onboarding/step-layout';
import { PrimaryButton } from '@/components/onboarding/onboarding-buttons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useOnboarding } from '@/hooks/use-onboarding';
import {
  calculateBMI,
  getBMICategory,
  calculateDailyCalories,
  getFitnessRecommendation,
  FITNESS_GOAL_LABELS,
  ACTIVITY_LEVEL_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  kgToLbs,
  cmToImperial,
} from '@/services/onboarding';

export default function SummaryScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { data, completeOnboarding } = useOnboarding();

  const weightKg = parseFloat(data.weightKg) || 0;
  const heightCm = parseFloat(data.heightCm) || 0;
  const age = parseInt(data.age) || 0;
  const targetKg = parseFloat(data.targetWeightKg) || 0;
  const freq = parseInt(data.workoutFrequency) || 3;

  const bmi = calculateBMI(weightKg, heightCm);
  const bmiCategory = getBMICategory(bmi);
  const calories = data.gender && data.fitnessGoal && data.activityLevel
    ? calculateDailyCalories(data.gender, age, weightKg, heightCm, data.activityLevel, data.fitnessGoal)
    : 0;
  const recommendation = data.fitnessGoal && data.experienceLevel
    ? getFitnessRecommendation(data.fitnessGoal, data.experienceLevel, freq)
    : '';

  const weightDisplay = data.unitSystem === 'imperial'
    ? `${kgToLbs(weightKg)} lbs`
    : `${weightKg} kg`;

  const targetDisplay = data.unitSystem === 'imperial'
    ? `${kgToLbs(targetKg)} lbs`
    : `${targetKg} kg`;

  const heightDisplay = (() => {
    if (!heightCm) return '—';
    if (data.unitSystem === 'imperial') {
      const { feet, inches } = cmToImperial(heightCm);
      return `${feet}'${Math.round(inches)}"`;
    }
    return `${heightCm} cm`;
  })();

  const handleComplete = async () => {
    await completeOnboarding();
    router.replace('/');
  };

  return (
    <StepLayout currentStep={6}>
      <View style={styles.header}>
        <ThemedText type="subtitle" style={styles.title}>
          Your personalized plan
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.subtitle}>
          Here's what we've calculated for you.
        </ThemedText>
      </View>

      <View style={styles.cards}>
        <ThemedView type="backgroundElement" style={styles.statCard}>
          <ThemedText themeColor="textSecondary" style={styles.statLabel}>BMI</ThemedText>
          <ThemedText style={[styles.statValue, { color: theme.accent }]}>{bmi || '—'}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">{bmiCategory}</ThemedText>
        </ThemedView>

        <View style={styles.row}>
          <ThemedView type="backgroundElement" style={[styles.statCard, styles.halfCard]}>
            <ThemedText themeColor="textSecondary" style={styles.statLabel}>Daily Calories</ThemedText>
            <ThemedText style={[styles.statValue, { color: theme.accent }]}>{calories || '—'}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">kcal/day</ThemedText>
          </ThemedView>

          <ThemedView type="backgroundElement" style={[styles.statCard, styles.halfCard]}>
            <ThemedText themeColor="textSecondary" style={styles.statLabel}>Target</ThemedText>
            <ThemedText style={[styles.statValue, { color: theme.accent }]}>{targetDisplay}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              from {weightDisplay}
            </ThemedText>
          </ThemedView>
        </View>
      </View>

      <ThemedView type="backgroundElement" style={styles.detailCard}>
        <ThemedText type="smallBold" style={styles.detailTitle}>Profile Summary</ThemedText>
        <View style={styles.detailRow}>
          <ThemedText type="small" themeColor="textSecondary">Goal</ThemedText>
          <ThemedText type="smallBold">
            {data.fitnessGoal ? FITNESS_GOAL_LABELS[data.fitnessGoal] : '—'}
          </ThemedText>
        </View>
        <View style={styles.detailRow}>
          <ThemedText type="small" themeColor="textSecondary">Height</ThemedText>
          <ThemedText type="smallBold">{heightDisplay}</ThemedText>
        </View>
        <View style={styles.detailRow}>
          <ThemedText type="small" themeColor="textSecondary">Activity</ThemedText>
          <ThemedText type="smallBold">
            {data.activityLevel ? ACTIVITY_LEVEL_LABELS[data.activityLevel] : '—'}
          </ThemedText>
        </View>
        <View style={styles.detailRow}>
          <ThemedText type="small" themeColor="textSecondary">Experience</ThemedText>
          <ThemedText type="smallBold">
            {data.experienceLevel ? EXPERIENCE_LEVEL_LABELS[data.experienceLevel] : '—'}
          </ThemedText>
        </View>
        <View style={styles.detailRow}>
          <ThemedText type="small" themeColor="textSecondary">Workouts</ThemedText>
          <ThemedText type="smallBold">{freq}x per week</ThemedText>
        </View>
      </ThemedView>

      {recommendation ? (
        <ThemedView type="backgroundElement" style={styles.recommendation}>
          <ThemedText type="smallBold" style={{ color: theme.accent }}>Your Recommendation</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.recText}>
            {recommendation}
          </ThemedText>
        </ThemedView>
      ) : null}

      <View style={styles.footer}>
        <PrimaryButton label="Start My Journey" onPress={handleComplete} />
      </View>
    </StepLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.two,
    paddingTop: Spacing.three,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  cards: {
    gap: Spacing.three,
  },
  statCard: {
    borderRadius: Spacing.three,
    padding: Spacing.four,
    alignItems: 'center',
    gap: Spacing.one,
  },
  halfCard: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  statLabel: {
    fontSize: 13,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
  },
  detailCard: {
    borderRadius: Spacing.three,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  detailTitle: {
    fontSize: 15,
    marginBottom: Spacing.one,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recommendation: {
    borderRadius: Spacing.three,
    padding: Spacing.four,
    gap: Spacing.one,
  },
  recText: {
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
    marginTop: 'auto',
  },
});