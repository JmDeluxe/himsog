import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, BottomTabInset, MaxContentWidth } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useAuth } from '@/hooks/use-auth';
import { isAuthAvailable } from '@/services/auth';
import {
  FITNESS_GOAL_LABELS,
  ACTIVITY_LEVEL_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  WORKOUT_LOCATION_LABELS,
  formatWorkoutLocations,
} from '@/services/onboarding';

interface ProfileMenuItemProps {
  title: string;
  value: string;
  emoji: string;
  onPress: () => void;
  theme: ReturnType<typeof useTheme>;
}

function ProfileMenuItem({ title, value, emoji, onPress, theme }: ProfileMenuItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        {
          backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement,
        },
      ]}>
      <View style={styles.menuLeft}>
        <ThemedText style={styles.menuEmoji}>{emoji}</ThemedText>
        <View style={styles.menuText}>
          <ThemedText type="smallBold">{title}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.menuValue} numberOfLines={1}>
            {value}
          </ThemedText>
        </View>
      </View>
      <ThemedText themeColor="textSecondary" style={styles.chevron}>›</ThemedText>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data } = useOnboarding();
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure? Your local data will be kept.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <ThemedText type="title" style={styles.username}>
              {data.username || 'Guest'}
            </ThemedText>
            {user && (
              <View style={[styles.syncBadge, { backgroundColor: theme.accentBg }]}>
                <ThemedText type="small" style={{ color: theme.accent, fontSize: 12 }}>
                  ☁️ Synced as {user.email}
                </ThemedText>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionLabel}>
              FITNESS PROFILE
            </ThemedText>
            <ThemedView type="backgroundElement" style={styles.menuGroup}>
              <ProfileMenuItem
                title="Goal"
                value={data.fitnessGoal ? FITNESS_GOAL_LABELS[data.fitnessGoal] : 'Not set'}
                emoji="🎯"
                onPress={() => router.push('/profile/goal')}
                theme={theme}
              />
              <ProfileMenuItem
                title="Activity Level"
                value={data.activityLevel ? ACTIVITY_LEVEL_LABELS[data.activityLevel] : 'Not set'}
                emoji="🏃"
                onPress={() => router.push('/profile/activity')}
                theme={theme}
              />
              <ProfileMenuItem
                title="Experience"
                value={data.experienceLevel ? EXPERIENCE_LEVEL_LABELS[data.experienceLevel] : 'Not set'}
                emoji="⚡"
                onPress={() => router.push('/profile/experience')}
                theme={theme}
              />
              <ProfileMenuItem
                title="Workout Location"
                value={formatWorkoutLocations(data.workoutLocations)}
                emoji="📍"
                onPress={() => router.push('/profile/preferences')}
                theme={theme}
              />
            </ThemedView>
          </View>

          <View style={styles.section}>
            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionLabel}>
              PERSONAL INFO
            </ThemedText>
            <ThemedView type="backgroundElement" style={styles.menuGroup}>
              <ProfileMenuItem
                title="Details"
                value={`${data.username || '—'} · ${data.age || '—'} yrs · ${data.gender || '—'}`}
                emoji="👤"
                onPress={() => router.push('/profile/details')}
                theme={theme}
              />
              <ProfileMenuItem
                title="Targets"
                value={`${data.targetWeightKg || '—'} kg · ${data.workoutFrequency || '—'}x/wk`}
                emoji="🏁"
                onPress={() => router.push('/profile/target')}
                theme={theme}
              />
            </ThemedView>
          </View>

          <View style={styles.section}>
            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionLabel}>
              ACCOUNT
            </ThemedText>
            <ThemedView type="backgroundElement" style={styles.menuGroup}>
              {user ? (
                <ProfileMenuItem
                  title="Sign Out"
                  value={user.email}
                  emoji="🚪"
                  onPress={handleSignOut}
                  theme={theme}
                />
              ) : (
                <ProfileMenuItem
                  title="Sign In"
                  value="Sync your progress to the cloud"
                  emoji="☁️"
                  onPress={() => router.push('/auth/login')}
                  theme={theme}
                />
              )}
            </ThemedView>
          </View>

          <View style={styles.section}>
            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionLabel}>
              PREFERENCES
            </ThemedText>
            <ThemedView type="backgroundElement" style={styles.menuGroup}>
              <ProfileMenuItem
                title="Settings"
                value="Units, notifications, & more"
                emoji="⚙️"
                onPress={() => router.push('/settings')}
                theme={theme}
              />
            </ThemedView>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.five,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  username: {
    fontSize: 28,
    lineHeight: 34,
  },
  syncBadge: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.two,
  },
  section: {
    gap: Spacing.two,
  },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 1,
  },
  menuGroup: {
    borderRadius: Spacing.three,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    flex: 1,
  },
  menuEmoji: {
    fontSize: 24,
  },
  menuText: {
    flex: 1,
    gap: Spacing.one,
  },
  menuValue: {
    fontSize: 12,
  },
  chevron: {
    fontSize: 24,
    fontWeight: '300',
  },
});