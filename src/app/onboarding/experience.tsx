import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { StepLayout } from '@/components/onboarding/step-layout';
import { OptionCard } from '@/components/onboarding/option-card';
import { PrimaryButton, SecondaryButton } from '@/components/onboarding/onboarding-buttons';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useOnboarding } from '@/hooks/use-onboarding';
import { ExperienceLevel, EXPERIENCE_LEVEL_LABELS, EXPERIENCE_LEVEL_DESCRIPTIONS } from '@/services/onboarding';

const LEVELS: ExperienceLevel[] = ['beginner', 'intermediate', 'advanced'];

const LEVEL_EMOJI: Record<ExperienceLevel, string> = {
  beginner: '🌱',
  intermediate: '📈',
  advanced: '⚡',
};

export default function ExperienceScreen() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const selected = data.experienceLevel;

  return (
    <StepLayout currentStep={4}>
      <View style={styles.header}>
        <ThemedText type="subtitle" style={styles.title}>
          Your fitness experience
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.subtitle}>
          We'll tailor the intensity to your level.
        </ThemedText>
      </View>

      <View style={styles.options}>
        {LEVELS.map((level) => (
          <OptionCard
            key={level}
            label={EXPERIENCE_LEVEL_LABELS[level]}
            description={EXPERIENCE_LEVEL_DESCRIPTIONS[level]}
            icon={<ThemedText style={styles.emoji}>{LEVEL_EMOJI[level]}</ThemedText>}
            selected={selected === level}
            onPress={() => updateData({ experienceLevel: level })}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label="Continue"
          onPress={() => selected && router.push('/onboarding/preferences')}
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