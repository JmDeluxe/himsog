import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import { ProfileSyncBanner } from "@/components/profile-sync-banner";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useOnboarding } from "@/hooks/use-onboarding";
import { useTheme } from "@/hooks/use-theme";
import { getProfile } from "@/services/auth";
import {
  ACTIVITY_LEVEL_LABELS,
  calculateBMI,
  calculateDailyCalories,
  cmToImperial,
  EXPERIENCE_LEVEL_LABELS,
  FITNESS_GOAL_LABELS,
  getBMICategory,
  kgToLbs,
  WORKOUT_LOCATION_LABELS,
  formatWorkoutLocations,
} from "@/services/onboarding";

export default function DashboardScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data, resetOnboarding, refreshData } = useOnboarding();
  const { user, signOut } = useAuth();
  const [showBanner, setShowBanner] = useState(true);
  const [username, setUsername] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      refreshData();
      if (user) {
        getProfile().then((p) => {
          if (p?.username) setUsername(p.username);
        });
      }
    }, [user])
  );

  const weightKg = parseFloat(data.weightKg) || 0;
  const heightCm = parseFloat(data.heightCm) || 0;
  const age = parseInt(data.age) || 0;
  const targetKg = parseFloat(data.targetWeightKg) || 0;
  const freq = parseInt(data.workoutFrequency) || 3;

  const bmi = weightKg && heightCm ? calculateBMI(weightKg, heightCm) : null;
  const bmiCategory = bmi ? getBMICategory(bmi) : "";
  const calories =
    data.gender && data.fitnessGoal && data.activityLevel
      ? calculateDailyCalories(
          data.gender,
          age,
          weightKg,
          heightCm,
          data.activityLevel,
          data.fitnessGoal,
        )
      : null;

  const weightDisplay =
    data.unitSystem === "imperial"
      ? `${kgToLbs(weightKg)} lbs`
      : `${weightKg} kg`;
  const targetDisplay =
    data.unitSystem === "imperial"
      ? `${kgToLbs(targetKg)} lbs`
      : `${targetKg} kg`;

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: signOut },
    ]);
  };

  const handleReset = () => {
    Alert.alert("Reset Onboarding", "This will clear all your data and restart onboarding. Continue?", [
      { text: "Cancel", style: "cancel" },
      { text: "Reset", style: "destructive", onPress: async () => {
        await resetOnboarding();
        router.replace("/onboarding/welcome");
      }},
    ]);
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <ThemedText type="title" style={styles.greeting}>
                {user ? (username ? `Hi, ${username}` : 'Hi there') : (data.username ? `Hi, ${data.username}` : 'Hi there')}
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.subtitle}>
                {data.fitnessGoal
                  ? FITNESS_GOAL_LABELS[data.fitnessGoal]
                  : "Let's get started"}
              </ThemedText>
            </View>
            {user && (
              <Pressable onPress={handleSignOut} style={styles.signOutButton}>
                <ThemedText
                  type="small"
                  themeColor="textSecondary"
                  style={styles.signOutText}
                >
                  Sign Out
                </ThemedText>
              </Pressable>
            )}
          </View>
          {user && (
            <View
              style={[styles.syncBadge, { backgroundColor: theme.accentBg }]}
            >
              <ThemedText
                type="small"
                style={{ color: theme.accent, fontSize: 12 }}
              >
                ☁️ Synced as {user.email}
              </ThemedText>
            </View>
          )}
        </View>

        {!user && showBanner && (
          <ProfileSyncBanner onDismiss={() => setShowBanner(false)} />
        )}

        <View style={styles.statsGrid}>
          <ThemedView type="backgroundElement" style={styles.statCard}>
            <ThemedText themeColor="textSecondary" style={styles.statLabel}>
              BMI
            </ThemedText>
            <ThemedText style={[styles.statValue, { color: theme.accent }]}>
              {bmi ?? "—"}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {bmiCategory}
            </ThemedText>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.statCard}>
            <ThemedText themeColor="textSecondary" style={styles.statLabel}>
              Calories
            </ThemedText>
            <ThemedText style={[styles.statValue, { color: theme.accent }]}>
              {calories ?? "—"}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              kcal/day
            </ThemedText>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.statCard}>
            <ThemedText themeColor="textSecondary" style={styles.statLabel}>
              Current
            </ThemedText>
            <ThemedText style={[styles.statValue, { color: theme.accent }]}>
              {weightDisplay}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              weight
            </ThemedText>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.statCard}>
            <ThemedText themeColor="textSecondary" style={styles.statLabel}>
              Target
            </ThemedText>
            <ThemedText style={[styles.statValue, { color: theme.accent }]}>
              {targetDisplay}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              goal weight
            </ThemedText>
          </ThemedView>
        </View>

        <ThemedView type="backgroundElement" style={styles.profileCard}>
          <ThemedText type="smallBold" style={styles.cardTitle}>
            Your Profile
          </ThemedText>
          <View style={styles.profileRow}>
            <ThemedText type="small" themeColor="textSecondary">
              Goal
            </ThemedText>
            <ThemedText type="smallBold">
              {data.fitnessGoal ? FITNESS_GOAL_LABELS[data.fitnessGoal] : "—"}
            </ThemedText>
          </View>
          <View style={styles.profileRow}>
            <ThemedText type="small" themeColor="textSecondary">
              Activity
            </ThemedText>
            <ThemedText type="smallBold">
              {data.activityLevel
                ? ACTIVITY_LEVEL_LABELS[data.activityLevel]
                : "—"}
            </ThemedText>
          </View>
          <View style={styles.profileRow}>
            <ThemedText type="small" themeColor="textSecondary">
              Level
            </ThemedText>
            <ThemedText type="smallBold">
              {data.experienceLevel
                ? EXPERIENCE_LEVEL_LABELS[data.experienceLevel]
                : "—"}
            </ThemedText>
          </View>
          <View style={styles.profileRow}>
            <ThemedText type="small" themeColor="textSecondary">
              Workouts
            </ThemedText>
            <ThemedText type="smallBold">{freq}x / week</ThemedText>
          </View>
          <View style={styles.profileRow}>
            <ThemedText type="small" themeColor="textSecondary">
              Location
            </ThemedText>
            <ThemedText type="smallBold">
              {formatWorkoutLocations(data.workoutLocations)}
            </ThemedText>
          </View>
          {data.injuries && data.injuries.trim() ? (
            <View style={styles.profileRow}>
              <ThemedText type="small" themeColor="textSecondary">
                Injuries
              </ThemedText>
              <ThemedText type="smallBold" style={styles.injuryText}>
                {data.injuries}
              </ThemedText>
            </View>
          ) : null}
        </ThemedView>

        <Pressable onPress={handleReset} style={styles.resetButton}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.resetText}>
            Reset Onboarding
          </ThemedText>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    flexDirection: "row",
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  header: {
    gap: Spacing.two,
    paddingTop: Spacing.three,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  greeting: {
    fontSize: 32,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  signOutButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  signOutText: {
    fontSize: 13,
  },
  syncBadge: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.two,
    alignSelf: "flex-start",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.three,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    borderRadius: Spacing.three,
    padding: Spacing.four,
    alignItems: "center",
    gap: Spacing.one,
  },
  statLabel: {
    fontSize: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 34,
  },
  profileRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  injuryText: {
    flex: 1,
    textAlign: 'right',
  },
  resetButton: {
    paddingVertical: Spacing.two,
    alignItems: 'center',
  },
  resetText: {
    fontSize: 12,
  },
});
