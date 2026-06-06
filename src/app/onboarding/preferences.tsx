import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { StepLayout } from '@/components/onboarding/step-layout';
import { OptionCard } from '@/components/onboarding/option-card';
import { PrimaryButton, SecondaryButton } from '@/components/onboarding/onboarding-buttons';
import { FormField } from '@/components/onboarding/onboarding-form';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useOnboarding } from '@/hooks/use-onboarding';
import {
  WorkoutLocation,
  WORKOUT_LOCATION_LABELS,
  WORKOUT_LOCATION_DESCRIPTIONS,
  WORKOUT_LOCATION_EMOJI,
} from '@/services/onboarding';

const LOCATIONS: WorkoutLocation[] = ['gym', 'home', 'outdoors', 'mixed'];

export default function PreferencesScreen() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const selected = data.workoutLocation;

  return (
    <StepLayout currentStep={5}>
      <View style={styles.header}>
        <ThemedText type="subtitle" style={styles.title}>
          Workout preferences
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.subtitle}>
          Where do you prefer to train? Any injuries we should know about?
        </ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText type="smallBold" style={styles.sectionTitle}>Workout Location</ThemedText>
        <View style={styles.options}>
          {LOCATIONS.map((loc) => (
            <OptionCard
              key={loc}
              label={WORKOUT_LOCATION_LABELS[loc]}
              description={WORKOUT_LOCATION_DESCRIPTIONS[loc]}
              icon={<ThemedText style={styles.emoji}>{WORKOUT_LOCATION_EMOJI[loc]}</ThemedText>}
              selected={selected === loc}
              onPress={() => updateData({ workoutLocation: loc })}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <FormField
          label="Injuries or limitations (optional)"
          value={data.injuries}
          onChangeText={(v) => updateData({ injuries: v })}
          placeholder="e.g. lower back pain, knee injury..."
        />
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label="Continue"
          onPress={() => router.push('/onboarding/target')}
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
  section: {
    gap: Spacing.two,
  },
  sectionTitle: {
    fontSize: 13,
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