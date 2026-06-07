import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { EditScreenLayout } from '@/components/edit-screen-layout';
import { FormField } from '@/components/onboarding/onboarding-form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useOnboarding } from '@/hooks/use-onboarding';
import {
  WorkoutLocation,
  WORKOUT_LOCATION_LABELS,
  WORKOUT_LOCATION_DESCRIPTIONS,
  WORKOUT_LOCATION_EMOJI,
  formatWorkoutLocations,
} from '@/services/onboarding';

const LOCATIONS: WorkoutLocation[] = ['gym', 'home', 'outdoors'];

export default function ProfilePreferencesScreen() {
  const theme = useTheme();
  const { data, updateData } = useOnboarding();
  const selected = data.workoutLocations;

  const toggle = (loc: WorkoutLocation) => {
    if (selected.includes(loc)) {
      updateData({ workoutLocations: selected.filter((l) => l !== loc) });
    } else {
      updateData({ workoutLocations: [...selected, loc] });
    }
  };

  return (
    <EditScreenLayout title="Workout Preferences">
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionLabel}>LOCATION</ThemedText>
          <View style={styles.options}>
            {LOCATIONS.map((loc) => {
              const active = selected.includes(loc);
              return (
                <Pressable
                  key={loc}
                  onPress={() => toggle(loc)}
                  style={({ pressed }) => [
                    styles.multiCard,
                    {
                      backgroundColor: active ? theme.accentBg : pressed ? theme.backgroundSelected : theme.backgroundElement,
                      borderColor: active ? theme.accent : theme.backgroundSelected,
                    },
                  ]}>
                  <ThemedText style={styles.emoji}>{WORKOUT_LOCATION_EMOJI[loc]}</ThemedText>
                  <View style={styles.multiText}>
                    <ThemedText
                      type="smallBold"
                      themeColor={active ? 'accent' : 'text'}>
                      {WORKOUT_LOCATION_LABELS[loc]}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary" style={styles.multiDesc}>
                      {WORKOUT_LOCATION_DESCRIPTIONS[loc]}
                    </ThemedText>
                  </View>
                  <View
                    style={[
                      styles.checkbox,
                      {
                        borderColor: active ? theme.accent : theme.backgroundSelected,
                        backgroundColor: active ? theme.accent : 'transparent',
                      },
                    ]}>
                    {active && (
                       <ThemedText style={{ color: theme.background, fontSize: 14, fontWeight: '700', lineHeight: 18, textAlign: 'center', includeFontPadding: false }}>
                         ✓
                       </ThemedText>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
          {selected.length > 0 && (
            <ThemedView type="backgroundElement" style={styles.selectionBadge}>
              <ThemedText type="smallBold" style={{ color: theme.accent }}>
                {formatWorkoutLocations(selected)}
              </ThemedText>
            </ThemedView>
          )}
        </View>

        <View style={styles.section}>
          <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionLabel}>INJURIES</ThemedText>
          <FormField
            label="Injuries or limitations"
            value={data.injuries}
            onChangeText={(v) => updateData({ injuries: v })}
            placeholder="e.g. lower back pain, knee injury..."
          />
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
    gap: Spacing.three,
    paddingTop: Spacing.four,
  },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 1,
  },
  options: {
    gap: Spacing.two,
  },
  multiCard: {
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
  multiText: {
    flex: 1,
    gap: Spacing.one,
  },
  multiDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionBadge: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.five,
    alignSelf: 'center',
  },
});