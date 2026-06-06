import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { StepLayout } from '@/components/onboarding/step-layout';
import { OptionCard } from '@/components/onboarding/option-card';
import { PrimaryButton } from '@/components/onboarding/onboarding-buttons';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useOnboarding } from '@/hooks/use-onboarding';
import {
  FitnessGoal,
  FITNESS_GOAL_LABELS,
  FITNESS_GOAL_ICONS,
} from '@/services/onboarding';

const GOALS: FitnessGoal[] = [
  'lose_weight',
  'gain_muscle',
  'stay_fit',
  'improve_endurance',
  'gain_weight',
];

const GOAL_EMOJI: Record<FitnessGoal, string> = {
  lose_weight: '🔥',
  gain_muscle: '💪',
  stay_fit: '❤️',
  improve_endurance: '💨',
  gain_weight: '🍱',
};

export default function GoalScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { data, updateData } = useOnboarding();
  const selected = data.fitnessGoal;

  const handleContinue = () => {
    if (selected) {
      router.push('/onboarding/details');
    }
  };

  return (
    <StepLayout currentStep={1}>
      <View style={styles.header}>
        <ThemedText type="subtitle" style={styles.title}>
          What's your goal?
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.subtitle}>
          Choose the fitness goal that resonates with you most.
        </ThemedText>
      </View>

      <View style={styles.options}>
        {GOALS.map((goal) => (
          <OptionCard
            key={goal}
            label={FITNESS_GOAL_LABELS[goal]}
            icon={<ThemedText style={styles.emoji}>{GOAL_EMOJI[goal]}</ThemedText>}
            selected={selected === goal}
            onPress={() => updateData({ fitnessGoal: goal })}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <PrimaryButton label="Continue" onPress={handleContinue} disabled={!selected} />
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