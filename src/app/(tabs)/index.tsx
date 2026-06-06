import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ProfileSyncBanner } from '@/components/profile-sync-banner';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useOnboarding } from '@/hooks/use-onboarding';
import {
  calculateBMI,
  getBMICategory,
  calculateDailyCalories,
  FITNESS_GOAL_LABELS,
  ACTIVITY_LEVEL_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  kgToLbs,
  cmToImperial,
} from '@/services/onboarding';

export default function HomeScreen() {
  const theme = useTheme();
  const { data } = useOnboarding();
  const [showBanner, setShowBanner] = useState(true);

  const weightKg = parseFloat(data.weightKg) || 0;
  const heightCm = parseFloat(data.heightCm) || 0;
  const age = parseInt(data.age) || 0;
  const targetKg = parseFloat(data.targetWeightKg) || 0;
  const freq = parseInt(data.workoutFrequency) || 3;

  const bmi = weightKg && heightCm ? calculateBMI(weightKg, heightCm) : null;
  const bmiCategory = bmi ? getBMICategory(bmi) : '';
  const calories =
    data.gender && data.fitnessGoal && data.activityLevel
      ? calculateDailyCalories(data.gender, age, weightKg, heightCm, data.activityLevel, data.fitnessGoal)
      : null;

  const weightDisplay = data.unitSystem === 'imperial'
    ? `${kgToLbs(weightKg)} lbs`
    : `${weightKg} kg`;
  const targetDisplay = data.unitSystem === 'imperial'
    ? `${kgToLbs(targetKg)} lbs`
    : `${targetKg} kg`;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.greeting}>Hi there</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            {data.fitnessGoal ? FITNESS_GOAL_LABELS[data.fitnessGoal] : 'Let\'s get started'}
          </ThemedText>
        </View>

        {showBanner && (
          <ProfileSyncBanner
            onSignIn={() => {}}
            onDismiss={() => setShowBanner(false)}
          />
        )}

        <View style={styles.statsGrid}>
          <ThemedView type="backgroundElement" style={styles.statCard}>
            <ThemedText themeColor="textSecondary" style={styles.statLabel}>BMI</ThemedText>
            <ThemedText style={[styles.statValue, { color: theme.accent }]}>
              {bmi ?? '—'}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">{bmiCategory}</ThemedText>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.statCard}>
            <ThemedText themeColor="textSecondary" style={styles.statLabel}>Calories</ThemedText>
            <ThemedText style={[styles.statValue, { color: theme.accent }]}>
              {calories ?? '—'}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">kcal/day</ThemedText>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.statCard}>
            <ThemedText themeColor="textSecondary" style={styles.statLabel}>Current</ThemedText>
            <ThemedText style={[styles.statValue, { color: theme.accent }]}>
              {weightDisplay}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">weight</ThemedText>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.statCard}>
            <ThemedText themeColor="textSecondary" style={styles.statLabel}>Target</ThemedText>
            <ThemedText style={[styles.statValue, { color: theme.accent }]}>
              {targetDisplay}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">goal weight</ThemedText>
          </ThemedView>
        </View>

        <ThemedView type="backgroundElement" style={styles.profileCard}>
          <ThemedText type="smallBold" style={styles.cardTitle}>Your Profile</ThemedText>
          <View style={styles.profileRow}>
            <ThemedText type="small" themeColor="textSecondary">Goal</ThemedText>
            <ThemedText type="smallBold">
              {data.fitnessGoal ? FITNESS_GOAL_LABELS[data.fitnessGoal] : '—'}
            </ThemedText>
          </View>
          <View style={styles.profileRow}>
            <ThemedText type="small" themeColor="textSecondary">Activity</ThemedText>
            <ThemedText type="smallBold">
              {data.activityLevel ? ACTIVITY_LEVEL_LABELS[data.activityLevel] : '—'}
            </ThemedText>
          </View>
          <View style={styles.profileRow}>
            <ThemedText type="small" themeColor="textSecondary">Level</ThemedText>
            <ThemedText type="smallBold">
              {data.experienceLevel ? EXPERIENCE_LEVEL_LABELS[data.experienceLevel] : '—'}
            </ThemedText>
          </View>
          <View style={styles.profileRow}>
            <ThemedText type="small" themeColor="textSecondary">Workouts</ThemedText>
            <ThemedText type="smallBold">{freq}x / week</ThemedText>
          </View>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  header: {
    gap: Spacing.one,
    paddingTop: Spacing.three,
  },
  greeting: {
    fontSize: 32,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: Spacing.three,
    padding: Spacing.four,
    alignItems: 'center',
    gap: Spacing.one,
  },
  statLabel: {
    fontSize: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileCard: {
    borderRadius: Spacing.three,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  cardTitle: {
    fontSize: 15,
    marginBottom: Spacing.one,
  },
});