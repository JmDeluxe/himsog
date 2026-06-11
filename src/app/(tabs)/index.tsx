import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProfileSyncBanner } from "@/components/profile-sync-banner";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { MaxContentWidth, Spacing } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useFoodLog } from "@/hooks/use-food-log";
import { useOnboarding } from "@/hooks/use-onboarding";
import { useTheme } from "@/hooks/use-theme";
import { useToast } from "@/hooks/use-toast";
import {
  ACTIVITY_LEVEL_LABELS,
  calculateBMI,
  calculateDailyCalories,
  calculateProteinTarget,
  EXPERIENCE_LEVEL_LABELS,
  FITNESS_GOAL_LABELS,
  formatWorkoutLocations,
  getBMICategory,
  kgToLbs,
} from "@/services/onboarding";

export default function DashboardScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data, resetOnboarding, refreshData } = useOnboarding();
  const { user, signOut } = useAuth();
  const { today, addEntry } = useFoodLog();
  const toast = useToast();
  const [showBanner, setShowBanner] = useState(true);
  const [showAddFood, setShowAddFood] = useState(false);
  const [foodName, setFoodName] = useState("");
  const [foodCal, setFoodCal] = useState("");
  const [foodProtein, setFoodProtein] = useState("");

  useFocusEffect(
    React.useCallback(() => {
      refreshData();
    }, []),
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
    Alert.alert(
      "Reset Onboarding",
      "This will clear all your data, sign you out, and restart onboarding. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            if (user) await signOut();
            await resetOnboarding();
            router.replace("/onboarding/welcome");
          },
        },
      ],
    );
  };

  const handleAddFood = async () => {
    const cal = parseFloat(foodCal) || 0;
    if (!foodName.trim() || cal <= 0) {
      toast.show({ message: "Enter food name and calories", type: "error" });
      return;
    }
    await addEntry({
      name: foodName.trim(),
      calories: cal,
      protein: parseFloat(foodProtein) || 0,
      carbs: 0,
      fat: 0,
      servingSize: "1 serving",
      source: "manual",
    });
    toast.show({ message: `Logged ${Math.round(cal)} kcal`, type: "success" });
    setFoodName("");
    setFoodCal("");
    setFoodProtein("");
    setShowAddFood(false);
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View>
                <ThemedText type="title" style={styles.greeting}>
                  {data.username ? `Hi, ${data.username}` : "Hi there"}
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

          {calories && (
            <ThemedView type="backgroundElement" style={styles.calorieCard}>
              <View style={styles.calorieHeader}>
                <ThemedText type="smallBold" style={styles.cardTitle}>
                  Today's Calories
                </ThemedText>
                <View style={styles.calorieActions}>
                  <Pressable
                    onPress={() => setShowAddFood(!showAddFood)}
                    style={[
                      styles.addButton,
                      { backgroundColor: theme.accent },
                    ]}
                  >
                    <ThemedText
                      type="smallBold"
                      style={{ color: theme.background, fontSize: 13 }}
                    >
                      {showAddFood ? "✕" : "+"}
                    </ThemedText>
                  </Pressable>
                  <Pressable onPress={() => router.push("/food-log")}>
                    <ThemedText
                      type="small"
                      themeColor="accent"
                      style={{ fontSize: 13 }}
                    >
                      View Log
                    </ThemedText>
                  </Pressable>
                </View>
              </View>
              <View style={styles.calorieRow}>
                <View style={styles.calorieItem}>
                  <ThemedText
                    style={[styles.calorieValue, { color: theme.accent }]}
                  >
                    {calories}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    target
                  </ThemedText>
                </View>
                <View style={styles.calorieItem}>
                  <ThemedText
                    style={[styles.calorieValue, { color: theme.error }]}
                  >
                    {Math.round(today.consumed)}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    eaten
                  </ThemedText>
                </View>
                <View style={styles.calorieItem}>
                  <ThemedText
                    style={[styles.calorieValue, { color: theme.success }]}
                  >
                    {Math.max(0, Math.round(calories - today.consumed))}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    left
                  </ThemedText>
                </View>
              </View>

              {showAddFood && (
                <View style={styles.addFoodForm}>
                  <TextInput
                    style={[
                      styles.addFoodInput,
                      {
                        backgroundColor: theme.background,
                        color: theme.text,
                        borderColor: theme.backgroundSelected,
                      },
                    ]}
                    placeholder="Food name"
                    placeholderTextColor={theme.textSecondary}
                    value={foodName}
                    onChangeText={setFoodName}
                  />
                  <View style={styles.addFoodRow}>
                    <TextInput
                      style={[
                        styles.addFoodInputSmall,
                        {
                          backgroundColor: theme.background,
                          color: theme.text,
                          borderColor: theme.backgroundSelected,
                        },
                      ]}
                      placeholder="Calories"
                      placeholderTextColor={theme.textSecondary}
                      value={foodCal}
                      onChangeText={setFoodCal}
                      keyboardType="number-pad"
                    />
                    <TextInput
                      style={[
                        styles.addFoodInputSmall,
                        {
                          backgroundColor: theme.background,
                          color: theme.text,
                          borderColor: theme.backgroundSelected,
                        },
                      ]}
                      placeholder="Protein (g)"
                      placeholderTextColor={theme.textSecondary}
                      value={foodProtein}
                      onChangeText={setFoodProtein}
                      keyboardType="number-pad"
                    />
                  </View>
                  <Pressable
                    onPress={handleAddFood}
                    style={[
                      styles.addFoodSave,
                      { backgroundColor: theme.accent },
                    ]}
                  >
                    <ThemedText
                      type="smallBold"
                      style={{ color: theme.background, fontSize: 14 }}
                    >
                      Add
                    </ThemedText>
                  </Pressable>
                </View>
              )}

              {today.entries.length > 0 && (
                <View
                  style={[
                    styles.recentEntries,
                    { borderTopColor: theme.backgroundSelected },
                  ]}
                >
                  {today.entries
                    .slice(-3)
                    .reverse()
                    .map((entry) => (
                      <View key={entry.id} style={styles.recentEntryRow}>
                        <ThemedText
                          type="small"
                          style={{ flex: 1 }}
                          numberOfLines={1}
                        >
                          {entry.name}
                        </ThemedText>
                        <ThemedText
                          type="smallBold"
                          style={{ color: theme.accent }}
                        >
                          {Math.round(entry.calories)} kcal
                        </ThemedText>
                      </View>
                    ))}
                </View>
              )}
            </ThemedView>
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
                Protein
              </ThemedText>
              <ThemedText style={[styles.statValue, { color: theme.success }]}>
                {Math.round(today.protein)}/
                {data.fitnessGoal
                  ? calculateProteinTarget(weightKg, data.fitnessGoal)
                  : "—"}
                g
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                today
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
            <ThemedText
              type="small"
              themeColor="textSecondary"
              style={styles.resetText}
            >
              Reset Onboarding
            </ThemedText>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
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
  calorieCard: {
    borderRadius: Spacing.three,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  calorieHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  calorieActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  addButton: {
    width: 24,
    height: 24,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  calorieRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  calorieItem: {
    alignItems: "center",
    gap: Spacing.one,
  },
  calorieValue: {
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 30,
  },
  addFoodForm: {
    gap: Spacing.two,
    paddingTop: Spacing.two,
  },
  addFoodInput: {
    borderWidth: 1.5,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 15,
    minHeight: 44,
  },
  addFoodRow: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  addFoodInputSmall: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 15,
    minHeight: 44,
  },
  addFoodSave: {
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: "center",
    justifyContent: "center",
  },
  recentEntries: {
    gap: Spacing.one,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
  },
  recentEntryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 15,
    marginBottom: Spacing.one,
  },
  injuryText: {
    flex: 1,
    textAlign: "right",
  },
  resetButton: {
    paddingVertical: Spacing.two,
    alignItems: "center",
  },
  resetText: {
    fontSize: 12,
  },
});
