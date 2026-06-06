import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { StepLayout } from '@/components/onboarding/step-layout';
import { OptionCard } from '@/components/onboarding/option-card';
import { PrimaryButton, SecondaryButton } from '@/components/onboarding/onboarding-buttons';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useOnboarding } from '@/hooks/use-onboarding';
import { ActivityLevel, ACTIVITY_LEVEL_LABELS, ACTIVITY_LEVEL_DESCRIPTIONS } from '@/services/onboarding';

const LEVELS: ActivityLevel[] = [
  'sedentary',
  'lightly_active',
  'moderately_active',
  'very_active',
  'athlete',
];

const LEVEL_EMOJI: Record<ActivityLevel, string> = {
  sedentary: '🪑',
  lightly_active: '🚶',
  moderately_active: '🏃',
  very_active: '🏋️',
  athlete: '🏆',
};

export default function ActivityScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { data, updateData } = useOnboarding();
  const selected = data.activityLevel;

  return (
    <StepLayout currentStep={3}>
      <View style={styles.header}>
        <ThemedText type="subtitle" style={styles.title}>
          How active are you?
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.subtitle}>
          This helps us estimate your daily calorie needs.
        </ThemedText>
      </View>

      <View style={styles.options}>
        {LEVELS.map((level) => (
          <OptionCard
            key={level}
            label={ACTIVITY_LEVEL_LABELS[level]}
            description={ACTIVITY_LEVEL_DESCRIPTIONS[level]}
            icon={<ThemedText style={styles.emoji}>{LEVEL_EMOJI[level]}</ThemedText>}
            selected={selected === level}
            onPress={() => updateData({ activityLevel: level })}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label="Continue"
          onPress={() => selected && router.push('/onboarding/experience')}
          disabled={!selected}
        />
        <View style={{ height: Spacing.two }} />
        <SecondaryButton label="Back" onPress={() => router.back()} />
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
  options: {
    gap: Spacing.two,
  },
  emoji: {
    fontSize: 24,
  },
  footer: {
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
    marginTop: 'auto',
  },
});