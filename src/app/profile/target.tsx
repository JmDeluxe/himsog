import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { EditScreenLayout } from '@/components/edit-screen-layout';
import { FormField, WeightInput } from '@/components/onboarding/onboarding-form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useOnboarding } from '@/hooks/use-onboarding';

const WEEKLY_PACES = ['0.25', '0.5', '0.75', '1.0'];
const FREQUENCIES = ['2', '3', '4', '5', '6'];

export default function ProfileTargetScreen() {
  const theme = useTheme();
  const { data, updateData } = useOnboarding();

  return (
    <EditScreenLayout title="Targets">
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionLabel}>WEIGHT TARGET</ThemedText>
          <WeightInput
            unitSystem={data.unitSystem}
            valueKg={data.targetWeightKg}
            onChangeKg={(v) => updateData({ targetWeightKg: v })}
            label="Target Weight"
          />
        </View>

        <View style={styles.section}>
          <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionLabel}>WEEKLY PACE</ThemedText>
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
          <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionLabel}>FREQUENCY</ThemedText>
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
      </ScrollView>
    </EditScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    paddingBottom: Spacing.five,
  },
  section: {
    gap: Spacing.two,
    paddingTop: Spacing.four,
  },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 1,
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
});