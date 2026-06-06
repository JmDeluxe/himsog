import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { EditScreenLayout } from '@/components/edit-screen-layout';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useOnboarding } from '@/hooks/use-onboarding';
import {
  FitnessGoal,
  FITNESS_GOAL_LABELS,
} from '@/services/onboarding';

const GOALS: FitnessGoal[] = ['lose_weight', 'gain_muscle', 'stay_fit', 'improve_endurance', 'gain_weight'];

const GOAL_EMOJI: Record<FitnessGoal, string> = {
  lose_weight: '🔥',
  gain_muscle: '💪',
  stay_fit: '❤️',
  improve_endurance: '💨',
  gain_weight: '🍱',
};

export default function ProfileGoalScreen() {
  const theme = useTheme();
  const { data, updateData } = useOnboarding();

  return (
    <EditScreenLayout title="Fitness Goal">
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.options}>
          {GOALS.map((goal) => {
            const active = data.fitnessGoal === goal;
            return (
              <Pressable
                key={goal}
                onPress={() => updateData({ fitnessGoal: goal })}
                style={({ pressed }) => [
                  styles.optionCard,
                  {
                    backgroundColor: active ? theme.accentBg : pressed ? theme.backgroundSelected : theme.backgroundElement,
                    borderColor: active ? theme.accent : theme.backgroundSelected,
                  },
                ]}>
                <ThemedText style={styles.emoji}>{GOAL_EMOJI[goal]}</ThemedText>
                <ThemedText
                  type="smallBold"
                  style={{ color: active ? theme.accent : theme.text, fontSize: 15 }}>
                  {FITNESS_GOAL_LABELS[goal]}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </EditScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  options: {
    gap: Spacing.two,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.three,
    borderWidth: 1.5,
    gap: Spacing.three,
  },
  emoji: {
    fontSize: 24,
  },
});