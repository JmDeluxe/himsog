import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { PrimaryButton, SecondaryButton } from '@/components/onboarding/onboarding-buttons';

export default function WelcomeScreen() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.hero}>
        <View style={[styles.iconCircle, { backgroundColor: theme.accentBg }]}>
          <ThemedText style={{ fontSize: 48 }}>💪</ThemedText>
        </View>
        <ThemedText type="title" style={styles.headline}>
          Your Fitness Journey Starts Today
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.description}>
          Get personalized workouts and nutrition plans tailored to your goals. No account needed — start right now.
        </ThemedText>
      </View>

      <View style={styles.actions}>
        <PrimaryButton label="Continue" onPress={() => router.replace('/onboarding/goal')} />
        <View style={styles.divider}>
          <View style={[styles.line, { backgroundColor: theme.backgroundSelected }]} />
          <ThemedText themeColor="textSecondary" style={styles.orText}>or</ThemedText>
          <View style={[styles.line, { backgroundColor: theme.backgroundSelected }]} />
        </View>
        <SecondaryButton label="Sign In" onPress={() => router.push('/auth/login')} />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.six,
    justifyContent: 'space-between',
    paddingBottom: Spacing.five,
  },
  hero: {
    alignItems: 'center',
    gap: Spacing.four,
    paddingTop: Spacing.five,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headline: {
    textAlign: 'center',
    fontSize: 32,
    lineHeight: 38,
  },
  description: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    paddingHorizontal: Spacing.three,
  },
  actions: {
    gap: Spacing.three,
    paddingBottom: Spacing.three,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  line: {
    flex: 1,
    height: 1,
  },
  orText: {
    fontSize: 13,
  },
});