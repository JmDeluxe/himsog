import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { StepLayout } from '@/components/onboarding/step-layout';
import { PrimaryButton, SecondaryButton } from '@/components/onboarding/onboarding-buttons';
import { FormField, WeightInput } from '@/components/onboarding/onboarding-form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useOnboarding } from '@/hooks/use-onboarding';
import { Pressable } from 'react-native';

const WEEKLY_PACES = ['0.25', '0.5', '0.75', '1.0'];
const FREQUENCIES = ['2', '3', '4', '5', '6'];

export default function TargetScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { data, updateData } = useOnboarding();

  const isValid =
    data.targetWeightKg && parseFloat(data.targetWeightKg) > 0;

  return (
    <StepLayout currentStep={5}>
      <View style={styles.header}>
        <ThemedText type="subtitle" style={styles.title}>
          Set your targets
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.subtitle}>
          Define where you want to be and how fast.
        </ThemedText>
      </View>

      <WeightInput
        unitSystem={data.unitSystem}
        valueKg={data.targetWeightKg}
        onChangeKg={(v) => updateData({ targetWeightKg: v })}
        label="Target Weight"
      />

      <View style={styles.section}>
        <ThemedText type="smallBold" style={{ fontSize: 13 }}>Weekly Pace</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.sectionHint}>
          How much weight do you want to change per week?
        </ThemedText>
        <View style={styles.pillRow}>
          {WEEKLY_PACES.map((pace) => {
            const active = data.weeklyGoalKg === pace;
            return (
              <Pressable
                key={pace}
                onPress={() => updateData({ weeklyGoalKg: pace })}
                style={[
                  styles.pill,
                  {
                    backgroundColor: active ? theme.accentBg : theme.backgroundElement,
                    borderColor: active ? theme.accent : theme.backgroundSelected,
                  },
                ]}>
                <ThemedText
                  type="smallBold"
                  style={{ color: active ? theme.accent : theme.text, fontSize: 13 }}>
                  {pace} kg/wk
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="smallBold" style={{ fontSize: 13 }}>Workout Frequency</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.sectionHint}>
          How many days per week can you train?
        </ThemedText>
        <View style={styles.pillRow}>
          {FREQUENCIES.map((freq) => {
            const active = data.workoutFrequency === freq;
            return (
              <Pressable
                key={freq}
                onPress={() => updateData({ workoutFrequency: freq })}
                style={[
                  styles.pill,
                  {
                    backgroundColor: active ? theme.accentBg : theme.backgroundElement,
                    borderColor: active ? theme.accent : theme.backgroundSelected,
                  },
                ]}>
                <ThemedText
                  type="smallBold"
                  style={{ color: active ? theme.accent : theme.text, fontSize: 13 }}>
                  {freq}x/week
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label="See My Plan"
          onPress={() => isValid && router.push('/onboarding/summary')}
          disabled={!isValid}
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
    gap: Spacing.one,
  },
  sectionHint: {
    fontSize: 13,
    lineHeight: 18,
  },
  pillRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
  pill: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.five,
    borderWidth: 1.5,
  },
  footer: {
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
    marginTop: 'auto',
  },
});