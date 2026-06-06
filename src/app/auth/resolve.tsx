import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PrimaryButton, SecondaryButton } from '@/components/onboarding/onboarding-buttons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/hooks/use-auth';
import { useOnboarding } from '@/hooks/use-onboarding';
import {
  OnboardingData,
  FITNESS_GOAL_LABELS,
  ACTIVITY_LEVEL_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  formatWorkoutLocations,
  calculateBMI,
  getBMICategory,
  calculateDailyCalories,
  kgToLbs,
} from '@/services/onboarding';
import { loadProfileFromCloud, cloudProfileToLocal, syncOnboardingToCloud, mergeCloudToLocal } from '@/services/auth';

function ProfileCard({ title, data, theme }: { title: string; data: OnboardingData; theme: any }) {
  const weightKg = parseFloat(data.weightKg) || 0;
  const heightCm = parseFloat(data.heightCm) || 0;
  const age = parseInt(data.age) || 0;
  const bmi = weightKg && heightCm ? calculateBMI(weightKg, heightCm) : null;

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <ThemedText type="smallBold" style={styles.cardTitle}>{title}</ThemedText>
      <View style={styles.row}>
        <ThemedText type="small" themeColor="textSecondary">Name</ThemedText>
        <ThemedText type="smallBold">{data.username || '—'}</ThemedText>
      </View>
      <View style={styles.row}>
        <ThemedText type="small" themeColor="textSecondary">Goal</ThemedText>
        <ThemedText type="smallBold">{data.fitnessGoal ? FITNESS_GOAL_LABELS[data.fitnessGoal] : '—'}</ThemedText>
      </View>
      <View style={styles.row}>
        <ThemedText type="small" themeColor="textSecondary">Age</ThemedText>
        <ThemedText type="smallBold">{data.age || '—'}</ThemedText>
      </View>
      <View style={styles.row}>
        <ThemedText type="small" themeColor="textSecondary">Gender</ThemedText>
        <ThemedText type="smallBold">{data.gender ? data.gender.charAt(0).toUpperCase() + data.gender.slice(1) : '—'}</ThemedText>
      </View>
      <View style={styles.row}>
        <ThemedText type="small" themeColor="textSecondary">Weight</ThemedText>
        <ThemedText type="smallBold">
          {weightKg ? (data.unitSystem === 'imperial' ? `${kgToLbs(weightKg)} lbs` : `${weightKg} kg`) : '—'}
        </ThemedText>
      </View>
      <View style={styles.row}>
        <ThemedText type="small" themeColor="textSecondary">BMI</ThemedText>
        <ThemedText type="smallBold" style={{ color: bmi ? theme.accent : undefined }}>{bmi ?? '—'}</ThemedText>
      </View>
      <View style={styles.row}>
        <ThemedText type="small" themeColor="textSecondary">Activity</ThemedText>
        <ThemedText type="smallBold">{data.activityLevel ? ACTIVITY_LEVEL_LABELS[data.activityLevel] : '—'}</ThemedText>
      </View>
      <View style={styles.row}>
        <ThemedText type="small" themeColor="textSecondary">Level</ThemedText>
        <ThemedText type="smallBold">{data.experienceLevel ? EXPERIENCE_LEVEL_LABELS[data.experienceLevel] : '—'}</ThemedText>
      </View>
      <View style={styles.row}>
        <ThemedText type="small" themeColor="textSecondary">Location</ThemedText>
        <ThemedText type="smallBold">{formatWorkoutLocations(data.workoutLocations)}</ThemedText>
      </View>
    </ThemedView>
  );
}

export default function ResolveScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { data: localData, refreshData, markSynced } = useOnboarding();
  const [cloudData, setCloudData] = useState<OnboardingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [choosing, setChoosing] = useState(false);

  React.useEffect(() => {
    loadCloudData();
  }, []);

  const loadCloudData = async () => {
    try {
      const profile = await loadProfileFromCloud();
      if (profile) {
        const converted = cloudProfileToLocal(profile);
        setCloudData({ ...localData, ...converted } as OnboardingData);
      }
    } catch {}
    setLoading(false);
  };

  const handleKeepLocal = async () => {
    setChoosing(true);
    try {
      await syncOnboardingToCloud();
      await markSynced();
      Alert.alert('Done', 'Your local data has been synced to the cloud.', [
        { text: 'OK', onPress: () => router.replace('/') },
      ]);
    } catch (e: any) {
      Alert.alert('Sync Failed', e.message ?? 'Could not sync data.');
      setChoosing(false);
    }
  };

  const handleKeepCloud = async () => {
    setChoosing(true);
    try {
      await mergeCloudToLocal();
      await refreshData();
      await markSynced();
      Alert.alert('Done', 'Cloud data has been loaded.', [
        { text: 'OK', onPress: () => router.replace('/') },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not load cloud data.');
      setChoosing(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedText type="subtitle" style={styles.loadingText}>Loading profiles...</ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <ThemedText style={styles.emoji}>🔄</ThemedText>
            <ThemedText type="subtitle" style={styles.title}>We found existing data</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.subtitle}>
              You have data saved locally and in the cloud. Which would you like to keep?
            </ThemedText>
          </View>

          {localData && (
            <ProfileCard title="On This Device" data={localData} theme={theme} />
          )}

          {cloudData && (
            <ProfileCard title="From The Cloud" data={cloudData} theme={theme} />
          )}

          <View style={styles.actions}>
            <PrimaryButton
              label={choosing ? 'Loading...' : 'Keep Cloud Data'}
              onPress={handleKeepCloud}
              disabled={choosing}
            />
            <View style={{ height: Spacing.two }} />
            <SecondaryButton
              label={choosing ? 'Syncing...' : 'Keep Local Data'}
              onPress={handleKeepLocal}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.four,
    paddingTop: Spacing.four,
  },
  emoji: {
    fontSize: 48,
    lineHeight: 60,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: Spacing.three,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: Spacing.six,
  },
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.four,
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  cardTitle: {
    fontSize: 15,
    marginBottom: Spacing.one,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actions: {
    marginTop: Spacing.two,
    gap: Spacing.two,
  },
});