import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { EditScreenLayout } from '@/components/edit-screen-layout';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useOnboarding } from '@/hooks/use-onboarding';
import { ExperienceLevel, EXPERIENCE_LEVEL_LABELS, EXPERIENCE_LEVEL_DESCRIPTIONS } from '@/services/onboarding';

const LEVELS: ExperienceLevel[] = ['beginner', 'intermediate', 'advanced'];

const LEVEL_EMOJI: Record<ExperienceLevel, string> = {
  beginner: '🌱',
  intermediate: '📈',
  advanced: '⚡',
};

export default function ProfileExperienceScreen() {
  const theme = useTheme();
  const { data, updateData } = useOnboarding();
  const selected = data.experienceLevel;

  return (
    <EditScreenLayout title="Experience Level">
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.options}>
          {LEVELS.map((level) => {
            const active = selected === level;
            return (
              <Pressable
                key={level}
                onPress={() => updateData({ experienceLevel: level })}
                style={({ pressed }) => [
                  styles.optionCard,
                  {
                    backgroundColor: active ? theme.accentBg : pressed ? theme.backgroundSelected : theme.backgroundElement,
                    borderColor: active ? theme.accent : theme.backgroundSelected,
                  },
                ]}>
                <ThemedText style={styles.emoji}>{LEVEL_EMOJI[level]}</ThemedText>
                <View style={styles.optionText}>
                  <ThemedText
                    type="smallBold"
                    style={{ color: active ? theme.accent : theme.text, fontSize: 15 }}>
                    {EXPERIENCE_LEVEL_LABELS[level]}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary" style={styles.optionDesc}>
                    {EXPERIENCE_LEVEL_DESCRIPTIONS[level]}
                  </ThemedText>
                </View>
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
  optionText: {
    flex: 1,
    gap: Spacing.one,
  },
  optionDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
});